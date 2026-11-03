#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

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

// OLED Display Parameters (0.96" I2C SSD1306)
#define SCREEN_WIDTH   128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1
#define OLED_ADDRESS  0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
DHT dht(DHT_PIN, DHT_TYPE);

// Web Server for Local IoT Telemetry API
WebServer server(80);

// ==============================================================================
// 2. NETWORK CREDENTIALS (Update or leave empty for offline mode)
// ==============================================================================
const char* ssid     = "Tasin";
const char* password = "01841411474";
bool wifiConnected   = false;

// ==============================================================================
// 3. SENSOR CALIBRATION & FILTERING CONSTANTS
// ==============================================================================
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
// Normalization bounds derived from 270,000+ training rows
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
// 0 = GOOD (Green), 1 = MODERATE (Yellow), 2 = UNHEALTHY (Red), 3 = HAZARDOUS (Blink)
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
            return (s_co <= 0.05f) ? 1 : 2; // Moderate or Unhealthy
        } else {
            return (s_pm25 <= 0.62f) ? 2 : 3; // Unhealthy or Hazardous
        }
    }
}

// ==============================================================================
// 5. US EPA STANDARD AQI CALCULATION
// ==============================================================================
int calculateAQI_PM25(float pm25) {
    // US EPA standard breakpoints for PM2.5 (ug/m3)
    if (pm25 <= 12.0)   return map((long)(pm25 * 10), 0, 120, 0, 50);
    if (pm25 <= 35.4)   return map((long)(pm25 * 10), 121, 354, 51, 100);
    if (pm25 <= 55.4)   return map((long)(pm25 * 10), 355, 554, 101, 150);
    if (pm25 <= 150.4)  return map((long)(pm25 * 10), 555, 1504, 151, 200);
    if (pm25 <= 250.4)  return map((long)(pm25 * 10), 1505, 2504, 201, 300);
    if (pm25 <= 350.4)  return map((long)(pm25 * 10), 2505, 3504, 301, 400);
    return map((long)(min(pm25, 500.0f) * 10), 3505, 5000, 401, 500);
}

// ==============================================================================
// 6. ACTUATORS & RGB CONTROL
// ==============================================================================
void setRGBColor(bool r, bool g, bool b) {
    digitalWrite(LED_RED_PIN,   r ? HIGH : LOW);
    digitalWrite(LED_GREEN_PIN, g ? HIGH : LOW);
    digitalWrite(LED_BLUE_PIN,  b ? HIGH : LOW);
}

void updateActuators(int riskClass, float hazardProb, int aqi) {
    if (riskClass == 0) {
        // GOOD -> Solid Green
        setRGBColor(false, true, false);
        digitalWrite(BUZZER_PIN, LOW);
    } else if (riskClass == 1) {
        // MODERATE -> Yellow (Red + Green) or Cyan (Green + Blue)
        setRGBColor(true, true, false);
        digitalWrite(BUZZER_PIN, LOW);
    } else if (riskClass == 2) {
        // UNHEALTHY -> Solid Red
        setRGBColor(true, false, false);
        if (hazardProb > 0.85 || aqi > 180) {
            digitalWrite(BUZZER_PIN, HIGH); // Short pulse/on
        } else {
            digitalWrite(BUZZER_PIN, LOW);
        }
    } else {
        // HAZARDOUS -> Magenta (Red + Blue) & Alarm
        setRGBColor(true, false, true);
        digitalWrite(BUZZER_PIN, HIGH);
    }
}

// ==============================================================================
// 7. REST API HANDLERS (For Browser / Web Dashboard Integration)
// ==============================================================================
void handleGetTelemetry() {
    String json = "{";
    json += "\"status\":\"ok\",";
    json += "\"node_id\":\"ESP32-X7\",";
    json += "\"aqi\":" + String(liveAQI) + ",";
    json += "\"pm25\":" + String(livePM25, 1) + ",";
    json += "\"co_ppm\":" + String(liveCO_ppm, 2) + ",";
    json += "\"co2_ppm\":" + String(liveCO2_ppm, 0) + ",";
    json += "\"temp_c\":" + String(liveTempC, 1) + ",";
    json += "\"humidity\":" + String(liveHumidity, 1) + ",";
    json += "\"future_aqi\":" + String(mlFutureAQI, 1) + ",";
    json += "\"hazard_prob\":" + String(mlHazardProb * 100.0, 1) + ",";
    json += "\"risk_class\":" + String(mlRiskClass) + ",";
    json += "\"uptime_s\":" + String(millis() / 1000);
    json += "}";

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(200, "application/json", json);
}

void handleRoot() {
    String html = "<html><body style='font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:2rem;'>";
    html += "<h2>EvoAir Pro - ESP32 Edge Node Online</h2>";
    html += "<p>Node ID: <b>ESP32-X7</b></p>";
    html += "<p>Live AQI: <b style='color:#3b82f6;'>" + String(liveAQI) + "</b></p>";
    html += "<p>PM2.5: " + String(livePM25, 1) + " ug/m3 | Temp: " + String(liveTempC, 1) + " &deg;C</p>";
    html += "<p>REST API Endpoint: <a style='color:#38bdf8;' href='/api/data'>/api/data</a></p>";
    html += "</body></html>";
    server.send(200, "text/html", html);
}

// ==============================================================================
// 8. OLED DISPLAY MULTI-PAGE CAROUSEL
// ==============================================================================
void drawOLEDCarousel() {
    display.clearDisplay();
    display.setTextColor(WHITE);

    // Header bar
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("EvoAir Pro");
    display.setCursor(80, 0);
    if (wifiConnected) display.print("[WiFi]");
    else display.print("[USB]");
    display.drawLine(0, 9, 127, 9, WHITE);

    if (currentOLEDPage == 0) {
        // --- PAGE 1: REAL-TIME AQI & EPA STATUS ---
        display.setCursor(0, 14);
        display.print("LIVE EPA AQI: ");
        display.setTextSize(2);
        display.setCursor(0, 26);
        display.print((int)liveAQI);

        display.setTextSize(1);
        display.setCursor(55, 26);
        if (liveAQI <= 50)        display.print("[GOOD]");
        else if (liveAQI <= 100) display.print("[MODERATE]");
        else if (liveAQI <= 150) display.print("[UNHEALTHY*]");
        else if (liveAQI <= 200) display.print("[UNHEALTHY]");
        else                     display.print("[HAZARDOUS]");

        display.setCursor(0, 52);
        display.print("T: "); display.print(liveTempC, 1); display.print("C  H: "); display.print(liveHumidity, 0); display.print("%");

    } else if (currentOLEDPage == 1) {
        // --- PAGE 2: EDGE ML FORECAST & ALERTS ---
        display.setCursor(0, 14);
        display.print("EDGE ML PREDICTIONS");
        
        display.setCursor(0, 26);
        display.print("1h Future AQI: ");
        display.setTextSize(1);
        display.print((int)mlFutureAQI);

        display.setCursor(0, 38);
        display.print("Hazard Prob : ");
        display.print((int)(mlHazardProb * 100));
        display.print("%");

        display.setCursor(0, 50);
        display.print("Tree Risk   : ");
        if (mlRiskClass == 0) display.print("SAFE (L0)");
        else if (mlRiskClass == 1) display.print("MODERATE (L1)");
        else if (mlRiskClass == 2) display.print("UNHEALTHY (L2)");
        else display.print("HAZARD (L3)");

    } else {
        // --- PAGE 3: RAW POLLUTANTS & MITIGATION DIRECTIVE ---
        display.setCursor(0, 14);
        display.print("PM2.5: "); display.print(livePM25, 1); display.print(" ug/m3");
        
        display.setCursor(0, 26);
        display.print("CO   : "); display.print(liveCO_ppm, 2); display.print(" ppm");
        
        display.setCursor(0, 38);
        display.print("CO2  : "); display.print((int)liveCO2_ppm); display.print(" ppm");

        display.setCursor(0, 52);
        if (liveAQI > 150) {
            display.print("ACTION: Run HEPA Filter!");
        } else if (liveCO2_ppm > 1000) {
            display.print("ACTION: Open Ventilation");
        } else {
            display.print("ACTION: Air Is Clean");
        }
    }

    display.display();
}

// ==============================================================================
// 9. SETUP FUNCTION
// ==============================================================================
void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("\n[SYSTEM] EvoAir Pro Initializing...");

    // Setup Actuator & Sensor GPIOs
    pinMode(DUST_ILED_PIN, OUTPUT);
    digitalWrite(DUST_ILED_PIN, HIGH); // Off for Sharp Sensor

    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);

    pinMode(LED_RED_PIN,   OUTPUT);
    pinMode(LED_GREEN_PIN, OUTPUT);
    pinMode(LED_BLUE_PIN,  OUTPUT);
    setRGBColor(true, true, true); // White boot flash

    // Initialize DHT22
    dht.begin();

    // Initialize OLED Display (I2C)
    Wire.begin(21, 22);
    if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
        Serial.println("[ERROR] SSD1306 OLED initialization failed!");
    } else {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(WHITE);
        display.setCursor(15, 20);
        display.println("EvoAir Pro Node");
        display.setCursor(15, 35);
        display.println("Edge ML Booting...");
        display.display();
    }
    delay(1500);

    // Initialize WiFi (Graceful non-blocking timeout)
    if (String(ssid) != "YOUR_WIFI_SSID" && strlen(ssid) > 0) {
        WiFi.mode(WIFI_STA);
        WiFi.begin(ssid, password);
        Serial.print("[WIFI] Connecting to ");
        Serial.println(ssid);

        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 15) {
            delay(400);
            Serial.print(".");
            attempts++;
        }

        if (WiFi.status() == WL_CONNECTED) {
            wifiConnected = true;
            Serial.println("\n[WIFI] Connected! IP: " + WiFi.localIP().toString());
            
            // Start REST API Server
            server.on("/", handleRoot);
            server.on("/api/data", handleGetTelemetry);
            server.begin();
            Serial.println("[HTTP] REST API Server listening on port 80");
        } else {
            Serial.println("\n[WIFI] Connect failed. Continuing in Autonomous USB/Serial Mode.");
        }
    } else {
        Serial.println("[WIFI] No SSID provided. Running in Standalone USB Serial Stream Mode.");
    }

    setRGBColor(false, true, false); // Boot complete (Green)
    delay(500);
}

// ==============================================================================
// 10. MAIN LOOP
// ==============================================================================
void loop() {
    if (wifiConnected) {
        server.handleClient();
    }

    unsigned long currentMillis = millis();

    // --- SENSOR POLLING & EDGE ML COMPUTATION ---
    if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
        lastSensorRead = currentMillis;

        // 1. Read DHT22
        float t = dht.readTemperature();
        float h = dht.readHumidity();
        if (!isnan(t) && !isnan(h)) {
            liveTempC = t;
            liveHumidity = h;
        }

        // 2. Read Sharp GP2Y1010 Optical Dust Sensor
        digitalWrite(DUST_ILED_PIN, LOW); // Turn on IR LED
        delayMicroseconds(280);
        int rawDustADC = analogRead(DUST_AOUT_PIN);
        delayMicroseconds(40);
        digitalWrite(DUST_ILED_PIN, HIGH); // Turn off IR LED
        delayMicroseconds(9680);

        // Dust Voltage conversion (ESP32 12-bit ADC: 0-4095 -> 0-3.3V)
        float dustVoltage = (rawDustADC * 3.3f) / 4095.0f;
        // GP2Y1010 transfer function: Dust (ug/m3) = (V - 0.6) * 170.0 (or proportional estimation)
        float calculatedPM25 = max(0.0f, (dustVoltage - 0.5f) * 170.0f);
        if (calculatedPM25 == 0 && rawDustADC > 100) {
            calculatedPM25 = (rawDustADC / 4095.0f) * 250.0f; // Safe fallback
        }

        // 3. Read Gas Sensors
        int rawMQ135 = analogRead(MQ135_PIN); // Air Quality / CO2
        int rawMQ7   = analogRead(MQ7_PIN);   // Carbon Monoxide

        // Approximations for ppm
        float calculatedCO2 = map(rawMQ135, 0, 4095, 400, 3000);
        float calculatedCO  = (rawMQ7 / 4095.0f) * 25.0f;

        // 4. Apply 10-Sample Moving Average Filter
        sampleBufferPM25[sampleIndex] = calculatedPM25;
        sampleBufferCO[sampleIndex]   = calculatedCO;
        sampleBufferCO2[sampleIndex]  = calculatedCO2;
        sampleIndex = (sampleIndex + 1) % NUM_SAMPLES;

        float avgPM25 = 0, avgCO = 0, avgCO2 = 0;
        for (int i = 0; i < NUM_SAMPLES; i++) {
            avgPM25 += sampleBufferPM25[i];
            avgCO   += sampleBufferCO[i];
            avgCO2  += sampleBufferCO2[i];
        }
        livePM25    = avgPM25 / NUM_SAMPLES;
        liveCO_ppm  = avgCO / NUM_SAMPLES;
        liveCO2_ppm = avgCO2 / NUM_SAMPLES;

        // 5. Calculate Standard US EPA AQI
        liveAQI = calculateAQI_PM25(livePM25);

        // 6. Execute Edge ML Inference (All 3 Models)
        // Convert CO ppm to raw sensor range scale for model consistency
        float coModelInput = rawMQ7;
        mlFutureAQI  = predictFutureAQI(livePM25, coModelInput, liveTempC, liveHumidity);
        mlHazardProb = predictHazardProbability(livePM25, coModelInput, liveTempC, liveHumidity);
        mlRiskClass  = predictRiskCategory(livePM25, coModelInput);

        // 7. Update Hardware Actuators (RGB LED & Buzzer)
        updateActuators(mlRiskClass, mlHazardProb, liveAQI);

        // 8. Stream Real-Time JSON Telemetry to Serial (Web Serial API compatible)
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
        Serial.println("}");
    }

    // --- OLED PAGE ROTATION (Switches every 3.5 seconds) ---
    if (currentMillis - lastDisplaySwitch >= 3500) {
        lastDisplaySwitch = currentMillis;
        currentOLEDPage = (currentOLEDPage + 1) % 3;
        drawOLEDCarousel();
    }
}

