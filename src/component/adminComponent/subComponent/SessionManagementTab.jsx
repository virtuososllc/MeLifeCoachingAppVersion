import React from 'react';
import { Video, FileText, Edit2, Trash2, Plus } from 'lucide-react';
import '../../../css/adminDashboard.css';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'mr', label: 'MR' },
];

const MediaIndicator = ({ session }) => {
  if (session.type !== 'Recorded') return null;

  const urls = session.mediaUrl || {};
  const hasAny = LANGS.some(l => !!urls[l.code]);
  if (!hasAny) return null;

  return (
    <div className="sm-media-indicator">
      <Video size={12} aria-hidden />
      <span>Links:</span>
      {LANGS.map(l => {
        const available = !!urls[l.code];
        return (
          <span
            key={l.code}
            className={`sm-url-chip ${available ? 'sm-url-chip-filled' : 'sm-url-chip-empty'}`}
            title={available ? `${l.label} video available` : `${l.label} video missing`}
          >
            {l.label} {available ? '✓' : '—'}
          </span>
        );
      })}
    </div>
  );
};

const SessionManagementTab = ({ sessions, onEdit, onDelete, onCreateSession }) => (
  <>
    <div className="table-container">
      <table className="sa-table">
        <thead>
          <tr>
            <th width="80">Day</th>
            <th>Details & Content</th>
            <th width="120">Type</th>
            <th align="right" width="100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s._id}>

              <td data-label="Day" className="day-cell">
                {s.dayNumber}
              </td>

              <td data-label="Details">
                <div className="session-title">{s.title}</div>
                <ul className="session-points">
                  {s.contextPoints?.length > 0
                    ? s.contextPoints.map((point, i) => <li key={i}>{point}</li>)
                    : <li>No description available.</li>
                  }
                </ul>
                <MediaIndicator session={s} />
              </td>

              <td data-label="Type">
                <span className="type-badge">
                  {s.type === 'Recorded' ? <Video size={12} /> : <FileText size={12} />}
                  {s.type}
                </span>
              </td>

              <td data-label="Actions" className="actions-cell">
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => onEdit(s)} className="icon-btn" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDelete(s._id)} className="icon-btn-danger" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="fab-container">
      <button className="fab" onClick={onCreateSession}>
        <Plus size={24} /> <span>Add Session</span>
      </button>
    </div>
  </>
);

export default SessionManagementTab;