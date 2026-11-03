// js/inventory.js
// Handles car inventory using Rownaa API

class InventoryManagerClass {
  constructor() {
    // Ensure AppState exists
    if (!window.AppState) window.AppState = { user: null, inventory: [] };
  }

  async getAll(includeDeleted = false) {
    try {
      const res = await fetch(`/api/inventory?includeDeleted=${includeDeleted}`, { credentials: 'include' });
      const data = await res.json();
      window.AppState.inventory = data; // Centralized State
      return data;
    } catch (e) {
      console.error('Error fetching inventory', e);
      return [];
    }
  }

  async getTrash() {
    try {
      const res = await fetch('/api/inventory?includeDeleted=only', { credentials: 'include' });
      return await res.json();
    } catch (e) {
      return [];
    }
  }
  
  async getPaginated(options = {}) {
    const { page = 1, limit = 10, search = '', category = '', sortBy = 'name', sortOrder = 'asc', includeDeleted = false, ownerId = '', serviceTag = '', zone = '' } = options;
    
    let url = `/api/inventory?includeDeleted=${includeDeleted}`;
    if (ownerId) url += `&ownerId=${ownerId}`;
    
    let cars = [];
    try {
        const res = await fetch(url, { credentials: 'include' });
        cars = await res.json();
        window.AppState.inventory = cars; // Centralized state sync
    } catch (e) {
        console.error(e);
    }
    
    if (search) {
      const s = search.toLowerCase();
      cars = cars.filter(c => c.name.toLowerCase().includes(s) || (c.category && c.category.toLowerCase().includes(s)));
    }
    
    if (category) cars = cars.filter(c => c.category === category);
    
    if (serviceTag) {
      cars = cars.filter(c => c.serviceTags && c.serviceTags.includes(serviceTag));
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
}

window.InventoryManager = new InventoryManagerClass();
