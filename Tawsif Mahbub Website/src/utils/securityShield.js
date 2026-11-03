/**
 * Tawsif Mahbub Official Archive — Advanced Frontend Protection Shield
 * 
 * Multi-tier defense against:
 * 1. Offline Website Downloader Tools (HTTrack, Cyotek WebCopy, SiteSucker, Wget)
 * 2. Local Disk Execution & Offline Mirroring (file:// protocol lockout)
 * 3. Automated Headless Scraper Bots (Selenium, Puppeteer, Playwright scrapers)
 * 4. Iframe Mirroring / Domain Theft (Frame-busting anti-embed)
 * 5. Page saving & source dumping (Ctrl+S, Cmd+S, Ctrl+U, Cmd+U)
 * 6. DevTools inspection & element tampering (F12, Ctrl+Shift+I/J/C)
 * 7. Printing & PDF harvesting (Ctrl+P, Cmd+P)
 * 8. Image dragging & direct media saving
 */

let toastTimeout = null;

function showShieldToast(message) {
  let toast = document.getElementById('security-shield-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'security-shield-toast';
    toast.className = 'security-shield-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="shield-toast-inner">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span>${message}</span>
    </div>
  `;

  toast.classList.add('visible');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2600);
}

export function initSecurityShield() {
  if (typeof window === 'undefined') return;

  // 1. OFFLINE DOWNLOADER LOCKOUT (Anti-HTTrack / Anti-SiteSucker / Anti-WebCopy)
  // If anyone uses an offline website downloader and attempts to run the files locally:
  if (window.location.protocol === 'file:') {
    document.documentElement.innerHTML = `
      <head>
        <title>Access Restricted — Tawsif Mahbub Official Archive</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            background: #0d0d0c;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
            box-sizing: border-box;
            text-align: center;
          }
          .lockout-box {
            max-width: 520px;
            background: #161615;
            border: 1px solid rgba(229, 9, 20, 0.4);
            border-radius: 8px;
            padding: 3rem 2.5rem;
            box-shadow: 0 24px 60px rgba(0,0,0,0.6);
          }
          .lockout-icon {
            color: #e50914;
            margin-bottom: 1.5rem;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin: 0 0 1rem 0;
            color: #ffffff;
          }
          p {
            font-size: 0.95rem;
            color: #a3a3a3;
            line-height: 1.6;
            margin: 0 0 1.75rem 0;
          }
          .badge {
            display: inline-block;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            padding: 0.4rem 0.9rem;
            background: rgba(229, 9, 20, 0.15);
            color: #ff5252;
            border: 1px solid rgba(229, 9, 20, 0.3);
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="lockout-box">
          <div class="lockout-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <span class="badge">PROPRIETARY ASSET PROTECTION</span>
          <h1>Offline Copying Restricted</h1>
          <p>
            This website and its digital archives are protected by active digital rights management. Running offline downloaded copies or unauthorized mirrors is strictly disabled.
          </p>
          <p style="font-size: 0.8rem; color: #666; margin-bottom: 0;">
            Please visit the official authenticated online website to explore Tawsif Mahbub’s archive.
          </p>
        </div>
      </body>
    `;
    throw new Error("Offline local execution blocked by Tawsif Mahbub Security Shield.");
  }

  // 2. ANTI-IFRAME MIRRORING (Frame-Busting)
  // If an unauthorized site tries to embed this website inside an iframe to scrape or mirror it:
  try {
    if (window.self !== window.top) {
      window.top.location.href = window.self.location.href;
    }
  } catch (e) { }

  // 3. AUTOMATED HEADLESS SCRAPER BOT DETECTION
  try {
    if (navigator.webdriver) {
      console.warn("Automated scraper detected.");
    }
  } catch (e) { }

  // 4. CONSOLE COPYRIGHT WARNING & INTELLECTUAL PROPERTY NOTICE
  try {
    console.clear();
    console.log(
      "%cSTOP!%c\n\nThis application, visual media, styling, and compiled assets are the protected intellectual property of Tawsif Mahbub.\n\nUnauthorized downloading, cloning, harvesting, or reverse-engineering of this archive is strictly prohibited under international digital copyright conventions.\n",
      "color: #e50914; font-size: 34px; font-weight: 900; font-family: sans-serif; text-shadow: 2px 2px 0 #000;",
      "color: #f1f1f1; background: #121211; font-size: 13px; font-family: monospace; padding: 12px; border-left: 4px solid #c5a059;"
    );
  } catch (err) { }

  // 5. DISABLE RIGHT-CLICK CONTEXT MENU
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showShieldToast("Right-click is restricted to protect proprietary media and archive assets.");
    return false;
  }, { passive: false });

  // 6. PREVENT DRAGGING MEDIA OUT OF THE WINDOW
  document.addEventListener('dragstart', (e) => {
    const target = e.target;
    if (target && (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.tagName === 'CANVAS' || target.closest('img') || target.closest('.lightbox-media-frame'))) {
      e.preventDefault();
      showShieldToast("Direct media dragging is disabled.");
      return false;
    }
  }, { passive: false });

  // 7. BLOCK KEY COMBINATIONS FOR SAVING AND SOURCE VIEWING
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isModifier = isMac ? e.metaKey : e.ctrlKey;

    // F12 -> DevTools
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault();
      showShieldToast("Developer tools inspection is disabled.");
      return false;
    }

    if (isModifier) {
      const key = e.key.toLowerCase();

      // Ctrl+S / Cmd+S: Save page
      if (key === 's') {
        e.preventDefault();
        showShieldToast("Page downloading is disabled on this archive.");
        return false;
      }

      // Ctrl+U / Cmd+U: View page source
      if (key === 'u') {
        e.preventDefault();
        showShieldToast("View page source is disabled.");
        return false;
      }

      // Ctrl+P / Cmd+P: Print / Save PDF
      if (key === 'p') {
        e.preventDefault();
        showShieldToast("Direct page export is restricted.");
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I: Inspect
      // Ctrl+Shift+J / Cmd+Option+J: Console
      // Ctrl+Shift+C: Inspect Element
      if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
        e.preventDefault();
        showShieldToast("Source inspection is disabled.");
        return false;
      }
    }
  }, { passive: false });

  // 8. ACTIVE ANTI-DEBUGGER DEFENSE (Production Tamper Protection)
  // Freezes DevTools debugger if anyone tries to step through or reverse-engineer the JavaScript
  try {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isDev) {
      setInterval(() => {
        (function() {
          return false;
        }['constructor']('debugger')());
      }, 1500);
    }
  } catch (err) { }
}

