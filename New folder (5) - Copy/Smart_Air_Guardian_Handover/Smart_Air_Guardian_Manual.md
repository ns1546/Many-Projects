---
title: "Smart Air Guardian"
author: "Engineering Team"
---

<style>
  body {
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #333;
    line-height: 1.6;
  }
  h1 {
    color: #2563eb;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 5px;
    margin-top: 40px;
  }
  h2 {
    color: #1e40af;
    margin-top: 30px;
  }
  h3 {
    color: #3b82f6;
    margin-top: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    margin-bottom: 20px;
  }
  th, td {
    border: 1px solid #e2e8f0;
    padding: 10px;
    text-align: left;
  }
  th {
    background-color: #f8fafc;
    color: #0f172a;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background-color: #f1f5f9;
  }
  code {
    background-color: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.9em;
  }
  .page-break {
    page-break-after: always;
  }
  .cover {
    text-align: center;
    margin-top: 150px;
  }
  .cover h1 {
    font-size: 3em;
    border: none;
    color: #0f172a;
  }
  .cover h2 {
    font-size: 1.5em;
    color: #64748b;
    margin-top: 10px;
  }
</style>

<div class="cover">
  <h1>Smart Air Guardian</h1>
  <h2>Comprehensive Engineering & Operations Manual</h2>
  <br><br><br>
  <p><strong>System Blueprint, Firmware Architecture, & AI Integration</strong></p>
  <p>Version 1.0</p>
</div>

<div class="page-break"></div>

# 1. System Architecture & Hardware Ecosystem

The ecosystem is built on a highly optimized IoT architecture:

1.  **The Edge Node (Hardware):** Driven by an **ESP32 Dual-Core Xtensa LX6 CPU at 240 MHz**. It features ~294KB of free SRAM and handles real-time sensor polling, 115200 Baud serial communication, and on-device C++ Machine Learning inference.
2.  **The Cloud Broker:** Utilizing **Firebase Realtime Database (RTDB)** for low-latency JSON telemetry syncing, paired with external HTTP APIs (Open-Meteo, Groq/Gemini).
3.  **The Progressive Web App (PWA):** A responsive, Glassmorphic HTML/JS/CSS interface featuring offline caching, 11 distinct operational panes, and the Web Serial API for direct USB control.

<div class="page-break"></div>

# 2. Exhaustive Pin Diagram & Wiring Architecture

The hardware relies on a precise electrical architecture divided into **5V and 3.3V rails**. The ESP32 utilizes AMS1117-3.3 LDO regulators to manage power.

### Detailed Pin Layout & Functionality

| Component | ESP32 Pin | Signal Type | Exhaustive Engineering Details |
| :--- | :--- | :--- | :--- |
| **MQ-135 (Air/CO2)** | `GPIO 34` | ADC1_CH6 | Powered by 5V (requires ~140mA for heater coil). Analog voltage output is read via a 12-bit ADC (0-4095). Requires a 24-sample hardware oversampling to eliminate ADC noise. |
| **MQ-7 (CO)** | `GPIO 35` | ADC1_CH7 | Powered by 5V. Runs a 60s/90s dual-temperature cycle. Also utilizes 24-sample oversampling in firmware. |
| **GP2Y1010 Dust** | `AOUT: 32`<br>`ILED: 14` | ADC1_CH4<br>Digital Out | ESP32 sends a 280µs HIGH pulse on GPIO 14 to fire the IR LED, delays 40µs, reads ADC on GPIO 32, then turns off. Firmware applies an 8-pulse oversampling average. Includes a "Tare Calibration" (0.84V default) to zero out baseline dust. |
| **DHT11 / DHT22** | `GPIO 4` | 1-Wire Digital | Powered by 3.3V. Uses a digital handshake protocol. The firmware automatically attempts DHT22 reading; if checksum fails (NaN), it dynamically falls back to DHT11 protocol. |
| **OLED (1.3" SSD1306)** | `SDA: 21`<br>`SCL: 22` | I2C (0x3C) | Powered by 3.3V. Firmware verifies I2C ACK during boot. Renders the 3-page UI carousel. |
| **Active Buzzer** | `GPIO 26` | Digital Out | Driven by an NPN transistor circuit. Activated automatically by the ML model or manually via the dashboard (C2 center). |
| **RGB LEDs**| `R: 25, G: 27, B: 12`<br>`R: 18, G: 19, B: 23`| PWM/Digital | Dual-mirrored array. Software supports both **Common Cathode (GND)** and **Common Anode (3.3V)** modes, dynamically switchable via the Web Dashboard. |

<div class="page-break"></div>

# 3. Microcontroller Operations & Firmware Mechanics

### The Boot Sequence
1.  **Pin Init:** Configures inputs/outputs. Flashes the onboard blue LED (GPIO 2).
2.  **RGB Self-Test:** Executes a diagnostic sequence (Red -> Green -> Blue) to verify LED integrity.
3.  **Sensor & Bus Init:** Warms up MQ sensors, verifies I2C communication with the OLED, and tests the DHT handshake.
4.  **Network Init:** Attempts WiFi connection (15 retries). If successful, prints local IP. If failed, falls back to standalone USB Serial mode.

### The Infinite Loop (Operational Cycle - 1.5s Polling)
Every 1.5 seconds (`SENSOR_INTERVAL`), the ESP32 performs:
1.  **Acquisition:** Executes the 8-pulse (Dust) and 24-sample (Gas) oversampling.
2.  **Filtering:** Pushes data into a Moving Average array (`NUM_SAMPLES = 10`) to smooth out transient spikes.
3.  **Math:** Converts raw voltage into Engineering Units (e.g., ug/m3, ppm) and calculates the **US EPA AQI**.
4.  **Inference:** Passes normalized data into the Edge ML models.
5.  **Actuation:** Sets the RGB color based on ML Risk Class, and sounds the buzzer if ML Hazard Probability is `> 0.85` or AQI is `> 250`.
6.  **OLED Refresh:** Updates the display buffer.
7.  **Cloud Sync:** Every 3.0s, executes an HTTP `PUT` to Firebase. Every 1.5s, executes an HTTP `GET` to poll for commands.

<div class="page-break"></div>

# 4. Machine Learning Pipeline & Data Science Architecture

The ESP32 is a "Smart" node, meaning the AI models run *locally in C++* without needing the cloud. The models were engineered via a comprehensive Python Pipeline.

### Phase 1: Data Engineering & Open-Meteo API
Using `pandas`, we loaded over 1 Million rows from `AQI Bangladesh.csv`. Because pollutants are weather-dependent, we simulated fetching Historical Weather Data from the **Open-Meteo API** (appending `temperature_2m` and `wind_speed_10m` as new features).
*   **Target 1 (Future AQI):** Created by shifting the AQI column back 1 hour (`shift(-1)`).
*   **Target 2 (Alert):** Binary column (1 if AQI > 150, else 0).
*   **Target 3 (Category):** Binned AQI into 4 classes (Good, Moderate, Unhealthy, Hazardous).

### Phase 2: Feature Scaling & Train/Test Split
We used `scikit-learn`'s `MinMaxScaler` to scale all features (PM2.5, Temp, Wind) to a `[0.0, 1.0]` range. This allows the ESP32 to calculate complex math efficiently. Data was split into 80% Training Data and 20% Testing Data.

### Phase 3: The Three Edge Models
1.  **Linear Regression (1-Hour Forecaster):** Trained to minimize Mean Squared Error.
    *   *Ported C++ Equation:* `Future_AQI = (284.22 * s_pm25) + (82.00 * s_co) + (0.03 * s_temp) - (0.06 * s_humid) + 59.74`
2.  **Logistic Regression (Emergency Hazard Alarm):** Trained to output binary hazard states using a Z-score and Sigmoid activation.
    *   *Ported C++ Equation:* `z = (23.56 * s_pm25) - (0.39 * s_co) - (0.008 * s_temp) - (0.01 * s_humid) - 4.47` -> `prob = 1 / (1 + exp(-z))`.
3.  **Decision Tree Classifier (Risk Levelizer):** Limited to `max_depth=4`. Trained to classify the air into 4 classes to drive the RGB LEDs via conditional thresholds.

<div class="page-break"></div>

# 5. Web Infrastructure & PWA Deployment

The frontend dashboard is engineered as a true **Progressive Web App (PWA)**, deployed via Netlify.

### Service Worker & Offline Caching
The application utilizes a Service Worker (`sw.js`) to intercept network requests.
*   **Cache Name:** `air-guardian-v1`
*   **Cached Assets:** `frontend_dashboard.html`, `app_mobile.css`, and `app_icon.png`.
*   **Behavior:** During the `install` phase, it downloads the UI assets. During the `fetch` phase, it responds from the cache first (`caches.match`), ensuring the mobile app loads instantly even on poor networks.

### Firebase Realtime Database
*   **Telemetry Sync:** ESP32 sends HTTP `PUT` requests to `https://[FIREBASE_HOST]/telemetry.json` with a JSON payload of all telemetry and AI data.
*   **C2 Command Polling:** ESP32 checks `/commands/lastCommand.json` every 1.5s, parses the JSON string manually, and executes if the `timestamp` has changed.

<div class="page-break"></div>

# 6. Comprehensive Web Dashboard Breakdown (UI/UX)

The Dashboard utilizes a Glassmorphic, mobile-responsive CSS framework. The interface is divided into **11 Exhaustive Panes (Tabs):**

### 1. Live Telemetry (`pane-telemetry`)
*   **Hero Health Banner:** Dynamically changes color/text advising actions (e.g., "Seal Windows", "Wear N95").
*   **EPA AQI Dial:** Massive numerical readout.
*   **Calibrated Metric Tiles:** 10-sample averages for PM2.5, CO2, CO, and Climate.
*   **3D Particle Hologram (`particleCanvas`):** A Javascript canvas rendering micro-particle dispersion densities visually.
*   **Rolling Trend Chart:** Chart.js graph tracking PM2.5/AQI history.
*   **Edge ML Status:** Displays the 1h Linear Regression forecast, Decision Tree class, and a dynamic progress bar for Logistic Hazard Probability.

### 2. Hardware Diagnostics & Port Inspector (`pane-hardware-diag`)
*   **Network & Power State:** Badges for Device Offline / RTDB Offline.
*   **USB Port & Cable Watchdog (PC Only):** Tracks active COM port, Baud rate (115200), 8-N-1 Serial status, heartbeat, and packet throughput via Web Serial API.
*   **MCU Architecture Grid:** Displays CPU (240 MHz), Free SRAM (`diagFreeHeap`), Firmware Uptime, and VBUS Voltage.
*   **Per-Sensor Health Matrix:** Individual diagnostic cards verifying 1-Wire handshakes, IR emitter pulses, and Heater Coil status.
*   **Live ADC Voltage Probes:** A table showing precise 12-bit raw ADC numbers and converted voltages (e.g., 1045 ADC -> 0.84V).
*   **7-Point Hardware Health Audit:** A terminal popup that runs a systemic check of all peripherals.

### 3. Air Quality Guide (`pane-guide`)
*   A static reference pane explaining the health implications of various PM2.5 and CO levels.

### 4. GPS Sensor Map (`pane-map`)
*   Utilizes **Leaflet.js** and OpenStreetMap to plot the physical geo-location of the sensor node.

### 5. 24-Hour AI Forecast (`pane-forecast24`)
*   Visualizes future trends using a Chart.js graph (Ridge Regression synthesis) and explains Diurnal cycles (Morning Rush Hour spikes, Afternoon Solar Dispersion, Nighttime Moisture Inversion).

### 6. Historical Analytics (`pane-analytics`)
*   Displays deep historical charts and CSV-style data tables of past telemetry.

### 7. AI Clinical Studio (`pane-gemini`)
*   Connects to the Groq/Gemini LLM API via POST requests. Generates and renders a comprehensive, medical-grade Markdown report detailing synergistic risks (e.g., high PM2.5 combined with high Humidity causing bronchospasms).

### 8. Mitigation Engine (`pane-mitigation`)
*   Allows users to lock a "Baseline" AQI. After turning on a purifier, the user clicks "Retest", and the system calculates the mathematical percentage improvement (Purification Efficacy).

### 9. Hardware C2 Center (`pane-c2`)
*   **OLED Control:** Force lock the physical OLED to Page 1, 2, or 3, or set it to Auto-Carousel. Turn OLED power on/off.
*   **Buzzer Control:** Trigger a 200ms pulse beep or force silence.
*   **RGB Diagnostics:** Individually test Red, Green, and Blue channels. Toggle between "Common Cathode" and "Common Anode" modes.
*   **System Controls:** Run a "Zero Dust Tare Calibration" or trigger a Soft MCU Reboot via `ESP.restart()`.

### 10. Edge ML & Model Brain (`pane-ml-training`)
*   A transparent view into the hardcoded weights, biases, and thresholds currently running on the ESP32's C++ inference engine.

### 11. Data Vault & Export (`pane-data-vault`)
*   Manages the browser's `localStorage`, allowing users to wipe saved baselines or export historical data logs.

---
*End of Exhaustive Engineering Manual.*
