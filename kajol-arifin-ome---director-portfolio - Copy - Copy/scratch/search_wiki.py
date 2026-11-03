import urllib.request
import urllib.parse
import json
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Search Wikipedia Bengali and English for Bachelor Point
for lang in ['en', 'bn']:
    url = f"https://{lang}.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote('Bachelor Point' if lang=='en' else 'ব্যাচেলর পয়েন্ট')}&prop=pageimages&format=json&pilicense=any&piprop=original|thumbnail"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"Wiki {lang}:", json.dumps(data, indent=2))
    except Exception as e:
        print(f"Wiki {lang} err:", e)
