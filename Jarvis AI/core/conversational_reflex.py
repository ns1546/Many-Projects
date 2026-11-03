"""
J.A.R.V.I.S. Instant Reflex Engine
Delivers authentic, refined British AI responses in <5 milliseconds for
standard conversational pleasantries, status checks, greetings, time/date,
and common inquiries without incurring SLM token generation or network latency.
"""

import datetime
import random
import re
import time
from typing import Optional, Dict, Any


class ConversationalReflexEngine:
    """
    Sub-5ms reflexive conversational intelligence.
    Emulates Tony Stark's personal major-domo with wit, eloquence, and speed.
    """

    def __init__(self, owner_name: str = "Sir"):
        self.owner_name = owner_name
        self.last_interaction_time: float = 0.0

    def get_time_appropriate_salutation(self) -> str:
        """Returns morning, afternoon, or evening based on real local system clock."""
        hour = datetime.datetime.now().hour
        if 4 <= hour < 12:
            return "Good morning"
        elif 12 <= hour < 17:
            return "Good afternoon"
        else:
            return "Good evening"

    def match_reflex(self, text: str, os_controller: Any = None) -> Optional[Dict[str, Any]]:
        """
        Evaluates input text against reflexive neural patterns.
        Returns response dict if matched, None if deeper cognition is required.
        """
        if not text:
            return None

        clean = text.lower().strip()
        # Strip trailing punctuation
        clean = re.sub(r"[?!.,]+$", "", clean).strip()

        salutation = self.get_time_appropriate_salutation()

        # 1. Direct Greetings & Wake calls
        greeting_patterns = [
            r"^(?:hello|hi|hey|good\s+day)\s*(?:jarvis)?$",
            r"^jarvis$",
            r"^hey\s+jarvis$",
            r"^hello\s+jarvis$",
            r"^are\s+you\s+there\s*(?:jarvis)?$",
            r"^you\s+there\s*(?:jarvis)?$",
            r"^wake\s+up\s*(?:jarvis)?$"
        ]
        if any(re.match(p, clean) for p in greeting_patterns):
            now_ts = time.time()
            if self.last_interaction_time > 0 and (now_ts - self.last_interaction_time) < 45.0:
                self.last_interaction_time = now_ts
                re_engagements = [
                    f"Yes, {self.owner_name}?",
                    f"Still right here, {self.owner_name}. What's on your mind?",
                    f"Listening, {self.owner_name}.",
                    f"At your service, {self.owner_name}. What do you need?",
                    f"I'm here, {self.owner_name}. Go ahead."
                ]
                return {
                    "speech": random.choice(re_engagements),
                    "action_taken": "reflex_reengagement",
                    "reflex_type": "reengagement"
                }

            self.last_interaction_time = now_ts
            responses = [
                f"{salutation}, {self.owner_name}. At your service. How may I assist you?",
                f"{salutation}, {self.owner_name}. All systems operational and standing by.",
                f"Always at your service, {self.owner_name}. What is your directive?",
                f"Online and fully attentive, {self.owner_name}. What do you require?",
                f"{salutation}, {self.owner_name}. J.A.R.V.I.S. is primed and ready. What shall we tackle?"
            ]
            return {
                "speech": random.choice(responses),
                "action_taken": "reflex_greeting",
                "reflex_type": "greeting"
            }

        # 2. Time-specific greetings (Good morning / Good afternoon / Good evening / Good night)
        if re.match(r"^good\s+morning\s*(?:jarvis)?$", clean):
            hour = datetime.datetime.now().hour
            if hour >= 12:
                speech = f"Good {salutation.lower().replace('good ', '')}, {self.owner_name}, though it is currently {datetime.datetime.now().strftime('%I:%M %p')}. All systems are standing by."
            else:
                speech = f"Good morning, {self.owner_name}. I trust you rested well. All Stark diagnostic routines report green."
            return {"speech": speech, "action_taken": "reflex_salutation", "reflex_type": "morning"}

        if re.match(r"^good\s+evening\s*(?:jarvis)?$", clean):
            speech = f"Good evening, {self.owner_name}. Standing by for your evening agenda."
            return {"speech": speech, "action_taken": "reflex_salutation", "reflex_type": "evening"}

        if re.match(r"^good\s+night\s*(?:jarvis)?$", clean):
            speech = f"Good night, {self.owner_name}. I shall maintain defensive sentry protocols while you rest."
            return {"speech": speech, "action_taken": "reflex_salutation", "reflex_type": "night"}

        # 3. Status, Vitals, and Well-being
        status_patterns = [
            r"^how\s+are\s+you\s*(?:doing)?\s*(?:jarvis|today)?$",
            r"^system\s+status\s*(?:report)?$",
            r"^status\s+report$",
            r"^are\s+you\s+(?:alright|ok|okay)\s*(?:jarvis)?$",
            r"^health\s+check$"
        ]
        if any(re.match(p, clean) for p in status_patterns):
            if os_controller and hasattr(os_controller, "get_system_vitals"):
                try:
                    v = os_controller.get_system_vitals()
                    cpu = v.get("cpu_percent", 14)
                    ram = v.get("ram_percent", 48)
                    speech = f"Operating at peak efficiency, {self.owner_name}. CPU is at {cpu} percent, memory at {ram} percent, and all neural pathways are responsive."
                except Exception:
                    speech = f"Operating at nominal capacity, {self.owner_name}. All primary subsystems are active."
            else:
                speech = f"Functioning optimally, {self.owner_name}. All sensory and cognitive arrays are standing by."
            return {"speech": speech, "action_taken": "reflex_status", "reflex_type": "status"}

        # 4. Gratitude & Social Pleasantries
        thanks_patterns = [
            r"^(?:thank\s+you|thanks|thank\s+you\s+so\s+much|many\s+thanks)\s*(?:jarvis)?$",
            r"^(?:great|good)\s+job\s*(?:jarvis)?$",
            r"^well\s+done\s*(?:jarvis)?$",
            r"^awesome\s*(?:jarvis)?$"
        ]
        if any(re.match(p, clean) for p in thanks_patterns):
            responses = [
                f"Always a pleasure to be of service, {self.owner_name}.",
                f"You are most welcome, {self.owner_name}.",
                f"Quite satisfied to assist, {self.owner_name}. Standing by for further instructions.",
                f"A pleasure as always, {self.owner_name}."
            ]
            return {"speech": random.choice(responses), "action_taken": "reflex_thanks", "reflex_type": "thanks"}

        # 5. Microphone & Auditory checks
        audio_check_patterns = [
            r"^can\s+you\s+hear\s+me\s*(?:jarvis)?$",
            r"^do\s+you\s+hear\s+me\s*(?:jarvis)?$",
            r"^(?:mic|microphone|audio|voice)\s+check$",
            r"^testing\s*(?:one\s*two\s*three|1\s*2\s*3)?$",
            r"^is\s+(?:this|my\s+mic)\s+working$"
        ]
        if any(re.match(p, clean) for p in audio_check_patterns):
            return {
                "speech": f"Loud and clear, {self.owner_name}. Audio receptors are calibrated with crystal precision.",
                "action_taken": "reflex_audiocheck",
                "reflex_type": "audiocheck"
            }

        # 6. Current Time and Date Reflex
        if (
            re.search(r"\b(?:time\s+(?:and\s+)?date|date\s+(?:and\s+)?time|time\s+today|about\s+time\s+today)\b", clean)
            or ("time" in clean and "today" in clean and "weather" not in clean)
        ):
            now = datetime.datetime.now()
            time_str = now.strftime("%I:%M %p")
            date_str = now.strftime("%A, %B %d, %Y")
            speech = f"The time is precisely {time_str} today, {date_str}, {self.owner_name}."
            return {"speech": speech, "action_taken": "reflex_time_and_date", "reflex_type": "time_date"}

        time_patterns = [
            r"\b(?:what(?:\'s|\s+is)\s+(?:the\s+)?time|tell\s+(?:me\s+)?(?:the\s+)?time|what\s+time(?:\s+is\s+it)?|current\s+time|time\s+now|time\s+please)\b",
            r"^time$",
            r"^what\s+time$"
        ]
        if any(re.search(p, clean) for p in time_patterns):
            now = datetime.datetime.now()
            time_str = now.strftime("%I:%M %p")
            speech = f"The time is precisely {time_str}, {self.owner_name}."
            return {"speech": speech, "action_taken": "reflex_time", "reflex_type": "time"}

        date_patterns = [
            r"\b(?:what(?:\'s|\s+is)\s+(?:the\s+)?date|today\'?s?\s+date|what\s+day\s+(?:is\s+it|is\s+today)|what\s+is\s+today|current\s+date|date\s+today|what\s+date)\b",
            r"^date$",
            r"^today\'?s?\s+date$"
        ]
        if any(re.search(p, clean) for p in date_patterns):
            now = datetime.datetime.now()
            date_str = now.strftime("%A, %B %d, %Y")
            speech = f"Today is {date_str}, {self.owner_name}."
            return {"speech": speech, "action_taken": "reflex_date", "reflex_type": "date"}

        # 7. Identity & Capabilities overview
        if re.match(r"^(?:who|what)\s+are\s+you\s*(?:jarvis)?$", clean):
            speech = f"I am J.A.R.V.I.S., Just A Rather Very Intelligent System, your executive cognitive major-domo. I manage PC automation, meeting intelligence, daily routines, and autonomous operations."
            return {"speech": speech, "action_taken": "reflex_identity", "reflex_type": "identity"}

        if re.match(r"^what\s+can\s+you\s+do\s*(?:jarvis)?$", clean) or clean in ["help", "commands", "features"]:
            speech = f"I oversee your PC hardware, execute terminal directives, manage meetings with speaker diarization, triage WhatsApp communications, and control desktop applications via hands-free voice."
            return {"speech": speech, "action_taken": "reflex_capabilities", "reflex_type": "capabilities"}

        # 8. Quick Standby / Dismissal
        if any(re.match(p, clean) for p in [r"^stand\s*by\s*(?:jarvis)?$", r"^be\s+quiet$", r"^that\s+will\s+be\s+all\s*(?:jarvis)?$"]):
            return {
                "speech": f"Standing by on ambient frequency, {self.owner_name}.",
                "action_taken": "reflex_standby",
                "reflex_type": "standby"
            }

        return None
