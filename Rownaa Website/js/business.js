/**
 * BusinessManager - Enterprise User & Partner Registration Management
 * Fully integrated with SQLite users-service (/api/users)
 */

const DEMO_BUSINESSES = [
  { id: 'biz-001', name: 'Apex Fleet Logistics', email: 'apex.fleet@rownaa.com', phone: '+880 1711-223344', fleetSize: 12, city: 'Dhaka', status: 'approved' },
  { id: 'biz-002', name: 'Dhaka Chauffeur Prime', email: 'dhaka.prime@rownaa.com', phone: '+880 1819-556677', fleetSize: 8, city: 'Dhaka', status: 'approved' },
  { id: 'biz-003', name: 'Bengal VIP Transport', email: 'bengal.vip@rownaa.com', phone: '+880 1912-889900', fleetSize: 5, city: 'Chittagong', status: 'pending' }
];

class BusinessManager {
    constructor() {
        this.cache = [];
    }

    async getAll() {
        if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
            this.cache = DEMO_BUSINESSES;
            return this.cache;
        }
        try {
            const res = await fetch('/api/users/registrations', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch registrations');
            const json = await res.json();
            this.cache = json.registrations || [];
            return this.cache;
        } catch (e) {
            console.warn('[BusinessManager] Fallback to demo businesses:', e);
            this.cache = DEMO_BUSINESSES;
            return this.cache;
        }
    }

    async getById(id) {
        if (this.cache.length === 0) {
            await this.getAll();
        }
        return this.cache.find(b => b.id === id) || null;
    }

    async updateStatus(id, newStatus) {
        if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
            const item = this.cache.find(b => b.id === id);
            if (item) item.status = newStatus;
            return true;
        }
        try {
            const res = await fetch(`/api/users/${encodeURIComponent(id)}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                const item = this.cache.find(b => b.id === id);
                if (item) item.status = newStatus;
                return true;
            }
            return false;
        } catch (e) {
            console.error('[BusinessManager] Error updating status:', e);
            return false;
        }
    }

    async getPaginated(options = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            type = ''
        } = options;

        let all = await this.getAll();

        if (status) {
            all = all.filter(b => (b.status || 'pending').toLowerCase() === status.toLowerCase());
        }

        if (type) {
            all = all.filter(b => (b.role || '').toLowerCase() === type.toLowerCase());
        }

        if (search) {
            const s = search.toLowerCase();
            all = all.filter(b => 
                (b.name && b.name.toLowerCase().includes(s)) ||
                (b.username && b.username.toLowerCase().includes(s)) ||
                (b.id && b.id.toLowerCase().includes(s))
            );
        }

        const total = all.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const start = (page - 1) * limit;
        const end = start + limit;
        const data = all.slice(start, end);

        return {
            data,
            total,
            page,
            limit,
            totalPages
        };
    }
}

// Expose globally
window.BusinessManager = new BusinessManager();
