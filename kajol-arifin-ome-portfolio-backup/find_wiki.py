import urllib.request
import json
import re

url = "https://en.wikipedia.org/w/api.php?action=parse&page=Kajal_Arefin_Ome&format=json&prop=externallinks"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp = urllib.request.urlopen(req).read().decode('utf-8')
    data = json.loads(resp)
    links = data['parse']['externallinks']
    for link in links:
        print(link)
except Exception as e:
    print(e)
