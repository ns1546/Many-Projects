# 🔥 Firebase Production Deployment & FCM High-Priority Push Guide
### Complete Blueprint for Zero-Latency Device Wake-Up & Silent Mode Bypass

---

## 1. Why Firebase is Essential for Production Mobile Alarms

When a mobile phone has been locked on a nightstand for hours, Android and iOS enter aggressive power-saving sleep states (**Doze Mode** on Android, **Suspended State** on iOS). 

- **WebSockets** maintain real-time connections while the screen is on or during active sessions.
- **Firebase Cloud Messaging (FCM)** with **High Priority** is the only protocol permitted by Google and Apple to pierce through deep Doze mode, wake up the device hardware, set a full-screen intent, and start the alarm siren immediately.

---

## 2. Step-by-Step Firebase Console Setup

### Step 1: Create Your Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and name it `CombineAlarm-Production`.
3. Disable Google Analytics (optional, not required for alarms) and click **Create Project**.

### Step 2: Enable Firebase Cloud Messaging (FCM)
1. In the left sidebar, click the gear icon ⚙️ next to *Project Overview* -> **Project settings**.
2. Go to the **Cloud Messaging** tab.
3. Under *Firebase Cloud Messaging API (V1)*, verify that it is **Enabled**. If disabled, click the three dots -> *Manage API in Google Cloud Console* and click **Enable**.

### Step 3: Generate Backend Service Account Key
To allow your Node.js server (`server.js`) to dispatch wake-up alerts:
1. In Firebase Console -> **Project settings** -> **Service accounts** tab.
2. Ensure **Node.js** is selected.
3. Click **"Generate new private key"** -> Download the JSON file.
4. Rename this file to `firebase-service-account.json` and place it in your backend directory:
   `combine_alarm_app/firebase-service-account.json`
5. ⚠️ **Security Warning:** Never commit this file to public GitHub repositories.

---

## 3. Backend Integration (Node.js + Firebase Admin SDK)

### Install Firebase Admin SDK:
Inside `combine_alarm_app/`, run:
```bash
npm install firebase-admin
```

### Production FCM Dispatcher Snippet:
Add this to your Node.js backend to broadcast wake-up sirens to sleeping devices:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Broadcast High-Priority Wake-Up Push to Devices
 * @param {string[]} deviceTokens - Array of FCM registration tokens
 * @param {object} alarmData - Alarm metadata (title, sound, voiceMemo)
 */
async function sendWakeUpPush(deviceTokens, alarmData) {
  if (!deviceTokens || deviceTokens.length === 0) return;

  const message = {
    tokens: deviceTokens,
    // CRITICAL: Data-only payload wakes the background service without showing default notification banner
    data: {
      action: 'TRIGGER_ALARM',
      alarmId: String(alarmData.id),
      title: alarmData.title || 'Combine Alarm Wake Up!',
      sound: alarmData.sound || 'nuclear',
      voiceMemo: alarmData.voiceMemo || '',
      triggeredBy: alarmData.triggeredBy || 'Squad'
    },
    android: {
      priority: 'high', // Bypasses Android Doze mode
      ttl: 0 // Deliver immediately or expire; no buffering delays
    },
    apns: {
      headers: {
        'apns-priority': '10', // Highest priority on Apple APNs
        'apns-push-type': 'alert'
      },
      payload: {
        aps: {
          sound: `${alarmData.sound || 'siren'}.caf`,
          'content-available': 1 // Wakes background app on iOS
        }
      }
    }
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`📡 FCM Broadcast sent: ${response.successCount} delivered, ${response.failureCount} failed.`);
  } catch (error) {
    console.error('⚠️ FCM Broadcast Error:', error);
  }
}

module.exports = { sendWakeUpPush };
```

---

## 4. Packaging into a 100% Native Android APK (Capacitor)

To guarantee the alarm **rings even if the user has physically set their phone to Mute, Vibrate, or Silent**:
Android apps can access `AudioAttributes.USAGE_ALARM` on `STREAM_ALARM`.

### Step 1: Initialize Capacitor
Inside `combine_alarm_app/`:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/push-notifications
npx cap init "CombineAlarm" "com.combinealarm.squad" --web-dir public
npx cap add android
```

### Step 2: Configure Android Permissions for Silent Bypass
Open `android/app/src/main/AndroidManifest.xml` and add these native permissions:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Wakes phone from deep sleep -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- Exact Alarm scheduling (Android 12+) -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />

    <!-- Full-screen alarm UI over lock screen -->
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
    
    <!-- Continuous haptic vibration -->
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <!-- Disable battery killer restrictions -->
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
</manifest>
```

### Step 3: Register Notification Channel with DND Bypass (Kotlin)
Inside `android/app/src/main/java/.../MainActivity.kt`:
```kotlin
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createAlarmNotificationChannel()
    }

    private fun createAlarmNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM) // Bypasses Ringer & Vibrate sliders
                .build()

            val channel = NotificationChannel(
                "combine_alarm_critical",
                "CombineAlarm Audio Channel",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Critical squad alarms that ring through silent mode"
                setBypassDnd(true) // Crucial: rings through Do Not Disturb
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 800)
                setSound(Uri.parse("android.resource://" + packageName + "/raw/siren"), audioAttributes)
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
```

### Step 4: Build the Release APK
```bash
npx cap sync android
cd android
./gradlew assembleRelease
```
The output `.apk` file is located at `android/app/build/outputs/apk/release/app-release.apk`.

---

## 5. Summary Answers to Critical Operational Questions

| Scenario | Behavior in PWA (Web) | Behavior in Native APK (Android/iOS) |
|---|---|---|
| **Phone is on Silent / Mute Switch** | Rings if Media Volume is up; iPhone hardware side-switch mutes standard Safari. | **100% RINGS AUDIBLY**. Android uses `STREAM_ALARM` which ignores the silent toggle. iOS uses Critical Alerts entitlement. |
| **Phone has Internet / Wi-Fi OFF** | **Scheduled Alarms STILL RING!** Local offline storage schedules timer locally. Instant alerts require network. | **Scheduled Alarms STILL RING!** Native `AlarmManager.setAlarmClock()` fires offline. |
| **App is Swiped Away / Phone Locked** | Rings if browser tab or PWA background service is kept warm. | **100% WAKES UP**. FCM high-priority push + Full-Screen Intent turns on the screen and rings. |
