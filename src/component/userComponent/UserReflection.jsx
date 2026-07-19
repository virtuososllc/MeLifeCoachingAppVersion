import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Lock, MessageSquare, Send,
  Clock, CheckCircle, ChevronLeft, RefreshCw,
  BookOpen, Pencil,
} from 'lucide-react';

import userApiService, { storage } from '../../apiServices/userDashboardApiService';
import { GetUnlockDate } from '../../utils/TimerHelper';
import '../../css/userReflection.css';

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const getToken = () =>
  storage.get('token') || sessionStorage.getItem('token');

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
};

/* ─────────────────────────────────────────────────────────
   SESSION ITEM
───────────────────────────────────────────────────────── */
const SessionItem = ({ session, isActive, isLocked, hasThought, hasReply, onClick }) => (
  <div
    onClick={onClick}
    className={`refl-session-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
  >
    <div className="refl-item-meta">
      <span className="refl-day-label">Day {session.dayNumber}</span>
      {hasReply && <span className="refl-reply-badge">Reply</span>}
    </div>

    <div className="refl-item-title">
      {isLocked
        ? <Lock size={11} color="#555" />
        : hasThought
          ? <Pencil size={11} color="#888" />
          : <BookOpen size={11} color="#888" />
      }
      <span>{session.title}</span>
    </div>

    <div className="refl-item-preview">
      {isLocked
        ? 'Complete session to unlock'
        : hasThought ? 'View entries…' : 'Start writing…'
      }
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────── */
const Bubble = ({ msg }) => {
  const isUser = msg.type === 'user';
  return (
    <div className={`refl-bubble ${isUser ? 'user' : 'admin'}`}>
      <div className="refl-bubble-label">
        {isUser ? <Pencil size={10} /> : <CheckCircle size={10} />}
        {isUser ? 'My Reflection' : 'Coach Reply'}
      </div>
      <div className="refl-bubble-text">{msg.text}</div>
      <div className="refl-bubble-time">{formatDateTime(msg.date)}</div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const UserReflection= ({ sessions, user, initialSessionId }) => {
  const [selectedSessionId, setSelectedSessionId] = useState(
    initialSessionId || sessions?.[0]?._id || null
  );
  const [thoughtText, setThoughtText]   = useState('');
  const [myThoughts, setMyThoughts]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [showChat, setShowChat]         = useState(false);

  const scrollEndRef = useRef(null);
  const textareaRef  = useRef(null);

  /* ── DETECT MOBILE ─────────────────────────────────────── */
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* ── SYNC PROP ─────────────────────────────────────────── */
  useEffect(() => {
    if (initialSessionId) setSelectedSessionId(initialSessionId);
  }, [initialSessionId]);

  /* ── FETCH ─────────────────────────────────────────────── */
  const fetchReflections = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await userApiService.fetchReflections(getToken());
        const list = Array.isArray(data)? data: Array.isArray(data?.reflections)? data.reflections: [];
        setMyThoughts(list);
    } catch (err) {
      console.error('[fetchReflections]', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReflections();
    const id = setInterval(() => fetchReflections(true), 30000);
    return () => clearInterval(id);
  }, [fetchReflections]);

  /* ── AUTO-SCROLL ───────────────────────────────────────── */
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [myThoughts, selectedSessionId]);

  /* ── DERIVED DATA ──────────────────────────────────────── */
  const safeSessions = sessions || [];

  const sessionMeta = safeSessions.map((s) => {
    const unlockDate   = GetUnlockDate(user?.createdAt, s.dayNumber);
    const now          = new Date();
    const expiry       = unlockDate ? new Date(unlockDate.getTime() + 24 * 60 * 60 * 1000) : null;
    const specialActive =
      s.hasSpecialAccess &&
      s.specialAccessExpiresAt &&
      now < new Date(s.specialAccessExpiresAt);

    const isUnlocked = unlockDate ? now >= unlockDate : false;
    const isMissed   = expiry && !s.isCompleted && !specialActive && now > expiry;
    const isLocked   = !isUnlocked && !isMissed;

    return { ...s, isLocked };
  });

  const selectedSession = sessionMeta.find((s) => s._id === selectedSessionId);

  const currentReflection = myThoughts.find(
    (t) => String(t.sessionId) === String(selectedSessionId)
  );

  // Build flat sorted message list
  const sessionMessages = [];
  if (currentReflection) {
    const contents = Array.isArray(currentReflection.content)
      ? currentReflection.content
      : currentReflection.content
        ? [{ text: currentReflection.content, date: currentReflection.lastUpdated }]
        : [];

    contents.forEach((msg) =>
      sessionMessages.push({
        type: 'user',
        text: msg.text || msg.content,
        date: msg.date || currentReflection.lastUpdated,
      })
    );

    const replies = Array.isArray(currentReflection.adminReply)
      ? currentReflection.adminReply
      : currentReflection.adminReply
        ? [{ text: currentReflection.adminReply, date: currentReflection.lastUpdated }]
        : [];

    replies.forEach((r) =>
      sessionMessages.push({
        type: 'admin',
        text: r.text || r,
        date: r.date || currentReflection.lastUpdated,
      })
    );

    sessionMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  const hasReplyUnread = !!currentReflection?.adminReply;

  /* ── SUBMIT ────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const trimmed = thoughtText.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await userApiService.createOrUpdateReflection(
        { sessionId: selectedSessionId, content: trimmed },
        getToken()
      );

      // Optimistic update
      setMyThoughts((prev) => {
        const idx    = prev.findIndex((t) => String(t.sessionId) === String(selectedSessionId));
        const newMsg = { text: trimmed, date: new Date().toISOString() };
        if (idx >= 0) {
          const updated = [...prev];
          const doc     = updated[idx];
          const current = Array.isArray(doc.content)
            ? doc.content
            : doc.content ? [{ text: doc.content, date: doc.lastUpdated }] : [];
          updated[idx]  = { ...doc, content: [...current, newMsg], lastUpdated: new Date().toISOString() };
          return updated;
        }
        return [
          ...prev,
          { sessionId: selectedSessionId, content: [newMsg], adminReply: null, lastUpdated: new Date().toISOString() },
        ];
      });

      setThoughtText('');
      textareaRef.current?.focus();
    } catch (err) {
      console.error('[handleSubmit]', err);
      alert('Failed to save reflection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── NAVIGATION ────────────────────────────────────────── */
  const handleSelectSession = (sid) => {
    setSelectedSessionId(sid);
    if (isMobile) setShowChat(true);
  };

  /* ── EMPTY ─────────────────────────────────────────────── */
  if (!sessions || sessions.length === 0) {
    return (
      <div className="refl-empty-full">
        <MessageSquare size={36} color="#333" />
        <p>No sessions available yet.</p>
      </div>
    );
  }

  /* ── PANEL VISIBILITY ──────────────────────────────────── */
  const showSidebar = !isMobile || !showChat;
  const showMain    = !isMobile || showChat;

  /* ── RENDER ────────────────────────────────────────────── */
  return (
    <div className="refl-container">

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      {showSidebar && (
        <div className={`refl-sidebar ${isMobile && showChat ? 'mobile-hidden' : ''}`}>

          <div className="refl-sidebar-head">
            <div>
              <h3>My Journal</h3>
              <p>Reflect on each session</p>
            </div>
            <button
              className={`refl-refresh-btn ${loading ? 'spinning' : ''}`}
              onClick={() => fetchReflections(false)}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="refl-list-scroll">
            {sessionMeta.map((s) => {
              const doc       = myThoughts.find((t) => String(t.sessionId) === String(s._id));
              const hasThought = doc && (Array.isArray(doc.content) ? doc.content.length > 0 : !!doc.content);
              const hasReply   = doc && (Array.isArray(doc.adminReply) ? doc.adminReply.length > 0 : !!doc.adminReply);
              return (
                <SessionItem
                  key={s._id}
                  session={s}
                  isActive={selectedSessionId === s._id}
                  isLocked={s.isLocked}
                  hasThought={hasThought}
                  hasReply={hasReply}
                  onClick={() => !s.isLocked && handleSelectSession(s._id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN PANEL ─────────────────────────────────────── */}
      {showMain && (
        <div className={`refl-main ${isMobile && showChat ? 'mobile-open' : ''}`}>
          {selectedSessionId && selectedSession ? (
            <>
              {/* Header */}
              <div className="refl-main-head">
                {isMobile && (
                  <button className="refl-back-btn" onClick={() => setShowChat(false)}>
                    <ChevronLeft size={22} />
                  </button>
                )}
                <div className="refl-head-info">
                  <span className="refl-head-day">Day {selectedSession.dayNumber}</span>
                  <h2 className="refl-head-title">{selectedSession.title}</h2>
                </div>
                {hasReplyUnread && (
                  <span className="refl-coach-badge">Coach replied</span>
                )}
              </div>

              {/* Messages */}
              <div className="refl-scroll-area">
                {sessionMessages.length === 0 && (
                  <div className="refl-empty-chat">
                    <div className="refl-empty-chat-icon">
                      <MessageSquare size={22} color="#444" />
                    </div>
                    <p>
                      What did you take away from today's session?<br />
                      Write your thoughts below.
                    </p>
                  </div>
                )}

                {sessionMessages.map((msg, i) => (
                  <React.Fragment key={i}>
                    <Bubble msg={msg} />
                    {i === sessionMessages.length - 1 &&
                      msg.type === 'user' &&
                      !currentReflection?.adminReply && (
                        <div className="refl-waiting">
                          <Clock size={12} />
                          Waiting for coach feedback…
                        </div>
                      )}
                  </React.Fragment>
                ))}

                <div ref={scrollEndRef} />
              </div>

              {/* Input */}
              <div className="refl-input-area">
                <textarea
                  ref={textareaRef}
                  className="refl-textarea"
                  rows={2}
                  placeholder={
                    sessionMessages.length > 0
                      ? 'Add another reflection…'
                      : 'Write your reflection…'
                  }
                  value={thoughtText}
                  onChange={(e) => setThoughtText(e.target.value)}
                  disabled={submitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <button
                  className="refl-send-btn"
                  onClick={handleSubmit}
                  disabled={!thoughtText.trim() || submitting}
                >
                  {submitting
                    ? <RefreshCw size={18} className="spinning" />
                    : <Send size={18} />
                  }
                </button>
              </div>
            </>
          ) : (
            <div className="refl-empty-full">
              <BookOpen size={32} color="#2a2a2a" />
              <p>Select a session to start reflecting.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserReflection;