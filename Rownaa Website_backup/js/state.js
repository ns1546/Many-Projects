
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
window.hydrateStatePromise = hydrateState();
