# Evorise Restaurant - True Standalone Desktop Software & Client Sharing Guide

This guide explains how to share the **Evorise Restaurant System** and **Standalone Desktop Software** with your client.

---

## 🖥️ The Standalone Desktop Software (`Evorise-Restaurant-Admin.exe`)
*A 100% self-contained Windows application. No command line, no batch script, and no Node.js installation required on the client PC.*

### Why It Is a True Desktop Software Now:
- **Embedded Backend & Database:** The SQLite database engine, WebSocket hub, and REST server run **internally inside the application process**.
- **Zero Black Windows / CMD:** Double-clicking the `.exe` opens the native desktop software directly. No batch files or terminals appear.
- **Embedded Audio & OS Notifications:** Toast POS chords, restaurant service bells, kitchen dings, taskbar flashing, and live badge counters operate out-of-the-box.
- **Local Wi-Fi QR Access:** In the top menu bar, click **File → 📱 Customer Mobile QR Code Link** to see the local Wi-Fi URL (e.g., `http://192.168.1.15:3000/index.html?table=3`) so smartphones on the network can immediately scan and order.

### Location of the Software:
```
dist/Evorise-Restaurant-Admin-win32-x64/Evorise-Restaurant-Admin.exe
```

### How to Send to Client:
1. Compress the folder: `dist/Evorise-Restaurant-Admin-win32-x64` into a `.zip` file (e.g. `Evorise-Restaurant-Admin.zip`).
2. Send the `.zip` file to your client (via Google Drive, WeTransfer, or USB drive).
3. The client extracts the ZIP and double-clicks **`Evorise-Restaurant-Admin.exe`**.
4. The software launches immediately!

---

## 🌐 Instant Online Live Demo (For Remote Mobile Testing)
*Best if the client is remote and wants to scan the QR code and test ordering on their smartphone right now.*

1. Run [`desktop/share-online.bat`](file:///g:/Download%20Official/Evorise%20Solution-20261009T164044Z-1-001/Evorise%20Solution/QR%20Code%20Web/desktop/share-online.bat).
2. The script will generate a secure public HTTPS link (e.g., `https://xxxx.loca.lt`).
3. Send the links to your client:
   - **Customer Menu (Mobile):** `https://xxxx.loca.lt/index.html?table=3`
   - **Admin Dashboard (Web):** `https://xxxx.loca.lt/admin/index.html`
4. When the client places an order on their phone, your desktop application chimes, flashes the taskbar, and shows the live order popup.

---

## 🛠️ Build Command Reference
To recompile the standalone Windows desktop software at any time:
```bash
npm run build:desktop
```
This automatically bundles all database engines, server routes, admin views, and desktop notification assets into the `dist/Evorise-Restaurant-Admin-win32-x64/` directory.
