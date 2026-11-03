"""
Unit & Integration Test Suite for J.A.R.V.I.S. Holographic Dashboard Server
Verifies:
1. Threaded HTTP Server binding & REST API routing
2. HTML Dashboard frontend delivery (GET /)
3. Full System Telemetry Aggregation (GET /api/status)
4. Neural Command Processing (POST /api/command)
5. Meeting Co-Pilot Lifecycle (POST /api/meeting: start, utterance, decisions, end)
6. Hyper-Personalization & VIP CRM updates (POST /api/personalization)
7. Autonomous Bilingual WhatsApp Simulator (POST /api/whatsapp/simulate & teach)
8. 5,958-Node LifeGraph Semantic Search (POST /api/lifegraph/search)
9. High-Capacity Task Queue (POST /api/tasks/add)
10. Server teardown & clean socket release
"""

import os
import sys
import time
import json
import unittest
import urllib.request
import urllib.error

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Ensure proper encoding on Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from core.orchestrator import JarvisOrchestrator
from core.dashboard_server import JarvisDashboardServer


class TestJarvisDashboardServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Initializes Orchestrator and launches Dashboard Server on a dynamic test port."""
        cls.orchestrator = JarvisOrchestrator()
        # Use port 5088 for test isolation
        cls.server = JarvisDashboardServer(orchestrator=cls.orchestrator, port=5088)
        cls.base_url = cls.server.start(open_browser=False)
        time.sleep(0.3)

    @classmethod
    def tearDownClass(cls):
        """Stops the dashboard server and background sentinel watchdog."""
        if cls.server:
            cls.server.stop()
        if hasattr(cls.orchestrator, "sentinel"):
            cls.orchestrator.sentinel.stop()
        if hasattr(cls.orchestrator, "customer_care"):
            try:
                cls.orchestrator.customer_care.learning_engine.clear_knowledge("drone_delivery_policy")
                cls.orchestrator.customer_care.learning_engine.clear_knowledge("test_warranty_policy")
            except Exception:
                pass

    def _get(self, path: str):
        url = f"{self.base_url}{path}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            content = resp.read()
            return resp.status, content

    def _post(self, path: str, payload: dict):
        url = f"{self.base_url}{path}"
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=8.0) as resp:
            content = resp.read()
            return resp.status, json.loads(content.decode("utf-8"))

    # -------------------------------------------------------------------------
    # TEST 1: Serve Dashboard HTML Frontend
    # -------------------------------------------------------------------------
    def test_01_serve_html_dashboard(self):
        status, content = self._get("/")
        self.assertEqual(status, 200)
        html_str = content.decode("utf-8", errors="replace")
        self.assertIn("J.A.R.V.I.S.", html_str)
        self.assertIn("EXECUTIVE NEURAL CONSOLE", html_str)
        self.assertIn("SILENT SCRIBE MEETING CO-PILOT", html_str)
        self.assertIn("CHILD LEARNING RULE STUDIO", html_str)
        self.assertIn("audio-canvas", html_str)

    # -------------------------------------------------------------------------
    # TEST 2: GET /api/status Full Telemetry
    # -------------------------------------------------------------------------
    def test_02_get_status_telemetry(self):
        status, content = self._get("/api/status")
        self.assertEqual(status, 200)
        data = json.loads(content.decode("utf-8"))

        self.assertTrue(data.get("success"))
        self.assertIn("vitals", data)
        self.assertIn("fleet", data)
        self.assertIn("meeting", data)
        self.assertIn("personalization", data)
        self.assertIn("task_capacity", data)
        self.assertIn("whatsapp", data)
        self.assertIn("lifegraph", data)

        # Assert sub-branches count
        self.assertEqual(data["fleet"]["total_branches"], 6)
        # Assert LifeGraph count
        self.assertGreaterEqual(data["lifegraph"]["total_nodes"], 5000)

    # -------------------------------------------------------------------------
    # TEST 3: POST /api/command Neural Directives
    # -------------------------------------------------------------------------
    def test_03_neural_command_execution(self):
        # A. Sit-Rep Briefing as Boss
        status, res = self._post("/api/command", {
            "text": "give me a sit-rep",
            "speaker": "Boss",
            "is_boss": True
        })
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        self.assertIn("speech", res)
        self.assertIn(res.get("action_taken", ""), ["sit_rep", "urgent_topics_briefing"])

        # B. Hardware Vitals Check
        status, res2 = self._post("/api/command", {
            "text": "check vitals",
            "speaker": "Boss",
            "is_boss": True
        })
        self.assertEqual(status, 200)
        self.assertIn("cpu", res2.get("speech", "").lower())

    # -------------------------------------------------------------------------
    # TEST 4: POST /api/meeting Full Co-Pilot Lifecycle
    # -------------------------------------------------------------------------
    def test_04_meeting_copilot_lifecycle(self):
        # 1. Start Meeting
        status, r_start = self._post("/api/meeting", {
            "action": "start",
            "title": "Autonomous Swarm Architecture Summit"
        })
        self.assertEqual(status, 200)
        self.assertTrue(r_start.get("success"))
        self.assertIn("Autonomous Swarm Architecture Summit", r_start.get("title", ""))

        # 2. Feed Peer Dialogue (Silent Scribe: J.A.R.V.I.S. must remain silent)
        status, r_utt1 = self._post("/api/meeting", {
            "action": "utterance",
            "speaker": "Sarah",
            "text": "We agreed to migrate the telemetry pipeline to Kafka next quarter."
        })
        self.assertEqual(status, 200)
        self.assertFalse(r_utt1.get("is_directed"))
        self.assertIsNone(r_utt1.get("speech"))
        self.assertIsNotNone(r_utt1.get("extracted_decision"))

        # 3. Feed Action Item Commitment
        status, r_utt2 = self._post("/api/meeting", {
            "action": "utterance",
            "speaker": "David",
            "text": "David will deploy the new GPU cluster by next Tuesday."
        })
        self.assertEqual(status, 200)
        self.assertIsNotNone(r_utt2.get("extracted_action"))
        self.assertEqual(r_utt2["extracted_action"]["owner"], "David")

        # 4. Conclude Meeting & Generate Minutes
        status, r_end = self._post("/api/meeting", {
            "action": "end",
            "speaker": "Boss",
            "is_boss": True
        })
        self.assertEqual(status, 200)
        self.assertTrue(r_end.get("success"))
        self.assertIn("minutes_path", r_end)
        self.assertGreaterEqual(r_end.get("decisions_count", 0), 1)

    # -------------------------------------------------------------------------
    # TEST 5: POST /api/personalization Profile & VIP CRM
    # -------------------------------------------------------------------------
    def test_05_personalization_and_vip_crm(self):
        # 1. Set Core Priority
        status, r_prio = self._post("/api/personalization", {
            "action": "set_priority",
            "priority": "Project EXODUS Hyper-Scale Mesh"
        })
        self.assertEqual(status, 200)
        self.assertTrue(r_prio.get("success"))
        self.assertIn("Project EXODUS Hyper-Scale Mesh", r_prio.get("message", ""))

        # 2. Add VIP Contact
        status, r_vip = self._post("/api/personalization", {
            "action": "add_vip",
            "name": "General Ross",
            "relation": "Department of Defense Liaison",
            "priority": "highest"
        })
        self.assertEqual(status, 200)
        self.assertTrue(r_vip.get("success"))
        self.assertIn("General Ross", r_vip.get("message", ""))

    # -------------------------------------------------------------------------
    # TEST 6: POST /api/whatsapp/teach & simulate (Bengali & English)
    # -------------------------------------------------------------------------
    def test_06_whatsapp_bilingual_care(self):
        # 1. Teach Rule
        status, r_teach = self._post("/api/whatsapp/teach", {
            "topic": "drone_delivery_policy",
            "instruction": "if customer asks about drone delivery, tell them our express drones arrive within 30 minutes"
        })
        self.assertEqual(status, 200)
        self.assertTrue(r_teach.get("success"))

        # 2. Simulate English inquiry
        status, r_eng = self._post("/api/whatsapp/simulate", {
            "name": "Bruce",
            "phone": "+15551234567",
            "message": "Do you have drone delivery?"
        })
        self.assertEqual(status, 200)
        self.assertIn("30 minutes", r_eng.get("reply_text", ""))

        # 3. Simulate Bengali inquiry
        status, r_ben = self._post("/api/whatsapp/simulate", {
            "name": "কামাল",
            "phone": "+8801700000000",
            "message": "আপনার রিটার্ন পলিসি কি?"
        })
        self.assertEqual(status, 200)
        self.assertTrue(r_ben.get("is_bengali"))
        self.assertTrue(any(ben in r_ben.get("reply_text", "") for ben in ["হ্যালো", "স্বাগতম", "আমাদের", "কামাল"]))

    # -------------------------------------------------------------------------
    # TEST 7: POST /api/lifegraph/search (Semantic Spreading Activation)
    # -------------------------------------------------------------------------
    def test_07_lifegraph_search(self):
        status, r_search = self._post("/api/lifegraph/search", {
            "query": "weather"
        })
        self.assertEqual(status, 200)
        self.assertTrue(r_search.get("success"))
        self.assertGreater(r_search.get("count", 0), 0)
        self.assertTrue(any("weather" in n["id"].lower() or "weather" in n["label"].lower() for n in r_search["nodes"]))

    # -------------------------------------------------------------------------
    # TEST 8: POST /api/tasks/add Task Queue
    # -------------------------------------------------------------------------
    def test_08_task_queue_addition(self):
        status, r_task = self._post("/api/tasks/add", {
            "description": "Run diagnostic AST check on auxiliary modules"
        })
        self.assertEqual(status, 200)
        self.assertTrue(r_task.get("success"))
        self.assertIn("task_id", r_task)


if __name__ == "__main__":
    unittest.main()
