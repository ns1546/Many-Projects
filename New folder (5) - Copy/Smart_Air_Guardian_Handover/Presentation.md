---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;900&display=swap');
  
  section {
    font-family: 'Outfit', sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #f8fafc;
  }
  
  h1 {
    font-size: 3.5rem;
    color: #38bdf8;
    margin-bottom: 0.5em;
    text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
  }

  h2 {
    font-size: 2.5rem;
    color: #7dd3fc;
    border-bottom: 2px solid rgba(125, 211, 252, 0.3);
    padding-bottom: 0.5em;
  }

  h3 {
    color: #bae6fd;
  }

  p, li {
    font-size: 1.5rem;
    line-height: 1.6;
    color: #cbd5e1;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 3rem;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .feature-box {
    background: rgba(56, 189, 248, 0.05);
    border-left: 4px solid #38bdf8;
    padding: 1.5rem;
    border-radius: 0 16px 16px 0;
  }

  .highlight {
    color: #fca5a5;
    font-weight: bold;
  }
  
  .badge {
    display: inline-block;
    padding: 0.2em 0.8em;
    border-radius: 20px;
    background: #0ea5e9;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
---

<!-- _class: lead -->
![bg right:40%](ai_bg.png)

<div class="glass-card">
  <div class="badge">PROPOSAL & HANDOVER</div>
  <h1>Smart Air Guardian</h1>
  <p>Next-Generation IoT Air Quality Monitoring System</p>
  <br>
  <p style="font-size: 1.2rem; color: #94a3b8;">Powered by ESP32, Edge AI & Cloud Sync</p>
</div>

---

## 🎯 Project Vision

The **Smart Air Guardian** bridges the gap between low-level hardware sensors and high-level cloud telemetry. 

It provides real-time, actionable insights into indoor air quality to protect health and ensure safety, utilizing a seamless Progressive Web App for universal access.

- **Intelligent Monitoring:** Edge AI analysis of environment.
- **Instant Alerts:** Visual and auditory emergency responses.
- **Ubiquitous Access:** Global Command & Control via Firebase.

---

![bg left:40%](iot_bg.png)

## ⚙️ Hardware & Sensors

Built with industrial-grade sensing precision at the edge.

<div class="feature-grid">
  <div class="feature-box">
    <h3>PM2.5 Optical</h3>
    <p>Detects fine dust, smoke, and allergens.</p>
  </div>
  <div class="feature-box">
    <h3>MQ-135 & MQ-7</h3>
    <p>Broad spectrum gas, CO2 eq, and <span class="highlight">Carbon Monoxide</span>.</p>
  </div>
  <div class="feature-box">
    <h3>DHT22 Sensor</h3>
    <p>Tracks ambient Temperature and relative Humidity.</p>
  </div>
  <div class="feature-box">
    <h3>RGB & Buzzer</h3>
    <p>Immediate physical emergency pulse alerts.</p>
  </div>
</div>

---

## 📱 The C2 Mobile App (PWA)

A fully-native feeling Progressive Web App designed with a modern, Claymorphic interface.

* **Global Firebase Sync:** Monitor and control from anywhere in the world.
* **Native Notifications:** Toast alerts for hardware interactions.
* **Swipe Navigation:** Fluid gestures to switch between Live Telemetry, C2 (Command & Control), and Diagnostics.
* **Remote Control:** Ping the buzzer, reboot the device, or lock the OLED screen directly from your phone.

---

<!-- _class: lead -->
![bg right:40%](air_bg.png)

<div class="glass-card">
  <h2>🧠 AI-Powered Insights</h2>
  <p>Integrated with <strong>Groq/Gemini AI</strong></p>
  <br>
  <p>Generates plain-English, medical-grade analysis of your current air quality data.</p>
  <br>
  <p style="color: #6ee7b7; font-weight: bold;">Actionable Health Advice at your Fingertips.</p>
</div>

---

## 📊 On-Device OLED Dashboard

The 1.3" I2C OLED screen acts as a dedicated on-board information hub.

- **Page 1: Main Dashboard** - AI AQI score, Temp, Humidity, ML Risk Class.
- **Page 2: Gas Metrics** - Raw PM2.5 (µg/m³) and CO (ppm).
- **Page 3: Diagnostics** - Cloud sync status, WiFi, and Uptime.

*Features an Auto-Carousel that rotates every 3 seconds, controllable via the Mobile App.*

---

<!-- _class: lead -->
<div class="glass-card" style="border: 1px solid #38bdf8;">
  <h1 style="font-size: 4rem;">Thank You</h1>
  <p style="font-size: 2rem;">Ready for Production Deployment.</p>
  <br>
  <div style="display: flex; justify-content: center; gap: 1rem;">
    <span class="badge" style="background: #10b981;">HARDWARE READY</span>
    <span class="badge" style="background: #3b82f6;">CLOUD CONNECTED</span>
    <span class="badge" style="background: #8b5cf6;">AI INTEGRATED</span>
  </div>
</div>
