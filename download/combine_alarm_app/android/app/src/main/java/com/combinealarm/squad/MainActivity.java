package com.combinealarm.squad;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeAlarmPlugin.class);
        super.onCreate(savedInstanceState);
        
        // Ensure window wakes up screen and shows over lock screen for critical alarms
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }

        checkAlarmIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        checkAlarmIntent(intent);
    }

    private void checkAlarmIntent(Intent intent) {
        if (intent != null && intent.getBooleanExtra("isRinging", false)) {
            String alarmId = intent.getStringExtra("alarmId");
            String title = intent.getStringExtra("title");
            String time = intent.getStringExtra("time");
            NativeAlarmPlugin.setPendingTrigger(alarmId, title, time);
        }
    }
}
