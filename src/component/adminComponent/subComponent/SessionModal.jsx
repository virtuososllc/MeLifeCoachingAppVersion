import React, { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import '../../../css/adminDashboard.css';

const LANGS = [
  { code: 'english', label: 'EN', native: 'English', dbKey: 'en' },
  { code: 'hindi',   label: 'HI', native: 'हिंदी',   dbKey: 'hi' },
  { code: 'marathi', label: 'MR', native: 'मराठी',   dbKey: 'mr' },
];

const EMPTY_FORM = {
  dayNumber:    '',
  title:        '',
  type:         'Recorded',
  mediaUrls:    { english: '', hindi: '', marathi: '' },
  contextPoints: ''
};

const SessionModal = ({ isOpen, onClose, session, onSave }) => {
  const [form, setForm]             = useState(EMPTY_FORM);
  const [activeLang, setActiveLang] = useState('english');

  useEffect(() => {
    if (!isOpen) return;
    if (session) {
      // Map DB keys (en/hi/mr) → form keys (english/hindi/marathi)
      setForm({
        dayNumber:     session.dayNumber || '',
        title:         session.title     || '',
        type:          session.type      || 'Recorded',
        contextPoints: session.contextPoints?.join('\n') || '',
        mediaUrls: {
          english: session.mediaUrl?.en  || '',
          hindi:   session.mediaUrl?.hi  || '',
          marathi: session.mediaUrl?.mr  || '',
        }
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setActiveLang('english');
  }, [session, isOpen]);

  if (!isOpen) return null;

  const setMediaUrl = (lang, value) =>
    setForm(prev => ({ ...prev, mediaUrls: { ...prev.mediaUrls, [lang]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map form keys (english/hindi/marathi) → DB keys (en/hi/mr)
    const payload = {
      dayNumber:     form.dayNumber,
      title:         form.title,
      type:          form.type,
      contextPoints: form.contextPoints.split('\n').map(p => p.trim()).filter(Boolean),
      mediaUrl: {
        en: form.mediaUrls?.english || '',
        hi: form.mediaUrls?.hindi   || '',
        mr: form.mediaUrls?.marathi || '',
      }
    };
    onSave(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{session ? 'Edit Session' : 'New Session'}</h3>
          <button onClick={onClose} className="close-btn"><X /></button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Day & Type */}
          <div className="form-row">
            <input
              className="input"
              type="number"
              placeholder="Day #"
              required
              style={{ flex: 1 }}
              value={form.dayNumber}
              onChange={e => setForm({ ...form, dayNumber: e.target.value })}
            />
            <select
              className="input"
              style={{ flex: 2 }}
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option value="Recorded">Recorded</option>
              <option value="One:One">One on One</option>
              <option value="Reading">Reading</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>

          {/* Title */}
          <input
            className="input"
            placeholder="Title"
            required
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          {/* Multi-language URLs — Recorded only */}
          {form.type === 'Recorded' && (
            <div className="sm-url-section">

              <div className="sm-url-label">
                <Globe size={13} /> Video URLs by Language
              </div>

              {/* Language tabs */}
              <div className="sm-lang-tabs">
                {LANGS.map(lang => {
                  const filled = !!form.mediaUrls?.[lang.code]?.trim();
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      className={`sm-lang-tab ${activeLang === lang.code ? 'sm-lang-tab-active' : ''}`}
                      onClick={() => setActiveLang(lang.code)}
                    >
                      {lang.native}
                      {filled && <span className="sm-url-dot" />}
                    </button>
                  );
                })}
              </div>

              {/* One input per language, show/hide with display */}
              {LANGS.map(lang => (
                <input
                  key={lang.code}
                  className="input sm-url-input"
                  style={{ display: activeLang === lang.code ? 'block' : 'none' }}
                  placeholder={`${lang.native} — YouTube or Firebase URL`}
                  value={form.mediaUrls?.[lang.code] || ''}
                  onChange={e => setMediaUrl(lang.code, e.target.value)}
                />
              ))}

              {/* Status chips row */}
              <div className="sm-url-status">
                {LANGS.map(lang => {
                  const filled = !!form.mediaUrls?.[lang.code]?.trim();
                  return (
                    <span
                      key={lang.code}
                      className={`sm-url-chip ${filled ? 'sm-url-chip-filled' : 'sm-url-chip-empty'}`}
                    >
                      {lang.label} {filled ? '✓' : '—'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Context Points */}
          <textarea
            className="input textarea"
            placeholder="Context Points (one per line)"
            value={form.contextPoints}
            onChange={e => setForm({ ...form, contextPoints: e.target.value })}
          />

          <button type="submit" className="btn btn-primary full-width">
            Save Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;