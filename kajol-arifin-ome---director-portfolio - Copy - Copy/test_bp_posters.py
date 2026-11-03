import urllib.request
from PIL import Image
import io

headers = {'User-Agent': 'Mozilla/5.0'}

for url in [
    'https://image.tmdb.org/t/p/original/9H0AaRxAx5d2MzdAQNetGwyIygg.jpg',
    'https://image.tmdb.org/t/p/original/bL2TjeEuCFnbjhlDvTizITosmgW.jpg'
]:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            im = Image.open(io.BytesIO(data))
            fname = url.split('/')[-1]
            with open('public/gallery/' + fname, 'wb') as f:
                f.write(data)
            print(f"Downloaded {fname}: {im.size}, aspect ratio: {im.size[0]/im.size[1]:.2f}")
    except Exception as e:
        print("Error:", e)
