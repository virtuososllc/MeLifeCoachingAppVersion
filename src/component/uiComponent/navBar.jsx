import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Home, Info, Phone, LogIn, UserPlus, FileUser } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import LogoImg from '../../assests/Logo.jpg';
import '../../css/navBar.css';
import { storage } from '../../apiServices/userDashboardApiService';

const getIsPWA = () =>
  Capacitor.isNativePlatform() ||
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

// ── role detection ────────────────────────────────────────
const getUserRole = () => {
  // Login flow — stored in localStorage via storage.set
  const lsUser = storage.get('user');
  if (lsUser) {
    try {
      const parsed = typeof lsUser === 'string' ? JSON.parse(lsUser) : lsUser;
      if (parsed?.role) return parsed.role;
    } catch (error) {
      console.error(error);
    }
  }

  // Register flow — stored in sessionStorage
  const ssUser = sessionStorage.getItem('user');
  if (ssUser) {
    try {
      const parsed = JSON.parse(ssUser);
      if (parsed?.role) return parsed.role;
    } catch (error) {
      console.error(error);
    }
  }

  return 'user'; // safe fallback
};

const getDashboardPath = (role) => {
  if (role === 'superadmin') return '/super-admin-dashboard';
  if (role === 'admin')      return '/admin-dashboard';
  return '/dashboard';
};

const getIsLoggedIn = () => {
  return !!(storage.get('token') || sessionStorage.getItem('token'));
};

// PWA bottom-nav tabs
const PWA_GUEST_TABS = [
  { label: 'Home',     to: '/home',     Icon: Home     },
  { label: 'Program',  to: '/program',  Icon: Info     },
  { label: 'About',    to: '/about',    Icon: FileUser     },
  { label: 'Contact',  to: '/contact',  Icon: Phone    },
  { label: 'Login',    to: '/login',    Icon: LogIn    },
  { label: 'Register', to: '/register', Icon: UserPlus },
];

const PWA_AUTH_TABS = [
  { label: 'Home',      to: '/home',      Icon: Home            },
  { label: 'Program',   to: '/program',   Icon: Info            },
  { label: 'About',     to: '/about',     Icon: FileUser        },
  { label: 'Contact',   to: '/contact',   Icon: Phone           },
  { label: 'Dashboard', to: null,         Icon: LayoutDashboard }, // 'to: null' = role-based
];

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPWA,      setIsPWA]      = useState(getIsPWA);
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    // Native platform status never changes at runtime, but the
    // standalone-display-mode media query can (e.g. installing the PWA
    // mid-session), so we still listen for that.
    if (Capacitor.isNativePlatform()) {
      setIsPWA(true);
      return;
    }
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => setIsPWA(e.matches || window.navigator.standalone === true);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => { setIsLoggedIn(getIsLoggedIn()); });

  const closeMenu = () => setIsMenuOpen(false);

  // ── role-aware navigation ─────────────────────────────
  const goToDashboard = (e) => {
    e?.preventDefault();
    closeMenu();
    const role = getUserRole();
    navigate(getDashboardPath(role));
  };

  const handleNav = (e, to) => {
    e.preventDefault();
    closeMenu();
    if (to === null) {
      goToDashboard(e);
    } else {
      navigate(to);
    }
  };

  const pwaTabs = isLoggedIn ? PWA_AUTH_TABS : PWA_GUEST_TABS;

  // ── PWA / NATIVE MODE ──────────────────────────────────
  if (isPWA) {
    return (
      <>
        <nav className="navbar pwa-topbar">
          <div className="navContent navContent--center">
            <Link to="/home" className="logo">
              <img src={LogoImg} alt="MeLifeCoaching logo" className="logoImg" />
              <span className="logo-name">MeLifeCoaching</span>
            </Link>
          </div>
        </nav>

        <nav
          className="pwa-bottom-nav pwa-home-nav"
          style={{ gridTemplateColumns: `repeat(${pwaTabs.length}, 1fr)` }}
          aria-label="Main navigation"
        >
          {pwaTabs.map(({ label, to, Icon }) => {
            const resolvedTo = to ?? getDashboardPath(getUserRole());
            const isActive   = window.location.pathname === resolvedTo;
            return (
              <button
                key={label}
                className={`pwa-nav-item${isActive ? ' pwa-nav-item--active' : ''}`}
                onClick={(e) => handleNav(e, to)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="pwa-nav-icon-wrap">
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
                </span>
                <span className="pwa-nav-label">{label}</span>
              </button>
            );
          })}
        </nav>
      </>
    );
  }

  // ── WEB MODE ──────────────────────────────────────────
  return (
    <div className="home-root">
      <nav className="navbar">
        <div className="navContent">

          <Link to="/home" className="logo logo--center" onClick={closeMenu}>
            <img src={LogoImg} alt="MeLifeCoaching logo" className="logoImg" />
            <span className="logo-name">MeLifeCoaching</span>
          </Link>

          <div className="nav-links desktop-only">
            <Link to="/program">Program</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            {isLoggedIn ? (
              <button className="btn btn-primary" onClick={goToDashboard}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link to="/login"><button className="btn btn-primary">Login</button></Link>
                <Link to="/register"><button className="btn btn-primary">Register</button></Link>
              </>
            )}
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
        <button className="mobile-close-btn" onClick={closeMenu} aria-label="Close menu">
          <X size={20} />
        </button>
        <div className="mobile-nav-links">
          <Link to="/program" onClick={closeMenu}>Program</Link>
          <Link to="/about"   onClick={closeMenu}>About</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
          {isLoggedIn ? (
            <a href="#" onClick={goToDashboard}>Go to Dashboard →</a>
          ) : (
            <>
              <Link to="/login"    onClick={closeMenu}>Login</Link>
              <Link to="/register" onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;