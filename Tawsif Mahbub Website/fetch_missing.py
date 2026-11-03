import os
import urllib.request
import urllib.parse
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
FOLDER = "tawsif_handsome_photos_4years"

def fetch(query, filename):
    url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(query)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        vids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
        for vid in list(dict.fromkeys(vids))[:4]:
            for res in ['maxresdefault.jpg', 'hqdefault.jpg']:
                try:
                    with urllib.request.urlopen(f"https://img.youtube.com/vi/{vid}/{res}") as r:
                        data = r.read()
                        if len(data) > 30000:
                            path = os.path.join(FOLDER, filename)
                            with open(path, 'wb') as f:
                                f.write(data)
                            print("Saved:", filename, len(data)//1024, "KB")
                            return
                except:
                    pass
    except Exception as e:
        print("Error:", e)

fetch("Beshi Bole Bulbuli Totini Tawsif", "21_tawsif_beshi_bole_bulbuli_romantic_look_2024.jpg")
fetch("Beshi Bole Bulbuli 2 Tawsif", "22_tawsif_bulbuli_2_stylish_look_2024.jpg")
