import urllib.request
import urllib.parse
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

query = 'Bachelor Point season 4 poster Kajal Arefin Ome'
url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC2&first=1"
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        murls = re.findall(r'murl&quot;:&quot;(http[^&]+)&quot;', html)
        print(f"Found {len(murls)} image URLs from Bing:")
        for idx, u in enumerate(murls[:15]):
            print(f"[{idx}] {u}")
except Exception as e:
    print('Error:', e)
