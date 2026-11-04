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

## 📋 Google Apps Script Setup (Fixing 401 Unauthorized)
If submissions show a 401 error:
1. Open your Google Sheet -> **Extensions** -> **Apps Script**.
2. Paste the contents of `google_sheet_webhook.gs`.
3. In the toolbar, select `setupSheet` and click **Run** once.
4. Click **Deploy** (top right) -> **Manage deployments**.
5. Click the **Pencil (Edit)** icon:
   - **Version:** Select **New version**
   - **Who has access:** MUST be set to **Anyone** (so drivers can submit their application without signing into a Google account)
6. Click **Deploy** and copy the **Web app URL**.
7. The portal is already pre-configured with your latest Web App URL:
   `https://script.google.com/macros/s/AKfycby8srbyj_WYsOeL3v8vX3yqmeHTNRHjuEH2nR8YI6sTxTN5DaV3LDQdT2VxVI5bGyJDlQ/exec`
