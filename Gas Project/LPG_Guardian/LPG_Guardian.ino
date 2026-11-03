#include <WiFi.h>
#include <WebServer.h>
#include <HX711.h>
#include <WiFiManager.h>
#include <ESPmDNS.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include "dashboard.h"

// ==========================================
// --- Advanced Configuration 
// ==========================================
const int GAS_THRESHOLD = 1500; 
float calibration_factor = 2280.0f; // Must calibrate!

// ==========================================
// --- Hardware Pins
// ==========================================
const int HX711_dout = 16;
const int HX711_sck = 4;
const int MQ6_pin = 34;
const int Buzzer_pin = 18;
const int Relay_pin = 19;
const int LED_pin = 2; // Onboard Blue LED is usually GPIO 2

HX711 scale;
WebServer server(80);
Preferences preferences;

WiFiClient espClient;
PubSubClient mqtt(espClient);

const char* mqtt_server = "broker.emqx.io";
String device_id = "";

// ==========================================
// --- FreeRTOS Shared State & Mutex
// ==========================================
SemaphoreHandle_t dataMutex;

// Telemetry
float current_weight = 0.0;
long current_raw_hx711 = 0;
long hx711_noise = 0;
int gas_raw = 0;
bool leak_alert = false;
unsigned long system_uptime = 0;
bool hx711_ready = false;

// Hardware Controls (User Override)
int led_mode = 1; // 0=Off, 1=Solid, 2=Slow, 3=Fast, 4=Heartbeat
bool relay_state = false;
bool buzzer_state = false;
bool request_tare = false;
bool alarm_muted = false;
bool request_calibrate = false;
float known_cal_weight = 0.0;

// ==========================================
// --- Web Server (REST API)
// ==========================================
void sendCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() {
  sendCORS();
  server.send(204);
}

void handleData() {
  sendCORS();
  
  // Safely extract data from shared memory
  float t_weight;
  int t_gas;
  bool t_alert;
  unsigned long t_uptime;
  int t_led;
  bool t_relay;
  bool t_buzzer;
  bool t_hx_ready;
  bool t_muted;
  float t_cal;
  long t_raw_hx;
  long t_noise;
  
  if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
    t_weight = isnan(current_weight) ? 0.0 : current_weight;
    t_raw_hx = current_raw_hx711;
    t_noise = hx711_noise;
    t_gas = gas_raw;
    t_alert = leak_alert;
    t_uptime = system_uptime;
    t_led = led_mode;
    t_relay = relay_state;
    t_buzzer = buzzer_state;
    t_hx_ready = hx711_ready;
    t_muted = alarm_muted;
    t_cal = calibration_factor;
    xSemaphoreGive(dataMutex);
  }

  String json = "{";
  json += "\"device_id\":\"" + device_id + "\",";
  json += "\"weight_kg\":" + String(t_weight, 2) + ",";
  json += "\"gas_raw\":" + String(t_gas) + ",";
  json += "\"gas_status\":\"" + String(t_alert ? "DANGER: CRITICAL LEAK!" : "System Secure") + "\",";
  json += "\"leak_alert\":" + String(t_alert ? "true" : "false") + ",";
  json += "\"uptime_sec\":" + String(t_uptime) + ",";
  json += "\"wifi_rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
  json += "\"cpu_freq\":" + String(ESP.getCpuFreqMHz()) + ",";
  json += "\"led_mode\":" + String(t_led) + ",";
  json += "\"relay_state\":" + String(t_relay ? "true" : "false") + ",";
  json += "\"buzzer_state\":" + String(t_buzzer ? "true" : "false") + ",";
  json += "\"hx711_ready\":" + String(t_hx_ready ? "true" : "false") + ",";
  json += "\"alarm_muted\":" + String(t_muted ? "true" : "false") + ",";
  json += "\"cal_factor\":" + String(t_cal, 2) + ",";
  json += "\"hx711_noise\":" + String(t_noise) + ",";
  json += "\"hx711_raw\":" + String(t_raw_hx);
  json += "}";

  server.send(200, "application/json", json);
}

void handleControl() {
  sendCORS();
  if (server.hasArg("device") && server.hasArg("value")) {
    String device = server.arg("device");
    String value = server.arg("value");
    
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    if (device == "led") {
      led_mode = value.toInt(); // Expects 0-4
    } else if (device == "relay") {
      relay_state = (value == "1" || value == "true");
    } else if (device == "buzzer") {
      buzzer_state = (value == "1" || value == "true");
    } else if (device == "tare") {
      request_tare = true;
    } else if (device == "mute") {
      alarm_muted = (value == "1" || value == "true");
    } else if (device == "calibrate") {
      request_calibrate = true;
      known_cal_weight = value.toFloat();
    }
    xSemaphoreGive(dataMutex);
    
    server.send(200, "text/plain", "Hardware updated successfully");
  } else {
    server.send(400, "text/plain", "Missing arguments");
  }
}

// ==========================================
// --- MQTT Control Callback
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  // Expected msg: "device=value" e.g. "led=3" or "tare=1"
  int eq = msg.indexOf('=');
  if (eq > 0) {
    String device = msg.substring(0, eq);
    String value = msg.substring(eq + 1);

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    if (device == "led") {
      led_mode = value.toInt();
    } else if (device == "relay") {
      relay_state = (value == "1" || value == "true");
    } else if (device == "buzzer") {
      buzzer_state = (value == "1" || value == "true");
    } else if (device == "tare") {
      request_tare = true;
    } else if (device == "mute") {
      alarm_muted = (value == "1" || value == "true");
    } else if (device == "calibrate") {
      request_calibrate = true;
      known_cal_weight = value.toFloat();
    }
    xSemaphoreGive(dataMutex);
  }
}

void reconnectMQTT() {
  if (!mqtt.connected()) {
    if (mqtt.connect(device_id.c_str())) {
      String subTopic = "lpg_guardian/" + device_id + "/control";
      mqtt.subscribe(subTopic.c_str());
    }
  }
}

// ==========================================
// --- OS TASK 1: Sensor & Hardware Engine (Core 1)
// ==========================================
void TaskHardwareEngine(void *pvParameters) {
  TickType_t xLastWakeTime = xTaskGetTickCount();
  const TickType_t xFrequency = pdMS_TO_TICKS(50); // High-speed 50ms engine

  unsigned long last_sensor_read = 0;
  unsigned long led_timer = 0;
  int led_step = 0;

  for (;;) {
    unsigned long now = millis();

    // 1. Pull User Override State
    int c_led_mode;
    bool c_relay;
    bool c_buzzer;
    bool do_tare;
    bool c_leak;
    bool do_cal;
    float cal_weight;

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    c_leak = leak_alert && !alarm_muted;
    c_led_mode = c_leak ? 3 : led_mode; // Leak overrides LED to FAST BLINK (3)
    c_relay = c_leak ? true : relay_state; // Leak forces Relay ON
    c_buzzer = c_leak ? true : buzzer_state; // Leak forces Buzzer ON
    do_tare = request_tare;
    request_tare = false;
    do_cal = request_calibrate;
    cal_weight = known_cal_weight;
    request_calibrate = false;
    xSemaphoreGive(dataMutex);

    // 2. Drive Actuators
    digitalWrite(Relay_pin, c_relay ? HIGH : LOW);
    digitalWrite(Buzzer_pin, c_buzzer ? HIGH : LOW);

    // 3. Drive LED Pattern Engine
    if (c_led_mode == 0) {
      digitalWrite(LED_pin, LOW);
    } else if (c_led_mode == 1) {
      digitalWrite(LED_pin, HIGH);
    } else if (c_led_mode == 2) { // Slow 1Hz
      if (now - led_timer > 500) { digitalWrite(LED_pin, !digitalRead(LED_pin)); led_timer = now; }
    } else if (c_led_mode == 3) { // Fast 5Hz
      if (now - led_timer > 100) { digitalWrite(LED_pin, !digitalRead(LED_pin)); led_timer = now; }
    } else if (c_led_mode == 4) { // Heartbeat
      if (now - led_timer > 1500) { led_step = 0; led_timer = now; }
      if (led_step == 0) { digitalWrite(LED_pin, HIGH); led_step++; }
      else if (now - led_timer > 100 && led_step == 1) { digitalWrite(LED_pin, LOW); led_step++; }
      else if (now - led_timer > 250 && led_step == 2) { digitalWrite(LED_pin, HIGH); led_step++; }
      else if (now - led_timer > 350 && led_step == 3) { digitalWrite(LED_pin, LOW); led_step++; }
    }

    // 4. Perform Scale Tare if Requested
    if (do_tare) {
      scale.tare();
      xSemaphoreTake(dataMutex, portMAX_DELAY);
      current_raw_hx711 = 0;
      current_weight = 0.0;
      xSemaphoreGive(dataMutex);
    }

    // 4.5 Perform Scale Calibration if Requested
    if (do_cal && cal_weight > 0.0) {
      long val = scale.get_value(10); // Get avg of 10 readings minus tare
      float new_factor = (float)val / cal_weight;
      if (new_factor != 0) {
        scale.set_scale(new_factor);
        preferences.putFloat("cal", new_factor);
        xSemaphoreTake(dataMutex, portMAX_DELAY);
        calibration_factor = new_factor;
        xSemaphoreGive(dataMutex);
      }
    }

    // 5. Read HX711 Load Cell (Asynchronously at its native 10Hz rate)
    static long noise_buffer[10];
    static int noise_idx = 0;
    
    if (scale.is_ready()) {
      long new_raw = scale.get_value(1); 
      
      // Calculate Noise Variance
      noise_buffer[noise_idx] = new_raw;
      noise_idx = (noise_idx + 1) % 10;
      
      long max_val = -2147483648;
      long min_val = 2147483647;
      for(int i=0; i<10; i++) {
        if(noise_buffer[i] > max_val) max_val = noise_buffer[i];
        if(noise_buffer[i] < min_val) min_val = noise_buffer[i];
      }
      long calculated_noise = max_val - min_val;
      
      xSemaphoreTake(dataMutex, portMAX_DELAY);
      // Exponential Moving Average (EMA) to eliminate noise
      current_raw_hx711 = (long)((current_raw_hx711 * 0.7) + (new_raw * 0.3));
      hx711_noise = calculated_noise;
      
      if (calibration_factor != 0) {
        current_weight = (float)current_raw_hx711 / calibration_factor;
      } else {
        current_weight = 0.0;
      }
      hx711_ready = true;
      xSemaphoreGive(dataMutex);
    } else {
      // If not ready for a prolonged time, it might be disconnected
      if (now - last_sensor_read > 2000) {
        xSemaphoreTake(dataMutex, portMAX_DELAY);
        hx711_ready = false;
        xSemaphoreGive(dataMutex);
      }
    }
      
    // 6. Read MQ6 Gas Sensor (Every 500ms)
    if (now - last_sensor_read > 500) {
      int loc_gas = analogRead(MQ6_pin);
      bool loc_alert = (loc_gas > GAS_THRESHOLD);

      xSemaphoreTake(dataMutex, portMAX_DELAY);
      gas_raw = (int)((gas_raw * 0.8) + (loc_gas * 0.2));
      leak_alert = loc_alert;
      system_uptime = now / 1000;
      xSemaphoreGive(dataMutex);

      last_sensor_read = now;
    }

    // Yield execution precisely without catching up
    vTaskDelay(pdMS_TO_TICKS(50));
  }
}

// ==========================================
// --- OS TASK 2: Network & API Service (Core 0)
// ==========================================
void TaskWebAPI(void *pvParameters) {
  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html", dashboard_html);
  });
  server.on("/api/data", HTTP_GET, handleData);
  server.on("/api/control", HTTP_GET, handleControl); // Using GET for simplicity in JS fetch
  server.on("/api/data", HTTP_OPTIONS, handleOptions);
  server.on("/api/control", HTTP_OPTIONS, handleOptions);
  
  server.begin();

  unsigned long lastMqttPub = 0;

  for (;;) {
    server.handleClient();
    
      // MQTT Handling
      if (WiFi.status() == WL_CONNECTED) {
        static unsigned long lastMqttReconnect = 0;
        if (!mqtt.connected()) {
          if (millis() - lastMqttReconnect > 5000) {
            lastMqttReconnect = millis();
            reconnectMQTT();
          }
        }
        
        if (mqtt.connected()) {
          mqtt.loop();
  
          // Publish Data every 1s
          if (millis() - lastMqttPub > 1000) {
        float t_weight;
        int t_gas;
        bool t_alert;
        unsigned long t_uptime;
        int t_led;
        bool t_relay;
        bool t_buzzer;
        bool t_hx_ready;
        bool t_muted;
        float t_cal;
        long t_raw_hx;
        long t_noise;
        
        if (xSemaphoreTake(dataMutex, portMAX_DELAY) == pdTRUE) {
          t_weight = isnan(current_weight) ? 0.0 : current_weight;
          t_raw_hx = current_raw_hx711;
          t_noise = hx711_noise;
          t_gas = gas_raw;
          t_alert = leak_alert;
          t_uptime = system_uptime;
          t_led = led_mode;
          t_relay = relay_state;
          t_buzzer = buzzer_state;
          t_hx_ready = hx711_ready;
          t_muted = alarm_muted;
          t_cal = calibration_factor;
          xSemaphoreGive(dataMutex);
        }

        String json = "{";
        json += "\"device_id\":\"" + device_id + "\",";
        json += "\"weight_kg\":" + String(t_weight, 2) + ",";
        json += "\"gas_raw\":" + String(t_gas) + ",";
        json += "\"gas_status\":\"" + String(t_alert ? "DANGER: CRITICAL LEAK!" : "System Secure") + "\",";
        json += "\"leak_alert\":" + String(t_alert ? "true" : "false") + ",";
        json += "\"uptime_sec\":" + String(t_uptime) + ",";
        json += "\"wifi_rssi\":" + String(WiFi.RSSI()) + ",";
        json += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
        json += "\"cpu_freq\":" + String(ESP.getCpuFreqMHz()) + ",";
        json += "\"led_mode\":" + String(t_led) + ",";
        json += "\"relay_state\":" + String(t_relay ? "true" : "false") + ",";
        json += "\"buzzer_state\":" + String(t_buzzer ? "true" : "false") + ",";
        json += "\"hx711_ready\":" + String(t_hx_ready ? "true" : "false") + ",";
        json += "\"alarm_muted\":" + String(t_muted ? "true" : "false") + ",";
        json += "\"cal_factor\":" + String(t_cal, 2) + ",";
        json += "\"hx711_noise\":" + String(t_noise) + ",";
        json += "\"hx711_raw\":" + String(t_raw_hx);
        json += "}";

        String pubTopic = "lpg_guardian/" + device_id + "/data";
        mqtt.publish(pubTopic.c_str(), json.c_str());
        lastMqttPub = millis();
      }
    }
    }

    vTaskDelay(pdMS_TO_TICKS(10)); 
  }
}

// ==========================================
// --- Bootloader / Main Setup
// ==========================================
void setup() {
  Serial.begin(115200);

  pinMode(Buzzer_pin, OUTPUT);
  pinMode(Relay_pin, OUTPUT);
  pinMode(LED_pin, OUTPUT);
  digitalWrite(Buzzer_pin, LOW);
  digitalWrite(Relay_pin, LOW);
  digitalWrite(LED_pin, HIGH);

  preferences.begin("lpg-os", false);
  calibration_factor = preferences.getFloat("cal", 2280.0f);

  scale.begin(HX711_dout, HX711_sck);
  // Force DOUT high if wire is disconnected to prevent floating pin noise
  pinMode(HX711_dout, INPUT_PULLUP);
  scale.set_scale(calibration_factor); 
  
  Serial.println("Attempting HX711 Tare...");
  if (scale.wait_ready_timeout(1500)) {
    scale.tare(); 
    Serial.println("Tare Successful.");
  } else {
    Serial.println("HX711 NOT RESPONDING - Skipping Tare");
  }

  // --- Start WiFiManager (Captive Portal) ---
  WiFiManager wm;
  if (!wm.autoConnect("LPG_Guardian_Setup")) {
    ESP.restart(); // Reboot if it fails to connect
  }
  
  // Generate Unique Device ID from MAC (Must be called AFTER WiFi starts)
  device_id = WiFi.macAddress();
  device_id.replace(":", "");
  
  Serial.println("\n--- WIFI CONNECTED ---");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Device Cloud ID: ");
  Serial.println(device_id);
  Serial.println("----------------------\n");

  mqtt.setServer(mqtt_server, 1883);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(1024); // CRITICAL: Required for large JSON payloads

  // --- Start mDNS ---
  MDNS.begin("lpgguardian");

  dataMutex = xSemaphoreCreateMutex();

  if (dataMutex != NULL) {
    xTaskCreatePinnedToCore(TaskWebAPI, "WebAPI", 8192, NULL, 1, NULL, 0);
    xTaskCreatePinnedToCore(TaskHardwareEngine, "Hardware", 4096, NULL, 2, NULL, 1);
  }
}

void loop() {
  vTaskDelete(NULL); 
}
