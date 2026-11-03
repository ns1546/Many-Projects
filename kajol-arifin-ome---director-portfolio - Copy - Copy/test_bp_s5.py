import urllib.request
from PIL import Image
import io

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

urls = [
    'https://bachelorpointseason5.com/wp-content/uploads/2026/01/photo_2026-01-07_01-42-57.jpg',
    'https://bachelorpointseason5.com/wp-content/uploads/2026/01/Untitled-design-5.jpg',
    'https://bachelorpointseason5.com/wp-content/uploads/2026/01/Untitled-design-6.jpg',
    'https://bachelorpointseason5.com/wp-content/uploads/2026/01/Untitled-design-7.jpg',
    'https://bachelorpointseason5.com/wp-content/uploads/2026/01/473545518_1182766033211386_8017634090042186478_n.jpg'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            im = Image.open(io.BytesIO(data))
            name = u.split('/')[-1]
            out_path = f'public/gallery/test_{name}'
            with open(out_path, 'wb') as f:
                f.write(data)
            print(f"{name}: {im.size}, aspect: {im.size[0]/im.size[1]:.2f}")
    except Exception as e:
        print(f"Error {u}: {e}")
