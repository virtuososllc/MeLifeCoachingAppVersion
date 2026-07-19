import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, Send, Calendar, Clock,
    Search, RefreshCw, ChevronLeft
} from 'lucide-react';
import adminApiService from '../../../apiServices/adminDashboardApiService'; 
import '../../../css/adminReflection.css';
import { getInitials } from '../../../utils/getUserSessionStatusAndInitials';
import { storage } from '../../../apiServices/userDashboardApiService';

// ── token helper (matches your storage util) ──────────────
const getToken = () =>
  storage.get('token') || sessionStorage.getItem('token');

const AdminReflectionsTab = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selectedId, setSelectedId]   = useState(null);
  const [filter, setFilter]           = useState('all');
  const [searchTerm, setSearchTerm]   = useState('');
  const [replyText, setReplyText]     = useState('');
  const [sending, setSending]         = useState(false);
  const scrollRef = useRef(null);

  /* ── FETCH ──────────────────────────────────────────────── */
  const fetchReflections = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const data  = await adminApiService.fetchReflections(token);

      // handle both { reflections: [...] } and plain array
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.reflections)
          ? data.reflections
          : [];

      setReflections(list);
    } catch (err) {
      console.error('[fetchReflections]', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── SEND REPLY ─────────────────────────────────────────── */
  const sendReply = async () => {
    if (!replyText.trim() || !selectedId) return;
    setSending(true);
    try {
      const token = getToken();
      await adminApiService.replyToReflection(
        { reflectionId: selectedId, replyText },
        token
      );

      setReflections(prev => prev.map(r => {
        if (r._id !== selectedId) return r;

        const existing = Array.isArray(r.adminReply)
          ? r.adminReply
          : r.adminReply
            ? [{ text: r.adminReply, date: r.lastUpdated }]
            : [];

        return {
          ...r,
          status: 'replied',
          adminReply: [...existing, { text: replyText, date: new Date().toISOString() }],
          lastUpdated: new Date().toISOString(),
        };
      }));

      setReplyText('');
    } catch (err) {
      console.error('[sendReply]', err);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { fetchReflections(); }, []);

  // auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedId, reflections]);

  /* ── FILTER + SEARCH ────────────────────────────────────── */
  const filteredList = reflections.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const search        = searchTerm.toLowerCase();
    const matchesSearch =
      item.userId?.Name?.toLowerCase().includes(search) ||
      item.sessionId?.title?.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });

  /* ── GROUP BY USER ──────────────────────────────────────── */
  const groupedReflections = Object.values(
    filteredList.reduce((acc, item) => {
      const uId = item.userId?._id || 'unknown';
      if (!acc[uId]) {
        acc[uId] = { user: item.userId || { Name: 'Unknown User' }, sessions: [] };
      }
      acc[uId].sessions.push(item);
      return acc;
    }, {})
  ).sort((a, b) => (a.user.Name || '').localeCompare(b.user.Name || ''));

  /* ── HELPERS ────────────────────────────────────────────── */
  const selectedReflection = reflections.find(r => r._id === selectedId);

  const getConversation = (reflection) => {
    if (!reflection) return [];

    const userMsgs = Array.isArray(reflection.content)
      ? reflection.content.map(m => ({ ...m, type: 'user' }))
      : reflection.content
        ? [{ text: reflection.content, date: reflection.lastUpdated, type: 'user' }]
        : [];

    const adminMsgs = Array.isArray(reflection.adminReply)
      ? reflection.adminReply.map(m => ({ ...m, type: 'admin' }))
      : reflection.adminReply
        ? [{ text: reflection.adminReply, date: reflection.lastUpdated, type: 'admin' }]
        : [];

    return [...userMsgs, ...adminMsgs].sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getPreviewText = (content) => {
    if (Array.isArray(content) && content.length > 0) return content[content.length - 1].text;
    if (typeof content === 'string') return content;
    return 'No content';
  };

  const conversation = getConversation(selectedReflection);

  /* ── RENDER ─────────────────────────────────────────────── */
  return (
    <div className="admin-reflections-layout fade-up">

      {/* SIDEBAR */}
      <div className={`ar-sidebar ${selectedId ? 'mobile-hidden' : ''}`}>
        <div className="ar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Inbox</h3>
            <button
              onClick={fetchReflections}
              style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: 4, display: 'flex' }}
              title="Refresh"
            >
              <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
          </div>

          <div className="ar-search-box">
            <Search size={16} color="#94a3b8" />
            <input
              className="ar-search-input"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ar-filters">
            {['all', 'pending', 'replied'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`ar-filter-btn ${filter === f ? 'active' : ''}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="ar-list">
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
              Loading reflections...
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              No reflections found
            </div>
          ) : (
            groupedReflections.map(group => (
              <div key={group.user._id || 'unknown'} className="ar-group-container">
                <div className="ar-group-header">
                  <div className="ar-group-avatar">{getInitials(group.user.Name)}</div>
                  <div className="ar-group-info">
                    <div className="ar-group-name">{group.user.Name}</div>
                    <div className="ar-group-count">
                      {group.sessions.length} Session{group.sessions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="ar-group-items">
                  {group.sessions.map(item => (
                    <div
                      key={item._id}
                      onClick={() => setSelectedId(item._id)}
                      className={`ar-nested-item ${selectedId === item._id ? 'active' : ''} ${item.status === 'pending' ? 'unread' : ''}`}
                    >
                      <div className="ar-nested-header">
                        <div className="ar-nested-title">
                          <Calendar size={10} color={selectedId === item._id ? '#ffffff' : '#888888'} />
                          {item.sessionId?.title || 'Unknown Session'}
                        </div>
                        <div className="ar-nested-date">
                          {new Date(item.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="ar-nested-preview">{getPreviewText(item.content)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`ar-main ${selectedId ? 'mobile-active' : ''}`}>
        {selectedReflection ? (
          <>
            <div className="ar-detail-header">
              <button className="ar-back-btn" onClick={() => setSelectedId(null)}>
                <ChevronLeft size={24} />
              </button>
              <div className="ar-user-profile">
                <div className="ar-avatar-lg">{getInitials(selectedReflection.userId?.Name)}</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f5f9' }}>
                    {selectedReflection.userId?.Name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
                    <Clock size={12} />
                    Updated {new Date(selectedReflection.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className={`ar-status-badge ${selectedReflection.status}`}>
                {selectedReflection.status}
              </div>
            </div>

            <div className="ar-scroll-content" ref={scrollRef}>
              <div className="ar-context-card">
                <div className="ar-context-label">SESSION TOPIC</div>
                <div className="ar-context-text">{selectedReflection.sessionId?.title}</div>
              </div>

              {conversation.length > 0 ? (
                conversation.map((msg, idx) => (
                  <div key={idx} className={`ar-bubble ${msg.type}`}>
                    <span className="ar-bubble-meta">
                      {msg.type === 'user' ? 'Student' : 'You'} · {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="ar-bubble-text">{msg.text}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                  No messages found.
                </div>
              )}
            </div>

            <div className="ar-reply-box">
              <textarea
                className="ar-textarea"
                placeholder="Type your feedback here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
              />
              <button
                className="btn btn-reply"
                onClick={sendReply}
                disabled={sending || !replyText.trim()}
                title="Send Reply (Enter)"
              >
                {sending
                  ? <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={20} />
                }
              </button>
            </div>
          </>
        ) : (
          <div className="ar-main-empty">
            <div style={{
              width: 80, height: 80, borderRadius: '50%', backgroundColor: '#1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              <MessageSquare size={40} color="#64748b" />
            </div>
            <h3 style={{ margin: 0, color: '#f1f5f9' }}>No Reflection Selected</h3>
            <p style={{ margin: 0 }}>Select a student from the sidebar to view their reflection and provide feedback.</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminReflectionsTab;