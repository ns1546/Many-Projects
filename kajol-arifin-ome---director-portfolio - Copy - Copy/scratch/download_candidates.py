import urllib.request
import os

posters = {
    'bp_158036_main.jpg': 'https://image.tmdb.org/t/p/w780/xhEdJkBJAiOcjuFMCqBDDCCKzoc.jpg',
    'bp_158036_p2.jpg': 'https://image.tmdb.org/t/p/w780/bfJPZxpXJQVqNCBFXCyeb6j3LkL.jpg',
    'bp_158036_p3.jpg': 'https://image.tmdb.org/t/p/w780/uLUE35pF9hGzXA9k3mxtSZnRITh.jpg',
    'bp_158036_p4.jpg': 'https://image.tmdb.org/t/p/w780/1Geq1DQqc68fPzgAFTr2KVLFrpz.jpg',
    'bp_292994_main.jpg': 'https://image.tmdb.org/t/p/w780/zOzGMbqxNL49U4Z6TlDxSSvHSf0.jpg',
    'bp_292994_p2.jpg': 'https://image.tmdb.org/t/p/w780/hKn4CB6A1tEqTQYl2nRSaD1Oamd.jpg',
    'bp_292994_p3.jpg': 'https://image.tmdb.org/t/p/w780/4LrSHlVItT7aJqKDlPUDHumn4QL.jpg',
}

headers = {'User-Agent': 'Mozilla/5.0'}

os.makedirs('scratch/test_bp', exist_ok=True)
for name, url in posters.items():
    p = os.path.join('scratch/test_bp', name)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(p, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Error {name}:", e)
