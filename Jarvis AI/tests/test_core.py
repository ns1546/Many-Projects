"""
J.A.R.V.I.S. Core Verification Suite
Tests OS Controller, Safety Gates, Context Memory, and Orchestrator Routing.
"""

import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.safety.gates import SafetyGate, SafetyTier
from core.memory.context_memory import ContextMemory
from automation.os_controller import WindowsOSController
from core.orchestrator import JarvisOrchestrator

def test_safety_gates():
    gate = SafetyGate()
    assert gate.classify_action("get system vitals") == SafetyTier.TIER_1_ROUTINE
    assert gate.classify_action("close chrome") == SafetyTier.TIER_2_ACTIONABLE
    assert gate.classify_action("delete files in C:\\temp") == SafetyTier.TIER_3_CRITICAL
    print(" [OK] Safety Gates: Passed")

def test_os_controller():
    controller = WindowsOSController()
    vitals = controller.get_system_vitals()
    assert "cpu_percent" in vitals
    assert "ram_percent" in vitals
    assert "disk_free_gb" in vitals
    print(f" [OK] OS Controller Vitals: CPU {vitals['cpu_percent']}%, RAM {vitals['ram_percent']}%")

def test_orchestrator():
    jarvis = JarvisOrchestrator()
    
    # 1. Test vitals command
    res1 = jarvis.handle_command("what is our system status")
    assert res1["action_taken"] in ["get_vitals", "protocol_medical"]
    assert any(w in res1["speech"] for w in ["CPU", "nominal", "Medical", "utilization"])
    print(" [OK] Orchestrator Status Command: Passed")

    # 2. Test identity command
    res2 = jarvis.handle_command("who are you?")
    assert "J.A.R.V.I.S." in res2["speech"]
    print(" [OK] Orchestrator Identity Command: Passed")

    # 3. Test safety gate confirmation flow
    res3 = jarvis.handle_command("close notepad")
    assert res3["action_taken"] == "pending_confirmation"
    assert jarvis.memory.pending_confirmation_action is not None
    print(" [OK] Orchestrator Safety Gate Intercept: Passed")

    # 4. Test cancel confirmation flow
    res4 = jarvis.handle_command("nevermind, cancel that")
    assert res4["action_taken"] == "cancelled"
    assert jarvis.memory.pending_confirmation_action is None
    print(" [OK] Orchestrator Cancellation: Passed")

if __name__ == "__main__":
    print("\n--- Running J.A.R.V.I.S. Core Verification Suite ---")
    test_safety_gates()
    test_os_controller()
    test_orchestrator()
    print("--- All J.A.R.V.I.S. Core Tests Passed Successfully ---\n")
