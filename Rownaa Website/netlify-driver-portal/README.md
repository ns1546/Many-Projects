# ROWNAA® Executive Chauffeur Portal — Netlify Deployment Package

This package contains the standalone, production-ready Driver Registration Web App for **Rownaa® Bangladesh**.

## 🚀 How to Deploy on Netlify (in 30 seconds)

### Option A: Drag & Drop (Zero Setup)
1. Go to **[Netlify Drop](https://app.netlify.com/drop)** in your browser.
2. Sign in to your Netlify account.
3. Drag and drop this entire `netlify-driver-portal` folder into the drop zone.
4. Netlify will deploy your site instantly with a free global HTTPS URL (e.g. `https://rownaa-driver-portal.netlify.app`)!

### Option B: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 🔒 Security & Google Account Safety

### Will deploying this Google Apps Script hack or compromise my Google Account?
**No. Your Google Account is 100% safe.**
1. **Google Sandbox Execution:** The Google Apps Script runs exclusively inside Google's sandboxed V8 runtime on Google's cloud servers.
2. **Restricted Scope:** The script only has permissions to write to this one specific spreadsheet and upload photos to the dedicated `Rownaa Chauffeur Documents` folder. It has **zero access** to your Gmail, passwords, photos, contacts, or other Drive folders.
3. **Formula Injection Sanitization:** The webhook code automatically neutralizes formula injection attacks (`=`, `+`, `-`, `@`) so malicious applicants cannot inject formulas into your Google Sheet.
4. **10MB Payload Guard:** Defends against buffer overflow and DoS attacks.

---

## 📋 Google Apps Script Webhook Configuration
The portal is pre-configured and verified with your latest active Google Apps Script deployment URL (Version 7.0):
```
https://script.google.com/macros/s/AKfycbxdX4MS7brwNAnEy3i63mo4X2BTKWi-B91AL3p-MA4qEUVUzp9kfkZehIMLqwmn3sBCvA/exec
```

### Deployment Details:
- **Architecture:** 2-Section Master Architecture (Dashboard & 38-Column Unified Registrations)
- **Features Active:**
  - Dedicated Multiple Cars & Multiple Drivers per Rental Fleet
  - 1-Click WhatsApp Launcher (Column E)
  - Google Drive Document Vault (Folder Links in Column AH)
  - Duplicate detection & resubmission iteration tracker
  - Zero-Freeze-Crash Defensive Engine
