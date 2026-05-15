require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { authenticateToken, authorizeRoles } = require('./middleware');

const app = express();
app.use(cors());
app.use(express.json());

// Use the secret from your .env or a fallback
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_session_key_99';

// PDF Validation Logic
const validateInputs = (data, res) => {
    const { name, email, password, address } = data;
    if (name && (name.length < 20 || name.length > 60)) {
        return res.status(400).json({ error: "Name must be 20-60 characters." });
    }
    if (address && address.length > 400) {
        return res.status(400).json({ error: "Address max 400 characters." });
    }
    if (password) {
        const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16})/;
        if (!passRegex.test(password)) {
            return res.status(400).json({ error: "Password: 8-16 chars, 1 Upper, 1 Special." });
        }
    }
    return true;
};

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Manual Bypass for Demo accounts - FIXED ROLE AND SECRET
        if ((email === 'admin@platform.com' || email === 'owner@starbucks.com') && password === 'Admin@1234') {
            const role = email.includes('admin') ? 'Admin' : 'StoreOwner';
            // We use a hardcoded ID for bypass or try to find real ID
            const [found] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            const userId = found[0]?.id || 1;
            
            const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({ token, role });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ error: "User not found" });

        const match = await bcrypt.compare(password, users[0].password);
        if (!match) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: users[0].id, role: users[0].role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: users[0].role });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: "Login error" }); 
    }
});

app.post('/api/auth/signup', async (req, res) => {
    if (validateInputs(req.body, res) !== true) return;
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        await db.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, "Normal")', 
            [req.body.name, req.body.email, hash, req.body.address]);
        res.json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: "Email exists" }); }
});

// --- ADMIN DASHBOARD ---
app.get('/api/admin/data', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
    try {
        const { search, sortBy, order } = req.query;
        let uSql = 'SELECT id, name, email, role, address FROM users';
        if (search) uSql += ` WHERE name LIKE '%${search}%' OR email LIKE '%${search}%'`;
        if (sortBy) uSql += ` ORDER BY ${sortBy} ${order || 'ASC'}`;

        const [users] = await db.query(uSql);
        const [stores] = await db.query('SELECT s.*, IFNULL(AVG(r.rating), 0) as overallRating FROM stores s LEFT JOIN ratings r ON s.id = r.store_id GROUP BY s.id');
        
        // FIXED: Renamed u, s, r to match your App.js expectation
        const [[stats]] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as totalUsers, 
                (SELECT COUNT(*) FROM stores) as totalStores, 
                (SELECT COUNT(*) FROM ratings) as totalRatings
        `);

        res.json({ users, stores, stats });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: "Admin data error" }); 
    }
});

app.get('/api/user/stores', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT s.*, IFNULL(AVG(r.rating), 0) as overallRating FROM stores s LEFT JOIN ratings r ON s.id = r.store_id';
        
        // This adds the "WHERE" clause if you type something in the search bar
        if (search) {
            sql += ` WHERE s.name LIKE ? OR s.address LIKE ?`;
            sql += ' GROUP BY s.id';
            const [stores] = await db.query(sql, [`%${search}%`, `%${search}%`]);
            return res.json(stores);
        }

        sql += ' GROUP BY s.id';
        const [stores] = await db.query(sql);
        res.json(stores);
    } catch (err) {
        res.status(500).json({ error: "Search error" });
    }
});

app.post('/api/user/rate', authenticateToken, async (req, res) => {
    const { storeId, rating } = req.body;
    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?', [req.user.id, storeId, rating, rating]);
    res.json({ message: "Updated" });
});

app.get('/api/owner/dashboard', authenticateToken, authorizeRoles('StoreOwner'), async (req, res) => {
    const [stores] = await db.query('SELECT * FROM stores WHERE owner_id = ?', [req.user.id]);
    if (stores.length === 0) return res.json({ ratings: [], averageRating: 0 });
    const [ratings] = await db.query('SELECT r.rating, u.name as userName FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = ?', [stores[0].id]);
    const avg = ratings.reduce((acc, c) => acc + c.rating, 0) / (ratings.length || 1);
    res.json({ ratings, averageRating: avg.toFixed(1), storeName: stores[0].name });
});

app.listen(5000, () => console.log("Backend running on 5000"));