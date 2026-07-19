import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, ChevronDown, User, Home, LogOut,
  MessageSquare, Zap, ClipboardList,
} from 'lucide-react';
import '../../css/dashboard.css';
import NotificationDropdown from '../uiComponent/NotificationDropdown';
import LogoImg from '../../assests/Logo.jpg';
import * as utils from '../../utils/getUserSessionStatusAndInitials';

/**
 * UserNavbar
 * Props:
 *   user                — current user object
 *   notifications       — array of notification objects
 *   onProfileClick      — () => void
 *   onLogout            — () => void
 *   onDashboardClick    — () => void
 *   onReflectionsClick  — () => void
 *   onFlashcardsClick   — () => void
 *   onAssignmentsClick  — () => void   ← new
 */
const UserNavbar = ({
  user,
  notifications = [],
  onProfileClick,
  onLogout,
  onDashboardClick,
  onReflectionsClick,
  // onFlashcardsClick,
  onAssignmentsClick,
}) => {
  const [isNotifOpen,           setIsNotifOpen]           = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeUser    = user || { Name: 'Guest', email: '', profilePicture: null };
  const unreadCount = notifications.filter(n => !n.read).length;

  // Shared dropdown items so desktop + mobile stay in sync
  const dropdownItems = (close) => (
    <>
      <div style={{ padding: '0 12px 8px', borderBottom: '1px solid #333', marginBottom: 8 }}>
        <div style={{ fontSize: '0.75rem', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Signed in as
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
          {safeUser.email}
        </div>
      </div>

      <button onClick={() => { close(); onDashboardClick(); }}   className="dropdown-item"><Home size={16} /> Dashboard</button>
      <button onClick={() => { close(); onAssignmentsClick(); }} className="dropdown-item"><ClipboardList size={16} /> Assignments</button>
      <button onClick={() => { close(); onReflectionsClick(); }} className="dropdown-item"><MessageSquare size={16} /> Daily Journal</button>
      {/* <button onClick={() => { close(); onFlashcardsClick(); }}  className="dropdown-item"><Zap size={16} /> Flashcards</button> */}
      <button onClick={() => { close(); onProfileClick(); }}     className="dropdown-item"><User size={16} /> Profile</button>
      <button onClick={onLogout}                                  className="dropdown-item danger"><LogOut size={16} /> Logout</button>
    </>
  );

  const close = () => setIsProfileDropdownOpen(false);

  return (
    <nav className="user-navbar">
      <div className="nav-content">

        {/* Logo */}
        <div className="logo">
          <img src={LogoImg} alt="logo" className="logoImg" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            MeLifeCoaching
          </span>
        </div>

        {/* ── Desktop nav links ── */}
        <div className="nav-links desktop-only">
          <div style={{ fontSize: '0.9rem', color: '#a3a3a3' }}>
            Hi, <span style={{ color: '#fff', fontWeight: 600 }}>{safeUser.Name}</span>
          </div>

          {/* Notification bell */}
          <div className="notification-container" ref={notifRef}>
            <button className="notification-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge" />}
            </button>
            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              notifications={notifications}
            />
          </div>

          {/* Quick-access icon buttons */}
          <div className="notification-container">
            <button className="notification-btn" title="Dashboard" onClick={onDashboardClick}>
              <Home size={16} />
            </button>
          </div>

          <div className="notification-container">
            <button className="notification-btn" title="Daily Journal" onClick={onReflectionsClick}>
              <MessageSquare size={16} />
            </button>
          </div>

          {/* Flashcards text link 
          <div
            className="nav-item"
            onClick={onFlashcardsClick}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Zap size={16} /> Flashcards
          </div>/ *}

          {/* Assignments text link — new */}
          <div
            className="nav-item"
            onClick={onAssignmentsClick}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ClipboardList size={16} /> Assignments
          </div>

          {/* Profile dropdown */}
          <div className="profile-dropdown-container">
            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="profile-btn">
              {safeUser.profilePicture
                ? <img className="avatar-img" src={safeUser.profilePicture} alt={safeUser.Name} />
                : <div className="avatar-initials">{utils.getInitials(safeUser.Name)}</div>
              }
              <ChevronDown
                size={14}
                color="#a3a3a3"
                style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>
            {isProfileDropdownOpen && (
              <div className="dropdown-menu">{dropdownItems(close)}</div>
            )}
          </div>
        </div>

        {/* ── Mobile header (bell + avatar) ── */}
        <div className="mobile-menu-btn">
          <div className="notification-container" ref={notifRef}>
            <button className="notification-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge" />}
            </button>
            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              notifications={notifications}
            />
          </div>

          <div className="profile-dropdown-container">
            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="profile-btn">
              {safeUser.profilePicture
                ? <img className="avatar-img" src={safeUser.profilePicture} alt={safeUser.Name} />
                : <div className="avatar-initials">{utils.getInitials(safeUser.Name)}</div>
              }
              <ChevronDown
                size={14}
                color="#a3a3a3"
                style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>
            {isProfileDropdownOpen && (
              <div className="dropdown-menu">{dropdownItems(close)}</div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default UserNavbar;