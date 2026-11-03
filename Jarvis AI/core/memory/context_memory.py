"""
J.A.R.V.I.S. Context & Working Memory Subsystem
Manages conversational turn buffer, active goals, and session scratchpad.
"""

from typing import List, Dict, Any, Optional
import time
import json
import os

class ContextMemory:
    def __init__(self, max_history_turns: int = 20, state_file: Optional[str] = None):
        self.max_history_turns = max_history_turns
        self.state_file = state_file
        self.conversation_history: List[Dict[str, Any]] = []
        self.active_goal: Optional[str] = None
        self.pending_confirmation_action: Optional[Dict[str, Any]] = None
        self.user_profile: Dict[str, Any] = {
            "name": "Sir",
            "preferences": {
                "theme": "dark",
                "default_browser": "chrome",
                "verbosity": "concise"
            }
        }
        self.facts: Dict[str, str] = {}
        
        if self.state_file and os.path.exists(self.state_file):
            self.load_state()

    def add_turn(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        """Adds a conversational turn to memory."""
        turn = {
            "role": role,
            "content": content,
            "timestamp": time.time(),
            "metadata": metadata or {}
        }
        self.conversation_history.append(turn)
        if len(self.conversation_history) > self.max_history_turns * 2:
            self.conversation_history = self.conversation_history[-self.max_history_turns * 2:]

    def get_recent_turns(self, count: int = 10) -> List[Dict[str, Any]]:
        """Returns the most recent conversation turns formatted for LLM context."""
        return self.conversation_history[-count:]

    def remember_fact(self, key: str, value: str):
        """Stores a persistent fact or preference."""
        self.facts[key] = value
        if self.state_file:
            self.save_state()

    def recall_fact(self, key: str) -> Optional[str]:
        return self.facts.get(key)

    def set_pending_action(self, action_dict: Dict[str, Any]):
        self.pending_confirmation_action = action_dict

    def clear_pending_action(self):
        self.pending_confirmation_action = None

    def save_state(self):
        if not self.state_file:
            return
        os.makedirs(os.path.dirname(self.state_file), exist_ok=True)
        data = {
            "user_profile": self.user_profile,
            "facts": self.facts
        }
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def load_state(self):
        try:
            with open(self.state_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.user_profile = data.get("user_profile", self.user_profile)
                self.facts = data.get("facts", {})
        except Exception:
            pass
