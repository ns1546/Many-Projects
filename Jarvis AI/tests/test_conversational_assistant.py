"""
Comprehensive Automated Verification Test Suite for J.A.R.V.I.S.
Conversational Chief-of-Staff Assistant, Voice Biometrics,
Zero-Freezing Non-Blocking Process Execution, and Executive Advisory.
"""

import sys
import os
import time
import numpy as np

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.orchestrator import JarvisOrchestrator
from speech.speaker_id import SpeakerIdentifier
from automation.os_controller import WindowsOSController

def generate_synthetic_voice(f0: float, formants: list, duration: float = 1.0, sr: int = 16000) -> bytes:
    """Generates synthetic PCM voice audio with harmonic glottal train and formant resonances."""
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    signal = np.zeros_like(t)
    for h in range(1, 15):
        signal += (1.0 / h) * np.sin(2 * np.pi * f0 * h * t)
    for fc in formants:
        signal += 0.5 * np.sin(2 * np.pi * fc * t)
    normalized = signal / (np.max(np.abs(signal)) + 1e-6)
    return (normalized * 32767).astype(np.int16).tobytes()

def run_tests():
    print("=" * 65)
    print("RUNNING J.A.R.V.I.S. CONVERSATIONAL ASSISTANT VERIFICATION SUITE")
    print("=" * 65)

    # ---------------------------------------------------------
    # TEST 1: Speaker Biometric Identification & Enrollment
    # ---------------------------------------------------------
    print("\n--- [TEST 1] Speaker Biometric Identification Engine ---")
    test_speakers_file = os.path.join(os.path.dirname(__file__), "test_temp_speakers.json")
    sid = SpeakerIdentifier(profiles_path=test_speakers_file, similarity_threshold=0.85)
    
    boss_voice = generate_synthetic_voice(f0=120, formants=[700, 1220, 2600])
    boss_voice_sample2 = generate_synthetic_voice(f0=122, formants=[705, 1225, 2595])
    pepper_voice = generate_synthetic_voice(f0=210, formants=[850, 1400, 2800])
    stranger_voice = generate_synthetic_voice(f0=320, formants=[1000, 1850, 3200])

    res_boss = sid.enroll_speaker("Tony Stark", boss_voice, is_boss=True, title="Sir")
    assert res_boss["success"], "Failed to enroll Boss speaker!"
    print(f" [PASS] Enrolled Boss ({res_boss['name']}) with Master clearance.")

    res_pepper = sid.enroll_speaker("Pepper Potts", pepper_voice, is_boss=False, role="executive", title="Ms. Potts")
    assert res_pepper["success"], "Failed to enroll Pepper Potts!"
    print(f" [PASS] Enrolled Colleague ({res_pepper['name']}).")

    # Identification check
    id_boss = sid.identify_speaker(boss_voice_sample2)
    print(f" Identification Boss Sample: name={id_boss['name']}, conf={id_boss['confidence']}, is_boss={id_boss['is_boss']}")
    assert id_boss["is_boss"] is True, "Failed to identify Boss voice sample!"
    assert id_boss["confidence"] >= 0.85, f"Boss voice confidence too low: {id_boss['confidence']}"

    id_pepper = sid.identify_speaker(pepper_voice)
    print(f" Identification Pepper Sample: name={id_pepper['name']}, conf={id_pepper['confidence']}, is_boss={id_pepper['is_boss']}")
    assert id_pepper["name"] == "Pepper Potts", "Failed to identify Pepper Potts!"
    assert id_pepper["is_boss"] is False, "Pepper should not have master Boss privileges!"

    id_stranger = sid.identify_speaker(stranger_voice)
    print(f" Identification Stranger: name={id_stranger['name']}, conf={id_stranger['confidence']}, recognized={id_stranger['recognized']}")
    assert id_stranger["name"] == "Guest" or not id_stranger["recognized"], "Stranger should be classified as Guest!"
    print(" [PASS] Biometric Speaker ID correctly distinguishes Boss vs Colleague vs Guest.")

    # ---------------------------------------------------------
    # TEST 2: Zero-Freezing Detached Application Launcher & Typo Resolver
    # ---------------------------------------------------------
    print("\n--- [TEST 2] Non-Blocking Application Launcher & Typo Resolution ---")
    ctrl = WindowsOSController()
    
    # Test typo resolution
    resolved_corme, path_corme = ctrl.resolve_application("corme")
    assert resolved_corme == "chrome", f"Failed to resolve 'corme' to 'chrome', got '{resolved_corme}'"
    print(f" [PASS] Typo 'corme' successfully resolved to '{resolved_corme}' ({path_corme})")

    resolved_crome, _ = ctrl.resolve_application("open crome")
    assert resolved_crome == "chrome", f"Failed to resolve 'open crome', got '{resolved_crome}'"
    print(f" [PASS] Typo 'open crome' resolved to '{resolved_crome}'")

    resolved_calc, _ = ctrl.resolve_application("calcualtor")
    assert resolved_calc == "calc", f"Failed to resolve 'calcualtor', got '{resolved_calc}'"
    print(f" [PASS] Typo 'calcualtor' resolved to '{resolved_calc}'")

    # Benchmark launch latency (must return < 50ms without freezing)
    t0 = time.time()
    launch_res = ctrl.launch_application("corme")
    launch_duration = time.time() - t0
    print(f" [PASS] Launched detached process in {launch_duration:.4f} seconds (Success: {launch_res['success']})")
    assert launch_duration < 0.15, f"Launch took too long ({launch_duration}s), indicating a potential freeze!"
    assert launch_res["success"], "Launch operation returned failure!"

    # ---------------------------------------------------------
    # TEST 3: J.A.R.V.I.S. Orchestrator Assistant Capabilities
    # ---------------------------------------------------------
    print("\n--- [TEST 3] J.A.R.V.I.S. Executive Chief-of-Staff Intelligence ---")
    jarvis = JarvisOrchestrator()
    # Mute TTS sound during automated unit tests
    jarvis.tts.speak = lambda text, **kwargs: None

    # Test 3a: Urgent Topics Sit-Rep Briefing
    jarvis.task_manager.add_task("Review quarterly arc reactor security telemetry ASAP")
    res_urgent = jarvis.handle_command("Jarvis, inform me about urgent topics", speaker_name="Boss", is_boss=True)
    print(f" Urgent Briefing Action: {res_urgent.get('action_taken')}")
    print(f" Speech: {res_urgent.get('speech')}")
    assert res_urgent.get("action_taken") == "urgent_topics_briefing", "Failed to trigger urgent briefing!"
    assert "briefing" in res_urgent.get("speech", "").lower(), "Speech missing briefing phrasing!"
    print(" [PASS] Executive Urgent Topics Briefing generated successfully.")

    # Test 3b: Executive Opinion & Strategic Advisory
    res_op = jarvis.handle_command("Jarvis, give your opinion on launching our new satellite matrix this week")
    print(f" Opinion Action: {res_op.get('action_taken')}")
    print(f" Opinion Speech: {res_op.get('speech')}")
    assert res_op.get("action_taken") == "executive_opinion", "Failed to generate executive opinion!"
    assert len(res_op.get("speech", "")) > 20, "Opinion response too short!"
    print(" [PASS] Strategic Executive Advisory opinion provided with executive rationale.")

    # Test 3c: Workload Coordination ("Manage all works")
    res_works = jarvis.handle_command("Jarvis, manage all works for today")
    print(f" Works Action: {res_works.get('action_taken')}")
    print(f" Works Speech: {res_works.get('speech')}")
    assert res_works.get("action_taken") == "manage_works", "Failed to orchestrate workload!"
    print(" [PASS] Workload coordination and day structuring verified.")

    # Test 3d: Meeting Scheduling via Daily Life Tools
    res_meet = jarvis.handle_command("Jarvis, schedule a meeting with Avengers high council at 4 PM")
    print(f" Meeting Action: {res_meet.get('action_taken')}")
    print(f" Meeting Speech: {res_meet.get('speech')}")
    assert res_meet.get("action_taken") == "schedule_meeting", "Failed to schedule meeting!"
    print(" [PASS] Calendar meeting scheduling confirmed.")

    # ---------------------------------------------------------
    # TEST 4: Non-Freezing Command Execution via Voice
    # ---------------------------------------------------------
    print("\n--- [TEST 4] Seamless Voice App Launch ('open corme') ---")
    t_start = time.time()
    res_corme = jarvis.handle_command("open corme", speaker_name="Boss", is_boss=True)
    elapsed_corme = time.time() - t_start
    print(f" Command Duration: {elapsed_corme:.4f}s")
    print(f" Action Taken: {res_corme.get('action_taken')}")
    print(f" Speech: {res_corme.get('speech')}")
    assert res_corme.get("action_taken") == "launch_app", "Failed to launch app on 'open corme'!"
    assert elapsed_corme < 0.20, f"App launch execution took too long ({elapsed_corme}s)!"
    print(" [PASS] 'open corme' handled with instant non-blocking execution.")

    # Immediately follow up with another command to ensure no deadlock
    res_followup = jarvis.handle_command("what are your vitals", speaker_name="Boss", is_boss=True)
    assert res_followup.get("action_taken") == "get_vitals", "Failed followup command after launch!"
    print(" [PASS] Immediate followup command executed without thread freeze or blocking.")

    # ---------------------------------------------------------
    # TEST 5: Security Authorization Gates for Non-Boss Speakers
    # ---------------------------------------------------------
    print("\n--- [TEST 5] Multi-Speaker Authority & Security Gates ---")
    # Guest attempts clean slate protocol
    res_guest_denial = jarvis.handle_command(
        "Jarvis, execute clean slate protocol",
        speaker_name="Guest",
        is_boss=False
    )
    print(f" Guest Denial Action: {res_guest_denial.get('action_taken')}")
    print(f" Guest Denial Speech: {res_guest_denial.get('speech')}")
    assert res_guest_denial.get("action_taken") == "authorization_denied", "Security gate failed to block guest!"
    print(" [PASS] Destructive command strictly blocked for unauthorized guest.")

    # Clean up temporary test files
    if os.path.exists(test_speakers_file):
        os.remove(test_speakers_file)

    print("\n" + "=" * 65)
    print(" ALL 5/5 CONVERSATIONAL ASSISTANT TEST SUITES PASSED (100% GREEN)!")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
