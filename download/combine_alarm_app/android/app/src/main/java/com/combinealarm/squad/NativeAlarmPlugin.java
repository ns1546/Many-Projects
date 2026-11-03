package com.combinealarm.squad;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

@CapacitorPlugin(name = "NativeAlarm")
public class NativeAlarmPlugin extends Plugin {
    private static final String TAG = "NativeAlarmPlugin";
    private static final String PREF_NAME = "EvoAlarmsPref";
    private static final String KEY_ACTIVE_ALARMS = "active_alarms";
    private static JSObject pendingTriggerData = null;

    public static void setPendingTrigger(String alarmId, String title, String time) {
        JSObject obj = new JSObject();
        obj.put("alarmId", alarmId);
        obj.put("title", title);
        obj.put("time", time);
        obj.put("isRinging", true);
        pendingTriggerData = obj;
    }

    @PluginMethod
    public void syncAlarms(PluginCall call) {
        try {
            JSArray alarmsArray = call.getArray("alarms");
            if (alarmsArray == null) {
                alarmsArray = new JSArray();
            }

            Context context = getContext();
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(KEY_ACTIVE_ALARMS, alarmsArray.toString()).apply();

            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            int scheduledCount = 0;

            if (am != null) {
                long nowMs = System.currentTimeMillis();

                for (int i = 0; i < alarmsArray.length(); i++) {
                    JSONObject alarm = alarmsArray.getJSONObject(i);
                    String id = alarm.optString("id", "alarm_" + i);
                    boolean enabled = alarm.optBoolean("enabled", true);
                    String title = alarm.optString("title", "Evo Squad Alarm");
                    String timeStr = alarm.optString("time", "08:00");
                    boolean isOnce = alarm.optBoolean("isOnce", false);

                    Intent triggerIntent = new Intent(context, AlarmReceiver.class);
                    triggerIntent.setAction(AlarmReceiver.ACTION_TRIGGER);
                    triggerIntent.putExtra("alarmId", id);
                    triggerIntent.putExtra("title", title);
                    triggerIntent.putExtra("time", timeStr);

                    PendingIntent pi = PendingIntent.getBroadcast(
                        context,
                        id.hashCode(),
                        triggerIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );

                    if (!enabled) {
                        am.cancel(pi);
                        continue;
                    }

                    // Compute next trigger time
                    String[] parts = timeStr.split(":");
                    int hour = Integer.parseInt(parts[0].trim());
                    int minute = Integer.parseInt(parts[1].trim());

                    Calendar target = Calendar.getInstance();
                    target.set(Calendar.HOUR_OF_DAY, hour);
                    target.set(Calendar.MINUTE, minute);
                    target.set(Calendar.SECOND, 0);
                    target.set(Calendar.MILLISECOND, 0);

                    // Handle repeat days if specified (array of day integers 0=Sun..6=Sat)
                    JSONArray repeatDays = alarm.optJSONArray("repeatDays");
                    if (repeatDays != null && repeatDays.length() > 0) {
                        boolean foundDay = false;
                        for (int d = 0; d < 7; d++) {
                            int dayOfWeek = target.get(Calendar.DAY_OF_WEEK) - 1; // 0=Sun
                            for (int r = 0; r < repeatDays.length(); r++) {
                                if (repeatDays.getInt(r) == dayOfWeek && target.getTimeInMillis() > nowMs) {
                                    foundDay = true;
                                    break;
                                }
                            }
                            if (foundDay) break;
                            target.add(Calendar.DAY_OF_YEAR, 1);
                        }
                    } else {
                        // Everyday or once
                        if (target.getTimeInMillis() <= nowMs) {
                            target.add(Calendar.DAY_OF_YEAR, 1);
                        }
                    }

                    long triggerMs = target.getTimeInMillis();

                    Intent showIntent = new Intent(context, MainActivity.class);
                    showIntent.putExtra("alarmId", id);
                    showIntent.putExtra("isRinging", true);
                    PendingIntent showPi = PendingIntent.getActivity(
                        context,
                        id.hashCode(),
                        showIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );

                    AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(triggerMs, showPi);
                    am.setAlarmClock(clockInfo, pi);
                    scheduledCount++;

                    Log.d(TAG, "⏰ Native Alarm scheduled: [" + title + "] at " + timeStr + " (" + triggerMs + ")");
                }
            }

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("scheduledCount", scheduledCount);
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "Failed to sync alarms: " + e.getMessage(), e);
            call.reject("Failed to sync alarms: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        try {
            String id = call.getString("id");
            if (id != null) {
                Context context = getContext();
                AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                if (am != null) {
                    Intent triggerIntent = new Intent(context, AlarmReceiver.class);
                    triggerIntent.setAction(AlarmReceiver.ACTION_TRIGGER);
                    PendingIntent pi = PendingIntent.getBroadcast(
                        context,
                        id.hashCode(),
                        triggerIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );
                    am.cancel(pi);
                }
            }
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to cancel alarm: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopAlarmSound(PluginCall call) {
        try {
            AlarmReceiver.stopAlarmSound();
            AlarmReceiver.stopVibration();

            Context context = getContext();
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                String id = call.getString("id");
                if (id != null) {
                    nm.cancel(id.hashCode());
                } else {
                    nm.cancelAll();
                }
            }

            pendingTriggerData = null;
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to stop alarm sound: " + e.getMessage());
        }
    }

    @PluginMethod
    public void snoozeAlarm(PluginCall call) {
        try {
            String id = call.getString("id");
            String title = call.getString("title", "Evo Alarm (Snoozed)");
            int minutes = call.getInt("minutes", 10);

            AlarmReceiver.stopAlarmSound();
            AlarmReceiver.stopVibration();

            Context context = getContext();
            long snoozeTriggerMs = System.currentTimeMillis() + (minutes * 60 * 1000L);

            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am != null && id != null) {
                Intent triggerIntent = new Intent(context, AlarmReceiver.class);
                triggerIntent.setAction(AlarmReceiver.ACTION_TRIGGER);
                triggerIntent.putExtra("alarmId", id);
                triggerIntent.putExtra("title", title);

                PendingIntent pi = PendingIntent.getBroadcast(
                    context,
                    id.hashCode(),
                    triggerIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                Intent showIntent = new Intent(context, MainActivity.class);
                PendingIntent showPi = PendingIntent.getActivity(
                    context,
                    id.hashCode(),
                    showIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(snoozeTriggerMs, showPi);
                am.setAlarmClock(clockInfo, pi);
            }

            pendingTriggerData = null;
            JSObject res = new JSObject();
            res.put("success", true);
            res.put("snoozedMinutes", minutes);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to snooze alarm: " + e.getMessage());
        }
    }

    @PluginMethod
    public void checkPendingTrigger(PluginCall call) {
        JSObject res = new JSObject();
        if (pendingTriggerData != null) {
            res.put("hasPending", true);
            res.put("alarm", pendingTriggerData);
            pendingTriggerData = null; // Clear after consume
        } else {
            res.put("hasPending", false);
        }
        call.resolve(res);
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        Context context = getContext();
        JSObject res = new JSObject();
        boolean canExact = true;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am != null) {
                canExact = am.canScheduleExactAlarms();
            }
        }

        res.put("exactAlarmAllowed", canExact);
        call.resolve(res);
    }

    @PluginMethod
    public void requestExactAlarmPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            } catch (Exception e) {
                Log.e(TAG, "Error opening exact alarm settings: " + e.getMessage());
            }
        }
        JSObject res = new JSObject();
        res.put("opened", true);
        call.resolve(res);
    }
}
