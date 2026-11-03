package com.combinealarm.squad;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "🔄 Device boot/update detected: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action) ||
            "com.htc.intent.action.QUICKBOOT_POWERON".equals(action) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
            
            rescheduleAllAlarms(context);
        }
    }

    public static void rescheduleAllAlarms(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("EvoAlarmsPref", Context.MODE_PRIVATE);
            String alarmsJson = prefs.getString("active_alarms", "[]");
            JSONArray array = new JSONArray(alarmsJson);

            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            long nowMs = System.currentTimeMillis();

            for (int i = 0; i < array.length(); i++) {
                JSONObject alarm = array.getJSONObject(i);
                boolean enabled = alarm.optBoolean("enabled", true);
                if (!enabled) continue;

                String id = alarm.optString("id");
                String title = alarm.optString("title", "Evo Alarm");
                String time = alarm.optString("time", "08:00");
                boolean isOnce = alarm.optBoolean("isOnce", false);

                String[] parts = time.split(":");
                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);

                Calendar cal = Calendar.getInstance();
                cal.set(Calendar.HOUR_OF_DAY, hour);
                cal.set(Calendar.MINUTE, minute);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);

                if (cal.getTimeInMillis() <= nowMs) {
                    cal.add(Calendar.DAY_OF_YEAR, 1);
                }

                long triggerMs = cal.getTimeInMillis();

                Intent triggerIntent = new Intent(context, AlarmReceiver.class);
                triggerIntent.setAction(AlarmReceiver.ACTION_TRIGGER);
                triggerIntent.putExtra("alarmId", id);
                triggerIntent.putExtra("title", title);
                triggerIntent.putExtra("time", time);

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

                AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(triggerMs, showPi);
                am.setAlarmClock(clockInfo, pi);

                Log.d(TAG, "⏰ Rescheduled on boot: [" + title + "] for " + time + " (timestamp: " + triggerMs + ")");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error rescheduling alarms on boot: " + e.getMessage());
        }
    }
}
