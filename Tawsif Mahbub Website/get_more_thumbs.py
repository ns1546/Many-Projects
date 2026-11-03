import urllib.request
import urllib.parse
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def get_yt_thumbnails(query, out_name):
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        vids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
        print(f"Query: {query} -> Found videos:", len(vids))
        for vid in list(set(vids))[:6]:
            thumb_url = f"https://img.youtube.com/vi/{vid}/maxresdefault.jpg"
            try:
                with urllib.request.urlopen(urllib.request.Request(thumb_url, headers=headers)) as r:
                    with open(f"public/assets/fb/{out_name}_{vid}.jpg", "wb") as f:
                        f.write(r.read())
                    print(f"Downloaded maxresdefault for {vid} -> {out_name}_{vid}.jpg")
                    return f"assets/fb/{out_name}_{vid}.jpg"
            except:
                continue
    except Exception as e:
        print(f"Error querying {query}: {e}")
    return None

get_yt_thumbnails("Tawsif Mahbub Tanjin Tisha natok 1080p", "tisha_pair")
get_yt_thumbnails("Tawsif Mahbub Sabila Nur natok official", "sabila_pair")
get_yt_thumbnails("Tawsif Mahbub Keya Payel natok official", "keya_pair")
get_yt_thumbnails("Tawsif Mahbub Shadhinota Tumi natok", "shadhinota")
get_yt_thumbnails("Tawsif Mahbub Aro Ekbar natok official", "aro_ekbar")
