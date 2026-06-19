/* ==========================================================================
   GymSync — Executive Reports Page
   Aggregated KPIs, branch comparison, and optimization recommendations
   ========================================================================== */
import { useState, useEffect } from 'react';
import api from '../utils/api';

const optimizations = [
  { icon: '⏰', tip: 'Schedule RDS stop during off-hours (10PM–6AM) to save up to 65% on database costs', impact: 'High', savings: '$8.50/mo' },
  { icon: '💎', tip: 'Switch to Reserved Instances (1-year commitment) for 40% savings on EC2 compute', impact: 'High', savings: '$6.00/mo' },
  { icon: '📦', tip: 'Enable S3 Intelligent-Tiering for automatic backup storage class optimization', impact: 'Medium', savings: '$2.00/mo' },
  { icon: '🔧', tip: 'Consider AWS Graviton (ARM) instances for 20% better price-performance ratio', impact: 'Medium', savings: '$3.00/mo' },
  { icon: '🗜️', tip: 'Enable gzip compression on ALB to reduce data transfer costs by 30%', impact: 'Low', savings: '$1.50/mo' },
  { icon: '📊', tip: 'Use CloudWatch Logs Insights instead of full metrics for 50% monitoring savings', impact: 'Low', savings: '$1.50/mo' },
];

export default function Reports() {
  const [kpis, setKpis] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [execRes, branchRes] = await Promise.all([
          api.get('/reports/executive'),
          api.get('/reports/branch-comparison'),
        ]);
        setKpis(execRes.data);
        setBranches(branchRes.data || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="login-spinner" style={{ width: 32, height: 32, margin: '0 auto 1rem' }} />
          <p>Loading executive reports...</p>
        </div>
      </div>
    );
  }

  const kpiCards = kpis ? [
    { label: 'Total Members', value: kpis.totalMembers, icon: '👥', color: 'blue', trend: null },
    { label: 'Active Members', value: kpis.activeMembers, icon: '✅', color: 'green', trend: null },
    { label: 'Revenue This Month', value: `₹${(kpis.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'purple', trend: null },
    { label: 'Revenue Growth', value: `${kpis.revenueGrowth || 0}%`, icon: '📈', color: kpis.revenueGrowth >= 0 ? 'green' : 'red', trend: kpis.revenueGrowth >= 0 ? 'up' : 'down' },
    { label: 'Check-ins Today', value: kpis.checkInsToday, icon: '🏃', color: 'cyan', trend: null },
    { label: 'Churn Rate', value: `${kpis.churnRate || 0}%`, icon: '⚠️', color: kpis.churnRate <= 10 ? 'green' : 'orange', trend: null },
    { label: 'Active Branches', value: kpis.activeBranches, icon: '🏢', color: 'blue', trend: null },
    { label: 'New This Month', value: kpis.newThisMonth, icon: '🆕', color: 'green', trend: 'up' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Executive Reports
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Aggregated performance insights across all operations
        </p>
      </div>

      {/* KPI Grid */}
      <div className="page-grid page-grid-4 section-gap">
        {kpiCards.map((kpi, i) => (
          <div key={kpi.label} className={`kpi-card kpi-card--${kpi.color} animate-fadeInUp stagger-${i + 1}`}>
            <div className="kpi-icon" style={{ background: `var(--accent-${kpi.color}, var(--accent-blue))15`, color: `var(--accent-${kpi.color}, var(--accent-blue))` }}>
              <span style={{ fontSize: '1.4rem' }}>{kpi.icon}</span>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            {kpi.trend && (
              <span className={`kpi-trend kpi-trend--${kpi.trend}`}>
                {kpi.trend === 'up' ? '↑' : '↓'} {kpi.trend === 'up' ? 'Growing' : 'Declining'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Branch Comparison */}
      <div className="card section-gap animate-fadeInUp stagger-5">
        <div className="card-header">
          <h3>Branch Performance Comparison</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{branches.length} branches</span>
        </div>
        <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>City</th>
                <th>Region</th>
                <th>Members</th>
                <th>Revenue (₹)</th>
                <th>Today Attendance</th>
                <th>Equipment</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {branches.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: b.color || 'var(--accent-blue)', marginRight: 8 }} />
                    {b.name}
                  </td>
                  <td>{b.city}</td>
                  <td>{b.region}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.members || 0}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>₹{(b.revenue || 0).toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.todayAttendance || 0}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.equipment || 0}</td>
                  <td>
                    <span style={{ color: (b.rating || 4.5) >= 4.5 ? 'var(--accent-green)' : 'var(--accent-orange)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      ★ {(b.rating || 4.5).toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infrastructure Optimization */}
      <div className="card section-gap animate-fadeInUp stagger-6">
        <div className="card-header">
          <h3>💡 Infrastructure Optimization Recommendations</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: 600 }}>
            Potential savings: $22.50/mo
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Recommendation</th>
                <th>Impact</th>
                <th>Est. Savings</th>
              </tr>
            </thead>
            <tbody>
              {optimizations.map((opt, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)' }}>
                    <span style={{ marginRight: 8 }}>{opt.icon}</span>
                    {opt.tip}
                  </td>
                  <td>
                    <span className={`badge ${opt.impact === 'High' ? 'badge--active' : opt.impact === 'Medium' ? 'badge--standard' : 'badge--basic'}`}>
                      {opt.impact}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 600 }}>
                    {opt.savings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
