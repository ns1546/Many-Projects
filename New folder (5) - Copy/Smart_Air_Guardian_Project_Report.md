---
title: "Project Report: Smart Air Guardian"
subtitle: "Next-Generation IoT Air Quality Monitoring System"
author: "Engineering & Development Team"
date: "August 2026"
---

# 1. Executive Summary

The **Smart Air Guardian** bridges the gap between low-level hardware sensors and high-level cloud telemetry. It provides real-time, actionable insights into indoor air quality to protect health and ensure safety, utilizing a seamless Progressive Web App for universal access.

This comprehensive project leverages intelligent Edge AI monitoring, instant visual and auditory emergency responses, and ubiquitous access through a Global Command & Control interface synced via Firebase.

---

# 2. Project Vision & Objectives

The primary objective of the Smart Air Guardian is to build a world-class, professional monitoring system that not only collects accurate environmental data but interprets it intelligently.

- **Intelligent Monitoring:** On-device Edge AI analysis of the environment using a dual-core ESP32 microcontroller.
- **Instant Alerts:** Visual LED indicators and an auditory emergency pulse buzzer for immediate response.
- **Ubiquitous Access:** A centralized Command & Control system allowing users to monitor their environment globally via Firebase.
- **AI-Powered Insights:** Integrated with Groq/Gemini AI to generate plain-English, medical-grade analysis of air quality, offering actionable health advice at your fingertips.

---

# 3. System Architecture & Hardware Ecosystem

The ecosystem is built on a highly optimized IoT architecture consisting of three main pillars:

1. **The Edge Node (Hardware):** Driven by an ESP32 Dual-Core Xtensa LX6 CPU at 240 MHz. It features ~294KB of free SRAM and handles real-time sensor polling, 115200 Baud serial communication, and on-device C++ Machine Learning inference.
2. **The Cloud Broker:** Utilizing Firebase Realtime Database (RTDB) for low-latency JSON telemetry syncing, paired with external HTTP APIs (Open-Meteo, Groq/Gemini).
3. **The Progressive Web App (PWA):** A responsive, Glassmorphic HTML/JS/CSS interface featuring offline caching, 11 distinct operational panes, and the Web Serial API for direct USB control.

---

# 4. Hardware Sensors & Components

Built with industrial-grade sensing precision at the edge, the physical device continuously polls the environment using a suite of advanced sensors:

- **PM2.5 Optical Dust Sensor (GP2Y1010):** Measures fine particulate matter (smoke, dust, allergens).
- **MQ-135 Gas Sensor:** Detects broad-spectrum air quality and CO2 equivalents.
- **MQ-7 Gas Sensor:** Specifically tuned for detecting Carbon Monoxide (CO).
- **DHT22 Sensor:** Tracks ambient Temperature (°C) and relative Humidity (%).
- **RGB Status Lamp & Buzzer:** A highly visible indicator of current air quality (Green/Orange/Red) with an active buzzer that sounds an emergency pulse alarm if hazardous levels are reached.
- **OLED Display (1.3" I2C):** An onboard dashboard running an Auto-Carousel to rotate through three distinct information pages every 3 seconds (Main Dashboard, Gas Metrics, Hardware Diagnostics).

---

# 5. Microcontroller Operations & Firmware Mechanics

The firmware is designed for optimal stability and real-time processing:

- **The Boot Sequence:** Configures inputs/outputs, executes RGB self-tests, initializes sensors/buses, and attempts WiFi connection.
- **Operational Cycle:** Every 1.5 seconds, the ESP32 performs data acquisition (with hardware oversampling), filtering, scaling, and conversion into Engineering Units (e.g., µg/m³, ppm).
- **Machine Learning Inference:** Passes normalized data into the Edge ML models directly on the C++ level.
- **Actuation & Synchronization:** Sets RGB color based on ML Risk Class, sounds alarms when required, refreshes the OLED buffer, and synchronizes with Firebase via HTTP PUT and GET requests every 1.5-3.0 seconds.

---

# 6. Machine Learning & Edge AI Pipeline

The Smart Air Guardian operates as a "Smart" node, allowing AI models to run locally without cloud dependency. The models were engineered via a comprehensive Data Science Architecture:

- **Phase 1 (Data Engineering):** Integrated over 1 Million rows from AQI datasets and simulated historical weather data via the Open-Meteo API.
- **Phase 2 (Feature Scaling):** Scaled features (PM2.5, Temp, Wind) to a `[0.0, 1.0]` range for optimized C++ computation.
- **Phase 3 (Edge Models):**
  - *Linear Regression:* 1-Hour Forecaster predicting future AQI.
  - *Logistic Regression:* Emergency Hazard Alarm outputting binary hazard states.
  - *Decision Tree Classifier:* Risk Levelizer driving RGB LEDs via conditional thresholds.

---

# 7. Mobile Application (PWA) & Web Infrastructure

The frontend dashboard is an intricately engineered Progressive Web App (PWA) built for production deployment.

### Features
- **Offline Caching:** Utilizes a Service Worker to intercept network requests, cache UI assets, and ensure instant load times even on poor networks.
- **Global Firebase Sync:** Direct telemetry connection to the hardware, regardless of physical location.
- **Native Experience:** Features native Toast notifications, swipe navigation, and a modern Claymorphic CSS architecture.

### The 11 Operational Panes
1. **Live Telemetry:** Dynamic color-coded health badges, EPA AQI dial, and real-time metrics.
2. **Hardware Diagnostics:** Advanced system tracking, USB Port watchdogs, and live ADC voltage probes.
3. **Air Quality Guide:** Health implication guidelines.
4. **GPS Sensor Map:** Real-time geolocation of the sensor node.
5. **24-Hour AI Forecast:** Ridge Regression graph tracking Diurnal cycles.
6. **Historical Analytics:** Charts and data tables of past telemetry.
7. **AI Clinical Studio:** Connects to Groq/Gemini LLM for medical-grade risk analysis.
8. **Mitigation Engine:** Calculates Purification Efficacy.
9. **Hardware C2 Center:** Force OLED lock, ping buzzer, toggle RGB modes, or reset the MCU.
10. **Edge ML & Model Brain:** Transparent view into C++ inference engine parameters.
11. **Data Vault & Export:** Local browser storage management for exporting logs.

---

# 8. Conclusion

The Smart Air Guardian project successfully merges embedded systems engineering, Edge AI, and modern web application development. The resulting ecosystem is a highly robust, scalable, and professional IoT platform ready for production deployment.
