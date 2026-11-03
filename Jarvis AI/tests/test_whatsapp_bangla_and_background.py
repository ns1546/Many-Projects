"""
Automated Verification Suite: J.A.R.V.I.S. WhatsApp Customer Care
Bengali Language Understanding (Bangla Script + Banglish) &
24/7 Autonomous Background Daemon (Operates Even When WhatsApp is Closed).
"""

import os
import sys
import json
import time
import urllib.request
import unittest

# Ensure workspace root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from communication.whatsapp_customer_care import (
    WhatsAppCustomerCareService,
    is_bengali_inquiry,
    formulate_bengali_reply,
    formulate_bengali_escalation
)
from communication.communication_hub import CommunicationHub
from speech.tts_engine import TTSEngine, is_bengali_text
from core.orchestrator import JarvisOrchestrator


class TestWhatsAppBanglaAndBackground(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tts = TTSEngine()
        cls.service = WhatsAppCustomerCareService(business_name="Stark Industries", tts_engine=cls.tts)
        cls.orchestrator = JarvisOrchestrator()

    @classmethod
    def tearDownClass(cls):
        cls.service.stop_background_daemon()
        cls.orchestrator.customer_care.stop_background_daemon()

    def test_01_bengali_text_detection_script_and_banglish(self):
        """Verifies accurate detection of Bangla script, Banglish phonetics, and English separation."""
        # Pure Bangla script queries
        bangla_queries = [
            "আপনার রিটার্ন পলিসি কি?",
            "ডেলিভারি চার্জ কত টাকা?",
            "দোকান কখন খোলা থাকে?",
            "পণ্য ফেরত দেওয়া যাবে কি?",
            "ওয়ারেন্টি কত দিনের?",
            "ডিসকাউন্ট আছে নাকি?"
        ]
        for q in bangla_queries:
            self.assertTrue(is_bengali_inquiry(q), f"Failed to detect Bengali script in: '{q}'")
            self.assertTrue(is_bengali_text(q), f"Failed Unicode Bengali check for: '{q}'")

        # Banglish romanized queries
        banglish_queries = [
            "apnader delivery charge koto?",
            "kivabe product return korbo?",
            "apnader dokan kothay?",
            "kono discount ache ki?",
            "dam koto?",
            "stark er shathe kotha bolte chai"
        ]
        for q in banglish_queries:
            self.assertTrue(is_bengali_inquiry(q), f"Failed to detect Banglish in: '{q}'")

        # Pure English queries (must NOT trigger Bengali)
        english_queries = [
            "What is your return policy?",
            "How much is the delivery charge?",
            "What are your business hours?",
            "Is there any discount available?",
            "Can I speak with Mr. Stark?"
        ]
        for q in english_queries:
            self.assertFalse(is_bengali_inquiry(q), f"False positive Bengali for English query: '{q}'")
            self.assertFalse(is_bengali_text(q), f"False positive Unicode check for: '{q}'")

    def test_02_bengali_script_auto_reply_and_voice_synthesis(self):
        """Verifies customer inquiry in Bengali script is resolved with polite Bengali text and voice."""
        res = self.service.process_incoming_text(
            customer_phone="+8801700000001",
            customer_name="তানভীর আহমেদ",
            message_text="আপনার রিটার্ন পলিসি কি?",
            prefer_voice=True
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["language"], "bengali")
        self.assertEqual(res["status"], "resolved")
        self.assertTrue("return" in res["matched_topic"] or "refund" in res["matched_topic"])
        self.assertIn("তানভীর আহমেদ", res["reply_text"])
        self.assertIn("Stark Industries", res["reply_text"])
        self.assertIn("ধন্যবাদ", res["reply_text"])
        
        # Verify voice note synthesis with bn-BD-PradeepNeural
        if res.get("voice_file"):
            self.assertTrue(os.path.exists(res["voice_file"]))
            self.assertTrue(res["voice_file"].endswith(".mp3"))
            self.assertGreater(os.path.getsize(res["voice_file"]), 1000)

    def test_03_banglish_inquiry_auto_reply_in_bengali(self):
        """Verifies customer inquiry in Banglish is resolved and answered in Bengali."""
        res = self.service.process_incoming_text(
            customer_phone="+8801800000002",
            customer_name="Sabbir",
            message_text="apnader delivery charge koto?",
            prefer_voice=False
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["language"], "bengali")
        self.assertEqual(res["status"], "resolved")
        self.assertEqual(res["matched_topic"], "shipping_and_delivery")
        self.assertIn("Sabbir", res["reply_text"])
        self.assertIn("ডেলিভারি", res["reply_text"])

    def test_04_bengali_unresolved_escalation_to_boss(self):
        """Verifies unknown Bengali question politely informs customer in Bengali and escalates to Boss."""
        res = self.service.process_incoming_text(
            customer_phone="+8801900000003",
            customer_name="রাকিব",
            message_text="আপনারা কি মঙ্গল গ্রহের জন্য স্পেসশিপ বিক্রি করেন?",
            prefer_voice=False
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["language"], "bengali")
        self.assertEqual(res["status"], "escalated_to_boss")
        self.assertTrue(res["escalated_to_boss"])
        self.assertIn("মিঃ স্টার্ক", res["reply_text"])
        self.assertIn("নথিভুক্ত", res["reply_text"])

    def test_05_bengali_call_attendance_receptionist(self):
        """Verifies attending incoming call in Bengali produces Bengali greeting and resolution."""
        call_res = self.service.attend_call(
            caller_phone="+8801500000004",
            caller_name="হাসান সাহেব",
            caller_speech="দোকান কখন খোলা থাকে?"
        )

        self.assertTrue(call_res["success"])
        self.assertIn("হাসান সাহেব", call_res["greeting"])
        self.assertIn("জারভিস", call_res["greeting"])
        self.assertEqual(call_res["outcome"], "inquiry_resolved_on_call")
        self.assertEqual(call_res["matched_topic"], "operating_hours")
        self.assertTrue(any(w in call_res["reply_speech"] for w in ["9", "৯", "open", "সকাল"]))

    def test_06_background_daemon_operates_when_whatsapp_closed(self):
        """
        Verifies 24/7 HTTP background daemon starts, accepts webhooks/API calls,
        and resolves Bengali queries WITHOUT opening any WhatsApp browser window or app.
        """
        daemon_port = 5058
        start_res = self.service.start_background_daemon(host="127.0.0.1", port=daemon_port)
        self.assertTrue(start_res["success"])
        time.sleep(0.5)

        try:
            # 1. Health check endpoint
            status_url = f"http://127.0.0.1:{daemon_port}/status"
            with urllib.request.urlopen(status_url, timeout=5) as resp:
                self.assertEqual(resp.status, 200)
                body = json.loads(resp.read().decode("utf-8"))
                self.assertEqual(body["status"], "online")
                self.assertTrue(body["bengali_support"])

            # 2. Ingest customer message via POST webhook (Bangla script)
            post_url = f"http://127.0.0.1:{daemon_port}/webhook/whatsapp"
            payload = json.dumps({
                "from": "+8801711223344",
                "name": "মাহমুদ",
                "message": "পণ্য ফেরত দেওয়ার নিয়ম কি?",
                "prefer_voice": False
            }).encode("utf-8")

            req = urllib.request.Request(
                post_url,
                data=payload,
                headers={"Content-Type": "application/json; charset=utf-8"}
            )
            with urllib.request.urlopen(req, timeout=10) as post_resp:
                self.assertEqual(post_resp.status, 200)
                resp_json = json.loads(post_resp.read().decode("utf-8"))
                self.assertTrue(resp_json["success"])
                self.assertEqual(resp_json["language"], "bengali")
                self.assertTrue("return" in resp_json["matched_topic"] or "refund" in resp_json["matched_topic"])
                self.assertIn("মাহমুদ", resp_json["reply_text"])
                self.assertTrue("রিটার্ন" in resp_json["reply_text"] or "ফেরত" in resp_json["reply_text"])

            # 3. Check status reporting
            daemon_status = self.service.get_daemon_status()
            self.assertTrue(daemon_status["is_running"])
            self.assertEqual(daemon_status["port"], daemon_port)

        finally:
            stop_res = self.service.stop_background_daemon()
            self.assertTrue(stop_res["success"])

    def test_07_orchestrator_background_daemon_and_bangla_commands(self):
        """Verifies orchestrator commands for daemon activation and Bengali WhatsApp processing."""
        # A. Start background daemon via natural command
        cmd_start = self.orchestrator.handle_command("run whatsapp customer care even if closed")
        self.assertEqual(cmd_start["action_taken"], "start_whatsapp_background_daemon")
        self.assertIn("background daemon is active", cmd_start["speech"].lower())

        # B. Check status command
        cmd_status = self.orchestrator.handle_command("whatsapp background status")
        self.assertEqual(cmd_status["action_taken"], "whatsapp_daemon_status")
        self.assertTrue(cmd_status["data"]["is_running"])

        # C. Simulate incoming Bengali message via orchestrator
        cmd_msg = self.orchestrator.handle_command("incoming whatsapp message from করিম: ডেলিভারি চার্জ কত?")
        self.assertEqual(cmd_msg["action_taken"], "process_whatsapp_customer_message")
        self.assertEqual(cmd_msg["data"]["language"], "bengali")
        self.assertEqual(cmd_msg["data"]["matched_topic"], "shipping_and_delivery")

        # D. Stop background daemon via natural command
        cmd_stop = self.orchestrator.handle_command("stop whatsapp background daemon")
        self.assertEqual(cmd_stop["action_taken"], "stop_whatsapp_background_daemon")
        self.assertIn("stopped", cmd_stop["speech"].lower())


if __name__ == "__main__":
    unittest.main()
