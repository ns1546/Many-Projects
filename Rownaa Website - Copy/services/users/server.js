const express = require('express');
const cors = require('cors');
const db = require('../../database');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// List all customers
app.get('/customers', (req, res) => {
    db.all("SELECT id, name, username, role FROM users WHERE role = 'customer'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, customers: rows });
    });
});

// List all owners
app.get('/owners', (req, res) => {
    db.all("SELECT id, name, username, role FROM users WHERE role = 'owner'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, owners: rows });
    });
});

// List all registrations (pending, etc - if we add status field in future)
app.get('/registrations', (req, res) => {
    db.all("SELECT id, name, username, role, status FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, registrations: rows });
    });
});

app.put('/:id/status', (req, res) => {
    const { status } = req.body;
    db.run("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'users-service' }));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`users-service running on port ${PORT}`));
