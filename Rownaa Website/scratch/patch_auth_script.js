const fs = require('fs');
const authPath = 'g:/Download Official/Rownaa Website/js/auth.js';
let content = fs.readFileSync(authPath, 'utf8');

// Ensure window.AppState exists
if (!content.includes('window.AppState =')) {
  content = 'window.AppState = window.AppState || { user: null, inventory: [] };\n' + content;
}

// Find top-level await fetch('/api/me' ...
// Wrap the session check block in an async IIFE
const oldBlock = `    try {
        const headers = {};
        const localToken = localStorage.getItem('rownaa_session_token');
        if (localToken) headers['Authorization'] = \`Bearer \${localToken}\`;

        const res = await fetch('/api/me', { credentials: 'include', headers });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
                window.rownaaSession = data.user;
                try { localStorage.setItem('rownaa_user', JSON.stringify(data.user)); } catch (e) {}
            }
        } else if (res.status === 401 && !localStorage.getItem('rownaa_session_token')) {
            window.rownaaSession = null;
            try { localStorage.removeItem('rownaa_user'); } catch (e) {}
        }
    } catch (e) {
        console.warn('Session verification failed, continuing with cached/guest state.');
    }`;

const newBlock = `    (async function initSession() {
        try {
            const headers = {};
            const localToken = localStorage.getItem('rownaa_session_token');
            if (localToken) headers['Authorization'] = \`Bearer \${localToken}\`;

            const res = await fetch('/api/me', { credentials: 'include', headers });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    window.rownaaSession = data.user;
                    if (window.AppState) window.AppState.user = data.user;
                    try { localStorage.setItem('rownaa_user', JSON.stringify(data.user)); } catch (e) {}
                }
            } else if (res.status === 401 && !localStorage.getItem('rownaa_session_token')) {
                window.rownaaSession = null;
                if (window.AppState) window.AppState.user = null;
                try { localStorage.removeItem('rownaa_user'); } catch (e) {}
            }
        } catch (e) {
            console.warn('Session verification failed, continuing with cached/guest state.');
        }
    })();`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(authPath, content, 'utf8');
  console.log('Successfully patched js/auth.js to remove top-level await!');
} else {
  console.log('Old block not found exactly as string. Manual inspect required.');
}
