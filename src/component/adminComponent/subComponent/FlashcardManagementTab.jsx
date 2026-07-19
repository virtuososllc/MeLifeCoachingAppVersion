import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, User, Lock, X } from 'lucide-react';
import adminDashboardApiService from '../../../apiServices/adminDashboardApiService';

const FlashcardManagementTab = ({ users, showToast }) => {
  const [cards, setCards]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [filter, setFilter]       = useState('all');
  const [form, setForm]           = useState({
    cardNumber: '', title: '', tagline: '', content: '',
    type: 'fixed', assignedTo: []   // ← now an array
  });
  const [saving, setSaving]       = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({
  open: false,
  type: '', // create | update | delete
  title: '',
  message: '',
  action: null
});

  const token = sessionStorage.getItem('token');

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminDashboardApiService.fetchAllFlashcards(token);
      setCards(res.cards || []);
    } catch { showToast('Failed to load flashcards', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ cardNumber: '', title: '', tagline: '', content: '', type: 'fixed', assignedTo: [] });
    setUserSearch('');
    setShowModal(true);
  };

  const openEdit = (card) => {
    setEditing(card);
    // Normalise assignedTo to array of id strings
    const assigned = Array.isArray(card.assignedTo)
      ? card.assignedTo.map(u => (typeof u === 'object' ? u._id : u))
      : card.assignedTo
        ? [typeof card.assignedTo === 'object' ? card.assignedTo._id : card.assignedTo]
        : [];
    setForm({
      cardNumber: card.cardNumber,
      title:      card.title,
      tagline:    card.tagline,
      content:    card.content,
      type:       card.type,
      assignedTo: assigned
    });
    setUserSearch('');
    setShowModal(true);
  };

  const toggleUser = (uid) => {
    setForm(p => ({
      ...p,
      assignedTo: p.assignedTo.includes(uid)
        ? p.assignedTo.filter(id => id !== uid)
        : [...p.assignedTo, uid]
    }));
  };

 const handleSave = async () => {
  if (!form.title || !form.tagline || !form.content) {
    showToast('Title, tagline, and content are required.', 'error');
    return;
  }

  if (form.type === 'custom' && form.assignedTo.length === 0) {
    showToast('Please select at least one user for a custom card.', 'error');
    return;
  }

  const payload = {
    title: form.title,
    tagline: form.tagline,
    content: form.content,
    type: form.type,
    assignedTo: form.type === 'custom' ? form.assignedTo : []
  };

  const proceedSave = async () => {
    try {
      setSaving(true);

      if (editing) {
        await adminDashboardApiService.updateFlashcard(
          editing._id,
          payload,
          token
        );

        showToast('Flashcard updated', 'success');
      } else {
        await adminDashboardApiService.createFlashcard(
          {
            ...payload,
            cardNumber: Number(form.cardNumber)
          },
          token
        );

        showToast('Flashcard created', 'success');
      }

      setShowModal(false);
      load();

    } catch (e) {
      console.error('FLASHCARD SAVE ERROR:', e);

      showToast(
        e.message || 'Save failed',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  setConfirmModal({
    open: true,
    type: editing ? 'update' : 'create',
    title: editing ? `Update ${form.tagline} Flashcard?` : `Create ${form.tagline} Flashcard?`,
    message: editing
      ? `Are you sure you want to update this flashcard? `
      : `Are you sure you want to create this flashcard? `,
    action: proceedSave
  });
};

const handleDelete = async (id) => {
  const proceedDelete = async () => {
    try {
      await adminDashboardApiService.deleteFlashcard(id, token);

      showToast('Flashcard deleted', 'success');

      load();
    } catch (e) {
      console.error('FLASHCARD DELETE ERROR:', e);

      showToast(
        e.message || 'Delete failed',
        'error'
      );
    }
  };

  setConfirmModal({
    open: true,
    type: 'delete',
    title: `Delete ${form.tagline} Flashcard?`,
    message: `Are you sure you want to delete the flashcard ?`,
    action: proceedDelete
  });
};

  const filtered     = cards.filter(c => filter === 'all' ? true : c.type === filter);
  const fixedCount   = cards.filter(c => c.type === 'fixed').length;
  const customCount  = cards.filter(c => c.type === 'custom').length;
  const eligibleUsers = users.filter(u => u.role === 'user');
  const filteredUsers = eligibleUsers.filter(u =>
    !userSearch ||
    u.Name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  /* ─── styles ─────────────────────────────────────────────────────────────── */
  const inputStyle = {
    width: '100%', background: '#2a2a2e', border: '1px solid #3a3a3e',
    borderRadius: 8, padding: '8px 12px', color: '#fff',
    fontSize: '0.88rem', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.78rem', color: '#a1a1aa', display: 'block', marginBottom: 5 };

  return (
    <div style={{ padding: '0 4px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'fixed', 'custom'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`}
              style={{ textTransform: 'capitalize', opacity: filter === f ? 1 : 0.5 }}>
              {f} {f === 'fixed' ? `(${fixedCount})` : f === 'custom' ? `(${customCount})` : `(${cards.length})`}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> New Flashcard
        </button>
      </div>

      {/* ── Cards grid ── */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>No flashcards found.</p>
      ) : (
        <div className="sa-grid">
          {filtered.map(card => {
            const assignees = Array.isArray(card.assignedTo) ? card.assignedTo : (card.assignedTo ? [card.assignedTo] : []);
            return (
              <div key={card._id} className="sa-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>#{card.cardNumber}</span>
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                    background: card.type === 'fixed' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)',
                    color: card.type === 'fixed' ? '#818cf8' : '#4ade80',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {card.type === 'fixed' ? <Lock size={9} /> : <User size={9} />}
                    {card.type}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4, color: '#fff' }}>{card.title}</h3>
                <p style={{ fontSize: '0.78rem', color: '#a1a1aa', fontStyle: 'italic', marginBottom: 8 }}>"{card.tagline}"</p>
                <p style={{ fontSize: '0.75rem', color: '#71717a', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {card.content}
                </p>

                {/* Multiple assigned users */}
                {card.type === 'custom' && assignees.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {assignees.map((u, i) => (
                      <span key={i} style={{
                        fontSize: '0.7rem', color: '#60a5fa',
                        background: 'rgba(96,165,250,0.08)', padding: '3px 7px', borderRadius: 6
                      }}>
                        👤 {u.Name || u.email || 'User'}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => openEdit(card)} className="btn btn-sm btn-primary" style={{ flex: 1 }}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(card._id)} className="btn btn-sm btn-danger">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          {/* Modal shell — fixed height with internal scroll */}
          <div style={{
            background: '#1c1c1e', borderRadius: 16, width: '100%', maxWidth: 500,
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth',
            scrollbarColor: '#3a3a3e #1c1c1e',
            scrollbarGutter: 'stable',
          }}>

            {/* Sticky header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px 16px', borderBottom: '1px solid #2a2a2e', flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                {editing ? 'Edit Flashcard' : 'New Flashcard'}
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1, minHeight: 0 }}>

              {/* Card Number */}
              {!editing && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Card Number</label>
                  <input type="number" value={form.cardNumber}
                    onChange={e => setForm(p => ({ ...p, cardNumber: e.target.value }))}
                    style={inputStyle} />
                </div>
              )}

              {/* Title */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Title</label>
                <input type="text" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  style={inputStyle} />
              </div>

              {/* Tagline */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Tagline</label>
                <input type="text" value={form.tagline}
                  onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
                  style={inputStyle} />
              </div>

              {/* Content */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Content</label>
                <textarea rows={4} value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Type */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Type</label>
                <select value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value, assignedTo: [] }))}
                  style={inputStyle}>
                  <option value="fixed">Fixed — visible to all users</option>
                  <option value="custom">Custom — assigned to selected users</option>
                </select>
              </div>

              {/* Multi-user picker */}
              {form.type === 'custom' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>
                    Assign to Users
                    <span style={{ marginLeft: 6, color: '#818cf8', fontWeight: 600 }}>
                      {form.assignedTo.length > 0 ? `${form.assignedTo.length} selected` : ''}
                    </span>
                  </label>

                  {/* Selected chips */}
                  {form.assignedTo.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {form.assignedTo.map(uid => {
                        const u = eligibleUsers.find(x => x._id === uid);
                        return u ? (
                          <span key={uid} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: 'rgba(99,102,241,0.18)', color: '#a5b4fc',
                            fontSize: '0.72rem', padding: '3px 8px', borderRadius: 99, fontWeight: 500
                          }}>
                            {u.Name}
                            <span onClick={() => toggleUser(uid)}
                              style={{ cursor: 'pointer', opacity: 0.7, lineHeight: 1 }}>×</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Search */}
                  <input type="text" placeholder="Search users…" value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 6, color: '#ccc' }} />

                  {/* Scrollable user list */}
                  <div style={{
                    maxHeight: 180, overflowY: 'auto', border: '1px solid #3a3a3e',
                    borderRadius: 8, background: '#18181b'
                  }}>
                    {filteredUsers.length === 0 ? (
                      <p style={{ padding: '10px 12px', color: '#555', fontSize: '0.8rem', margin: 0 }}>No users found.</p>
                    ) : filteredUsers.map(u => {
                      const selected = form.assignedTo.includes(u._id);
                      return (
                        <div key={u._id} onClick={() => toggleUser(u._id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', cursor: 'pointer',
                            background: selected ? 'rgba(99,102,241,0.12)' : 'transparent',
                            borderBottom: '1px solid #2a2a2e', transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
                          {/* Checkbox */}
                          <div style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                            border: selected ? 'none' : '1.5px solid #555',
                            background: selected ? '#6366f1' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {selected && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', color: '#e4e4e7', fontWeight: 500 }}>{u.Name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#71717a' }}>{u.email}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer */}
            <div style={{
              display: 'flex', gap: 10, padding: '16px 24px',
              borderTop: '1px solid #2a2a2e', flexShrink: 0
            }}>
              <button onClick={() => setShowModal(false)}
                className="btn btn-sm" style={{ flex: 1, opacity: 0.6 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="btn btn-primary btn-sm" style={{ flex: 2 }}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmModal.open && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backdropFilter: 'blur(6px)'
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        background: '#1c1c1e',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid #2f2f35',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '22px 24px 14px',
          borderBottom: '1px solid #2a2a2e'
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            marginBottom: 16,
            background:
              confirmModal.type === 'delete'
                ? 'rgba(239,68,68,0.15)'
                : 'rgba(99,102,241,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {confirmModal.type === 'delete' ? (
            <Trash2 size={24} color="#ef4444" />
          ) : (
            <Lock size={24} color="#818cf8" />
          )}
        </div>

        <h3
          style={{
            margin: 0,
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: 700
          }}
        >
          {confirmModal.title}
        </h3>

        <p
          style={{
            marginTop: 8,
            marginBottom: 0,
            color: '#9ca3af',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}
        >
          {confirmModal.message}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: 20
        }}
      >
        <button
          onClick={() =>
            setConfirmModal({
              open: false,
              type: '',
              title: '',
              message: '',
              action: null
            })
          }
          className="btn btn-sm"
          style={{
            flex: 1,
            opacity: 0.7
          }}
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            const action = confirmModal.action;

            setConfirmModal({
              open: false,
              type: '',
              title: '',
              message: '',
              action: null
            });

            if (action) {
              await action();
            }
          }}
          className={`btn btn-sm ${
            confirmModal.type === 'delete'
              ? 'btn-danger'
              : 'btn-primary'
          }`}
          style={{
            flex: 1.4
          }}
        >
          {confirmModal.type === 'delete'
            ? 'Yes, Delete'
            : confirmModal.type === 'update'
            ? 'Yes, Update'
            : 'Yes, Create'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default FlashcardManagementTab;
