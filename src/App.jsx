/* ==========================================================================
   GymSync — Main App Component
   Routes, layout shell, auth protection, and mobile menu state
   ========================================================================== */
import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, Header } from './components/Layout';
import { ToastProvider } from './components/Toast';
import Overview from './pages/Overview';
import Members from './pages/Members';
import Branches from './pages/Branches';
import Monitoring from './pages/Monitoring';
import Activity from './pages/Activity';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Workflows from './pages/Workflows';
import Reports from './pages/Reports';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="login-spinner" style={{ width: 32, height: 32, margin: '0 auto 1rem' }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="main-content" id="content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/members" element={<Members />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
