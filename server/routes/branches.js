/* GymSync — Branch Routes (Phase 3A) */
import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/branches
router.get('/', (req, res) => {
  try {
    const branches = db.prepare(`
      SELECT b.*,
        (SELECT COUNT(*) FROM members m WHERE m.branch_id = b.id AND m.status != 'inactive') as currentMembers,
        (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.branch_id = b.id AND p.payment_date >= date('now', 'start of month')) as monthlyRevenue,
        (SELECT COUNT(*) FROM attendance a WHERE a.branch_id = b.id AND date(a.check_in) = date('now')) as checkInsToday,
        (SELECT COUNT(*) FROM equipment e WHERE e.branch_id = b.id) as equipmentCount,
        (SELECT COUNT(*) FROM equipment e WHERE e.branch_id = b.id AND e.status = 'maintenance') as maintenancePending,
        (SELECT name FROM users u WHERE u.branch_id = b.id AND u.role IN ('admin','manager') LIMIT 1) as manager
      FROM branches b
    `).all();
    res.json({ success: true, data: branches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/branches/:id
router.get('/:id', (req, res) => {
  try {
    const branch = db.prepare('SELECT * FROM branches WHERE id = ?').get(req.params.id);
    if (!branch) return res.status(404).json({ success: false, error: 'Branch not found' });

    const staff = db.prepare('SELECT id, name, email, role, status FROM users WHERE branch_id = ?').all(req.params.id);
    const equipment = db.prepare('SELECT * FROM equipment WHERE branch_id = ?').all(req.params.id);
    res.json({ success: true, data: { ...branch, staff, equipment } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/branches/:id/stats
router.get('/:id/stats', (req, res) => {
  try {
    const id = req.params.id;
    const members = db.prepare("SELECT COUNT(*) as count FROM members WHERE branch_id = ? AND status != 'inactive'").get(id);
    const revenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE branch_id = ? AND payment_date >= date('now', 'start of month')").get(id);
    const checkIns = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE branch_id = ? AND date(check_in) = date('now')").get(id);
    res.json({ success: true, data: { members: members.count, revenue: revenue.total, checkInsToday: checkIns.count } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
