"""
J.A.R.V.I.S. Direct OpenRouter Cognitive Brain
Ultra-low latency, robust fallback cascade, zero-RAM cloud cognition for J.A.R.V.I.S.
"""

import json
import os
import re
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

class OpenRouterBrain:
    """
    Cognitive Brain utilizing OpenRouter's free and high-tier models
    with automatic failover cascading and clean response extraction.
    """
    MODELS_CASCADE = [
        "cohere/north-mini-code:free",
        "openrouter/free",
        "nvidia/nemotron-3.5-lightning:free",
        "poolside/laguna-s-2.1:free",
        "google/gemma-4-31b-it:free"
    ]

    def __init__(self, api_key: Optional[str] = None, default_model: Optional[str] = None):
        self.endpoint = "https://openrouter.ai/api/v1/chat/completions"
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
        self.default_model = default_model
        
        # Load key from .env if not found
        if not self.api_key:
            env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
            if os.path.exists(env_file):
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("OPENROUTER_API_KEY="):
                            self.api_key = line.split("=", 1)[1].strip()
                            break

    def clean_reply(self, text: str) -> str:
        """Cleans internal monologue, thinking blocks, prompt echoes, and meta-commentary."""
        if not text:
            return ""
        # Strip <think>...</think>
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
        
        # Strip thinking process prefixes
        if "Here's a thinking process:" in text:
            parts = text.split("\n\n")
            non_thinking = [
                p.strip() for p in parts 
                if p.strip() and not p.strip().startswith(("1.", "2.", "3.", "*", "-", "Analyze", "Determine", "Identify"))
            ]
            text = non_thinking[-1] if non_thinking else parts[-1].strip()
            
        # Strip meta reasoning paragraphs
        paragraphs = text.split("\n\n")
        cleaned_paragraphs = []
        for p in paragraphs:
            trimmed = p.strip()
            if any(trimmed.startswith(prefix) for prefix in [
                "The user asks", "The user wants", "The user is greeting",
                "According to persona", "According to core directives",
                "I should:", "I need to respond", "Let's craft", "Let me craft",
                "Constraints:", "Persona:", "We need to respond"
            ]):
                continue
            cleaned_paragraphs.append(trimmed)
            
        text = " ".join(cleaned_paragraphs).strip()

        # Deduplicate repeated sentences or whole-string echoing
        if len(text) > 10:
            mid = len(text) // 2
            if text[:mid].strip() == text[mid:].strip():
                text = text[:mid].strip()
            else:
                sentences = re.split(r'(?<=[.!?])\s+', text)
                seen = set()
                unique = []
                for s in sentences:
                    s_clean = s.strip()
                    if s_clean and s_clean.lower() not in seen:
                        seen.add(s_clean.lower())
                        unique.append(s_clean)
                text = " ".join(unique).strip()

        # Normalize non-ASCII punctuation for Windows terminal and speech stability
        text = text.replace("—", " - ").replace("–", " - ")
        text = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
        text = text.replace("…", "...")

        # Clean quotes if model wrapped entire reply in quotation marks
        if text.startswith('"') and text.endswith('"') and len(text) > 2:
            text = text[1:-1].strip()
        return text

    def query(self, messages: List[Dict[str, str]], max_tokens: int = 200, temperature: float = 0.4) -> Dict[str, Any]:
        """
        Queries OpenRouter with automatic failover across high-speed models.
        Suppresses internal monologue and returns crisp, in-character persona speech.
        """
        if not self.api_key:
            return {
                "success": False,
                "reply": "",
                "model_used": None,
                "error": "OpenRouter API key is not configured."
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/jarvis-ai",
            "X-Title": "J.A.R.V.I.S. Cognitive Assistant"
        }

        models_to_try = list(self.MODELS_CASCADE)
        if self.default_model and self.default_model in models_to_try:
            models_to_try.remove(self.default_model)
            models_to_try.insert(0, self.default_model)
        elif self.default_model:
            models_to_try.insert(0, self.default_model)

        last_error = None
        for model in models_to_try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "reasoning": {
                    "effort": "none"
                }
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(self.endpoint, data=data, headers=headers)

            try:
                with urllib.request.urlopen(req, timeout=12) as resp:
                    if resp.status == 200:
                        result = json.loads(resp.read().decode("utf-8"))
                        choices = result.get("choices", [])
                        if choices:
                            choice = choices[0]
                            msg = choice.get("message", {})
                            # Only accept real content, never raw reasoning monologue
                            raw_content = msg.get("content") or choice.get("text") or ""
                            cleaned = self.clean_reply(raw_content)
                            if cleaned and len(cleaned.strip()) > 3:
                                return {
                                    "success": True,
                                    "reply": cleaned,
                                    "model_used": model,
                                    "error": None
                                }
            except urllib.error.HTTPError as e:
                last_error = f"HTTP {e.code} on {model}"
                if e.code in (429, 401, 402):
                    break
                continue
            except Exception as e:
                last_error = f"{type(e).__name__} on {model}: {e}"
                continue

        return {
            "success": False,
            "reply": "",
            "model_used": None,
            "error": last_error or "All models in cascade failed to return a response."
        }
