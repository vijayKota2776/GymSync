/* GymSync — Revenue Routes (Phase 3F) */
import { Router } from 'express';
import db from '../db.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// POST /api/revenue/payments — record a payment
router.post('/payments', authorize('admin', 'manager', 'receptionist'), (req, res) => {
  try {
    const { member_id, amount, category, branch_id, method } = req.body;
    if (!member_id || !amount || !category || !branch_id) return res.status(400).json({ success: false, error: 'Missing required fields' });

    const result = db.prepare('INSERT INTO payments (member_id, amount, category, branch_id, method) VALUES (?,?,?,?,?)').run(member_id, amount, category, branch_id, method || 'upi');

    db.prepare("INSERT INTO activity_log (type, message, branch) VALUES ('payment', ?, ?)").run(
      `Payment of ₹${amount.toLocaleString()} received`, db.prepare('SELECT city FROM branches WHERE id = ?').get(branch_id)?.city || 'Unknown'
    );
    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/revenue/payments — list payments
router.get('/payments', (req, res) => {
  try {
    const { branch_id, category, member_id, page = 1, limit = 50 } = req.query;
    let where = [];
    let params = [];
    if (branch_id) { where.push('p.branch_id = ?'); params.push(branch_id); }
    if (category) { where.push('p.category = ?'); params.push(category); }
    if (member_id) { where.push('p.member_id = ?'); params.push(member_id); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const payments = db.prepare(`
      SELECT p.*, m.name as member_name, b.city as branch_city
      FROM payments p LEFT JOIN members m ON p.member_id = m.id LEFT JOIN branches b ON p.branch_id = b.id
      ${whereClause} ORDER BY p.payment_date DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), Number(offset));
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/revenue/summary — current month totals
router.get('/summary', (req, res) => {
  try {
    const byBranch = db.prepare(`
      SELECT b.id, b.city, COALESCE(SUM(p.amount), 0) as total
      FROM branches b LEFT JOIN payments p ON p.branch_id = b.id AND p.payment_date >= date('now', 'start of month')
      GROUP BY b.id
    `).all();

    const byCategory = db.prepare(`
      SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
      FROM payments WHERE payment_date >= date('now', 'start of month')
      GROUP BY category
    `).all();

    const totalRevenue = byBranch.reduce((s, r) => s + r.total, 0);
    res.json({ success: true, data: { totalRevenue, byBranch, byCategory } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/revenue/trends — last 12 months per branch
router.get('/trends', (req, res) => {
  try {
    const trends = db.prepare(`
      SELECT strftime('%Y-%m', payment_date) as month, branch_id, COALESCE(SUM(amount), 0) as total
      FROM payments WHERE payment_date >= date('now', '-12 months')
      GROUP BY month, branch_id ORDER BY month
    `).all();

    // Organize by branch
    const branches = db.prepare('SELECT id, city, color FROM branches').all();
    const result = {};
    for (const b of branches) { result[b.id] = { label: b.city, color: b.color, data: {} }; }
    for (const r of trends) {
      if (result[r.branch_id]) result[r.branch_id].data[r.month] = r.total;
    }
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/revenue/breakdown — by category percentages
router.get('/breakdown', (req, res) => {
  try {
    const breakdown = db.prepare(`
      SELECT category, SUM(amount) as total FROM payments GROUP BY category ORDER BY total DESC
    `).all();
    const grandTotal = breakdown.reduce((s, r) => s + r.total, 0);
    const withPct = breakdown.map(r => ({ ...r, percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0 }));
    res.json({ success: true, data: { breakdown: withPct, total: grandTotal } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
