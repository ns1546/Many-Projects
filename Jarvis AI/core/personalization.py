"""
J.A.R.V.I.S. Hyper-Personalization Engine
Deep Executive Profiling, Adaptive Habit Learning, and Proactive Context Modeling:
- Models Boss lifestyle, decision criteria, focus rhythms, and VIP stakeholders
- Automatically learns user habits, preferences, and recurring patterns
- Seamlessly integrates with OmniMemory SQLite database and ContextMemory
- Enriches every assistant response with personalized executive context
"""

import time
import json
import os
import re
from typing import Dict, Any, List, Optional, Tuple

from core.memory.omni_memory import OmniMemory


class PersonalizationEngine:
    """
    Hyper-Personalized Cognitive Assistant Engine.
    Transforms J.A.R.V.I.S. from a generic chatbot into the Boss's intimate,
    proactive personal assistant and chief of staff.
    """

    def __init__(self, omni_memory: Optional[OmniMemory] = None, data_dir: Optional[str] = None):
        self.memory = omni_memory or OmniMemory()
        self.data_dir = data_dir or os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data")
        )
        os.makedirs(self.data_dir, exist_ok=True)
        self.profile_file = os.path.join(self.data_dir, "boss_personalized_profile.json")
        
        self.profile: Dict[str, Any] = {
            "name": "Tony",
            "title": "Sir",
            "role": "Master Commander / Chief Architect",
            "tone_preference": "refined_british_crisp",
            "focus_rhythm": {
                "ultradian_deep_work_minutes": 90,
                "break_minutes": 15,
                "preferred_start_hour": 8,
                "preferred_wind_down_hour": 22
            },
            "core_priorities": [
                "J.A.R.V.I.S. Autonomous Evolution",
                "Sub-Branch Operational Excellence",
                "High-Velocity Engineering Execution"
            ],
            "vip_network": [
                {"name": "Pepper Potts", "relation": "Chief Executive / Partner", "priority": "highest"},
                {"name": "James Rhodes", "relation": "Liaison / Colonel", "priority": "high"},
                {"name": "Happy Hogan", "relation": "Head of Security", "priority": "high"}
            ],
            "lifestyle_habits": {
                "coffee_preference": "Black Double Espresso",
                "workspace_environment": "Dark mode holographic terminal, multi-monitor",
                "music_preference": "Classic Rock & Ambient Cinematic Electronic",
                "notification_policy": "Strict buffer during deep focus blocks"
            },
            "learned_preferences": {},
            "active_projects": ["Mark 85 Architecture", "LifeGraph Expansion", "Hermes Agent Harness"],
            "last_interaction": time.time()
        }

        self._load_profile()

    def _load_profile(self):
        """Loads cached personalized profile and synchronizes with SQLite OmniMemory."""
        if os.path.exists(self.profile_file):
            try:
                with open(self.profile_file, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                    self.profile.update(saved)
            except Exception as e:
                print(f" [!] Warning loading personalization profile: {e}")

        # Synchronize with OmniMemory SQLite
        try:
            sqlite_profile = self.memory.get_all_profile()
            if "user_name" in sqlite_profile:
                self.profile["name"] = sqlite_profile["user_name"]
            if "user_title" in sqlite_profile:
                self.profile["title"] = sqlite_profile["user_title"]
        except Exception:
            pass

    def _save_profile(self):
        """Persists personalized profile to JSON and SQLite."""
        try:
            with open(self.profile_file, "w", encoding="utf-8") as f:
                json.dump(self.profile, f, indent=2)
        except Exception as e:
            print(f" [!] Error saving personalization profile: {e}")

        # Sync key fields to OmniMemory
        try:
            self.memory.set_profile_field("user_name", self.profile.get("name", "Tony"))
            self.memory.set_profile_field("user_title", self.profile.get("title", "Sir"))
            self.memory.set_profile_field("tone_preference", self.profile.get("tone_preference", "refined_british_crisp"))
            self.memory.set_profile_field("core_priorities", json.dumps(self.profile.get("core_priorities", [])))
        except Exception:
            pass

    # =========================================================================
    # 1. PROFILE MANAGEMENT & ADAPTIVE UPDATES
    # =========================================================================
    def set_priority(self, priority: str, rank: int = 0) -> str:
        """Adds or updates a top strategic priority for the Boss."""
        clean = priority.strip()
        if not clean:
            return "Invalid priority specification."

        priorities = self.profile.get("core_priorities", [])
        if clean in priorities:
            priorities.remove(clean)

        if rank == 0:
            priorities.insert(0, clean)
        else:
            priorities.append(clean)

        self.profile["core_priorities"] = priorities[:5]
        self._save_profile()
        self.memory.store_memory(f"Boss core priority updated: {clean}", category="priority", importance=5)
        return f"Core priority logged, {self.profile['title']}: '{clean}' is now priority #{priorities.index(clean) + 1}."

    def add_vip_contact(self, name: str, relation: str, priority: str = "high") -> str:
        """Registers a trusted VIP contact into the inner circle."""
        vip_list = self.profile.setdefault("vip_network", [])
        for v in vip_list:
            if v["name"].lower() == name.lower():
                v["relation"] = relation
                v["priority"] = priority
                self._save_profile()
                return f"VIP contact '{name}' updated as {relation} ({priority} priority)."

        vip_list.append({"name": name.strip(), "relation": relation.strip(), "priority": priority})
        self._save_profile()
        self.memory.add_contact(name, notes=f"VIP: {relation} ({priority} priority)")
        self.memory.store_memory(f"VIP Contact: {name} is {relation}", category="contact", importance=4)
        return f"VIP contact '{name}' added to your inner circle, {self.profile['title']}."

    def set_preference(self, key: str, value: Any) -> str:
        """Sets a personal preference (e.g. coffee, editor, theme, music)."""
        k = key.strip().lower().replace(" ", "_")
        self.profile["learned_preferences"][k] = value
        self._save_profile()
        self.memory.store_memory(f"User preference: {key} is {value}", category="preference", importance=3)
        return f"Preference remembered, {self.profile['title']}: {key} is set to {value}."

    def get_preference(self, key: str, default: Any = None) -> Any:
        """Retrieves a stored personal preference."""
        k = key.strip().lower().replace(" ", "_")
        return self.profile.get("learned_preferences", {}).get(k, default)

    # =========================================================================
    # 2. ADAPTIVE CONVERSATIONAL LEARNING
    # =========================================================================
    def learn_from_conversation(self, user_text: str, speaker_name: str = "Boss", is_boss: bool = True):
        """
        Extracts personal lifestyle habits, preferences, and recurring needs from dialogue.
        """
        if not is_boss:
            return

        text = user_text.strip()
        lower = text.lower()

        # 1. Project mentions
        proj_match = re.search(r"\b(?:working on|project|building|developing)\s+([a-zA-Z0-9_\-\s]{3,60})(?=[.,;!?]|$)", text, re.IGNORECASE)
        if proj_match:
            candidate = proj_match.group(1).strip()
            if candidate and candidate not in self.profile.get("active_projects", []):
                if len(candidate) > 2 and not any(w in candidate.lower() for w in ["it", "this", "something", "today", "now"]):
                    self.profile.setdefault("active_projects", []).append(candidate)
                    self._save_profile()
                    self.memory.store_memory(f"Boss is working on project '{candidate}'", category="project", importance=4)

        # 2. Direct preference cues ("I always prefer X", "I don't like Y", "My favorite is Z")
        pref_match = re.search(r"\b(?:i\s+always\s+prefer|i\s+prefer|my\s+favorite\s+\w+\s+is)\s+([^.,;!?]+)", text, re.IGNORECASE)
        if pref_match:
            detail = pref_match.group(0).strip()
            self.memory.store_memory(detail, category="preference", importance=3)

        # 3. Habit detection (e.g. "I wake up at 7", "I drink tea")
        if "wake up" in lower or "sleep at" in lower:
            self.memory.store_memory(f"Sleep/wake habit: {text}", category="habit", importance=4)

        self.profile["last_interaction"] = time.time()

    # =========================================================================
    # 3. CONTEXT ENRICHMENT & PROMPT SYNTHESIS
    # =========================================================================
    def build_personalized_context(self, current_query: str = "") -> str:
        """
        Assembles comprehensive, personalized executive context for LLM prompt injection.
        """
        title = self.profile.get("title", "Sir")
        name = self.profile.get("name", "Tony")
        priorities = self.profile.get("core_priorities", [])
        projects = self.profile.get("active_projects", [])
        vip = [v["name"] for v in self.profile.get("vip_network", [])[:3]]

        relevant_memories = self.memory.recall_relevant(current_query, limit=3)
        mem_bullets = [f"• {m['content']}" for m in relevant_memories]

        context_lines = [
            f"[Personal Executive Profile: Commander {name} ({title})]",
            f"[Core Strategic Priorities: {', '.join(priorities)}]",
            f"[Active Flagship Projects: {', '.join(projects[:3])}]",
            f"[Inner Circle VIPs: {', '.join(vip)}]"
        ]

        if mem_bullets:
            context_lines.append("[Relevant Episodic Memories & Past Directives:")
            context_lines.extend(mem_bullets)
            context_lines.append("]")

        return "\n".join(context_lines)

    def get_personalization_summary(self) -> Dict[str, Any]:
        """Returns a high-level inspection summary of how well J.A.R.V.I.S. knows the user."""
        all_memories = self.memory.recall_relevant("", limit=10)
        return {
            "user_name": self.profile.get("name", "Tony"),
            "user_title": self.profile.get("title", "Sir"),
            "priorities": self.profile.get("core_priorities", []),
            "active_projects": self.profile.get("active_projects", []),
            "vip_network": self.profile.get("vip_network", []),
            "learned_preferences_count": len(self.profile.get("learned_preferences", {})),
            "stored_memories_count": len(all_memories),
            "lifestyle_habits": self.profile.get("lifestyle_habits", {})
        }
