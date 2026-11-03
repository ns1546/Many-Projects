window.AppState = window.AppState || { user: null, inventory: [] };

    // Basic JWT decode helper
    function decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    window.rownaaSession = null;

    // Check cached session fallback
    try {
        const cachedUser = localStorage.getItem('rownaa_user');
        if (cachedUser) window.rownaaSession = JSON.parse(cachedUser);
    } catch (e) {}

    window.hydrateStatePromise = (async function initSession() {
        try {
            const headers = {};
            const localToken = localStorage.getItem('rownaa_session_token');
            if (localToken) headers['Authorization'] = `Bearer ${localToken}`;

            if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
                const res = await fetch('/api/me', { credentials: 'include', headers });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.user) {
                        window.rownaaSession = data.user;
                        if (window.AppState) window.AppState.user = data.user;
                        try { localStorage.setItem('rownaa_user', JSON.stringify(data.user)); } catch (e) {}
                    }
                } else if (res.status === 401 && !localStorage.getItem('rownaa_session_token')) {
                    // Do not wipe cached demo user in offline / local development mode
                    if (!window._IS_DEMO_MODE) {
                        window.rownaaSession = null;
                        if (window.AppState) window.AppState.user = null;
                        try { localStorage.removeItem('rownaa_user'); } catch (e) {}
                    }
                }
            }
        } catch (e) {
            console.warn('Session verification fallback to local/cached state:', e);
        }
        return window.rownaaSession;
    })();

    // Role Switching Helper for Testing & Multi-Role Exploration
    window.switchUserSession = function(role, redirect = false) {
        let userObj = null;
        if (role === 'admin') {
            userObj = { id: 'admin', name: 'System Admin', username: 'admin', role: 'admin', status: 'approved' };
        } else if (role === 'owner') {
            userObj = { id: 'biz-001', name: 'Apex Fleet Logistics', username: 'owner', role: 'owner', phone: '01888999000', status: 'Active' };
        } else {
            userObj = { id: 'cust-1', name: 'Tanvir Ahmed', username: 'customer', role: 'customer', phone: '01711223344', status: 'approved' };
        }
        window.rownaaSession = userObj;
        if (window.AppState) window.AppState.user = userObj;
        try {
            localStorage.setItem('rownaa_user', JSON.stringify(userObj));
            localStorage.setItem('rownaa_session_token', 'demo-token-' + role);
        } catch(e) {}

        if (redirect) {
            if (role === 'admin') window.location.href = 'admin-panel.html';
            else if (role === 'owner') window.location.href = 'owner-panel.html';
            else window.location.href = 'customer-panel.html';
        }
    };
    
    // Header UI updates (Seamlessly merges website & customer portal)
    window.addEventListener('DOMContentLoaded', () => {
        if (window.rownaaSession) {
            const role = window.rownaaSession.role || 'customer';
            const name = window.rownaaSession.name || 'Member';
            const targetPanel = role === 'admin' ? 'admin-panel.html' : (role === 'owner' ? 'owner-panel.html' : 'customer-panel.html');

            const signInBtn = document.querySelector('a[href="login-sliding.html"]') || document.querySelector('a[href="login-cinematic.html"]') || document.querySelector('a[href="login.html"]');
            const getStartedBtn = document.querySelector('a[href="register.html"]');
            
            if (signInBtn) {
                signInBtn.innerHTML = `<i class="ph-bold ph-squares-four"></i> ${role === 'customer' ? 'Customer Panel' : 'Dashboard'}`;
                signInBtn.href = targetPanel;
            }
            if (getStartedBtn) {
                getStartedBtn.innerHTML = `<i class="ph-bold ph-sign-out"></i> Sign Out`;
                getStartedBtn.href = '#';
                getStartedBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                    try { localStorage.removeItem('rownaa_user'); localStorage.removeItem('rownaa_session_token'); } catch (err) {}
                    window.location.href = 'index.html';
                });
            }

            // Sync Find-Cars Header
            const fcAuthNav = document.getElementById('fc-auth-nav');
            if (fcAuthNav) {
                fcAuthNav.innerHTML = `
                    <a href="${targetPanel}" class="nav-link" style="color:var(--accent);font-weight:700;"><i class="ph-bold ph-user"></i> ${name.split(' ')[0]} (${role === 'customer' ? 'Panel' : role})</a>
                    <a href="javascript:void(0)" onclick="rownaaLogout()" class="nav-link" style="color:var(--text-tertiary);"><i class="ph ph-sign-out"></i></a>
                `;
            }
        }
    });

    window.rownaaLogin = async function(username, password) {
        try {
            const res = await fetch('/api/login', { credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok && (data.success || data.token)) {
                if (data.token) {
                    try { localStorage.setItem('rownaa_session_token', data.token); } catch (e) {}
                }
                if (data.user) {
                    try { localStorage.setItem('rownaa_user', JSON.stringify(data.user)); } catch (e) {}
                    window.rownaaSession = data.user;
                }
                return data;
            } else {
                return null;
            }
        } catch (e) {
            console.error('Login error:', e);
            return null;
        }
    };

    window.rownaaLogout = async function() {
        try {
            try {
                localStorage.removeItem('rownaa_session_token');
                localStorage.removeItem('rownaa_user');
            } catch (e) {}
            window.rownaaSession = null;
            if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
            }
        } catch (e) {
            console.error('Logout error:', e);
        }
        window.location.href = 'index.html';
    };

    // =========================================================
    // UNIVERSAL ROLE DOCK & HUMAN EXPLORATION SUITE
    // =========================================================
    function injectRoleDock() {
        if (typeof document === 'undefined' || document.getElementById('rownaa-dev-dock')) return;
        if (window.DISABLE_ROLE_DOCK) return;

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath.includes('driver-register')) return; // Do not inject dev dock on driver registration intake

        const dock = document.createElement('div');
        dock.id = 'rownaa-dev-dock';
        dock.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 24px;
            left: auto;
            transform: none;
            background: rgba(16, 16, 20, 0.88);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 9999px;
            padding: 6px 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.15);
            z-index: 99999;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            font-size: 0.75rem;
            color: #fff;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        const activeRole = (window.rownaaSession && window.rownaaSession.role) || (currentPath.includes('admin') ? 'admin' : (currentPath.includes('owner') ? 'owner' : (currentPath.includes('customer') ? 'customer' : 'guest')));

        dock.innerHTML = `
            <div id="rownaa-dock-content" style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 800; color: #d4ff00; letter-spacing: 0.08em; font-size: 0.68rem; padding: 0 4px; display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background: #d4ff00; box-shadow: 0 0 10px #d4ff00; display: inline-block;"></span> ROLE
                </span>
                <button type="button" onclick="window.switchUserSession('customer', true)" style="background: ${activeRole === 'customer' ? '#d4ff00' : 'rgba(255,255,255,0.06)'}; color: ${activeRole === 'customer' ? '#000' : '#f4f4f5'}; border: 1px solid ${activeRole === 'customer' ? '#d4ff00' : 'rgba(255,255,255,0.1)'}; padding: 5px 12px; border-radius: 9999px; font-weight: 700; font-size: 0.72rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Switch to Customer Role">
                    👤 Passenger
                </button>
                <button type="button" onclick="window.switchUserSession('owner', true)" style="background: ${activeRole === 'owner' ? '#d4ff00' : 'rgba(255,255,255,0.06)'}; color: ${activeRole === 'owner' ? '#000' : '#f4f4f5'}; border: 1px solid ${activeRole === 'owner' ? '#d4ff00' : 'rgba(255,255,255,0.1)'}; padding: 5px 12px; border-radius: 9999px; font-weight: 700; font-size: 0.72rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Switch to Fleet Partner Role">
                    🚗 Fleet Owner
                </button>
                <button type="button" onclick="window.switchUserSession('admin', true)" style="background: ${activeRole === 'admin' ? '#d4ff00' : 'rgba(255,255,255,0.06)'}; color: ${activeRole === 'admin' ? '#000' : '#f4f4f5'}; border: 1px solid ${activeRole === 'admin' ? '#d4ff00' : 'rgba(255,255,255,0.1)'}; padding: 5px 12px; border-radius: 9999px; font-weight: 700; font-size: 0.72rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Switch to Super Admin Command Center">
                    👑 Admin Ops
                </button>
                <button type="button" onclick="window.location.href='index.html'" style="background: rgba(255,255,255,0.05); color: #a1a1aa; border: 1px solid rgba(255,255,255,0.08); padding: 5px 10px; border-radius: 9999px; cursor: pointer; font-weight: 600; font-size: 0.72rem; transition: 0.2s;" title="Return to Main Website">
                    🌐 Home
                </button>
                <button type="button" id="rownaa-dock-min-btn" onclick="toggleDockMinimize()" style="background: transparent; color: #71717a; border: none; padding: 2px 6px; cursor: pointer; font-size: 0.8rem; border-radius: 50%;" title="Minimize Dock">−</button>
            </div>
            <div id="rownaa-dock-minimized" style="display: none; align-items: center; gap: 6px; cursor: pointer;" onclick="toggleDockMinimize()">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #d4ff00; box-shadow: 0 0 10px #d4ff00;"></span>
                <span style="font-weight: 800; color: #d4ff00; font-size: 0.7rem; letter-spacing: 0.05em;">SWITCH ROLE ↗</span>
            </div>
        `;

        window.toggleDockMinimize = function() {
            const content = document.getElementById('rownaa-dock-content');
            const min = document.getElementById('rownaa-dock-minimized');
            if (content.style.display === 'none') {
                content.style.display = 'flex';
                min.style.display = 'none';
                dock.style.padding = '6px 14px';
                dock.style.borderRadius = '9999px';
            } else {
                content.style.display = 'none';
                min.style.display = 'flex';
                dock.style.padding = '6px 12px';
                dock.style.borderRadius = '9999px';
            }
        };

        document.body.appendChild(dock);
    }

    if (typeof window !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectRoleDock);
        } else {
            injectRoleDock();
        }
    }
