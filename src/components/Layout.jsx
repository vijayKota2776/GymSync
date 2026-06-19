/* ==========================================================================
   GymSync — Layout Components: Sidebar + Header
   With mobile hamburger menu support
   ========================================================================== */
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/* ---------- Icon Components (Lucide-style inline SVGs) ---------- */
const icons = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  members: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  branches: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
    </svg>
  ),
  monitoring: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  pricing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  workflows: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 14l2 2 4-4" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  logo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M4 6.5v11M8.5 6.5v11M15.5 6.5v11M20 6.5v11M4 6.5h1.5M4 17.5h1.5M18.5 6.5H20M18.5 17.5H20" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
};

const navItems = [
  { path: '/', label: 'Overview', icon: 'overview' },
  { path: '/members', label: 'Members', icon: 'members' },
  { path: '/branches', label: 'Branches', icon: 'branches' },
  { path: '/monitoring', label: 'Monitoring', icon: 'monitoring' },
  { path: '/activity', label: 'Activity', icon: 'activity' },
  { path: '/pricing', label: 'Pricing', icon: 'pricing' },
  { path: '/workflows', label: 'Workflows', icon: 'workflows' },
];

const pageTitles = {
  '/': 'Overview',
  '/members': 'Members',
  '/branches': 'Branches',
  '/monitoring': 'Monitoring',
  '/activity': 'Activity Feed',
  '/pricing': 'Pricing & Plans',
  '/workflows': 'Workflows',
};

/* ---------- Sidebar ---------- */
export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'GS';

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">{icons.logo}</div>
          <h1>GymSync</h1>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  {icons[item.icon]}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-user">
          <div className="member-avatar" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', width: 40, height: 40, fontSize: '0.9rem' }}>
            {initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <span className={`badge badge--${user?.role || 'admin'}`}>{user?.role || 'admin'}</span>
          </div>
          <button onClick={handleLogout} className="btn btn--ghost btn--sm" title="Logout" style={{ marginLeft: 'auto', padding: '0.4rem' }}>
            {icons.logout}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ---------- Header ---------- */
export function Header({ onMenuToggle }) {
  const location = useLocation();
  const [clock, setClock] = useState('');
  const [notifCount, setNotifCount] = useState(0);

  const title = pageTitles[location.pathname] || 'Dashboard';

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const date = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
      setClock(`${time}  •  ${date}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch pending workflow count for notification badge
  useEffect(() => {
    const fetchPending = () => {
      api.get('/workflows/pending')
        .then(res => setNotifCount(res.data?.count || 0))
        .catch(() => {}); // silently fail if not logged in yet
    };
    fetchPending();
    const id = setInterval(fetchPending, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="header" id="header">
      <div className="header-left">
        {/* Hamburger menu button — visible only on mobile */}
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 id="page-title">{title}</h2>
      </div>
      <div className="header-right">
        <div className="search-wrapper">
          <span className="search-icon">{icons.search}</span>
          <input type="text" className="search-input" id="global-search" placeholder="Search members, branches..." />
        </div>
        <div className="notification-bell" id="notification-bell">
          {icons.bell}
          <span className="notification-badge" id="notification-count">{notifCount > 9 ? '9+' : notifCount}</span>
        </div>
        <div className="header-clock" id="header-clock">{clock}</div>
      </div>
    </header>
  );
}
