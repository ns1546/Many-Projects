import urllib.request
import os

posters = {
    'bp_gx.jpg': 'https://image.tmdb.org/t/p/w780/gx5DBLlofDvIio6Xf3pYvMjXFt0.jpg',
    'bp_v0.jpg': 'https://image.tmdb.org/t/p/w780/v0jEBcZoRpQQYiJmYZUP0ZRkdp.jpg',
    'bp_eq.jpg': 'https://image.tmdb.org/t/p/w780/eq1BQUEmVCVXfhHN7AoIA6J6D0z.jpg',
    'bp_l1.jpg': 'https://image.tmdb.org/t/p/w780/l1vY6HAXQEymkrUUQBPNwzFj5tq.jpg',
}

headers = {'User-Agent': 'Mozilla/5.0'}
os.makedirs('scratch/test_bp2', exist_ok=True)

for name, url in posters.items():
    p = os.path.join('scratch/test_bp2', name)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(p, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Error {name}:", e)
