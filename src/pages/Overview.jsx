/* ==========================================================================
   GymSync — Overview Dashboard Page
   KPI cards, weekly chart, plan distribution, branch table, activity feed
   ========================================================================== */
import { useState, useEffect, useRef } from 'react';
import { AnimatedNumber } from '../hooks/useAnimatedCounter';
import { BarChart, RingChart, Sparkline } from '../components/Charts';
import { branches, getWeeklyCheckIns, getPlanDistribution, formatCurrency, generateActivity, generateInitialActivities, timeAgo } from '../data/mockData';

export default function Overview() {
  const [checkIns, setCheckIns] = useState(342);
  const [activities, setActivities] = useState(() => generateInitialActivities(10));
  const intervalsRef = useRef([]);

  const weeklyData = getWeeklyCheckIns();
  const planData = getPlanDistribution();
  const totalMembers = 2847;
  const totalRevenue = branches.reduce((s, b) => s + b.monthlyRevenue, 0);

  // Live check-in counter
  useEffect(() => {
    const id = setInterval(() => {
      setCheckIns(c => c + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    intervalsRef.current.push(id);
    return () => intervalsRef.current.forEach(clearInterval);
  }, []);

  // Live activity feed
  useEffect(() => {
    const id = setInterval(() => {
      setActivities(prev => {
        const newEvent = generateActivity();
        newEvent.time = new Date();
        const updated = [newEvent, ...prev];
        return updated.slice(0, 20);
      });
    }, 4000);
    intervalsRef.current.push(id);
    return () => clearInterval(id);
  }, []);

  const feedIcons = {
    checkin: '→', payment: '₹', alert: '⚠', maintenance: '🔧', member: '👤'
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="page-grid page-grid-4 section-gap">
        {/* Total Members */}
        <div className="kpi-card kpi-card--green animate-fadeInUp stagger-1">
          <div className="kpi-icon" style={{ background: 'rgba(34,197,94,0.12)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="kpi-value"><AnimatedNumber value={totalMembers} /></div>
          <div className="kpi-label">Total Members</div>
          <span className="kpi-trend kpi-trend--up">↑ 12.5% vs last month</span>
          <div style={{ position: 'absolute', bottom: 8, right: 12, opacity: 0.4 }}>
            <Sparkline data={[22, 25, 28, 24, 30, 32, 35]} color="#22c55e" width={80} height={28} />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="kpi-card kpi-card--blue animate-fadeInUp stagger-2">
          <div className="kpi-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="kpi-value"><AnimatedNumber value={totalRevenue / 100000} decimals={1} prefix="₹" suffix="L" formatFn={(v) => v.toFixed(1)} /></div>
          <div className="kpi-label">Monthly Revenue</div>
          <span className="kpi-trend kpi-trend--up">↑ 8.2% vs last month</span>
          <div style={{ position: 'absolute', bottom: 8, right: 12, opacity: 0.4 }}>
            <Sparkline data={[38, 40, 42, 41, 44, 45, 47]} color="#3b82f6" width={80} height={28} />
          </div>
        </div>

        {/* Today's Check-ins */}
        <div className="kpi-card kpi-card--cyan animate-fadeInUp stagger-3">
          <div className="kpi-icon" style={{ background: 'rgba(6,182,212,0.12)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="kpi-value"><AnimatedNumber value={checkIns} /></div>
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Today's Check-ins <span className="live-dot" />
          </div>
          <span className="kpi-trend kpi-trend--up">↑ 5.1% vs yesterday</span>
          <div style={{ position: 'absolute', bottom: 8, right: 12, opacity: 0.4 }}>
            <Sparkline data={[280, 310, 295, 320, 330, 325, 342]} color="#06b6d4" width={80} height={28} />
          </div>
        </div>

        {/* Active Branches */}
        <div className="kpi-card kpi-card--purple animate-fadeInUp stagger-4">
          <div className="kpi-icon" style={{ background: 'rgba(168,85,247,0.12)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            </svg>
          </div>
          <div className="kpi-value" style={{ fontSize: '2rem' }}>3<span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>/3</span></div>
          <div className="kpi-label">Active Branches</div>
          <span className="kpi-trend kpi-trend--up" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)' }}>All operational</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="page-grid page-grid-2 section-gap">
        <div className="card animate-fadeInUp stagger-5">
          <div className="card-header"><h3>Weekly Check-ins</h3></div>
          <div className="card-body"><BarChart data={weeklyData} height={260} /></div>
        </div>
        <div className="card animate-fadeInUp stagger-6">
          <div className="card-header"><h3>Plan Distribution</h3></div>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <RingChart data={planData} size={200} lineWidth={24} centerText={totalMembers.toLocaleString()} centerSubText="Total Members" />
          </div>
        </div>
      </div>

      {/* Bottom Row: Branch Table + Activity Feed */}
      <div className="page-grid page-grid-2-1">
        {/* Branch Performance Table */}
        <div className="card animate-fadeInUp stagger-7">
          <div className="card-header"><h3>Branch Performance</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch</th><th>City</th><th>Members</th>
                  <th>Revenue</th><th>Attendance</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(b => {
                  const attendance = Math.round((b.checkInsToday / b.currentMembers) * 100);
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{b.city}</td>
                      <td>{b.region}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{b.currentMembers.toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>{formatCurrency(b.monthlyRevenue)}</td>
                      <td>
                        <span style={{
                          color: attendance > 15 ? 'var(--accent-green)' : attendance > 10 ? 'var(--accent-orange)' : 'var(--accent-red)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {attendance}%
                        </span>
                      </td>
                      <td><span className="status-dot status-dot--active" />Active</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="card animate-fadeInUp stagger-8">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Live Activity <span className="live-dot" />
            </h3>
          </div>
          <div className="card-body" style={{ maxHeight: 340, overflowY: 'auto', padding: '0.75rem 1rem' }}>
            {activities.map((event) => (
              <div key={event.id} className="feed-item">
                <div className={`feed-icon feed-icon--${event.type}`}>{feedIcons[event.type]}</div>
                <div>
                  <div className="feed-text" dangerouslySetInnerHTML={{ __html: event.message }} />
                  <div className="feed-time">{timeAgo(event.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
