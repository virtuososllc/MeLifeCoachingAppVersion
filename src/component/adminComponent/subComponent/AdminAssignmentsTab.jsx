import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Lock, Unlock, Send, Search,
  ChevronDown, ChevronUp, Plus, Users, X,
  CheckCircle, Clock, AlertCircle, Trash2,
  BookOpen, ChevronRight, ChevronLeft, XCircle,
} from 'lucide-react';
import adminDashboardApiService from '../../../apiServices/adminDashboardApiService';
import { storage } from '../../../apiServices/userDashboardApiService';
import '../../../css/AdminAssignments.css';

const getToken = () =>
  storage.get('token') || sessionStorage.getItem('token');

/* ── status helpers ──────────────────────────────────────── */
const STATUS = {
  assigned: { label: 'Assigned',  color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  Icon: AlertCircle },
  pending:  { label: 'Submitted', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  Icon: Clock       },
  reviewed: { label: 'Reviewed',  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  Icon: CheckCircle },
  locked:   { label: 'Locked',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   Icon: Lock        },
  missed:   { label: 'Missed',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   Icon: XCircle     },
};
const statusMeta = (s) => STATUS[s] ?? { label: s, color: '#888', bg: '#1a1a1a', Icon: BookOpen };

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';

/* ── initials avatar ─────────────────────────────────────── */
const Avatar = ({ name }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return <div className="aa-avatar">{initials}</div>;
};

/* ── single assignment row (inside user group) ───────────── */
const AssignmentRow = ({
  a, expanded, setExpanded,
  replyDraft, setReplyDraft,
  handleReply, handleToggleLock, handleDelete,
  replyLoading, lockLoading, deleteLoading,
}) => {
  const isOpen = expanded === a._id;
  const meta   = statusMeta(a.status);
  const canUnlock = a.status === 'locked' || a.status === 'missed';

  return (
    <div className={`aa-row ${isOpen ? 'open' : ''}`}>
      {/* row header */}
      <div className="aa-row-head" onClick={() => setExpanded(isOpen ? null : a._id)}>
        <div className="aa-row-left">
          <span className="aa-day-tag" style={{ background: meta.bg, color: meta.color }}>
            Day {a.sessionId?.dayNumber ?? '—'}
          </span>
          <div className="aa-row-info">
            <span className="aa-row-session">{a.sessionId?.title || '—'}</span>
            <span className="aa-row-date">{fmtDate(a.submittedAt || a.assignedAt)}</span>
          </div>
        </div>
        <div className="aa-row-right">
          <span className="aa-badge" style={{ background: meta.bg, color: meta.color }}>
            <meta.Icon size={10} />
            {meta.label}
          </span>
          {isOpen ? <ChevronUp size={14} color="#555" /> : <ChevronDown size={14} color="#555" />}
        </div>
      </div>

      {/* expanded body */}
      {isOpen && (
        <div className="aa-row-body">

          {/* Question */}
          {a.question && (
            <div className="aa-box">
              <p className="aa-micro">Question</p>
              <p className="aa-body-text aa-muted">{a.question}</p>
            </div>
          )}

          {/* Submission */}
          {a.content ? (
            <div className="aa-box">
              <p className="aa-micro">User's Answer</p>
              <p className="aa-body-text">{a.content}</p>
            </div>
          ) : (
            <p className="aa-no-submission">No answer submitted yet.</p>
          )}

          {/* Missed notice */}
          {a.status === 'missed' && (
            <div className="aa-box" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.15)' }}>
              <p className="aa-micro" style={{ color: '#ef4444' }}>Missed</p>
              <p className="aa-body-text aa-muted">
                The submission window for this session has passed. Click "Unlock" to allow this user to submit.
              </p>
            </div>
          )}

          {/* Existing reply */}
          {a.adminReply && (
            <div className="aa-box aa-box-green">
              <p className="aa-micro aa-green">Your Reply</p>
              <p className="aa-body-text aa-green-text">{a.adminReply}</p>
            </div>
          )}

          {/* Reply textarea */}
          <div>
            <p className="aa-micro">{a.adminReply ? 'Update Reply' : 'Add Reply'}</p>
            <textarea
              className="aa-textarea"
              rows={3}
              placeholder="Write feedback for the student…"
              value={replyDraft[a._id] ?? (a.adminReply || '')}
              disabled={replyLoading === a._id}
              onChange={e => setReplyDraft(p => ({ ...p, [a._id]: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="aa-actions">
            <button
              className="aa-btn aa-btn-lock"
              onClick={() => handleToggleLock(a._id)}
              disabled={lockLoading === a._id}
            >
              {lockLoading === a._id
                ? <RefreshCw size={12} className="spinning" />
                : canUnlock
                  ? <><Unlock size={12} /> Unlock</>
                  : <><Lock size={12} /> Lock</>
              }
            </button>
            <button
              className="aa-btn aa-btn-delete"
              onClick={() => handleDelete(a._id)}
              disabled={deleteLoading === a._id}
            >
              {deleteLoading === a._id
                ? <RefreshCw size={12} className="spinning" />
                : <><Trash2 size={12} /> Delete</>
              }
            </button>
            <button
              className={`aa-btn aa-btn-reply ${(!replyDraft[a._id]?.trim() || replyLoading === a._id) ? 'disabled' : ''}`}
              onClick={() => handleReply(a)}
              disabled={!replyDraft[a._id]?.trim() || replyLoading === a._id}
            >
              {replyLoading === a._id
                ? <><RefreshCw size={12} className="spinning" /> Sending…</>
                : <><Send size={12} /> {a.adminReply ? 'Update Reply' : 'Send Reply'}</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── user group card ─────────────────────────────────────── */
const UserGroup = ({ group, ...rowProps }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pendingCount = group.assignments.filter(a => a.status === 'pending').length;
  const missedCount  = group.assignments.filter(a => a.status === 'missed').length;

  return (
    <div className="aa-group">
      {/* group header */}
      <div className="aa-group-head" onClick={() => setCollapsed(p => !p)}>
        <div className="aa-group-left">
          <Avatar name={group.name} />
          <div>
            <p className="aa-group-name">{group.name}</p>
            <p className="aa-group-sub">
              {group.email} · {group.assignments.length} assignment{group.assignments.length !== 1 ? 's' : ''}
              {pendingCount > 0 && (
                <span className="aa-pending-pill">{pendingCount} pending</span>
              )}
              {missedCount > 0 && (
                <span className="aa-pending-pill" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                  {missedCount} missed
                </span>
              )}
            </p>
          </div>
        </div>
        {collapsed
          ? <ChevronRight size={16} color="#444" />
          : <ChevronDown  size={16} color="#444" />
        }
      </div>

      {/* assignment rows */}
      {!collapsed && (
        <div className="aa-group-rows">
          {group.assignments.map(a => (
            <AssignmentRow key={a._id} a={a} {...rowProps} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── post panel ─────────────────────────────────────────── */
const PostPanel = ({
  postForm, setPostForm,
  postMode, setPostMode,
  selectedUsers, setSelectedUsers,
  sessions, userStudents,
  posting, handlePost, onClose,
}) => (
  <div className="aa-post-panel">
    <div className="aa-post-head">
      <h3 className="aa-post-title">Post New Assignment</h3>
      <button className="aa-icon-btn" onClick={onClose}><X size={16} /></button>
    </div>

    <label className="aa-label">Session</label>
    <select
      className="aa-select"
      value={postForm.sessionId}
      onChange={e => setPostForm(p => ({ ...p, sessionId: e.target.value }))}
    >
      <option value="">Select a session…</option>
      {sessions.map(s => (
        <option key={s._id} value={s._id}>Day {s.dayNumber} — {s.title}</option>
      ))}
    </select>

    <label className="aa-label">Send To</label>
    <div className="aa-toggle-row">
      <button
        className={`aa-toggle-btn ${postMode === 'all' ? 'active' : ''}`}
        onClick={() => setPostMode('all')}
      >
        <Users size={13} /> All Users ({userStudents.length})
      </button>
      <button
        className={`aa-toggle-btn ${postMode === 'select' ? 'active' : ''}`}
        onClick={() => setPostMode('select')}
      >
        Select Users
      </button>
    </div>

    {postMode === 'select' && (
      <div className="aa-user-picker">
        {userStudents.map(u => (
          <label key={u._id} className="aa-user-row">
            <input
              type="checkbox"
              checked={selectedUsers.includes(u._id)}
              onChange={e =>
                setSelectedUsers(p =>
                  e.target.checked ? [...p, u._id] : p.filter(id => id !== u._id)
                )
              }
              style={{ accentColor: '#6366f1' }}
            />
            <span className="aa-user-name">{u.Name}</span>
            <span className="aa-user-email">{u.email}</span>
          </label>
        ))}
      </div>
    )}

    <label className="aa-label">Question</label>
    <textarea
      className="aa-textarea"
      rows={4}
      placeholder="Write the assignment question or prompt…"
      value={postForm.question}
      onChange={e => setPostForm(p => ({ ...p, question: e.target.value }))}
    />

    <button
      className={`aa-post-submit ${posting ? 'disabled' : ''}`}
      disabled={posting}
      onClick={handlePost}
    >
      {posting
        ? <><RefreshCw size={14} className="spinning" /> Posting…</>
        : <><Send size={14} /> Post & Notify Users</>
      }
    </button>
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const AdminAssignmentsTab = ({ users = [], sessions = [], showToast = () => {} }) => {
  const [assignments,    setAssignments]   = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [filterStatus,   setFilterStatus]  = useState('');
  const [filterSession,  setFilterSession] = useState('');
  const [searchQuery,    setSearchQuery]   = useState('');
  const [expanded,       setExpanded]      = useState(null);
  const [replyDraft,     setReplyDraft]    = useState({});
  const [replyLoading,   setReplyLoading]  = useState(null);
  const [lockLoading,    setLockLoading]   = useState(null);
  const [deleteLoading,  setDeleteLoading] = useState(null);

  // mobile: list vs detail
  const [isMobile,     setIsMobile]     = useState(window.innerWidth <= 768);
  const [mobileView,   setMobileView]   = useState('list'); // 'list' | 'post'

  // post panel
  const [showPost,      setShowPost]      = useState(false);
  const [postForm,      setPostForm]      = useState({ sessionId: '', question: '' });
  const [postMode,      setPostMode]      = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [posting,       setPosting]       = useState(false);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  /* ── fetch ──────────────────────────────────────────────── */
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus)  filters.status    = filterStatus;
      if (filterSession) filters.sessionId = filterSession;
      const data = await adminDashboardApiService.fetchAllAssignments(filters, getToken());
      setAssignments(data.assignments || []);
    } catch {
      showToast('Failed to load assignments.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSession]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  /* ── post ───────────────────────────────────────────────── */
  const handlePost = async () => {
    if (!postForm.sessionId || !postForm.question.trim()) {
      showToast('Please select a session and write a question.', 'error'); return;
    }
    if (postMode === 'select' && selectedUsers.length === 0) {
      showToast('Please select at least one user.', 'error'); return;
    }
    setPosting(true);
    try {
      const userIds = postMode === 'all' ? 'all' : selectedUsers;
      const data    = await adminDashboardApiService.postAssignment(
        { ...postForm, userIds, question: postForm.question.trim() }, getToken()
      );
      showToast(`Assignment posted to ${data.count} user(s).`, 'success');
      setPostForm({ sessionId: '', question: '' });
      setSelectedUsers([]);
      setShowPost(false);
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Failed to post.', 'error');
    } finally {
      setPosting(false);
    }
  };

  /* ── reply ──────────────────────────────────────────────── */
  const handleReply = async (a) => {
    const reply = replyDraft[a._id]?.trim();
    if (!reply) return;
    setReplyLoading(a._id);
    try {
      const data = await adminDashboardApiService.replyToAssignment(a._id, reply, getToken());
      setAssignments(p => p.map(x => x._id === data.assignment._id ? data.assignment : x));
      setReplyDraft(p => ({ ...p, [a._id]: '' }));
      showToast('Reply sent.', 'success');
    } catch {
      showToast('Failed to send reply.', 'error');
    } finally {
      setReplyLoading(null);
    }
  };

  /* ── lock toggle ────────────────────────────────────────── */
  const handleToggleLock = async (id) => {
    setLockLoading(id);
    try {
      const data = await adminDashboardApiService.toggleAssignmentLock(id, getToken());
      setAssignments(p => p.map(a => a._id === data.assignment._id ? data.assignment : a));
      const newStatus = data.assignment.status;
      showToast(
        newStatus === 'locked' ? 'Locked.' : 'Unlocked — user can now submit.',
        'success'
      );
    } catch {
      showToast('Failed to toggle lock.', 'error');
    } finally {
      setLockLoading(null);
    }
  };

  /* ── delete ─────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment? This cannot be undone.')) return;
    setDeleteLoading(id);
    try {
      await adminDashboardApiService.deleteAssignment(id, getToken());
      setAssignments(p => p.filter(a => a._id !== id));
      showToast('Deleted.', 'success');
    } catch {
      showToast('Failed to delete.', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ── filter + group ─────────────────────────────────────── */
  const filtered = assignments.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      (!searchQuery ||
        (a.userId?.Name  || '').toLowerCase().includes(q) ||
        (a.userId?.email || '').toLowerCase().includes(q) ||
        (a.sessionId?.title || '').toLowerCase().includes(q))
    );
  });

  // group by userId
  const groups = Object.values(
    filtered.reduce((acc, a) => {
      const uid = a.userId?._id || 'unknown';
      if (!acc[uid]) acc[uid] = { uid, name: a.userId?.Name || 'Unknown', email: a.userId?.email || '', assignments: [] };
      acc[uid].assignments.push(a);
      return acc;
    }, {})
  ).sort((a, b) => a.name.localeCompare(b.name));

  const userStudents = users.filter(u => u.role === 'user');

  const rowProps = {
    expanded, setExpanded,
    replyDraft, setReplyDraft,
    handleReply, handleToggleLock, handleDelete,
    replyLoading, lockLoading, deleteLoading,
  };

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="aa-wrap">

      {/* Top bar */}
      <div className="aa-topbar">
        <h2 className="aa-title">Assignments</h2>
        <div className="aa-top-actions">
          <button className="aa-refresh-btn" onClick={fetchAssignments} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
          <button className="aa-post-btn" onClick={() => setShowPost(p => !p)}>
            <Plus size={15} /> Post Assignment
          </button>
        </div>
      </div>

      {/* Post panel */}
      {showPost && (
        <PostPanel
          postForm={postForm}
          setPostForm={setPostForm}
          postMode={postMode}
          setPostMode={setPostMode}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          sessions={sessions}
          userStudents={userStudents}
          posting={posting}
          handlePost={handlePost}
          onClose={() => setShowPost(false)}
        />
      )}

      {/* Filter bar */}
      <div className="aa-filter-bar">
        <div className="aa-search-wrap">
          <Search size={14} color="#555" />
          <input
            className="aa-search-input"
            placeholder="Search user or session…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="aa-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="pending">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="locked">Locked</option>
          <option value="missed">Missed</option>
        </select>
        <select className="aa-filter-select" value={filterSession} onChange={e => setFilterSession(e.target.value)}>
          <option value="">All Sessions</option>
          {sessions.map(s => (
            <option key={s._id} value={s._id}>Day {s.dayNumber} — {s.title}</option>
          ))}
        </select>
      </div>

      {/* Summary pills */}
      {!loading && assignments.length > 0 && (
        <div className="aa-summary-row">
          {['pending','assigned','reviewed','locked','missed'].map(st => {
            const count = assignments.filter(a => a.status === st).length;
            if (!count) return null;
            const m = statusMeta(st);
            return (
              <button
                key={st}
                className={`aa-summary-pill ${filterStatus === st ? 'active' : ''}`}
                style={{ '--pill-color': m.color, '--pill-bg': m.bg }}
                onClick={() => setFilterStatus(filterStatus === st ? '' : st)}
              >
                <m.Icon size={12} /> {count} {m.label}
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="aa-center">
          <RefreshCw size={20} className="spinning" style={{ color: '#6366f1' }} />
          <span className="aa-center-text">Loading…</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="aa-center">
          <BookOpen size={28} color="#333" />
          <p className="aa-center-text">No assignments found.</p>
        </div>
      ) : (
        <div className="aa-groups">
          {groups.map(g => (
            <UserGroup key={g.uid} group={g} {...rowProps} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAssignmentsTab; 