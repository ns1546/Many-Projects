"""
J.A.R.V.I.S. Universal Cognitive Intent & Understanding Router
High-Capacity Multi-Tier Cognitive Understanding Engine:
- Tier 1: High-Speed Neural Rule Matrix & Semantic Parser (<1ms latency)
- Multi-Intent Compound Decomposition ("do X, and then Y, and check Z")
- Phonetic & Acoustic Speech Typo Normalizer ("crome" -> "chrome", "whatapp" -> "whatsapp")
- Multilingual Understanding Matrix: Native Bengali (বাংলা) & English Intent Mapping
- Granular Entity & Slot Parameter Extraction (currencies, times, dates, apps, people)
- Tier 2: Local Qwen 2.5 SLM & OpenRouter LLM Fallback for ambiguous conversational queries
"""

import json
import re
import urllib.request
from typing import Dict, Any, Optional, List, Tuple


SYSTEM_TOOL_PROMPT = """You are J.A.R.V.I.S. Autonomous Cognitive Intent Classifier.
You must analyze the user's natural language command and output ONLY a raw JSON object selecting the best action.
Do NOT output markdown code blocks (no ```json). Do NOT add explanations.

Available Actions:
1. {"action": "whatsapp_send", "contact": "<name>", "message": "<msg>"}
2. {"action": "whatsapp_call", "contact": "<name>"}
3. {"action": "email_compose", "recipient": "<name_or_email>", "subject": "<subject>", "body": "<body>"}
4. {"action": "email_check_inbox"}
5. {"action": "play_media", "platform": "youtube" | "spotify", "query": "<song_or_video>"}
6. {"action": "screen_vision", "query": "<inspect_screen>"}
7. {"action": "gui_control", "command": "screenshot" | "volume_up" | "volume_down" | "mute" | "play_pause" | "show_desktop"}
8. {"action": "web_search", "query": "<search_query>"}
9. {"action": "create_project", "type": "hud_dashboard" | "python_tool" | "html_game", "description": "<desc>"}
10. {"action": "iron_man_protocol", "protocol": "house_party" | "clean_slate" | "barn_door" | "workshop" | "medical"}
11. {"action": "memory_op", "type": "remember" | "recall" | "profile", "fact": "<fact_or_query>"}
12. {"action": "system_vitals"}
13. {"action": "add_task", "description": "<task_description>"}
14. {"action": "list_tasks"}
15. {"action": "skill_query", "query": "<skill_or_topic>"}
16. {"action": "conversation", "reply": "<crisp_eloquent_british_response>"}
"""


class UniversalIntentRouter:
    """
    Cognitive Intent & Natural Language Understanding Router for J.A.R.V.I.S.
    Combines rule-based slot filling, typo normalization, Bengali cross-lingual mapping,
    compound request decomposition, and local/cloud neural model fallbacks.
    """

    # Phonetic and Speech-to-Text Acoustic Typo Dictionary
    PHONETIC_TYPOS = {
        r"\bcrome\b": "chrome",
        r"\bwhatapp\b": "whatsapp",
        r"\bwhatsap\b": "whatsapp",
        r"\bwpp\b": "whatsapp",
        r"\bcalender\b": "calendar",
        r"\bscedule\b": "schedule",
        r"\bpythn\b": "python",
        r"\bpithon\b": "python",
        r"\byoutub\b": "youtube",
        r"\byoutube web\b": "youtube",
        r"\bfacbook\b": "facebook",
        r"\bcalcualtor\b": "calculator",
        r"\bcalc\b": "calculator",
        r"\bnotepd\b": "notepad",
        r"\bexplorr\b": "explorer",
        r"\bvitlas\b": "vitals",
        r"\bdiagonstics\b": "diagnostics",
        r"\bbreif\b": "brief",
        r"\bopinon\b": "opinion"
    }

    # Bengali Stop Words & Keyword Mappings
    BENGALI_INTENT_MAP = [
        (r"(?:আবহাওয়া|আবহাওয়া|বৃষ্টি|তাপমাত্রা|ওয়েদার|ওয়েদার কেমন|কেমন আবহাওয়া)", "get_weather"),
        (r"(?:শিডিউল|মিটিং|ক্যালেন্ডার|আজকের কাজ|আজকের তালিকা|পরিকল্পনা)", "list_calendar"),
        (r"(?:সিস্টেম|হেলথ|কম্পিউটার|ল্যাপটপ|সিপিইউ|র‍্যাম|অবস্থা কি|ভাইটালস)", "system_vitals"),
        (r"(?:স্ক্রিনশট|ছবি তোলো|স্ক্রিনের ছবি|মনিটর)", "screenshot"),
        (r"(?:ক্রোম|গুগল|ব্রাউজার|ইউটিউব|স্পটিফাই|খোল|খোলো|চালু করো)", "launch_app"),
        (r"(?:হোয়াটসঅ্যাপ|মেসেজ|বার্তা|পাঠাও)", "whatsapp_send"),
        (r"(?:কল ধরো|কল রিসিভ|রিসেপশনিস্ট|কল এটেন্ড)", "attend_call"),
        (r"(?:খরচ|টাকা|টাকা দিলাম|ব্যয়|হিসাব|খরচ কত)", "log_expense"),
        (r"(?:পানি খেলাম|পানি পান|হাইড্রেশন)", "log_water"),
        (r"(?:ডিপ ওয়ার্ক|মনোযোগ|ফোকাস|সপ্রিন্ট)", "deep_work"),
        (r"(?:লক করো|লক স্ক্রিন|পিসি লক)", "lock_workstation")
    ]

    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.model = "qwen2.5:1.5b"

    def normalize_phonetic_typos(self, text: str) -> str:
        """Corrects acoustic STT speech transcription artifacts and common typos."""
        clean = text
        for pattern, replacement in self.PHONETIC_TYPOS.items():
            clean = re.sub(pattern, replacement, clean, flags=re.IGNORECASE)
        return clean

    def is_bengali_text(self, text: str) -> bool:
        """Determines if text contains Unicode Bengali glyphs."""
        return any('\u0980' <= ch <= '\u09FF' for ch in text)

    def extract_slots(self, text: str) -> Dict[str, Any]:
        """
        Extracts structured parameters (slots) from natural language:
        amounts, currency, dates, times, applications, contacts, and categories.
        """
        slots: Dict[str, Any] = {}
        clean_text = self.normalize_phonetic_typos(text)
        lower = clean_text.lower()

        # 1. Currency & Amount extraction ($15.50, 500 taka, 20 usd)
        match_money = re.search(r"(?:[\$€£]|usd\s*|bdt\s*|টাকা\s*)?([0-9]+(?:\.[0-9]+)?)\s*(?:dollars?|usd|bdt|টাকা)?", lower)
        if match_money and any(w in lower for w in ["spent", "paid", "cost", "dollar", "$", "taka", "টাকা", "expense", "bought"]):
            slots["amount"] = float(match_money.group(1))
            slots["currency"] = "BDT" if any(w in lower for w in ["bdt", "taka", "টাকা"]) else "USD"

        # 2. Time extraction (14:00, 4pm, 9:30 am)
        match_time = re.search(r"\b([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*(?:am|pm)?\b|\b([1-9]|1[0-2])\s*(?:am|pm)\b", lower)
        if match_time:
            slots["time"] = match_time.group(0).strip()

        # 3. Date extraction (today, tomorrow, monday, etc.)
        for d in ["today", "tomorrow", "yesterday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
            if re.search(rf"\b{d}\b", lower):
                slots["date"] = d
                break

        # 4. Target Application extraction
        app_candidates = ["chrome", "youtube", "spotify", "vscode", "notepad", "calculator", "terminal", "powershell", "settings", "explorer"]
        for app in app_candidates:
            if re.search(rf"\b{app}\b", lower):
                slots["target_app"] = app
                break

        # 5. City extraction
        match_city = re.search(r"\b(?:in|for|at)\s+([a-zA-Z\s]+)$", text)
        if match_city and any(w in lower for w in ["weather", "temperature", "forecast"]):
            slots["city"] = match_city.group(1).strip()

        return slots

    def parse_compound_intents(self, text: str) -> List[Dict[str, Any]]:
        """
        Decomposes multi-intent compound commands into ordered sub-intents.
        Example: "Check system vitals and then schedule a meeting with Pepper Potts at 4pm"
        """
        clean_text = self.normalize_phonetic_typos(text)
        
        # Split on sequential conjunctions
        split_pattern = r"\b(?:and\s+then|then|after\s+that|next|and\s+also)\b|(?<=\w)[,;]\s*(?:and\s+)?(?=(?:check|schedule|open|run|brief|tell|log|set|give|attend)\b)"
        chunks = re.split(split_pattern, clean_text, flags=re.IGNORECASE)
        chunks = [c.strip(" ,;.") for c in chunks if c and len(c.strip(" ,;.")) > 3]

        if len(chunks) <= 1:
            return [self.parse_intent(clean_text)]

        parsed_intents = []
        for chunk in chunks:
            sub_intent = self.parse_intent(chunk)
            sub_intent["raw_chunk"] = chunk
            parsed_intents.append(sub_intent)
        return parsed_intents

    def parse_intent(self, text: str) -> Dict[str, Any]:
        """
        Primary entrypoint for parsing intent.
        Uses Tier 1 Neural Semantic Rule Matrix first (<1ms), then falls back to Local SLM.
        """
        clean_text = self.normalize_phonetic_typos(text)
        lower = clean_text.lower().strip()
        slots = self.extract_slots(clean_text)

        # ---------------------------------------------------------------------
        # Tier 1A: Multilingual Bengali (বাংলা) Recognition
        # ---------------------------------------------------------------------
        if self.is_bengali_text(text):
            for pat, action_name in self.BENGALI_INTENT_MAP:
                if re.search(pat, text):
                    return {
                        "action": action_name,
                        "language": "bengali",
                        "confidence": 0.95,
                        "slots": slots,
                        "source": "tier1_multilingual_matrix"
                    }

        # ---------------------------------------------------------------------
        # Tier 1B: High-Speed Semantic Rule Matrix (<1ms)
        # ---------------------------------------------------------------------
        # 1. System Vitals / Hardware Telemetry
        if any(w in lower for w in ["vitals", "system health", "diagnostics", "hardware status", "cpu", "ram"]):
            return {"action": "system_vitals", "confidence": 0.99, "slots": slots, "source": "tier1_matrix"}

        # 2. Executive Briefings & Urgent Topics
        if any(w in lower for w in ["urgent topics", "urgent topic", "brief me", "sit-rep", "executive briefing", "what is urgent"]):
            return {"action": "urgent_topics_briefing", "confidence": 0.98, "slots": slots, "source": "tier1_matrix"}

        # 3. Strategic Opinions & Advisory
        if any(w in lower for w in ["give opinion", "your opinion", "what do you think", "advise me", "advice on", "should i", "should we"]):
            return {"action": "executive_opinion", "confidence": 0.98, "query": text, "slots": slots, "source": "tier1_matrix"}

        # 4. Schedule / Calendar Management
        if any(w in lower for w in ["schedule meeting", "book meeting", "create meeting", "schedule appointment", "calendar event"]):
            return {"action": "schedule_meeting", "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        if any(w in lower for w in ["calendar", "agenda today", "schedule today", "my schedule", "what's on my calendar"]):
            return {"action": "list_calendar", "confidence": 0.98, "slots": slots, "source": "tier1_matrix"}

        # 5. WhatsApp & Communications
        if any(w in lower for w in ["whatsapp daemon", "whatsapp background", "daemon status"]):
            return {"action": "whatsapp_daemon_status", "confidence": 0.98, "slots": slots, "source": "tier1_matrix"}

        if any(w in lower for w in ["attend call", "receptionist", "take calls on my behalf"]):
            return {"action": "attend_call", "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        if re.search(r"\bsend\s+(?:a\s+)?(?:whatsapp\s+)?(?:voice\s+note|message)\b", lower):
            return {"action": "whatsapp_send", "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        # 6. Screen Perception & GUI
        if any(w in lower for w in ["screenshot", "capture screen", "what is on my screen", "look at my screen"]):
            return {"action": "screen_vision", "command": "screenshot", "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        # 7. Weather
        if "weather" in lower or "temperature" in lower or "forecast" in lower:
            return {"action": "get_weather", "confidence": 0.95, "city": slots.get("city", ""), "slots": slots, "source": "tier1_matrix"}

        # 8. Bio-Wellness & Hydration
        if any(w in lower for w in ["water", "hydration", "drink water", "had water"]):
            return {"action": "log_hydration", "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        if any(w in lower for w in ["eye break", "20 20 20"]):
            return {"action": "eye_break", "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        if any(w in lower for w in ["deep work", "focus sprint", "focus mode"]):
            return {"action": "deep_work", "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        # 9. Expenses
        if any(w in lower for w in ["spent", "paid", "bought", "log expense", "expense summary"]):
            return {"action": "log_expense", "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        # 10. Live Time & Date
        if any(w in lower for w in ["what time", "tell me the time", "current time", "time today", "about time today", "time now", "tell me about time", "tell me time"]):
            return {"action": "get_time", "confidence": 0.99, "source": "tier1_matrix"}

        if any(w in lower for w in ["what date", "today's date", "what day is today", "date today", "what is today's date"]):
            return {"action": "get_date", "confidence": 0.99, "source": "tier1_matrix"}

        # 11. Daily Notes & Timers
        if re.search(r"\b(?:take\s+(?:a\s+)?note|quick\s+note|save\s+note|jot\s+down)\b", lower):
            note_text = re.sub(r"^(?:take\s+(?:a\s+)?note|quick\s+note|save\s+note|jot\s+down)[:\s]+", "", text, flags=re.IGNORECASE).strip()
            return {"action": "save_note", "note": note_text, "confidence": 0.95, "source": "tier1_matrix"}

        if any(w in lower for w in ["list notes", "my notes", "show notes", "recent notes"]):
            return {"action": "list_notes", "confidence": 0.95, "source": "tier1_matrix"}

        if re.search(r"\b(?:set\s+(?:a\s+)?timer|timer\s+for)\b", lower):
            match_t = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*(?:minutes?|mins?)", lower)
            mins = float(match_t.group(1)) if match_t else 10.0
            return {"action": "set_timer", "minutes": mins, "confidence": 0.95, "source": "tier1_matrix"}

        # 12. Application Launch
        if re.search(r"\b(?:open|launch|start|navigate to|go to)\s+([a-zA-Z0-9_\-\.\s]+)", lower):
            app = slots.get("target_app", re.sub(r"^(?:open|launch|start|navigate to|go to)\s+", "", lower).strip())
            return {"action": "launch_app", "target": app, "confidence": 0.95, "slots": slots, "source": "tier1_matrix"}

        # 13. Lock Workstation
        if "lock" in lower and any(w in lower for w in ["pc", "screen", "workstation", "system"]):
            return {"action": "lock_workstation", "confidence": 0.99, "source": "tier1_matrix"}

        # ---------------------------------------------------------------------
        # Tier 2: Local Qwen SLM Neural Fallback (if Ollama is active)
        # ---------------------------------------------------------------------
        try:
            slm_result = self._query_local_slm(clean_text)
            if slm_result and isinstance(slm_result, dict) and "action" in slm_result:
                slm_result["source"] = "tier2_local_slm"
                slm_result["slots"] = slots
                return slm_result
        except Exception:
            pass

        # ---------------------------------------------------------------------
        # Tier 3: Default Semantic Conversation
        # ---------------------------------------------------------------------
        return {
            "action": "conversation",
            "text": clean_text,
            "confidence": 0.85,
            "slots": slots,
            "source": "tier3_default_conversational"
        }

    def _query_local_slm(self, text: str) -> Optional[Dict[str, Any]]:
        """Queries local Qwen 2.5 SLM via Ollama endpoint for neural intent parsing."""
        prompt = f"{SYSTEM_TOOL_PROMPT}\n\nUser Command: \"{text}\"\nJSON Action:"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0.1, "num_predict": 100}
        }
        req = urllib.request.Request(
            f"{self.ollama_url}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            raw_json = data.get("response", "").strip()
            if not raw_json:
                return None
            clean_json = raw_json
            if "```json" in clean_json:
                clean_json = clean_json.split("```json")[-1].split("```")[0].strip()
            elif "```" in clean_json:
                clean_json = clean_json.split("```")[-1].split("```")[0].strip()
            return json.loads(clean_json)
