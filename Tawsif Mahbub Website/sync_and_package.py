import os
import shutil
import zipfile

WORKSPACE = r"g:\Download Official\Tawsif Mahbub Website"
DIST_DIR = os.path.join(WORKSPACE, "dist")
DIRECT_DEPLOY_DIR = os.path.join(WORKSPACE, "direct-deploy")
NETLIFY_DEPLOY_DIR = os.path.join(WORKSPACE, "netlify-deploy")
ZIP_DIRECT = os.path.join(WORKSPACE, "direct-deploy.zip")
ZIP_NETLIFY = os.path.join(WORKSPACE, "netlify-deploy.zip")
ZIP_FULL = os.path.join(WORKSPACE, "Tawsif_Mahbub_Official_Website_Full.zip")

print("1. Syncing dist to direct-deploy...")
if os.path.exists(DIRECT_DEPLOY_DIR):
    shutil.rmtree(DIRECT_DEPLOY_DIR)
shutil.copytree(DIST_DIR, DIRECT_DEPLOY_DIR)
print(f"Direct deploy synced: {len(os.listdir(DIRECT_DEPLOY_DIR))} items.")

print("2. Packaging direct-deploy.zip...")
if os.path.exists(ZIP_DIRECT):
    os.remove(ZIP_DIRECT)

with zipfile.ZipFile(ZIP_DIRECT, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(DIRECT_DEPLOY_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, DIRECT_DEPLOY_DIR)
            zipf.write(full_path, rel_path)

print(f"direct-deploy.zip created: {os.path.getsize(ZIP_DIRECT) / (1024 * 1024):.2f} MB")

print("3. Syncing dist to netlify-deploy (preserving Netlify config files)...")
# Save config files from netlify-deploy if present
configs = {}
for cfg in [".htaccess", "DEPLOY_INSTRUCTIONS.txt", "_redirects", "netlify.toml", "package.json", "robots.txt", "vercel.json"]:
    p = os.path.join(NETLIFY_DEPLOY_DIR, cfg)
    if os.path.exists(p):
        with open(p, "rb") as f:
            configs[cfg] = f.read()

# Copy dist files into netlify-deploy
for item in os.listdir(DIST_DIR):
    s = os.path.join(DIST_DIR, item)
    d = os.path.join(NETLIFY_DEPLOY_DIR, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

# Restore/ensure config files
for cfg, content in configs.items():
    p = os.path.join(NETLIFY_DEPLOY_DIR, cfg)
    with open(p, "wb") as f:
        f.write(content)

print(f"netlify-deploy synced: {len(os.listdir(NETLIFY_DEPLOY_DIR))} items.")

print("4. Packaging netlify-deploy.zip...")
if os.path.exists(ZIP_NETLIFY):
    os.remove(ZIP_NETLIFY)

with zipfile.ZipFile(ZIP_NETLIFY, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(NETLIFY_DEPLOY_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, NETLIFY_DEPLOY_DIR)
            zipf.write(full_path, rel_path)

print(f"netlify-deploy.zip created: {os.path.getsize(ZIP_NETLIFY) / (1024 * 1024):.2f} MB")
print("ALL DEPLOYMENT PACKAGES UPDATED AND READY!")
