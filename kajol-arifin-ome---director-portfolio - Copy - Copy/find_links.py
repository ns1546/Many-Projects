import urllib.request
import re

url = "https://html.duckduckgo.com/html/?q=Kajal+Arefin+Ome+director"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = set(re.findall(r'href="(https?://[^"]+)"', html))
    for link in links:
        if 'thedailystar.net' in link or 'tbsnews.net' in link or 'dhakatribune.com' in link or 'prothomalo.com' in link:
            if 'search' not in link and 'google' not in link:
                print(link)
except Exception as e:
    print(e)
