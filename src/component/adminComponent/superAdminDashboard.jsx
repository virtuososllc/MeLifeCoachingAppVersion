import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

import { AdminToast }         from '../uiComponent/Toast';
import { ConfirmationModal }  from './subComponent/ConfirmationModal';
import Profile                from '../CommonComponent/Profile';
import AdminNavbar            from './subComponent/AdminNavbar';
import UserManagementTab      from './subComponent/UserManagementTab';
import SessionManagementTab   from './subComponent/SessionManagementTab';
import CreateAdminModal       from './subComponent/CreateAdminModal';
import SessionModal           from './subComponent/SessionModal';
import AccessManagementModal  from './subComponent/AccessManagementModal';
import ReflectionTab          from './subComponent/AdminReflectionsTab';
import FlashcardManagementTab from './subComponent/FlashcardManagementTab';
import AdminAssignmentsTab    from './subComponent/AdminAssignmentsTab';
import PWABottomNav           from '../CommonComponent/PWABottomNav';
import AdminTestimonialsTab     from './subComponent/AdminTestimonialsTab';
import Footer                 from '../uiComponent/footer';
import '../../css/adminDashboard.css';
import adminDashboardApiService from '../../apiServices/adminDashboardApiService';
import { storage }              from '../../apiServices/userDashboardApiService';

const getIsPWA = () =>
  Capacitor.isNativePlatform() ||
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const SuperAdminDashboard = () => {
  const [currentUser, setCurrentUser]           = useState(null);
  const [activeTab, setActiveTab]               = useState('users');
  const [loading, setLoading]                   = useState(true);
  const [isPWA, setIsPWA]                       = useState(getIsPWA);
  const [activeTabProfile, setActiveTabProfile] = useState('dashboard');
  const navigate = useNavigate();

  const [users, setUsers]                 = useState([]);
  const [sessions, setSessions]           = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [modals, setModals]             = useState({ admin: false, session: false, access: false });
  const [confirmation, setConfirmation] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toast, setToast]               = useState({ visible: false, message: '', type: 'info' });
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => setIsPWA(e.matches || window.navigator.standalone === true || Capacitor.isNativePlatform());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handlePWATabChange = (tab) => {
    if (tab === 'profile') { setActiveTabProfile('profile'); }
    else { setActiveTabProfile('dashboard'); setActiveTab(tab); }
  };

  const allPendingRequests = users.flatMap(u =>
    (u.accessRequests || [])
      .filter(r => r.status === 'pending')
      .map(r => ({ ...r, user: u }))
  ).sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  const newUsers = users.filter(u => {
    const joined = new Date(u.createdAt);
    return (new Date() - joined) / (1000 * 60 * 60 * 24) < 7;
  });

  const adminData = {
    requests: allPendingRequests, newUsers, sessions,
    onReview: (user) => { setSelectedItem(user); setModals({ ...modals, access: true }); },
  };

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const requestConfirmation = (title, message, onConfirm) => {
    setConfirmation({
      isOpen: true, title, message,
      onConfirm: () => { onConfirm(); setConfirmation(prev => ({ ...prev, isOpen: false })); },
    });
  };

  useEffect(() => {
    const init = async () => {
      const token = storage.get('token') || sessionStorage.getItem('token') || 'demo-token';
      try {
        const user = await adminDashboardApiService.fetchUser(token);
        const resolvedUser = user || { Name: 'Super Admin', role: 'superadmin', email: 'admin@demo.com' };
        setCurrentUser(resolvedUser);
        if (resolvedUser.role === 'user') { navigate('/dashboard', { replace: true }); return; }
        await loadData(token);
      } catch (e) {
        console.error('Auth failed:', e);
        setCurrentUser({ Name: 'Super Admin', role: 'superadmin', email: 'admin@demo.com' });
      } finally { setLoading(false); }
    };
    init();
    const interval = setInterval(() => {
      const token = storage.get('token') || sessionStorage.getItem('token');
      if (token) loadData(token, true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (t, silent = false) => {
    const token = t || storage.get('token') || sessionStorage.getItem('token') || 'demo-token';
    try {
      const [uData, sData, nData] = await Promise.all([
        adminDashboardApiService.fetchAllUsers(token),
        adminDashboardApiService.fetchSessions(token),
        adminDashboardApiService.fetchNotifications(token).catch(() => []),
      ]);
      setUsers(uData || []);
      setSessions((sData || []).sort((a, b) => a.dayNumber - b.dayNumber));
      setNotifications(nData || []);
    } catch (e) { if (!silent) console.error('Data load failed', e); }
  };

  const handleCreateAdmin = async (data) => {
    try { await adminDashboardApiService.createAdmin(data, storage.get('token') || sessionStorage.getItem('token')); showToast('Admin created', 'success'); setModals({ ...modals, admin: false }); loadData(); }
    catch { showToast('Failed to create admin', 'error'); }
  };

  const handleSaveSession = async (data) => {
    const token = storage.get('token') || sessionStorage.getItem('token');
    const payload = { ...data, contextPoints: typeof data.contextPoints === 'string' ? data.contextPoints.split('\n').filter(x => x.trim()) : data.contextPoints };
    try {
      if (selectedItem) { await adminDashboardApiService.updateSession(selectedItem._id, payload, token); showToast('Session updated', 'success'); }
      else               { await adminDashboardApiService.createSession(payload, token); showToast('Session created', 'success'); }
      setModals({ ...modals, session: false }); setSelectedItem(null); loadData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteSession = (id) => {
    requestConfirmation('Delete Session', 'Are you sure? This cannot be undone.', async () => {
      try { await adminDashboardApiService.deleteSession(id, storage.get('token') || sessionStorage.getItem('token')); showToast('Session deleted', 'success'); loadData(); }
      catch { showToast('Failed to delete session', 'error'); }
    });
  };

  const handleDeleteUser = (id) => {
    requestConfirmation('Delete User', 'Are you sure? All their progress will be lost.', async () => {
      try { await adminDashboardApiService.deleteUser(id, storage.get('token') || sessionStorage.getItem('token')); showToast('User deleted', 'success'); loadData(); }
      catch { showToast('Failed to delete user', 'error'); }
    });
  };

  const handleGrantAccess = async (sessionId, isGranted) => {
    try {
      const token = storage.get('token') || sessionStorage.getItem('token');
      const res = await adminDashboardApiService.grantAccess(selectedItem._id, sessionId, isGranted, token);
      setSelectedItem(prev => ({ ...prev, completedSessions: res.completedSessions, specialAccess: res.specialAccess, accessRequests: res.accessRequests }));
      setUsers(prev => prev.map(u => u._id === selectedItem._id ? { ...u, ...res } : u));
      showToast(isGranted ? 'Access granted' : 'Access revoked', 'success');
      await loadData(token);
    } catch { showToast('Failed to update access', 'error'); }
  };

  const handleUpdateProfile = async (data) => {
    try { await adminDashboardApiService.updateProfile(data, storage.get('token') || sessionStorage.getItem('token')); showToast('Profile updated!'); setCurrentUser(prev => ({ ...prev, ...data })); }
    catch { showToast('Failed to update profile.'); }
  };

  const handlePasswordReset = async (data) => {
    if (data.new !== data.confirm) { showToast('Passwords do not match'); return; }
    try { await adminDashboardApiService.resetPassword(data, storage.get('token') || sessionStorage.getItem('token')); showToast('Password changed!'); }
    catch (e) { showToast(e.message || 'Failed to change password.'); }
  };

  const handleLogout = () => {
    sessionStorage.clear(); storage.remove('token'); storage.remove('user');
    navigate('/home', { replace: true });
  };

  if (loading) return (
    <div className="loader-screen"><Loader2 className="animate-spin" size={40} /></div>
  );

  return (
    <div className={`sa-container${isPWA ? ' pwa-mode' : ''}`}>

      <AdminNavbar user={currentUser} adminData={adminData} notifications={notifications}
        onProfileClick={() => setActiveTabProfile('profile')}
        onDashboardClick={() => setActiveTabProfile('dashboard')}
        onLogout={handleLogout}
      />

      {activeTabProfile === 'dashboard' ? (
        <div className="sa-content">
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'users'       ? 'active' : ''}`} onClick={() => setActiveTab('users')}>User Management</button>
            <button className={`tab-btn ${activeTab === 'sessions'    ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>Session Management</button>
            <button className={`tab-btn ${activeTab === 'reflections' ? 'active' : ''}`} onClick={() => setActiveTab('reflections')}>User Reflections</button>
            <button className={`tab-btn ${activeTab === 'flashcards'  ? 'active' : ''}`} onClick={() => setActiveTab('flashcards')}>Flashcards</button>
            <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>Assignments</button>
            <button className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`} onClick={() => setActiveTab('testimonials')}>Testimonials</button>
          </div>

          {activeTab === 'users' ? (
            <UserManagementTab users={users} sessions={sessions}
              onManage={(u) => { setSelectedItem(u); setModals({ ...modals, access: true }); }}
              onDelete={handleDeleteUser}
              onCreateAdmin={() => setModals({ ...modals, admin: true })}
            />
          ) : activeTab === 'sessions' ? (
            <SessionManagementTab sessions={sessions}
              onEdit={(s) => { setSelectedItem(s); setModals({ ...modals, session: true }); }}
              onDelete={handleDeleteSession}
              onCreateSession={() => { setSelectedItem(null); setModals({ ...modals, session: true }); }}
            />
          ) : activeTab === 'reflections' ? (
            <ReflectionTab />
          ) : activeTab === 'flashcards' ? (
            <FlashcardManagementTab users={users} showToast={showToast} />
          ) : activeTab === 'assignments' ? (
            <AdminAssignmentsTab users={users} sessions={sessions} showToast={showToast} />
          ) : activeTab === 'testimonials' ? (
            <AdminTestimonialsTab />
          ) : null}
        </div>
      ) : (
        <div className={isPWA ? 'profile-pwa-wrapper' : ''}
          style={!isPWA ? { position: 'relative', padding: '16px', overflowY: 'auto', top: '95px' } : { padding: '16px', overflowY: 'auto' }}
        >
          <Profile user={currentUser} sessions={sessions}
            onUpdate={handleUpdateProfile} onPasswordChange={handlePasswordReset}
            onLogout={handleLogout} isAdmin={true}
            adminStats={{ totalUsers: users.filter(u => u.role === 'user').length, totalAdmins: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length, totalSessions: sessions.length, todayVisitors: '—' }}
          />
        </div>
      )}

      <CreateAdminModal isOpen={modals.admin} onClose={() => setModals({ ...modals, admin: false })} onSave={handleCreateAdmin} />
      <SessionModal isOpen={modals.session} onClose={() => { setModals({ ...modals, session: false }); setSelectedItem(null); }} session={selectedItem} onSave={handleSaveSession} />
      <AccessManagementModal isOpen={modals.access} onClose={() => { setModals({ ...modals, access: false }); setSelectedItem(null); }} user={selectedItem} sessions={sessions} onGrant={handleGrantAccess} />
      <ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message} onConfirm={confirmation.onConfirm} onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))} />
      <AdminToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

      {isPWA && <PWABottomNav activeTab={activeTabProfile === 'profile' ? 'profile' : activeTab} onLogout={handleLogout} onTabChange={handlePWATabChange} isAdmin={true} />}
      {!isPWA && <Footer />}
    </div>
  );
};

export default SuperAdminDashboard;