import urllib.request
import json
import re

url = "https://upload.wikimedia.org/wikipedia/commons/e/e3/Tawsif_Mahbub.jpg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as resp, open('public/assets/fb/tawsif_wiki.jpg', 'wb') as f:
        f.write(resp.read())
    print("Downloaded tawsif_wiki.jpg")
except Exception as e:
    print("Download failed:", e)
