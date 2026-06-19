/* GymSync — Workflow Routes (Phase 3H) */
import { Router } from 'express';
import db from '../db.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// POST /api/workflows — create a workflow
router.post('/', (req, res) => {
  try {
    const { type, data_json, notes } = req.body;
    if (!type) return res.status(400).json({ success: false, error: 'type is required' });

    const result = db.prepare('INSERT INTO workflows (type, requester_id, data_json, notes) VALUES (?,?,?,?)').run(
      type, req.user.id, data_json || '{}', notes || ''
    );
    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/workflows — list workflows
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let where = [];
    let params = [];

    // Staff see only their own; manager/admin see all
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      where.push('w.requester_id = ?');
      params.push(req.user.id);
    }
    if (status) { where.push('w.status = ?'); params.push(status); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const workflows = db.prepare(`
      SELECT w.*, u.name as requester_name, a.name as approver_name
      FROM workflows w
      LEFT JOIN users u ON w.requester_id = u.id
      LEFT JOIN users a ON w.approver_id = a.id
      ${whereClause} ORDER BY w.created_at DESC
    `).all(...params);
    res.json({ success: true, data: workflows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/workflows/pending — count for notification badge
router.get('/pending', (req, res) => {
  try {
    let count;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      count = db.prepare("SELECT COUNT(*) as c FROM workflows WHERE status = 'pending'").get().c;
    } else {
      count = db.prepare("SELECT COUNT(*) as c FROM workflows WHERE status = 'pending' AND requester_id = ?").get(req.user.id).c;
    }
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/workflows/:id/approve
router.put('/:id/approve', authorize('admin', 'manager'), (req, res) => {
  try {
    const wf = db.prepare('SELECT * FROM workflows WHERE id = ?').get(req.params.id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });
    if (wf.status !== 'pending') return res.status(400).json({ success: false, error: 'Only pending workflows can be approved' });

    db.prepare("UPDATE workflows SET status = 'approved', approver_id = ?, updated_at = datetime('now') WHERE id = ?").run(req.user.id, req.params.id);
    res.json({ success: true, data: { message: 'Workflow approved' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/workflows/:id/reject
router.put('/:id/reject', authorize('admin', 'manager'), (req, res) => {
  try {
    const wf = db.prepare('SELECT * FROM workflows WHERE id = ?').get(req.params.id);
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });
    if (wf.status !== 'pending') return res.status(400).json({ success: false, error: 'Only pending workflows can be rejected' });

    const { notes } = req.body;
    db.prepare("UPDATE workflows SET status = 'rejected', approver_id = ?, notes = COALESCE(notes, '') || ?, updated_at = datetime('now') WHERE id = ?").run(
      req.user.id, notes ? ` | Rejected: ${notes}` : '', req.params.id
    );
    res.json({ success: true, data: { message: 'Workflow rejected' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
