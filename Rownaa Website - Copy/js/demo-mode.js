(function() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        let url = args[0];
        if (url instanceof Request) {
            url = url.url;
        }

        if (typeof url === 'string' && url.includes('/api/')) {
            // DEMO AUTH MOCKS
            if (url.includes('/api/login')) {
                let role = 'customer';
                try {
                    const options = args[1];
                    const body = options && options.body ? JSON.parse(options.body) : {};
                    if (body.username === 'admin') role = 'admin';
                    if (body.username === 'owner') role = 'owner';
                } catch(e) {}
                
                const fakeUser = { userId: 'demo', role, name: 'Demo User' };
                localStorage.setItem('demo_user', JSON.stringify(fakeUser));
                
                return new Response(JSON.stringify({ success: true, role, name: 'Demo User' }), { status: 200 });
            }
            if (url.includes('/api/logout')) {
                localStorage.removeItem('demo_user');
                return new Response(JSON.stringify({ success: true }), { status: 200 });
            }
            if (url.includes('/api/me')) {
                const demoUser = localStorage.getItem('demo_user');
                if (demoUser) {
                    return new Response(JSON.stringify({ success: true, user: JSON.parse(demoUser) }), { status: 200 });
                }
                return new Response(JSON.stringify({ error: 'No active session' }), { status: 401 });
            }

            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    showUnderConstruction();
                }
                return response;
            } catch (e) {
                showUnderConstruction();
                return Promise.reject(e);
            }
        }
        return originalFetch(...args);
    };

    function showUnderConstruction() {
        if (document.getElementById('under-construction-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'under-construction-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: '999999',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        });

        overlay.innerHTML = `
            <div style="background: #1a1a1a; padding: 3rem; border-radius: 1rem; border: 1px solid #333; text-align: center; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem; color: #fff;">Under Construction</h2>
                <p style="margin: 0 0 2rem 0; color: #aaa; font-size: 0.9rem; line-height: 1.5;">This backend feature is currently under development. The live demo is showcasing the frontend interface.</p>
                <button id="close-uc-btn" style="background: #d4ff00; color: #000; border: none; padding: 0.75rem 2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: transform 0.2s;">Got it</button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('close-uc-btn').addEventListener('click', () => {
            overlay.remove();
        });
    }
})();
