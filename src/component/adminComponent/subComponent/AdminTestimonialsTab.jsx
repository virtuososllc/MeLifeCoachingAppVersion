import React, { useEffect, useState } from 'react';
import { Loader2, Check, X, Trash2, Pencil, Save, AlertTriangle } from 'lucide-react';
import adminDashboardApiService from '../../../apiServices/adminDashboardApiService';
import { storage } from '../../../apiServices/userDashboardApiService';
import '../../../css/AdminTestimonialsTab.css';

const getToken = () => storage.get('token') || sessionStorage.getItem('token');

const emptyForm = { name: '', role: '', quote: '', stars: 5, avatarUrl: '' };

// `showToast(message, type)` is optional — if the parent dashboard doesn't
// pass it, toasts are just skipped. Confirmation dialogs are handled
// internally by this component so every destructive/mutating action
// (publish, unpublish, delete, update) always asks first.
const AdminTestimonialsTab = ({ showToast }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null); // testimonial being edited, or null
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Generic confirm dialog state: { title, message, tone, onConfirm }
  const [confirmState, setConfirmState] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const data = await adminDashboardApiService.fetchAllTestimonials(getToken());
      setTestimonials(data || []);
    } catch (err) {
      showToast?.(err.message || 'Failed to load testimonials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  // ── Confirm dialog helpers ───────────────────────────────────
  const askConfirm = ({ title, message, tone = 'primary', confirmLabel = 'Confirm', onConfirm }) => {
    setConfirmState({ title, message, tone, confirmLabel, onConfirm });
  };

  const closeConfirm = () => {
    if (confirmBusy) return;
    setConfirmState(null);
  };

  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmBusy(true);
    try {
      await confirmState.onConfirm();
      setConfirmState(null);
    } finally {
      setConfirmBusy(false);
    }
  };

  // ── Actions ───────────────────────────────────────────────────
  const doTogglePublish = async (t) => {
    try {
      await adminDashboardApiService.toggleTestimonialPublish(t._id, getToken());
      showToast?.(t.isPublished ? 'Testimonial unpublished' : 'Testimonial published', 'success');
      loadTestimonials();
    } catch (err) {
      showToast?.(err.message || 'Failed to update testimonial', 'error');
    }
  };

  const handleTogglePublish = (t) => {
    askConfirm({
      title: t.isPublished ? 'Unpublish Testimonial' : 'Publish Testimonial',
      message: t.isPublished
        ? `"${t.name}"'s testimonial will be hidden from the public site.`
        : `"${t.name}"'s testimonial will become visible on the public site.`,
      tone: 'primary',
      confirmLabel: t.isPublished ? 'Unpublish' : 'Publish',
      onConfirm: () => doTogglePublish(t),
    });
  };

  const doDelete = async (id) => {
    try {
      await adminDashboardApiService.deleteTestimonial(id, getToken());
      showToast?.('Testimonial deleted', 'success');
      loadTestimonials();
    } catch (err) {
      showToast?.(err.message || 'Failed to delete testimonial', 'error');
    }
  };

  const handleDelete = (t) => {
    askConfirm({
      title: 'Delete Testimonial',
      message: `Delete the testimonial from "${t.name}"? This cannot be undone.`,
      tone: 'danger',
      confirmLabel: 'Delete',
      onConfirm: () => doDelete(t._id),
    });
  };

  // ── Edit modal handlers ───────────────────────────────────────
  const openEdit = (t) => {
    setForm({
      name: t.name || '',
      role: t.role || '',
      quote: t.quote || '',
      stars: t.stars || 5,
      avatarUrl: t.avatarUrl || '',
    });
    setEditing(t);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
    setForm(emptyForm);
  };

  const handleFormChange = (field) => (e) => {
    const value = field === 'stars' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const doSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminDashboardApiService.updateTestimonial(editing._id, form, getToken());
      showToast?.('Testimonial updated', 'success');
      setEditing(null);
      setForm(emptyForm);
      loadTestimonials();
    } catch (err) {
      showToast?.(err.message || 'Failed to update testimonial', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditClick = () => {
    if (!form.name.trim() || !form.quote.trim()) {
      showToast?.('Name and quote are required', 'error');
      return;
    }
    askConfirm({
      title: 'Save Changes',
      message: `Update the testimonial from "${form.name}"?`,
      tone: 'primary',
      confirmLabel: 'Save',
      onConfirm: doSaveEdit,
    });
  };

  const getInitials = (name) => (name || '?').charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="att-loading">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const pending = testimonials.filter((t) => !t.isPublished);
  const published = testimonials.filter((t) => t.isPublished);
  const hasPending = pending.length > 0;

  const renderCard = (t) => (
    <div key={t._id} className="att-card">
      <div className="att-card-top">
        <div className="att-identity">
          {t.avatarUrl ? (
            <img src={t.avatarUrl} alt={t.name} className="att-avatar" />
          ) : (
            <div className="att-avatar-fallback">{getInitials(t.name)}</div>
          )}
          <div>
            <div className="att-name">{t.name}</div>
            <div className="att-role">{t.role}</div>
            <div className="att-stars">{'★'.repeat(t.stars || 5)}</div>
          </div>
        </div>

        <span
          className={`att-status-badge ${
            t.isPublished ? 'att-status-badge--published' : 'att-status-badge--pending'
          }`}
        >
          {t.isPublished ? 'Published' : 'Pending'}
        </span>
      </div>

      <p className="att-quote">{t.quote}</p>

      <div className="att-divider" />

      <div className="att-actions">
        <button
          className={`att-btn ${t.isPublished ? 'att-btn--unpublish' : 'att-btn--publish'}`}
          onClick={() => handleTogglePublish(t)}
          title={t.isPublished ? 'Unpublish' : 'Publish'}
        >
          {t.isPublished ? <X size={14} /> : <Check size={14} />}
          {t.isPublished ? 'Unpublish' : 'Publish'}
        </button>

        <button className="att-btn att-btn--edit" onClick={() => openEdit(t)} title="Update">
          <Pencil size={14} />
          Update
        </button>

        <button className="att-btn att-btn--delete" onClick={() => handleDelete(t)} title="Delete">
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="att-page">
      <div className="att-header">
        <div className="att-badge">Admin</div>
        <h2 className="att-title">Testimonials</h2>
        <p className="att-subtitle">
          {hasPending
            ? 'Review, publish, and update client testimonials'
            : 'All caught up — here are your published testimonials'}
        </p>
      </div>

      {hasPending ? (
        <div className="att-columns">
          <div>
            <div className="att-section-title">
              Pending Approval
              <span className="att-count-pill">{pending.length}</span>
            </div>
            {pending.map(renderCard)}
          </div>

          <div>
            <div className="att-section-title">
              Published
              <span className="att-count-pill">{published.length}</span>
            </div>
            {published.length === 0 ? (
              <p className="att-empty">No published testimonials yet.</p>
            ) : (
              published.map(renderCard)
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="att-section-title" style={{ justifyContent: 'center', marginBottom: 24 }}>
            Published
            <span className="att-count-pill">{published.length}</span>
          </div>

          {published.length === 0 ? (
            <p className="att-empty" style={{ textAlign: 'center' }}>
              No published testimonials yet.
            </p>
          ) : (
            <div className="att-grid">
              {published.map(renderCard)}
            </div>
          )}
        </>
      )}

      {/* ── Edit modal ── */}
      {editing && (
        <div className="att-modal-overlay" onClick={closeEdit}>
          <div className="att-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="att-modal-title">Update Testimonial</h3>

            <div className="att-field">
              <label className="att-label">Name</label>
              <input
                className="att-input"
                value={form.name}
                onChange={handleFormChange('name')}
              />
            </div>

            <div className="att-field">
              <label className="att-label">Role</label>
              <input
                className="att-input"
                value={form.role}
                onChange={handleFormChange('role')}
              />
            </div>

            <div className="att-field">
              <label className="att-label">Avatar URL</label>
              <input
                className="att-input"
                value={form.avatarUrl}
                onChange={handleFormChange('avatarUrl')}
                placeholder="https://..."
              />
            </div>

            <div className="att-field">
              <label className="att-label">Stars</label>
              <select
                className="att-select"
                value={form.stars}
                onChange={handleFormChange('stars')}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="att-field">
              <label className="att-label">Quote</label>
              <textarea
                className="att-textarea"
                value={form.quote}
                onChange={handleFormChange('quote')}
              />
            </div>

            <div className="att-modal-actions">
              <button className="att-modal-btn att-modal-btn--cancel" onClick={closeEdit} disabled={saving}>
                Cancel
              </button>
              <button
                className="att-modal-btn att-modal-btn--save"
                onClick={handleSaveEditClick}
                disabled={saving}
              >
                <Save size={14} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm dialog (used for publish / unpublish / delete / save) ── */}
      {confirmState && (
        <div className="att-modal-overlay" onClick={closeConfirm}>
          <div className="att-confirm-modal" onClick={(e) => e.stopPropagation()}>
            {confirmState.tone === 'danger' && (
              <AlertTriangle size={28} color="#f87171" style={{ marginBottom: 10 }} />
            )}
            <h3 className="att-confirm-title">{confirmState.title}</h3>
            <p className="att-confirm-message">{confirmState.message}</p>
            <div className="att-confirm-actions">
              <button
                className="att-confirm-btn att-confirm-btn--cancel"
                onClick={closeConfirm}
                disabled={confirmBusy}
              >
                Cancel
              </button>
              <button
                className={`att-confirm-btn ${
                  confirmState.tone === 'danger' ? 'att-confirm-btn--danger' : 'att-confirm-btn--primary'
                }`}
                onClick={runConfirm}
                disabled={confirmBusy}
              >
                {confirmBusy && <Loader2 className="animate-spin" size={14} />}
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonialsTab;