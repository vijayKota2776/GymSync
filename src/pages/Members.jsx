/* ==========================================================================
   GymSync — Members Page
   Searchable member cards grid with filters and churn risk badges
   ========================================================================== */
import { useState, useMemo } from 'react';
import { members, getInitials, getAvatarGradient, timeAgo } from '../data/mockData';

export default function Members() {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
      const matchBranch = branchFilter === 'all' || m.branch === branchFilter;
      const matchPlan = planFilter === 'all' || m.plan === planFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && m.churnRisk === 'low') ||
        (statusFilter === 'at-risk' && m.churnRisk === 'medium') ||
        (statusFilter === 'inactive' && (m.churnRisk === 'high' || m.status === 'inactive'));
      return matchSearch && matchBranch && matchPlan && matchStatus;
    });
  }, [search, branchFilter, planFilter, statusFilter]);

  const atRiskCount = members.filter(m => m.churnRisk === 'medium' || m.churnRisk === 'high').length;
  const activePercent = Math.round((members.filter(m => m.status === 'active').length / members.length) * 100);

  const getStatusBadge = (m) => {
    if (m.churnRisk === 'high' || m.status === 'inactive') return { cls: 'badge--inactive', text: 'Inactive' };
    if (m.churnRisk === 'medium') return { cls: 'badge--at-risk', text: 'At Risk' };
    return { cls: 'badge--active', text: 'Active' };
  };

  const getActivityColor = (rate) => {
    if (rate >= 70) return 'var(--accent-green)';
    if (rate >= 40) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="filter-bar section-gap" style={{ gap: '0.75rem' }}>
        <div className="search-wrapper" style={{ flex: 1, maxWidth: 320 }}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input type="text" className="search-input" style={{ width: '100%' }} placeholder="Search by name, email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="all">All Branches</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Pune">Pune</option>
          <option value="Bangalore">Bangalore</option>
        </select>
        <select className="filter-select" value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          <option value="all">All Plans</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="at-risk">At Risk</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="btn btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M12 5v14M5 12h14" /></svg>
          Add Member
        </button>
      </div>

      {/* Stats Bar */}
      <div className="page-grid page-grid-4 section-gap">
        <div className="kpi-card kpi-card--blue animate-fadeInUp stagger-1" style={{ padding: '1rem 1.25rem' }}>
          <div className="kpi-label" style={{ marginBottom: '0.25rem' }}>Total Members</div>
          <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{members.length}</div>
        </div>
        <div className="kpi-card kpi-card--green animate-fadeInUp stagger-2" style={{ padding: '1rem 1.25rem' }}>
          <div className="kpi-label" style={{ marginBottom: '0.25rem' }}>Active Rate</div>
          <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'var(--accent-green)' }}>{activePercent}%</div>
        </div>
        <div className="kpi-card kpi-card--orange animate-fadeInUp stagger-3" style={{ padding: '1rem 1.25rem' }}>
          <div className="kpi-label" style={{ marginBottom: '0.25rem' }}>At Risk</div>
          <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'var(--accent-orange)' }}>{atRiskCount}</div>
        </div>
        <div className="kpi-card kpi-card--purple animate-fadeInUp stagger-4" style={{ padding: '1rem 1.25rem' }}>
          <div className="kpi-label" style={{ marginBottom: '0.25rem' }}>New This Month</div>
          <div className="kpi-value" style={{ fontSize: '1.5rem' }}>64</div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {members.length} members
      </div>

      {/* Member Cards Grid */}
      <div className="page-grid page-grid-3">
        {filtered.map((m, i) => {
          const badge = getStatusBadge(m);
          return (
            <div key={m.id} className={`member-card animate-fadeInUp stagger-${Math.min((i % 6) + 1, 8)}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                <div className="member-avatar" style={{ background: getAvatarGradient(m.name) }}>
                  {getInitials(m.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="member-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div className="member-branch">📍 {m.branch}</div>
                </div>
                <span className={`badge badge--${m.plan}`}>{m.plan}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Activity Rate</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{m.activityRate}%</span>
              </div>
              <div className="activity-bar">
                <div className="activity-bar-fill" style={{ width: `${m.activityRate}%`, background: getActivityColor(m.activityRate) }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span className={`badge ${badge.cls}`}>{badge.text}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Last: {timeAgo(m.lastCheckIn)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No members found</p>
          <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
