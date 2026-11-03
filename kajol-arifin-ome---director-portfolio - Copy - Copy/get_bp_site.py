import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}
url = 'http://bachelorpointseason5.com'
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    print("bachelorpointseason5.com images:", imgs)
    posters = re.findall(r'https?://[^"\']+\.(?:jpg|jpeg|png)', html)
    print("All image urls:", posters[:10])
except Exception as e:
    print("Error:", e)
