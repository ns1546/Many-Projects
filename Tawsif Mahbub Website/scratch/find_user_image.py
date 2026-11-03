import json
import re

log_file = r'C:\Users\User\.gemini\antigravity-ide\brain\75c78f68-5585-4a57-969a-024201eb53f5\.system_generated\logs\transcript.jsonl'
with open(log_file, 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f if line.strip()]

for idx in range(len(lines) - 1, -1, -1):
    obj = json.loads(lines[idx])
    if obj.get("type") == "USER_INPUT":
        text = json.dumps(obj)
        print(f"USER_INPUT at line {idx}:")
        print(text[:1000])
        matches = re.findall(r'[\w\-\.\\/:]+\.(?:png|jpg|jpeg|webp)', text, re.IGNORECASE)
        print("Images in USER_INPUT:", matches)
        break
