window.AppState = window.AppState || { user: null, inventory: [] };
// js/inventory.js
// Handles car inventory using Rownaa API with resilient built-in fallback

const DEFAULT_FLEET = window.DEFAULT_FLEET = [
  {
    id: 'veh-001',
    name: 'Toyota Axio',
    category: 'Sedan (Economy)',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    seats: 4,
    bags: 2,
    hasAc: 1,
    serviceTags: ['hourly', 'airport', 'intercity'],
    baseRate: 1500,
    isActive: 1,
    ownerId: 'biz-001'
  },
  {
    id: 'veh-002',
    name: 'Toyota Premio',
    category: 'Sedan (Premium)',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
    seats: 4,
    bags: 2,
    hasAc: 1,
    serviceTags: ['hourly', 'airport', 'intercity'],
    baseRate: 2000,
    isActive: 1,
    ownerId: 'biz-001'
  },
  {
    id: 'veh-003',
    name: 'Toyota Noah',
    category: 'Microbus',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    seats: 7,
    bags: 4,
    hasAc: 1,
    serviceTags: ['hourly', 'airport', 'intercity', 'tour'],
    baseRate: 2500,
    isActive: 1,
    ownerId: 'biz-001'
  },
  {
    id: 'veh-004',
    name: 'Toyota HiAce',
    category: 'Van / Microbus',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    seats: 11,
    bags: 6,
    hasAc: 1,
    serviceTags: ['hourly', 'airport', 'intercity', 'tour', 'corporate'],
    baseRate: 3500,
    isActive: 1,
    ownerId: 'biz-001'
  },
  {
    id: 'veh-005',
    name: 'Toyota Prado',
    category: 'Luxury SUV',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    seats: 5,
    bags: 3,
    hasAc: 1,
    serviceTags: ['hourly', 'airport', 'intercity', 'corporate', 'event'],
    baseRate: 4500,
    isActive: 1,
    ownerId: 'biz-001'
  }
];

class InventoryManagerClass {
  constructor() {
    // Ensure AppState exists
    if (!window.AppState) window.AppState = { user: null, inventory: [] };
  }

  async getAll(includeDeleted = false) {
    let data = [];
    try {
      if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
        const res = await fetch(`/api/inventory?includeDeleted=${includeDeleted}`, { credentials: 'include' });
        const json = await res.json();
        data = json.data || json || [];
      }
    } catch (e) {
      console.warn('Network inventory fetch failed, using built-in fleet:', e);
    }

    if (!data || data.length === 0) {
      data = JSON.parse(JSON.stringify(DEFAULT_FLEET));
    }

    window.AppState.inventory = data; // Centralized State
    return data;
  }

  async getTrash() {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
        const res = await fetch('/api/inventory?includeDeleted=only', { credentials: 'include' });
        const json = await res.json();
        return json.data || json || [];
      }
    } catch (e) {
      return [];
    }
    return [];
  }
  
  async getPaginated(options = {}) {
    const { page = 1, limit = 10, search = '', category = '', sortBy = 'name', sortOrder = 'asc', includeDeleted = false, ownerId = '', serviceTag = '', zone = '' } = options;
    
    let url = `/api/inventory?includeDeleted=${includeDeleted}`;
    if (ownerId) url += `&ownerId=${ownerId}`;
    
    let cars = [];
    try {
      if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
        const res = await fetch(url, { credentials: 'include' });
        const json = await res.json();
        cars = json.data || json || [];
      }
    } catch (e) {
      console.warn('Inventory network fetch error, falling back to local fleet:', e);
    }

    if (!cars || cars.length === 0) {
      cars = JSON.parse(JSON.stringify(DEFAULT_FLEET));
    }
    if (!window.AppState) window.AppState = { user: null, inventory: [] };
    window.AppState.inventory = cars; // Centralized state sync
    
    if (search) {
      const s = search.toLowerCase();
      cars = cars.filter(c => (c.name && c.name.toLowerCase().includes(s)) || (c.category && c.category.toLowerCase().includes(s)));
    }
    
    if (category) {
      const cat = category.toLowerCase();
      cars = cars.filter(c => c.category && c.category.toLowerCase().includes(cat));
    }

    if (zone && zone !== 'Anywhere') {
      const z = zone.toLowerCase();
      cars = cars.filter(c => !c.zone || c.zone.toLowerCase().includes(z));
    }
    
    if (serviceTag && serviceTag !== 'all' && serviceTag !== 'All Services') {
      cars = cars.filter(c => !c.serviceTags || c.serviceTags.length === 0 || c.serviceTags.includes(serviceTag) || (typeof c.serviceTags === 'string' && c.serviceTags.includes(serviceTag)));
    }
    
    cars.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    const total = cars.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = cars.slice(startIndex, startIndex + limit);
    
    return { data: paginated, total, totalPages, currentPage: page };
  }
  
  async getById(id) {
    // Check state first (Observer Pattern)
    if (window.AppState.inventory.length > 0) {
        const cached = window.AppState.inventory.find(c => c.id === id);
        if (cached) return cached;
    }
    const cars = await this.getAll(true);
    return cars.find(c => c.id === id);
  }

  async add(carData) {
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') return true;
      try {
          const res = await fetch('/api/inventory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(carData)
          });
          return res.ok;
      } catch (err) {
          console.error(err);
          return false;
      }
  }

  async update(id, carData) {
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') return true;
      try {
          const res = await fetch(`/api/inventory/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(carData)
          });
          return res.ok;
      } catch (err) {
          console.error(err);
          return false;
      }
  }

  async delete(id) {
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') return true;
      try {
          const res = await fetch(`/api/inventory/${id}`, {
              method: 'DELETE',
              credentials: 'include'
          });
          return res.ok;
      } catch (err) {
          console.error(err);
          return false;
      }
  }
}

window.InventoryManager = new InventoryManagerClass();
