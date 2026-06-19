/* ==========================================================================
   GymSync — Activity Feed Page
   Full activity timeline with filters, stats, and auto-updating feed
   ========================================================================== */
import { useState, useEffect, useRef } from 'react';
import { generateActivity, generateInitialActivities, timeAgo } from '../data/mockData';
import { AnimatedNumber } from '../hooks/useAnimatedCounter';

const feedIcons = {
  checkin: '→', payment: '₹', alert: '⚠', maintenance: '🔧', member: '👤'
};

const typeLabels = {
  checkin: 'Check-in', payment: 'Payment', alert: 'Alert', maintenance: 'Maintenance', member: 'New Member'
};

export default function Activity() {
  const [activities, setActivities] = useState(() => generateInitialActivities(20));
  const [typeFilter, setTypeFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Auto-feed
  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setActivities(prev => {
        const newEvent = generateActivity();
        newEvent.time = new Date();
        const updated = [newEvent, ...prev];
        return updated.slice(0, 50);
      });
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const filtered = activities.filter(a => {
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchBranch = branchFilter === 'all' || a.branch === branchFilter;
    return matchType && matchBranch;
  });

  const stats = {
    total: activities.length,
    checkins: activities.filter(a => a.type === 'checkin').length,
    payments: activities.filter(a => a.type === 'payment').length,
    alerts: activities.filter(a => a.type === 'alert').length,
  };

  return (
    <div>
      {/* Header + Filters */}
      <div className="filter-bar section-gap">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: 'auto' }}>
          <span className="live-dot" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Live Feed {isPaused && <span style={{ color: 'var(--accent-orange)' }}>(Paused)</span>}
          </span>
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="checkin">Check-ins</option>
          <option value="payment">Payments</option>
          <option value="alert">Alerts</option>
          <option value="maintenance">Maintenance</option>
          <option value="member">New Members</option>
        </select>
        <select className="filter-select" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="all">All Branches</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Pune">Pune</option>
          <option value="Bangalore">Bangalore</option>
        </select>
        <button className={`btn ${isPaused ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Stats */}
      <div className="page-grid page-grid-4 section-gap">
        <div className="kpi-card kpi-card--blue animate-fadeInUp stagger-1" style={{ padding: '1rem 1.25rem' }}>
          <div className="kpi-label" style={{ marginBottom: '0.25rem' }}>Total Events</div>
          <div className="kpi-value" style={{ fontSize: '1.5rem' }}><AnimatedNumber value={stats.total} /></div>
        </div>
        <div className="kpi-card kpi-card--cyan animate-fadeInUp stagger-2" style={{ padding: '1rem 1.25rem' }}>
          <div className="kpi-label" style={{ marginBottom: '0.25rem' }}>Check-ins</div>
          <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}><AnimatedNumber value={stats.checkins} /></div>
        </div>
        <div className="kpi-card kpi-card--green animate-fadeInUp stagger-3" style={{ padding: '1rem 1.25rem' }}>
          <div className="kpi-label" style={{ marginBottom: '0.25rem' }}>Payments</div>
          <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'var(--accent-green)' }}><AnimatedNumber value={stats.payments} /></div>
        </div>
        <div className="kpi-card kpi-card--orange animate-fadeInUp stagger-4" style={{ padding: '1rem 1.25rem' }}>
          <div className="kpi-label" style={{ marginBottom: '0.25rem' }}>Alerts</div>
          <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'var(--accent-orange)' }}><AnimatedNumber value={stats.alerts} /></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card animate-fadeInUp stagger-5">
        <div className="card-header">
          <h3>Activity Timeline</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filtered.length} events</span>
        </div>
        <div className="card-body" style={{ maxHeight: 600, overflowY: 'auto', padding: '0.5rem 1rem' }}>
          {/* Timeline line */}
          <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
            <div style={{
              position: 'absolute', left: '17px', top: 0, bottom: 0, width: '2px',
              background: 'linear-gradient(to bottom, var(--accent-blue), var(--accent-purple), transparent)'
            }} />

            {filtered.map((event) => (
              <div key={event.id} className="feed-item" style={{ position: 'relative', paddingLeft: '1rem', borderBottom: 'none', marginBottom: '0.25rem' }}>
                {/* Dot on timeline */}
                <div style={{
                  position: 'absolute', left: '-2rem', top: '50%', transform: 'translateY(-50%)',
                  width: '10px', height: '10px', borderRadius: '50%', zIndex: 1,
                  background: event.type === 'checkin' ? 'var(--accent-blue)' :
                    event.type === 'payment' ? 'var(--accent-green)' :
                    event.type === 'alert' ? 'var(--accent-orange)' :
                    event.type === 'maintenance' ? 'var(--accent-red)' : 'var(--accent-purple)',
                  boxShadow: `0 0 8px ${event.type === 'checkin' ? 'rgba(59,130,246,0.4)' :
                    event.type === 'payment' ? 'rgba(34,197,94,0.4)' :
                    event.type === 'alert' ? 'rgba(249,115,22,0.4)' :
                    event.type === 'maintenance' ? 'rgba(239,68,68,0.4)' : 'rgba(168,85,247,0.4)'}`,
                }} />

                <div className={`feed-icon feed-icon--${event.type}`}>{feedIcons[event.type]}</div>
                <div style={{ flex: 1 }}>
                  <div className="feed-text" dangerouslySetInnerHTML={{ __html: event.message }} />
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <span className="feed-time">{timeAgo(event.time)}</span>
                    <span className={`badge badge--${event.type === 'checkin' ? 'standard' : event.type === 'payment' ? 'active' : event.type === 'alert' ? 'at-risk' : event.type === 'maintenance' ? 'inactive' : 'premium'}`}>
                      {typeLabels[event.type]}
                    </span>
                    {event.branch && event.branch !== 'System' && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📍 {event.branch}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No events match the current filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
