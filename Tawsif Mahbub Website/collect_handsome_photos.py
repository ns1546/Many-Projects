import urllib.request
import urllib.parse
import json
import re
import os
import sys

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

OUTPUT_DIR = os.path.join(os.getcwd(), 'tawsif_handsome_photos_4years')
os.makedirs(OUTPUT_DIR, exist_ok=True)
print(f"Target folder created at: {OUTPUT_DIR}")

def search_images(query, max_results=20):
    print(f"Searching for: {query}")
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers=headers)
    image_links = []
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        
        # Extract article and direct image links
        links = re.findall(r'href="//duckduckgo.com/l/\?uddg=([^"&]+)', html)
        decoded = [urllib.parse.unquote(l) for l in links]
        
        for page_url in decoded[:10]:
            try:
                p_req = urllib.request.Request(page_url, headers=headers)
                with urllib.request.urlopen(p_req, timeout=8) as p_resp:
                    page_html = p_resp.read().decode('utf-8', errors='ignore')
                
                # Find og:image or high res jpg/png
                og_imgs = re.findall(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', page_html, re.I)
                for og in og_imgs:
                    if og.startswith('http') and ('tawsif' in og.lower() or 'entertainment' in og.lower() or 'upload' in og.lower()):
                        image_links.append(og)
                
                # Also find img tags
                imgs = re.findall(r'https://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', page_html, re.I)
                for img in imgs:
                    img_lower = img.lower()
                    if ('tawsif' in img_lower or 'mahbub' in img_lower) and not any(x in img_lower for x in ['thumb', 'icon', 'logo', 'avatar', 'small', '150x150', '50x50']):
                        image_links.append(img)
            except Exception as e:
                pass
    except Exception as e:
        print(f"Search failed for {query}: {e}")
    
    return list(dict.fromkeys(image_links))

queries = [
    "Tawsif Mahbub photoshoot 2024",
    "Tawsif Mahbub Meril Prothom Alo award 2024",
    "Tawsif Mahbub Chokro actor photoshoot",
    "Tawsif Mahbub actor style portrait Daily Star",
    "Tawsif Mahbub handsome portrait Prothom Alo",
    "Tawsif Mahbub Eid natok photoshoot",
    "Tawsif Mahbub Zara wedding anniversary photoshoot",
    "Tawsif Mahbub stylish model portrait"
]

all_images = []
for q in queries:
    res = search_images(q)
    all_images.extend(res)

unique_images = list(dict.fromkeys(all_images))
print(f"Total candidate images found: {len(unique_images)}")

count = 0
for idx, img_url in enumerate(unique_images):
    try:
        ext = os.path.splitext(urllib.parse.urlparse(img_url).path)[1]
        if not ext or len(ext) > 5:
            ext = '.jpg'
        
        filename = f"tawsif_handsome_{count+1:02d}{ext}"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        req = urllib.request.Request(img_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read()
        
        # filter out very small files (icons, tracking pixels)
        if len(content) > 25000: # at least 25KB
            with open(filepath, 'wb') as f:
                f.write(content)
            print(f"[{count+1}] Downloaded: {filename} ({len(content)//1024} KB) from {img_url[:60]}...")
            count += 1
            if count >= 30:
                break
    except Exception as e:
        pass

print(f"\nSuccessfully collected {count} handsome photos into: {OUTPUT_DIR}")
