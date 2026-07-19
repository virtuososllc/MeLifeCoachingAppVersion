import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Send,
  Lock,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Edit3,
  MessageSquare,
  XCircle,
} from 'lucide-react';

import userApiService, {
  storage,
} from '../../apiServices/userDashboardApiService';

import { Capacitor } from '@capacitor/core';
import { GetUnlockDate } from '../../utils/TimerHelper';

// ─────────────────────────────────────────────
// ✅ Safe token getter — waits for native storage sync before reading.
// On web, storage.get() is instant. On native (Capacitor), the token
// lives in the native layer and must be synced first; if we read it
// synchronously at render time it can be null → 403.
// ─────────────────────────────────────────────
async function getToken() {
  if (Capacitor.isNativePlatform()) {
    await storage.syncFromNative(); // no-op if already synced
  }
  return storage.get('token') || sessionStorage.getItem('token') || null;
}

/* =========================================================
   ASSIGNMENT CARD
========================================================= */
const AssignmentCard = ({
  a,
  expanded,
  setExpanded,
  editing,
  setEditing,
  drafts,
  setDrafts,
  handleSubmit,
  submitting,
}) => {
  const isOpen = expanded === a._id;
  const isSubmitting = submitting === a._id;

  const statusMeta = (status) =>
    ({
      assigned: {
        label: 'New',
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.12)',
        border: 'rgba(99,102,241,0.25)',
        Icon: AlertCircle,
      },
      pending: {
        label: 'Submitted',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.25)',
        Icon: Clock,
      },
      reviewed: {
        label: 'Reviewed',
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        Icon: CheckCircle,
      },
      locked: {
        label: 'Locked',
        color: '#666',
        bg: 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.1)',
        Icon: Lock,
      },
      missed: {
        label: 'Missed',
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.12)',
        border: 'rgba(239,68,68,0.25)',
        Icon: XCircle,
      },
    }[status] || {
      label: 'Assigned',
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.12)',
      border: 'rgba(99,102,241,0.25)',
      Icon: BookOpen,
    });

  const meta = statusMeta(a.status);

  const canEdit   = a.status === 'assigned';
  const isLocked  = a.status === 'locked';
  const isMissed  = a.status === 'missed';
  const isPending = a.status === 'pending';
  const isReviewed = a.status === 'reviewed';

  return (
    <div
      style={{
        ...styles.card,
        borderColor: isOpen ? meta.border : '#222',
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          ...styles.cardHeader,
          cursor: isLocked ? 'default' : 'pointer',
        }}
        onClick={() => {
          if (isLocked) return;
          setExpanded(isOpen ? null : a._id);
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={styles.sessionName}>{a.sessionId?.title}</p>
          <p style={styles.assignedDate}>Day {a.sessionId?.dayNumber}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span
            style={{
              ...styles.statusBadge,
              background: meta.bg,
              color: meta.color,
            }}
          >
            <meta.Icon size={12} />
            {meta.label}
          </span>
          {!isLocked && (
            isOpen
              ? <ChevronUp size={18} color="#555" />
              : <ChevronDown size={18} color="#555" />
          )}
        </div>
      </div>

      {/* BODY */}
      {isOpen && !isLocked && (
        <div style={styles.cardBody}>

          {a.question && (
            <div style={styles.questionBox}>
              <p style={styles.questionLabel}>Question</p>
              <p style={styles.questionText}>{a.question}</p>
            </div>
          )}

          {a.content && !editing[a._id] && (
            <div style={styles.answerBox}>
              <p style={styles.answerLabel}>Your Answer</p>
              <p style={styles.answerContent}>{a.content}</p>
            </div>
          )}

          {a.adminReply && (
            <div style={styles.feedbackBox}>
              <div style={styles.feedbackHeader}>
                <MessageSquare size={14} color="#10b981" />
                <p style={styles.feedbackLabel}>Coach Feedback</p>
              </div>
              <p style={styles.feedbackText}>{a.adminReply}</p>
            </div>
          )}

          {editing[a._id] && canEdit && (
            <>
              <textarea
                autoFocus
                style={styles.textarea}
                rows={6}
                placeholder="Write your answer here..."
                value={drafts[a._id] || ''}
                onChange={(e) =>
                  setDrafts((p) => ({ ...p, [a._id]: e.target.value }))
                }
              />
              <div style={styles.actionRow}>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setEditing((p) => ({ ...p, [a._id]: false }))}
                >
                  Cancel
                </button>
                <button
                  style={{ ...styles.submitBtn, opacity: isSubmitting ? 0.7 : 1 }}
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(a)}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Submit Answer
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {!editing[a._id] && canEdit && (
            <button
              style={styles.editBtn}
              onClick={() => setEditing((p) => ({ ...p, [a._id]: true }))}
            >
              <Edit3 size={14} />
              {a.content ? 'Edit Answer' : 'Write Answer'}
            </button>
          )}

          {(!a._id || a._virtual) && !a.question && (
            <p style={styles.noAssignmentText}>
              No assignment has been posted for this session yet.
            </p>
          )}

          {isPending && (
            <div style={styles.lockedNotice}>
              <Clock size={15} color="#f59e0b" />
              <div>
                <p style={{ ...styles.lockedTitle, color: '#f59e0b' }}>Answer Submitted</p>
                <p style={styles.lockedSub}>
                  Your answer is under review. Editing is disabled until your coach responds.
                </p>
              </div>
            </div>
          )}

          {isReviewed && (
            <div style={styles.lockedNotice}>
              <CheckCircle size={15} color="#10b981" />
              <div>
                <p style={{ ...styles.lockedTitle, color: '#10b981' }}>Assignment Reviewed</p>
                <p style={styles.lockedSub}>Your coach has reviewed this assignment.</p>
              </div>
            </div>
          )}

          {isMissed && (
            <div style={{ ...styles.lockedNotice, background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <XCircle size={15} color="#ef4444" />
              <div>
                <p style={{ ...styles.lockedTitle, color: '#ef4444' }}>Assignment Missed</p>
                <p style={styles.lockedSub}>
                  The submission window for this session has passed. Contact your coach if you need access.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {isLocked && (
        <div style={styles.lockedCompact}>
          <Lock size={13} color="#666" />
          <span>Unlocks when this session becomes available</span>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */
const UserAssignmentsTab = ({ sessions = [], userCreatedAt }) => {
  const [assignments, setAssignments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tokenReady, setTokenReady]     = useState(false); // ✅ NEW: wait for token
  const [authToken, setAuthToken]       = useState(null);  // ✅ NEW: store resolved token
  const [expanded, setExpanded]         = useState(null);
  const [editing, setEditing]           = useState({});
  const [drafts, setDrafts]             = useState({});
  const [submitting, setSubmitting]     = useState(null);
  const [error, setError]               = useState(null);  // ✅ NEW: surface auth errors

  // ─────────────────────────────────────────────
  // ✅ Resolve token once on mount — async safe for native storage
  // ─────────────────────────────────────────────
  useEffect(() => {
    getToken().then((t) => {
      setAuthToken(t);
      setTokenReady(true);
      if (!t) {
        console.warn('⚠️ No auth token found — assignments API will fail');
        setError('You are not logged in. Please log in and try again.');
        setLoading(false);
      }
    });
  }, []);

  /* ── LOAD ─────────────────────────────────────────────── */
  const load = useCallback(async () => {
    // ✅ Don't fire until token is resolved
    if (!tokenReady || !authToken) return;

    setLoading(true);
    setError(null);
    try {
      const data = await userApiService.fetchMyAssignments(authToken);
      const real = data.assignments || [];

      const bySession = new Map();
      real.forEach((a) => {
        const sid = String(a.sessionId?._id || a.sessionId || '');
        if (sid) bySession.set(sid, a);
      });

      const now = new Date();

      const sortedSessions = [...sessions].sort(
        (s1, s2) => (s1.dayNumber || 0) - (s2.dayNumber || 0)
      );

      const merged = sortedSessions.map((s) => {
        const sid = String(s._id);
        const existing = bySession.get(sid);

        const unlockDate = GetUnlockDate(userCreatedAt, s.dayNumber);
        const hasUnlocked = unlockDate ? now >= unlockDate : false;

        const standardExpire = unlockDate
          ? new Date(unlockDate.getTime() + 24 * 60 * 60 * 1000)
          : null;
        const specialActive =
          s.hasSpecialAccess &&
          s.specialAccessExpiresAt &&
          now < new Date(s.specialAccessExpiresAt);

        const windowExpired =
          standardExpire && !specialActive && now > standardExpire;

        if (existing) {
          if (existing.status === 'assigned' && windowExpired) {
            return { ...existing, status: 'missed', sessionId: s };
          }
          return { ...existing, sessionId: existing.sessionId || s };
        }

        const virtualId = `virtual-${sid}`;
        let status = 'locked';
        if (hasUnlocked) {
          status = windowExpired ? 'missed' : 'assigned';
        }

        return {
          _id: virtualId,
          _virtual: true,
          sessionId: s,
          status,
          question: '',
          content: '',
          adminReply: '',
        };
      });

      setAssignments(merged);
    } catch (err) {
      console.error('fetchMyAssignments error:', err);
      // ✅ Surface a user-friendly error instead of silent failure
      if (err?.status === 403 || err?.message?.includes('403')) {
        setError('Session expired. Please log out and log in again.');
      } else {
        setError('Failed to load assignments. Pull to refresh.');
      }
    } finally {
      setLoading(false);
    }
  }, [authToken, tokenReady, sessions, userCreatedAt]);

  // ✅ Only run load() once token is ready
  useEffect(() => {
    if (tokenReady) load();
  }, [tokenReady, load]);

  /* ── SUBMIT ───────────────────────────────────────────── */
  const handleSubmit = async (assignment) => {
    const content = drafts[assignment._id]?.trim();
    if (!content) return;

    // ✅ Re-fetch token at submit time as a safety net
    const token = authToken || await getToken();
    if (!token) {
      setError('Not authenticated. Please log in again.');
      return;
    }

    setSubmitting(assignment._id);
    try {
      const data = await userApiService.submitAssignment(
        {
          sessionId: assignment.sessionId?._id || assignment.sessionId,
          content,
        },
        token
      );

      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignment._id
            ? { ...data.assignment, sessionId: data.assignment.sessionId || assignment.sessionId }
            : a
        )
      );

      setEditing((prev) => ({ ...prev, [assignment._id]: false }));
      setDrafts((prev) => { const n = { ...prev }; delete n[assignment._id]; return n; });
    } catch (err) {
      console.error('submitAssignment error:', err);
      if (err?.status === 403 || err?.message?.includes('403')) {
        setError('Session expired. Please log out and log in again.');
      }
    } finally {
      setSubmitting(null);
    }
  };

  /* ── GROUPS ───────────────────────────────────────────── */
  const pending   = assignments.filter((a) => a.status === 'assigned' || a.status === 'pending');
  const completed = assignments.filter((a) => a.status === 'reviewed');
  const missed    = assignments.filter((a) => a.status === 'missed');
  const locked    = assignments.filter((a) => a.status === 'locked');

  /* ── LOADING ──────────────────────────────────────────── */
  if (loading || !tokenReady) {
    return (
      <div style={styles.centerWrap}>
        <RefreshCw size={24} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#555', marginTop: 12, fontSize: '0.85rem' }}>Loading assignments...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── ERROR ────────────────────────────────────────────── */
  if (error) {
    return (
      <div style={{ ...styles.centerWrap, flexDirection: 'column', gap: 12 }}>
        <AlertCircle size={36} color="#ef4444" />
        <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', maxWidth: 280 }}>{error}</p>
        {authToken && (
          <button style={styles.editBtn} onClick={load}>
            <RefreshCw size={14} /> Try Again
          </button>
        )}
      </div>
    );
  }

  /* ── EMPTY ────────────────────────────────────────────── */
  if (assignments.length === 0) {
    return (
      <div style={{ ...styles.centerWrap, flexDirection: 'column', gap: 12 }}>
        <ClipboardList size={40} color="#333" />
        <p style={{ color: '#555', fontSize: '0.9rem' }}>No assignments yet</p>
      </div>
    );
  }

  const cardProps = { expanded, setExpanded, editing, setEditing, drafts, setDrafts, handleSubmit, submitting };

  /* ── RENDER ───────────────────────────────────────────── */
  return (
    <div style={styles.wrap}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>Assignments</h2>
        <button style={styles.refreshBtn} onClick={load} title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryPill, background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
          <AlertCircle size={13} />
          {pending.length} Pending
        </div>
        <div style={{ ...styles.summaryPill, background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
          <CheckCircle size={13} />
          {completed.length} Reviewed
        </div>
        {missed.length > 0 && (
          <div style={{ ...styles.summaryPill, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            <XCircle size={13} />
            {missed.length} Missed
          </div>
        )}
        {locked.length > 0 && (
          <div style={{ ...styles.summaryPill, background: 'rgba(255,255,255,0.06)', color: '#666' }}>
            <Lock size={13} />
            {locked.length} Locked
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <>
          <p style={styles.sectionLabel}>Active</p>
          {pending.map((a) => <AssignmentCard key={a._id} a={a} {...cardProps} />)}
        </>
      )}

      {completed.length > 0 && (
        <>
          <p style={styles.sectionLabel}>Reviewed</p>
          {completed.map((a) => <AssignmentCard key={a._id} a={a} {...cardProps} />)}
        </>
      )}

      {missed.length > 0 && (
        <>
          <p style={styles.sectionLabel}>Missed</p>
          {missed.map((a) => <AssignmentCard key={a._id} a={a} {...cardProps} />)}
        </>
      )}

      {locked.length > 0 && (
        <>
          <p style={styles.sectionLabel}>Upcoming</p>
          {locked.map((a) => <AssignmentCard key={a._id} a={a} {...cardProps} />)}
        </>
      )}
    </div>
  );
};

/* =========================================================
   STYLES
========================================================= */
const styles = {
  wrap: {
    padding: 16,
    maxWidth: 680,
    margin: '0 auto',
    paddingBottom: 80,
  },
  centerWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    flexDirection: 'column',
    gap: 8,
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    color: '#fff',
    fontSize: '1.3rem',
    fontWeight: 700,
    margin: 0,
  },
  refreshBtn: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    padding: '7px 10px',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  summaryRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  summaryPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 99,
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  sectionLabel: {
    color: '#444',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  cardHeader: {
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    gap: 12,
  },
  sessionName: {
    color: '#fff',
    fontWeight: 600,
    margin: 0,
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  assignedDate: {
    color: '#555',
    marginTop: 3,
    fontSize: '0.78rem',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: '0.72rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  cardBody: {
    padding: 16,
    borderTop: '1px solid #1a1a1a',
  },
  questionBox: { marginBottom: 14 },
  questionLabel: {
    color: '#444',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    margin: '0 0 6px 0',
  },
  questionText: {
    color: '#ddd',
    lineHeight: 1.65,
    margin: 0,
    fontSize: '0.92rem',
  },
  noAssignmentText: {
    color: '#444',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    margin: 0,
  },
  answerBox: {
    background: '#0d0d0d',
    border: '1px solid #1e1e1e',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 14,
  },
  answerLabel: {
    color: '#444',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    margin: '0 0 6px 0',
  },
  answerContent: {
    color: '#aaa',
    lineHeight: 1.65,
    margin: 0,
    fontSize: '0.88rem',
  },
  feedbackBox: {
    background: 'rgba(16,185,129,0.06)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 14,
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  feedbackLabel: {
    color: '#10b981',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    margin: 0,
  },
  feedbackText: {
    color: '#7ecfb3',
    lineHeight: 1.65,
    margin: 0,
    fontSize: '0.88rem',
  },
  textarea: {
    width: '100%',
    background: '#0d0d0d',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    color: '#fff',
    padding: '12px 14px',
    marginBottom: 12,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    fontFamily: 'inherit',
  },
  actionRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    background: 'transparent',
    color: '#555',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    padding: '9px 16px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  submitBtn: {
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '9px 18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  editBtn: {
    background: '#1a1a1a',
    color: '#ccc',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    padding: '9px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.85rem',
  },
  lockedNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #222',
    borderRadius: 10,
    padding: '12px 14px',
    marginTop: 4,
  },
  lockedTitle: {
    fontWeight: 600,
    fontSize: '0.85rem',
    margin: '0 0 3px 0',
  },
  lockedSub: {
    color: '#555',
    fontSize: '0.8rem',
    margin: 0,
    lineHeight: 1.5,
  },
  lockedCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    color: '#555',
    fontSize: '0.8rem',
  },
};

export default UserAssignmentsTab;