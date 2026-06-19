/* GymSync — Attendance Routes (Phase 3D) */
import { Router } from 'express';
import db from '../db.js';

const router = Router();

// POST /api/attendance/checkin
router.post('/checkin', (req, res) => {
  try {
    const { member_id, branch_id } = req.body;
    if (!member_id) return res.status(400).json({ success: false, error: 'member_id required' });

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(member_id);
    if (!member) return res.status(404).json({ success: false, error: 'Member not found' });

    const bId = branch_id || member.branch_id;
    const result = db.prepare('INSERT INTO attendance (member_id, branch_id, type) VALUES (?,?,?)').run(member_id, bId, 'regular');

    db.prepare("INSERT INTO activity_log (type, message, branch) VALUES ('checkin', ?, ?)").run(
      `${member.name} checked in`, db.prepare('SELECT city FROM branches WHERE id = ?').get(bId)?.city || 'Unknown'
    );
    res.status(201).json({ success: true, data: { id: result.lastInsertRowid, member_id: member_id, branch_id: bId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/attendance/checkout
router.post('/checkout', (req, res) => {
  try {
    const { member_id } = req.body;
    const record = db.prepare("SELECT * FROM attendance WHERE member_id = ? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1").get(member_id);
    if (!record) return res.status(404).json({ success: false, error: 'No active check-in found' });

    db.prepare("UPDATE attendance SET check_out = datetime('now') WHERE id = ?").run(record.id);
    res.json({ success: true, data: { message: 'Checked out successfully' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/attendance
router.get('/', (req, res) => {
  try {
    const { date, branch_id, member_id, page = 1, limit = 50 } = req.query;
    let where = [];
    let params = [];

    if (date) { where.push("date(a.check_in) = ?"); params.push(date); }
    if (branch_id) { where.push("a.branch_id = ?"); params.push(branch_id); }
    if (member_id) { where.push("a.member_id = ?"); params.push(member_id); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const records = db.prepare(`
      SELECT a.*, m.name as member_name, b.city as branch_city
      FROM attendance a LEFT JOIN members m ON a.member_id = m.id LEFT JOIN branches b ON a.branch_id = b.id
      ${whereClause} ORDER BY a.check_in DESC LIMIT ? OFFSET ?
    `).all(...params, Number(limit), Number(offset));

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/attendance/today
router.get('/today', (req, res) => {
  try {
    const today = db.prepare(`
      SELECT b.id, b.city, COUNT(a.id) as count
      FROM branches b LEFT JOIN attendance a ON a.branch_id = b.id AND date(a.check_in) = date('now')
      GROUP BY b.id
    `).all();
    const total = today.reduce((s, r) => s + r.count, 0);
    res.json({ success: true, data: { total, byBranch: today } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/attendance/stats — weekly counts for charts
router.get('/stats', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT date(check_in) as day, branch_id, COUNT(*) as count
      FROM attendance WHERE check_in >= date('now', '-28 days')
      GROUP BY day, branch_id ORDER BY day
    `).all();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
