#include <WiFi.h>
#include <WebServer.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <DHT.h>

#define WHITE SH110X_WHITE
#define BLACK SH110X_BLACK

// ==============================================================================
// 1. PIN DEFINITIONS & HARDWARE CONSTANTS
// ==============================================================================
#define MQ135_PIN       34    // Analog Input (CO2 / VOCs) - ADC1_CH6
#define MQ7_PIN         35    // Analog Input (Carbon Monoxide) - ADC1_CH7
#define DUST_AOUT_PIN   32    // Analog Input (Dust Density Vo) - ADC1_CH4
#define DUST_ILED_PIN   14    // Digital Output (Sharp Dust Sensor IR LED)
#define DHT_PIN          4    // Digital Data (DHT22 Temperature & Humidity)
#define DHT_TYPE     DHT22

#define BUZZER_PIN      26    // Digital Output (Active Buzzer Alarm)
#define LED_RED_PIN     25    // Digital Output (RGB LED Red Channel)
#define LED_GREEN_PIN   27    // Digital Output (RGB LED Green Channel)
#define LED_BLUE_PIN    12    // Digital Output (RGB LED Blue Channel)
#define LED_ONBOARD_PIN  2    // Built-in Blue LED on ESP32 Dev Board

// OLED Display Parameters (1.3" I2C SH1106 / DST-013)
#define SCREEN_WIDTH   128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1
#define OLED_ADDRESS  0x3C
Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
DHT dht22(DHT_PIN, DHT22);
DHT dht11(DHT_PIN, DHT11);

// Web Server for Local IoT Telemetry API
WebServer server(80);

// ==============================================================================
// 2. NETWORK & FIREBASE CREDENTIALS
// ==============================================================================
const char* ssid       = "IoT Lab";
const char* password   = "bubt1234";
bool wifiConnected     = false;

// 🔥 FIREBASE REALTIME DATABASE URL (No trailing slash, no 'https://')
// Automatically inferred from your Firebase SDK config
const String firebaseHost = "air-guardian-8ef1e-default-rtdb.asia-southeast1.firebasedatabase.app";
unsigned long lastFirebaseUpdate = 0;
const unsigned long FIREBASE_INTERVAL = 3000; // Push to cloud every 3 seconds

// ==============================================================================
// 3. HARDWARE CONTROL OVERRIDES & STATE
// ==============================================================================
bool oledPoweredOn     = true;
bool oledAutoScroll    = true;
bool buzzerManualState = false;
bool buzzerManualMode  = false; // true = controlled by web, false = controlled by ML
String ledOverrideMode = "auto"; // "auto", "manual", "red", "green", "blue", "off"
bool ledCommonAnode    = false; // true = Common Anode (active LOW), false = Common Cathode (active HIGH)
bool manualRedPinState   = false;
bool manualGreenPinState = false;
bool manualBluePinState  = false;
float dustOffsetVoltage = 0.5f;  // Tare calibration offset
int lockOLEDPage        = -1;    // -1 = auto rotate, 0=Page1, 1=Page2, 2=Page3

// Raw Hardware Diagnostics
int   liveRawDustADC   = 0;
float liveDustVolt     = 0.0f;
int   liveRawMQ135     = 0;
float liveMQ135Volt    = 0.0f;
int   liveRawMQ7       = 0;
float liveMQ7Volt      = 0.0f;
bool  liveDHT_OK       = true;

// Sensor filtering constants
#define NUM_SAMPLES 10
float sampleBufferPM25[NUM_SAMPLES] = {0};
float sampleBufferCO[NUM_SAMPLES]   = {0};
float sampleBufferCO2[NUM_SAMPLES]  = {0};
int sampleIndex = 0;

// Filtered live values
float liveTempC    = 25.0;
float liveHumidity = 55.0;
float livePM25     = 35.0;    // ug/m3
float liveCO_ppm   = 1.5;     // ppm
float liveCO2_ppm  = 650.0;   // ppm
int   liveAQI      = 50;      // Official EPA AQI

// Edge ML predictions
float mlFutureAQI  = 50.0;
float mlHazardProb = 0.05;    // 0.0 to 1.0 (Logistic Regression)
int   mlRiskClass  = 0;       // 0=Good, 1=Moderate, 2=Unhealthy, 3=Hazardous

// Display rotation timer
unsigned long lastDisplaySwitch = 0;
int currentOLEDPage = 0;
unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 1500; // ms

// ==============================================================================
// 4. EDGE ML MODEL CONSTANTS & EQUATIONS (Trained on Bangladesh Dataset)
// ==============================================================================
const float PM25_MIN  = 0.40f;
const float PM25_MAX  = 302.70f;
const float CO_MIN    = 104.00f;
const float CO_MAX    = 3650.00f;
const float TEMP_MIN  = 15.00f;
const float TEMP_MAX  = 35.00f;
const float HUMID_MIN = 40.00f;
const float HUMID_MAX = 95.00f;

// --- MODEL 1: LINEAR REGRESSION (Predicts 1-Hour Future AQI) ---
float predictFutureAQI(float raw_pm25, float raw_co, float raw_temp, float raw_humid) {
    float s_pm25  = constrain((raw_pm25 - PM25_MIN)   / (PM25_MAX - PM25_MIN), 0.0f, 1.0f);
    float s_co    = constrain((raw_co - CO_MIN)       / (CO_MAX - CO_MIN),     0.0f, 1.0f);
    float s_temp  = constrain((raw_temp - TEMP_MIN)   / (TEMP_MAX - TEMP_MIN), 0.0f, 1.0f);
    float s_humid = constrain((raw_humid - HUMID_MIN) / (HUMID_MAX - HUMID_MIN), 0.0f, 1.0f);

    float future_aqi = (284.2261f * s_pm25) + 
                       (82.0077f  * s_co) + 
                       (0.0337f   * s_temp) + 
                       (-0.0661f  * s_humid) + 
                       (59.7454f);
    return max(0.0f, future_aqi);
}

// --- MODEL 2: LOGISTIC REGRESSION (Binary Emergency Hazard Probability) ---
float predictHazardProbability(float raw_pm25, float raw_co, float raw_temp, float raw_humid) {
    float s_pm25  = constrain((raw_pm25 - PM25_MIN)   / (PM25_MAX - PM25_MIN), 0.0f, 1.0f);
    float s_co    = constrain((raw_co - CO_MIN)       / (CO_MAX - CO_MIN),     0.0f, 1.0f);
    float s_temp  = constrain((raw_temp - TEMP_MIN)   / (TEMP_MAX - TEMP_MIN), 0.0f, 1.0f);
    float s_humid = constrain((raw_humid - HUMID_MIN) / (HUMID_MAX - HUMID_MIN), 0.0f, 1.0f);

    float z = (23.5640f * s_pm25) + (-0.3901f * s_co) + (-0.0083f * s_temp) + (-0.0110f * s_humid) - 4.4767f;
    float prob = 1.0f / (1.0f + exp(-z)); // Sigmoid activation
    return constrain(prob, 0.0f, 1.0f);
}

// --- MODEL 3: DECISION TREE CLASSIFIER (Health Risk Level) ---
int predictRiskCategory(float raw_pm25, float raw_co) {
    float s_pm25 = constrain((raw_pm25 - PM25_MIN) / (PM25_MAX - PM25_MIN), 0.0f, 1.0f);
    float s_co   = constrain((raw_co - CO_MIN)     / (CO_MAX - CO_MIN),     0.0f, 1.0f);

    if (s_pm25 <= 0.11f) {
        if (s_pm25 <= 0.03f) {
            return 0; // Good
        } else {
            return 1; // Moderate
        }
    } else {
        if (s_pm25 <= 0.15f) {
            if (s_co <= 0.05f) {
                return 1; // Moderate
            } else {
                return 2; // Unhealthy
            }
        } else {
            if (s_pm25 <= 0.62f) {
                return 2; // Unhealthy
            } else {
                return 3; // Hazardous
            }
        }
    }
}

// ==============================================================================
// 5. STANDARD US EPA AQI CONVERSION FOR PM2.5
// ==============================================================================
int calculateAQI_PM25(float pm) {
    if (pm <= 12.0f)   return (int)(((50 - 0)    / (12.0f - 0.0f))   * (pm - 0.0f)   + 0);
    if (pm <= 35.4f)   return (int)(((100 - 51)  / (35.4f - 12.1f))  * (pm - 12.1f)  + 51);
    if (pm <= 55.4f)   return (int)(((150 - 101) / (55.4f - 35.5f))  * (pm - 35.5f)  + 101);
    if (pm <= 150.4f)  return (int)(((200 - 151) / (150.4f - 55.5f)) * (pm - 55.5f)  + 151);
    if (pm <= 250.4f)  return (int)(((300 - 201) / (250.4f - 150.5f))* (pm - 150.5f) + 201);
    if (pm <= 350.4f)  return (int)(((400 - 301) / (350.4f - 250.5f))* (pm - 250.5f) + 301);
    if (pm <= 500.4f)  return (int)(((500 - 401) / (500.4f - 350.5f))* (pm - 350.5f) + 401);
    return 500;
}

// ==============================================================================
// 6. ACTUATOR & HARDWARE CONTROL
// ==============================================================================
void writeLEDPin(int pin, bool state) {
    bool level = ledCommonAnode ? !state : state;
    digitalWrite(pin, level ? HIGH : LOW);
    if (pin == LED_RED_PIN)   digitalWrite(18, level ? HIGH : LOW);
    if (pin == LED_GREEN_PIN) digitalWrite(19, level ? HIGH : LOW);
    if (pin == LED_BLUE_PIN)  digitalWrite(23, level ? HIGH : LOW);
}

void setRGBStatus(int riskClass) {
    if (ledOverrideMode == "manual") {
        writeLEDPin(LED_RED_PIN, manualRedPinState);
        writeLEDPin(LED_GREEN_PIN, manualGreenPinState);
        writeLEDPin(LED_BLUE_PIN, manualBluePinState);
        return;
    }
    if (ledOverrideMode == "off") {
        writeLEDPin(LED_RED_PIN, false);
        writeLEDPin(LED_GREEN_PIN, false);
        writeLEDPin(LED_BLUE_PIN, false);
        return;
    }
    if (ledOverrideMode == "red") {
        writeLEDPin(LED_RED_PIN, true);
        writeLEDPin(LED_GREEN_PIN, false);
        writeLEDPin(LED_BLUE_PIN, false);
        return;
    }
    if (ledOverrideMode == "green") {
        writeLEDPin(LED_RED_PIN, false);
        writeLEDPin(LED_GREEN_PIN, true);
        writeLEDPin(LED_BLUE_PIN, false);
        return;
    }
    if (ledOverrideMode == "blue") {
        writeLEDPin(LED_RED_PIN, false);
        writeLEDPin(LED_GREEN_PIN, false);
        writeLEDPin(LED_BLUE_PIN, true);
        return;
    }

    // Auto Mode (Driven by Edge Decision Tree)
    switch(riskClass) {
        case 0: // Good: Solid Green
            writeLEDPin(LED_RED_PIN, false);
            writeLEDPin(LED_GREEN_PIN, true);
            writeLEDPin(LED_BLUE_PIN, false);
            break;
        case 1: // Moderate: Yellow (Red + Green)
            writeLEDPin(LED_RED_PIN, true);
            writeLEDPin(LED_GREEN_PIN, true);
            writeLEDPin(LED_BLUE_PIN, false);
            break;
        case 2: // Unhealthy: Solid Red
            writeLEDPin(LED_RED_PIN, true);
            writeLEDPin(LED_GREEN_PIN, false);
            writeLEDPin(LED_BLUE_PIN, false);
            break;
        case 3: // Hazardous: Magenta/Purple (Red + Blue)
            writeLEDPin(LED_RED_PIN, true);
            writeLEDPin(LED_GREEN_PIN, false);
            writeLEDPin(LED_BLUE_PIN, true);
            break;
    }
}

void updateActuators(int riskClass, float hazardProb, int aqi) {
    setRGBStatus(riskClass);

    if (buzzerManualMode) {
        digitalWrite(BUZZER_PIN, buzzerManualState ? HIGH : LOW);
    } else {
        // Edge AI Auto Buzzer trigger (High hazard probability or severe AQI)
        if (hazardProb >= 0.85f || aqi >= 250) {
            digitalWrite(BUZZER_PIN, HIGH);
        } else {
            digitalWrite(BUZZER_PIN, LOW);
        }
    }
}

// ==============================================================================
// 7. OLED DISPLAY MULTI-PAGE CAROUSEL
// ==============================================================================
void drawOLEDCarousel() {
    if (!oledPoweredOn) {
        display.clearDisplay();
        display.display();
        return;
    }

    display.clearDisplay();
    display.setTextColor(WHITE);

    // Header bar
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("Smart Air Node");
    display.setCursor(84, 0);
    if (wifiConnected) display.print("[WiFi]");
    else display.print("[USB]");
    display.drawLine(0, 9, 127, 9, WHITE);

    int activePage = currentOLEDPage;

    if (activePage == 0) {
        // --- PAGE 1: REAL-TIME AQI & EPA STATUS ---
        display.setCursor(0, 14);
        display.print("LIVE EPA AQI: ");
        display.setTextSize(2);
        display.setCursor(0, 26);
        display.print((int)liveAQI);

        display.setTextSize(1);
        display.setCursor(55, 26);
        if (liveAQI <= 50)       display.print("[GOOD]");
        else if (liveAQI <= 100) display.print("[MODERATE]");
        else if (liveAQI <= 150) display.print("[SENSITIVE]");
        else if (liveAQI <= 200) display.print("[UNHEALTHY]");
        else                     display.print("[HAZARDOUS]");

        display.setCursor(0, 52);
        display.print("T:");
        display.print(liveTempC, 1);
        display.print("C  H:");
        display.print((int)liveHumidity);
        display.print("%");
    }
    else if (activePage == 1) {
        // --- PAGE 2: EDGE ML INTELLIGENCE & FORECAST ---
        display.setCursor(0, 14);
        display.print("EDGE ML INTELLIGENCE");
        
        display.setCursor(0, 26);
        display.print("1h Forecast: ");
        display.print(mlFutureAQI, 1);
        display.print(" AQI");

        display.setCursor(0, 38);
        display.print("Hazard Prob: ");
        display.print((int)(mlHazardProb * 100.0));
        display.print("%");

        display.setCursor(0, 50);
        display.print("Tree Risk: Class ");
        display.print(mlRiskClass);
        if (mlRiskClass == 0) display.print(" (Safe)");
        else if (mlRiskClass == 1) display.print(" (Warn)");
        else display.print(" (Danger)");
    }
    else if (activePage == 2) {
        // --- PAGE 3: DETAILED GAS METRICS & MITIGATION ---
        display.setCursor(0, 13);
        display.print("PM2.5: ");
        display.print(livePM25, 1);
        display.print(" ug/m3");

        display.setCursor(0, 25);
        display.print("CO:    ");
        display.print(liveCO_ppm, 2);
        display.print(" ppm");

        display.setCursor(0, 37);
        display.print("CO2:   ");
        display.print((int)liveCO2_ppm);
        display.print(" ppm");

        display.drawLine(0, 48, 127, 48, WHITE);
        display.setCursor(0, 52);
        if (liveAQI > 150) display.print("ACTION: PURIFIER ON");
        else if (liveAQI > 100) display.print("ACTION: CLOSE WINDOW");
        else display.print("ACTION: AIR SAFE");
    }

    display.display();
}

// ==============================================================================
// 8. BIDIRECTIONAL COMMAND PARSER (Web Serial & HTTP)
// ==============================================================================
void handleCommand(String cmdStr) {
    cmdStr.trim();
    if (cmdStr.length() == 0) return;

    Serial.print("{\"ack\":\"cmd_received\",\"cmd\":\"" + cmdStr + "\"}");
    Serial.println();

    // Buzzer Control
    if (cmdStr.indexOf("buzzer_on") >= 0 || cmdStr.indexOf("\"cmd\":\"buzzer\",\"state\":true") >= 0 || cmdStr.indexOf("\"cmd\":\"test_buzzer\"") >= 0) {
        buzzerManualMode = true;
        buzzerManualState = true;
        digitalWrite(BUZZER_PIN, HIGH);
    } 
    else if (cmdStr.indexOf("buzzer_off") >= 0 || cmdStr.indexOf("\"cmd\":\"buzzer\",\"state\":false") >= 0) {
        buzzerManualMode = true;
        buzzerManualState = false;
        digitalWrite(BUZZER_PIN, LOW);
    }
    else if (cmdStr.indexOf("buzzer_pulse") >= 0) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(200);
        digitalWrite(BUZZER_PIN, LOW);
    }
    else if (cmdStr.indexOf("buzzer_auto") >= 0) {
        buzzerManualMode = false;
    }
    // OLED Control
    else if (cmdStr.indexOf("oled_on") >= 0 || cmdStr.indexOf("\"cmd\":\"oled_power\",\"state\":true") >= 0) {
        oledPoweredOn = true;
        drawOLEDCarousel();
    }
    else if (cmdStr.indexOf("oled_off") >= 0 || cmdStr.indexOf("\"cmd\":\"oled_power\",\"state\":false") >= 0) {
        oledPoweredOn = false;
        drawOLEDCarousel();
    }
    else if (cmdStr.indexOf("set_page") >= 0 || cmdStr.indexOf("\"cmd\":\"set_page\"") >= 0) {
        oledPoweredOn = true;
        if (cmdStr.indexOf("set_page_0") >= 0 || cmdStr.indexOf("\"page\":0") >= 0) {
            oledAutoScroll = true;
        } else {
            oledAutoScroll = false;
            if (cmdStr.indexOf("set_page_1") >= 0 || cmdStr.indexOf("\"page\":1") >= 0) currentOLEDPage = 0; // Assuming 0-indexed internally
            else if (cmdStr.indexOf("set_page_2") >= 0 || cmdStr.indexOf("\"page\":2") >= 0) currentOLEDPage = 1;
            else if (cmdStr.indexOf("set_page_3") >= 0 || cmdStr.indexOf("\"page\":3") >= 0) currentOLEDPage = 2;
        }
        lastDisplaySwitch = millis();
        drawOLEDCarousel();
    }
    // Individual Pin Self-Tests
    else if (cmdStr.indexOf("test_red_on") >= 0) {
        ledOverrideMode = "manual";
        manualRedPinState = true;
        setRGBStatus(mlRiskClass);
    }
    else if (cmdStr.indexOf("test_red_off") >= 0) {
        ledOverrideMode = "manual";
        manualRedPinState = false;
        setRGBStatus(mlRiskClass);
    }
    else if (cmdStr.indexOf("test_green_on") >= 0) {
        ledOverrideMode = "manual";
        manualGreenPinState = true;
        setRGBStatus(mlRiskClass);
    }
    else if (cmdStr.indexOf("test_green_off") >= 0) {
        ledOverrideMode = "manual";
        manualGreenPinState = false;
        setRGBStatus(mlRiskClass);
    }
    else if (cmdStr.indexOf("test_blue_on") >= 0) {
        ledOverrideMode = "manual";
        manualBluePinState = true;
        setRGBStatus(mlRiskClass);
    }
    else if (cmdStr.indexOf("test_blue_off") >= 0) {
        ledOverrideMode = "manual";
        manualBluePinState = false;
        setRGBStatus(mlRiskClass);
    }
    else if (cmdStr.indexOf("test_onboard_on") >= 0) {
        digitalWrite(LED_ONBOARD_PIN, HIGH);
    }
    else if (cmdStr.indexOf("test_onboard_off") >= 0) {
        digitalWrite(LED_ONBOARD_PIN, LOW);
    }
    else if (cmdStr.indexOf("test_all_on") >= 0) {
        ledOverrideMode = "manual";
        manualRedPinState = true;
        manualGreenPinState = true;
        manualBluePinState = true;
        digitalWrite(LED_ONBOARD_PIN, HIGH);
        setRGBStatus(mlRiskClass);
    }
    // LED Polarity Control
    else if (cmdStr.indexOf("led_anode") >= 0 || cmdStr.indexOf("\"polarity\":\"anode\"") >= 0) {
        ledCommonAnode = true;
        setRGBStatus(mlRiskClass);
    }
    else if (cmdStr.indexOf("led_cathode") >= 0 || cmdStr.indexOf("\"polarity\":\"cathode\"") >= 0) {
        ledCommonAnode = false;
        setRGBStatus(mlRiskClass);
    }
    // General LED Modes
    else if (cmdStr.indexOf("led_red") >= 0 || cmdStr.indexOf("red") >= 0) {
        ledOverrideMode = "red";
        setRGBStatus(2);
    }
    else if (cmdStr.indexOf("led_green") >= 0 || cmdStr.indexOf("green") >= 0) {
        ledOverrideMode = "green";
        setRGBStatus(0);
    }
    else if (cmdStr.indexOf("led_blue") >= 0 || cmdStr.indexOf("blue") >= 0) {
        ledOverrideMode = "blue";
        setRGBStatus(3);
    }
    else if (cmdStr.indexOf("led_off") >= 0 || cmdStr.indexOf("off") >= 0) {
        ledOverrideMode = "off";
        setRGBStatus(0);
    }
    else if (cmdStr.indexOf("led_auto") >= 0 || cmdStr.indexOf("auto") >= 0) {
        ledOverrideMode = "auto";
        setRGBStatus(mlRiskClass);
    }
    // Tare PM2.5 Calibration
    else if (cmdStr.indexOf("tare_pm25") >= 0 || cmdStr.indexOf("\"cmd\":\"tare_pm25\"") >= 0) {
        int raw = analogRead(DUST_AOUT_PIN);
        dustOffsetVoltage = (raw * 3.3f) / 4095.0f;
    }
    // Soft MCU Reboot
    else if (cmdStr.indexOf("reboot") >= 0 || cmdStr.indexOf("\"cmd\":\"reboot\"") >= 0) {
        Serial.println("{\"msg\":\"Rebooting ESP32...\"}");
        delay(300);
        ESP.restart();
    }
}

// ==============================================================================
// 9. WEB SERVER REST API HANDLERS
// ==============================================================================
void handleRoot() {
    String html = "<!DOCTYPE html><html><head><title>Smart Air Monitor Node</title></head>";
    html += "<body style='font-family:sans-serif; background:#0f172a; color:#f8fafc; padding:2rem;'>";
    html += "<h2>Smart Air Quality & Health Risk Monitoring System</h2>";
    html += "<p>Telemetry REST Endpoint: <a style='color:#38bdf8;' href='/api/data'>/api/data</a></p>";
    html += "<p>Command Endpoint: <code>/api/cmd?action=buzzer&state=1</code></p>";
    html += "</body></html>";
    server.send(200, "text/html", html);
}

void handleApiData() {
    String json = "{";
    json += "\"aqi\":" + String(liveAQI) + ",";
    json += "\"pm25\":" + String(livePM25, 2) + ",";
    json += "\"co_ppm\":" + String(liveCO_ppm, 2) + ",";
    json += "\"co2_ppm\":" + String(liveCO2_ppm, 0) + ",";
    json += "\"temp_c\":" + String(liveTempC, 1) + ",";
    json += "\"humidity\":" + String(liveHumidity, 1) + ",";
    json += "\"future_aqi\":" + String(mlFutureAQI, 2) + ",";
    json += "\"hazard_prob\":" + String(mlHazardProb * 100.0, 1) + ",";
    json += "\"risk_class\":" + String(mlRiskClass) + ",";
    json += "\"oled_power\":" + String(oledPoweredOn ? "true" : "false") + ",";
    json += "\"buzzer\":" + String(buzzerManualState ? "true" : "false") + ",";
    json += "\"led_mode\":\"" + ledOverrideMode + "\"";
    json += "}";
    
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", json);
}

void handleApiCmd() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    if (server.hasArg("action")) {
        String act = server.arg("action");
        String val = server.hasArg("val") ? server.arg("val") : "";
        handleCommand(act + "_" + val);
        server.send(200, "application/json", "{\"status\":\"ok\",\"action\":\"" + act + "\"}");
    } else {
        server.send(400, "application/json", "{\"error\":\"missing action param\"}");
    }
}

// ==============================================================================
// 10. SETUP INITIALIZATION
// ==============================================================================
void setup() {
    Serial.begin(115200);
    delay(500);

    // Initialize Actuator Pins (Primary 25, 27, 12 and Mirrored 18, 19, 23)
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_RED_PIN, OUTPUT);
    pinMode(LED_GREEN_PIN, OUTPUT);
    pinMode(LED_BLUE_PIN, OUTPUT);
    pinMode(18, OUTPUT);
    pinMode(19, OUTPUT);
    pinMode(23, OUTPUT);
    pinMode(LED_ONBOARD_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);

    // Initial Flash Onboard Blue LED
    digitalWrite(LED_ONBOARD_PIN, HIGH);
    delay(150);
    digitalWrite(LED_ONBOARD_PIN, LOW);

    // Initial RGB Self-Test Sequence (Red -> Green -> Blue)
    writeLEDPin(LED_RED_PIN, true); writeLEDPin(LED_GREEN_PIN, false); writeLEDPin(LED_BLUE_PIN, false);
    delay(250);
    writeLEDPin(LED_RED_PIN, false); writeLEDPin(LED_GREEN_PIN, true); writeLEDPin(LED_BLUE_PIN, false);
    delay(250);
    writeLEDPin(LED_RED_PIN, false); writeLEDPin(LED_GREEN_PIN, false); writeLEDPin(LED_BLUE_PIN, true);
    delay(250);
    writeLEDPin(LED_RED_PIN, false); writeLEDPin(LED_GREEN_PIN, false); writeLEDPin(LED_BLUE_PIN, false);

    // Initialize Sensor Pins
    pinMode(DUST_ILED_PIN, OUTPUT);
    digitalWrite(DUST_ILED_PIN, HIGH); // Default HIGH (IR LED OFF)
    pinMode(DUST_AOUT_PIN, INPUT);
    pinMode(MQ135_PIN, INPUT);
    pinMode(MQ7_PIN, INPUT);

    // Initialize DHT Sensor (Dual Auto-Detection)
    dht22.begin();
    dht11.begin();

    // Initialize I2C Bus for ESP32
    Wire.begin(21, 22);

    // Initialize OLED Display (SH1106 1.3" DST-013)
    if(!display.begin(OLED_ADDRESS, true)) {
        Serial.println("[ERROR] SH1106 allocation failed! Check I2C SDA/SCL pins.");
    } else {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SH110X_WHITE);
        display.setCursor(16, 20);
        display.print("Smart Air Node");
        display.setCursor(20, 36);
        display.print("Edge AI Online");
        display.display();
        delay(1200);
    }

    // Attempt WiFi Connection
    WiFi.mode(WIFI_STA);
    if (String(ssid) != "YOUR_WIFI_SSID" && String(ssid).length() > 0) {
        WiFi.begin(ssid, password);
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 15) {
            delay(500);
            attempts++;
        }
        if (WiFi.status() == WL_CONNECTED) {
            wifiConnected = true;
            Serial.print("[WiFi] Connected! IP Address: ");
            Serial.println(WiFi.localIP());
        } else {
            Serial.println("[WiFi] Connection timeout. Running in standalone USB Serial mode.");
        }
    }

    // Configure Web Server
    server.on("/", handleRoot);
    server.on("/api/data", handleApiData);
    server.on("/api/cmd", handleApiCmd);
    server.begin();

    // Startup confirmation beep
    digitalWrite(BUZZER_PIN, HIGH);
    delay(80);
    digitalWrite(BUZZER_PIN, LOW);
    setRGBStatus(0); // Solid Green

    Serial.println("[BOOT] Smart Air Quality System Initialized. C2 & Edge ML Online.");
}

// ==============================================================================
// 10.5 FIREBASE CLOUD SYNC ENGINE (DEPENDENCY FREE)
// ==============================================================================
long lastFirebaseCmdCheck = 0;
String lastExecutedTimestamp = "";

void handleFirebaseSync() {
    if (!wifiConnected || firebaseHost.indexOf("YOUR_FIREBASE") >= 0) return;

    unsigned long currentMillis = millis();
    
    // 1. Push Telemetry every 3 seconds
    if (currentMillis - lastFirebaseUpdate >= FIREBASE_INTERVAL) {
        lastFirebaseUpdate = currentMillis;
        WiFiClientSecure client;
        client.setInsecure(); // Required for ESP32 to connect to HTTPS without a certificate
        HTTPClient http;
        String url = "https://" + firebaseHost + "/telemetry.json";
        http.begin(client, url);
        http.addHeader("Content-Type", "application/json");
        
        String payload = "{";
        payload += "\"aqi\":" + String(liveAQI) + ",";
        payload += "\"pm25\":" + String(livePM25, 1) + ",";
        payload += "\"co\":" + String(liveCO_ppm, 2) + ",";
        payload += "\"co2\":" + String(liveCO2_ppm, 0) + ",";
        payload += "\"temp\":" + String(liveTempC, 1) + ",";
        payload += "\"humidity\":" + String(liveHumidity, 1) + ",";
        payload += "\"future_aqi\":" + String(mlFutureAQI, 1);
        payload += "}";
        
        int httpCode = http.PUT(payload);
        if (httpCode == HTTP_CODE_OK) {
            Serial.println("[FIREBASE] Telemetry Sync OK");
        } else {
            Serial.printf("[FIREBASE] Telemetry Sync Failed, code: %d\n", httpCode);
            String response = http.getString();
            Serial.println("Response: " + response);
        }
        http.end();
        
        // Update presence (Online status)
        http.begin(client, "https://" + firebaseHost + "/status/online.json");
        http.addHeader("Content-Type", "application/json");
        http.PUT("true");
        http.end();
    }
    
    // 2. Poll for incoming Cloud Commands every 1.5 seconds
    if (currentMillis - lastFirebaseCmdCheck >= 1500) {
        lastFirebaseCmdCheck = currentMillis;
        WiFiClientSecure client;
        client.setInsecure();
        HTTPClient http;
        String url = "https://" + firebaseHost + "/commands/lastCommand.json";
        http.begin(client, url);
        int httpCode = http.GET();
        if (httpCode == HTTP_CODE_OK) {
            String response = http.getString();
            if (response != "null" && response.length() > 5) {
                // Manual JSON Parsing to avoid needing ArduinoJson library
                int cmdStart = response.indexOf("\"cmd\":\"");
                if (cmdStart != -1) {
                    cmdStart += 7;
                    int cmdEnd = response.indexOf("\"", cmdStart);
                    if (cmdEnd != -1) {
                        String cmd = response.substring(cmdStart, cmdEnd);
                        
                        // Parse timestamp as String to prevent 32-bit integer overflow from JS Date.now()
                        int tsStart = response.indexOf("\"timestamp\":");
                        String tsStr = "";
                        if (tsStart != -1) {
                            tsStart += 12;
                            int tsEnd = response.indexOf("}", tsStart);
                            if (tsEnd == -1) tsEnd = response.indexOf(",", tsStart);
                            if (tsEnd != -1) tsStr = response.substring(tsStart, tsEnd);
                        }
                        
                        if (tsStr != "" && tsStr != lastExecutedTimestamp) {
                            // Only execute if lastExecutedTimestamp is not empty (which protects boot state)
                            if (lastExecutedTimestamp != "") {
                                Serial.println("[FIREBASE CMD] " + cmd);
                                handleCommand(cmd); // Execute the command exactly as if sent via USB
                            }
                            lastExecutedTimestamp = tsStr;
                        }
                    }
                }
            }
        }
        http.end();
    }
}

// ==============================================================================
// 11. MAIN SYSTEM LOOP
// ==============================================================================
void loop() {
    server.handleClient();
    handleFirebaseSync(); // <-- FIREBASE CLOUD SYNC CALL

    // Read Serial incoming commands from Web Dashboard
    if (Serial.available() > 0) {
        String incoming = Serial.readStringUntil('\n');
        handleCommand(incoming);
    }

    unsigned long currentMillis = millis();

    // --- SENSOR ACQUISITION & INFERENCE CYCLE (Every 1.5 Seconds) ---
    if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
        lastSensorRead = currentMillis;

        // 1. Read DHT Sensor (Auto-detects both DHT22 and DHT11)
        float t = dht22.readTemperature();
        float h = dht22.readHumidity();
        if (isnan(t) || isnan(h)) {
            // Attempt fallback to DHT11 protocol
            t = dht11.readTemperature();
            h = dht11.readHumidity();
        }
        if (!isnan(t) && !isnan(h)) {
            liveTempC = t;
            liveHumidity = h;
            liveDHT_OK = true;
        } else {
            liveDHT_OK = false;
        }

        // 2. Read Sharp GP2Y1010 Optical Dust Sensor (8-Pulse Oversampling)
        long dustSum = 0;
        for (int i = 0; i < 8; i++) {
            digitalWrite(DUST_ILED_PIN, LOW); // Turn on IR LED
            delayMicroseconds(280);
            dustSum += analogRead(DUST_AOUT_PIN);
            delayMicroseconds(40);
            digitalWrite(DUST_ILED_PIN, HIGH); // Turn off IR LED
            delayMicroseconds(1000);
        }
        liveRawDustADC = dustSum / 8;
        liveDustVolt = (liveRawDustADC * 3.3f) / 4095.0f;
        
        float calculatedPM25 = 0.0f;
        if (liveDustVolt > 0.45f) {
            calculatedPM25 = (liveDustVolt - 0.45f) * 170.0f;
        } else {
            calculatedPM25 = (liveRawDustADC / 4095.0f) * 12.0f; // Clean baseline (0 - 12 ug/m3)
        }

        // 3. Read Gas Sensors with 24-Sample Hardware Oversampling (Eliminate ADC Noise)
        long sumMQ135 = 0;
        long sumMQ7 = 0;
        for (int i = 0; i < 24; i++) {
            sumMQ135 += analogRead(MQ135_PIN);
            sumMQ7   += analogRead(MQ7_PIN);
            delayMicroseconds(250);
        }
        liveRawMQ135 = sumMQ135 / 24;
        liveRawMQ7   = sumMQ7 / 24;
        liveMQ135Volt = (liveRawMQ135 * 3.3f) / 4095.0f;
        liveMQ7Volt   = (liveRawMQ7 * 3.3f) / 4095.0f;

        float calculatedCO2 = map(liveRawMQ135, 0, 4095, 400, 3000);
        float calculatedCO  = (liveRawMQ7 / 4095.0f) * 25.0f;

        // 4. Commercial-Grade Exponential Stabilization (Rock-solid readings, zero jitter)
        if (livePM25 <= 0.1f) livePM25 = calculatedPM25;
        else livePM25 = (livePM25 * 0.85f) + (calculatedPM25 * 0.15f);

        if (liveCO_ppm <= 0.01f) liveCO_ppm = calculatedCO;
        else liveCO_ppm = (liveCO_ppm * 0.85f) + (calculatedCO * 0.15f);

        if (liveCO2_ppm <= 10.0f) liveCO2_ppm = calculatedCO2;
        else liveCO2_ppm = (liveCO2_ppm * 0.85f) + (calculatedCO2 * 0.15f);

        // 5. Multi-Pollutant AQI (Reacts to PM2.5, Breath CO2, and CO Gas)
        int aqi_pm = calculateAQI_PM25(livePM25);
        int aqi_co2 = 25;
        if (liveCO2_ppm > 500) {
            aqi_co2 = map(constrain((long)liveCO2_ppm, 500, 2500), 500, 2500, 30, 180);
        }
        int aqi_co = 25;
        if (liveCO_ppm > 1.0f) {
            aqi_co = map(constrain((long)(liveCO_ppm * 10), 10, 150), 10, 150, 35, 200);
        }
        liveAQI = max(aqi_pm, max(aqi_co2, aqi_co));
        if (liveAQI < 20) liveAQI = 25; // Baseline Good Air

        // 6. Execute Edge ML Inference
        float coModelInput = liveRawMQ7;
        mlFutureAQI  = predictFutureAQI(livePM25, coModelInput, liveTempC, liveHumidity);
        mlHazardProb = predictHazardProbability(livePM25, coModelInput, liveTempC, liveHumidity);
        mlRiskClass  = predictRiskCategory(livePM25, coModelInput);

        // 7. Update Hardware Actuators
        updateActuators(mlRiskClass, mlHazardProb, liveAQI);

        // 8. Continuous Live OLED Display Update (Every 1.5s cycle)
        drawOLEDCarousel();

        // 9. Stream Real-Time JSON Telemetry with Raw Diagnostics to Serial
        Serial.print("{\"aqi\":");
        Serial.print(liveAQI);
        Serial.print(",\"pm25\":");
        Serial.print(livePM25, 1);
        Serial.print(",\"co\":");
        Serial.print(liveCO_ppm, 2);
        Serial.print(",\"co2\":");
        Serial.print(liveCO2_ppm, 0);
        Serial.print(",\"temp\":");
        Serial.print(liveTempC, 1);
        Serial.print(",\"humid\":");
        Serial.print(liveHumidity, 1);
        Serial.print(",\"future_aqi\":");
        Serial.print(mlFutureAQI, 1);
        Serial.print(",\"hazard_prob\":");
        Serial.print(mlHazardProb * 100.0, 1);
        Serial.print(",\"risk_class\":");
        Serial.print(mlRiskClass);
        Serial.print(",\"dht_ok\":");
        Serial.print(liveDHT_OK ? "true" : "false");
        Serial.print(",\"raw_pm_adc\":");
        Serial.print(liveRawDustADC);
        Serial.print(",\"raw_pm_v\":");
        Serial.print(liveDustVolt, 2);
        Serial.print(",\"raw_mq135_adc\":");
        Serial.print(liveRawMQ135);
        Serial.print(",\"raw_mq135_v\":");
        Serial.print(liveMQ135Volt, 2);
        Serial.print(",\"raw_mq7_adc\":");
        Serial.print(liveRawMQ7);
        Serial.print(",\"raw_mq7_v\":");
        Serial.print(liveMQ7Volt, 2);
        Serial.print(",\"led_mode\":\"");
        Serial.print(ledOverrideMode);
        Serial.print("\",\"led_anode\":");
        Serial.print(ledCommonAnode ? "true" : "false");
        Serial.print(",\"free_heap\":");
        Serial.print(ESP.getFreeHeap());
        Serial.print(",\"uptime_s\":");
        Serial.print(millis() / 1000);
        Serial.print(",\"cpu_mhz\":");
        Serial.print(ESP.getCpuFreqMHz());
        Serial.println("}");
    }

    // --- OLED AUTOMATIC PAGE ROTATION (Rotates Every 3.0 Seconds Non-Stop) ---
    if (oledAutoScroll && currentMillis - lastDisplaySwitch >= 3000) {
        lastDisplaySwitch = currentMillis;
        currentOLEDPage = (currentOLEDPage + 1) % 3;
        drawOLEDCarousel();
    }
}
