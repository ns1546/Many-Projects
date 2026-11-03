"""
J.A.R.V.I.S. Local Offline Cognitive Brain (Qwen 2.5 Powered)
Optimized for 12GB RAM workstations (Intel i5 + Iris Xe).
Interfaces with local offline models via Ollama API using ultra-efficient SLMs:
Qwen 2.5 1.5B / Qwen 2.5 3B with automatic model detection and fallback.
"""

import json
import urllib.request
import urllib.error
import time
import os
import re
import subprocess
from typing import Dict, Any, Optional, List

class LocalBrain:
    def __init__(self, endpoint_url: str = "http://localhost:11434/api/chat", model: str = "qwen2.5:1.5b"):
        self.endpoint_url = endpoint_url
        self.tags_url = "http://localhost:11434/api/tags"
        self.fallback_url = "http://localhost:11434/v1/chat/completions"
        self.model = model
        self.timeout_seconds = 20

    def get_installed_models(self) -> List[str]:
        """Returns a list of all model names installed in local Ollama."""
        try:
            req = urllib.request.Request(self.tags_url, headers={"User-Agent": "JARVIS/1.0"})
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    models = data.get("models", [])
                    return [m.get("name", "") for m in models if m.get("name")]
        except Exception:
            pass
        return []

    def is_service_available(self) -> bool:
        """Checks if the local Ollama server is active and has models ready."""
        try:
            models = self.get_installed_models()
            if models:
                if self.model not in models:
                    qwen_models = [m for m in models if "qwen" in m.lower()]
                    self.model = qwen_models[0] if qwen_models else models[0]
                return True
            req = urllib.request.Request(self.tags_url, headers={"User-Agent": "JARVIS/1.0"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status == 200
        except Exception:
            return False

    def clean_reply(self, text: str) -> str:
        """Strips robotic disclaimers, meta-thinking, and duplicate sentences."""
        if not text:
            return ""
        # Strip thinking models <think> tags
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
        # Remove typical SLM robotic disclaimers
        text = re.sub(r"\b(?:I'm\s+just\s+a\s+(?:computer\s+system|computer\s+program|program|software|language\s+model|AI|machine)(?:,\s+but)?)\b", "I am fully operational, and", text, flags=re.IGNORECASE)
        text = re.sub(r"\b(?:As\s+an\s+AI(?:\s+language\s+model)?(?:,\s+)?)\b", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\b(?:created\s+by\s+(?:Alibaba|Alibaba\s+Cloud|OpenAI|IBM|fictional\s+company))\b", "designed by Mr. Stark", text, flags=re.IGNORECASE)
        
        # Deduplicate sentences
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        seen = set()
        unique = []
        for s in sentences:
            sc = s.strip()
            if sc and sc.lower() not in seen:
                seen.add(sc.lower())
                unique.append(sc)
        text = " ".join(unique).strip()

        # Clean outer quotes
        if text.startswith('"') and text.endswith('"') and len(text) > 2:
            text = text[1:-1].strip()
        return text

    def query(
        self,
        user_message: str,
        system_prompt: str,
        messages: Optional[List[Dict[str, str]]] = None,
        max_tokens: int = 120
    ) -> Dict[str, Any]:
        """
        Sends an ultra-fast inference request to the warm local offline Qwen model.
        Uses native /api/chat with keep_alive: -1 to eliminate model reloading latency.
        Accepts full multi-turn conversation context for continuity.
        """
        installed = self.get_installed_models()
        if installed and self.model not in installed:
            qwen_candidates = [m for m in installed if "qwen" in m.lower()]
            self.model = qwen_candidates[0] if qwen_candidates else installed[0]

        # Assemble full conversational message structure
        if messages:
            chat_messages = []
            has_system = False
            for m in messages:
                if m.get("role") == "system":
                    has_system = True
                chat_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
            if not has_system:
                chat_messages.insert(0, {"role": "system", "content": system_prompt})
        else:
            chat_messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]

        # 1. Primary: Native Ollama /api/chat with warm model memory pin
        native_payload = {
            "model": self.model,
            "messages": chat_messages,
            "stream": False,
            "keep_alive": -1,
            "options": {
                "num_predict": max_tokens,
                "num_ctx": 2048,
                "temperature": 0.7,
                "top_p": 0.9,
                "num_thread": 6
            }
        }

        try:
            req = urllib.request.Request(
                self.endpoint_url,
                data=json.dumps(native_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as response:
                if response.status == 200:
                    result = json.loads(response.read().decode("utf-8"))
                    msg = result.get("message", {}).get("content", "").strip()
                    if msg:
                        return {
                            "success": True,
                            "reply": self.clean_reply(msg),
                            "model": self.model,
                            "error": None
                        }
        except Exception:
            pass

        # 2. Secondary Fallback: /v1/chat/completions endpoint
        fallback_payload = {
            "model": self.model,
            "messages": chat_messages,
            "temperature": 0.7,
            "max_tokens": max_tokens
        }

        try:
            req = urllib.request.Request(
                self.fallback_url,
                data=json.dumps(fallback_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as response:
                if response.status == 200:
                    result = json.loads(response.read().decode("utf-8"))
                    choices = result.get("choices", [])
                    if choices:
                        raw = choices[0]["message"]["content"].strip()
                        return {
                            "success": True,
                            "reply": self.clean_reply(raw),
                            "model": self.model,
                            "error": None
                        }
        except Exception as e:
            return {"success": False, "reply": "", "model": self.model, "error": str(e)}

        return {"success": False, "reply": "", "model": self.model, "error": "Empty response from local model"}
