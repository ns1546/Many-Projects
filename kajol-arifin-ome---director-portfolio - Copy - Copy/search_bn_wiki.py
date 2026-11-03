import urllib.request
import urllib.parse
import json

headers = {'User-Agent': 'Mozilla/5.0'}
title = urllib.parse.quote('ব্যাচেলর_পয়েন্ট')
url = f'https://bn.wikipedia.org/w/api.php?action=query&titles={title}&prop=images&format=json'

req = urllib.request.Request(url, headers=headers)
data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
pages = data.get('query', {}).get('pages', {})
for pid, p in pages.items():
    images = [img['title'] for img in p.get('images', [])]
    for img_title in images:
        # get image url
        info_url = f"https://bn.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(img_title)}&prop=imageinfo&iiprop=url|size&format=json"
        req_img = urllib.request.Request(info_url, headers=headers)
        img_data = json.loads(urllib.request.urlopen(req_img).read().decode('utf-8'))
        img_pages = img_data.get('query', {}).get('pages', {})
        for ipid, ip in img_pages.items():
            info = ip.get('imageinfo', [{}])[0]
            print(info.get('url'), info.get('width'), info.get('height'))
