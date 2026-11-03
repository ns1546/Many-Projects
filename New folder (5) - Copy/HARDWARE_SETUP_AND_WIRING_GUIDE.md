# 🛠️ Complete Hardware Setup & Connection Guide
## Smart Air Quality Monitoring & Health Risk Prediction System

This master guide walks you through physically assembling the circuit, connecting your ESP32 to your PC, uploading the code via Arduino IDE, and streaming live sensor data to the Web Dashboard.

---

## 📦 1. Required Components List

| Component | Quantity | Purpose |
| :--- | :---: | :--- |
| **ESP32 DevKit V1 (30-pin or 38-pin)** | 1 | Microcontroller running Edge ML & IoT server |
| **MQ-135 Gas Sensor Module** | 1 | Measures CO2, Alcohol, Benzene, Smoke |
| **MQ-7 Gas Sensor Module** | 1 | Measures Carbon Monoxide (CO) concentration |
| **Sharp GP2Y1010AU0F Dust Sensor** | 1 | Measures Optical Dust / PM2.5 density |
| **DHT22 (AM2302) Sensor** | 1 | Measures Precision Temperature & Humidity |
| **0.96" I2C OLED Display (SSD1306)** | 1 | Local 3-Page Carousel Display |
| **Active Buzzer (5V / 3.3V)** | 1 | Audible Emergency Hazard Alarm |
| **RGB LED (Common Cathode)** | 1 | Color-coded Air Quality Status indicator |
| **220Ω Resistors** | 3 | Current limiting for RGB LED pins |
| **150Ω Resistor & 220µF Capacitor** | 1 each | GP2Y1010 Dust Sensor wiring harness (included in box) |
| **Breadboard & Jumper Wires** | 1 Set | Male-to-Male & Male-to-Female wires |
| **Micro-USB Data Cable** | 1 | Powers ESP32 & streams Serial JSON to PC |

---

## ⚡ 2. Power Distribution Architecture

> [!IMPORTANT]
> The ESP32 is powered via the Micro-USB cable connected to your PC (5V).
> - **5V Power Rail (VIN Pin):** The gas heating elements in **MQ-135**, **MQ-7**, and the **Sharp Dust Sensor** require **5V** (`VIN` pin on ESP32).
> - **3.3V Power Rail (3V3 Pin):** The **DHT22** and **OLED Display** should be connected to the **3.3V** (`3V3` pin) to prevent logic level damage.
> - **Common Ground (GND):** All sensors and LEDs must share a common **GND** rail.

---

## 🔌 3. Pin-to-Pin Complete Wiring Table

Connect your jumper wires according to this exact mapping:

```
+-------------------+--------------------+------------------------+-------------------------------+
| COMPONENT         | COMPONENT PIN      | ESP32 PIN              | FUNCTION / NOTES              |
+-------------------+--------------------+------------------------+-------------------------------+
| MQ-135 (Air/CO2)  | VCC                | VIN (5V Rail)          | 5V Power for internal heater  |
|                   | GND                | GND (Ground Rail)      | Ground reference              |
|                   | A0 (Analog Out)    | GPIO 34 (D34)          | ADC1 Input                    |
+-------------------+--------------------+------------------------+-------------------------------+
| MQ-7 (CO Sensor)  | VCC                | VIN (5V Rail)          | 5V Power for internal heater  |
|                   | GND                | GND (Ground Rail)      | Ground reference              |
|                   | A0 (Analog Out)    | GPIO 35 (D35)          | ADC1 Input                    |
+-------------------+--------------------+------------------------+-------------------------------+
| GP2Y1010 Dust     | Pin 1 (V-LED)      | 150Ω Resistor to VIN   | IR LED Power                  |
| (6-Pin Harness)   | Pin 2 (LED-GND)    | GND                    | LED Ground                    |
|                   | Pin 3 (LED Pulse)  | GPIO 14 (D14)          | ESP32 pulses IR LED           |
|                   | Pin 4 (S-GND)      | GND                    | Sensor Ground                 |
|                   | Pin 5 (Vo Measure) | GPIO 32 (D32)          | Analog voltage output (ADC1)  |
|                   | Pin 6 (Vcc)        | VIN (5V Rail)          | 220µF cap between Pin 6 & GND |
+-------------------+--------------------+------------------------+-------------------------------+
| DHT22 (Climate)   | VCC / Pin 1        | 3V3 (3.3V Rail)        | Power                         |
|                   | DATA / Pin 2       | GPIO 4 (D4)            | Digital 1-Wire signal         |
|                   | GND / Pin 4        | GND                    | Ground (Pin 3 is unneeded)    |
+-------------------+--------------------+------------------------+-------------------------------+
| OLED (SSD1306)    | VCC                | 3V3 (3.3V Rail)        | Power                         |
| (0.96" I2C)       | GND                | GND                    | Ground                        |
|                   | SCL                | GPIO 22 (D22)          | I2C Clock Line                |
|                   | SDA                | GPIO 21 (D21)          | I2C Data Line                 |
+-------------------+--------------------+------------------------+-------------------------------+
| Active Buzzer     | Positive (+) / Long| GPIO 26 (D26)          | Trigger signal (HIGH = Sound) |
|                   | Negative (-) /Short| GND                    | Ground                        |
+-------------------+--------------------+------------------------+-------------------------------+
| RGB LED (Cathode) | Longest Pin (GND)  | GND                    | Common Cathode                |
|                   | Red Pin            | 220Ω -> GPIO 25 (D25)  | Red channel (Unhealthy/Hazard)|
|                   | Green Pin          | 220Ω -> GPIO 27 (D27)  | Green channel (Good/Safe)     |
|                   | Blue Pin           | 220Ω -> GPIO 12 (D12)  | Blue channel (Info/Diagnostic)|
+-------------------+--------------------+------------------------+-------------------------------+
```

---

## 💻 4. Step-by-Step Arduino IDE Setup

### Step 4.1: Install the USB-to-UART Driver
If your computer does not recognize the ESP32 when plugged into USB:
1. Check the chip next to the USB port on your ESP32 board (usually **CP2102** or **CH340**).
2. Download and install the appropriate driver:
   - **CP210x Driver**: [Silicon Labs CP210x Driver](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
   - **CH340 Driver**: [WCH CH340 Driver](http://www.wch-ic.com/downloads/CH341SER_ZIP.html)

### Step 4.2: Configure ESP32 in Arduino IDE
1. Open **Arduino IDE**.
2. Go to **File -> Preferences**.
3. In **Additional Board Manager URLs**, paste:
   ```text
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools -> Board -> Boards Manager**, search for `esp32` by *Espressif Systems*, and click **Install**.
5. Select your board under **Tools -> Board -> ESP32 Arduino -> DOIT ESP32 DEVKIT V1** (or *ESP32 Dev Module*).
6. Select your COM Port under **Tools -> Port** (e.g., `COM3`, `COM4`, or `COM5`).

### Step 4.3: Install Required Arduino Libraries
Go to **Tools -> Manage Libraries...** (or `Ctrl + Shift + I`) and install:
1. **Adafruit SSD1306** (by Adafruit) — *Click "Install All" when prompted to include Adafruit GFX*
2. **DHT sensor library** (by Adafruit) — *Click "Install All" to include Adafruit Unified Sensor*

### Step 4.4: Flash the Firmware
1. Open `ESP32_Air_Quality.ino` in Arduino IDE.
2. (Optional) If connecting to WiFi, enter your network name and password in lines 35-36:
   ```cpp
   const char* ssid     = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
   *(If you don't configure WiFi, the firmware automatically runs in autonomous USB Serial mode!)*
3. Click the **Upload** button (Right Arrow `->`).
4. *Tip:* If the console says `Connecting........____`, press and hold the **BOOT** button on your ESP32 for 2 seconds until the upload starts.

---

## 🌐 5. Connecting Hardware to the Web Dashboard

You have **two seamless ways** to stream live sensor data into `frontend_dashboard.html`:

### Option A: 1-Click USB Web Serial Connection (Recommended)
1. Keep the ESP32 plugged into your PC via the USB cable.
2. Open `frontend_dashboard.html` in **Google Chrome** or **Microsoft Edge**.
3. On the left sidebar or the "Node Config & Calib" page, click **"Connect USB ESP32"**.
4. A browser popup will appear. Select your **ESP32 COM Port** and click **Connect**.
5. **Done!** Telemetry streams live at 115200 baud with zero cloud latency.

### Option B: Local WiFi REST API
1. Open **Serial Monitor** in Arduino IDE (115200 baud) after boot.
2. Copy the ESP32 IP address shown in the log (e.g., `192.168.0.105`).
3. In `frontend_dashboard.html`, go to **Node Config & Calib**, enter the IP address, and click **Poll ESP32 REST Endpoint**.

---

## 🧪 6. Testing & Live Demonstration Checklist

1. **OLED Verification:** Observe the OLED screen. It should rotate every 3.5 seconds across 3 pages:
   - Page 1: Live EPA AQI & Status
   - Page 2: Edge ML 1h Forecast & Hazard Probability
   - Page 3: Real-time PM2.5, CO, CO2 & AI Mitigation Directive
2. **RGB LED & Buzzer Test:**
   - Under normal conditions, the RGB LED illuminates **Green (Safe)**.
   - If you blow smoke or increase pollutants using the dashboard demo slider above 150 AQI, the LED turns **Red** and the **Buzzer** sounds the hazard alert.
3. **Gemini AI Verification:**
   - On the web dashboard, open **Gemini Diagnostics** and click **Generate AI Health Assessment**.
   - Open **Mitigation Engine**, click **Lock Current As Baseline**, simulate purification, and click **Run Retest & Verify** to calculate mathematical percentage improvement!
