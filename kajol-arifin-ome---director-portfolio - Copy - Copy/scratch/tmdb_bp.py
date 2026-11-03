import urllib.request
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for tv_id in [158036, 292994]:
    url = f"https://api.themoviedb.org/3/tv/{tv_id}?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&append_to_response=images"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"TV ID {tv_id}: {data.get('name')} ({data.get('first_air_date')})")
            print(f"Poster path: {data.get('poster_path')}")
            print(f"Backdrop path: {data.get('backdrop_path')}")
            posters = data.get('images', {}).get('posters', [])
            print(f"Total posters: {len(posters)}")
            for p in posters:
                print(f"  https://image.tmdb.org/t/p/original{p['file_path']} ({p['width']}x{p['height']})")
    except Exception as e:
        print(f"Error {tv_id}:", e)
