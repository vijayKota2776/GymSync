/* GymSync — Auth Routes (Phase 3B) */
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { JWT_SECRET, JWT_EXPIRY, authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, branchId: user.branch_id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const { password_hash, ...userData } = user;
    res.json({ success: true, data: { token, user: userData } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/register (admin only)
router.post('/register', authenticate, authorize('admin'), (req, res) => {
  try {
    const { name, email, password, role, branch_id } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ success: false, error: 'Missing required fields' });

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password_hash, role, branch_id) VALUES (?,?,?,?,?)').run(name, email, hash, role, branch_id);
    const user = db.prepare('SELECT id, name, email, role, branch_id, status, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'Email already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, branch_id, status, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
