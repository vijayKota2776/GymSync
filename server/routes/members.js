/* GymSync — Member Routes (Phase 3C) */
import { Router } from 'express';
import db from '../db.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// GET /api/members — paginated list with filters
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 20, branch_id, plan, status, search } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];

    if (branch_id) { where.push('m.branch_id = ?'); params.push(branch_id); }
    if (plan) { where.push('m.plan = ?'); params.push(plan); }
    if (status) { where.push('m.status = ?'); params.push(status); }
    if (search) { where.push("(m.name LIKE ? OR m.email LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as c FROM members m ${whereClause}`).get(...params).c;
    const members = db.prepare(`
      SELECT m.*, b.name as branch_name, b.city as branch_city
      FROM members m LEFT JOIN branches b ON m.branch_id = b.id
      ${whereClause} ORDER BY m.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), Number(offset));

    res.json({ success: true, data: { members, total, page: Number(page), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members/:id
router.get('/:id', (req, res) => {
  try {
    const member = db.prepare(`
      SELECT m.*, b.name as branch_name FROM members m
      LEFT JOIN branches b ON m.branch_id = b.id WHERE m.id = ?
    `).get(req.params.id);
    if (!member) return res.status(404).json({ success: false, error: 'Member not found' });

    const attendance = db.prepare('SELECT * FROM attendance WHERE member_id = ? ORDER BY check_in DESC LIMIT 20').all(req.params.id);
    const payments = db.prepare('SELECT * FROM payments WHERE member_id = ? ORDER BY payment_date DESC LIMIT 10').all(req.params.id);
    res.json({ success: true, data: { ...member, attendance, payments } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/members
router.post('/', authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, email, phone, plan, branch_id, status } = req.body;
    if (!name || !email || !plan || !branch_id) return res.status(400).json({ success: false, error: 'Missing required fields' });

    const result = db.prepare('INSERT INTO members (name, email, phone, plan, branch_id, status) VALUES (?,?,?,?,?,?)').run(name, email, phone || null, plan, branch_id, status || 'active');
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);

    db.prepare("INSERT INTO activity_log (type, message, branch) VALUES ('member', ?, ?)").run(`New member: ${name}`, db.prepare('SELECT city FROM branches WHERE id = ?').get(branch_id)?.city || 'Unknown');
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'Email already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/members/:id
router.put('/:id', authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, email, phone, plan, branch_id, status, churn_risk, activity_rate } = req.body;
    const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Member not found' });

    db.prepare(`UPDATE members SET name=?, email=?, phone=?, plan=?, branch_id=?, status=?, churn_risk=?, activity_rate=? WHERE id=?`).run(
      name || existing.name, email || existing.email, phone ?? existing.phone, plan || existing.plan,
      branch_id || existing.branch_id, status || existing.status, churn_risk ?? existing.churn_risk,
      activity_rate ?? existing.activity_rate, req.params.id
    );
    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/members/:id (soft delete)
router.delete('/:id', authorize('admin'), (req, res) => {
  try {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!member) return res.status(404).json({ success: false, error: 'Member not found' });
    db.prepare("UPDATE members SET status = 'inactive' WHERE id = ?").run(req.params.id);
    res.json({ success: true, data: { message: 'Member deactivated' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
