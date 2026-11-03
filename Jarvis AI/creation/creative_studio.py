"""
J.A.R.V.I.S. Autonomous Creative & Engineering Studio
Enables Tony Stark-style creation of full applications, interactive web apps,
Python tools, HTML5 games, and executive documents on demand.
Saves projects and automatically launches them for immediate visual gratification.
"""

import os
import re
import json
import webbrowser
from typing import Dict, Any, Optional

class CreativeStudio:
    def __init__(self, workspace_root: Optional[str] = None):
        self.workspace_root = workspace_root or os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.creations_dir = os.path.join(self.workspace_root, "creations")
        os.makedirs(self.creations_dir, exist_ok=True)

    def create_futuristic_dashboard(self, title: str = "STARK INDUSTRIES HUD") -> Dict[str, Any]:
        """
        Creates an interactive Iron Man-style HUD / dashboard in HTML/CSS/JS and launches it.
        """
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} — J.A.R.V.I.S. Interface</title>
    <style>
        :root {{
            --cyan: #00f0ff;
            --blue: #0077ff;
            --gold: #ffb700;
            --bg: #030813;
            --card: rgba(4, 18, 38, 0.75);
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
        body {{
            background: var(--bg);
            color: #d8f3ff;
            min-height: 100vh;
            padding: 30px;
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.08) 0%, transparent 60%),
                linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
            background-size: 100% 100%, 40px 40px, 40px 40px;
        }}
        header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid rgba(0, 240, 255, 0.3);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        h1 {{
            color: var(--cyan);
            letter-spacing: 4px;
            text-transform: uppercase;
            font-size: 26px;
            text-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
        }}
        .badge {{
            background: rgba(0, 240, 255, 0.15);
            border: 1px solid var(--cyan);
            padding: 6px 14px;
            border-radius: 20px;
            color: var(--cyan);
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
        }}
        .card {{
            background: var(--card);
            border: 1px solid rgba(0, 240, 255, 0.25);
            border-radius: 12px;
            padding: 24px;
            backdrop-filter: blur(12px);
            position: relative;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
        }}
        .card:hover {{
            border-color: var(--cyan);
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 240, 255, 0.25);
        }}
        .card h2 {{
            color: var(--cyan);
            font-size: 16px;
            letter-spacing: 2px;
            margin-bottom: 16px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}
        .reactor {{
            width: 140px;
            height: 140px;
            margin: 20px auto;
            border-radius: 50%;
            border: 3px solid var(--cyan);
            box-shadow: 0 0 30px var(--cyan), inset 0 0 30px var(--cyan);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2.5s infinite alternate;
        }}
        .inner-core {{
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: radial-gradient(circle, #fff 0%, var(--cyan) 70%, var(--blue) 100%);
            box-shadow: 0 0 25px #fff;
        }}
        @keyframes pulse {{
            0% {{ transform: scale(0.96); box-shadow: 0 0 20px var(--cyan); }}
            100% {{ transform: scale(1.04); box-shadow: 0 0 45px var(--cyan); }}
        }}
        .metric {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(0, 240, 255, 0.1);
        }}
        .metric-val {{
            color: var(--gold);
            font-weight: bold;
        }}
        button {{
            background: linear-gradient(135deg, var(--blue), var(--cyan));
            border: none;
            color: #000;
            font-weight: bold;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
            margin-top: 15px;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: opacity 0.2s;
        }}
        button:hover {{ opacity: 0.9; }}
    </style>
</head>
<body>
    <header>
        <div>
            <h1>{title}</h1>
            <p style="color: #6d9bb8; font-size: 13px; margin-top: 4px;">J.A.R.V.I.S. AUTONOMOUS CREATIVE SYNTHESIS</p>
        </div>
        <div class="badge">SYSTEM ONLINE</div>
    </header>

    <div class="grid">
        <div class="card">
            <h2>Arc Reactor Core <span>100%</span></h2>
            <div class="reactor">
                <div class="inner-core"></div>
            </div>
            <div class="metric"><span>Output:</span><span class="metric-val">3.8 GJ/sec</span></div>
            <div class="metric"><span>Core Heat:</span><span class="metric-val">340 K (Nominal)</span></div>
            <button onclick="alert('Arc Reactor power routed to propulsion arrays, sir.')">Boost Core Output</button>
        </div>

        <div class="card">
            <h2>Mark Series Telemetry <span>ACTIVE</span></h2>
            <div class="metric"><span>Suit Chassis:</span><span class="metric-val">Mark 85 Nanotech</span></div>
            <div class="metric"><span>Repulsor Integrity:</span><span class="metric-val">100% Fully Armed</span></div>
            <div class="metric"><span>Flight Thrusters:</span><span class="metric-val">Mach 3.2 Max Speed</span></div>
            <div class="metric"><span>Neural Link:</span><span class="metric-val">Synchronized</span></div>
            <button onclick="alert('Nanotech armor prepped for deployment, sir.')">Deploy Armor</button>
        </div>

        <div class="card">
            <h2>Command Matrix <span>ONLINE</span></h2>
            <p style="color: #9ac2dc; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
                Voice sensory arrays and Hermes execution harnesses operational. Standing by for Tony Stark directives.
            </p>
            <div class="metric"><span>Workstation:</span><span class="metric-val">Windows 11 Master</span></div>
            <div class="metric"><span>Cognition:</span><span class="metric-val">Hermes + Qwen 2.5</span></div>
            <button onclick="document.body.style.filter = document.body.style.filter ? '' : 'hue-rotate(180deg)'">Toggle Spectrum Vision</button>
        </div>
    </div>
</body>
</html>
"""
        out_file = os.path.join(self.creations_dir, "stark_hud_dashboard.html")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(html_content)

        webbrowser.open(f"file://{os.path.abspath(out_file)}")
        return {
            "success": True,
            "type": "dashboard",
            "file_path": out_file,
            "summary": "Synthesized and rendered custom Stark Industries HUD Dashboard in your browser, sir."
        }

    def create_custom_html_app(self, app_name: str, code_content: str) -> Dict[str, Any]:
        """Saves and launches an arbitrary HTML5 application created by J.A.R.V.I.S."""
        clean_name = re.sub(r"[^a-zA-Z0-9_\-]", "_", app_name).lower()
        if not clean_name.endswith(".html"):
            clean_name += ".html"

        out_file = os.path.join(self.creations_dir, clean_name)
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(code_content)

        webbrowser.open(f"file://{os.path.abspath(out_file)}")
        return {
            "success": True,
            "file_path": out_file,
            "summary": f"Created and launched application '{clean_name}' in browser, sir."
        }
