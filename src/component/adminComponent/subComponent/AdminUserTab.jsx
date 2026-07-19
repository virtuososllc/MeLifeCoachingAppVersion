import React from 'react';
import { Users, Shield, Trash2, AlertCircle } from 'lucide-react';
import { getInitials } from '../../../utils/getUserSessionStatusAndInitials';
import '../../../css/adminDashboard.css';

/**
 * AdminUserTab
 *
 * Same as UserManagementTab but:
 *   - No "Add New Admin" card (regular admin cannot create admins)
 *   - No onCreateAdmin prop needed
 *   - superadmin rows show no delete/manage button (admin can't touch superadmins)
 */
const AdminUserTab = ({ users, sessions, onManage, onDelete }) => (
  <div className="sa-grid">
    {users.map((user) => {
      // Regular admins cannot manage or delete other admins / superadmins
      const isHigherRole = user.role === 'superadmin' || user.role === 'admin';

      const completed = user.completedSessions?.length || 0;
      const total     = sessions.length || 15;
      const progress  = Math.min(100, (completed / total) * 100);

      const pendingRequests = Array.isArray(user.accessRequests)
        ? user.accessRequests.filter(r => r.status === 'pending').length
        : 0;

      return (
        <div key={user._id} className="sa-card">

          {/* Header */}
          <div className="card-header-row">
            <div className="user-info" style={{ display: 'flex' }}>
              <div className="avatar-initials">{getInitials(user.Name)}</div>
              <div>
                <h3>{user.Name}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            <span className={`role-badge ${user.role}`}>
              {user.role === 'superadmin' ? <Shield size={10} /> : <Users size={10} />}
              {user.role}
            </span>
          </div>

          {/* Progress — only meaningful for regular users */}
          {!isHigherRole && (
            <div className="progress-section">
              <div className="stat-row">
                <span>Progress</span>
                <span>{completed}/{total}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Pending request banner */}
          {!isHigherRole && pendingRequests > 0 && (
            <div style={{
              background: 'rgba(250,204,21,0.15)', color: '#facc15',
              padding: '8px', borderRadius: '6px', fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '6px',
              border: '1px solid rgba(250,204,21,0.2)',
            }}>
              <AlertCircle size={14} />
              {pendingRequests} Access Request{pendingRequests > 1 ? 's' : ''}
            </div>
          )}

          {/* Actions — hidden for higher roles */}
          {!isHigherRole && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => onManage(user)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                {pendingRequests > 0 ? 'Review Requests' : 'Manage Access'}
              </button>
              <button
                onClick={() => onDelete(user._id)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Read-only label for admin/superadmin rows */}
          {isHigherRole && (
            <p style={{ fontSize: '0.75rem', color: '#555', margin: '8px 0 0', fontStyle: 'italic' }}>
              Admin account — view only
            </p>
          )}

        </div>
      );
    })}
  </div>
);

export default AdminUserTab;