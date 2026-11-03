import urllib.request
import urllib.parse
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def search_news(query):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        links = re.findall(r'href="//duckduckgo.com/l/\?uddg=([^"&]+)', html)
        decoded = [urllib.parse.unquote(l) for l in links]
        return decoded
    except Exception as e:
        print("Search failed:", e)
        return []

links = search_news("site:thedailystar.net 'Tawsif Mahbub'")
print("Daily Star links:", len(links))
for l in links[:5]:
    print("-", l)

# Download image from one of the articles
img_urls = []
for l in links[:4]:
    try:
        req = urllib.request.Request(l, headers=headers)
        with urllib.request.urlopen(req) as resp:
            page = resp.read().decode('utf-8', errors='ignore')
        found = re.findall(r'https://[^\s"\'<>]+\.jpg', page)
        for img in found:
            if 'tawsif' in img.lower() or 'entertainment' in img.lower() or 'upload' in img.lower():
                img_urls.append(img)
    except Exception as e:
        print(f"Failed {l}: {e}")

print("Found image URLs:", len(img_urls))
for i, u in enumerate(list(set(img_urls))[:5]):
    print(i, u)
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req) as resp, open(f'public/assets/fb/news_photo_{i}.jpg', 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded news_photo_{i}.jpg")
    except Exception as e:
        print("Failed dl:", e)
