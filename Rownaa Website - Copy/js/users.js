// =========================================================
// ROWNAA USERS JS (Customers & Registrations)
// Connects to Users Microservice
// =========================================================

async function fetchCustomers() {
    try {
        const res = await fetch('/api/users/customers');
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        return data.customers || [];
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function fetchOwners() {
    try {
        const res = await fetch('/api/users/registrations'); // changed to fetch all to see pending
        if (!res.ok) throw new Error('Failed to fetch owners');
        const data = await res.json();
        return data.registrations ? data.registrations.filter(r => r.role === 'owner') : [];
    } catch (err) {
        console.error(err);
        return [];
    }
}

window.updateUserStatus = async function(id, status) {
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
    const list = document.getElementById('admin-customer-list');
    if (!list) return;

    const customers = await fetchCustomers();
    list.innerHTML = '';
    
    if (customers.length === 0) {
        list.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary)">No customers found</td></tr>`;
        return;
    }

    customers.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:700">${c.name || 'Unknown'}</td>
            <td>${c.username || 'N/A'}</td>
            <td><span style="color:var(--text-tertiary);font-style:italic">Protected</span></td>
            <td>--</td>
            <td>--</td>
            <td><button class="btn btn-outline btn-sm">View Profile</button></td>
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
