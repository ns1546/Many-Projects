(function() {
    function getToken() {
        return null /* Migrated to HttpOnly */;
    }

    const headers = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    });

    const BookingsManager = {
        getAll: async (includeDeleted = false) => {
            try {
                const res = await fetch(`/api/bookings?includeDeleted=${includeDeleted}`, { credentials: 'include', headers: headers() });
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                return json.data || [];
            } catch(e) { 
                console.error(e);
                return []; 
            }
        },
        getTrash: async () => {
            try {
                const res = await fetch(`/api/bookings?includeDeleted=only`, { credentials: 'include', headers: headers() });
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                return json.data || [];
            } catch(e) {
                return [];
            }
        },
        getById: async (id) => {
            try {
                const res = await fetch(`/api/bookings`, { credentials: 'include', headers: headers() });
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                const all = json.data || [];
                return all.find(b => b.id === id);
            } catch(e) {
                return null;
            }
        },
        getPaginated: async (options = {}) => {
            const { page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', sortOrder = 'desc', includeDeleted = false, ownerId = '', customerId = '' } = options;
            
            try {
                // Fetch all and sort locally for simplicity, though a real app would do this on the server
                let url = `/api/bookings?includeDeleted=${includeDeleted}`;
                if (ownerId) url += `&ownerId=${ownerId}`;
                if (customerId) url += `&customerId=${customerId}`;
                
                const res = await fetch(url, { credentials: 'include', headers: headers() });
                const json = await res.json();
                let bs = json.data || [];
                
                if (status) {
                    bs = bs.filter(b => b.status === status);
                }
                if (search) {
                    const s = search.toLowerCase();
                    bs = bs.filter(b => (b.id && b.id.toLowerCase().includes(s)) || (b.customerName && b.customerName.toLowerCase().includes(s)));
                }
                
                bs.sort((a, b) => {
                    let valA = a[sortBy] || '';
                    let valB = b[sortBy] || '';
                    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });

                const total = bs.length;
                const totalPages = Math.ceil(total / limit);
                const start = (page - 1) * limit;
                const paginated = bs.slice(start, start + limit);
                
                return {
                    data: paginated,
                    total,
                    page,
                    totalPages,
                    limit
                };
            } catch (e) {
                return { data: [], total: 0, page, totalPages: 0, limit };
            }
        },
        sanitize: (str) => {
            if (typeof str !== 'string') return str;
            return str.replace(/[&<>'"]/g, 
                tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
            );
        },
        add: async (booking) => {
            if (booking.customerName) booking.customerName = BookingsManager.sanitize(booking.customerName);
            if (booking.service) booking.service = BookingsManager.sanitize(booking.service);
            
            try {
                const res = await fetch('/api/bookings', { credentials: 'include',
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify(booking)
                });
                const data = await res.json();
                return data.id;
            } catch(e) {
                console.error(e);
                return null;
            }
        },
        updateStatus: async (id, status) => {
            try {
                await fetch(`/api/bookings/${id}/status`, { credentials: 'include',
                    method: 'PATCH',
                    headers: headers(),
                    body: JSON.stringify({ status })
                });
            } catch(e) { console.error(e); }
        },
        softDelete: async (id) => {
            try {
                await fetch(`/api/bookings/${id}`, { credentials: 'include',
                    method: 'DELETE',
                    headers: headers()
                });
            } catch(e) { console.error(e); }
        },
        restore: async (id) => {
            try {
                await fetch(`/api/bookings/${id}/restore`, { credentials: 'include',
                    method: 'PATCH',
                    headers: headers()
                });
            } catch(e) { console.error(e); }
        }
    };
    window.BookingsManager = BookingsManager;
})();
