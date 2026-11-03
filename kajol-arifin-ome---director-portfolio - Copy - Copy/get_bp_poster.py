import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
url = 'https://www.imdb.com/title/tt11318332/'
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8')

# Search for og:image
og = re.findall(r'<meta property="og:image" content="([^"]+)"', html)
print("og:image:", og)

# Search for poster image links
posters = re.findall(r'https://m\.media-amazon\.com/images/M/[^"\']+\.jpg', html)
print("media-amazon images:", posters[:5])
