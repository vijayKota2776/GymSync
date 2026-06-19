/* ==========================================================================
   GymSync — Monitoring Page
   Live gauges, Docker container status, system alerts, server info
   ========================================================================== */
import { useState, useEffect, useRef } from 'react';
import Gauge from '../components/Gauge';
import { generateMetrics } from '../data/mockData';

const dockerContainers = [
  { name: 'gymsync-web', image: 'nginx:alpine', cpu: 2.1, mem: 128, memMax: 512, uptime: '14d 3h', status: 'running' },
  { name: 'gymsync-db', image: 'mysql:8.0', cpu: 4.2, mem: 512, memMax: 1024, uptime: '14d 3h', status: 'running' },
  { name: 'gymsync-redis', image: 'redis:7-alpine', cpu: 0.8, mem: 64, memMax: 256, uptime: '14d 3h', status: 'running' },
  { name: 'gymsync-monitor', image: 'prom/node-exporter', cpu: 1.5, mem: 48, memMax: 256, uptime: '14d 3h', status: 'running' },
];

const alerts = [
  { type: 'resolved', icon: '✓', msg: 'All systems operational — last incident resolved 6h ago', time: '10:12 AM' },
  { type: 'resolved', icon: '✓', msg: 'Backup completed successfully at 02:00 IST', time: '02:00 AM' },
  { type: 'info', icon: 'ℹ', msg: 'SSL certificate valid until 2027-03-15 — auto-renewal configured', time: '12:00 AM' },
  { type: 'warning', icon: '⚠', msg: 'CPU spike to 78% detected at 14:32 — auto-resolved', time: 'Yesterday' },
  { type: 'info', icon: 'ℹ', msg: 'Container gymsync-redis restarted automatically by health_check.sh', time: 'Yesterday' },
  { type: 'info', icon: 'ℹ', msg: 'Disk usage approaching 65% — within normal limits', time: '2 days ago' },
  { type: 'critical', icon: '✗', msg: 'DDoS attempt blocked — 2,340 requests from single IP rate-limited', time: '3 days ago' },
  { type: 'resolved', icon: '✓', msg: 'RDS automated backup snapshot completed', time: '3 days ago' },
];

const serverInfo = [
  ['Operating System', 'Ubuntu 22.04 LTS'],
  ['Instance Type', 'EC2 t2.micro'],
  ['Region', 'ap-south-1 (Mumbai)'],
  ['Public IP', '13.235.142.87'],
  ['VPC', 'gymsync-vpc (10.0.0.0/16)'],
  ['Last Backup', 'Today at 02:00 IST'],
  ['Next Backup', 'Tomorrow at 02:00 IST'],
  ['SSL Status', 'Valid (expires 2027-03-15)'],
  ['Docker Version', '24.0.7'],
  ['Nginx Version', '1.25.3'],
];

export default function Monitoring() {
  const [metrics, setMetrics] = useState(generateMetrics());
  const [containers, setContainers] = useState(dockerContainers);
  const [uptimeSeconds, setUptimeSeconds] = useState(14 * 86400 + 3 * 3600 + 27 * 60);
  const intervalsRef = useRef([]);

  // Update metrics every 2 seconds
  useEffect(() => {
    const id = setInterval(() => setMetrics(generateMetrics()), 2000);
    intervalsRef.current.push(id);
    return () => intervalsRef.current.forEach(clearInterval);
  }, []);

  // Update uptime every second
  useEffect(() => {
    const id = setInterval(() => setUptimeSeconds(s => s + 1), 1000);
    intervalsRef.current.push(id);
    return () => clearInterval(id);
  }, []);

  // Fluctuate Docker metrics
  useEffect(() => {
    const id = setInterval(() => {
      setContainers(prev => prev.map(c => ({
        ...c,
        cpu: Math.max(0.1, c.cpu + (Math.random() - 0.5) * 0.8),
        mem: Math.max(16, c.mem + Math.floor((Math.random() - 0.5) * 10)),
      })));
    }, 5000);
    intervalsRef.current.push(id);
    return () => clearInterval(id);
  }, []);

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  return (
    <div>
      {/* System Metrics Gauges */}
      <div className="page-grid page-grid-4 section-gap">
        <div className="card animate-fadeInUp stagger-1">
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <Gauge value={metrics.cpu} label="CPU Usage" size={150} strokeWidth={12} />
          </div>
        </div>
        <div className="card animate-fadeInUp stagger-2">
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <Gauge value={metrics.memory} label="Memory Usage" size={150} strokeWidth={12} />
          </div>
        </div>
        <div className="card animate-fadeInUp stagger-3">
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <Gauge value={metrics.disk} label="Disk Usage" size={150} strokeWidth={12} />
          </div>
        </div>
        <div className="card animate-fadeInUp stagger-4">
          <div className="card-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Network I/O</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>↓ {metrics.network.in.toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', margin: '0 0.25rem' }}>/</span>
              <span style={{ color: 'var(--accent-orange)' }}>↑ {metrics.network.out.toFixed(1)}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MB/s</div>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{metrics.requests}</span> req/min
            </div>
          </div>
        </div>
      </div>

      {/* Docker Containers */}
      <div className="section-gap">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Docker Containers</h3>
          <span className="badge badge--active">4 Running</span>
        </div>
        <div className="page-grid page-grid-4">
          {containers.map((c, i) => (
            <div key={c.name} className={`docker-card animate-fadeInUp stagger-${i + 1}`}>
              <div className="docker-status">
                <span className="status-dot status-dot--active" />
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>Running</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{c.uptime}</span>
              </div>
              <div className="docker-name">{c.name}</div>
              <div className="docker-image">{c.image}</div>
              <div className="docker-metric">
                <span>CPU</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{c.cpu.toFixed(1)}%</span>
              </div>
              <div className="docker-metric-bar">
                <div className="docker-metric-bar-fill" style={{ width: `${Math.min(100, c.cpu * 10)}%`, background: 'var(--accent-cyan)' }} />
              </div>
              <div className="docker-metric" style={{ marginTop: '0.5rem' }}>
                <span>Memory</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(c.mem)}MB / {c.memMax}MB</span>
              </div>
              <div className="docker-metric-bar">
                <div className="docker-metric-bar-fill" style={{ width: `${(c.mem / c.memMax) * 100}%`, background: 'var(--accent-blue)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts + Server Info */}
      <div className="page-grid page-grid-2">
        {/* System Alerts */}
        <div className="card animate-fadeInUp stagger-5">
          <div className="card-header"><h3>System Alerts</h3></div>
          <div className="card-body" style={{ maxHeight: 380, overflowY: 'auto' }}>
            {alerts.map((a, i) => (
              <div key={i} className={`alert-item alert-item--${a.type}`}>
                <span className="alert-icon">{a.icon}</span>
                <span className="alert-text">{a.msg}</span>
                <span className="alert-time">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Server Information */}
        <div className="card animate-fadeInUp stagger-6">
          <div className="card-header"><h3>Server Information</h3></div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Uptime</span>
              <span className="info-value" style={{ color: 'var(--accent-green)' }}>{formatUptime(uptimeSeconds)}</span>
            </div>
            {serverInfo.map(([label, value]) => (
              <div key={label} className="info-row">
                <span className="info-label">{label}</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
