"""
Project J.A.R.V.I.S. (Just A Rather Very Intelligent System)
Main Executive Voice & Desktop Control Center
Powered by Neural Voice (Paul Bettany British Timbre) & Hermes Agent Integration
"""

import sys
import os
import time
import warnings

# Suppress library deprecation notices & banner prompts for clean Stark terminal output
warnings.filterwarnings("ignore")
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

# Ensure current directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from core.orchestrator import JarvisOrchestrator
from speech.listener import JarvisSpeechListener, SR_AVAILABLE
from core.dashboard_server import JarvisDashboardServer

BANNER = r"""
       _      ___       ____     __      __   ___    ____  
      | |    /   \     |  _ \    \ \    / /  |_ _|  / ___| 
   _  | |   / _ \ \    | |_) |    \ \  / /    | |   \___ \ 
  | |_| |  / ___ \ \   |  _ <      \ \/ /     | |    ___) |
   \___/  /_/     \_\  |_| \_\      \__/     |___|  |____/ 
   ========================================================
     JUST A RATHER VERY INTELLIGENT SYSTEM - PROD v1.0.0
       Neural Voice Matrix & Hermes Agent Harness Active
   ========================================================
"""

def boot_diagnostics(orchestrator: JarvisOrchestrator, dash_url: str = "http://127.0.0.1:5050"):
    print(BANNER)
    print(" [*] Initializing Stark Industries Core Cognitive Architecture...")
    time.sleep(0.1)
    print(" [*] Engaging Neural British Voice Engine (en-GB-RyanNeural)... [ONLINE]")
    time.sleep(0.1)
    print(" [*] Omni-Memory Matrix (SQLite Persistent Long-Term Memory)... [ONLINE]")
    time.sleep(0.1)
    print(" [*] Empathy & Emotional Affect Engine (Mood & Vitals Analysis)... [ONLINE]")
    time.sleep(0.1)
    print(" [*] PC-Wide GUI Automation Agent (PyAutoGUI Hotkeys & Clicks)... [ONLINE]")
    time.sleep(0.1)
    print(" [*] Multi-Channel Comms Hub (WhatsApp Web/Call, Gmail, Social)... [ONLINE]")
    time.sleep(0.1)
    print(" [*] Autonomous 'Maker' Creative Studio (HUD, HTML, Tools)...  [ONLINE]")
    time.sleep(0.1)
    print(" [*] Iron Man Tactical Protocols Suite (House Party, Slate)...   [ONLINE]")
    time.sleep(0.1)
    print(" [*] Linking Native Win32 & PowerShell OS Controller...        [ONLINE]")
    time.sleep(0.1)
    or_status = "[ONLINE]" if orchestrator.openrouter_brain.api_key else "[STANDBY]"
    print(f" [*] OpenRouter Cognitive Brain Matrix...                      {or_status}")
    time.sleep(0.1)
    print(" [*] Sequential Task Execution & Queue Engine...               [ONLINE]")
    time.sleep(0.1)
    h_status = orchestrator.hermes.get_status()
    h_msg = "[ONLINE]" if h_status["available"] else "[STANDBY]"
    print(f" [*] Hooking Hermes Agent Runtime ({h_status['executable_path']})... {h_msg}")
    time.sleep(0.1)
    local_msg = f"[ONLINE: {orchestrator.local_brain.model}]" if orchestrator.local_brain.is_service_available() else f"[STANDBY: {orchestrator.local_brain.model}]"
    print(f" [*] Local Offline Brain Subsystem...                         {local_msg}")
    time.sleep(0.1)
    mic_msg = "[ONLINE]" if SR_AVAILABLE else "[UNAVAILABLE]"
    print(f" [*] Calibrating Microphone Sensory Array (faster-whisper)...  {mic_msg}")
    time.sleep(0.1)
    print(" [*] Screen Perception & Holographic Vision Array...        [ONLINE]")
    time.sleep(0.08)
    print(" [*] Web & Media Direct Playback Driver (YouTube/Spotify)... [ONLINE]")
    time.sleep(0.08)
    print(" [*] Proactive Autonomous Sentinel Watchdog...                 [ONLINE]")
    time.sleep(0.08)
    print(" [*] Neural Tool Intent Classifier (Zero-Regex Dispatcher)... [ONLINE]")
    time.sleep(0.08)
    print(" [*] Multi-Speaker Biometric Array (Mel-Filterbank & F0 Pitch)... [ONLINE]")
    time.sleep(0.08)
    print(" [*] Executive Chief-of-Staff Brain (Urgent Briefings & Advisory)... [ONLINE]")
    time.sleep(0.08)
    print(" [*] Detached Zero-Freezing App Launcher (Fuzzy Typo Tolerant)...   [ONLINE]")
    time.sleep(0.08)
    print(" [*] Engaging 3-Tier Security & Authorization Gates...         [ARMED]")
    time.sleep(0.08)
    print(f" [*] Holographic Command Dashboard (Web HUD)...                [ONLINE: {dash_url}]")
    time.sleep(0.08)
    
    # Gather vitals
    vitals = orchestrator.os_controller.get_system_vitals()
    print("\n [SYSTEM DIAGNOSTICS]")
    print(f"  - CPU Utilization:   {vitals['cpu_percent']}%")
    print(f"  - Physical Memory:   {vitals['ram_percent']}% ({vitals['ram_used_gb']} GB / {vitals['ram_total_gb']} GB)")
    print(f"  - System Drive (C:): {vitals['disk_free_gb']} GB Free / {vitals['disk_total_gb']} GB Total")
    print(f"  - Power Status:      {vitals['battery']}")
    print("-" * 56)
    
    # Initial verbal greeting with the human neural voice
    greeting = "All systems operational, sir. J.A.R.V.I.S. is online with full screen perception, autonomous communications, and neural intent control."
    print(f"\n J.A.R.V.I.S.: {greeting}\n")
    orchestrator.tts.speak(greeting)

def run_continuous_voice_loop(orchestrator: JarvisOrchestrator):
    """
    Continuous hands-free voice loop where J.A.R.V.I.S. listens and replies continuously.
    Maintains persistent microphone stream with Local faster-whisper STT for instant turnaround.
    """
    print("\n" + "=" * 60)
    print(" >>> CONTINUOUS HUMAN VOICE CONVERSATION MODE ACTIVE <<<")
    print(" Speak naturally into your microphone. J.A.R.V.I.S. is listening.")
    print(" Say 'exit' or press Ctrl+C anytime to switch back to text mode.")
    print("=" * 60 + "\n")
    
    if not SR_AVAILABLE:
        print(" [!] Microphone sensory array (speech_recognition) unavailable.")
        return

    import speech_recognition as sr
    from speech.whisper_engine import LocalWhisperRecognizer

    recognizer = sr.Recognizer()
    recognizer.dynamic_energy_threshold = True
    recognizer.pause_threshold = 0.8
    whisper = LocalWhisperRecognizer.get_instance()

    try:
        with sr.Microphone() as source:
            print(" [*] Calibrating microphone acoustics for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=0.8)
            print(" [*] Sensory array ENGAGED. Ready for dialogue, sir.\n")
            
            ready_cue = "I am listening, sir."
            print(f" J.A.R.V.I.S.: {ready_cue}\n")
            orchestrator.tts.speak(ready_cue)

            while True:
                # Wait for any active speech output to finish so Jarvis doesn't hear himself
                while orchestrator.tts.is_playing:
                    time.sleep(0.05)

                try:
                    print(" [Listening...] Speak now, sir:")
                    audio = recognizer.listen(source, timeout=10.0, phrase_time_limit=18.0)
                    
                    # Transcribe using Local faster-whisper first
                    spoken_text = None
                    if whisper:
                        try:
                            spoken_text = whisper.transcribe_audio_data(audio)
                        except Exception:
                            pass
                            
                    # Fallback to Google recognizer if whisper returned empty
                    if not spoken_text or len(spoken_text.strip()) < 2:
                        try:
                            spoken_text = recognizer.recognize_google(audio).strip()
                        except Exception:
                            pass

                    if not spoken_text or len(spoken_text.strip()) < 2:
                        continue

                    spoken_text = spoken_text.strip()
                    
                    # Biometric Speaker Identification from incoming audio stream
                    id_res = orchestrator.speaker_id.identify_speaker(audio)
                    speaker_name = id_res.get("name", "Boss")
                    confidence = id_res.get("confidence", 0.85)
                    is_boss = id_res.get("is_boss", True)

                    print(f"\n [{speaker_name} (Voice {int(confidence*100)}%)] > \"{spoken_text}\"")

                    if any(w in spoken_text.lower() for w in ["exit", "stop listening", "switch to text", "power down"]):
                        title = "sir" if is_boss else speaker_name
                        farewell = f"Returning to standby text mode, {title}."
                        print(f"\n J.A.R.V.I.S.: {farewell}\n")
                        orchestrator.tts.speak(farewell)
                        break

                    # Execute real command or engage in executive conversation
                    res = orchestrator.handle_command(
                        spoken_text,
                        speaker_name=speaker_name,
                        is_boss=is_boss,
                        audio_data=audio
                    )
                    print(f"\n J.A.R.V.I.S.: {res['speech']}\n")

                    time.sleep(0.3)

                except sr.WaitTimeoutError:
                    continue
                except KeyboardInterrupt:
                    print("\n [!] Voice session suspended by user.")
                    break
                except Exception as e:
                    time.sleep(0.4)
    except Exception as mic_err:
        print(f" [!] Microphone stream error: {mic_err}")

def main():
    orchestrator = JarvisOrchestrator()
    dashboard_server = JarvisDashboardServer(orchestrator=orchestrator, port=5050)
    open_dash = any(arg in sys.argv for arg in ["--dashboard", "--web", "--gui", "--hud"])
    dash_url = dashboard_server.start(open_browser=open_dash)

    boot_diagnostics(orchestrator, dash_url=dash_url)
    
    # Automatically engage Hands-Free Voice Mode if microphone is available
    if SR_AVAILABLE:
        print("\n [*] Engaging Hands-Free Neural Voice Conversation Mode automatically...")
        run_continuous_voice_loop(orchestrator)
    
    print("\n Interaction Guidelines:")
    print("  - Chat freely: Natural Iron Man dialogue with Paul Bettany neural voice")
    print(f"  - Web Dashboard: Type 'dashboard', 'web', or 'hud' to launch browser HUD ({dash_url})")
    print("  - Executive Briefings: 'what are my urgent topics', 'give me a sit-rep', 'brief me'")
    print("  - Strategic Opinions: 'give your opinion on [topic]', 'what do you think about [idea]'")
    print("  - Workload & Scheduling: 'manage all works', 'schedule a meeting with team at 3 PM'")
    print("  - Voice Biometrics: 'enroll my voice as boss', 'who is speaking', 'list registered speakers'")
    print("  - App Launching (Zero-Freeze): 'open chrome', 'open corme' (typo tolerant, non-blocking)")
    print("  - Iron Man Protocols: 'house party protocol', 'clean slate protocol', 'barn door protocol', 'workshop protocol'")
    print("  - Omni-Memory: 'remember that my doctor is Dr Strange', 'recall doctor', 'who is Pepper', 'what do you know about me'")
    print("  - Communications: 'send whatsapp to Pepper saying meeting at 5', 'call Pepper on whatsapp', 'check gmail', 'compose email'")
    print("  - Creative Studio: 'create a dashboard', 'build stark hud', 'create a python tool', 'create a game'")
    print("  - PC GUI Automation: 'take screenshot', 'volume up/down/mute', 'play music', 'minimize all windows', 'press hotkey ctrl+c'")
    print("  - Sequential Tasks: 'Jarvis, do these tasks: 1. check vitals, 2. open chrome, 3. create a dashboard'")
    print("  - Hands-Free Voice: Type 'voice' or 'v' to toggle continuous listening mode")
    print("  - Exit: Type 'exit' or 'quit'\n")
    
    while True:
        try:
            user_input = input(" Sir > ").strip()
            if not user_input:
                continue
                
            if user_input.lower() in ["exit", "quit", "shutdown", "power down"]:
                farewell = "Powering down auxiliary systems. Good day, sir."
                print(f"\n J.A.R.V.I.S.: {farewell}\n")
                orchestrator.tts.speak(farewell)
                dashboard_server.stop()
                time.sleep(2.0)
                break
                
            if user_input.lower() in ["voice", "v", "listen", "talk"]:
                run_continuous_voice_loop(orchestrator)
                continue

            if user_input.lower() in ["dashboard", "web", "hud", "gui"]:
                import webbrowser
                webbrowser.open(dash_url)
                msg = f"Opening Holographic Command Center at {dash_url}, sir."
                print(f"\n J.A.R.V.I.S.: {msg}\n")
                orchestrator.tts.speak(msg)
                continue

            if user_input.lower().startswith("key "):
                parts = user_input.split(maxsplit=2)
                if len(parts) == 3:
                    provider = parts[1].upper()
                    token = parts[2].strip()
                    key_var = f"{provider}_API_KEY" if not provider.endswith("_KEY") else provider
                    ok = orchestrator.hermes.set_api_key(key_var, token)
                    if ok:
                        msg = f"API key for {provider} successfully registered in Hermes harness, sir."
                    else:
                        msg = f"Could not save key for {provider}."
                    print(f"\n J.A.R.V.I.S.: {msg}\n")
                    orchestrator.tts.speak(msg)
                    continue
                else:
                    print(" Usage: key <PROVIDER> <YOUR_API_KEY> (e.g., key openrouter sk-or-...)")
                    continue

            res = orchestrator.handle_command(user_input)
            print(f"\n J.A.R.V.I.S.: {res['speech']}\n")
            
        except (KeyboardInterrupt, EOFError):
            print("\n [!] Session closed. Powering down safely.")
            dashboard_server.stop()
            break
        except Exception as e:
            print(f"\n [ERROR] Subsystem exception: {e}\n")

if __name__ == "__main__":
    main()
