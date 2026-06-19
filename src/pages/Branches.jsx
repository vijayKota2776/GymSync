/* ==========================================================================
   GymSync — Branches Page
   Branch comparison cards, charts, revenue breakdown, staff table
   ========================================================================== */
import { useState } from 'react';
import { branches, revenue, staff, formatCurrency } from '../data/mockData';
import { BarChart, RingChart } from '../components/Charts';
import { AnimatedNumber } from '../hooks/useAnimatedCounter';

const revenueCategories = {
  labels: ['Membership', 'Personal Training', 'Day Pass', 'Supplements', 'Merchandise'],
  values: [65, 18, 8, 5, 4],
  colors: ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#06b6d4'],
};

export default function Branches() {
  const [activeTab, setActiveTab] = useState('revenue');

  const getChartData = () => {
    const last6Labels = revenue.months.slice(-6);
    if (activeTab === 'revenue') {
      return {
        labels: last6Labels,
        datasets: [
          { label: 'Mumbai', data: revenue.mumbai.slice(-6).map(v => v / 100000), color: '#3b82f6' },
          { label: 'Pune', data: revenue.pune.slice(-6).map(v => v / 100000), color: '#22c55e' },
          { label: 'Bangalore', data: revenue.bangalore.slice(-6).map(v => v / 100000), color: '#a855f7' },
        ],
      };
    }
    if (activeTab === 'members') {
      return {
        labels: last6Labels,
        datasets: [
          { label: 'Mumbai', data: [1180, 1195, 1210, 1225, 1235, 1247], color: '#3b82f6' },
          { label: 'Pune', data: [850, 858, 868, 875, 884, 892], color: '#22c55e' },
          { label: 'Bangalore', data: [650, 665, 678, 688, 698, 708], color: '#a855f7' },
        ],
      };
    }
    // attendance
    return {
      labels: last6Labels,
      datasets: [
        { label: 'Mumbai', data: [175, 180, 185, 178, 190, 187], color: '#3b82f6' },
        { label: 'Pune', data: [88, 92, 95, 90, 100, 98], color: '#22c55e' },
        { label: 'Bangalore', data: [48, 50, 52, 55, 58, 57], color: '#a855f7' },
      ],
    };
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.3;
    return (
      <span style={{ color: '#eab308', fontSize: '0.85rem', letterSpacing: '1px' }}>
        {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.3rem' }}>{rating}</span>
      </span>
    );
  };

  return (
    <div className="branches-page">
      {/* Branch Cards */}
      <div className="branches-grid section-gap">
        {branches.map((b, i) => (
          <div key={b.id} className={`card branch-card animate-fadeInUp stagger-${i + 1}`} style={{ borderTop: `3px solid ${b.color}` }}>
            <div className="card-body">
              <h3 className="branch-card-title">{b.name}</h3>
              <div className="branch-card-subtitle">{b.city}, {b.region}</div>

              <div className="branch-card-manager">
                Manager: <strong>{b.manager}</strong>
              </div>

              {/* Stats grid */}
              <div className="branch-stats-grid">
                <div>
                  <div className="branch-stat-label">Members</div>
                  <div className="branch-stat-value">
                    <AnimatedNumber value={b.currentMembers} />
                  </div>
                  <div className="progress-bar" style={{ marginTop: '0.35rem', height: '4px' }}>
                    <div className="progress-fill" style={{ width: `${(b.currentMembers / b.capacity) * 100}%`, background: b.color }} />
                  </div>
                  <div className="branch-stat-sub">of {b.capacity} capacity</div>
                </div>
                <div>
                  <div className="branch-stat-label">Revenue</div>
                  <div className="branch-stat-value" style={{ color: 'var(--accent-green)' }}>
                    {formatCurrency(b.monthlyRevenue)}
                  </div>
                  <div className="branch-stat-sub" style={{ marginTop: '0.6rem' }}>this month</div>
                </div>
                <div>
                  <div className="branch-stat-label">Equipment</div>
                  <div className="branch-stat-value">
                    {b.equipmentCount}
                  </div>
                  {b.maintenancePending > 0 && (
                    <div className="branch-stat-sub" style={{ color: 'var(--accent-orange)' }}>
                      ({b.maintenancePending} pending)
                    </div>
                  )}
                </div>
                <div>
                  <div className="branch-stat-label">Rating</div>
                  {renderStars(b.rating)}
                </div>
              </div>

              {/* Footer */}
              <div className="branch-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="live-dot" />
                  <span className="branch-footer-text">
                    <strong>{b.checkInsToday}</strong> check-ins today
                  </span>
                </div>
                <span className="branch-footer-peak">Peak: {b.peakHour}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="card section-gap animate-fadeInUp stagger-4">
        <div className="card-header branch-chart-header">
          <h3>Branch Comparison</h3>
          <div className="branch-tabs">
            {['revenue', 'members', 'attendance'].map(tab => (
              <button key={tab} className={`tab-nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <BarChart data={getChartData()} height={280} key={activeTab} />
        </div>
      </div>

      {/* Revenue + Staff */}
      <div className="page-grid page-grid-2">
        <div className="card animate-fadeInUp stagger-5">
          <div className="card-header"><h3>Revenue by Category</h3></div>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <RingChart
              data={revenueCategories}
              size={200}
              lineWidth={22}
              centerText="₹40.7L"
              centerSubText="Total Revenue"
            />
          </div>
        </div>

        <div className="card animate-fadeInUp stagger-6">
          <div className="card-header"><h3>Staff Directory</h3></div>
          <div className="card-body" style={{ padding: 0, maxHeight: 400, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Role</th><th>Branch</th><th>Status</th></tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td><span className={`badge badge--${s.role}`}>{s.role}</span></td>
                    <td>{s.branch}</td>
                    <td>
                      <span className={`status-dot ${s.status === 'active' ? 'status-dot--active' : 'status-dot--warning'}`} />
                      {s.status === 'active' ? 'Active' : 'On Leave'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
