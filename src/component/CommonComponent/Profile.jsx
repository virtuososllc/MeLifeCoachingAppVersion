import { useState, useRef, useEffect } from 'react';
import {
  Mail, EyeOff, Eye, Phone, Camera, Key,
  Settings, LogOut, ChevronRight, ArrowLeft,
  CheckCircle, Clock, Lock, User,
  Users, ShieldCheck, Activity, BarChart2,
  MessageCircle, FileCheck, XCircle, AlertCircle,
} from 'lucide-react';
import { getInitials } from '../../utils/getUserSessionStatusAndInitials';
import '../../css/profile.css';

// ── derive stats from sessions array ─────────────────────────────
// Expected session fields:
//   s.status  → 'pending' | 'reviewed' | 'missed' | 'locked'
// Falls back to legacy boolean flags if status field absent.
const getStatus = (s) => {
  if (s.status) return s.status;                        // prefer explicit status field
  if (s.isLocked)    return 'locked';
  if (s.isCompleted) return 'reviewed';
  if (s.isMissed)    return 'missed';
  return 'pending';
};

const getSessionStats = (sessions = []) => {
  const total    = sessions.length;
  const reviewed = sessions.filter(s => getStatus(s) === 'reviewed').length;
  const missed   = sessions.filter(s => getStatus(s) === 'missed').length;
  const pending  = sessions.filter(s => getStatus(s) === 'pending').length;
  const locked   = sessions.filter(s => getStatus(s) === 'locked').length;
  return { total, reviewed, missed, pending, locked };
};

/**
 * Profile
 *
 * Props:
 *   user              – current user object
 *   sessions          – array of sessions (user mode) OR ignored in admin mode
 *   onUpdate          – (formData) => void
 *   onPasswordChange  – (passData) => void
 *   onLogout          – () => void
 *   onNavigateSession – (session) => void  ← navigate to assignment page
 *   isAdmin           – boolean, switches overview to admin stats panel
 *   adminStats        – { totalUsers, totalAdmins, todayVisitors } (admin mode)
 */
const Profile = ({
  user,
  sessions = [],
  onUpdate,
  onPasswordChange,
  onLogout,
  onNavigateSession,
  isAdmin    = false,
  adminStats = {},
}) => {
  const [view, setView] = useState('overview');

  const [formData, setFormData] = useState({
    name:           user?.Name           || '',
    email:          user?.email          || '',
    phone:          user?.phone          || '',
    profilePicture: user?.profilePicture || null,
  });
  const [passData,        setPassData]        = useState({ new: '', confirm: '' });
  const [preview,         setPreview]         = useState(user?.profilePicture);
  const [showNewPass,     setShowNewPass]      = useState(false);
  const [showConfirmPass, setShowConfirmPass]  = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name:           user.Name           || '',
        email:          user.email          || '',
        phone:          user.phone          || '',
        profilePicture: user.profilePicture || null,
      });
      setPreview(user.profilePicture);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 500;
        let { width: w, height: h } = img;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else       { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const url = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(p => ({ ...p, profilePicture: url }));
        setPreview(url);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const stats = getSessionStats(sessions);

  // ════════════════════════════════════════════════════════
  // CONTACT US VIEW — users only
  // ════════════════════════════════════════════════════════
  if (view === 'contact' && !isAdmin) {
    return (
      <div className="profile-overview">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setView('overview')} className="profile-back-btn">
            <ArrowLeft size={16} />
          </button>
          <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Contact Us</h2>
        </div>

        <div className="sa-card-profile" style={{ gap: 0 }}>
          {/* Email block */}
          <a href="mailto:contact@melifecoaching.com" className="profile-contact-block">
            <div className="profile-contact-block-icon">
              <Mail size={20} color="#3b82f6" />
            </div>
            <div>
              <p className="profile-contact-block-label">Email</p>
              <p className="profile-contact-block-value">contact@melifecoaching.com</p>
            </div>
          </a>

          <div style={{ borderTop: '1px solid #1a1a1a', margin: '0 -20px' }} />

          {/* Phone block */}
          <a href="tel:+918097525060" className="profile-contact-block">
            <div className="profile-contact-block-icon">
              <Phone size={20} color="#22c55e" />
            </div>
            <div>
              <p className="profile-contact-block-label">Phone</p>
              <p className="profile-contact-block-value">+91 80975 25060</p>
            </div>
          </a>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // ASSIGNMENTS VIEW
  // ════════════════════════════════════════════════════════
  if (view === 'assignments') {
    const reviewed = sessions.filter(s => getStatus(s) === 'reviewed');
    const pending  = sessions.filter(s => getStatus(s) === 'pending');
    const missed   = sessions.filter(s => getStatus(s) === 'missed');
    const locked   = sessions.filter(s => getStatus(s) === 'locked');

    const Section = ({ title, icon: Icon, color, items, emptyText, badgeClass }) => (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Icon size={14} color={color} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {title} ({items.length})
          </span>
        </div>
        {items.length === 0 ? (
          <p style={{ color: '#444', fontSize: '0.8rem', padding: '10px 0' }}>{emptyText}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(s => (
              <button
                key={s._id}
                className="profile-assignment-row"
                onClick={() => onNavigateSession && onNavigateSession(s)}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>
                    Day {s.dayNumber} · {s.title}
                  </p>
                  {s.dueDate && (
                    <p style={{ margin: '3px 0 0', fontSize: '0.7rem', color: '#555' }}>
                      Due: {new Date(s.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`status-badge ${badgeClass}`}>{title}</span>
                <ChevronRight size={14} color="#444" style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div className="profile-overview">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setView('overview')} className="profile-back-btn">
            <ArrowLeft size={16} />
          </button>
          <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Assignments</h2>
        </div>

        {/* Summary pills — all 4 statuses */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Reviewed', value: reviewed.length, color: '#22c55e'  },
            { label: 'Pending',  value: pending.length,  color: '#facc15'  },
            { label: 'Missed',   value: missed.length,   color: '#ef4444'  },
            { label: 'Locked',   value: locked.length,   color: '#555'     },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#121212', border: '1px solid #222', borderRadius: 10, padding: '10px 4px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.6rem', color: '#666', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="sa-card-profile">
          <Section title="Reviewed" icon={FileCheck}    color="#22c55e" items={reviewed} emptyText="No reviewed assignments yet."        badgeClass="reviewed" />
          <div style={{ borderTop: '1px solid #1a1a1a', margin: '4px 0 16px' }} />
          <Section title="Pending"  icon={AlertCircle}  color="#facc15" items={pending}  emptyText="No pending assignments."             badgeClass="pending"  />
          <div style={{ borderTop: '1px solid #1a1a1a', margin: '4px 0 16px' }} />
          <Section title="Missed"   icon={XCircle}      color="#ef4444" items={missed}   emptyText="No missed assignments. Great job!"   badgeClass="missed"   />
          <div style={{ borderTop: '1px solid #1a1a1a', margin: '4px 0 16px' }} />
          <Section title="Locked"   icon={Lock}         color="#555"    items={locked}   emptyText="No locked assignments."              badgeClass="locked"   />
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // OVERVIEW
  // ════════════════════════════════════════════════════════
  if (view === 'overview') {
    return (
      <div className={`profile-overview${isAdmin ? ' profile-overview--admin' : ''}`}>

        {/* ── Avatar + name card ── */}
        <div className="sa-card-profile" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
              {preview
                ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div className="avatar-initials" style={{ width: '100%', height: '100%', fontSize: '1.2rem' }}>
                    {getInitials(user?.Name)}
                  </div>
              }
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{user?.Name}</h2>
              <p style={{ color: '#888', fontSize: '0.8rem', margin: '3px 0 0' }}>
                {user?.role}&nbsp;·&nbsp;{user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats card — admin vs user ── */}
        {isAdmin ? (
          <div className="sa-card-profile" style={{ marginBottom: 16 }}>
            <p style={{ color: '#666', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Platform Overview
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 8 }}>
              {[
                { label: 'Total Users',      value: adminStats.totalUsers    ?? '—', color: '#3b82f6', Icon: Users      },
                { label: 'Total Admins',     value: adminStats.totalAdmins   ?? '—', color: '#a855f7', Icon: ShieldCheck },
                { label: "Today's Visitors", value: adminStats.todayVisitors ?? '—', color: '#22c55e', Icon: Activity    },
                { label: 'Active Sessions',  value: adminStats.totalSessions ?? '—', color: '#f59e0b', Icon: BarChart2   },
              ].map(({ label, value, color, Icon: StatIcon }) => (
                <div key={label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StatIcon size={14} color={color} />
                    <span style={{ fontSize: '0.65rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* USER: session progress — number badges only */
          <div className="sa-card-profile" style={{ marginBottom: 16 }}>
            <p style={{ color: '#666', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
              Session Progress
            </p>

            {/* 3 number badge tiles: Reviewed / Missed / Locked */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Reviewed', value: stats.reviewed, color: '#22c55e' },
                { label: 'Missed',   value: stats.missed,   color: '#ef4444' },
                { label: 'Locked',   value: stats.locked,   color: '#555'    },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 6px', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.65rem', color: '#666', marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Session list rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto', paddingRight: 2 }}>
              {sessions.length === 0 && (
                <p style={{ color: '#555', fontSize: '0.8rem', textAlign: 'center', padding: '12px 0' }}>No sessions yet.</p>
              )}
              {sessions.map((s) => {
                const status = getStatus(s);
                const StatusIcon =
                  status === 'reviewed' ? CheckCircle :
                  status === 'pending'  ? Clock       : Lock;
                const iconColor =
                  status === 'reviewed' ? '#22c55e' :
                  status === 'pending'  ? '#3b82f6' :
                  status === 'missed'   ? '#ef4444' : '#444';
                const label =
                  status === 'reviewed' ? 'Reviewed' :
                  status === 'pending'  ? 'Pending'  :
                  status === 'missed'   ? 'Missed'   : 'Locked';
                const pct =
                  status === 'reviewed' ? 100 :
                  status === 'pending'  ? 50  : 0;

                return (
                  <button
                    key={s._id}
                    onClick={() => onNavigateSession && onNavigateSession(s)}
                    className="profile-session-row"
                  >
                    <StatusIcon size={13} color={iconColor} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: '#bbb', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                      Day {s.dayNumber}&nbsp;·&nbsp;{s.title}
                    </span>
                    <div style={{ width: 48, height: 3, background: '#2a2a2a', borderRadius: 2, flexShrink: 0, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: status === 'reviewed' ? '#22c55e' : '#3b82f6', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#555', minWidth: 32, textAlign: 'right' }}>{label}</span>
                    <ChevronRight size={11} color="#333" style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Settings row ── */}
        <div className="sa-card-profile" style={{ marginBottom: 10, padding: '2px 8px' }}>
          <button onClick={() => setView('settings')} className="profile-menu-row">
            <span className="profile-menu-icon">
              <Settings size={17} color="#fff" />
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Settings</span>
            <ChevronRight size={15} color="#555" style={{ marginLeft: 'auto' }} />
          </button>
        </div>

        {/* ── Contact Us row — users only ── */}
        {!isAdmin && (
          <div className="sa-card-profile" style={{ marginBottom: 10, padding: '2px 8px' }}>
            <button onClick={() => setView('contact')} className="profile-menu-row">
              <span className="profile-menu-icon">
                <MessageCircle size={17} color="#fff" />
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Contact Us</span>
              <ChevronRight size={15} color="#555" style={{ marginLeft: 'auto' }} />
            </button>
          </div>
        )}

        {/* ── Logout row ── */}
        <div className="sa-card-profile" style={{ padding: '2px 8px' }}>
          <button onClick={onLogout} className="profile-menu-row">
            <span className="profile-menu-icon profile-menu-icon--danger">
              <LogOut size={17} color="#ef4444" />
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444' }}>Logout</span>
          </button>
        </div>

      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // SETTINGS
  // ════════════════════════════════════════════════════════
  return (
    <div className={`profile-settings${isAdmin ? ' profile-settings--admin' : ''}`}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setView('overview')} className="profile-back-btn">
          <ArrowLeft size={16} />
        </button>
        <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Settings</h2>
      </div>

      <div className="sa-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        {/* ── Profile details ── */}
        <div className="sa-card-profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              onClick={() => fileInputRef.current.click()}
              style={{ width: 46, height: 46, borderRadius: '50%', position: 'relative', cursor: 'pointer', flexShrink: 0, overflow: 'hidden' }}
            >
              {preview
                ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div className="avatar-initials" style={{ width: '100%', height: '100%', fontSize: '1rem' }}>{getInitials(user?.Name)}</div>
              }
              <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <Camera size={18} color="#fff" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{user?.Name}</p>
              <p style={{ color: '#666', margin: 0, fontSize: '0.75rem' }}>{user?.role}</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onUpdate(formData); }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: 5 }}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #333', borderRadius: 8, padding: '0 10px' }}>
                <User size={14} color="#555" />
                <input className="input" style={{ border: 'none', margin: 0 }} value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: 5 }}>Email (read-only)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #333', borderRadius: 8, padding: '0 10px', opacity: 0.45 }}>
                <Mail size={14} color="#555" />
                <input className="input" readOnly style={{ border: 'none', margin: 0, cursor: 'not-allowed' }} value={formData.email} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: 5 }}>Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #333', borderRadius: 8, padding: '0 10px' }}>
                <Phone size={14} color="#555" />
                <input className="input" style={{ border: 'none', margin: 0 }} value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Your phone" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary full-width">Save Changes</button>
          </form>
        </div>

        {/* ── Password ── */}
        <div className="sa-card-profile">
          <h3 style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ background: 'rgba(255,255,255,0.08)', padding: 8, borderRadius: 8, display: 'flex' }}><Key size={16} /></span>
            Change Password
          </h3>

          <form onSubmit={(e) => { e.preventDefault(); onPasswordChange(passData); }}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input className="input" type={showNewPass ? 'text' : 'password'} placeholder="New Password"
                value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} style={{ paddingRight: 38 }} />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                style={{ position: 'absolute', right: 10, top: '38%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex' }}>
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input className="input" type={showConfirmPass ? 'text' : 'password'} placeholder="Confirm New Password"
                value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} style={{ paddingRight: 38 }} />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{ position: 'absolute', right: 10, top: '38%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex' }}>
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="btn btn-outline full-width">Reset Password</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;