import os
import shutil
import zipfile

def build_package():
    base_dir = r"g:\Download Official\download"
    dist_dir = os.path.join(base_dir, "dist_infinityfree_htdocs")
    zip_path = os.path.join(base_dir, "infinityfree_htdocs_upload.zip")
    zip_monsta_path = os.path.join(base_dir, "infinityfree_filemanager_under10mb.zip")

    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)
    os.makedirs(dist_dir, exist_ok=True)

    # Core production files
    root_files = [
        ".htaccess",
        "about.html",
        "admin.html",
        "api.php",
        "apple-touch-icon.png",
        "contact.html",
        "database.json",
        "favicon-192x192.png",
        "favicon-48x48.png",
        "favicon-96x96.png",
        "favicon.ico",
        "gallery.html",
        "grain.png",
        "index.html",
        "JKH_ART_WORK-removebg-preview.png",
        "Kothay Pabo tare Final Master.mp3",
        "mobile.css",
        "mobile.js",
        "robots.txt",
        "site.webmanifest",
        "sitemap.xml",
        "studio.html",
        "styles.css",
        "users.json",
        "works.html",
        "yt_script.js"
    ]

    print("Copying root files to staging directory...")
    for f in root_files:
        src = os.path.join(base_dir, f)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(dist_dir, f))
            print(f"  + {f} ({os.path.getsize(src):,} bytes)")
        else:
            print(f"  ! WARNING: Missing root file: {f}")

    # Copy pictures for visual studio
    print("\nCopying 'pictures for visual studio'...")
    src_pvs = os.path.join(base_dir, "pictures for visual studio")
    dest_pvs = os.path.join(dist_dir, "pictures for visual studio")
    os.makedirs(dest_pvs, exist_ok=True)
    for f in os.listdir(src_pvs):
        sf = os.path.join(src_pvs, f)
        if os.path.isfile(sf):
            shutil.copy2(sf, os.path.join(dest_pvs, f))
            print(f"  + pictures for visual studio/{f}")

    # Copy drive-download-20260503T111429Z-3-001 (excluding backup folders)
    print("\nCopying 'drive-download-20260503T111429Z-3-001' (excluding heavy RAW backups)...")
    src_dd = os.path.join(base_dir, "drive-download-20260503T111429Z-3-001")
    dest_dd = os.path.join(dist_dir, "drive-download-20260503T111429Z-3-001")
    os.makedirs(dest_dd, exist_ok=True)
    for f in os.listdir(src_dd):
        sf = os.path.join(src_dd, f)
        if os.path.isfile(sf):
            shutil.copy2(sf, os.path.join(dest_dd, f))
            print(f"  + drive-download.../{f} ({os.path.getsize(sf):,} bytes)")
        elif os.path.isdir(sf) and "backup" in f.lower():
            print(f"  - SKIPPING heavy raw backup dir: {f}")

    # Copy clean route directories (for universal clean extensionless URLs)
    clean_routes = ["about", "works", "studio", "gallery", "contact"]
    print("\nCopying clean route directories...")
    for route in clean_routes:
        src_route = os.path.join(base_dir, route)
        dest_route = os.path.join(dist_dir, route)
        if os.path.exists(src_route):
            shutil.copytree(src_route, dest_route, dirs_exist_ok=True)
            print(f"  + {route}/index.html")

    # Verify per-file limits (< 10MB for InfinityFree)
    print("\nVerifying 10MB per-file limit across all staged files...")
    limit_10mb = 10 * 1024 * 1024
    over_limit = []
    total_staged_bytes = 0
    file_count = 0

    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            fp = os.path.join(root, file)
            sz = os.path.getsize(fp)
            total_staged_bytes += sz
            file_count += 1
            if sz > limit_10mb:
                over_limit.append((fp, sz))

    if over_limit:
        print(f"ERROR: {len(over_limit)} files exceed 10MB!")
        for fp, sz in over_limit:
            print(f"  {fp}: {sz / (1024*1024):.2f} MB")
    else:
        print(f"SUCCESS: All {file_count} files are safely UNDER the 10MB InfinityFree limit!")
        print(f"Total uncompressed size: {total_staged_bytes / (1024*1024):.2f} MB")

    # Create Full ZIP Archive
    print(f"\nCreating full ZIP archive: {zip_path}...")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                abs_p = os.path.join(root, file)
                rel_p = os.path.relpath(abs_p, dist_dir)
                zipf.write(abs_p, rel_p)

    full_zip_size = os.path.getsize(zip_path)
    print(f"Full ZIP size: {full_zip_size / (1024*1024):.2f} MB ({full_zip_size:,} bytes)")

    # Also create File Manager friendly ZIP (under 10MB) if full zip > 10MB
    print(f"\nCreating Web File Manager ZIP (without heavy MP3 audio for 1-click web upload):")
    if os.path.exists(zip_monsta_path):
        os.remove(zip_monsta_path)
    with zipfile.ZipFile(zip_monsta_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                if file.endswith(".mp3"):
                    continue
                abs_p = os.path.join(root, file)
                rel_p = os.path.relpath(abs_p, dist_dir)
                zipf.write(abs_p, rel_p)

    monsta_zip_size = os.path.getsize(zip_monsta_path)
    print(f"Web File Manager ZIP size: {monsta_zip_size / (1024*1024):.2f} MB ({monsta_zip_size:,} bytes)")

    print("\n--- PACKAGING COMPLETE ---")

if __name__ == "__main__":
    build_package()
