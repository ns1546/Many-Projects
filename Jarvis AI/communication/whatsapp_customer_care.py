"""
J.A.R.V.I.S. WhatsApp Customer Care & Autonomous Receptionist Engine
Empowered by Child-Like Continuous Learning:
- Learns any business rule, price list, return policy, or FAQ dynamically from the Boss via natural language.
- Dispatches automated text responses and neural voice notes to WhatsApp customers.
- Attends incoming WhatsApp voice/video calls on behalf of the Boss with professional executive poise.
- Records customer interactions, logs tickets, and escalates urgent inquiries directly to the Boss.
"""

import os
import re
import time
import json
import sqlite3
import urllib.parse
import webbrowser
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any, List, Optional, Tuple

CUSTOMER_CARE_SYNONYMS = {
    "return": [
        "refund", "returns", "refunding", "refunded", "money back", "exchange", "exchanges", "replace", "replacement",
        "receipt", "send back", "reimbursement", "cash back", "policy", "rules", "rule",
        # Bengali & Banglish
        "রিটার্ন", "রিফান্ড", "ফেরত", "টাকা ফেরত", "বদল", "রসিদ", "পলিসি", "নিয়ম", "ferot", "taka ferot", "bodol", "policy"
    ],
    "refund": [
        "return", "returns", "refunding", "refunded", "money back", "exchange", "exchanges", "replace", "replacement",
        "receipt", "send back", "reimbursement", "cash back", "policy",
        # Bengali & Banglish
        "রিটার্ন", "রিফান্ড", "ফেরত", "টাকা ফেরত", "বদল", "ferot", "taka ferot", "bodol"
    ],
    "exchange": ["return", "refund", "replace", "swap", "replacement", "বদল", "bodol"],
    "price": [
        "pricing", "cost", "costs", "rate", "rates", "fee", "fees", "charge", "charges", "how much", "quote", "quotation",
        "price tag", "bill", "expensive", "cheap", "dollar", "dollars", "bucks", "payment", "amount",
        # Bengali & Banglish
        "দাম", "মূল্য", "কত", "টাকা", "রেট", "খরচ", "ফি", "চার্জ", "dam", "mullo", "koto", "taka", "khoroch", "rate"
    ],
    "cost": ["price", "pricing", "rate", "fee", "charge", "how much", "quote", "quotation", "amount", "bill", "dollars", "দাম", "মূল্য", "কত", "টাকা", "খরচ", "dam", "koto", "taka"],
    "fee": ["cost", "price", "rate", "charge", "payment", "ফি", "চার্জ", "fee", "charge"],
    "shipping": [
        "delivery", "deliver", "delivering", "delivered", "shipped", "ship", "courier", "postage", "dispatch", "dispatched",
        "transport", "freight", "arrival", "tracking", "track", "transit", "fee",
        # Bengali & Banglish
        "শিপিং", "ডেলিভারি", "কুরিয়ার", "পৌঁছাবে", "পাঠানো", "চার্জ", "খরচ", "delivery", "khoroch", "charge"
    ],
    "delivery": [
        "shipping", "ship", "shipped", "deliver", "delivering", "delivered", "courier", "postage", "dispatch", "arrival", "tracking", "transit", "fee",
        # Bengali & Banglish
        "ডেলিভারি", "শিপিং", "কুরিয়ার", "পৌঁছাবে", "ডেলিভারি চার্জ", "ডেলিভারি ফি", "চার্জ", "খরচ", "charge", "khoroch"
    ],
    "hours": [
        "timing", "timings", "open", "opening", "close", "closing", "closed", "schedule", "business hours", "working hours", "operating hours",
        "available", "time", "times", "weekend", "weekdays", "sunday", "saturday",
        # Bengali & Banglish
        "সময়", "খোলা", "বন্ধ", "কখন", "কাজের সময়", "দোকান", "অফিস", "shomoy", "khola", "bondho", "kokhon", "dokan", "office", "khule", "থাকে"
    ],
    "timing": ["hours", "open", "opening", "close", "closing", "schedule", "business hours", "working hours", "time", "সময়", "খোলা", "কখন", "shomoy", "khola", "kokhon"],
    "open": ["hours", "timing", "close", "operating hours", "business hours", "schedule", "available", "খোলা", "খুলে", "থাকে", "khola", "khule"],
    "close": ["hours", "timing", "open", "operating hours", "closing time", "বন্ধ", "bondho"],
    "discount": [
        "discounts", "coupon", "coupons", "promo", "promo code", "voucher", "vouchers", "deal", "deals", "offer", "offers", "sale",
        "discount code", "cheap", "less", "percentage off", "percent",
        # Bengali & Banglish
        "ডিসকাউন্ট", "অফার", "ছাড়", "কুপন", "কম", "discount", "offer", "char", "coupon", "kom"
    ],
    "coupon": ["discount", "voucher", "promo", "code", "deal", "offer", "কুপন", "coupon"],
    "deal": ["discount", "offer", "promo", "deal", "sale", "অফার", "offer"],
    "warranty": [
        "guarantee", "warranties", "repair", "repairs", "replacement", "service period", "defect", "broken", "fix", "damage",
        # Bengali & Banglish
        "ওয়ারেন্টি", "গ্যারান্টি", "মেরামত", "নষ্ট", "সার্ভিস", "warranty", "guarantee", "meramot"
    ],
    "location": [
        "address", "office", "store", "shop", "branch", "headquarters", "where are you", "direction", "directions", "visit", "city",
        # Bengali & Banglish
        "ঠিকানা", "অফিস", "দোকান", "কোথায়", "লোকেশন", "শাখা", "thikana", "kothay"
    ],
    "address": ["location", "office", "store", "shop", "where", "directions", "ঠিকানা", "thikana"],
    "contact": ["phone", "email", "call", "reach", "telephone", "mobile", "hotline", "support", "helpdesk", "যোগাযোগ", "ফোন", "নম্বর", "jogajog", "phone", "number"],
    "suit": ["armor", "mark", "iron man", "product", "equipment", "costume", "item", "স্যুট", "বর্ম", "পোশাক", "suit", "bormo"],
    "boss": ["tony", "tony stark", "owner", "founder", "manager", "ceo", "executive", "in charge", "human", "real person", "person", "টনি স্টার্ক", "মালিক", "বস", "malik", "boss"],
    "complaint": ["angry", "upset", "bad", "terrible", "issue", "problem", "faulty", "sue", "lawyer", "unacceptable", "scam", "অভিযোগ", "সমস্যা", "ovijog", "somossa"]
}

# Bidirectional Semantic Graph Expansion
EXPANDED_SYNONYMS: Dict[str, set] = {}
for canonical_term, syn_list in CUSTOMER_CARE_SYNONYMS.items():
    EXPANDED_SYNONYMS.setdefault(canonical_term.lower(), set()).update([s.lower() for s in syn_list])
    for s in syn_list:
        sl = s.lower()
        EXPANDED_SYNONYMS.setdefault(sl, set()).add(canonical_term.lower())
        EXPANDED_SYNONYMS[sl].update([other.lower() for other in syn_list if other.lower() != sl])

CUSTOMER_CARE_STOP_WORDS = {
    "the", "and", "our", "tell", "them", "that", "this", "when", "customer", "asks", "about",
    "say", "reply", "learn", "jarvis", "please", "with", "from", "for", "are", "is", "we", "you",
    "they", "will", "can", "if", "to", "in", "on", "at", "by", "of", "an", "a", "it", "as", "or",
    "so", "be", "do", "my", "me", "he", "she", "his", "her", "their", "have", "has", "had", "was",
    "were", "am", "pm", "just", "also", "into", "than", "then", "now", "any", "some", "what", "how",
    "why", "who", "where", "which", "there", "their", "need", "want", "like", "get", "give", "guys",
    "directly", "discuss", "stark",
    # Bengali Stop Words
    "কি", "কী", "হলো", "হবে", "আছে", "না", "এবং", "বা", "জন্য", "দয়া", "করে", "থেকে", "তে", "র", "এর",
    "যে", "এই", "ও", "ki", "ba", "hobe", "er", "ar", "kore", "te"
}

def is_bengali_inquiry(text: str) -> bool:
    """Detects if an incoming customer inquiry is in Bengali (Bangla script or phonetic Banglish)."""
    if not text:
        return False
    # 1. Unicode Bengali script range
    if re.search(r"[\u0980-\u09FF]", text):
        return True
    # 2. Phonetic Banglish markers
    lower = text.lower()
    banglish_markers = [
        "koto", "kivabe", "apnader", "dokan", "dam", "taka", "ache", "chai",
        "shathe", "kotha", "khule", "kokhon", "ferot", "khoroch", "deben",
        "lagbe", "bhai", "amake", "amader", "thikana", "kothay", "bondho",
        "parbo", "hobe", "pabo", "janiye", "din", "somoy", "shomoy"
    ]
    return any(re.search(rf"\b{re.escape(m)}\b", lower) for m in banglish_markers)

def formulate_bengali_reply(topic: str, fact: str, customer_name: str, business_name: str = "স্টার্ক ইন্ডাস্ট্রিজ") -> str:
    """Formulates a natural, polite customer care response in Bengali."""
    c_name = customer_name or "সম্মানিত গ্রাহক"
    t = topic.lower()
    if "refund" in t or "return" in t:
        return (
            f"হ্যালো {c_name}, {business_name}-এ যোগাযোগ করার জন্য ধন্যবাদ। "
            f"আমাদের রিটার্ন পলিসি সংক্রান্ত নিয়মাবলী: {fact}। "
            f"আপনার অন্য কোনো সহায়তা প্রয়োজন হলে দয়া করে জানাবেন!"
        )
    elif "shipping" in t or "delivery" in t:
        return (
            f"হ্যালো {c_name}, {business_name}-এ স্বাগতম। "
            f"আমাদের ডেলিভারি সংক্রান্ত তথ্য: {fact}। "
            f"যেকোনো প্রয়োজনে আমরা পাশে আছি!"
        )
    elif "hour" in t or "timing" in t or "open" in t:
        return (
            f"হ্যালো {c_name}, আমাদের ব্যবসায়িক সময়সূচী: {fact}। "
            f"{business_name}-এর সাথে থাকার জন্য ধন্যবাদ!"
        )
    elif "price" in t or "cost" in t or "rate" in t:
        return (
            f"হ্যালো {c_name}, আমাদের মূল্য তালিকা ও খরচ: {fact}। "
            f"অর্ডার করতে বা বিস্তারিত জানতে দয়া করে আমাদের জানাবেন!"
        )
    elif "discount" in t or "promo" in t:
        return (
            f"হ্যালো {c_name}, আমাদের বিশেষ অফার: {fact}। "
            f"আপনার কেনাকাটা শুভ হোক!"
        )
    elif "warranty" in t:
        return (
            f"হ্যালো {c_name}, আমাদের ওয়ারেন্টি নীতি: {fact}। "
            f"আমাদের পণ্যে সম্পূর্ণ মান ও নিরাপত্তা বজায় রাখা হয়।"
        )
    else:
        return (
            f"হ্যালো {c_name}, {business_name}-এ যোগাযোগ করার জন্য ধন্যবাদ। "
            f"তথ্য: {fact}। "
            f"দয়া করে জানান আর কীভাবে আপনাকে সাহায্য করতে পারি!"
        )

def formulate_bengali_escalation(customer_name: str, query: str, business_name: str = "স্টার্ক ইন্ডাস্ট্রিজ") -> str:
    c_name = customer_name or "সম্মানিত গ্রাহক"
    return (
        f"হ্যালো {c_name}, {business_name}-এ যোগাযোগ করার জন্য ধন্যবাদ। "
        f"আমি আপনার অনুরোধটি ('{query[:60]}') নথিভুক্ত করেছি এবং মিঃ স্টার্কের ব্যক্তিগত পর্যালোচনার জন্য পাঠিয়েছি। "
        f"আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন!"
    )


class ChildLearningEngine:
    """
    Continuous Epistemic Learning Subsystem.
    Learns rules, policies, and behavior from natural instructions just like a human child,
    persisting them in long-term memory, generalizing concepts via semantic synonym lattices,
    reinforcing confidence on praise, and adapting when corrected.
    """

    def __init__(self, db_path: Optional[str] = None):
        if db_path:
            self.db_path = db_path
        else:
            data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
            os.makedirs(data_dir, exist_ok=True)
            self.db_path = os.path.join(data_dir, "jarvis_omni_memory.db")
        self._init_tables()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        """Initializes tables for customer care knowledge and interaction history."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Dynamic customer service knowledge base
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_care_knowledge (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT NOT NULL UNIQUE,
                    trigger_keywords TEXT NOT NULL, -- JSON array of strings
                    learned_instruction TEXT NOT NULL,
                    response_content TEXT NOT NULL,
                    action_type TEXT DEFAULT 'reply_text', -- 'reply_text', 'reply_voice', 'escalate'
                    confidence REAL DEFAULT 1.0,
                    reinforcements INTEGER DEFAULT 1,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL,
                    last_used REAL DEFAULT 0
                )
            """)

            # Customer interaction ticket logs
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_interactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_phone TEXT NOT NULL,
                    customer_name TEXT,
                    channel TEXT NOT NULL, -- 'whatsapp_text', 'whatsapp_voice_note', 'whatsapp_call'
                    query_text TEXT NOT NULL,
                    response_text TEXT NOT NULL,
                    status TEXT NOT NULL, -- 'resolved', 'escalated_to_boss', 'message_taken'
                    matched_topic TEXT,
                    created_at REAL NOT NULL
                )
            """)
            conn.commit()
        self._seed_baseline_knowledge()

    def _seed_baseline_knowledge(self):
        """Pre-seeds standard customer care policies in English & Bengali if knowledge base is empty."""
        try:
            with self._get_connection() as conn:
                cnt = conn.execute("SELECT COUNT(*) as c FROM customer_care_knowledge").fetchone()["c"]
                if cnt == 0:
                    defaults = [
                        (
                            "refund_and_return_policy",
                            ["return", "refund", "exchange", "money back", "receipt", "রিটার্ন", "ফেরত", "রিফান্ড", "বদল", "ferot", "bodol", "পলিসি", "rules", "policy"],
                            "Our return policy allows returns within 14 days with original receipt for a full refund or exchange.",
                            "আমাদের রিটার্ন পলিসি অনুযায়ী ক্রয়ের ১৪ দিনের মধ্যে আসল রসিদসহ পণ্য ফেরত বা পরিবর্তন করা যাবে।",
                        ),
                        (
                            "shipping_and_delivery",
                            ["shipping", "delivery", "courier", "dispatch", "charge", "fee", "ডেলিভারি", "শিপিং", "কুরিয়ার", "চার্জ", "পৌঁছাবে", "khoroch", "postage", "ডেলিভারি চার্জ"],
                            "Delivery fee is $15 within 2-3 business days. Free delivery on orders over $100.",
                            "আমাদের স্ট্যান্ডার্ড ডেলিভারি চার্জ ৬০ থেকে ১২০ টাকা এবং ২-৩ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।",
                        ),
                        (
                            "operating_hours",
                            ["hours", "timing", "open", "close", "schedule", "working hours", "খোলা", "বন্ধ", "কখন", "সময়", "দোকান", "অফিস", "khola", "kokhon", "shomoy", "থাকে"],
                            "We are open Monday to Saturday from 9:00 AM to 8:00 PM. Closed on Sundays.",
                            "আমাদের শোরুম ও কাস্টমার কেয়ার সোম থেকে শনিবার সকাল ৯:০০ টা থেকে রাত ৮:০০ টা পর্যন্ত খোলা থাকে।",
                        ),
                        (
                            "discounts_and_promotions",
                            ["discount", "coupon", "promo", "voucher", "deal", "offer", "ছাড়", "ডিসকাউন্ট", "অফার", "কুপন", "char", "kom"],
                            "We offer 10% discount for all new customers with promo code WELCOME10.",
                            "আমাদের নতুন গ্রাহকদের জন্য বিশেষ ১০% ছাড় এবং আকর্ষণীয় অফার চালু রয়েছে।",
                        ),
                        (
                            "warranty_and_support",
                            ["warranty", "guarantee", "repair", "service", "ওয়ারেন্টি", "গ্যারান্টি", "মেরামত", "সার্ভিস"],
                            "All items carry a 1-year official manufacturer replacement warranty.",
                            "আমাদের প্রতিটি পণ্যে ১ বছরের অফিশিয়াল ওয়ারেন্টি ও ফ্রি সার্ভিসিং সুবিধা দেওয়া হয়।",
                        ),
                        (
                            "store_location",
                            ["location", "address", "office", "store", "where are you", "ঠিকানা", "দোকান", "কোথায়", "thikana", "kothay"],
                            "Our executive headquarters is located at Stark Tower, New York, with regional distribution center in Dhaka.",
                            "আমাদের প্রধান কার্যালয় স্টার্ক টাওয়ার এবং আঞ্চলিক শোরুম ঢাকায় অবস্থিত।",
                        )
                    ]
                    now = time.time()
                    for top, trigs, eng_resp, bng_resp in defaults:
                        combined_fact = f"{eng_resp} {bng_resp}"
                        conn.execute("""
                            INSERT INTO customer_care_knowledge
                            (topic, trigger_keywords, learned_instruction, response_content, action_type, confidence, reinforcements, created_at, updated_at, last_used)
                            VALUES (?, ?, ?, ?, 'reply_text', 2.0, 1, ?, ?, 0)
                        """, (top, json.dumps(trigs), combined_fact, combined_fact, now, now))
                    conn.commit()
        except Exception:
            pass

    def learn(self, instruction: str, topic: Optional[str] = None) -> Dict[str, Any]:
        """
        Learns a new policy, price, FAQ, or action from natural language input.
        Extracts key triggers, expands them with semantic synonyms like a child,
        and stores the policy persistently.
        """
        raw = instruction.strip()
        if not raw:
            return {"success": False, "message": "No instruction provided to learn."}

        # Determine topic and triggers
        lower = raw.lower()
        extracted_topic = topic
        triggers = []

        # 1. Topic discovery heuristics (English, Bengali & Banglish)
        if not extracted_topic:
            if any(w in lower for w in ["return", "refund", "exchange", "money back", "রিটার্ন", "ফেরত", "রিফান্ড", "ferot", "bodol"]):
                extracted_topic = "refund_and_return_policy"
            elif any(w in lower for w in ["shipping", "delivery", "shipping fee", "courier", "postage", "ডেলিভারি", "শিপিং", "পৌঁছাবে", "khoroch"]):
                extracted_topic = "shipping_and_delivery"
            elif any(w in lower for w in ["price", "pricing", "cost", "how much", "rate", "$", "দাম", "কত", "টাকা", "dam", "koto", "taka"]):
                extracted_topic = "pricing_and_rates"
            elif any(w in lower for w in ["hour", "timing", "open", "close", "schedule", "working hours", "খোলা", "বন্ধ", "কখন", "সময়", "khola", "kokhon", "shomoy", "থাকে"]):
                extracted_topic = "operating_hours"
            elif any(w in lower for w in ["discount", "coupon", "promo", "voucher", "deal", "offer", "vip", "%", "ডিসকাউন্ট", "ছাড়", "অফার", "char", "kom"]):
                extracted_topic = "discounts_and_promotions"
            elif any(w in lower for w in ["warranty", "guarantee", "repair", "ওয়ারেন্টি", "গ্যারান্টি", "মেরামত"]):
                extracted_topic = "warranty_and_support"
            elif any(w in lower for w in ["location", "address", "office", "store", "where are you", "ঠিকানা", "দোকান", "কোথায়", "thikana", "kothay"]):
                extracted_topic = "store_location"
            elif any(w in lower for w in ["contact", "support", "email", "phone", "reach", "যোগাযোগ", "ফোন", "নম্বর", "jogajog"]):
                extracted_topic = "customer_contact"
            else:
                words = [w for w in re.findall(r"[a-zA-Z0-9\u0980-\u09FF]+", lower) if len(w) >= 3 and w not in CUSTOMER_CARE_STOP_WORDS]
                extracted_topic = "_".join(words[:3]) if words else f"rule_{int(time.time()) % 10000}"

        # 2. Extract trigger keywords, numbers, currencies (Unicode Bengali + English)
        cleaned_words = [
            w for w in re.findall(r"[a-zA-Z0-9\u0980-\u09FF]+", lower)
            if (len(w) >= 2 or w.isdigit()) and w not in CUSTOMER_CARE_STOP_WORDS
        ]
        
        # Add basic tokens
        triggers.extend(cleaned_words)
        
        # Add topic component words
        for t_part in extracted_topic.split("_"):
            if len(t_part) >= 3 and t_part not in CUSTOMER_CARE_STOP_WORDS:
                triggers.append(t_part)

        # 3. Semantic child-like synonym expansion via bidirectional graph
        for w in list(triggers):
            if w in EXPANDED_SYNONYMS:
                triggers.extend([s for s in EXPANDED_SYNONYMS[w] if s not in CUSTOMER_CARE_STOP_WORDS])
            if w.endswith("s") and len(w) > 3 and w[:-1] in EXPANDED_SYNONYMS:
                triggers.extend([s for s in EXPANDED_SYNONYMS[w[:-1]] if s not in CUSTOMER_CARE_STOP_WORDS])

        triggers = list(set(triggers))


        # 4. Formulate response content
        # Strip prefixes like "if customer asks about X, tell them Y" or "learn: Y"
        response_content = raw
        patterns = [
            r"^(?:jarvis\s*,?\s*)?(?:learn\s+(?:this\s+)?(?:for\s+customer\s+care\s*)?[:\s]+)(.+)",
            r"^(?:if\s+customer\s+(?:asks|inquiries)\s+(?:about\s+)?(?:[^,]+),\s*(?:tell|say|reply\s+to)\s+them\s+(?:that\s+)?)(.+)",
            r"^(?:when\s+someone\s+asks\s+(?:about\s+)?(?:[^,]+),\s*(?:tell|say|reply\s+to)\s+them\s+(?:that\s+)?)(.+)",
            r"^(?:remember\s+(?:that\s+)?[:\s]*)(.+)"
        ]
        for pat in patterns:
            m = re.search(pat, raw, re.IGNORECASE)
            if m:
                response_content = m.group(1).strip()
                break

        # Save or update in database
        now = time.time()
        with self._get_connection() as conn:
            # Check existing topic
            existing = conn.execute(
                "SELECT id, trigger_keywords, confidence, reinforcements FROM customer_care_knowledge WHERE topic = ?",
                (extracted_topic,)
            ).fetchone()

            if existing:
                # Merge triggers
                try:
                    old_triggers = json.loads(existing["trigger_keywords"])
                except Exception:
                    old_triggers = []
                merged_triggers = list(set(old_triggers + triggers))
                new_conf = min(5.0, existing["confidence"] + 0.5)
                new_reinforcements = existing["reinforcements"] + 1

                conn.execute("""
                    UPDATE customer_care_knowledge
                    SET trigger_keywords = ?, learned_instruction = ?, response_content = ?,
                        confidence = ?, reinforcements = ?, updated_at = ?
                    WHERE id = ?
                """, (
                    json.dumps(merged_triggers), raw, response_content,
                    new_conf, new_reinforcements, now, existing["id"]
                ))
            else:
                conn.execute("""
                    INSERT INTO customer_care_knowledge
                    (topic, trigger_keywords, learned_instruction, response_content, action_type, confidence, reinforcements, created_at, updated_at, last_used)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                """, (
                    extracted_topic, json.dumps(triggers), raw, response_content,
                    "reply_text", 1.0, 1, now, now
                ))
            conn.commit()

        return {
            "success": True,
            "topic": extracted_topic,
            "triggers": triggers,
            "response": response_content,
            "message": f"Understood and internalized, sir. I have committed the policy for '{extracted_topic}' to memory."
        }

    def correct(self, topic_or_keyword: str, new_instruction: str) -> Dict[str, Any]:
        """
        Corrects an existing learned rule when the Boss provides updated instructions.
        """
        match = self.find_knowledge(topic_or_keyword)
        if match:
            return self.learn(new_instruction, topic=match["topic"])
        else:
            return self.learn(new_instruction)

    def reinforce(self, topic: str, positive: bool = True) -> float:
        """Increases or decreases confidence in a learned policy based on user feedback."""
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT id, confidence, reinforcements FROM customer_care_knowledge WHERE topic = ?",
                (topic,)
            ).fetchone()
            if not row:
                return 1.0
            
            delta = 0.5 if positive else -0.5
            new_conf = max(0.1, min(5.0, row["confidence"] + delta))
            conn.execute(
                "UPDATE customer_care_knowledge SET confidence = ?, reinforcements = reinforcements + 1, updated_at = ? WHERE id = ?",
                (new_conf, time.time(), row["id"])
            )
            conn.commit()
            return new_conf

    def find_knowledge(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Finds the most relevant learned knowledge item for an incoming customer inquiry.
        Scores items using keyword overlap, synonym expansion, and reinforcement confidence.
        Supports both English and Bengali (Bangla script + Banglish).
        """
        words = [
            w.lower() for w in re.findall(r"[a-zA-Z0-9\u0980-\u09FF]+", query)
            if (len(w) >= 2 or w.isdigit()) and w.lower() not in CUSTOMER_CARE_STOP_WORDS
        ]
        if not words:
            return None

        # Build expanded search set with query synonyms (bidirectional)
        search_terms = set(words)
        for w in words:
            if w in EXPANDED_SYNONYMS:
                search_terms.update([s for s in EXPANDED_SYNONYMS[w] if s not in CUSTOMER_CARE_STOP_WORDS])
            if w.endswith("s") and len(w) > 3 and w[:-1] in EXPANDED_SYNONYMS:
                search_terms.update([s for s in EXPANDED_SYNONYMS[w[:-1]] if s not in CUSTOMER_CARE_STOP_WORDS])

        with self._get_connection() as conn:
            rows = conn.execute("SELECT * FROM customer_care_knowledge").fetchall()
            if not rows:
                return None

            best_item = None
            best_score = 0.0

            for r in rows:
                item = dict(r)
                score = 0.0
                
                # Check topic match against search terms
                topic_words = [tw for tw in item["topic"].lower().split("_") if tw not in CUSTOMER_CARE_STOP_WORDS]
                for st in search_terms:
                    if st in topic_words:
                        score += 4.0
                    elif len(st) >= 4 and st in item["topic"].lower():
                        score += 2.0

                # Check trigger keywords match
                try:
                    triggers = [t.lower() for t in json.loads(item["trigger_keywords"]) if t not in CUSTOMER_CARE_STOP_WORDS]
                except Exception:
                    triggers = []

                # Exact match against triggers
                for st in search_terms:
                    if st in triggers:
                        score += 3.0
                
                # Substring stem match
                for w in words:
                    for tr in triggers:
                        if len(w) >= 3 and len(tr) >= 3:
                            if w == tr:
                                score += 2.0
                            elif w in tr or tr in w:
                                score += 1.2

                # Weight by learned confidence score
                final_score = score * (item.get("confidence", 1.0) ** 0.5)

                if final_score > best_score:
                    best_score = final_score
                    best_item = item

            # Threshold for relevance
            if best_item and best_score >= 2.5:
                conn.execute(
                    "UPDATE customer_care_knowledge SET last_used = ? WHERE id = ?",
                    (time.time(), best_item["id"])
                )
                conn.commit()
                best_item["match_score"] = round(best_score, 2)
                return best_item

        return None

    def list_knowledge(self) -> List[Dict[str, Any]]:
        """Returns all currently learned customer care knowledge items."""
        with self._get_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM customer_care_knowledge ORDER BY updated_at DESC"

            ).fetchall()
            results = []
            for r in rows:
                d = dict(r)
                try:
                    d["triggers"] = json.loads(d["trigger_keywords"])
                except Exception:
                    d["triggers"] = []
                results.append(d)
            return results

    def clear_knowledge(self, topic: Optional[str] = None) -> bool:
        """Deletes a specific topic or clears all learned knowledge."""
        with self._get_connection() as conn:
            if topic:
                conn.execute("DELETE FROM customer_care_knowledge WHERE topic = ?", (topic,))
            else:
                conn.execute("DELETE FROM customer_care_knowledge")
            conn.commit()
            return True


class WhatsAppCustomerCareService:
    """
    Autonomous WhatsApp Customer Care & Call Receptionist Service.
    Acts on behalf of the Boss to provide 24/7 text responses, vocal voice notes,
    and phone call attendance using learned knowledge.
    """

    def __init__(
        self,
        memory: Optional[Any] = None,
        tts_engine: Optional[Any] = None,
        gui_agent: Optional[Any] = None,
        task_manager: Optional[Any] = None,
        openrouter_brain: Optional[Any] = None,
        local_brain: Optional[Any] = None,
        business_name: str = "Stark Industries"
    ):
        self.memory = memory
        self.tts = tts_engine
        self.gui = gui_agent
        self.task_manager = task_manager
        self.openrouter_brain = openrouter_brain
        self.local_brain = local_brain
        self.business_name = business_name
        
        # Child-like dynamic learning engine
        self.learning_engine = ChildLearningEngine()

        # Service operational modes
        self.receptionist_mode_enabled = False  # Boss toggles to attend calls
        self.auto_reply_enabled = True          # Auto-replies to incoming text
        self.voice_replies_enabled = True       # Synthesizes voice note MP3s

    # =========================================================================
    # 1. TEACHING & KNOWLEDGE ACQUISITION INTERFACE
    # =========================================================================
    def teach_rule(self, instruction: str, topic: Optional[str] = None) -> Dict[str, Any]:
        """Direct teaching API for the Boss to train J.A.R.V.I.S."""
        return self.learning_engine.learn(instruction, topic=topic)

    def correct_rule(self, topic: str, new_instruction: str) -> Dict[str, Any]:
        """Correction API when the Boss wants to alter a previously taught rule."""
        return self.learning_engine.correct(topic, new_instruction)

    def get_knowledge_summary(self) -> Dict[str, Any]:
        """Provides an inventory of all currently retained customer care policies."""
        items = self.learning_engine.list_knowledge()
        return {
            "total_rules": len(items),
            "topics": [i["topic"] for i in items],
            "items": items
        }

    # =========================================================================
    # 2. INCOMING TEXT PROCESSING & AUTO-REPLY
    # =========================================================================
    def process_incoming_text(
        self,
        customer_phone: str,
        customer_name: Optional[str] = None,
        message_text: str = "",
        prefer_voice: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Processes an incoming customer message, reasons over learned knowledge,
        and constructs an authoritative customer care response.
        """
        c_name = customer_name or "Valued Customer"
        c_phone = customer_phone.strip()
        msg = message_text.strip()
        
        if not msg:
            return {"success": False, "message": "Empty incoming message."}

        # 1. Detect language (Bengali vs English)
        is_bengali = is_bengali_inquiry(msg)

        # 2. Search Child Learning Engine for matching policies
        matched = self.learning_engine.find_knowledge(msg)
        
        escalated = False
        voice_file = None
        
        if matched:
            knowledge_fact = matched["response_content"]
            topic = matched["topic"]
            
            if is_bengali:
                reply_text = formulate_bengali_reply(topic, knowledge_fact, c_name, self.business_name)
            else:
                reply_text = (
                    f"Hello {c_name}, thank you for contacting {self.business_name}. "
                    f"{knowledge_fact} "
                    f"Please let us know if you need any additional assistance!"
                )
            status = "resolved"
        else:
            topic = "unresolved_inquiry"
            if is_bengali:
                reply_text = formulate_bengali_escalation(c_name, msg, self.business_name)
            else:
                reply_text = (
                    f"Hello {c_name}, thank you for reaching out to {self.business_name}. "
                    f"I have logged your request regarding '{msg[:80]}' and flagged it for personal executive review by Mr. Stark. "
                    f"Our team will follow up with you shortly!"
                )
            status = "escalated_to_boss"
            escalated = True
            
            # Automatically create high-priority task for the Boss
            if self.task_manager:
                self.task_manager.add_task(
                    f"URGENT WhatsApp customer inquiry from {c_name} ({c_phone}): '{msg}'"
                )

        # 3. Synthesize Voice Note if requested or enabled (Language-aware: bn-BD-PradeepNeural for Bengali)
        should_voice = prefer_voice if prefer_voice is not None else self.voice_replies_enabled
        if should_voice and self.tts and hasattr(self.tts, "generate_speech_file"):
            try:
                voice_file = self.tts.generate_speech_file(reply_text)
            except Exception as e:
                voice_file = None

        # 4. Log interaction ticket in database
        ticket_id = self._log_interaction(
            c_phone, c_name, "whatsapp_text", msg, reply_text, status, topic
        )

        # 5. Generate WhatsApp Dispatch URL
        clean_phone = re.sub(r"[^0-9]", "", c_phone)
        encoded_msg = urllib.parse.quote(reply_text)
        dispatch_url = f"https://web.whatsapp.com/send?phone={clean_phone}&text={encoded_msg}" if clean_phone else "https://web.whatsapp.com/"

        return {
            "success": True,
            "ticket_id": ticket_id,
            "customer_phone": c_phone,
            "customer_name": c_name,
            "query": msg,
            "language": "bengali" if is_bengali else "english",
            "reply_text": reply_text,
            "voice_file": voice_file,
            "matched_topic": topic,
            "status": status,
            "escalated_to_boss": escalated,
            "dispatch_url": dispatch_url
        }

    # =========================================================================
    # 3. AUTONOMOUS CALL ATTENDANCE ("ATTEND CALL ON BEHALF OF ME")
    # =========================================================================
    def attend_call(
        self,
        caller_phone: str,
        caller_name: Optional[str] = None,
        caller_speech: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Attends an incoming WhatsApp voice/video call on behalf of the Boss.
        Greets the caller, answers inquiries using learned knowledge in English or Bengali,
        takes detailed messages, and alerts the Boss.
        """
        c_name = caller_name or "Caller"
        c_phone = caller_phone.strip()
        speech_input = (caller_speech or "").strip()
        is_bengali = is_bengali_inquiry(speech_input)

        # Language-aware receptionist greeting
        if is_bengali:
            initial_greeting = (
                f"শুভ দিন, {c_name}। আপনি {self.business_name}-এর নির্বাহী কার্যালয়ে যোগাযোগ করেছেন। "
                f"আমি জারভিস, মিঃ স্টার্কের পক্ষ থেকে আপনার কলটি গ্রহণ করছি। কীভাবে সহায়তা করতে পারি?"
            )
        else:
            initial_greeting = (
                f"Good day, {c_name}. You have reached the executive office of {self.business_name}. "
                f"I am J.A.R.V.I.S., taking calls on behalf of Mr. Stark. How may I be of assistance today?"
            )

        call_reply = ""
        action_outcome = "call_attended"
        escalated = False
        matched_topic = "general_call"

        if speech_input:
            # If caller asks for Tony/Boss directly or reports an emergency, prioritize taking an urgent message
            is_boss_request = any(w in speech_input.lower() for w in ["emergency", "tony", "boss", "urgent", "talk to tony", "speak to tony", "টনি", "জরুরি", "জরুরী"])
            matched = None if is_boss_request else self.learning_engine.find_knowledge(speech_input)
            if matched:
                matched_topic = matched["topic"]
                if is_bengali:
                    call_reply = (
                        f"অবশ্যই, {c_name}। আপনার প্রশ্ন প্রসঙ্গে: {matched['response_content']} "
                        f"মিঃ স্টার্কের পক্ষ থেকে আপনাকে আর কি কোনো সহায়তা করতে পারি?"
                    )
                else:
                    call_reply = (
                        f"Certainly, {c_name}. Regarding your question: {matched['response_content']} "
                        f"Is there anything else I may assist you with on Mr. Stark's behalf?"
                    )
                action_outcome = "inquiry_resolved_on_call"
            else:
                matched_topic = "message_taken"
                if is_bengali:
                    call_reply = (
                        f"আমি বুঝতে পেরেছি, {c_name}। আমি মিঃ স্টার্কের জন্য আপনার বার্তাটি নথিভুক্ত করেছি: '{speech_input[:100]}'। "
                        f"তিনি অতিশীঘ্রই আপনার সাথে যোগাযোগ করবেন। ধন্যবাদ।"
                    )
                else:
                    call_reply = (
                        f"I understand, {c_name}. I have officially logged your message regarding '{speech_input[:100]}'. "
                        f"I will brief Mr. Stark immediately so he can follow up with you. Thank you for contacting us."
                    )
                action_outcome = "message_taken_for_boss"
                escalated = True
                
                # Add callback task for the Boss
                if self.task_manager:
                    self.task_manager.add_task(
                        f"CALLBACK REQUIRED: Attended WhatsApp call from {c_name} ({c_phone}). Message: '{speech_input}'"
                    )
        else:
            call_reply = (
                f"আমি শুনছি, {c_name}। মিঃ স্টার্কের জন্য আপনার বার্তাটি বলুন।" if is_bengali else
                f"I am listening, {c_name}. Please state the nature of your inquiry or message for Mr. Stark."
            )


        # Synthesize audio response for the live call
        voice_file = None
        if self.tts and hasattr(self.tts, "generate_speech_file"):
            try:
                voice_file = self.tts.generate_speech_file(call_reply)
            except Exception:
                voice_file = None

        # Log call ticket
        ticket_id = self._log_interaction(
            c_phone, c_name, "whatsapp_call", speech_input or "Incoming voice call", call_reply, action_outcome, matched_topic
        )

        return {
            "success": True,
            "ticket_id": ticket_id,
            "caller_phone": c_phone,
            "caller_name": c_name,
            "greeting": initial_greeting,
            "caller_speech": speech_input,
            "reply_speech": call_reply,
            "voice_file": voice_file,
            "outcome": action_outcome,
            "matched_topic": matched_topic,
            "escalated_to_boss": escalated
        }

    # =========================================================================
    # 4. RECEPTIONIST MODE TOGGLE & ANALYTICS
    # =========================================================================
    def set_receptionist_mode(self, enabled: bool) -> str:
        """Enables or disables autonomous call reception mode."""
        self.receptionist_mode_enabled = enabled
        status_str = "ENABLED" if enabled else "DISABLED"
        return f"Autonomous WhatsApp Call Receptionist is now {status_str}, sir."

    def set_auto_reply_mode(self, enabled: bool) -> str:
        """Enables or disables automatic customer care text replies."""
        self.auto_reply_enabled = enabled
        status_str = "ENABLED" if enabled else "DISABLED"
        return f"Automatic WhatsApp Customer Care auto-replies are now {status_str}, sir."

    def get_service_dashboard(self) -> Dict[str, Any]:
        """Aggregates real-time service metrics from database."""
        with self._get_connection() as conn:
            total_interactions = conn.execute("SELECT COUNT(*) as cnt FROM customer_interactions").fetchone()["cnt"]
            resolved_count = conn.execute("SELECT COUNT(*) as cnt FROM customer_interactions WHERE status = 'resolved'").fetchone()["cnt"]
            escalated_count = conn.execute("SELECT COUNT(*) as cnt FROM customer_interactions WHERE status LIKE '%boss%'").fetchone()["cnt"]
            calls_count = conn.execute("SELECT COUNT(*) as cnt FROM customer_interactions WHERE channel = 'whatsapp_call'").fetchone()["cnt"]
            
            recent_rows = conn.execute("SELECT * FROM customer_interactions ORDER BY created_at DESC LIMIT 5").fetchall()
            recent_tickets = [dict(r) for r in recent_rows]

        learned_rules = self.learning_engine.list_knowledge()
        return {
            "receptionist_mode": self.receptionist_mode_enabled,
            "auto_reply_mode": self.auto_reply_enabled,
            "total_interactions": total_interactions,
            "resolved_tickets": resolved_count,
            "escalated_tickets": escalated_count,
            "calls_attended": calls_count,
            "learned_rules_count": len(learned_rules),
            "learned_topics": [r["topic"] for r in learned_rules],
            "recent_tickets": recent_tickets
        }

    def _log_interaction(
        self,
        phone: str,
        name: str,
        channel: str,
        query: str,
        response: str,
        status: str,
        topic: str
    ) -> int:
        """Records customer interaction in persistent database."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO customer_interactions
                (customer_phone, customer_name, channel, query_text, response_text, status, matched_topic, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (phone, name, channel, query, response, status, topic, time.time()))
            conn.commit()
            return cursor.lastrowid or 0

    def _get_connection(self) -> sqlite3.Connection:
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
        db_path = os.path.join(data_dir, "jarvis_omni_memory.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn

    # =========================================================================
    # 5. BACKGROUND DAEMON CONTROLS (OPERATES EVEN IF WHATSAPP IS CLOSED)
    # =========================================================================
    def start_background_daemon(self, host: str = "127.0.0.1", port: int = 5055) -> Dict[str, Any]:
        """
        Activates the persistent background webhook server.
        Processes customer inquiries 24/7 in English & Bengali even if WhatsApp or the browser is closed.
        """
        if not hasattr(self, "daemon") or self.daemon is None:
            self.daemon = WhatsAppBackgroundDaemon(self, host=host, port=port)
        return self.daemon.start()

    def stop_background_daemon(self) -> Dict[str, Any]:
        """Deactivates the persistent background daemon."""
        if hasattr(self, "daemon") and self.daemon:
            return self.daemon.stop()
        return {"success": True, "message": "Background daemon was not running."}

    def get_daemon_status(self) -> Dict[str, Any]:
        """Returns background service status and endpoints."""
        if hasattr(self, "daemon") and self.daemon:
            return self.daemon.get_status()
        return {
            "is_running": False,
            "host": "127.0.0.1",
            "port": 5055,
            "webhook_endpoint": "http://127.0.0.1:5055/webhook/whatsapp"
        }


class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


class WhatsAppWebhookHandler(BaseHTTPRequestHandler):
    """
    HTTP Webhook Handler for WhatsApp Cloud API & Automated Gateway.
    Receives incoming customer messages, dispatches them through the
    Child Learning customer care engine, and returns replies without requiring
    the WhatsApp UI or browser to be open.
    """
    def __init__(self, service: 'WhatsAppCustomerCareService', *args, **kwargs):
        self.service = service
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path in ["/", "/health", "/status"]:
            dash = self.service.get_service_dashboard()
            res_data = {
                "status": "online",
                "service": "J.A.R.V.I.S. WhatsApp Customer Care Background Daemon",
                "receptionist_mode": dash["receptionist_mode"],
                "bengali_support": True,
                "learned_rules": dash["learned_rules_count"],
                "total_interactions": dash["total_interactions"],
                "resolved_tickets": dash["resolved_tickets"],
                "escalated_tickets": dash["escalated_tickets"]
            }
            res_bytes = json.dumps(res_data, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(res_bytes)))
            self.end_headers()
            self.wfile.write(res_bytes)
        elif "/webhook" in self.path:
            res_bytes = b"VERIFIED"
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(res_bytes)))
            self.end_headers()
            self.wfile.write(res_bytes)
        else:
            self.send_response(404)
            self.send_header("Content-Length", "0")
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else ""
        
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        phone = data.get("from") or data.get("phone") or "+1-555-0100"
        name = data.get("name") or data.get("sender_name") or "Valued Customer"
        text = data.get("text") or data.get("message") or ""
        prefer_voice = data.get("prefer_voice", False)

        # Handle Meta Cloud API nested structures if sent
        if "entry" in data and isinstance(data["entry"], list):
            try:
                change_val = data["entry"][0]["changes"][0]["value"]
                msg_obj = change_val.get("messages", [{}])[0]
                phone = msg_obj.get("from", phone)
                text = msg_obj.get("text", {}).get("body", text)
                contacts = change_val.get("contacts", [{}])
                if contacts and "profile" in contacts[0]:
                    name = contacts[0]["profile"].get("name", name)
            except Exception:
                pass

        # Process the incoming message via WhatsAppCustomerCareService
        result = self.service.process_incoming_text(
            customer_phone=phone,
            customer_name=name,
            message_text=text,
            prefer_voice=prefer_voice
        )

        res_bytes = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(res_bytes)))
        self.end_headers()
        self.wfile.write(res_bytes)

    def log_message(self, format, *args):
        # Silent background daemon logging
        return


class WhatsAppBackgroundDaemon:
    """
    24/7 Autonomous Background Service for WhatsApp Customer Care.
    Runs persistently in the background even if the user closes WhatsApp,
    the browser, or locks their desktop.
    """
    def __init__(self, service: 'WhatsAppCustomerCareService', host: str = "127.0.0.1", port: int = 5055):
        self.service = service
        self.host = host
        self.port = port
        self.server: Optional[HTTPServer] = None
        self.thread: Optional[threading.Thread] = None
        self.is_running = False

    def start(self) -> Dict[str, Any]:
        if self.is_running:
            return {"success": True, "message": f"WhatsApp background daemon already running on port {self.port}."}
        
        handler_factory = lambda *args, **kwargs: WhatsAppWebhookHandler(self.service, *args, **kwargs)
        try:
            self.server = ReusableHTTPServer((self.host, self.port), handler_factory)
            self.is_running = True
            self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
            self.thread.start()
            return {
                "success": True,
                "host": self.host,
                "port": self.port,
                "status": "running",
                "message": f"WhatsApp Customer Care background daemon active on port {self.port}. Customer care operates 24/7 even if WhatsApp is closed."
            }
        except Exception as e:
            self.is_running = False
            return {"success": False, "error": str(e), "message": f"Failed to start background daemon: {e}"}

    def stop(self) -> Dict[str, Any]:
        if not self.is_running or not self.server:
            return {"success": True, "message": "Background daemon was not running."}
        try:
            self.is_running = False
            self.server.shutdown()
            self.server.server_close()
            if self.thread and self.thread.is_alive():
                self.thread.join(timeout=1.0)
            return {"success": True, "message": "WhatsApp Customer Care background daemon stopped, sir."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "host": self.host,
            "port": self.port,
            "webhook_endpoint": f"http://{self.host}:{self.port}/webhook/whatsapp",
            "api_endpoint": f"http://{self.host}:{self.port}/api/message"
        }

