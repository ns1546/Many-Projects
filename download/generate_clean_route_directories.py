import os

pages = ['about', 'works', 'studio', 'gallery', 'contact']
base_dir = r"g:\Download Official\download"

for page in pages:
    src_file = os.path.join(base_dir, f"{page}.html")
    dest_dir = os.path.join(base_dir, page)
    dest_file = os.path.join(dest_dir, "index.html")
    
    os.makedirs(dest_dir, exist_ok=True)
    with open(src_file, "r", encoding="utf-8") as f:
        html = f.read()
    
    # Ensure <base href="../"> is present
    if '<base href="../">' not in html:
        html = html.replace('<head>', '<head>\n    <base href="../">', 1)
        
    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(html)
        
    print(f"Created {page}/index.html ({len(html)} bytes)")

print("\nAll clean route directories generated successfully!")
