/* ==========================================================================
   GymSync — Workflows Page (Phase 3H)
   Approval workflows: leave requests, purchase requests, complaints
   ========================================================================== */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const typeLabels = {
  leave_request: { label: 'Leave Request', icon: '🏖️', color: 'var(--accent-blue)' },
  equipment_purchase: { label: 'Equipment Purchase', icon: '🏋️', color: 'var(--accent-green)' },
  member_complaint: { label: 'Member Complaint', icon: '⚠️', color: 'var(--accent-orange)' },
  plan_change: { label: 'Plan Change', icon: '💳', color: 'var(--accent-purple)' },
};

const statusColors = {
  pending: 'badge--at-risk',
  approved: 'badge--active',
  rejected: 'badge--inactive',
};

export default function Workflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formType, setFormType] = useState('leave_request');
  const [formNotes, setFormNotes] = useState('');
  const [formData, setFormData] = useState('{}');
  const [submitting, setSubmitting] = useState(false);

  const loadWorkflows = async () => {
    try {
      const statusParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/workflows${statusParam}`);
      setWorkflows(res.data || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkflows(); }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/workflows', { type: formType, notes: formNotes, data_json: formData });
      setShowForm(false);
      setFormNotes('');
      setFormData('{}');
      loadWorkflows();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/workflows/${id}/${action}`, { notes: action === 'reject' ? 'Rejected by admin' : '' });
      loadWorkflows();
    } catch (err) {
      alert(err.message);
    }
  };

  const canApprove = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="filter-bar">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} className={`tab-nav-item ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
              style={{ border: 'none', background: 'none' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Request
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="card section-gap animate-fadeInUp">
          <div className="card-header">
            <h3>Create Workflow Request</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Request Type
                </label>
                <select className="filter-select" value={formType} onChange={e => setFormType(e.target.value)} style={{ width: '100%' }}>
                  {Object.entries(typeLabels).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Details / Notes
                </label>
                <textarea className="filter-select" rows={3} value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Describe your request..."
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📋</p>
            <p>No workflows found</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {workflows.map((wf, i) => {
            const typeInfo = typeLabels[wf.type] || { label: wf.type, icon: '📄', color: 'var(--text-muted)' };
            return (
              <div key={wf.id} className={`card animate-fadeInUp stagger-${Math.min(i + 1, 8)}`}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    background: `${typeInfo.color}15`, fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {typeInfo.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{typeInfo.label}</span>
                      <span className={`badge ${statusColors[wf.status]}`}>{wf.status}</span>
                    </div>
                    {wf.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{wf.notes}</p>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                      <span>By: {wf.requester_name || `User #${wf.requester_id}`}</span>
                      <span>{new Date(wf.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {wf.approver_name && <span>Approved by: {wf.approver_name}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  {canApprove && wf.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button className="btn btn--primary btn--sm" onClick={() => handleAction(wf.id, 'approve')}>
                        ✓ Approve
                      </button>
                      <button className="btn btn--secondary btn--sm" onClick={() => handleAction(wf.id, 'reject')}
                        style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
