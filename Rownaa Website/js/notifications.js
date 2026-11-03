// =========================================================
// ROWNAA NOTIFICATIONS CLIENT ENGINE
// Connects to /api/notifications with live SQLite persistence
// =========================================================

class NotificationsManager {
    constructor() {
        this.cache = [];
        this.unreadCount = 0;
    }

    async fetchAll(userId) {
        if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
            return this.cache;
        }
        try {
            const url = userId ? `/api/notifications?userId=${encodeURIComponent(userId)}` : '/api/notifications';
            const res = await fetch(url, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                this.cache = data.notifications || [];
                this.unreadCount = data.unreadCount || 0;
                return this.cache;
            }
        } catch (e) {
            console.warn('Notifications fetch error:', e);
        }
        return this.cache;
    }

    getAll(userId) {
        if (userId) {
            return this.cache.filter(n => n.userId === userId);
        }
        return this.cache;
    }

    getUnreadCount(userId) {
        return this.unreadCount;
    }

    async addNotification(userId, title, message, type = 'info') {
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId, title, message, type })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.notification) {
                    this.cache.unshift(data.notification);
                    this.unreadCount++;
                }
                return data.notification;
            }
        } catch (e) {
            console.warn('Add notification failed:', e);
        }
    }

    async markAsRead(userId, notifId) {
        const item = this.cache.find(n => n.id === notifId);
        if (item) item.isRead = true;
        if (this.unreadCount > 0) this.unreadCount--;

        try {
            await fetch(`/api/notifications/${notifId}/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId })
            });
        } catch (e) {}
    }

    async markAllAsRead(userId) {
        this.cache.forEach(n => { n.isRead = true; });
        this.unreadCount = 0;

        try {
            await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId })
            });
        } catch (e) {}
    }

    async clearAll(userId) {
        this.cache = [];
        this.unreadCount = 0;

        try {
            await fetch(`/api/notifications?userId=${encodeURIComponent(userId || '')}`, {
                method: 'DELETE',
                credentials: 'include'
            });
        } catch (e) {}
    }
}

window.NotificationsManager = new NotificationsManager();

// Helper to render notifications in the dropdown
window.renderNotifications = async function(userId, containerId, badgeId) {
    if (!window.NotificationsManager) return;
    const container = document.getElementById(containerId);
    const badge = document.getElementById(badgeId);

    const notifs = await window.NotificationsManager.fetchAll(userId);
    const unreadCount = window.NotificationsManager.getUnreadCount(userId);

    if (badge) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    if (!container) return;

    if (notifs.length === 0) {
        container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-tertiary)">No new notifications</div>';
        return;
    }

    let html = '';
    notifs.slice(0, 5).forEach(n => {
        const iconColor = n.type === 'success' ? 'var(--success)' : (n.type === 'warning' ? 'var(--warning)' : 'var(--accent)');
        const bgStyle = n.isRead ? '' : 'background:var(--bg-base); border-left: 3px solid var(--accent);';
        html += `
            <div style="padding:12px; border-bottom:1px solid var(--border-subtle); cursor:pointer; ${bgStyle}" onclick="window.NotificationsManager.markAsRead('${userId}', '${n.id}'); window.renderNotifications('${userId}', '${containerId}', '${badgeId}');">
                <div style="font-weight:600; font-size:0.9rem; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
                    <i class="ph-fill ph-bell" style="color:${iconColor}"></i> ${n.title}
                </div>
                <div style="font-size:0.8rem; color:var(--text-secondary)">${n.message}</div>
                <div style="font-size:0.7rem; color:var(--text-tertiary); margin-top:6px">${new Date(n.createdAt).toLocaleTimeString()}</div>
            </div>
        `;
    });

    html += `<div style="padding:12px;text-align:center;font-size:0.85rem;color:var(--accent);cursor:pointer;font-weight:600" onclick="window.NotificationsManager.markAllAsRead('${userId}'); window.renderNotifications('${userId}', '${containerId}', '${badgeId}')">Mark all as read</div>`;
    container.innerHTML = html;
};

window.markAsRead = function(userId, notifId) {
    if (window.NotificationsManager) return window.NotificationsManager.markAsRead(userId, notifId);
};

window.markAllAsRead = function(userId) {
    if (window.NotificationsManager) return window.NotificationsManager.markAllAsRead(userId);
};
