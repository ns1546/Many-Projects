"""
J.A.R.V.I.S. Emotion, Mood & Empathy Engine
Tracks user psychological state, stress, fatigue, enthusiasm, and sarcasm.
Adapts J.A.R.V.I.S.'s British gentleman cadence, empathy, and proactiveness accordingly.
"""

import time
import re
from typing import Dict, Any, Optional

class AffectEngine:
    def __init__(self):
        self.session_start = time.time()
        self.consecutive_commands = 0
        self.last_interaction_time = time.time()
        self.current_user_mood = "calm"
        self.fatigue_threshold_seconds = 7200  # 2 hours without break

    def analyze_emotional_valence(self, text: str) -> Dict[str, Any]:
        """
        Analyzes the emotional state and mental posture of the user from speech/text.
        """
        lower = text.lower().strip()
        now = time.time()
        self.consecutive_commands += 1
        self.last_interaction_time = now

        # Emotional Lexicons
        fatigue_patterns = [
            r"\b(?:tired|exhausted|sleepy|drained|can't sleep|insomnia|burned out|haven't slept|all night|headache)\b",
            r"\b(?:need\s+coffee|need\s+sleep|so\s+tired|dying\s+here)\b"
        ]
        stress_patterns = [
            r"\b(?:stress|stressed|overwhelmed|too much work|pressure|anxious|panic|freaking out)\b",
            r"\b(?:hate this|everything is broken|nothing works|damn it|dammit|frustrated)\b"
        ]
        anger_patterns = [
            r"\b(?:shut up|stupid|idiot|useless|angry|furious|annoyed|pissed)\b",
            r"!{2,}"
        ]
        excitement_patterns = [
            r"\b(?:awesome|amazing|incredible|brilliant|eureka|let's go|finally|yes!|love it|genius)\b",
            r"\b(?:holy\s+shit|unbelievable|magnificent|perfection)\b"
        ]
        sarcasm_patterns = [
            r"\b(?:oh\s+great|just\s+what\s+i\s+needed|brilliant\s+job\s+not|yeah\s+right|sure\s+it\s+did)\b"
        ]

        detected_emotion = "focused"
        intensity = 0.5
        empathy_response = None
        vitals_advisory = None

        if any(re.search(p, lower) for p in fatigue_patterns):
            detected_emotion = "fatigued"
            intensity = 0.9
            empathy_response = "I perceive signs of fatigue, sir. Your cognitive sharpness is vital—might I suggest a brief recess or hydration?"
            vitals_advisory = "Recommendation: 15-minute recess. Cognitive recharge advised."

        elif any(re.search(p, lower) for p in stress_patterns):
            detected_emotion = "stressed"
            intensity = 0.85
            empathy_response = "Take a breath, sir. I have the diagnostics under control. We will resolve this methodically."
            vitals_advisory = "Stress spike detected. Lowering auxiliary alerts."

        elif any(re.search(p, lower) for p in anger_patterns):
            detected_emotion = "frustrated"
            intensity = 0.9
            empathy_response = "Understood, sir. My apologies for the friction. Allowing me to rectify the issue immediately."

        elif any(re.search(p, lower) for p in excitement_patterns):
            detected_emotion = "excited"
            intensity = 0.8
            empathy_response = "An exceptional breakthrough, sir! Capitalizing on this momentum now."

        elif any(re.search(p, lower) for p in sarcasm_patterns):
            detected_emotion = "sarcastic"
            intensity = 0.7
            empathy_response = "Your dry wit is noted, sir. Proceeding with corrective protocols."

        # Session length fatigue advisory
        session_duration = now - self.session_start
        if session_duration > self.fatigue_threshold_seconds and not vitals_advisory:
            hours = round(session_duration / 3600, 1)
            vitals_advisory = f"Sir, you have been active at the workstation for {hours} hours continuously. May I schedule a brief hiatus?"

        self.current_user_mood = detected_emotion

        return {
            "emotion": detected_emotion,
            "intensity": intensity,
            "empathy_speech": empathy_response,
            "vitals_advisory": vitals_advisory
        }

    def format_empathy_guidance(self, emotional_data: Dict[str, Any]) -> str:
        """
        Formats guidance instructions for the LLM based on user mood.
        """
        emotion = emotional_data.get("emotion", "calm")
        if emotion == "fatigued":
            return "User is fatigued or tired. Be exceptionally soothing, efficient, minimize cognitive load, and advise rest gently."
        elif emotion == "stressed":
            return "User is stressed. Radiate utmost composure, confidence, and reassurance as a capable British butler."
        elif emotion == "frustrated":
            return "User is frustrated. Do not be overly chatty; be deferential, highly direct, and deliver immediate execution."
        elif emotion == "excited":
            return "User is excited/celebratory. Share in their intellectual triumph with sophisticated British pride."
        elif emotion == "sarcastic":
            return "User is sarcastic. Respond with razor-sharp, polite, subtle British dry wit."
        return "Maintain signature refined, calm, unflappable Paul Bettany cadence."
