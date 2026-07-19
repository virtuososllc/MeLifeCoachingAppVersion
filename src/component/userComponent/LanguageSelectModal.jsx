import React, { useEffect } from 'react';
import { X, Globe } from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { key: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { key: 'hi', label: 'Hindi',   native: 'हिंदी',    flag: '🇮🇳' },
  { key: 'mr', label: 'Marathi', native: 'मराठी',    flag: '🟠' },
];

const LanguageSelectModal = ({ isOpen, onClose, session, onSelect, preferredLanguage }) => {
  const available = LANGUAGE_OPTIONS.filter(lang => session?.mediaUrl?.[lang.key]);

  useEffect(() => {
    if (!isOpen) return;

    // ✅ If user already has a preferred language set → auto-select, skip modal
    if (preferredLanguage) {
      const match = available.find(l => l.key === preferredLanguage);
      if (match) { onSelect(match.key); return; }
    }

    // Auto-select if only one language available
    if (available.length === 1) { onSelect(available[0].key); }
  }, [isOpen]);

  if (!isOpen || !session) return null;

  // Already handled by useEffect above
  if (preferredLanguage && available.find(l => l.key === preferredLanguage)) return null;
  if (available.length === 1) return null;
  if (available.length === 0) { onSelect('en'); return null; }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)', padding: '16px'
    }}>
      <div style={{
        background: '#111', width: '100%', maxWidth: '400px',
        borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
        padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'langModalIn 0.28s cubic-bezier(0.16,1,0.3,1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Globe size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                Choose Language
              </h3>
              <p style={{ color: '#555', fontSize: '0.75rem', margin: '2px 0 0' }}>
                One-time choice — applies to all sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', color: '#aaa',
              cursor: 'pointer', padding: '8px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Session info */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', padding: '12px 16px', marginBottom: '20px'
        }}>
          <p style={{
            color: '#555', fontSize: '0.68rem', textTransform: 'uppercase',
            letterSpacing: '0.1em', margin: '0 0 4px', fontWeight: 700
          }}>
            DAY {session.dayNumber} · AUDIO SESSION
          </p>
          <p style={{ color: '#e5e5e5', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
            {session.title}
          </p>
        </div>

        {/* Warning */}
        <p style={{
          color: '#666', fontSize: '0.75rem', margin: '0 0 16px',
          padding: '10px 14px', background: 'rgba(255,200,0,0.05)',
          border: '1px solid rgba(255,200,0,0.1)', borderRadius: '10px', lineHeight: 1.5
        }}>
          ⚠️ This is a <strong style={{ color: '#aaa' }}>one-time choice</strong>. All sessions will play in the language you select.
        </p>

        {/* Language options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {available.map((lang, index) => (
            <button
              key={lang.key}
              onClick={() => onSelect(lang.key)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '16px 18px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '14px', cursor: 'pointer',
                transition: 'all 0.18s ease', color: '#fff', textAlign: 'left',
                animation: `langItemIn 0.3s ease both`,
                animationDelay: `${0.06 + index * 0.07}s`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateX(3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{lang.flag}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{lang.label}</div>
                  <div style={{ color: '#666', fontSize: '0.78rem', marginTop: '2px' }}>{lang.native}</div>
                </div>
              </div>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginLeft: '12px'
              }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2.5 5.5h6M5.5 2.5l3 3-3 3" stroke="#000" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes langModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes langItemIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelectModal;