class BusinessManager {
    constructor() {
        this.storageKey = 'rownaa_businesses';
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem(this.storageKey)) {
            const dummyData = [
                {
                    id: 'biz-001',
                    name: 'Samiul Transport Agency',
                    phone: '+880 1711 223344',
                    type: 'Rental Agency',
                    zone: 'Dhaka',
                    fleetCount: 4,
                    status: 'Pending',
                    submittedAt: 'Oct 12, 09:30 AM',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'biz-002',
                    name: 'Kamrul Hasan',
                    phone: '+880 1819 001122',
                    type: 'Individual',
                    zone: 'Chittagong',
                    fleetCount: 1,
                    status: 'Pending',
                    submittedAt: 'Oct 11, 04:15 PM',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(this.storageKey, JSON.stringify(dummyData));
        }
    }

    getAll() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (e) {
            return [];
        }
    }

    saveAll(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    getById(id) {
        return this.getAll().find(b => b.id === id);
    }

    updateStatus(id, newStatus) {
        let all = this.getAll();
        const idx = all.findIndex(b => b.id === id);
        if (idx !== -1) {
            all[idx].status = newStatus;
            this.saveAll(all);
            return all[idx];
        }
        return null;
    }

    addRegistration(data) {
        let all = this.getAll();
        const newBiz = {
            id: 'biz-' + Math.floor(Math.random()*90000 + 10000),
            name: data.name || 'Unknown',
            phone: data.phone || '',
            type: data.type || 'Individual',
            zone: data.zone || 'Dhaka',
            fleetCount: parseInt(data.fleetCount) || 1,
            status: 'Pending',
            submittedAt: new Date().toLocaleString(),
            createdAt: new Date().toISOString()
        };
        all.push(newBiz);
        this.saveAll(all);
        return newBiz;
    }

    getPaginated(options = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            type = ''
        } = options;

        let all = this.getAll();

        if (status) {
            if (status === 'Pending') all = all.filter(b => b.status === 'Pending');
            else if (status === 'Approved') all = all.filter(b => b.status === 'Approved');
            else if (status === 'Rejected') all = all.filter(b => b.status === 'Rejected');
        }

        if (type) {
            all = all.filter(b => b.type.toLowerCase().includes(type.toLowerCase()));
        }

        if (search) {
            const s = search.toLowerCase();
            all = all.filter(b => 
                (b.name && b.name.toLowerCase().includes(s)) ||
                (b.phone && b.phone.toLowerCase().includes(s)) ||
                (b.id && b.id.toLowerCase().includes(s))
            );
        }

        // Sort newest first
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const total = all.length;
        const totalPages = Math.ceil(total / limit);
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
