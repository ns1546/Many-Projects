import urllib.request
import urllib.parse
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def search_images(query):
    # Step 1: get vqd
    url_vqd = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url_vqd, headers=headers)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        m = re.search(r'vqd=([0-9-_]+)', content)
        if not m:
            m = re.search(r'vqd=[\'\"]([0-9-_]+)[\'\"]', content)
        if not m:
            print("No VQD found")
            return
        vqd = m.group(1)
        print("Got VQD:", vqd)
        
    url_img = f"https://duckduckgo.com/i.js?l=wt-wt&o=json&q={urllib.parse.quote(query)}&vqd={vqd}"
    req2 = urllib.request.Request(url_img, headers=headers)
    with urllib.request.urlopen(req2) as resp2:
        data = json.loads(resp2.read().decode('utf-8', errors='ignore'))
        results = data.get('results', [])
        print(f"Total results: {len(results)}")
        for r in results[:10]:
            print("Title:", r.get('title'))
            print("URL:", r.get('image'))

search_images("Tawsif Mahbub Nehal Bachelor Point")
