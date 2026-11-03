import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = 'https://duckduckgo.com/?q=Bachelor+Point+poster+kajal+arefin+ome&t=h_&iax=images&ia=images'
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8')
vqd = re.search(r'vqd=([\d-]+)', html)
if vqd:
    vqd_token = vqd.group(1)
    print("VQD:", vqd_token)
    img_url = f'https://duckduckgo.com/i.js?l=us-en&o=json&q=Bachelor+Point+poster+kajal+arefin+ome&vqd={vqd_token}&f=,,,&p=1'
    req2 = urllib.request.Request(img_url, headers=headers)
    data = json.loads(urllib.request.urlopen(req2).read().decode('utf-8'))
    results = data.get('results', [])
    print(f"Found {len(results)} results:")
    for r in results[:10]:
        print(r.get('image'), r.get('title'), r.get('width'), r.get('height'))
else:
    print("No VQD found")
