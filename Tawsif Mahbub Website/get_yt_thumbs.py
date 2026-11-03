import urllib.request
import urllib.parse
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def get_yt_thumbnails(query, out_name):
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        # Find video IDs
        vids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
        if not vids:
            # fallback
            vids = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', html)
        print(f"Query: {query} -> Found videos:", len(vids))
        for vid in list(set(vids))[:4]:
            # Try maxresdefault or hqdefault
            thumb_url = f"https://img.youtube.com/vi/{vid}/maxresdefault.jpg"
            try:
                with urllib.request.urlopen(urllib.request.Request(thumb_url, headers=headers)) as r:
                    with open(f"public/assets/fb/{out_name}_{vid}.jpg", "wb") as f:
                        f.write(r.read())
                    print(f"Downloaded maxresdefault for {vid} -> {out_name}_{vid}.jpg")
                    return f"assets/fb/{out_name}_{vid}.jpg"
            except:
                thumb_url = f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"
                try:
                    with urllib.request.urlopen(urllib.request.Request(thumb_url, headers=headers)) as r:
                        with open(f"public/assets/fb/{out_name}_{vid}.jpg", "wb") as f:
                            f.write(r.read())
                        print(f"Downloaded hqdefault for {vid} -> {out_name}_{vid}.jpg")
                        return f"assets/fb/{out_name}_{vid}.jpg"
                except Exception as e:
                    print(f"Failed {vid}: {e}")
    except Exception as e:
        print(f"Error querying {query}: {e}")
    return None

get_yt_thumbnails("Tawsif Mahbub photoshoot interview", "tawsif_interview")
get_yt_thumbnails("Chokro Tawsif Mahbub web series", "chokro_real")
get_yt_thumbnails("Love Sub Tawsif Mahbub natok", "love_sub_real")
get_yt_thumbnails("Bachelor Point Nehal Tawsif Mahbub", "bachelor_point_real")
get_yt_thumbnails("Tawsif Mahbub romantic drama 2024", "romantic_real")
