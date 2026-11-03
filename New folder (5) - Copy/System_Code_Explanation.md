# Easy-to-Understand Guide: Smart Air Guardian Code & System

This guide explains the entire project in simple terms. It covers how the hardware works, how the website connects, and exactly how the "Machine Learning" works without getting confused by heavy math.

---

## 1. The Big Picture: How Everything Connects

The system has 3 main parts:
1. **The Physical Device (ESP32)**: This is the brain in the real world. It has sensors connected to it to read the air, an OLED screen to show data, and LEDs/Buzzers for alarms.
2. **The Cloud (Firebase)**: A database on the internet. The ESP32 sends its sensor readings here. 
3. **The Web Dashboard**: The beautiful website on your phone or computer. It reads the data from Firebase to show you charts, and if you click a button (like "Turn on Alarm"), it sends a command back through Firebase to the ESP32.

---

## 2. Explaining the ESP32 Code (`ESP32_Air_Quality.ino`)

This is the code that runs on the actual physical device. Here is simply what it does, step-by-step:

### Step 1: Setting up the Hardware
When you plug the device in, the `setup()` function runs once. 
- It tells the ESP32 which pins have the LEDs, Buzzers, and Sensors connected.
- It turns on the OLED screen.
- It connects to your home Wi-Fi using the password in the code.

### Step 2: Reading the Air (The Sensors)
Inside the `loop()` function, the device constantly checks the air. 
- **Temp & Humidity (DHT22)**: Reads the room temperature.
- **Dust Sensor (PM2.5)**: Measures tiny particles in the air.
- **Gas Sensors (MQ135 & MQ7)**: Measures Carbon Monoxide and CO2.

*Important Detail:* Sensors can sometimes give jumpy or glitchy readings. To fix this, the code uses **"Exponential Smoothing"**. This means instead of trusting a sudden jump in gas levels immediately, it slowly blends the new reading with the old reading. This keeps the numbers on your screen looking very smooth and stable.

### Step 3: Controlling Lights and Alarms
The code has a function called `updateActuators()`. Depending on how bad the air is, it automatically changes the RGB LED color:
- **Green**: Air is Good.
- **Yellow**: Air is Moderate.
- **Red**: Air is Unhealthy.
- **Purple**: Air is Hazardous. 
If the air is extremely dangerous, it turns on the Buzzer automatically to warn you.

### Step 4: Talking to the Internet
Every 3 seconds, the ESP32 takes all the sensor numbers, turns them into a text format called JSON, and sends them to Google Firebase. 
At the same time, it checks Firebase to see if you clicked any buttons on your Web Dashboard (like "Turn off OLED"). If it sees a command, it runs it immediately.

---

## 3. Explaining the Machine Learning (AI Models)

You might wonder: *How does a tiny ESP32 run Artificial Intelligence?* 
The answer is: We did all the heavy lifting on a computer first, and only gave the ESP32 the final math formulas. 

Here is exactly how the dataset and the 3 AI models work:

### The Dataset (Where the AI learned from)
We used Python scripts (`download_all_data.py`) to download thousands of historical records of Air Quality and Weather in Bangladesh from the internet. We saved this massive list into an Excel/CSV file called `Master_AQI_Weather.csv`.

### Training the AI (The Python Script)
We ran a script called `train_final_models.py`. This script looked at the massive CSV file and found hidden patterns (for example: "When temperature goes up and PM2.5 goes up, the air usually gets worse in an hour"). 

The Python script trained **3 different models**:

#### 1. The Forecaster (Linear Regression)
*   **What it does:** It predicts what the exact AQI number will be in 1 hour.
*   **How it works:** The Python script found a math formula (a multiplier for PM2.5, CO, Temp, and Humidity). We copied this exact math formula into the ESP32 code (`predictFutureAQI`). Now, the ESP32 just multiplies its current sensor readings by these numbers to guess the future!

#### 2. The Danger Alert (Logistic Regression)
*   **What it does:** It gives a percentage (0% to 100%) of how likely an emergency hazard is happening.
*   **How it works:** Similar to the forecaster, it uses a math formula. But it passes the final number through an "S-curve" (called a Sigmoid function). This squashes the math result so it always stays between 0 and 1 (0% and 100%).

#### 3. The Risk Categorizer (Decision Tree)
*   **What it does:** It puts the air into 4 simple buckets: Good, Moderate, Unhealthy, or Hazardous.
*   **How it works:** Think of this as a game of 20 Questions. The Python script figured out the best questions to ask. We copied these questions into the ESP32 code as simple `if / else` statements. (Example: *If PM2.5 is less than 0.11, then the air is Good. Else, the air is Unhealthy*). 

### The Secret Step: "Scaling"
AI math formulas get confused if numbers are too big (like a CO reading of 3000) or too small (like a Temp of 25). 
To fix this, both the Python script and the ESP32 code use **"Min-Max Scaling"**. This is a simple trick that forces every single sensor reading to become a tiny decimal number between `0.0` and `1.0`. By shrinking all numbers to the same size, the math formulas work perfectly and very fast on the ESP32.
