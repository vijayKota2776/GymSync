/* GymSync — Executive Reports Routes (Phase 3G) */
import { Router } from 'express';
import db from '../db.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// GET /api/reports/executive — aggregate KPIs
router.get('/executive', authorize('admin', 'manager'), (req, res) => {
  try {
    const totalMembers = db.prepare("SELECT COUNT(*) as c FROM members WHERE status != 'inactive'").get().c;
    const activeMembers = db.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'active'").get().c;
    const atRiskMembers = db.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'at-risk'").get().c;
    const frozenMembers = db.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'frozen'").get().c;
    const newThisMonth = db.prepare("SELECT COUNT(*) as c FROM members WHERE join_date >= date('now', 'start of month')").get().c;
    const checkInsToday = db.prepare("SELECT COUNT(*) as c FROM attendance WHERE date(check_in) = date('now')").get().c;
    const activeBranches = db.prepare("SELECT COUNT(*) as c FROM branches").get().c;

    const thisMonthRev = db.prepare("SELECT COALESCE(SUM(amount), 0) as t FROM payments WHERE payment_date >= date('now', 'start of month')").get().t;
    const lastMonthRev = db.prepare("SELECT COALESCE(SUM(amount), 0) as t FROM payments WHERE payment_date >= date('now', 'start of month', '-1 month') AND payment_date < date('now', 'start of month')").get().t;
    const revenueGrowth = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100) : 0;

    const churnRate = totalMembers > 0 ? Math.round(((atRiskMembers + frozenMembers) / totalMembers) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalMembers, activeMembers, atRiskMembers, frozenMembers, newThisMonth,
        checkInsToday, activeBranches, totalRevenue: thisMonthRev,
        lastMonthRevenue: lastMonthRev, revenueGrowth, churnRate,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/branch-comparison
router.get('/branch-comparison', authorize('admin', 'manager'), (req, res) => {
  try {
    const branches = db.prepare(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM members m WHERE m.branch_id = b.id AND m.status != 'inactive') as members,
        (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.branch_id = b.id AND p.payment_date >= date('now', 'start of month')) as revenue,
        (SELECT COUNT(*) FROM attendance a WHERE a.branch_id = b.id AND date(a.check_in) = date('now')) as todayAttendance,
        (SELECT COUNT(*) FROM equipment e WHERE e.branch_id = b.id) as equipment
      FROM branches b
    `).all();
    res.json({ success: true, data: branches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/member-growth — monthly new signups
router.get('/member-growth', authorize('admin', 'manager'), (req, res) => {
  try {
    const growth = db.prepare(`
      SELECT strftime('%Y-%m', join_date) as month, COUNT(*) as count
      FROM members WHERE join_date >= date('now', '-12 months')
      GROUP BY month ORDER BY month
    `).all();
    res.json({ success: true, data: growth });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/churn-analysis
router.get('/churn-analysis', authorize('admin', 'manager'), (req, res) => {
  try {
    const atRisk = db.prepare(`
      SELECT m.*, b.city as branch_city FROM members m
      LEFT JOIN branches b ON m.branch_id = b.id
      WHERE m.status IN ('at-risk', 'frozen', 'inactive')
      ORDER BY m.churn_risk DESC
    `).all();
    res.json({ success: true, data: atRisk });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
