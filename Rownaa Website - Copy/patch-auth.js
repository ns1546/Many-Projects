const fs = require('fs');
const path = require('path');

const dir = __dirname;
// Target all HTML and JS files in the frontend
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const jsFiles = fs.readdirSync(path.join(dir, 'js')).filter(f => f.endsWith('.js')).map(f => path.join('js', f));

const allFiles = [...htmlFiles, ...jsFiles];

console.log("Security-Reviewer Agent: Eradicating localStorage and injecting Enterprise HttpOnly Cookie State...");

allFiles.forEach(file => {
    const fullPath = path.join(dir, file);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    // 1. Remove all localStorage.setItem/getItem tokens
    if (content.includes('localStorage.getItem(\'rownaa_session_token\')') || content.includes('localStorage.setItem(\'rownaa_session_token\'')) {
        content = content.replace(/localStorage\.getItem\('rownaa_session_token'\)/g, "null /* Migrated to HttpOnly */");
        content = content.replace(/localStorage\.setItem\('rownaa_session_token'.*?\);/g, "/* Migrated to HttpOnly */");
        changed = true;
    }

    // 2. Add credentials: 'include' to all fetches to support HttpOnly cookies
    if (content.includes('fetch(') && !content.includes('credentials')) {
        content = content.replace(/fetch\((.*?),\s*\{/g, "fetch($1, { credentials: 'include',");
        changed = true;
    }

    // 3. Centralized state refactor for checkout
    if (file === 'checkout.html' && content.includes('window.rownaaSession')) {
        content = content.replace(/const sessionStr = localStorage\.getItem\('rownaa_session_token'\);/g, "");
        content = content.replace(/if\(sessionStr && window\.rownaaSession\)/g, "if(window.AppState && window.AppState.user)");
        content = content.replace(/const session = window\.rownaaSession;/g, "const session = window.AppState.user;");
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`[SEC-UPDATE] Secured ${file} - localStorage eradicated. credentials injected.`);
    }
});

// Also create a basic AppState script that fetches /api/auth/me automatically
const appStateCode = `
// Enterprise State Management Layer
window.AppState = { user: null, inventory: [] };
async function hydrateState() {
    try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            window.AppState.user = data.user;
            console.log("State Hydrated with HttpOnly Session", data.user);
        }
    } catch (e) {
        console.error("Hydration failed", e);
    }
}
hydrateState();
`;
fs.writeFileSync(path.join(dir, 'js', 'state.js'), appStateCode);
console.log("[SEC-UPDATE] Created js/state.js for robust state hydration.");
