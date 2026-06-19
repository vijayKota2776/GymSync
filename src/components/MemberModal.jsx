/* ==========================================================================
   GymSync — Member Modal
   Create/Edit member form modal
   ========================================================================== */
import { useState, useEffect } from 'react';

export default function MemberModal({ member, branches, onSave, onClose }) {
  const isEdit = !!member;
  const [form, setForm] = useState({
    name: '', email: '', phone: '', plan: 'basic', branch_id: 1, status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        plan: member.plan || 'basic',
        branch_id: member.branch_id || 1,
        status: member.status || 'active',
      });
    }
  }, [member]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form, member?.id);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-fadeInUp" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h3>{isEdit ? 'Edit Member' : 'Add New Member'}</h3>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          {error && (
            <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="modal-field">
              <label>Full Name *</label>
              <input type="text" className="modal-input" value={form.name}
                onChange={e => handleChange('name', e.target.value)} placeholder="Priya Sharma" />
            </div>
            <div className="modal-field">
              <label>Email *</label>
              <input type="email" className="modal-input" value={form.email}
                onChange={e => handleChange('email', e.target.value)} placeholder="priya@email.com" />
            </div>
            <div className="modal-field">
              <label>Phone</label>
              <input type="tel" className="modal-input" value={form.phone}
                onChange={e => handleChange('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="modal-field">
                <label>Plan</label>
                <select className="filter-select" value={form.plan} onChange={e => handleChange('plan', e.target.value)} style={{ width: '100%' }}>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Branch</label>
                <select className="filter-select" value={form.branch_id} onChange={e => handleChange('branch_id', Number(e.target.value))} style={{ width: '100%' }}>
                  {(branches || []).map(b => (
                    <option key={b.id} value={b.id}>{b.name || b.city}</option>
                  ))}
                  {(!branches || branches.length === 0) && (
                    <>
                      <option value={1}>Mumbai Central</option>
                      <option value={2}>Pune Fitness Hub</option>
                      <option value={3}>Bangalore Elite</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            {isEdit && (
              <div className="modal-field">
                <label>Status</label>
                <select className="filter-select" value={form.status} onChange={e => handleChange('status', e.target.value)} style={{ width: '100%' }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="frozen">Frozen</option>
                  <option value="at-risk">At Risk</option>
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
              </button>
              <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
