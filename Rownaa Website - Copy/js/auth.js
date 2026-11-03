
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
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
                window.rownaaSession = data.user;
            }
        }
    } catch (e) {
        console.warn('Session verification failed, continuing as guest.');
    }
    
    const path = window.location.pathname;
    
    // Route Guarding
    if (path.includes('admin-panel.html') && (!window.rownaaSession || window.rownaaSession.role !== 'admin')) {
        window.location.href = 'login-sliding.html';
    }
    if (path.includes('customer-panel.html') && (!window.rownaaSession || window.rownaaSession.role !== 'customer')) {
        window.location.href = 'login-sliding.html';
    }
    if (path.includes('owner-panel.html') && (!window.rownaaSession || window.rownaaSession.role !== 'owner')) {
        window.location.href = 'login-sliding.html';
    }
    
    // Header UI updates
    window.addEventListener('DOMContentLoaded', () => {
        if (window.rownaaSession) {
            const signInBtn = document.querySelector('a[href="login-sliding.html"]') || document.querySelector('a[href="login-cinematic.html"]') || document.querySelector('a[href="login.html"]');
            const getStartedBtn = document.querySelector('a[href="register.html"]');
            
            if (signInBtn) {
                signInBtn.textContent = 'Dashboard';
                if(window.rownaaSession.role === 'admin') signInBtn.href = 'admin-panel.html';
                if(window.rownaaSession.role === 'customer') signInBtn.href = 'customer-panel.html';
                if(window.rownaaSession.role === 'owner') signInBtn.href = 'owner-panel.html';
            }
            if (getStartedBtn) {
                getStartedBtn.textContent = 'Sign Out';
                getStartedBtn.href = '#';
                getStartedBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                    window.location.href = 'index.html';
                });
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
            if (res.ok) {
                /* Migrated to HttpOnly */
                return data;
            } else {
                return null;
            }
        } catch (e) {
            console.error('Login error:', e);
            return null;
        }
    };

