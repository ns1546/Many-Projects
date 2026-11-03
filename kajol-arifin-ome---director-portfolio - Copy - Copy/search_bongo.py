import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = 'https://api-v2.bongobd.com/api/search/bachelor%20point'
try:
    req = urllib.request.Request(url, headers=headers)
    data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    print("Bongo API result:", json.dumps(data, indent=2)[:1000])
except Exception as e:
    print("Bongo error:", e)
