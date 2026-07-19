import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, CheckCircle, Loader2 } from 'lucide-react';
import { Toast } from '../uiComponent/Toast';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import AudioPlayerModal from './AudioPlayerModal';
import UserNavbar from './userNavbar';
import UserSession from './UserSession';
import Profile from '../CommonComponent/Profile';
import UserReflections from './UserReflection';
// import Flashcards from './userFlashcards';
import UserAssignmentsTab from './UserAssignmentsTab';
import PWABottomNav from '../CommonComponent/PWABottomNav';
import generateSystemNotifications from '../../utils/generateSystemNotifications';
import { getDailyCard } from '../../utils/Dailyinsight';
import Footer from '../uiComponent/footer';
import '../../css/dashboard.css';
import userApiService, { storage } from '../../apiServices/userDashboardApiService';
import { ClipboardList } from 'lucide-react';
import { removePushNotifications } from '../../utils/flashcardNotification';
import LogoImg from '../../assests/Logo.jpg';

const getIsPWA = () =>
  Capacitor.isNativePlatform() ||
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const UserDashboard = () => {
  const [currentUser, setCurrentUser]     = useState(null);
  const [sessions, setSessions]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [audioSession, setAudioSession]   = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedReflectionSessionId, setSelectedReflectionSessionId] = useState(null);
  const [activeTab, setActiveTab]         = useState('dashboard');
  const [toast, setToast]                 = useState({ show: false, message: '' });
  const [preferredLanguage, setPreferredLanguage] = useState('english');
  const [isPWA, setIsPWA]                 = useState(getIsPWA);

  // ── PWA new-assignment banner ─────────────────────────────────
  const [newAssignmentBanner, setNewAssignmentBanner] = useState(null); // { count, sessionTitle }

  const latestNotificationRef = useRef(null);
  const scrollableRef         = useRef(null);
  const navigate              = useNavigate();

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => setIsPWA(e.matches || window.navigator.standalone === true || Capacitor.isNativePlatform());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const loadData = async () => {
    try {
      const token = storage.get('token') || 'demo-token';
      const [userData, sessionsData] = await Promise.all([
        userApiService.fetchUser(token),
        userApiService.fetchSessions(token),
      ]);
      setCurrentUser(userData || { Name: 'Demo User', createdAt: new Date().toISOString() });
      if (userData?.preferredLanguage) setPreferredLanguage(userData.preferredLanguage);

      const mergedSessions = (sessionsData || []).map(session => {
        const isCompleted   = userData?.completedSessions?.includes(session._id);
        const specialAccess = userData?.specialAccess?.find(sa => sa.sessionId === session._id);
        const requests      = userData?.accessRequests?.filter(r => r.sessionId === session._id) || [];
        const isPending     = requests.some(r => r.status === 'pending');
        return {
          ...session,
          isCompleted:            !!isCompleted,
          hasSpecialAccess:       !!specialAccess,
          specialAccessExpiresAt: specialAccess ? specialAccess.expiresAt : null,
          accessRequestStatus:    isPending ? 'pending' : null,
          specialAccessCount:     requests.length,
        };
      });
      setSessions(mergedSessions.sort((a, b) => a.dayNumber - b.dayNumber));

      const systemNotifs = generateSystemNotifications(mergedSessions, userData?.createdAt);
      const apiNotifs    = await userApiService.fetchNotifications(token).catch(() => []);
      const combined     = [...systemNotifs, ...apiNotifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(combined);
      if (combined.length > 0) latestNotificationRef.current = combined[0].createdAt || combined[0]._id;

      // Check for unnotified assignments (PWA banner)
      if (isPWA) {
        try {
          const aData = await userApiService.fetchMyAssignments(token);
          const unnotified = (aData.assignments || []).filter(a => !a.userNotified);
          if (unnotified.length > 0) {
            setNewAssignmentBanner({
              count: unnotified.length,
              sessionTitle: unnotified[0]?.sessionId?.title || 'a session',
            });
          }
        } catch (err) { console.warn('Failed to check new assignments for banner:', err.message); }
      }
    } catch (err) {
      console.warn('Dashboard Load Failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewNotifications = async () => {
    const token = storage.get('token') || 'demo-token';
    try {
      const apiNotifs = await userApiService.fetchNotifications(token).catch(() => []);
      const newest    = apiNotifs[0];
      const newestId  = newest ? (newest.createdAt || newest._id) : null;
      if (newestId && newestId !== latestNotificationRef.current) {
        showToast(newest.message);
        latestNotificationRef.current = newestId;
        setNotifications(prev => {
          const sys = prev.filter(n => n.type === 'info' || n.type === 'warning');
          return [...sys, ...apiNotifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(fetchNewNotifications, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (scrollableRef.current) scrollableRef.current.scrollTop = 0;
  }, [activeTab]);

  const handleLanguageChange = async (lang) => {
    setPreferredLanguage(lang);
    try { await userApiService.updateLanguagePreference(lang, storage.get('token')); }
    catch (err) { console.warn('Failed to save language preference:', err.message); }
  };

  const handleRequestAccess = async (sessionId) => {
    try {
      await userApiService.requestAccess(sessionId, storage.get('token'));
      setSessions(prev => prev.map(s =>
        s._id === sessionId
          ? { ...s, accessRequestStatus: 'pending', specialAccessCount: (s.specialAccessCount || 0) + 1 }
          : s
      ));
      showToast('Request sent! Admin will be notified.');
    } catch { showToast('Failed to send request.'); }
  };

  const handleUpdateProfile = async (data) => {
    try {
      await userApiService.updateProfile(data, storage.get('token'));
      showToast('Profile updated successfully!');
      setCurrentUser(prev => ({ ...prev, ...data }));
    } catch { showToast('Failed to update profile.'); }
  };

  const handlePasswordReset = async (data) => {
    if (data.new !== data.confirm) { showToast('Passwords do not match'); return; }
    try {
      await userApiService.resetPassword(data, storage.get('token'));
      showToast('Password changed successfully!');
    } catch (e) { showToast(e.message || 'Failed to change password.'); }
  };

  const markSessionComplete = async (sessionId) => {
    setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, isCompleted: true } : s));
    try {
      await userApiService.completeSession(sessionId, storage.get('token'));
      showToast('Session completed! 🎉');
    } catch {
      setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, isCompleted: false } : s));
      showToast('Failed to sync completion status.');
    }
  };

  const handleStartSession = (sessionId) => {
    const session = sessions.find(s => s._id === sessionId);
    if (!session) return;
    if (session.type === 'Recorded') setAudioSession(session);
    else markSessionComplete(sessionId);
  };

  const handleReflect = (session) => {
    setSelectedReflectionSessionId(session._id);
    setActiveTab('reflections');
  };

  const handleLogout = async () => {
      await removePushNotifications();
    storage.clear();
    navigate('/home', { replace: true });
  };

  const handleTabChange = (tab) => {
    if (tab === '__logout__') { handleLogout(); return; }
    setActiveTab(tab);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
      <Loader2 className="animate-spin" />
    </div>
  );

  const completedCount = sessions.filter(s => s.isCompleted).length;
  const { card: dailyInsight, dayNumber: insightDay } = getDailyCard(currentUser?.createdAt);

  return (
    <div className={`dashboard-scope${isPWA ? ' pwa-mode' : ''}`}>

      {/* ── Top bar ── */}
      {isPWA ? (
        <header className="pwa-app-topbar">
          <img src={LogoImg} alt="logo" className="pwa-app-topbar__logo" />
          <span className="pwa-app-topbar__name">MeLifeCoaching</span>
        </header>
      ) : (
        <UserNavbar
          user={currentUser}
          notifications={notifications}
          onProfileClick={() => setActiveTab('profile')}
          onDashboardClick={() => setActiveTab('dashboard')}
          onReflectionsClick={() => setActiveTab('reflections')}
          // onFlashcardsClick={() => setActiveTab('flashcards')}
          onAssignmentsClick={() => setActiveTab('assignments')}
          onLogout={handleLogout}
        />
      )}

      {/* ── PWA new-assignment banner ── */}
      {isPWA && newAssignmentBanner && (
        <div
          style={{
            position: 'fixed', top: 60, left: 12, right: 12, zIndex: 999,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 14, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
            cursor: 'pointer',
          }}
          onClick={() => {
            setNewAssignmentBanner(null);
            setActiveTab('assignments');
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 9, padding: 8 }}>
            <ClipboardList size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>
              {newAssignmentBanner.count === 1
                ? 'New Assignment Posted'
                : `${newAssignmentBanner.count} New Assignments`}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', margin: '2px 0 0' }}>
              {newAssignmentBanner.sessionTitle} · Tap to view
            </p>
          </div>
          <button
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1rem', padding: 4 }}
            onClick={(e) => { e.stopPropagation(); setNewAssignmentBanner(null); }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="scrollable-area" ref={scrollableRef}>
        <div className="content-max-width">
          {activeTab === 'dashboard' ? (
            <>
              <div className="dashboard-top-grid">
                <div className="welcome-banner">
                  <h1 className="welcome-title">
                    Welcome back, {currentUser?.Name?.split(' ')[0] || 'Traveler'}!
                  </h1>
                  <p className="welcome-sub">You are on your transformation journey. Keep up the momentum!</p>
                  <div className="banner-stats">
                    <div className="stat-pill"><CheckCircle size={18} /> {completedCount} Sessions Completed</div>
                  </div>
                </div>
                <div className="flashcard">
                  <div className="flashcard-header"><Lightbulb size={16} /> Daily Insight · Day {insightDay}</div>
                  <p className="flashcard-content">"{dailyInsight}"</p>
                  <div className="flashcard-footer">— MeLifeCoaching</div>
                </div>
              </div>
              <div className="sessions-list">
                <div className="timeline-line"></div>
                {sessions.map(session => (
                  <UserSession
                    key={session._id}
                    session={session}
                    userCreatedAt={currentUser?.createdAt}
                    onRequestAccess={handleRequestAccess}
                    onOpenReflection={handleReflect}
                    onStartSession={handleStartSession}
                  />
                ))}
              </div>
            </>
          ) : activeTab === 'reflections' ? (
            <UserReflections
              sessions={sessions}
              user={currentUser}
              initialSessionId={selectedReflectionSessionId}
            />
          )  : activeTab === 'assignments' ? (                          
               <UserAssignmentsTab
                 sessions={sessions}
                 userCreatedAt={currentUser?.createdAt}
               />

          ) : (
            <Profile
              user={currentUser}
              sessions={sessions}
              onUpdate={handleUpdateProfile}
              onPasswordChange={handlePasswordReset}
              onLogout={handleLogout}
            />
          )}
          
          {/* : activeTab === 'flashcards' ? (
            <Flashcards sessions={sessions} userCreatedAt={currentUser?.createdAt} />
          ) : null */}
          
          
          
          
        
        </div>
      </div>

      <AudioPlayerModal
        isOpen={!!audioSession}
        onClose={() => setAudioSession(null)}
        session={audioSession}
        preferredLanguage={preferredLanguage}
        onLanguageChange={handleLanguageChange}
        onComplete={(id) => { setAudioSession(null); markSessionComplete(id); }}
      />
      <Footer />

      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      {!isPWA && <Footer />}

      {isPWA && (
        <PWABottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          isAdmin={false}
        />
      )}
    </div>
  );
};

export default UserDashboard;