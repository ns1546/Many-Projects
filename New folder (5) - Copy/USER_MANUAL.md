# Smart Air Guardian - Official User Manual

Welcome to the **Smart Air Guardian**, a next-generation IoT air quality monitoring system powered by an ESP32 microcontroller, Edge AI, and a fully cloud-synchronized Progressive Web App (PWA).

This manual covers the physical hardware capabilities, the OLED display logic, and how to operate the mobile application remotely.

---

## 1. Hardware Overview

The physical device acts as the "Edge Node." It continuously polls the environment using a suite of precise sensors and streams the data directly to the Firebase Realtime Database.

### **Sensors & Actuators**
*   **PM2.5 Optical Dust Sensor:** Measures fine particulate matter (smoke, dust, allergens).
*   **MQ-135 Gas Sensor:** Detects broad spectrum air quality and CO2 equivalents.
*   **MQ-7 Gas Sensor:** Specifically tuned for detecting Carbon Monoxide (CO).
*   **DHT22 Sensor:** Tracks ambient Temperature (&deg;C) and relative Humidity (%).
*   **RGB Status Lamp:** A highly visible indicator of current air quality:
    *   🟢 **Green:** Safe / Optimal
    *   🟠 **Orange:** Moderate (Ventilation recommended)
    *   🔴 **Red:** Hazardous (Immediate action required)
*   **Active Buzzer:** Sounds an emergency pulse alarm if dangerous CO levels or extreme PM2.5 spikes are detected.

---

## 2. On-Device OLED Display

The hardware features a 1.3" I2C OLED screen that acts as an onboard dashboard. By default, it runs an **Auto-Carousel**, rotating through three distinct information pages every 3 seconds. 

### **The Three Display Pages**
1.  **Main Dashboard (Page 1):** Displays the primary AI-calculated AQI score, Temperature, Humidity, and the overall ML Risk Class (e.g., "HAZARDOUS", "SAFE").
2.  **Detailed Gas Metrics (Page 2):** Shows the raw readings for PM2.5 (&micro;g/m&sup3;) and Carbon Monoxide (ppm).
3.  **Hardware Diagnostics (Page 3):** Displays system vitals such as Cloud Sync status, WiFi connection, and Uptime.

*Note: The OLED page can be remotely overridden and "locked" to a specific page using the Mobile App.*

---

## 3. Mobile Application (PWA)

The Smart Air Guardian features a **Progressive Web App (PWA)**. Once deployed (e.g., via Netlify), it can be installed directly to your iOS or Android home screen, behaving exactly like a native app.

### **Key App Features**
*   **Global Firebase Sync:** The app connects to the device via Firebase Realtime Database. You can monitor your home's air quality and control the hardware from anywhere in the world.
*   **Native Toast Notifications:** Actions (like sending commands) trigger smooth, slide-up native notifications at the bottom of your screen.
*   **Swipe Navigation:** You can smoothly swipe left and right across your screen to switch between the main tabs.

### **Tab 1: Live Telemetry**
The main home screen. It displays dynamic, color-coded health badges that change instantly as your air quality fluctuates. It provides a quick glance at all sensor metrics and the overall "Edge ML" status.

### **Tab 2: C2 (Command & Control)**
This tab turns your phone into a remote control for the physical hardware.
*   **OLED Display Controls:** 
    *   Tap **Page 1**, **Page 2**, or **Page 3** to lock the physical OLED screen to that specific page.
    *   Tap **Auto** to resume the 3-second automatic carousel rotation.
    *   Tap **Wake/Sleep** to remotely turn the screen on or off to save power at night.
*   **Hardware Triggers:**
    *   **Ping Buzzer:** Sends a quick pulse to the physical buzzer to test functionality or locate the device.
    *   **Reboot Device:** Sends a hard reset command to the ESP32 microcontroller.

### **Tab 3: Hardware Diagnostics & AI**
An advanced panel for system maintenance.
*   **AI Clinical Report:** Uses Groq/Gemini AI to generate a plain-English, medical-grade analysis of your current air quality data, providing actionable health advice.
*   **Data Vault Management:** Allows you to lock a baseline AQI for relative tracking or clear the local memory vault.

---

## 4. Setup & Deployment Guide

1.  **Hardware Power:** Plug the ESP32 into a reliable 5V USB power source. 
2.  **Boot Sequence:** The RGB lamp will cycle colors, and the OLED will display "Connecting to WiFi..." followed by "Firebase Sync".
3.  **App Installation:**
    *   Open your Netlify deployment URL in Safari (iOS) or Chrome (Android).
    *   Tap **Share > Add to Home Screen** (iOS) or **Install App** (Android).
    *   Launch the app from your home screen. It will instantly connect to Firebase and display your live data!
