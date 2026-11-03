package com.combinealarm.squad;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";
    public static final String ACTION_TRIGGER = "com.combinealarm.squad.ALARM_TRIGGER";
    public static final String ACTION_SNOOZE = "com.combinealarm.squad.ALARM_SNOOZE";
    public static final String ACTION_DISMISS = "com.combinealarm.squad.ALARM_DISMISS";
    public static final String CHANNEL_ID = "evo_alarm_channel_critical";

    private static MediaPlayer activeMediaPlayer = null;
    private static Vibrator activeVibrator = null;

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "⏰ AlarmReceiver received action: " + action);

        if (action == null || ACTION_TRIGGER.equals(action)) {
            handleAlarmTrigger(context, intent);
        } else if (ACTION_SNOOZE.equals(action)) {
            handleAlarmSnooze(context, intent);
        } else if (ACTION_DISMISS.equals(action)) {
            handleAlarmDismiss(context, intent);
        }
    }

    private void handleAlarmTrigger(Context context, Intent intent) {
        String alarmId = intent.getStringExtra("alarmId");
        String title = intent.getStringExtra("title");
        String time = intent.getStringExtra("time");
        if (title == null) title = "Evo Squad Alarm";
        if (time == null) time = "";

        // 1. Acquire WakeLock to turn on screen and prevent CPU sleep
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            wakeLock = pm.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK |
                PowerManager.ACQUIRE_CAUSES_WAKEUP |
                PowerManager.ON_AFTER_RELEASE,
                "EvoAlarm:WakeLockTag"
            );
            wakeLock.acquire(3 * 60 * 1000L); // 3 minutes max
        }

        // 2. Play Looping High-Priority Alarm Sound
        playAlarmSound(context);

        // 3. Start Heavy Vibration
        startVibration(context);

        // 4. Create Notification Channel
        createNotificationChannel(context);

        // 5. Build Intent to open MainActivity on Full Screen / Lock Screen
        Intent fullScreenIntent = new Intent(context, MainActivity.class);
        fullScreenIntent.setAction(ACTION_TRIGGER);
        fullScreenIntent.putExtra("alarmId", alarmId);
        fullScreenIntent.putExtra("title", title);
        fullScreenIntent.putExtra("time", time);
        fullScreenIntent.putExtra("isRinging", true);
        fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            (alarmId != null ? alarmId.hashCode() : 1001),
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // 6. Action: Dismiss
        Intent dismissIntent = new Intent(context, AlarmReceiver.class);
        dismissIntent.setAction(ACTION_DISMISS);
        dismissIntent.putExtra("alarmId", alarmId);
        PendingIntent dismissPendingIntent = PendingIntent.getBroadcast(
            context,
            (alarmId != null ? alarmId.hashCode() + 1 : 1002),
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // 7. Action: Snooze (10 mins)
        Intent snoozeIntent = new Intent(context, AlarmReceiver.class);
        snoozeIntent.setAction(ACTION_SNOOZE);
        snoozeIntent.putExtra("alarmId", alarmId);
        snoozeIntent.putExtra("title", title);
        PendingIntent snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            (alarmId != null ? alarmId.hashCode() + 2 : 1003),
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // 8. Build Heads-Up Lock Screen Notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("⏰ " + title)
            .setContentText("Squad Wake-Up Time: " + time + " • Tap to unlock")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setContentIntent(fullScreenPendingIntent)
            .setAutoCancel(true)
            .setOngoing(true)
            .addAction(android.R.drawable.ic_media_pause, "💤 SNOOZE 10M", snoozePendingIntent)
            .addAction(android.R.drawable.ic_delete, "✖ DISMISS", dismissPendingIntent);

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(alarmId != null ? alarmId.hashCode() : 1000, builder.build());
        }

        // 9. Launch MainActivity directly if screen is unlocked or to bring UI to front
        try {
            context.startActivity(fullScreenIntent);
        } catch (Exception e) {
            Log.e(TAG, "Error starting MainActivity from receiver: " + e.getMessage());
        }
    }

    private void handleAlarmSnooze(Context context, Intent intent) {
        String alarmId = intent.getStringExtra("alarmId");
        String title = intent.getStringExtra("title");
        if (title == null) title = "Evo Alarm";

        stopAlarmSound();
        stopVibration();

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && alarmId != null) {
            nm.cancel(alarmId.hashCode());
        }

        // Reschedule alarm for +10 minutes
        long snoozeTimeMs = System.currentTimeMillis() + (10 * 60 * 1000L);
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am != null) {
            Intent triggerIntent = new Intent(context, AlarmReceiver.class);
            triggerIntent.setAction(ACTION_TRIGGER);
            triggerIntent.putExtra("alarmId", alarmId);
            triggerIntent.putExtra("title", title + " (Snoozed)");

            PendingIntent pi = PendingIntent.getBroadcast(
                context,
                (alarmId != null ? alarmId.hashCode() : 1001),
                triggerIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            Intent showIntent = new Intent(context, MainActivity.class);
            PendingIntent showPi = PendingIntent.getActivity(
                context,
                (alarmId != null ? alarmId.hashCode() : 1001),
                showIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(snoozeTimeMs, showPi);
            am.setAlarmClock(clockInfo, pi);
            Log.d(TAG, "⏰ Alarm snoozed for 10 min: " + title);
        }
    }

    private void handleAlarmDismiss(Context context, Intent intent) {
        String alarmId = intent.getStringExtra("alarmId");
        stopAlarmSound();
        stopVibration();

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && alarmId != null) {
            nm.cancel(alarmId.hashCode());
        }
        Log.d(TAG, "✅ Alarm dismissed: " + alarmId);
    }

    public static synchronized void playAlarmSound(Context context) {
        try {
            stopAlarmSound();
            Uri alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alertUri == null) {
                alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }

            activeMediaPlayer = new MediaPlayer();
            activeMediaPlayer.setDataSource(context, alertUri);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
                activeMediaPlayer.setAudioAttributes(audioAttributes);
            } else {
                activeMediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            }

            activeMediaPlayer.setLooping(true);
            activeMediaPlayer.prepare();
            activeMediaPlayer.start();
        } catch (Exception e) {
            Log.e(TAG, "Error playing alarm sound: " + e.getMessage());
        }
    }

    public static synchronized void stopAlarmSound() {
        if (activeMediaPlayer != null) {
            try {
                if (activeMediaPlayer.isPlaying()) {
                    activeMediaPlayer.stop();
                }
                activeMediaPlayer.release();
            } catch (Exception ignored) {}
            activeMediaPlayer = null;
        }
    }

    private static synchronized void startVibration(Context context) {
        try {
            stopVibration();
            activeVibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            if (activeVibrator != null && activeVibrator.hasVibrator()) {
                long[] pattern = new long[]{0, 800, 300, 800, 300, 800};
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    activeVibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
                } else {
                    activeVibrator.vibrate(pattern, 0);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Vibration error: " + e.getMessage());
        }
    }

    public static synchronized void stopVibration() {
        if (activeVibrator != null) {
            try {
                activeVibrator.cancel();
            } catch (Exception ignored) {}
            activeVibrator = null;
        }
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            NotificationChannel channel = nm.getNotificationChannel(CHANNEL_ID);
            if (channel == null) {
                channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Evo Alarm Critical Alerts",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Critical Squad Alarms, Lock Screen Alerts, and Emergency Broadcasts");
                channel.enableLights(true);
                channel.enableVibration(true);
                channel.setBypassDnd(true);
                channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);

                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
                Uri alarmSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                channel.setSound(alarmSoundUri, audioAttributes);

                nm.createNotificationChannel(channel);
            }
        }
    }
}
