import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://www.serializd.com/show/Bachelor-Point-2018'
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req).read().decode('utf-8')
    m = re.findall(r'<meta property="og:image" content="([^"]+)"', html)
    print("Serializd og:image:", m)
    images = re.findall(r'https://image\.tmdb\.org/t/p/[^"\']+\.jpg', html)
    print("TMDB images from serializd:", images[:5])
except Exception as e:
    print("Error:", e)
