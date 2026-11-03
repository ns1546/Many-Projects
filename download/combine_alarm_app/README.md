# ⏰ CombineAlarm - Multiplayer Squad Alarm System

> **A collaborative, real-time shared alarm application.** When an alarm is set, it rings on **every** connected device simultaneously. Anyone in the squad can create, edit, or close it, and anyone can trigger an instant emergency siren for everyone.

---

## 🌟 Key Features

1. **Synchronized Ringing Across All Devices:**
   - When an alarm is scheduled for 7:00 AM, **all phones in the room start ringing at the exact same moment**.
   - Live attribution: Shows who set the alarm and who dismissed or snoozed it.
2. **Defeats Silent, Vibrate & Sleep Modes:**
   - **Web Audio API Acoustic Engine:** Utilizes synthesized dual-tone emergency sirens and high-intensity frequency-modulated chirps designed to cut through ambient noise.
   - **Aggressive Vibration Cadence:** Triggers continuous haptic vibration sequences on mobile devices.
   - **Screen Wake Lock:** Prevents the device from auto-locking or sleeping during an active alarm.
3. **Instant Squad Alert ("Panic Wake-Up"):**
   - A single tap on **"TRIGGER SQUAD INSTANT ALERT"** instantly sounds an audible siren on all connected phones in real time (ideal for emergencies, urgent flights, morning standups, or shift handoffs).
4. **Wake-Up Task Challenges:**
   - **Math Challenge:** Requires solving a random arithmetic problem (e.g. `28 + 19 = ?`) before the alarm can be turned off, ensuring groggy users don't accidentally close it in their sleep.
   - **Rapid Tap Challenge:** Requires tapping the unlock button 8 times in rapid succession to dismiss.
5. **Flexible Squad Consensus Modes:**
   - **Anyone Can Dismiss (Fast):** First squad member to wake up and solve the challenge shuts it off for everyone.
   - **All Must Check In (Accountability):** Every individual device rings continuously until **each member** taps "I'm Awake", featuring a real-time progress counter (*"3 of 4 Checked In"*).
6. **Spoken Voice Memo Announcements:**
   - Custom voice notes attached to an alarm are automatically synthesized and spoken aloud over the siren (*"Don't forget passport and presentation slides!"*).
7. **Built-in Multi-Device Test Lab:**
   - Test simultaneous alarms and instant dismissals on your computer using the built-in split-screen phone simulator, even if you don't have multiple physical devices handy.

---

## 🚀 How to Run the App

### 1. Start the Server
Open your terminal in this folder and run:
```bash
npm start
```

### 2. Open on Your Computer
Go to your browser:
```
http://localhost:3000
```

### 3. Connect Other Phones on the Same Wi-Fi
When the server starts, it prints your local network IP addresses in the console:
```
📡 Local Computer : http://localhost:3000
📱 Other Phones/Wi-Fi: http://192.168.1.X:3000
```
Simply type that `http://192.168.1.X:3000` address into the browser on any Android phone or iPhone connected to your home/office Wi-Fi.

### 4. Install as a Native App on Mobile (PWA)
- **On Android (Chrome):** Tap the menu (three dots) -> **"Add to Home Screen"** or **"Install app"**.
- **On iPhone (Safari):** Tap the Share button -> **"Add to Home Screen"**.
The app will run in full-screen standalone mode with native audio privileges.

---

## 📂 Project Architecture

```
combine_alarm_app/
├── server.js               # Node.js + WebSocket Server & Alarm Scheduler
├── package.json            # Project manifest & dependencies (express, ws)
├── README.md               # User documentation & setup guide
├── data/
│   └── database.json       # Persistent storage for squad rooms & alarms
└── public/
    ├── index.html          # Responsive mobile app UI shell & Ringing HUD
    ├── manifest.json       # PWA manifest for mobile installation
    ├── sw.js               # Service Worker for offline asset caching
    ├── css/
    │   └── app.css         # Dark OLED UI, shockwave animations & glassmorphism
    └── js/
        ├── audio-synth.js  # Web Audio API Synthesizer, Vibration & WakeLock
        ├── client-sync.js  # WebSocket multiplayer client with auto-reconnect
        └── app.js          # App controller, challenges & multi-device lab
```

---

## 📱 Native Android APK Packaging (Optional)

If you wish to package this into a native Android `.apk` with background services:
1. You can wrap the `public/` directory using **Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "CombineAlarm" "com.combinealarm.app" --web-dir public
   npx cap add android
   npx cap open android
   ```
2. Or use the Flutter blueprint provided in the parent documentation.
