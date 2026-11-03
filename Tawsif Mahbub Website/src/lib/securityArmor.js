/**
 * Security Armor & Anti-Tamper Engine
 * File: src/lib/securityArmor.js
 * 
 * Protects frontend assets and source code against unauthorized developer inspection,
 * automated scraping, right-click saving, and manual DevTools activation via browser menus.
 */

export function initSecurityArmor() {
  if (typeof window === 'undefined') return;

  // 1. Block Context Menu (Right-Click) on all elements
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Block Common Inspection & Save Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Opt+I (Inspector)
    // Ctrl+Shift+J / Cmd+Opt+J (Console)
    // Ctrl+Shift+C / Cmd+Opt+C (Element picker)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+Opt+U (View Page Source)
    if ((e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && ['S', 's'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Prevent Drag & Drop of Images / Assets
  document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.nodeName === 'IMG') {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // 4. Anti-Debugging Trap & Manual Browser-Menu DevTools Neutralization
  let devToolsOpen = false;
  let overlayEl = null;

  function showSecurityNotice() {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.id = 'security-devtools-curtain';
    overlayEl.setAttribute('style', `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(13, 13, 12, 0.96);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 2rem;
      box-sizing: border-box;
    `);

    overlayEl.innerHTML = `
      <div style="max-width: 520px; background: #181816; border: 1px solid rgba(229, 9, 20, 0.4); border-radius: 8px; padding: 2.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(229, 9, 20, 0.15); border: 1px solid #e50914; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 24px;">🛡️</div>
        <h2 style="font-size: 1.35rem; font-weight: 800; letter-spacing: 0.05em; color: #ffffff; margin-bottom: 0.75rem; text-transform: uppercase;">Inspection Restricted</h2>
        <p style="font-size: 0.88rem; line-height: 1.6; color: #a3a3a3; margin-bottom: 1.5rem;">
          Developer tools and DOM inspection are restricted on this official archive. Please close Developer Tools to continue viewing this website.
        </p>
        <span style="font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #737373; font-weight: 700;">
          Tawsif Mahbub Official Archive &bull; Intellectual Property Protected
        </span>
      </div>
    `;

    document.body.appendChild(overlayEl);
  }

  function hideSecurityNotice() {
    if (overlayEl && overlayEl.parentNode) {
      overlayEl.parentNode.removeChild(overlayEl);
      overlayEl = null;
    }
  }

  // Active anti-debugger loop:
  // When DevTools is opened from anywhere (including browser settings menu),
  // execution stops on the debugger trap and trips the timing differential.
  function runDebuggerTrap() {
    const t0 = performance.now();
    try {
      // Dynamic invocation resists static pattern scanners
      (function() {
        return false;
      }['constructor']('debugger')());
    } catch (e) {}
    const t1 = performance.now();

    // If execution was paused by open DevTools, delta is significant (> 100ms)
    if (t1 - t0 > 100) {
      devToolsOpen = true;
      showSecurityNotice();
      try {
        console.clear();
        console.log(
          '%cSTOP! %cThis official archive is protected against unauthorized code copying and inspection.',
          'color:#e50914;font-size:24px;font-weight:900;',
          'color:#ffffff;font-size:14px;'
        );
      } catch (e) {}
    } else {
      // Check window outer/inner dimension difference for docked devtools
      const widthDelta = window.outerWidth - window.innerWidth;
      const heightDelta = window.outerHeight - window.innerHeight;
      const isDocked = widthDelta > 170 || heightDelta > 170;

      if (isDocked) {
        devToolsOpen = true;
        showSecurityNotice();
      } else if (devToolsOpen && t1 - t0 < 50) {
        devToolsOpen = false;
        hideSecurityNotice();
      }
    }
  }

  // Run the trap on a randomized, high-frequency interval
  setInterval(runDebuggerTrap, 450);

  // 5. Periodic Console Purge
  setInterval(() => {
    if (devToolsOpen) {
      try {
        console.clear();
      } catch (e) {}
    }
  }, 1500);
}
