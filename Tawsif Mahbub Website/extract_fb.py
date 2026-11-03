import re
import urllib.request
import os

target_file = r'C:\Users\User\.gemini\antigravity-ide\brain\4b00009c-8cb7-4f87-ac86-452dd14ea222\.system_generated\steps\195\content.md'
with open(target_file, 'r', encoding='utf-8', errors='ignore') as f:
    txt = f.read()

urls = re.findall(r'https://[^"\'<>\s]+fbcdn\.net[^"\'<>\s]+', txt)
clean_urls = []
for u in set(urls):
    u = u.replace('&amp;', '&')
    if 'stp=' in u or 'jpg' in u or 'png' in u:
        clean_urls.append(u)

print(f"Total matching image URLs in photos: {len(clean_urls)}")
for i, u in enumerate(clean_urls[:15]):
    print(f"{i}: {u}")

for idx, u in enumerate(clean_urls[:10]):
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req) as resp, open(f'public/assets/fb/fb_photo_page_{idx}.jpg', 'wb') as out:
            out.write(resp.read())
        print(f"Successfully downloaded fb_photo_page_{idx}.jpg")
    except Exception as e:
        print(f"Failed {idx}: {e}")
