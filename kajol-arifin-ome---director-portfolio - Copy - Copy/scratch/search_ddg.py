import urllib.request
import urllib.parse
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

# Search Google / DuckDuckGo for Bachelor point season 4 poster
queries = [
    'bachelor point season 4 poster dhruba tv',
    'bachelor point season 3 poster',
    'bachelor point natok poster kajol arifin ome kabila pasha'
]

found = []
for q in queries:
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(q)}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # find external image links or relevant pages
            urls = re.findall(r'uddg=([^&]+)', html)
            for u in urls:
                dec = urllib.parse.unquote(u)
                if any(ext in dec.lower() for ext in ['.jpg', '.png', '.jpeg', '.webp']):
                    found.append(dec)
                elif 'imdb.com' in dec or 'themoviedb.org' in dec:
                    found.append(dec)
    except Exception as e:
        print(f"Error for {q}:", e)

print(f"Found {len(found)} candidate links:")
for l in list(set(found))[:15]:
    print(l)
