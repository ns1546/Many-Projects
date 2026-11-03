# 🚀 InfinityFree Hosting Deployment Guide — JKH Jesan Portfolio

This package contains everything required to deploy the **JKH Jesan Audio Architect** website to **InfinityFree Web Hosting**.

---

## 📦 What Was Built For You

| File / Folder | Size | Description | Recommended For |
|---|---|---|---|
| **`infinityfree_htdocs_upload.zip`** | ~15.1 MB | **All-in-one complete package** containing all 66 production web files, images, music, `.htaccess`, and `api.php`. | **FTP (FileZilla / WinSCP)** |
| **`infinityfree_filemanager_under10mb.zip`** | ~8.4 MB | **Web File Manager package** (all files except the 7.7MB MP3) strictly kept under InfinityFree's 10 MB upload limit. | **Web File Manager (Monsta)** |
| **`dist_infinityfree_htdocs/`** | ~16.3 MB | Uncompressed staging folder containing the exact directory structure for `htdocs/`. | Direct drag-and-drop via FTP |
| **`api.php`** | ~12.6 KB | Native PHP backend replacing Node.js `server.js`. Powers login, CMS saves, and dynamic content. | Server-side execution |
| **`.htaccess`** | ~2.6 KB | Production Apache configuration with clean URLs, HTTPS redirection, GZIP compression, and protection for `users.json`. | Apache web server |

---

## ⚡ Deployment Methods

### 🌟 Option A: Uploading via InfinityFree Web File Manager (No Software Needed)

InfinityFree's browser File Manager has a **10 MB limit per uploaded file**. Because we created `infinityfree_filemanager_under10mb.zip` (8.6 MB), you can upload it directly:

1. **Log in** to your [InfinityFree Client Area](https://app.infinityfree.com/).
2. Select your hosting account and click **Manage** -> **File Manager** (or open the Control Panel and click **Online File Manager**).
3. In the file list, double-click into the **`htdocs/`** folder.
   > **Note:** If you see any default files like `index2.html` or `default.php`, delete them so they don't override your website.
4. Click the **Upload** button at the bottom/top toolbar -> choose **Upload Zip**.
5. Select **`infinityfree_filemanager_under10mb.zip`**.
6. Once uploaded, right-click the zip (or select it) and choose **Extract**. All files will extract directly into `htdocs/`.
7. Now click **Upload** -> **Upload File**, and select **`Kothay Pabo tare Final Master.mp3`** (7.7 MB, safely under 10 MB).
8. Delete the `.zip` file from `htdocs/` to keep your storage clean.

---

### 🚀 Option B: Uploading via FileZilla FTP (Fastest & Most Reliable)

1. In your InfinityFree Client Area, copy your **FTP Details**:
   - **FTP Host / Server:** e.g. `ftpupload.net`
   - **FTP Username:** e.g. `epiz_12345678`
   - **FTP Password:** your vPanel account password
   - **Port:** `21`
2. Open **FileZilla** on your computer.
3. Enter the Host, Username, Password, and Port `21`, then click **Quickconnect**.
4. In the **Remote Site** (right pane), open the **`htdocs`** folder.
5. In the **Local Site** (left pane), open:
   `g:\Download Official\download\dist_infinityfree_htdocs\`
6. Select all files and folders inside `dist_infinityfree_htdocs/`, right-click, and select **Upload**.
7. Wait 1–2 minutes for the upload to complete.

---

## 🔐 Admin Panel & Content Management System

Because InfinityFree runs **Apache and PHP 8.x** (and does not run Node.js), we engineered `api.php`. This means your CMS works out of the box!

- **Admin Login URL:** `https://yourdomain.com/admin` (or `https://yourdomain.com/admin.html`)
- **Default Admin Credentials:**
  - **Email:** `admin@jkhjesan.com`
  - **Password:** `admin`
- **Permissions:** You can log in, edit all section texts, update bio/works/social links, and manage users.
- **Security:** `.htaccess` blocks public web visitors from downloading `users.json`, keeping credentials secure.

---

## 🔒 Free SSL / HTTPS Setup on InfinityFree

To get the green padlock `https://`:
1. In the InfinityFree Client Area, click **Free SSL Certificates**.
2. Click **New SSL Certificate**, select your domain, and choose **Let's Encrypt** or **ZeroSSL**.
3. Follow the 1-click DNS record verification.
4. Once issued, click **Install SSL Certificate Automatically**.
5. Your `.htaccess` file is already pre-configured to automatically redirect all `http://` traffic to `https://`.

---

## ✅ Pre-flight Checklist Verified

- [x] All 66 files are under InfinityFree's 10 MB per-file limit.
- [x] Heavy uncompressed raw photos (50 MB) excluded to conserve inodes and bandwidth.
- [x] Clean URLs enabled (`/works`, `/about`, `/gallery`, `/contact`, `/admin`).
- [x] `.htaccess` pre-configured with HTTPS redirect, GZIP compression, and browser caching.
- [x] `api.php` fully replicates `server.js` with zero dependencies.
- [x] Case-sensitive image aliases (`adam audio.jpeg`, `microphone.jpeg`) created to prevent 404s on Linux Apache.
