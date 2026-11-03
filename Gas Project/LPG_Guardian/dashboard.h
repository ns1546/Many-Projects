const char dashboard_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LPG Guardian Enterprise OS Pro</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
    
    <style>
        :root {
            --bg: #e0e5ec;
            --text-dark: #2d3748;
            --text-muted: #718096;
            --shadow-light: #ffffff;
            --shadow-dark: #a3b1c6;
            --primary: #3182ce;
            --primary-dark: #2b6cb0;
            --danger: #e53e3e;
            --success: #38a169;
            --warning: #dd6b20;
            --font-main: 'Montserrat', sans-serif;
            --font-code: 'JetBrains Mono', monospace;
        }

        * { box-sizing: border-box; }

        body {
            background-color: var(--bg);
            color: var(--text-dark);
            font-family: var(--font-main);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            overflow: hidden;
            transition: box-shadow 0.3s ease;
        }

        /* --- Neumorphic Utilities --- */
        .neo-flat {
            background: var(--bg);
            border-radius: 20px;
            box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
            transition: transform 0.2s ease;
        }
        .neo-inset {
            background: var(--bg);
            border-radius: 15px;
            box-shadow: inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light);
        }
        .neo-btn {
            background: var(--bg);
            border: none;
            border-radius: 12px;
            padding: 12px 20px;
            font-family: var(--font-main);
            font-weight: 700;
            color: var(--primary);
            cursor: pointer;
            box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .neo-btn:active { box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light); }
        .neo-btn:hover { color: var(--primary-dark); transform: translateY(-2px); }
        .neo-btn.danger { color: var(--danger); }
        .neo-btn.danger:hover { color: #c53030; }
        
        .neo-input {
            background: transparent;
            border: none;
            outline: none;
            font-family: var(--font-main);
            font-weight: 600;
            color: var(--text-dark);
            width: 100%;
            padding: 10px;
        }

        /* --- App Layout --- */
        .sidebar {
            width: 260px;
            min-width: 260px;
            background: var(--bg);
            padding: 30px 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 10;
            box-shadow: 10px 0 20px -10px rgba(163,177,198,0.5);
        }

        .main-content {
            flex-grow: 1;
            padding: 30px;
            overflow-y: auto;
            position: relative;
        }

        /* --- Sidebar --- */
        .brand { text-align: center; margin-bottom: 30px; }
        .brand h2 { margin: 0; font-weight: 900; font-size: 1.4rem; color: var(--primary-dark); letter-spacing: 1px;}
        .brand p { margin: 5px 0 0; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px;}

        .nav-item {
            padding: 15px 20px;
            border-radius: 15px;
            font-weight: 700;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.95rem;
        }
        .nav-item i { font-size: 1.3rem; }
        .nav-item:hover { color: var(--primary); }
        .nav-item.active {
            color: var(--primary);
            box-shadow: inset 5px 5px 10px var(--shadow-dark), inset -5px -5px 10px var(--shadow-light);
        }

        .conn-status-badge {
            margin-top: auto;
            padding: 15px;
            text-align: center;
            font-size: 0.8rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: var(--danger); box-shadow: inset 2px 2px 4px rgba(0,0,0,0.2);}
        .dot.active { background: var(--success); box-shadow: 0 0 10px var(--success); }

        /* --- Views --- */
        .view { display: none; animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .view.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        /* --- Grid Layouts --- */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        
        .panel { padding: 25px; margin-bottom: 30px; position: relative; }
        .panel-title { font-size: 1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; color: var(--text-dark); display: flex; justify-content: space-between; align-items: center;}
        .panel-title i { color: var(--primary); font-size: 1.4rem; }

        /* --- Specific Components --- */
        .data-block { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; transition: all 0.3s; }
        .data-block:hover { transform: scale(1.02); }
        .data-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 5px;}
        .data-value { font-size: 2.2rem; font-weight: 900; color: var(--primary-dark); line-height: 1;}
        .data-unit { font-size: 1rem; color: var(--text-muted); font-weight: 600; }
        
        /* Event Log */
        .log-window { font-family: var(--font-code); font-size: 0.85rem; height: 200px; overflow-y: auto; padding: 15px; color: var(--text-dark); }
        .log-entry { margin-bottom: 8px; border-bottom: 1px solid rgba(163,177,198,0.3); padding-bottom: 5px; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .log-time { color: var(--primary); font-weight: 700; margin-right: 10px; }

        /* Progress Dial */
        .dial-wrap { display: flex; justify-content: center; padding: 20px; }
        .dial-outer { width: 220px; height: 220px; border-radius: 50%; box-shadow: 10px 10px 20px var(--shadow-dark), -10px -10px 20px var(--shadow-light); display: flex; justify-content: center; align-items: center; position: relative; }
        .dial-inner { width: 170px; height: 170px; border-radius: 50%; box-shadow: inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; }
        .dial-fill { position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border-radius: 50%; background: conic-gradient(var(--success) 0%, transparent 0%); -webkit-mask: radial-gradient(transparent 68%, black 70%); transition: background 1s cubic-bezier(0.4, 0, 0.2, 1); }

        /* Linear Progress Bar (For Gas) */
        .progress-bar-bg { width: 100%; height: 20px; border-radius: 10px; background: var(--bg); box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light); overflow: hidden; margin-top: 15px; position: relative; }
        .progress-bar-fill { height: 100%; width: 0%; background: var(--success); transition: width 0.5s ease, background 0.5s ease; border-radius: 10px; }

        /* Switches */
        .control-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; margin-bottom: 15px; }
        .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: transparent; transition: .4s; border-radius: 34px; box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light); }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: var(--text-muted); transition: .4s; border-radius: 50%; box-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        input:checked + .slider:before { transform: translateX(22px); background-color: var(--primary); }
        input:checked + .slider { box-shadow: inset 3px 3px 6px rgba(0,0,0,0.2); }

        /* AI Terminal */
        .ai-terminal { font-family: var(--font-code); background: #1a202c; color: #63b3ed; border-radius: 15px; padding: 25px; height: 400px; overflow-y: auto; font-size: 0.9rem; line-height: 1.6; box-shadow: inset 5px 5px 15px rgba(0,0,0,0.5); }
        
        /* Toast Notification System */
        #toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
        .toast { min-width: 250px; padding: 15px 20px; border-radius: 10px; font-weight: 700; color: white; box-shadow: 0 10px 15px rgba(0,0,0,0.2); animation: slideInRight 0.4s ease forwards, fadeOut 0.4s ease 4s forwards; display: flex; align-items: center; gap: 10px; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(-10px); visibility: hidden; } }
        .toast.success { background: var(--success); }
        .toast.error { background: var(--danger); }
        .toast.info { background: var(--primary); }

        /* Alert Mode (Leak Detected) */
        .alert-mode { animation: pulseBorder 1s infinite alternate; }
        @keyframes pulseBorder {
            from { box-shadow: inset 0 0 0px var(--danger); }
            to { box-shadow: inset 0 0 30px var(--danger); }
        }
    </style>
</head>
<body id="appBody">

<!-- TOAST CONTAINER -->
<div id="toast-container"></div>

<!-- SIDEBAR NAVIGATION -->
<nav class="sidebar">
    <div class="brand">
        <h2>LPG GUARDIAN</h2>
        <p>Enterprise Edition</p>
    </div>
    
    <div class="nav-item active" onclick="nav('view-dashboard', this)">
        <i class="ph-fill ph-squares-four"></i> Live Dashboard
    </div>
    <div class="nav-item" onclick="nav('view-analytics', this)">
        <i class="ph-fill ph-chart-line-up"></i> Analytics
    </div>
    <div class="nav-item" onclick="nav('view-hardware', this)">
        <i class="ph-fill ph-cpu"></i> Hardware Health
    </div>
    <div class="nav-item" onclick="nav('view-ai', this)">
        <i class="ph-fill ph-brain"></i> AI Assistant
    </div>

    <div class="conn-status-badge neo-inset" style="flex-direction: column; gap: 5px;">
        <div style="display: flex; align-items: center; gap: 10px;">
            <span id="sideDot" class="dot"></span>
            <span id="sideStatusText">CONNECTING...</span>
        </div>
        <div style="font-size: 0.65rem; color: var(--primary); margin-top: 5px;">Cloud ID: <strong id="cloudIdDisplay">--</strong></div>
    </div>
</nav>

<!-- MAIN CONTENT AREA -->
<main class="main-content">
    
    <!-- ========================================== -->
    <!-- VIEW: DASHBOARD -->
    <!-- ========================================== -->
    <section id="view-dashboard" class="view active">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 20px; align-items: center;">
                <span>Server API Ping: <strong id="pingVal">-- ms</strong></span>
                <span>Last Refresh: <strong id="lastRxTime">--:--:--</strong></span>
            </div>
        </div>

        <div class="grid-2">
            <!-- Core Dials -->
            <div class="panel neo-flat">
                <div class="panel-title">Cylinder Payload <i class="ph-fill ph-fire"></i></div>
                <div class="dial-wrap">
                    <div class="dial-outer">
                        <div class="dial-fill" id="gasDial"></div>
                        <div class="dial-inner">
                            <span class="data-value" id="dashWeight">0.0</span>
                            <span class="data-unit">KG</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 10px;">
                    <div class="data-label" style="justify-content: center;"><i class="ph-fill ph-map-pin"></i> Adaptive ETA</div>
                    <div style="font-size: 1.3rem; font-weight: 900; color: var(--primary-dark);" id="dashETA">Calculating...</div>
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-top: 5px;" id="dashDate">Gathering telemetry...</div>
                </div>
            </div>

            <!-- Live Stats & Logs -->
            <div style="display: flex; flex-direction: column; gap: 30px;">
                <div class="grid-2">
                    <div class="neo-inset data-block">
                        <span class="data-label"><i class="ph-fill ph-wind"></i> Air Quality (MQ-6)</span>
                        <span class="data-value" id="dashGas">0</span>
                        <span class="data-unit" style="margin-bottom: 5px;">PPM RAW</span>
                        <!-- Custom Progress Bar -->
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" id="gasProgressBar"></div>
                        </div>
                    </div>
                    <div class="neo-inset data-block" id="safetyBlock">
                        <span class="data-label"><i class="ph-fill ph-shield-check"></i> Safety Protocol</span>
                        <span class="data-value" id="dashSafety" style="font-size: 1.5rem; color: var(--success); margin-top: 15px;">SECURE</span>
                    </div>
                </div>
                
                <div class="panel neo-flat" style="margin: 0; flex-grow: 1;">
                    <div class="panel-title">System Event Stream <i class="ph-fill ph-terminal-window"></i></div>
                    <div class="neo-inset log-window" id="eventLog">
                        <!-- Logs injected here -->
                        <div class="log-entry"><span class="log-time">[SYSTEM]</span> Kernel loaded. Automatically connecting to hardware API...</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ========================================== -->
    <!-- VIEW: ANALYTICS -->
    <!-- ========================================== -->
    <section id="view-analytics" class="view">
        <div class="panel neo-flat">
            <div class="panel-title">
                Telemetry Analytics <i class="ph-fill ph-chart-polar"></i>
                <button class="neo-btn" style="padding: 8px 15px; font-size: 0.8rem;" onclick="exportCSV()"><i class="ph-bold ph-download-simple"></i> EXPORT CSV</button>
            </div>
            <div class="neo-inset" style="height: 400px; padding: 15px;">
                <canvas id="liveChart"></canvas>
            </div>
        </div>
        
        <div class="grid-3">
            <div class="neo-inset data-block">
                <span class="data-label"><i class="ph-fill ph-trend-up"></i> Peak Gas Value</span>
                <span class="data-value" id="statPeakGas">0</span>
            </div>
            <div class="neo-inset data-block">
                <span class="data-label"><i class="ph-fill ph-trend-down"></i> Lowest Weight</span>
                <span class="data-value" id="statLowWeight">0.0 <span class="data-unit">kg</span></span>
            </div>
            <div class="neo-inset data-block">
                <span class="data-label"><i class="ph-fill ph-timer"></i> Session Duration</span>
                <span class="data-value" id="statDuration">0m</span>
            </div>
        </div>
    </section>

    <!-- ========================================== -->
    <!-- VIEW: HARDWARE -->
    <!-- ========================================== -->
    <section id="view-hardware" class="view">
        <div class="grid-2">
            <!-- Actuators -->
            <div class="panel neo-flat">
                <div class="panel-title">Hardware Overrides <i class="ph-fill ph-game-controller"></i></div>
                
                <div class="neo-inset control-row">
                    <span style="font-weight: 700; display: flex; align-items: center; gap: 8px;"><i class="ph-fill ph-lightbulb"></i> Status LED Pattern</span>
                    <select class="neo-input" style="width: auto; background: var(--bg); border-radius: 8px; box-shadow: 2px 2px 5px var(--shadow-dark);" id="ledSelect" onchange="cmd('led', this.value)">
                        <option value="0">0 - Power Off</option>
                        <option value="1">1 - Solid On</option>
                        <option value="2">2 - Slow Blink</option>
                        <option value="3">3 - Fast Blink (Alert)</option>
                        <option value="4">4 - Heartbeat</option>
                    </select>
                </div>
                
                <div class="neo-inset control-row">
                    <span style="font-weight: 700; display: flex; align-items: center; gap: 8px;"><i class="ph-fill ph-fan"></i> 1-Channel Relay (Fan)</span>
                    <label class="switch">
                        <input type="checkbox" id="relayCheck" onchange="cmd('relay', this.checked?'1':'0')">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="neo-inset control-row">
                    <span style="font-weight: 700; display: flex; align-items: center; gap: 8px;"><i class="ph-fill ph-speaker-high"></i> Local Buzzer Alarm</span>
                    <label class="switch">
                        <input type="checkbox" id="buzzerCheck" onchange="cmd('buzzer', this.checked?'1':'0')">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="neo-inset control-row" style="border-left: 4px solid var(--danger);">
                    <span style="font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--danger);"><i class="ph-fill ph-bell-slash"></i> Mute Safety Alarm (Override)</span>
                    <label class="switch">
                        <input type="checkbox" id="muteCheck" onchange="cmd('mute', this.checked?'1':'0')">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div style="margin-top: 30px;">
                    <button class="neo-btn danger" style="width: 100%;" onclick="cmd('tare', '1')"><i class="ph-bold ph-warning"></i> EXECUTE HX711 ZERO SCALE</button>
                    <p style="font-size: 0.75rem; text-align: center; color: var(--text-muted); margin-top: 10px;">Warning: Ensure load cell is completely empty before executing.</p>
                </div>
            </div>

            <!-- Diagnostics -->
            <div class="panel neo-flat">
                <div class="panel-title">MCU Diagnostic Stream <i class="ph-fill ph-heartbeat"></i></div>
                <div class="grid-2" style="gap: 15px;">
                    <div class="neo-inset data-block" style="padding: 15px;">
                        <span class="data-label"><i class="ph-fill ph-scales"></i> Live Weight</span>
                        <span id="diagWeight" style="font-weight: 800; color: var(--primary); font-size: 1.2rem;">0.00 kg</span>
                    </div>
                    <div class="neo-inset data-block" style="padding: 15px;">
                        <span class="data-label"><i class="ph-fill ph-cable-car"></i> HX711 Bus</span>
                        <div style="display: flex; flex-direction: column;">
                            <span id="diagHx" style="font-weight: 800; color: var(--warning); font-size: 1.2rem;">STANDBY</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">RAW: <span id="diagRawHx">0</span></span>
                            <div id="hxDiagMsg" style="font-size: 0.65rem; font-weight: 800; margin-top: 5px; color: var(--text-muted);">WAITING FOR DATA...</div>
                        </div>
                    </div>
                    <div class="neo-inset data-block" style="padding: 15px;">
                        <span class="data-label"><i class="ph-fill ph-memory"></i> Free Heap</span>
                        <span id="diagHeap" style="font-weight: 800; font-size: 1.2rem;">-- KB</span>
                    </div>
                    <div class="neo-inset data-block" style="padding: 15px;">
                        <span class="data-label"><i class="ph-fill ph-gauge"></i> CPU Clock</span>
                        <span id="diagCpu" style="font-weight: 800; font-size: 1.2rem;">-- MHz</span>
                    </div>
                    <div class="neo-inset data-block" style="padding: 15px;">
                        <span class="data-label"><i class="ph-fill ph-wifi-high"></i> WLAN RSSI</span>
                        <span id="diagRssi" style="font-weight: 800; font-size: 1.2rem;">-- dBm</span>
                    </div>
                    <div class="neo-inset data-block" style="padding: 15px;">
                        <span class="data-label"><i class="ph-fill ph-clock-counter-clockwise"></i> Uptime</span>
                        <span id="diagUptime" style="font-weight: 800; font-size: 1.2rem;">--h --m --s</span>
                    </div>
                </div>

                <div class="neo-inset" style="margin-top: 20px; padding: 15px; border: 2px dashed var(--primary);">
                    <div style="font-weight: 800; color: var(--primary); margin-bottom: 10px;"><i class="ph-fill ph-scales"></i> Scale Calibration Wizard</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
                        1. Empty the scale and click ZERO SCALE.<br>
                        2. Place a known physical weight on the scale.<br>
                        3. Enter the weight below and click Calibrate.
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" id="calWeightInput" class="neo-input" placeholder="Weight (e.g. 1.5)" step="0.1" style="flex: 1;">
                        <button class="neo-btn" style="background: var(--primary); color: white;" onclick="cmd('calibrate', document.getElementById('calWeightInput').value)"><i class="ph-bold ph-check"></i> CALIBRATE</button>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.8rem; font-weight: 700; color: var(--warning);">Current Cal. Factor: <span id="diagCalFactor">--</span></div>
                </div>
            </div>
        </div>
    </section>

    <!-- ========================================== -->
    <!-- VIEW: AI ASSISTANT -->
    <!-- ========================================== -->
    <section id="view-ai" class="view">
        <div class="panel neo-flat" style="height: 100%; display: flex; flex-direction: column;">
            <div class="panel-title">Groq LLaMA-3 Intelligence Core <i class="ph-fill ph-robot"></i></div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
                Execute the AI engine to process live hardware telemetry. The neural network will analyze consumption rates and safety anomalies automatically. <br>
                <em>(Note: Requires your phone to use mobile data while connected to the AP to reach Groq Cloud).</em>
            </p>
            
            <div class="ai-terminal" id="terminalOut">
                > SYSTEM READY.<br>
                > Awaiting LLM execution command...<br>
            </div>
            
            <button class="neo-btn" style="margin-top: 20px; width: 100%; background: var(--primary-dark); color: white;" onclick="runAI()">
                <i class="ph-bold ph-lightning"></i> INITIALIZE AI ANALYSIS
            </button>
        </div>
    </section>

</main>

<script>
    // --- Navigation Logic ---
    function nav(viewId, el) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        el.classList.add('active');
    }

    // --- Global State ---
    let isConnected = false;
    let pollTimer = null;
    
    // Stats for Analytics & CSV
    let peakGas = 0;
    let lowestWeight = 999;
    let sessionStart = Date.now();
    let csvData = [["Timestamp", "Weight_kg", "Gas_Raw", "Leak_Alert"]];

    // --- Google Maps Style Adaptive ETA Engine ---
    const TARE_WEIGHT = 14.2; // Standard empty cylinder weight
    const TOTAL_GAS = 12.0;   // Net gas weight
    const CYLINDER_PRICE = 1500; // Local currency cost
    
    let historyDB = JSON.parse(localStorage.getItem('gasHistory') || '{}');
    let adaptiveRate = 0.5; // default fallback: 0.5kg/day
    let aiContextStr = "";

    function updateAdaptiveAnalytics(currentWeight) {
        if(currentWeight < TARE_WEIGHT) currentWeight = TARE_WEIGHT; // Clamp negative
        let gasRem = currentWeight - TARE_WEIGHT;
        if(gasRem < 0) gasRem = 0;
        
        let today = new Date().toISOString().split('T')[0];
        
        // Save today's lowest weight to simulate usage/history
        if(!historyDB[today] || currentWeight < historyDB[today]) {
            historyDB[today] = parseFloat(currentWeight.toFixed(2));
            localStorage.setItem('gasHistory', JSON.stringify(historyDB));
        }

        // Calculate usage slope (last N days)
        let days = Object.keys(historyDB).sort();
        if(days.length >= 2) {
            let firstDay = days[0];
            let lastDay = days[days.length-1];
            let dateDiff = (new Date(lastDay) - new Date(firstDay)) / (1000 * 3600 * 24);
            let weightDiff = historyDB[firstDay] - historyDB[lastDay];
            
            if(dateDiff > 0 && weightDiff > 0) {
                adaptiveRate = weightDiff / dateDiff; // actual dynamic kg/day
            }
        }
        
        // Calculate ETA & Dates
        let daysLeft = gasRem / adaptiveRate;
        let depletionDate = "Analyzing...";
        
        if(isFinite(daysLeft) && daysLeft < 365) {
            let dDate = new Date();
            dDate.setDate(dDate.getDate() + daysLeft);
            depletionDate = dDate.toLocaleDateString('en-US', {weekday: 'short', month: 'long', day: 'numeric'});
        }

        document.getElementById('dashETA').innerText = isFinite(daysLeft) ? `~${Math.floor(daysLeft)} Days Left` : 'Analyzing Data...';
        document.getElementById('dashDate').innerText = `Est. Empty: ${depletionDate}`;
        
        // Inject rich context for the AI
        aiContextStr = `Cylinder Status: Gas Remaining=${gasRem.toFixed(2)}kg. 
Dynamic Consumption Rate=${adaptiveRate.toFixed(2)}kg/day. 
Expected Empty Date=${depletionDate}. 
Usage History JSON: ${JSON.stringify(historyDB)}.
Cylinder Price=${CYLINDER_PRICE} (Cost per kg: ${(CYLINDER_PRICE/TOTAL_GAS).toFixed(2)}).`;
    }

    // --- Toast Notifications ---
    function showToast(message, type = "info") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = "ph-info";
        if(type === "success") icon = "ph-check-circle";
        if(type === "error") icon = "ph-warning-circle";

        toast.innerHTML = `<i class="ph-fill ${icon}" style="font-size:1.5rem;"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4500);
    }

    // Chart.js Setup
    const ctx = document.getElementById('liveChart').getContext('2d');
    const liveChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Weight (kg)', borderColor: '#3182ce', backgroundColor: 'rgba(49, 130, 206, 0.1)', data: [], yAxisID: 'y', fill: true, tension: 0.3 },
            { label: 'MQ-6 Gas', borderColor: '#e53e3e', data: [], yAxisID: 'y1', tension: 0.3, borderDash: [5,5] }
        ]},
        options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { x: { display: false }, y: { type: 'linear', position: 'left', min:0, max:30 }, y1: { type: 'linear', position: 'right', min:0, max:4000, grid: { drawOnChartArea: false } } } }
    });

    // --- Logging System ---
    function logEvent(msg, type="info") {
        const logWin = document.getElementById('eventLog');
        const time = new Date().toLocaleTimeString();
        let color = type==="error" ? "var(--danger)" : type==="warn" ? "var(--warning)" : "var(--text-dark)";
        logWin.innerHTML += `<div class="log-entry"><span class="log-time">[${time}]</span> <span style="color:${color}">${msg}</span></div>`;
        logWin.scrollTop = logWin.scrollHeight;
    }

    // --- Auto Connection Status ---
    function updateStatusUI(connected, ping = 0) {
        if(!isConnected && connected) {
            showToast("Hardware API Connected!", "success");
            logEvent("Established hardware API uplink.", "success");
        }
        if(isConnected && !connected) {
            showToast("Connection Lost!", "error");
            logEvent("Connection lost! Retrying...", "error");
        }
        
        isConnected = connected;
        document.getElementById('sideDot').className = connected ? "dot active" : "dot";
        document.getElementById('sideStatusText').innerText = connected ? "SYSTEM ONLINE" : "DISCONNECTED";
        document.getElementById('pingVal').innerText = connected ? `${ping} ms` : "-- ms";
    }

    // --- Data Fetching (Local & Cloud MQTT) ---
    let lastData = null;
    let useMQTT = false;
    let mqttClient = null;
    let urlParams = new URLSearchParams(window.location.search);
    let deviceId = urlParams.get('id');

    async function fetchData() {
        const start = Date.now();
        try {
            const res = await fetch(`/api/data`);
            if(!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            const ping = Date.now() - start;
            
            updateStatusUI(true, ping);
            processData(data);
            lastData = data;
        } catch (e) {
            updateStatusUI(false);
        }
    }

    // Start automatically
    window.onload = () => {
        if (deviceId) {
            // Cloud Mode (External Access)
            useMQTT = true;
            document.getElementById('cloudIdDisplay').innerText = deviceId;
            logEvent("Cloud ID detected. Initializing Global Uplink...", "info");
            
            mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
            
            mqttClient.on('connect', () => {
                showToast("Connected to Global Cloud!", "success");
                logEvent("MQTT Cloud connected successfully.", "success");
                updateStatusUI(true, 0);
                mqttClient.subscribe(`lpg_guardian/${deviceId}/data`);
            });
            
            mqttClient.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    processData(data);
                    lastData = data;
                    updateStatusUI(true, 0); // Keep alive visual
                } catch(err) {
                    console.error("Parse error", err);
                }
            });
            
            mqttClient.on('error', (err) => {
                logEvent("Cloud connection error.", "error");
                updateStatusUI(false);
            });
            
            mqttClient.on('offline', () => {
                updateStatusUI(false);
            });
            
        } else {
            // Local Mode
            fetchData();
            setInterval(fetchData, 1000); // 1Hz Polling
        }
    };

    function processData(d) {
        document.getElementById('lastRxTime').innerText = new Date().toLocaleTimeString();
        if(d.device_id && !deviceId) document.getElementById('cloudIdDisplay').innerText = d.device_id;

        // 1. Dashboard Weight Updates
        document.getElementById('dashWeight').innerText = d.weight_kg.toFixed(1);
        
        // Dynamic Dial Colors & Progress
        let gasRem = d.weight_kg - TARE_WEIGHT; // Using global Tare
        if(gasRem < 0) gasRem = 0;
        let p = (gasRem / TOTAL_GAS) * 100;
        if(p>100) p=100;
        
        let dialColor = "var(--success)";
        if(p < 40 && p > 15) dialColor = "var(--warning)";
        if(p <= 15) dialColor = "var(--danger)";
        
        document.getElementById('gasDial').style.background = `conic-gradient(${dialColor} ${p}%, transparent 0%)`;

        // Process Adaptive ETA
        updateAdaptiveAnalytics(d.weight_kg);

        // 2. Gas Reading & Dynamic Progress Bar
        document.getElementById('dashGas').innerText = d.gas_raw;
        let gasP = (d.gas_raw / 4095) * 100; // ESP32 ADC max is 4095
        const bar = document.getElementById('gasProgressBar');
        bar.style.width = `${gasP}%`;
        bar.style.background = (d.gas_raw > 1500) ? "var(--danger)" : (d.gas_raw > 800) ? "var(--warning)" : "var(--success)";

        // 3. Safety Alert Visuals
        let safeSpan = document.getElementById('dashSafety');
        let body = document.getElementById('appBody');
        
        if(d.leak_alert) {
            if(safeSpan.innerText !== "DANGER ZONE") {
                logEvent("CRITICAL: Gas Leak Detected!", "error");
                showToast("CRITICAL GAS LEAK DETECTED!", "error");
            }
            safeSpan.innerText = "DANGER ZONE"; 
            safeSpan.style.color = "var(--danger)";
            body.classList.add('alert-mode'); // Pulses entire screen
        } else {
            if(safeSpan.innerText === "DANGER ZONE") {
                logEvent("Safety normalized.", "info");
                showToast("Safety Restored", "success");
            }
            safeSpan.innerText = "SECURE"; 
            safeSpan.style.color = "var(--success)";
            body.classList.remove('alert-mode');
        }

        // 4. Analytics Data Store
        if(d.gas_raw > peakGas) peakGas = d.gas_raw;
        if(d.weight_kg < lowestWeight && d.weight_kg > 0) lowestWeight = d.weight_kg;
        document.getElementById('statPeakGas').innerText = peakGas;
        document.getElementById('statLowWeight').innerText = lowestWeight === 999 ? "0.0" : lowestWeight.toFixed(1) + " kg";
        document.getElementById('statDuration').innerText = Math.floor((Date.now() - sessionStart)/60000) + "m";

        const t = new Date().toLocaleTimeString();
        if(liveChart.data.labels.length > 30) { 
            liveChart.data.labels.shift(); 
            liveChart.data.datasets[0].data.shift(); 
            liveChart.data.datasets[1].data.shift(); 
        }
        liveChart.data.labels.push(t);
        liveChart.data.datasets[0].data.push(d.weight_kg);
        liveChart.data.datasets[1].data.push(d.gas_raw);
        liveChart.update();
        
        csvData.push([t, d.weight_kg.toFixed(2), d.gas_raw, d.leak_alert]);

        // 5. Hardware Diagnostics Updates
        let h = Math.floor(d.uptime_sec/3600); let m = Math.floor((d.uptime_sec%3600)/60); let s = d.uptime_sec%60;
        document.getElementById('diagUptime').innerText = `${h}h ${m}m ${s}s`;
        document.getElementById('diagRssi').innerText = `${d.wifi_rssi} dBm`;
        document.getElementById('diagCpu').innerText = `${d.cpu_freq} MHz`;
        document.getElementById('diagHeap').innerText = `${(d.free_heap/1024).toFixed(1)} KB`;
        
        if (d.weight_kg !== undefined) {
            document.getElementById('diagWeight').innerText = `${d.weight_kg.toFixed(2)} kg`;
        }
        
        if (d.hx711_raw !== undefined) {
            document.getElementById('diagRawHx').innerText = d.hx711_raw;
            const hxMsg = document.getElementById('hxDiagMsg');
            const hx = document.getElementById('diagHx');
            
            if (!d.hx711_ready) {
                hxMsg.innerHTML = "CRITICAL ERROR: Chip not responding.<br><span style='color:var(--text-dark)'>Check DOUT (Pin 16) & SCK (Pin 4) to ESP32. Ensure 3.3V power.</span>";
                hxMsg.style.color = "var(--danger)";
                hx.innerText = "HARDWARE FAULT";
                hx.style.color = "var(--danger)";
            } else if (Math.abs(d.hx711_raw) >= 8300000) {
                hxMsg.innerHTML = "ANALOG ERROR: ADC Maxed Out.<br><span style='color:var(--text-dark)'>Action: The 4 load cell wires (Red/Black/White/Green) are unsoldered, loose, or broken. Solder E+, E-, A+, A-.</span>";
                hxMsg.style.color = "var(--danger)";
                hx.innerText = "WIRING FAULT";
                hx.style.color = "var(--danger)";
            } else if (d.hx711_raw === 0 || d.hx711_raw === -1 || d.hx711_noise === 0) {
                hxMsg.innerHTML = "DATA ERROR: Reading Zeros (Variance: 0).<br><span style='color:var(--text-dark)'>Action: DOUT wire is shorted/grounded or HX711 chip is crashed. Reset power.</span>";
                hxMsg.style.color = "var(--danger)";
                hx.innerText = "DATA FAULT";
                hx.style.color = "var(--danger)";
            } else if (d.hx711_noise > 10000) {
                hxMsg.innerHTML = "SEVERE NOISE (Variance: " + d.hx711_noise + ").<br><span style='color:var(--text-dark)'>Action: Wires are loose or unsoldered. Electromagnetic interference is blocking the true signal. Solder all pins.</span>";
                hxMsg.style.color = "var(--danger)";
                hx.innerText = "NOISE FAULT";
                hx.style.color = "var(--danger)";
            } else if (d.weight_kg === 0 && Math.abs(d.hx711_raw) > 50 && Math.abs(d.hx711_raw) < 50000) {
                hxMsg.innerHTML = "CALIBRATION ISSUE: Sensor works but weight is 0.00.<br><span style='color:var(--text-dark)'>Action: The 200kg metal is not bending enough, OR you need to run the Calibration Wizard below.</span>";
                hxMsg.style.color = "var(--warning)";
                hx.innerText = "CALIBRATE NOW";
                hx.style.color = "var(--warning)";
            } else {
                hxMsg.innerHTML = "SYSTEM NOMINAL: Wires soldered, DOUT/SCK stable, reading analog microvolts perfectly (Noise Variance: " + d.hx711_noise + ").";
                hxMsg.style.color = "var(--success)";
                hx.innerText = "ONLINE";
                hx.style.color = "var(--success)";
            }
        }
        
        if (d.cal_factor) {
            document.getElementById('diagCalFactor').innerText = d.cal_factor;
        }

        // Sync Actuators safely
        if(!document.getElementById('ledSelect').matches(':focus')) document.getElementById('ledSelect').value = d.led_mode;
        if(!document.getElementById('relayCheck').matches(':active')) document.getElementById('relayCheck').checked = d.relay_state;
        if(!document.getElementById('buzzerCheck').matches(':active')) document.getElementById('buzzerCheck').checked = d.buzzer_state;
        if(!document.getElementById('muteCheck').matches(':active')) document.getElementById('muteCheck').checked = d.alarm_muted;
    }

    // --- Hardware Control API ---
    async function cmd(device, val) {
        if(!isConnected) { 
            logEvent(`Failed to send ${device} command: Not connected.`, "warn"); 
            showToast("System Offline!", "error");
            return; 
        }
        logEvent(`Transmitting command: ${device} -> ${val}`);
        
        if (useMQTT && mqttClient) {
            // Send via Cloud
            mqttClient.publish(`lpg_guardian/${deviceId}/control`, `${device}=${val}`);
            logEvent(`Command dispatched via Cloud MQTT.`, "success");
            showToast("Cloud Command Sent", "success");
        } else {
            // Send Local
            try {
                const res = await fetch(`/api/control?device=${device}&value=${val}`);
                if(!res.ok) throw new Error("API Reject");
                logEvent(`Command verified by hardware.`, "success");
                showToast("Hardware Override Successful", "success");
            } catch(e) {
                logEvent(`Command execution failed: ${e.message}`, "error");
                showToast("Command Failed!", "error");
            }
        }
    }

    // --- CSV Export Tool ---
    function exportCSV() {
        if(csvData.length <= 1) {
            showToast("No telemetry data to export.", "error");
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "lpg_telemetry_" + Date.now() + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Telemetry Exported Successfully", "success");
    }

    // --- AI Integration ---
    const GROQ_API = "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";
    async function runAI() {
        const term = document.getElementById('terminalOut');
        if(!lastData) { 
            term.innerHTML += `> <span style="color:var(--danger)">ERROR: NO TELEMETRY DATA. Establish uplink to hardware first.</span><br>`; 
            return; 
        }
        
        term.innerHTML += `<br>> <strong>Transmitting encrypted telemetry payload to Groq Cloud...</strong><br>`;
        term.scrollTop = term.scrollHeight;

        const prompt = `System is LPG Guardian OS Pro. 
Real-time Analytics Context: 
${aiContextStr}

User request: "Provide a complete breakdown of my gas usage. Explain how much gas is left, predict the exact date it will run out based on my usage rate, and analyze my daily cost. Tell me which days I used the most gas (if available in history)."

Act as the advanced AI OS. Break down the analytics beautifully. Be highly intelligent, referencing the exact dates, costs, and historical JSON trends provided. Use a highly professional mix of English and Bengali.`;

        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST", headers: { "Authorization": `Bearer ${GROQ_API}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "user", content: prompt }] })
            });
            const data = await res.json();
            
            if (!res.ok || data.error) {
                throw new Error(data.error ? data.error.message : "API Error (HTTP " + res.status + ")");
            }
            
            const text = data.choices[0].message.content;
            
            term.innerHTML += `> <span style="color:var(--success)">DECRYPTED RESPONSE RECEIVED:</span><br><br>`;
            
            let i = 0;
            function type() {
                if (i < text.length) {
                    term.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
                    term.scrollTop = term.scrollHeight;
                    i++; setTimeout(type, 15);
                } else {
                    term.innerHTML += `<br><br>> Uplink Terminated.<br>`;
                }
            }
            type();
        } catch(e) {
            term.innerHTML += `> <span style="color:var(--danger)">API EXCEPTION: ${e.message}</span><br>`;
        }
    }
</script>
</body>
</html>

)rawliteral";
