/* ==========================================================================
   GymSync — Express API Server
   Main entry point: mounts all routes, serves frontend in production
   ========================================================================== */
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

import authRoutes from './routes/auth.js';
import branchRoutes from './routes/branches.js';
import memberRoutes from './routes/members.js';
import attendanceRoutes from './routes/attendance.js';
import equipmentRoutes from './routes/equipment.js';
import revenueRoutes from './routes/revenue.js';
import reportRoutes from './routes/reports.js';
import workflowRoutes from './routes/workflows.js';
import { authenticate } from './middleware/auth.js';

// Ensure DB is initialized (importing creates tables)
import './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (dev)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require JWT)
app.use('/api/branches', authenticate, branchRoutes);
app.use('/api/members', authenticate, memberRoutes);
app.use('/api/attendance', authenticate, attendanceRoutes);
app.use('/api/equipment', authenticate, equipmentRoutes);
app.use('/api/revenue', authenticate, revenueRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/workflows', authenticate, workflowRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Serve frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n  🏋️  GymSync API running on http://localhost:${PORT}`);
  console.log(`  📡  API endpoints at http://localhost:${PORT}/api/`);
  console.log(`  🔑  Login: POST /api/auth/login\n`);
});
