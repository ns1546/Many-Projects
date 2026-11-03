import shutil
import os

dist_dir = 'dist'
target_outer = 'netlify-upload'
target_inner = os.path.join(target_outer, 'new netlify upload')

print(f"Source: {os.path.abspath(dist_dir)}")
print(f"Target outer: {os.path.abspath(target_outer)}")
print(f"Target inner: {os.path.abspath(target_inner)}")

# 1. First, make sure target_inner doesn't interfere with copying
# Remove any existing inner copy if present
if os.path.exists(target_inner):
    shutil.rmtree(target_inner)

# 2. Copy all files and folders from dist to target_outer
items = os.listdir(dist_dir)
for item in items:
    src_path = os.path.join(dist_dir, item)
    dst_path = os.path.join(target_outer, item)
    if os.path.isdir(src_path):
        if os.path.exists(dst_path):
            shutil.rmtree(dst_path)
        shutil.copytree(src_path, dst_path)
        print(f"Copied directory {item} to {target_outer}")
    else:
        shutil.copy2(src_path, dst_path)
        print(f"Copied file {item} to {target_outer}")

# 3. Create the inner folder 'new netlify upload' inside 'netlify-upload'
# and copy all files from dist into it
os.makedirs(target_inner, exist_ok=True)
for item in items:
    src_path = os.path.join(dist_dir, item)
    dst_path = os.path.join(target_inner, item)
    if os.path.isdir(src_path):
        shutil.copytree(src_path, dst_path)
    else:
        shutil.copy2(src_path, dst_path)

print(f"Successfully populated '{target_inner}' with all deployment files!")

# 4. Verify contents
print("\nOuter netlify-upload contents:")
for it in os.listdir(target_outer):
    print(" -", it)

print("\nInner 'new netlify upload' contents:")
for it in os.listdir(target_inner):
    print(" -", it)
