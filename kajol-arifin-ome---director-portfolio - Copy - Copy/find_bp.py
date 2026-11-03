import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = 'https://en.wikipedia.org/wiki/Bachelor_Point'
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req).read().decode('utf-8')
    m = re.findall(r'//upload\.wikimedia\.org/wikipedia/[^"\'\s]+\.(?:jpg|jpeg|png)', html)
    print("Wiki images:", m)
except Exception as e:
    print("Wiki error:", e)
