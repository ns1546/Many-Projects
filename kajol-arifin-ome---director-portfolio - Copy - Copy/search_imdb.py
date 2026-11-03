import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Search IMDb for Bachelor Point
url = 'https://www.imdb.com/find/?q=Bachelor+Point&s=tt'
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req).read().decode('utf-8')
    tt_ids = re.findall(r'/title/(tt\d+)/', html)
    print("IMDb title IDs:", list(set(tt_ids))[:5])
    
    # Also find image URLs in the search results
    imgs = re.findall(r'https://m\.media-amazon\.com/images/M/[^"\']+\.jpg', html)
    print("IMDb search images:", imgs[:5])
except Exception as e:
    print("IMDb search error:", e)
