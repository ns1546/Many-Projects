import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://en.wikipedia.org/wiki/Bachelor_Point'
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8')
imdb = re.findall(r'imdb\.com/title/(tt\d+)', html)
print("IMDb ID:", imdb)
