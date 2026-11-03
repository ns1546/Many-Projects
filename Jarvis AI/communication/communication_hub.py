"""
J.A.R.V.I.S. Multi-Channel Communication & Social Hub
Autonomous management of WhatsApp, Gmail, Messenger, and Social Media.
Supports sending messages, initiating calls, composing emails, and acting as Major-Domo on user's behalf.
"""

import os
import re
import urllib.parse
import webbrowser
import subprocess
import time
from typing import Dict, Any, Optional

from core.memory.omni_memory import OmniMemory
from automation.gui_agent import WindowsGUIAgent
from communication.whatsapp_customer_care import WhatsAppCustomerCareService

class CommunicationHub:
    def __init__(
        self,
        memory: Optional[OmniMemory] = None,
        tts_engine: Optional[Any] = None,
        task_manager: Optional[Any] = None,
        openrouter_brain: Optional[Any] = None,
        local_brain: Optional[Any] = None
    ):
        self.memory = memory or OmniMemory()
        self.gui = WindowsGUIAgent()
        self.tts = tts_engine
        self.task_manager = task_manager
        self.openrouter_brain = openrouter_brain
        self.local_brain = local_brain
        
        # Initialize autonomous WhatsApp Customer Care & Receptionist
        self.customer_care = WhatsAppCustomerCareService(
            memory=self.memory,
            tts_engine=self.tts,
            gui_agent=self.gui,
            task_manager=self.task_manager,
            openrouter_brain=self.openrouter_brain,
            local_brain=self.local_brain
        )


    def send_whatsapp_message(self, contact_or_phone: str, message: str, auto_send: bool = True) -> Dict[str, Any]:
        """
        Sends a WhatsApp message via WhatsApp Web or WhatsApp Desktop protocol.
        Looks up contact in OmniMemory if name is provided.
        """
        phone = contact_or_phone.strip()
        display_name = contact_or_phone.strip()

        # Check if it's a contact name in memory
        contact = self.memory.get_contact(contact_or_phone)
        if contact and contact.get("phone"):
            phone = contact["phone"]
            display_name = contact["name"]

        # Clean phone number (strip '+', spaces, dashes)
        clean_phone = re.sub(r"[^0-9]", "", phone)
        encoded_msg = urllib.parse.quote(message)

        # Primary: WhatsApp Web API direct URL
        web_url = f"https://web.whatsapp.com/send?phone={clean_phone}&text={encoded_msg}" if clean_phone else f"https://web.whatsapp.com/"
        webbrowser.open(web_url)

        # Optional auto-send via GUI agent Enter key after page loads
        if auto_send and clean_phone and self.gui.is_available():
            # Spawn background thread to press Enter after browser loads WhatsApp
            import threading
            def _send_enter():
                time.sleep(6.0)  # Wait for WhatsApp Web interface to load chat
                self.gui.press_key("enter")
            threading.Thread(target=_send_enter, daemon=True).start()

        summary = f"Dispatched WhatsApp directive to {display_name}: '{message[:60]}...'"
        return {
            "success": True,
            "channel": "whatsapp",
            "recipient": display_name,
            "phone": clean_phone,
            "message": message,
            "url": web_url,
            "summary": summary
        }

    def initiate_whatsapp_call(self, contact_or_phone: str) -> Dict[str, Any]:
        """
        Triggers a WhatsApp voice/video call session to the specified contact.
        """
        phone = contact_or_phone.strip()
        display_name = contact_or_phone.strip()

        contact = self.memory.get_contact(contact_or_phone)
        if contact and contact.get("phone"):
            phone = contact["phone"]
            display_name = contact["name"]

        clean_phone = re.sub(r"[^0-9]", "", phone)
        
        # WhatsApp Desktop URI scheme
        call_url = f"whatsapp://send?phone={clean_phone}" if clean_phone else "whatsapp://"
        try:
            os.startfile(call_url)
        except Exception:
            webbrowser.open(f"https://web.whatsapp.com/send?phone={clean_phone}")

        summary = f"Initiating voice communications with {display_name} via WhatsApp array."
        return {
            "success": True,
            "channel": "whatsapp_call",
            "recipient": display_name,
            "summary": summary
        }

    def compose_email(self, recipient_or_name: str, subject: str, body: str) -> Dict[str, Any]:
        """
        Composes an email via Gmail web composer with recipient, subject, and body pre-filled.
        """
        email_addr = recipient_or_name.strip()
        display_name = recipient_or_name.strip()

        contact = self.memory.get_contact(recipient_or_name)
        if contact and contact.get("email"):
            email_addr = contact["email"]
            display_name = contact["name"]

        encoded_to = urllib.parse.quote(email_addr)
        encoded_subj = urllib.parse.quote(subject)
        encoded_body = urllib.parse.quote(body)

        gmail_url = f"https://mail.google.com/mail/?view=cm&fs=1&to={encoded_to}&su={encoded_subj}&body={encoded_body}"
        webbrowser.open(gmail_url)

        summary = f"Prepared email transmission for {display_name} with subject '{subject}'."
        return {
            "success": True,
            "channel": "gmail",
            "recipient": display_name,
            "email": email_addr,
            "subject": subject,
            "body": body,
            "url": gmail_url,
            "summary": summary
        }

    def check_inbox(self, filter_query: Optional[str] = None) -> Dict[str, Any]:
        """Opens Gmail inbox or specific unread messages."""
        if filter_query:
            encoded = urllib.parse.quote(filter_query)
            url = f"https://mail.google.com/mail/u/0/#search/{encoded}"
        else:
            url = "https://mail.google.com/mail/u/0/#inbox"
            
        webbrowser.open(url)
        return {
            "success": True,
            "channel": "gmail",
            "url": url,
            "summary": "Displaying incoming correspondence and inbox in your browser, sir."
        }

    def open_messenger(self) -> Dict[str, Any]:
        """Opens Facebook Messenger."""
        url = "https://www.messenger.com"
        webbrowser.open(url)
        return {"success": True, "channel": "messenger", "summary": "Opened Messenger communications, sir."}

    def post_social_update(self, platform: str, message: str) -> Dict[str, Any]:
        """
        Drafts and opens a social media post on Twitter/X, LinkedIn, or Reddit.
        """
        plat = platform.lower().strip()
        encoded = urllib.parse.quote(message)

        if "twitter" in plat or "x" in plat:
            url = f"https://x.com/compose/post?text={encoded}"
            plat_name = "X (Twitter)"
        elif "linkedin" in plat:
            url = "https://www.linkedin.com/feed/"
            plat_name = "LinkedIn"
        elif "reddit" in plat:
            url = f"https://www.reddit.com/submit?title={encoded}"
            plat_name = "Reddit"
        else:
            url = f"https://x.com/compose/post?text={encoded}"
            plat_name = "X"

        webbrowser.open(url)
        return {
            "success": True,
            "platform": plat_name,
            "content": message,
            "url": url,
            "summary": f"Prepared {plat_name} broadcast: '{message[:50]}...'."
        }

    # =========================================================================
    # WHATSAPP CUSTOMER CARE & AUTONOMOUS RECEPTIONIST EXTENSIONS
    # =========================================================================
    def send_whatsapp_voice_note(self, contact_or_phone: str, text: str, auto_send: bool = True) -> Dict[str, Any]:
        """
        Synthesizes a neural voice note and generates a WhatsApp audio dispatch for the contact.
        """
        phone = contact_or_phone.strip()
        display_name = contact_or_phone.strip()

        contact = self.memory.get_contact(contact_or_phone)
        if contact and contact.get("phone"):
            phone = contact["phone"]
            display_name = contact["name"]

        clean_phone = re.sub(r"[^0-9]", "", phone)
        
        # Synthesize audio voice note
        audio_file = None
        if self.tts and hasattr(self.tts, "generate_speech_file"):
            audio_file = self.tts.generate_speech_file(text)

        encoded_msg = urllib.parse.quote(text)
        web_url = f"https://web.whatsapp.com/send?phone={clean_phone}&text={encoded_msg}" if clean_phone else "https://web.whatsapp.com/"
        
        if auto_send:
            webbrowser.open(web_url)

        summary = f"Synthesized WhatsApp voice note for {display_name}: '{text[:60]}...' (Audio: {os.path.basename(audio_file) if audio_file else 'Generated'})."
        return {
            "success": True,
            "channel": "whatsapp_voice_note",
            "recipient": display_name,
            "phone": clean_phone,
            "transcript": text,
            "audio_file": audio_file,
            "url": web_url,
            "summary": summary
        }

    def attend_incoming_call(
        self,
        caller_phone: str,
        caller_name: Optional[str] = None,
        caller_speech: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Attends an incoming WhatsApp voice/video call on behalf of the Boss.
        """
        return self.customer_care.attend_call(caller_phone, caller_name, caller_speech)

    def process_whatsapp_customer_message(
        self,
        contact_or_phone: str,
        customer_name: Optional[str] = None,
        message: str = "",
        prefer_voice: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluates and responds to incoming customer care inquiries using learned knowledge.
        """
        return self.customer_care.process_incoming_text(
            contact_or_phone, customer_name, message, prefer_voice=prefer_voice
        )

    def teach_customer_care(self, instruction: str, topic: Optional[str] = None) -> Dict[str, Any]:
        """
        Teaches J.A.R.V.I.S. a new policy or answer dynamically like a child.
        """
        return self.customer_care.teach_rule(instruction, topic=topic)

    def toggle_receptionist_mode(self, enabled: bool = True) -> str:
        """
        Enables or disables autonomous receptionist mode for incoming calls.
        """
        return self.customer_care.set_receptionist_mode(enabled)

    def get_customer_care_status(self) -> Dict[str, Any]:
        """
        Retrieves real-time customer care metrics and active tickets.
        """
        return self.customer_care.get_service_dashboard()

    def start_whatsapp_daemon(self, port: int = 5055, host: str = "127.0.0.1") -> Dict[str, Any]:
        """
        Starts the 24/7 background customer care daemon so inquiries are processed even if WhatsApp is closed.
        """
        return self.customer_care.start_background_daemon(host=host, port=port)

    def stop_whatsapp_daemon(self) -> Dict[str, Any]:
        """
        Stops the background WhatsApp customer care daemon.
        """
        return self.customer_care.stop_background_daemon()

    def get_whatsapp_daemon_status(self) -> Dict[str, Any]:
        """
        Retrieves current background daemon status and webhook endpoints.
        """
        return self.customer_care.get_daemon_status()
