import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Search bing for Bachelor Point poster
query = 'Bachelor+Point+poster+dhruba+tv'
url = f'https://www.bing.com/images/search?q={query}&form=HDRSC2'

req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8')

# Extract image urls
m = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
print(f"Found {len(m)} image URLs from Bing:")
for u in m[:10]:
    print(u)
