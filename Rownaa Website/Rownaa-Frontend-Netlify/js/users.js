// =========================================================
// ROWNAA USERS JS (Customers & Registrations)
// Connects to Users Microservice
// =========================================================

const DEMO_CUSTOMERS_FALLBACK = [
  { id: 'cust-001', name: 'Tanvir Ahmed', username: 'tanvir@gmail.com', phone: '+880 1712-345678', createdAt: new Date().toISOString() },
  { id: 'cust-002', name: 'Nafis Iqbal', username: 'nafis@gmail.com', phone: '+880 1819-234567', createdAt: new Date().toISOString() },
  { id: 'cust-003', name: 'Sadia Rahman', username: 'sadia@gmail.com', phone: '+880 1911-876543', createdAt: new Date().toISOString() }
];

const DEMO_OWNERS_FALLBACK = [
  { id: 'owner-001', name: 'Apex Fleet Logistics', username: 'apex.fleet@rownaa.com', role: 'owner', status: 'approved' },
  { id: 'owner-002', name: 'Dhaka Chauffeur Prime', username: 'dhaka.prime@rownaa.com', role: 'owner', status: 'approved' },
  { id: 'owner-003', name: 'Bengal VIP Transport', username: 'bengal.vip@rownaa.com', role: 'owner', status: 'pending' }
];

async function fetchCustomers() {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        return DEMO_CUSTOMERS_FALLBACK;
    }
    try {
        const res = await fetch('/api/users/customers');
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        return data.customers || [];
    } catch (err) {
        console.warn('Network fetchCustomers fallback:', err);
        return DEMO_CUSTOMERS_FALLBACK;
    }
}

async function fetchOwners() {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        return DEMO_OWNERS_FALLBACK;
    }
    try {
        const res = await fetch('/api/users/registrations'); // changed to fetch all to see pending
        if (!res.ok) throw new Error('Failed to fetch owners');
        const data = await res.json();
        return data.registrations ? data.registrations.filter(r => r.role === 'owner') : [];
    } catch (err) {
        console.warn('Network fetchOwners fallback:', err);
        return DEMO_OWNERS_FALLBACK;
    }
}

window.updateUserStatus = async function(id, status) {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        const o = DEMO_OWNERS_FALLBACK.find(x => x.id === id);
        if (o) o.status = status;
        renderAdminRegistrations();
        return;
    }
    try {
        const res = await fetch(`/api/users/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            renderAdminRegistrations();
        } else {
            alert("Failed to update status");
        }
    } catch (err) {
        console.error(err);
    }
}

async function renderAdminCustomers() {
    if (typeof window.renderAdminCustomerList === 'function') {
        return window.renderAdminCustomerList();
    }
    const list = document.getElementById('admin-customer-list');
    if (!list) return;

    const customers = await fetchCustomers();
    list.innerHTML = '';
    
    if (customers.length === 0) {
        list.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:24px">No customers found</td></tr>`;
        return;
    }

    customers.forEach(c => {
        const rawName = c.name || '';
        const cleanName = rawName.replace(/<[^>]*>/g, '').trim() || (c.username ? 'Customer ' + c.username.slice(0, 8) : 'Verified Customer');
        const safeName = cleanName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const safeUsername = (c.username || 'customer@rownaa.com').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const safePhone = (c.phone || '+880 1712-345678').replace(/"/g, '&quot;');
        const emailDisplay = c.username && c.username.includes('@') ? c.username : `${c.username || 'user'}@rownaa.com`;
        const joinedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 2026';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:32px; height:32px; border-radius:50%; background:var(--bg-elevated); border:1px solid var(--border-strong); display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--accent); font-size:0.75rem;">
                        ${cleanName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight:700; color:var(--text-primary);">${safeName}</div>
                        <div style="font-size:0.72rem; color:var(--text-tertiary); font-family:monospace;">${c.id ? c.id.slice(0, 10) : 'ID-N/A'}</div>
                    </div>
                </div>
            </td>
            <td style="font-family:monospace; font-size:0.85rem; color:var(--text-secondary);">${safePhone}</td>
            <td style="font-size:0.85rem; color:var(--text-secondary);">${emailDisplay}</td>
            <td><span class="status-badge st-ongoing">Active Rider</span></td>
            <td style="font-size:0.85rem; color:var(--text-tertiary);">${joinedDate}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="viewCustomerDetails('${c.id}', '${safeName}', '${safeUsername}', '${safePhone}')">
                    <i class="ph ph-user"></i> View Profile
                </button>
            </td>
        `;
        list.appendChild(tr);
    });
}

async function renderAdminRegistrations() {
    const list = document.getElementById('admin-business-list');
    if (!list) return;

    const owners = await fetchOwners();
    list.innerHTML = '';
    
    if (owners.length === 0) {
        list.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary)">No registrations found</td></tr>`;
        return;
    }

    owners.forEach(o => {
        const tr = document.createElement('tr');
        const statusClass = o.status === 'approved' ? 'st-active' : (o.status === 'rejected' ? 'st-cancelled' : 'st-pending');
        const statusText = o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : 'Pending';
        
        tr.innerHTML = `
            <td style="font-weight:700">${o.name || 'Unknown'}</td>
            <td>${o.role}</td>
            <td>${o.username}</td>
            <td>--</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                ${o.status === 'pending' || !o.status ? `
                <button class="btn btn-outline-success btn-sm" onclick="updateUserStatus('${o.id}', 'approved')">Approve</button>
                <button class="btn btn-outline-danger btn-sm" onclick="updateUserStatus('${o.id}', 'rejected')">Reject</button>
                ` : `
                <button class="btn btn-outline btn-sm" onclick="updateUserStatus('${o.id}', 'pending')">Revoke</button>
                `}
            </td>
        `;
        list.appendChild(tr);
    });
}

// Call these on load if admin panel
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-panel.html')) {
        renderAdminCustomers();
        renderAdminRegistrations();
    }
});

// Expose globally for tab switching
window.renderAdminCustomers = renderAdminCustomers;
window.renderAdminRegistrations = renderAdminRegistrations;
