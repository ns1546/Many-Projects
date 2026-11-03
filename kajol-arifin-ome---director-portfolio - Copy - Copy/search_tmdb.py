import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Search TMDB for Bachelor Point
url = 'https://www.themoviedb.org/search?query=Bachelor+Point'
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = re.findall(r'href="(/tv/\d+[^"]*)"', html)
    print("TMDB TV links:", links)
    images = re.findall(r'https://image\.tmdb\.org/t/p/[^"]+\.jpg', html)
    print("TMDB images:", images[:5])
except Exception as e:
    print("Error:", e)
