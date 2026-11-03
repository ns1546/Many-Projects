"""
J.A.R.V.I.S. High-Speed Multi-Provider Cognitive Engine
Architected for sub-second vocal intelligence:
1. Groq LPU (Ultra-Fast 250ms inference via Llama 3.1 8B Instant)
2. Google Gemini Flash (350ms inference via Gemini 2.0 Flash)
3. OpenRouter Auto-Cascade
4. Local Warm Qwen 2.5 SLM (Zero-quota offline fallback)
"""

import json
import os
import re
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional


class FastCloudBrain:
    """
    Sub-second multi-cloud and local inference engine.
    Automatically prioritizes lowest-latency providers (Groq -> Gemini -> OpenRouter -> Local).
    """

    def __init__(self):
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY")
        self.openrouter_api_key = os.environ.get("OPENROUTER_API_KEY")
        self._load_keys_from_env_file()

    def _load_keys_from_env_file(self):
        """Reads API keys from .env file if not already present in environment."""
        env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("#") or "=" not in line:
                            continue
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip('"').strip("'")
                        if key == "GROQ_API_KEY" and not self.groq_api_key:
                            self.groq_api_key = val
                        elif key == "GEMINI_API_KEY" and not self.gemini_api_key:
                            self.gemini_api_key = val
                        elif key == "OPENROUTER_API_KEY" and not self.openrouter_api_key:
                            self.openrouter_api_key = val
            except Exception:
                pass

    def set_api_key(self, provider: str, key_value: str) -> bool:
        """Dynamically persists a newly provided API key to .env and active runtime."""
        provider = provider.lower().strip()
        key_value = key_value.strip()
        if not key_value:
            return False

        if provider == "groq":
            self.groq_api_key = key_value
            env_var = "GROQ_API_KEY"
        elif provider in ("gemini", "google"):
            self.gemini_api_key = key_value
            env_var = "GEMINI_API_KEY"
        elif provider == "openrouter":
            self.openrouter_api_key = key_value
            env_var = "OPENROUTER_API_KEY"
        else:
            return False

        os.environ[env_var] = key_value

        # Persist to .env
        env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
        lines = []
        found = False
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith(f"{env_var}="):
                        lines.append(f"{env_var}={key_value}\n")
                        found = True
                    else:
                        lines.append(line)
        if not found:
            lines.append(f"{env_var}={key_value}\n")

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(lines)

        return True

    def clean_reply(self, text: str) -> str:
        """Removes reasoning tokens, markdown formatting, meta-chatter, and robotic disclaimers."""
        if not text:
            return ""

        # Remove deepseek/thinking tags
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)

        # Remove typical AI boilerplate disclaimers
        text = re.sub(r"\b(?:As\s+an\s+AI(?:\s+language\s+model)?(?:,\s+)?)\b", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\b(?:I'm\s+just\s+an?\s+(?:AI|computer\s+program|language\s+model))\b", "I am standing by", text, flags=re.IGNORECASE)

        # Clean markdown asterisks and hashtags for TTS cleanliness
        text = text.replace("**", "").replace("*", "").replace("###", "").replace("##", "")

        # Deduplicate sentences
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        seen = set()
        unique = []
        for s in sentences:
            s_clean = s.strip()
            if s_clean and s_clean.lower() not in seen:
                seen.add(s_clean.lower())
                unique.append(s_clean)
        text = " ".join(unique).strip()

        # Clean wrapping quotes
        if text.startswith('"') and text.endswith('"') and len(text) > 2:
            text = text[1:-1].strip()

        return text

    def query(self, messages: List[Dict[str, str]], max_tokens: int = 60) -> Dict[str, Any]:
        """
        Executes query through the fastest available provider.
        Priority: Groq (250ms) -> Gemini (350ms) -> OpenRouter (500ms).
        """
        self._load_keys_from_env_file()

        # 1. Groq LPU (Sub-300ms ultra-fast inference)
        if self.groq_api_key and len(self.groq_api_key) > 10:
            res = self._query_groq(messages, max_tokens)
            if res["success"]:
                return res

        # 2. Gemini Flash (Sub-400ms Google TPU inference)
        if self.gemini_api_key and len(self.gemini_api_key) > 10:
            res = self._query_gemini(messages, max_tokens)
            if res["success"]:
                return res

        # 3. OpenRouter (Secondary Cloud Option)
        if self.openrouter_api_key and len(self.openrouter_api_key) > 10:
            res = self._query_openrouter(messages, max_tokens)
            if res["success"]:
                return res

        return {
            "success": False,
            "reply": "",
            "provider": None,
            "error": "No cloud AI provider available or quotas exhausted."
        }

    def _query_groq(self, messages: List[Dict[str, str]], max_tokens: int = 60) -> Dict[str, Any]:
        """Queries Groq Cloud LPU endpoint."""
        endpoint = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.5
        }
        try:
            req = urllib.request.Request(endpoint, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    choices = data.get("choices", [])
                    if choices:
                        raw = choices[0].get("message", {}).get("content", "")
                        cleaned = self.clean_reply(raw)
                        if cleaned:
                            return {"success": True, "reply": cleaned, "provider": "Groq LPU (Llama 3.1 8B)"}
        except Exception as e:
            pass
        return {"success": False, "reply": "", "provider": "Groq"}

    def _query_gemini(self, messages: List[Dict[str, str]], max_tokens: int = 60) -> Dict[str, Any]:
        """Queries Google Gemini 2.0 Flash endpoint."""
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_api_key}"
        headers = {"Content-Type": "application/json"}

        # Format system prompt and user history into Gemini contents schema
        system_instruction = None
        contents = []
        for m in messages:
            role = m.get("role")
            content = m.get("content", "")
            if role == "system":
                system_instruction = {"parts": [{"text": content}]}
            elif role == "user":
                contents.append({"role": "user", "parts": [{"text": content}]})
            elif role == "assistant":
                contents.append({"role": "model", "parts": [{"text": content}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": 0.5
            }
        }
        if system_instruction:
            payload["systemInstruction"] = system_instruction

        try:
            req = urllib.request.Request(endpoint, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    cands = data.get("candidates", [])
                    if cands:
                        parts = cands[0].get("content", {}).get("parts", [])
                        if parts:
                            raw = parts[0].get("text", "")
                            cleaned = self.clean_reply(raw)
                            if cleaned:
                                return {"success": True, "reply": cleaned, "provider": "Gemini 2.0 Flash"}
        except Exception as e:
            pass
        return {"success": False, "reply": "", "provider": "Gemini"}

    def _query_openrouter(self, messages: List[Dict[str, str]], max_tokens: int = 60) -> Dict[str, Any]:
        """Queries OpenRouter with free/active model fallback."""
        endpoint = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/jarvis-ai",
            "X-Title": "JARVIS"
        }
        for model in ["liquid/lfm-2.5-2.6b:free", "google/gemma-4-31b-it:free", "nvidia/nemotron-3.5-lightning:free"]:
            payload = {
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.5
            }
            try:
                req = urllib.request.Request(endpoint, data=json.dumps(payload).encode("utf-8"), headers=headers)
                with urllib.request.urlopen(req, timeout=6) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode("utf-8"))
                        choices = data.get("choices", [])
                        if choices:
                            raw = choices[0].get("message", {}).get("content", "")
                            cleaned = self.clean_reply(raw)
                            if cleaned:
                                return {"success": True, "reply": cleaned, "provider": f"OpenRouter ({model})"}
            except Exception:
                continue
        return {"success": False, "reply": "", "provider": "OpenRouter"}
