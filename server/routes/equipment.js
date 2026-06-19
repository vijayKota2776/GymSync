/* GymSync — Equipment Routes (Phase 3E) */
import { Router } from 'express';
import db from '../db.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// GET /api/equipment
router.get('/', (req, res) => {
  try {
    const { branch_id, status, type } = req.query;
    let where = [];
    let params = [];
    if (branch_id) { where.push('e.branch_id = ?'); params.push(branch_id); }
    if (status) { where.push('e.status = ?'); params.push(status); }
    if (type) { where.push('e.type = ?'); params.push(type); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const equipment = db.prepare(`
      SELECT e.*, b.city as branch_city FROM equipment e
      LEFT JOIN branches b ON e.branch_id = b.id ${whereClause} ORDER BY e.branch_id, e.type, e.name
    `).all(...params);
    res.json({ success: true, data: equipment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/equipment/alerts
router.get('/alerts', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT e.*, b.city as branch_city FROM equipment e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.condition_pct < 30 OR (e.max_hours > 0 AND e.hours_used > e.max_hours * 0.8)
      ORDER BY e.condition_pct ASC
    `).all();
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/equipment/:id
router.get('/:id', (req, res) => {
  try {
    const equip = db.prepare('SELECT e.*, b.city as branch_city FROM equipment e LEFT JOIN branches b ON e.branch_id = b.id WHERE e.id = ?').get(req.params.id);
    if (!equip) return res.status(404).json({ success: false, error: 'Equipment not found' });
    const history = db.prepare('SELECT m.*, u.name as requested_by_name FROM maintenance m LEFT JOIN users u ON m.requested_by = u.id WHERE m.equipment_id = ? ORDER BY m.created_at DESC').all(req.params.id);
    res.json({ success: true, data: { ...equip, maintenance_history: history } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/equipment
router.post('/', authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, type, branch_id, condition_pct, max_hours, purchase_date } = req.body;
    if (!name || !type || !branch_id) return res.status(400).json({ success: false, error: 'name, type, branch_id required' });
    const result = db.prepare('INSERT INTO equipment (name, type, branch_id, condition_pct, max_hours, purchase_date) VALUES (?,?,?,?,?,?)').run(name, type, branch_id, condition_pct || 100, max_hours || 5000, purchase_date || null);
    const equip = db.prepare('SELECT * FROM equipment WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: equip });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/equipment/:id
router.put('/:id', authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Equipment not found' });
    const { name, status, condition_pct, hours_used, last_service } = req.body;
    db.prepare('UPDATE equipment SET name=?, status=?, condition_pct=?, hours_used=?, last_service=? WHERE id=?').run(
      name || existing.name, status || existing.status, condition_pct ?? existing.condition_pct,
      hours_used ?? existing.hours_used, last_service || existing.last_service, req.params.id
    );
    res.json({ success: true, data: db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/equipment/:id/maintenance
router.post('/:id/maintenance', (req, res) => {
  try {
    const { priority, description, assigned_to } = req.body;
    const equip = db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    if (!equip) return res.status(404).json({ success: false, error: 'Equipment not found' });

    const result = db.prepare('INSERT INTO maintenance (equipment_id, requested_by, assigned_to, priority, description) VALUES (?,?,?,?,?)').run(
      req.params.id, req.user.id, assigned_to || null, priority || 'medium', description || ''
    );
    db.prepare("UPDATE equipment SET status = 'maintenance' WHERE id = ?").run(req.params.id);

    db.prepare("INSERT INTO activity_log (type, message, branch) VALUES ('maintenance', ?, ?)").run(
      `Maintenance requested for ${equip.name}`, db.prepare('SELECT city FROM branches WHERE id = ?').get(equip.branch_id)?.city || 'Unknown'
    );
    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
