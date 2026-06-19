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

// Prometheus metrics tracking
const metrics = { requests: {}, totalRequests: 0, totalErrors: 0, avgResponseTime: 0, responseTimes: [] };
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const start = Date.now();
    console.log(`${req.method} ${req.path}`);
    res.on('finish', () => {
      const duration = Date.now() - start;
      const key = `${req.method}_${req.route?.path || req.path}_${res.statusCode}`;
      metrics.requests[key] = (metrics.requests[key] || 0) + 1;
      metrics.totalRequests++;
      if (res.statusCode >= 400) metrics.totalErrors++;
      metrics.responseTimes.push(duration);
      if (metrics.responseTimes.length > 1000) metrics.responseTimes.shift();
      metrics.avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
    });
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
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() } });
});

// Prometheus metrics endpoint
app.get('/api/metrics', (req, res) => {
  const mem = process.memoryUsage();
  let output = '# HELP gymsync_http_requests_total Total HTTP requests\n';
  output += '# TYPE gymsync_http_requests_total counter\n';
  for (const [key, count] of Object.entries(metrics.requests)) {
    const [method, route, status] = key.split('_');
    output += `gymsync_http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}\n`;
  }
  output += '# HELP gymsync_http_requests_total_count Total request count\n';
  output += `gymsync_http_requests_total_count ${metrics.totalRequests}\n`;
  output += '# HELP gymsync_http_errors_total Total error count\n';
  output += `gymsync_http_errors_total ${metrics.totalErrors}\n`;
  output += '# HELP gymsync_http_response_time_ms Average response time\n';
  output += `gymsync_http_response_time_ms ${metrics.avgResponseTime.toFixed(2)}\n`;
  output += '# HELP gymsync_nodejs_heap_bytes Node.js heap usage\n';
  output += `gymsync_nodejs_heap_used_bytes ${mem.heapUsed}\n`;
  output += `gymsync_nodejs_heap_total_bytes ${mem.heapTotal}\n`;
  output += `gymsync_nodejs_rss_bytes ${mem.rss}\n`;
  output += '# HELP gymsync_uptime_seconds Process uptime\n';
  output += `gymsync_uptime_seconds ${Math.floor(process.uptime())}\n`;
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(output);
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
