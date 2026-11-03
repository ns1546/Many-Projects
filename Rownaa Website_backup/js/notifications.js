class NotificationsManager {
    constructor() {
        this.storageKey = 'rownaa_notifications';
    }

    getAll(userId) {
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            if (userId) {
                return data.filter(n => n.userId === userId);
            }
            return data;
        } catch (e) {
            return [];
        }
    }
    
    getUnreadCount(userId) {
        return this.getAll(userId).filter(n => !n.isRead).length;
    }

    addNotification(userId, title, message, type = 'info') {
        const notifs = this.getAll();
        notifs.push({
            id: 'notif-' + Date.now(),
            userId,
            title,
            message,
            type, // 'info', 'success', 'warning', 'error'
            isRead: false,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(this.storageKey, JSON.stringify(notifs));
    }

    markAsRead(userId, notifId) {
        const notifs = this.getAll();
        const n = notifs.find(x => x.id === notifId && x.userId === userId);
        if (n) {
            n.isRead = true;
            localStorage.setItem(this.storageKey, JSON.stringify(notifs));
        }
    }
    
    markAllAsRead(userId) {
        const notifs = this.getAll();
        notifs.forEach(n => {
            if (n.userId === userId) n.isRead = true;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(notifs));
    }
    
    clearAll(userId) {
        let notifs = this.getAll();
        notifs = notifs.filter(n => n.userId !== userId);
        localStorage.setItem(this.storageKey, JSON.stringify(notifs));
    }
}

window.NotificationsManager = new NotificationsManager();

// Helper to render notifications in the dropdown
window.renderNotifications = function(userId, containerId, badgeId) {
    if(!window.NotificationsManager) return;
    const container = document.getElementById(containerId);
    const badge = document.getElementById(badgeId);
    
    const unreadCount = window.NotificationsManager.getUnreadCount(userId);
    if(badge) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    if(!container) return;
    
    let notifs = window.NotificationsManager.getAll(userId);
    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if(notifs.length === 0) {
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
