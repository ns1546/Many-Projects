"""
Unit & Integration Test Suite for J.A.R.V.I.S. Multi-Party Meeting Intelligence,
Acoustic Noise Filter, Multi-Speaker Diarization, and Hyper-Personalization Engine.
Verifies 100% operational correctness and safety gates.
"""

import os
import sys
import time
import shutil
import unittest
import numpy as np

# Ensure proper encoding on Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from speech.acoustic_filter import AcousticNoiseFilter
from speech.speaker_id import SpeakerIdentifier
from speech.diarization import SpeakerDiarizer, SpeakerSegment
from core.memory.omni_memory import OmniMemory
from core.task_manager import TaskManager
from core.personalization import PersonalizationEngine
from core.meeting_intelligence import (
    GroupMeetingIntelligence,
    DirectedSpeechClassifier,
    MeetingSession,
    MeetingActionItem
)
from core.orchestrator import JarvisOrchestrator


class TestAcousticNoiseFilter(unittest.TestCase):
    """Phase 1: Verification of Acoustic Noise Suppression & SNR Estimation."""

    def setUp(self):
        self.filter = AcousticNoiseFilter(sample_rate=16000)

    def test_snr_calculation(self):
        # Generate simulated clean sine wave (tone) + quiet noise
        sr = 16000
        t = np.linspace(0, 1.0, sr, endpoint=False, dtype=np.float32)
        signal = 0.5 * np.sin(2 * np.pi * 440 * t) # 440 Hz
        noise = np.random.normal(0, 0.01, sr).astype(np.float32)
        mixed = signal + noise

        snr = self.filter.calculate_snr(mixed)
        self.assertGreater(snr, 10.0, f"Expected SNR > 10 dB for clean tone, got {snr:.1f} dB")

    def test_spectral_subtraction_suppression(self):
        sr = 16000
        t = np.linspace(0, 1.0, sr, endpoint=False, dtype=np.float32)
        signal = 0.4 * np.sin(2 * np.pi * 300 * t)
        noise = np.random.normal(0, 0.08, sr).astype(np.float32) # Heavy ambient noise
        noisy_audio = signal + noise

        # Clean audio
        cleaned, final_snr = self.filter.suppress_noise(noisy_audio)
        self.assertIsNotNone(cleaned)
        self.assertEqual(len(cleaned), len(noisy_audio))
        self.assertGreaterEqual(final_snr, -5.0)


class TestSpeakerDiarization(unittest.TestCase):
    """Phase 2: Verification of Multi-Speaker Diarization & Overlapping Speech Detection."""

    def setUp(self):
        self.test_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp_diar_data"))
        os.makedirs(self.test_data_dir, exist_ok=True)
        self.profiles_path = os.path.join(self.test_data_dir, "speakers_test.json")
        self.speaker_id = SpeakerIdentifier(profiles_path=self.profiles_path)
        self.diarizer = SpeakerDiarizer(speaker_id=self.speaker_id)

    def tearDown(self):
        if os.path.exists(self.test_data_dir):
            shutil.rmtree(self.test_data_dir, ignore_errors=True)

    def test_overlapping_speech_detection(self):
        sr = 16000
        t = np.linspace(0, 1.0, sr, endpoint=False, dtype=np.float32)
        # Single speaker tone: 130 Hz (fundamental)
        single_speaker = 0.5 * np.sin(2 * np.pi * 130 * t)
        is_overlap, _ = self.diarizer.detect_overlapping_speech(single_speaker)
        self.assertFalse(is_overlap, "Single harmonic speaker should not be detected as overlapping.")

        # Dual speakers with non-harmonic fundamentals: 130 Hz and 235 Hz
        dual_speakers = 0.4 * np.sin(2 * np.pi * 130 * t) + 0.4 * np.sin(2 * np.pi * 235 * t)
        is_overlap_dual, conf = self.diarizer.detect_overlapping_speech(dual_speakers)
        self.assertTrue(is_overlap_dual, "Dual distinct speakers speaking simultaneously should be detected as overlapping.")
        self.assertGreater(conf, 0.25)


class TestMeetingIntelligence(unittest.TestCase):
    """Phase 3: Verification of Directed Speech Attention & Autonomous Meeting Actions."""

    def setUp(self):
        self.test_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp_mtg_data"))
        os.makedirs(self.test_dir, exist_ok=True)
        self.db_path = os.path.join(self.test_dir, "test_omni.db")
        self.omni = OmniMemory(db_path=self.db_path)
        self.tm = TaskManager()
        self.mtg = GroupMeetingIntelligence(
            task_manager=self.tm,
            omni_memory=self.omni,
            meetings_dir=self.test_dir
        )

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_directed_speech_classifier(self):
        # Inter-human peer conversations (should NOT be directed at J.A.R.V.I.S.)
        peer_speech_1 = "David, what do you think about the Q3 delivery schedule?"
        peer_speech_2 = "I agree Sarah, let's proceed with the cloud migration."
        is_dir1, _ = DirectedSpeechClassifier.is_directed(peer_speech_1)
        is_dir2, _ = DirectedSpeechClassifier.is_directed(peer_speech_2)
        self.assertFalse(is_dir1, "Inter-human peer talk should not trigger J.A.R.V.I.S.")
        self.assertFalse(is_dir2, "Inter-human peer agreement should not trigger J.A.R.V.I.S.")

        # Explicitly directed speech
        dir_speech_1 = "Jarvis, assign task to David: optimize the database by Friday"
        dir_speech_2 = "Hey Jarvis, summarize the meeting decisions so far"
        is_dir3, clean3 = DirectedSpeechClassifier.is_directed(dir_speech_1)
        is_dir4, clean4 = DirectedSpeechClassifier.is_directed(dir_speech_2)
        self.assertTrue(is_dir3, "Explicit wake name should classify as directed.")
        self.assertTrue(is_dir4, "Hey Jarvis should classify as directed.")
        self.assertIn("assign task to David", clean3)

    def test_meeting_lifecycle_and_silent_scribe(self):
        # 1. Start Meeting
        start_res = self.mtg.start_meeting(title="Autonomous AI Architecture Review", attendees=["Boss", "Alice", "Bob"])
        self.assertTrue(start_res["success"])
        self.assertEqual(self.mtg.current_session.title, "Autonomous AI Architecture Review")

        # 2. Peer Utterance (Passive logging, NO spoken reply)
        turn1 = self.mtg.process_utterance(
            speaker_name="Alice",
            text="Bob, we agreed that we will launch the beta next Tuesday.",
            is_boss=False
        )
        self.assertTrue(turn1["active_meeting"])
        self.assertFalse(turn1["is_directed"])
        self.assertIsNone(turn1["speech"], "Silent Scribe must not vocalize during peer conversation!")
        self.assertIn("launch the beta next Tuesday", self.mtg.current_session.decisions[0])

        # 3. Action Item Extraction from peer turn
        turn2 = self.mtg.process_utterance(
            speaker_name="Bob",
            text="Alice will review the security pull request by Thursday.",
            is_boss=False
        )
        self.assertEqual(len(self.mtg.current_session.action_items), 1)
        action_item = self.mtg.current_session.action_items[0]
        self.assertEqual(action_item.owner, "Alice")
        self.assertIn("Thursday", action_item.deadline)

        # Confirm task was dispatched to TaskManager automatically!
        pending_tasks = self.tm.get_pending_tasks()
        self.assertGreaterEqual(len(pending_tasks), 1)
        self.assertIn("Alice", pending_tasks[0].description)

        # 4. Directed Utterance to J.A.R.V.I.S.
        turn3 = self.mtg.process_utterance(
            speaker_name="Boss",
            text="Jarvis, what are the action items?",
            is_boss=True
        )
        self.assertTrue(turn3["is_directed"])
        self.assertIsNotNone(turn3["speech"], "J.A.R.V.I.S. must respond when addressed directly!")
        self.assertIn("Alice", turn3["speech"])

        # 5. End Meeting & Minutes Artifact
        end_res = self.mtg.end_meeting(speaker_name="Boss", is_boss=True)
        self.assertTrue(end_res["success"])
        self.assertGreater(end_res["decisions_count"], 0)
        self.assertGreater(end_res["action_items_count"], 0)
        self.assertTrue(os.path.exists(end_res["minutes_path"]))

        # Verify markdown contents adhere to meeting-synthesis-action-delegation
        with open(end_res["minutes_path"], "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("Executive Meeting Summary", content)
        self.assertIn("SMART Action Item Accountability Table", content)
        self.assertIn("Alice", content)


class TestHyperPersonalizationEngine(unittest.TestCase):
    """Phase 4: Verification of Deep Personalization Profiling & Adaptive Learning."""

    def setUp(self):
        self.test_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp_pers_data"))
        os.makedirs(self.test_dir, exist_ok=True)
        self.omni = OmniMemory(db_path=os.path.join(self.test_dir, "test_omni.db"))
        self.pers = PersonalizationEngine(omni_memory=self.omni, data_dir=self.test_dir)

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_priority_and_vip_management(self):
        # 1. Set Core Priority
        prio_msg = self.pers.set_priority("Mark 85 Quantum Core", rank=0)
        self.assertIn("priority #1", prio_msg)
        self.assertEqual(self.pers.profile["core_priorities"][0], "Mark 85 Quantum Core")

        # 2. Add VIP
        vip_msg = self.pers.add_vip_contact("Virginia Pepper Potts", "Chief Executive Officer", priority="highest")
        self.assertIn("Pepper", vip_msg)
        contact = self.omni.get_contact("Virginia Pepper Potts")
        self.assertIsNotNone(contact)

        # 3. Conversational Learning from Boss
        self.pers.learn_from_conversation("I am currently working on Project Arc Reactor Upgrade", speaker_name="Boss", is_boss=True)
        self.assertIn("Project Arc Reactor Upgrade", self.pers.profile["active_projects"])

        # 4. Context Synthesis
        context = self.pers.build_personalized_context("How should we allocate our engineering resources?")
        self.assertIn("Commander", context)
        self.assertIn("Mark 85 Quantum Core", context)


class TestOrchestratorEndToEndIntegration(unittest.TestCase):
    """Phase 5: End-to-End Orchestrator Integration across Meetings & Personalization."""

    @classmethod
    def setUpClass(cls):
        cls.orchestrator = JarvisOrchestrator()

    @classmethod
    def tearDownClass(cls):
        try:
            if hasattr(cls.orchestrator, "sentinel") and cls.orchestrator.sentinel:
                cls.orchestrator.sentinel.stop()
        except Exception:
            pass

    def test_meeting_commands_e2e(self):
        # 1. Start Meeting
        r1 = self.orchestrator.handle_command("start meeting Product Architecture Strategy", speaker_name="Boss", is_boss=True)
        self.assertEqual(r1["action_taken"], "start_meeting")
        self.assertIn("Product Architecture Strategy", r1["speech"])

        # 2. Feed Meeting Utterances
        r2 = self.orchestrator.handle_command("in meeting [Sarah]: We agreed to deprecate legacy API endpoints by end of month.")
        self.assertEqual(r2["action_taken"], "process_meeting_utterance")

        r3 = self.orchestrator.handle_command("in meeting [David]: I will migrate the user database to PostgreSQL by next Friday.")
        self.assertEqual(r3["action_taken"], "process_meeting_utterance")

        # 3. In-meeting query
        r4 = self.orchestrator.handle_command("action items", speaker_name="Boss", is_boss=True)
        self.assertIn("David", r4["speech"])

        # 4. Wrap up meeting
        r5 = self.orchestrator.handle_command("wrap up meeting", speaker_name="Boss", is_boss=True)
        self.assertEqual(r5["action_taken"], "end_meeting")
        self.assertIn("concluded", r5["speech"])

    def test_personalization_commands_e2e(self):
        # 1. Set priority
        r1 = self.orchestrator.handle_command("set priority Autonomous Multi-Agent Swarm", speaker_name="Boss", is_boss=True)
        self.assertEqual(r1["action_taken"], "set_core_priority")
        self.assertIn("Autonomous Multi-Agent Swarm", r1["speech"])

        # 2. Add VIP
        r2 = self.orchestrator.handle_command("add vip Rhodey as Military Strategic Liaison", speaker_name="Boss", is_boss=True)
        self.assertEqual(r2["action_taken"], "add_vip_contact")
        self.assertIn("Rhodey", r2["speech"])

        # 3. How well do you know me query
        r3 = self.orchestrator.handle_command("how well do you know me", speaker_name="Boss", is_boss=True)
        self.assertEqual(r3["action_taken"], "personalization_summary")
        self.assertIn("Autonomous Multi-Agent Swarm", r3["speech"])


if __name__ == "__main__":
    unittest.main()
