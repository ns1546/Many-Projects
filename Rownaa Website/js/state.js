// Enterprise State Management Layer
window.AppState = window.AppState || { user: null, inventory: [], socket: null };

async function hydrateState() {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        try {
            const stored = localStorage.getItem('rownaa_user');
            if (stored) window.AppState.user = JSON.parse(stored);
        } catch(e) {}
        return;
    }

    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            window.AppState.user = data.user;
            console.log("[State] Hydrated with HttpOnly Session", data.user);
            
            // Connect to Real-Time Sockets if available
            const ioClient = window.io || (typeof io !== 'undefined' ? io : null);
            if (ioClient && typeof ioClient === 'function') {
                const socket = ioClient('/', { path: '/socket.io' });
                window.AppState.socket = socket;
                
                socket.on('booking_updated', (booking) => {
                    console.log('Real-Time Booking Update Received:', booking);
                    window.dispatchEvent(new CustomEvent('bookingUpdated', { detail: booking }));
                });
                
                socket.on('booking_created', (booking) => {
                    console.log('Real-Time Booking Created Received:', booking);
                    window.dispatchEvent(new CustomEvent('bookingCreated', { detail: booking }));
                });
            }
        }
    } catch (e) {
        console.warn("[State] Hydration warning:", e);
    }
}

window.hydrateStatePromise = hydrateState();
