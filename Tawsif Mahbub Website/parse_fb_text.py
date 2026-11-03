with open(r'C:\Users\User\.gemini\antigravity-ide\brain\4b00009c-8cb7-4f87-ac86-452dd14ea222\.system_generated\steps\175\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
# Look for any JSON-like data or script tags
scripts = re.findall(r'<script[^>]*>(.*?)</script>', text, re.DOTALL)
print("Found scripts:", len(scripts))

# Search for any mention of followers, about, intro, bio, phone, email, etc.
keywords = ['follower', 'actor', 'Zara', 'education', 'A versatile', 'Dhaka', 'natok', 'drama']
for kw in keywords:
    found = [m.start() for m in re.finditer(kw, text, re.IGNORECASE)]
    print(f"Keyword '{kw}': {len(found)} occurrences")
    for pos in found[:3]:
        snippet = text[max(0, pos-80):min(len(text), pos+120)]
        print("   Snippet:", snippet.replace('\n', ' '))
