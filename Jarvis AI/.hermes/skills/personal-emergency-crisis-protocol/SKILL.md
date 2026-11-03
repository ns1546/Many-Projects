---
name: personal-emergency-crisis-protocol
description: "Emergency incident protocol, In-Case-of-Emergency (ICE) broadcasting, device lockdown, medical profile safeguarding, and first-aid triage guidance."
category: "Human Assistant & Productivity"
tags: ["emergency", "safety", "crisis", "lockdown", "ice", "first-aid", "security", "protection"]
---

# Personal Emergency & Crisis Protocol Skill

This skill governs J.A.R.V.I.S.'s defensive reflex during critical life emergencies, health crises, lost device scenarios, or personal security threats.

## Emergency Response Matrix

### 1. In Case of Emergency (ICE) Protocol
- Upon receiving a panic directive (e.g. *"Jarvis, medical emergency"*, *"Jarvis, broadcast emergency alert"*):
  1. Immediately surface primary emergency phone numbers (Local 911 / 112 / 999).
  2. Display the user's critical medical card:
     - Blood Type
     - Known Drug Allergies
     - Chronic Conditions
     - Primary Emergency Contact (Next of Kin) & Phone Number
  3. Prepare automated SMS/WhatsApp notification to trusted family with location coordinates.

### 2. Device Compromise / Lost Phone Lockdown
- When user issues *"Jarvis, lock all systems"* or *"Jarvis, device compromised"*:
  1. Execute `WindowsOSController.lock_workstation()`.
  2. Terminate exposed browsers and active shell sessions.
  3. Advise on remote account sign-out (Google, Apple ID, Microsoft, banking tokens).

### 3. Immediate First-Aid & Triage Reference
- Quick actionable guidance for acute situations while awaiting emergency responders:
  - Severe Bleeding: Direct firm pressure, elevate, tourniquet if life-threatening limb bleed.
  - Choking: Heimlich maneuver (abdominal thrusts).
  - Unresponsive / No Breathing: Immediate CPR (chest compressions at 100-120 bpm, e.g. rhythm of "Stayin' Alive").
  - Burn: Cool under running water for 20 minutes (never ice or butter).

## Verification & Safe Mode
Never delay real-world medical assistance. All emergency guidance emphasizes contacting licensed first-responders immediately.
