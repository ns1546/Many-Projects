---
name: jarvis-multimodal-intelligence
description: "Visual desktop inspection, browser automation via agent-browser, and GUI interactions via cua-driver for J.A.R.V.I.S."
---

# J.A.R.V.I.S. Multimodal & GUI Intelligence Skill

This skill equips Hermes Agent to perceive and manipulate desktop graphical interfaces and web browsers.

## Capabilities & Workflows

### 1. Web Automation via agent-browser
For automated scraping, navigation, or web form workflows:
- Use Hermes's built-in `agent-browser` or `web_extract`.
- Extract structured tables, markdown, or search summaries.

### 2. GUI Automation via cua-driver
When instructed to interact with native desktop GUI elements (clicking buttons, typing into fields):
- Invoke Hermes with `--skills computer-use`.
- Take a screenshot of the active desktop.
- Identify the coordinate boundaries of the target control.
- Emit mouse click or keyboard sequence.

### 3. Screen Telemetry
To list open windows and inspect active foreground processes:
```powershell
python -c "from automation.os_controller import WindowsOSController; print(WindowsOSController().list_open_windows())"
```
