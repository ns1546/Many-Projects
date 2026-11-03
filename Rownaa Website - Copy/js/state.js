import { io } from 'socket.io-client';

// Enterprise State Management Layer
window.AppState = { user: null, inventory: [], socket: null };

async function hydrateState() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            window.AppState.user = data.user;
            console.log("State Hydrated with HttpOnly Session", data.user);
            
            // Connect to Real-Time Sockets (Uber standard)
            const socket = io('/', { path: '/socket.io' }); // NGINX will route this to booking service
            window.AppState.socket = socket;
            
            socket.on('booking_updated', (booking) => {
                console.log('Real-Time Booking Update Received:', booking);
                // Dispatch event so all panels (Owner/Customer) can re-render instantly without refresh
                window.dispatchEvent(new CustomEvent('bookingUpdated', { detail: booking }));
            });
            
            socket.on('booking_created', (booking) => {
                console.log('Real-Time Booking Created Received:', booking);
                window.dispatchEvent(new CustomEvent('bookingCreated', { detail: booking }));
            });
        }
    } catch (e) {
        console.error("Hydration failed", e);
    }
}
window.hydrateStatePromise = hydrateState();
