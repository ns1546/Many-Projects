import urllib.request
import re
import json

def get_og_image(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        m = re.search(r'<meta property="og:image" content="([^"]+)"', html)
        if m:
            return m.group(1)
    except Exception as e:
        return str(e)
    return "Not found"

print("Bachelor Point:", get_og_image("https://www.themoviedb.org/tv/95460-bachelor-point"))
print("Doi:", get_og_image("https://letterboxd.com/film/doi/"))
