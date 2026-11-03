"""
J.A.R.V.I.S. Safety & Authorization Subsystem
Enforces 3-Tier Action Verification Gates
"""

from enum import Enum
from typing import Dict, Any, Optional
import re

class SafetyTier(Enum):
    TIER_1_ROUTINE = 1       # Auto-approved: Read-only, status, opening apps, searches
    TIER_2_ACTIONABLE = 2    # Verbal Confirmation: Closing apps, saving files, drafting messages
    TIER_3_CRITICAL = 3      # Strict Confirmation: Deleting files, sending external messages, killing critical tasks

class SafetyGate:
    def __init__(self, enforce_gates: bool = True):
        self.enforce_gates = enforce_gates
        
        # Patterns classified as Tier 3 (Critical / Irreversible)
        self.critical_patterns = [
            r"\b(delete|remove|rmdir|rm|del|erase|wipe|drop|format)\b",
            r"\b(send|dispatch|transmit)\s+(email|money|funds|payment|crypto)\b",
            r"\b(shutdown|restart|reboot|kill\s+all)\b",
            r"\b(truncate|shred|overwrite)\b"
        ]
        
        # Patterns classified as Tier 2 (State-changing)
        self.actionable_patterns = [
            r"\b(close|kill|terminate|stop|quit)\b",
            r"\b(draft|compose|prepare)\s+(email|message|reply)\b",
            r"\b(modify|change|edit|update|write|install)\b",
            r"\b(mute|unmute|set\s+volume)\b"
        ]

    def classify_action(self, action_name: str, parameters: Optional[Dict[str, Any]] = None) -> SafetyTier:
        """Determines the safety tier of an action based on name and parameters."""
        text = f"{action_name} {str(parameters or '')}".lower()
        
        for pat in self.critical_patterns:
            if re.search(pat, text):
                return SafetyTier.TIER_3_CRITICAL
                
        for pat in self.actionable_patterns:
            if re.search(pat, text):
                return SafetyTier.TIER_2_ACTIONABLE
                
        return SafetyTier.TIER_1_ROUTINE

    def evaluate_execution(self, action_name: str, parameters: Optional[Dict[str, Any]] = None, user_confirmed: bool = False) -> Dict[str, Any]:
        """
        Evaluates whether an action is authorized to proceed.
        Returns a dict with 'allowed', 'tier', 'prompt_needed', and 'reason'.
        """
        tier = self.classify_action(action_name, parameters)
        
        if not self.enforce_gates:
            return {"allowed": True, "tier": tier, "prompt_needed": False, "reason": "Gates bypassed by config."}
            
        if tier == SafetyTier.TIER_1_ROUTINE:
            return {
                "allowed": True,
                "tier": tier,
                "prompt_needed": False,
                "reason": "Routine action automatically authorized."
            }
        elif tier == SafetyTier.TIER_2_ACTIONABLE:
            if user_confirmed:
                return {
                    "allowed": True,
                    "tier": tier,
                    "prompt_needed": False,
                    "reason": "Verbal authorization received."
                }
            else:
                return {
                    "allowed": False,
                    "tier": tier,
                    "prompt_needed": True,
                    "prompt": f"I am prepared to {action_name}. Shall I proceed, sir?",
                    "reason": "Action requires verbal confirmation."
                }
        else: # TIER_3_CRITICAL
            if user_confirmed:
                return {
                    "allowed": True,
                    "tier": tier,
                    "prompt_needed": False,
                    "reason": "Strict confirmation verified."
                }
            else:
                return {
                    "allowed": False,
                    "tier": tier,
                    "prompt_needed": True,
                    "prompt": f"Caution, sir. This action is irreversible: '{action_name}'. Please explicitly confirm execution.",
                    "reason": "Critical tier requires explicit user confirmation."
                }
