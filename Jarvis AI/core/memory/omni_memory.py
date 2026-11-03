"""
J.A.R.V.I.S. Omni-Memory Persistent Database
Permanent long-term memory, user profile modeling, emotional memory,
and associative recall powered by SQLite and JSON caching.
Never forgets user identity, preferences, contacts, projects, or past tasks.
"""

import sqlite3
import os
import time
import json
import re
from typing import List, Dict, Any, Optional

class OmniMemory:
    def __init__(self, db_path: Optional[str] = None):
        if db_path:
            self.db_path = db_path
        else:
            data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
            os.makedirs(data_dir, exist_ok=True)
            self.db_path = os.path.join(data_dir, "jarvis_omni_memory.db")
            
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initializes tables for permanent memory storage."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # User profile (Name, preferences, habits, identity)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_profile (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at REAL NOT NULL
                )
            """)

            # Episodic and factual long-term memories
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS memories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL, -- 'preference', 'fact', 'instruction', 'project', 'emotion'
                    content TEXT NOT NULL,
                    importance INTEGER DEFAULT 1, -- 1 to 5
                    emotional_tag TEXT, -- 'happy', 'stressed', 'tired', 'curious', 'neutral'
                    timestamp REAL NOT NULL,
                    access_count INTEGER DEFAULT 0
                )
            """)

            # Contacts registry (WhatsApp, Email, Telegram, Phone)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    phone TEXT,
                    email TEXT,
                    whatsapp_id TEXT,
                    notes TEXT,
                    updated_at REAL NOT NULL
                )
            """)

            # Conversation Archive for deep continuity
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversation_archive (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    mood TEXT,
                    timestamp REAL NOT NULL
                )
            """)

            # Default profile setup if empty
            cursor.execute("SELECT COUNT(*) as cnt FROM user_profile")
            if cursor.fetchone()["cnt"] == 0:
                defaults = {
                    "user_title": "Sir",
                    "user_name": "Tony",
                    "tone_preference": "refined_british",
                    "verbosity": "crisp",
                    "theme": "dark_gold_stark"
                }
                for k, v in defaults.items():
                    cursor.execute(
                        "INSERT OR REPLACE INTO user_profile (key, value, updated_at) VALUES (?, ?, ?)",
                        (k, v, time.time())
                    )
            conn.commit()

    def set_profile_field(self, key: str, value: str):
        """Saves a permanent user profile attribute."""
        with self._get_connection() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO user_profile (key, value, updated_at) VALUES (?, ?, ?)",
                (key.strip().lower(), str(value).strip(), time.time())
            )
            conn.commit()

    def get_profile_field(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Retrieves a user profile field."""
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT value FROM user_profile WHERE key = ?",
                (key.strip().lower(),)
            ).fetchone()
            return row["value"] if row else default

    def get_all_profile(self) -> Dict[str, str]:
        """Returns the complete user profile."""
        with self._get_connection() as conn:
            rows = conn.execute("SELECT key, value FROM user_profile").fetchall()
            return {r["key"]: r["value"] for r in rows}

    def store_memory(self, content: str, category: str = "fact", importance: int = 1, emotional_tag: str = "neutral"):
        """Stores a new fact or preference permanently."""
        content = content.strip()
        if not content:
            return
        with self._get_connection() as conn:
            # Check duplicate
            existing = conn.execute(
                "SELECT id, importance FROM memories WHERE LOWER(content) = LOWER(?)",
                (content,)
            ).fetchone()
            if existing:
                conn.execute(
                    "UPDATE memories SET access_count = access_count + 1, timestamp = ? WHERE id = ?",
                    (time.time(), existing["id"])
                )
            else:
                conn.execute("""
                    INSERT INTO memories (category, content, importance, emotional_tag, timestamp, access_count)
                    VALUES (?, ?, ?, ?, ?, 1)
                """, (category, content, importance, emotional_tag, time.time()))
            conn.commit()

    def recall_relevant(self, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        """
        Retrieves memories matching keywords in the query, prioritized by importance and recency.
        """
        words = [w.lower() for w in re.findall(r"[a-zA-Z0-9_\-]+", query) if len(w) > 2]
        if not words:
            # Return most important recent memories
            with self._get_connection() as conn:
                rows = conn.execute(
                    "SELECT * FROM memories ORDER BY importance DESC, timestamp DESC LIMIT ?",
                    (limit,)
                ).fetchall()
                return [dict(r) for r in rows]

        with self._get_connection() as conn:
            # Score matches
            conditions = " OR ".join(["LOWER(content) LIKE ?" for _ in words])
            params = [f"%{w}%" for w in words]
            sql = f"""
                SELECT * FROM memories 
                WHERE {conditions}
                ORDER BY importance DESC, timestamp DESC
                LIMIT ?
            """
            params.append(limit)
            rows = conn.execute(sql, params).fetchall()
            
            # If no keyword matches, fallback to top important memories
            if not rows:
                rows = conn.execute(
                    "SELECT * FROM memories ORDER BY importance DESC, timestamp DESC LIMIT ?",
                    (limit,)
                ).fetchall()

            # Increment access counts
            for r in rows:
                conn.execute("UPDATE memories SET access_count = access_count + 1 WHERE id = ?", (r["id"],))
            conn.commit()
            return [dict(r) for r in rows]

    def archive_turn(self, role: str, content: str, mood: Optional[str] = None):
        """Archives a conversation turn forever."""
        with self._get_connection() as conn:
            conn.execute(
                "INSERT INTO conversation_archive (role, content, mood, timestamp) VALUES (?, ?, ?, ?)",
                (role, content.strip(), mood, time.time())
            )
            conn.commit()

    def add_contact(self, name: str, phone: Optional[str] = None, email: Optional[str] = None, notes: Optional[str] = None):
        """Adds or updates a contact for WhatsApp/Gmail automation."""
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO contacts (name, phone, email, whatsapp_id, notes, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (name.strip(), phone, email, phone, notes, time.time()))
            conn.commit()

    def get_contact(self, name: str) -> Optional[Dict[str, Any]]:
        """Finds a contact by name or alias."""
        clean = name.strip().lower()
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM contacts WHERE LOWER(name) LIKE ? LIMIT 1",
                (f"%{clean}%",)
            ).fetchone()
            return dict(row) if row else None

    def list_contacts(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("SELECT * FROM contacts ORDER BY name ASC").fetchall()
            return [dict(r) for r in rows]

    def auto_extract_knowledge(self, user_text: str):
        """
        Extracts personal facts automatically from conversation.
        Examples:
        - "My name is John"
        - "Remember that I love classical music"
        - "I am working on the Mark 50 armor project"
        - "My phone number is 123456789"
        - "My friend Pepper's number is 555-1234"
        """
        text = user_text.strip()
        lower = text.lower()

        # Name extraction
        match_name = re.search(r"\b(?:my name is|call me|i am|i'm)\s+([A-Za-z]+)\b", text, re.IGNORECASE)
        if match_name and not any(w in lower for w in ["tired", "working", "going", "busy", "fine", "ok"]):
            name = match_name.group(1).strip()
            self.set_profile_field("user_name", name)
            self.store_memory(f"User's name is {name}", category="identity", importance=5)

        # Explicit remember commands
        match_remember = re.search(r"\b(?:remember\s+(?:that\s+)?|don't\s+forget\s+(?:that\s+)?)(.+)", text, re.IGNORECASE)
        if match_remember:
            fact = match_remember.group(1).strip()
            self.store_memory(fact, category="user_instruction", importance=4)

        # Preferences extraction ("I prefer X", "I love X", "I hate X")
        match_pref = re.search(r"\b(?:i\s+prefer|i\s+love|i\s+like|i\s+hate|my\s+favorite\s+\w+\s+is)\s+(.+)", text, re.IGNORECASE)
        if match_pref:
            self.store_memory(f"Preference: {text}", category="preference", importance=3)

        # Contact info extraction ("Pepper's number is ...")
        match_contact = re.search(r"\b([A-Za-z]+)(?:'s)?\s+(?:phone|number|whatsapp)\s+is\s+([0-9\+\-\s]+)", text, re.IGNORECASE)
        if match_contact:
            c_name = match_contact.group(1).strip()
            c_phone = match_contact.group(2).strip().replace(" ", "").replace("-", "")
            self.add_contact(c_name, phone=c_phone)
            self.store_memory(f"Contact {c_name} phone is {c_phone}", category="contact", importance=4)

    def build_system_context(self, current_input: str) -> str:
        """
        Constructs context string with user profile and relevant memories
        to inject into LLM system prompts.
        """
        profile = self.get_all_profile()
        user_name = profile.get("user_name", "Sir")
        title = profile.get("user_title", "Sir")

        relevant = self.recall_relevant(current_input, limit=4)
        
        context_parts = [
            f"[User Profile: Name: {user_name}, Title: {title}]"
        ]
        if relevant:
            mem_bullets = [f"- {m['content']}" for m in relevant]
            context_parts.append("[Known Facts & Memories:\n" + "\n".join(mem_bullets) + "]")

        return "\n".join(context_parts)
