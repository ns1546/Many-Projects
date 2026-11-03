const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static website files from the current directory
app.use(express.static(__dirname));

// Serve the Admin Panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Database file paths
const DB_PATH = path.join(__dirname, 'database.json');
const USERS_PATH = path.join(__dirname, 'users.json');

// Initialize content database if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
    const initialData = {
        works: [
            { id: Date.now(), title: "Kothay Pabo Tare", category: "OST / Composition", link: "https://www.youtube.com/watch?v=f023KdTlYBk" },
            { id: Date.now() + 1, title: "Ridoy Nayer Boitha", category: "BGM Soundtrack", link: "https://www.youtube.com/watch?v=PwU--Y4GWJg" }
        ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

// Initialize users database if it doesn't exist
if (!fs.existsSync(USERS_PATH)) {
    const initialUsers = [
        {
            id: 'admin_1',
            email: 'admin@jkhjesan.com',
            password: 'admin', // Default password
            role: 'admin', // roles: admin, moderator, pending
            permissions: ['all']
        }
    ];
    fs.writeFileSync(USERS_PATH, JSON.stringify(initialUsers, null, 2));
}

function getUsers() {
    return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        if (user.role === 'pending') {
            return res.status(403).json({ success: false, message: 'Account pending admin approval.' });
        }
        // Exclude password from response
        const { password, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
});

// Register
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const newUser = {
        id: 'mod_' + Date.now(),
        email,
        password,
        role: 'pending',
        permissions: [] // default no permissions until approved
    };

    users.push(newUser);
    saveUsers(users);
    res.json({ success: true, message: 'Registration successful! Waiting for admin approval.' });
});

// Forgot Password
app.post('/api/auth/forgot', (req, res) => {
    const { email } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
        // Since there is no actual email server configured, we will reset it directly and show the user.
        const newPin = Math.floor(100000 + Math.random() * 900000).toString();
        user.password = newPin;
        saveUsers(users);
        res.json({ success: true, message: `Password reset successful. Your new temporary password is: ${newPin}` });
    } else {
        res.status(404).json({ success: false, message: 'Email not found.' });
    }
});

// Update Profile (Change email/password)
app.post('/api/auth/update', (req, res) => {
    const { userId, newEmail, newPassword } = req.body;
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
        if (newEmail) users[index].email = newEmail;
        if (newPassword) users[index].password = newPassword;
        saveUsers(users);
        const { password, ...safeUser } = users[index];
        res.json({ success: true, user: safeUser });
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
});

// Admin: Get all users
app.post('/api/admin/users', (req, res) => {
    const { adminId } = req.body;
    const users = getUsers();
    const admin = users.find(u => u.id === adminId && u.role === 'admin');

    if (admin) {
        // Filter out passwords
        const safeUsers = users.map(u => ({ id: u.id, email: u.email, role: u.role, permissions: u.permissions }));
        res.json({ success: true, users: safeUsers });
    } else {
        res.status(403).json({ success: false, message: 'Unauthorized.' });
    }
});

// Admin: Update user role/permissions
app.post('/api/admin/update-user', (req, res) => {
    const { adminId, targetUserId, newRole, newPermissions } = req.body;
    const users = getUsers();
    const admin = users.find(u => u.id === adminId && u.role === 'admin');

    if (admin) {
        const targetIndex = users.findIndex(u => u.id === targetUserId);
        if (targetIndex !== -1) {
            if (newRole) users[targetIndex].role = newRole;
            if (newPermissions) users[targetIndex].permissions = newPermissions;
            saveUsers(users);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } else {
        res.status(403).json({ success: false, message: 'Unauthorized.' });
    }
});

// Admin: Delete user
app.post('/api/admin/delete-user', (req, res) => {
    const { adminId, targetUserId } = req.body;
    let users = getUsers();
    const admin = users.find(u => u.id === adminId && u.role === 'admin');

    if (admin) {
        if (targetUserId === adminId) return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
        users = users.filter(u => u.id !== targetUserId);
        saveUsers(users);
        res.json({ success: true });
    } else {
        res.status(403).json({ success: false, message: 'Unauthorized.' });
    }
});


// ==========================================
// CONTENT ENDPOINTS
// ==========================================

// Get all data
app.get('/api/data', (req, res) => {
    let data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    
    let modified = false;
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    // Auto-clean trash
    if (data.trash) {
        const originalLength = data.trash.length;
        data.trash = data.trash.filter(item => (now - item.deletedAt) < thirtyDays);
        if (data.trash.length !== originalLength) modified = true;
    } else { data.trash = []; modified = true; }
    
    // Auto-clean history
    if (data.history) {
        const originalLength = data.history.length;
        data.history = data.history.filter(item => (now - item.savedAt) < thirtyDays);
        if (data.history.length !== originalLength) modified = true;
    } else { data.history = []; modified = true; }

    if (modified) fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

    res.json(data);
});

// Update data
app.post('/api/data', (req, res) => {
    const { userId, data } = req.body;
    const users = getUsers();
    const user = users.find(u => u.id === userId && (u.role === 'admin' || u.role === 'moderator'));

    if (user) {
        // Optional: Check permissions array here if you want granular access (e.g. user.permissions.includes('edit_works'))
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized to save content.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 JKH JESAN CMS & AUTH SERVER RUNNING!`);
    console.log(`🌐 Live Website: http://localhost:${PORT}/index%20-%20Copy%20(2).html`);
    console.log(`🔒 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`=========================================`);
});
