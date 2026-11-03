import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=Bachelor%20Point&gsrlimit=10&prop=imageinfo&iiprop=url|size&format=json'

try:
    req = urllib.request.Request(url, headers=headers)
    data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    pages = data.get('query', {}).get('pages', {})
    for pid, pinfo in pages.items():
        title = pinfo.get('title')
        imginfo = pinfo.get('imageinfo', [{}])[0]
        print(title, imginfo.get('url'), imginfo.get('width'), imginfo.get('height'))
except Exception as e:
    print("Error:", e)
