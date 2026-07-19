// import React, { useEffect, useState } from 'react';
// import HomePage from './component/homePage';
// import About from './component/aboutPage';
// import Program from './component/program';
// import Contact from './component/contact';
// import Register from './component/registration';
// import Login from './component/login';
// import ForgotPass from './component/forgotPassword';
// import ResetPassword from './component/resetPassword';
// import Dashboard from './component/userComponent/userDashboard';
// import SuperAdminDashboard from './component/adminComponent/superAdminDashboard';
// import AdminDashboard from './component/adminComponent/Admindashboard';
// import PrivacyPolicy from './component/uiComponent/PrivacyPolicy';
// import TermsAndConditions from './component/uiComponent/TermsAndConditions';
// import PaymentAndCancellations from './component/uiComponent/PaymentAndCancellations';
// import PWAFlashcardSplash from './component/userComponent/PWAFlashcardSplash';
// import ScrollToTop from './utils/scrollToTop';
// import { storage } from './apiServices/userDashboardApiService';
// import {
//   initPushNotifications,
//   checkLaunchNotification,
//   setNavigate,
//   registerNotificationTapListener,
//   initNativePushListeners,
// } from './utils/flashcardNotification';
// import BookingPage from './component/uiComponent/BookingPage';
// import './App.css';
// import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// // Capacitor
// import { StatusBar, Style } from '@capacitor/status-bar';
// import { SplashScreen } from '@capacitor/splash-screen';
// import { Capacitor } from '@capacitor/core';

// if (Capacitor.isNativePlatform()) {
//   StatusBar.setBackgroundColor({ color: '#000000' });
//   StatusBar.setStyle({ style: Style.Dark });
// }

// // ─── Global Navigation Bridge ──────────────────────────────────────
// // ✅ Stays mounted for the app's entire lifetime — sibling to Routes,
// // so _navigateFn always points to a valid navigate function regardless
// // of which screen is currently active.
// function NavigationBridge() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     setNavigate(navigate);
//   }, [navigate]);

//   return null;
// }

// // ─── PWA Entry Gate ────────────────────────────────────────────────
// function RootEntry({ storageReady, launchChecked }) {
//   const navigate = useNavigate();

//   const isPWA =
//     window.matchMedia('(display-mode: standalone)').matches ||
//     window.navigator.standalone === true ||
//     Capacitor.isNativePlatform();

//   useEffect(() => {
//     if (!storageReady || !launchChecked) return;

//     const isLoggedIn = !!storage.get('token');

//     const notificationUrl = storage.get('notification_url');
//     if (notificationUrl && isLoggedIn) {
//       storage.remove('notification_url');
//       console.log('Opened from notification → navigating to:', notificationUrl);
//       navigate(notificationUrl, { replace: true });
//       return;
//     }

//     if (isPWA && isLoggedIn) {
//       initPushNotifications().catch(err =>
//         console.warn('Push init on reopen failed (non-critical):', err)
//       );
//       navigate('/dashboard', { replace: true });
//     } else {
//       navigate('/home', { replace: true });
//     }
//   }, [storageReady, launchChecked]);

//   return null;
// }

// function App() {
//   const [storageReady, setStorageReady] = useState(
//     !Capacitor.isNativePlatform()
//   );

//   const [launchChecked, setLaunchChecked] = useState(
//     !Capacitor.isNativePlatform()
//   );

//   const isBooting = !storageReady || !launchChecked;

//   // ✅ Register the single notification-tap listener as early as possible
//   useEffect(() => {
//      if (!Capacitor.isNativePlatform()) return;

//   registerNotificationTapListener();
//   initNativePushListeners();
//   }, []);

//   useEffect(() => {
//     if (!Capacitor.isNativePlatform()) return;

//     storage.syncFromNative().then(async () => {
//       setStorageReady(true);
//       await checkLaunchNotification();
//       setLaunchChecked(true);
//     });
//   }, []);

//   useEffect(() => {
//     if (!Capacitor.isNativePlatform()) return;
//     if (isBooting) return;

//     SplashScreen.hide().catch((err) =>
//       console.warn('SplashScreen.hide failed (non-critical):', err)
//     );
//   }, [isBooting]);

//   useEffect(() => {
//     if (Capacitor.isNativePlatform()) return;

//     SplashScreen.hide().catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (Capacitor.isNativePlatform()) return;
//     if (!('serviceWorker' in navigator)) return;

//     navigator.serviceWorker
//       .register('/firebase-messaging-sw.js')
//       .then((reg) => {
//         console.log('Firebase SW registered ✅');
//         const token = storage.get('token');
//         if (token) {
//           initPushNotifications(reg).catch(err =>
//             console.warn('Push re-init failed (non-critical):', err)
//           );
//         }
//       })
//       .catch((err) => console.error('Firebase SW registration failed:', err));
//   }, []);

//   useEffect(() => {
//     if (Capacitor.isNativePlatform()) return;
//     if (!('serviceWorker' in navigator)) return;

//     window.addEventListener('load', () => {
//       navigator.serviceWorker
//         .register('/service-worker.js')
//         .then((reg) => console.log('App SW registered ✅', reg))
//         .catch((err) => console.error('App SW registration failed:', err));
//     });
//   }, []);

//   useEffect(() => {
//     const handleBeforeInstallPrompt = (e) => e.preventDefault();
//     window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
//     return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
//   }, []);

//   useEffect(() => {
//     if (Capacitor.isNativePlatform()) return;

//     const script = document.createElement('script');
//     script.src = 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js';
//     script.async = true;
//     script.onload = () => {
//       const lenis = new window.Lenis({
//         duration: 0.8,
//         easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//         direction: 'vertical',
//         smooth: true,
//       });
//       function raf(time) {
//         lenis.raf(time);
//         requestAnimationFrame(raf);
//       }
//       requestAnimationFrame(raf);
//       window.lenis = lenis;
//     };
//     document.body.appendChild(script);
//     return () => { document.body.removeChild(script); };
//   }, []);

//   useEffect(() => {
//     if (window.lenis) {
//       window.lenis.scrollTo(0, { immediate: true });
//     } else {
//       window.scrollTo(0, 0);
//     }
//   }, []);

//   return (
//     <Router>
//       <ScrollToTop />
//       <NavigationBridge />

//       <Routes>
//         <Route path="/"                         element={<RootEntry storageReady={storageReady} launchChecked={launchChecked} />} />
//         <Route path="/splash"                   element={<PWAFlashcardSplash />} />
//         <Route path="/home"                     element={<HomePage />} />
//         <Route path="/about"                    element={<About />} />
//         <Route path="/program"                  element={<Program />} />
//         <Route path="/contact"                  element={<Contact />} />
//         <Route path="/book"                     element={<BookingPage />} />
//         <Route path="/register"                 element={<Register />} />
//         <Route path="/login"                    element={<Login />} />
//         <Route path="/forgot-password"          element={<ForgotPass />} />
//         <Route path="/dashboard"                element={<Dashboard />} />
//         <Route path="/reset-password-with-link" element={<ResetPassword />} />
//         <Route path="/super-admin-dashboard"    element={<SuperAdminDashboard />} />
//         <Route path="/admin-dashboard"          element={<AdminDashboard />} />
//         <Route path="/privacy-policy"           element={<PrivacyPolicy />} />
//         <Route path="/terms-and-conditions"     element={<TermsAndConditions />} />
//         <Route path="/payment-and-cancellations" element={<PaymentAndCancellations />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React, { useEffect, useState } from 'react';
import HomePage from './component/homePage';
import About from './component/aboutPage';
import Program from './component/program';
import Contact from './component/contact';
import Register from './component/registration';
import Login from './component/login';
import ForgotPass from './component/forgotPassword';
import ResetPassword from './component/resetPassword';
import Dashboard from './component/userComponent/userDashboard';
import SuperAdminDashboard from './component/adminComponent/superAdminDashboard';
import AdminDashboard from './component/adminComponent/Admindashboard';
import PrivacyPolicy from './component/uiComponent/PrivacyPolicy';
import TermsAndConditions from './component/uiComponent/TermsAndConditions';
import PaymentAndCancellations from './component/uiComponent/PaymentAndCancellations';
import PWAFlashcardSplash from './component/userComponent/PWAFlashcardSplash';
import ScrollToTop from './utils/scrollToTop';
import { storage } from './apiServices/userDashboardApiService';
import {
  initPushNotifications,
  checkLaunchNotification,
  setNavigate,
  registerNotificationTapListener,
  initNativePushListeners,
} from './utils/flashcardNotification';
import BookingPage from './component/uiComponent/BookingPage';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Capacitor
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  StatusBar.setBackgroundColor({ color: '#000000' });
  StatusBar.setStyle({ style: Style.Dark });
}

// ─── Global Navigation Bridge ──────────────────────────────────────
function NavigationBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null;
}

// ─── PWA Entry Gate ────────────────────────────────────────────────
function RootEntry({ storageReady, launchChecked }) {
  const navigate = useNavigate();

  const isPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    Capacitor.isNativePlatform();

  useEffect(() => {
    if (!storageReady || !launchChecked) return;

    const isLoggedIn = !!storage.get('token');

    const notificationUrl = storage.get('notification_url');
    if (notificationUrl && isLoggedIn) {
      storage.remove('notification_url');
      console.log('Opened from notification → navigating to:', notificationUrl);
      navigate(notificationUrl, { replace: true });
      return;
    }

    if (isPWA && isLoggedIn) {
      initPushNotifications().catch(err =>
        console.warn('Push init on reopen failed (non-critical):', err)
      );
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  }, [storageReady, launchChecked]);

  return null;
}

function App() {
  const [storageReady, setStorageReady] = useState(
    !Capacitor.isNativePlatform()
  );

  const [launchChecked, setLaunchChecked] = useState(
    !Capacitor.isNativePlatform()
  );

  const isBooting = !storageReady || !launchChecked;

  // ─────────────────────────────────────────────────────────────────
  // ✅ FIX: Single unified boot sequence for native platform.
  //
  // Previous bug: two separate useEffects ran simultaneously —
  // initNativePushListeners() (async, unawaited) raced against
  // storage.syncFromNative(), so the pushNotificationReceived listener
  // was sometimes registered AFTER a foreground notification arrived.
  //
  // Fix: one sequential async boot — listeners registered FIRST,
  // then storage sync, then launch notification check, then splash hide.
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const boot = async () => {
      // 1️⃣ Register tap listener (sync) — must be first
      registerNotificationTapListener();

      // 2️⃣ Register foreground/background push listeners (async) — await it
      //    pushNotificationReceived listener is attached inside here,
      //    so it must complete before anything else runs.
      await initNativePushListeners();

      // 3️⃣ Sync storage from native layer
      await storage.syncFromNative();
      setStorageReady(true);

      // 4️⃣ Check if app was cold-started from a notification tap
      await checkLaunchNotification();
      setLaunchChecked(true);

      // 5️⃣ Hide the splash screen last
      SplashScreen.hide().catch((err) =>
        console.warn('SplashScreen.hide failed (non-critical):', err)
      );
    };

    boot().catch((err) =>
      console.error('App boot sequence failed:', err)
    );
  }, []);

  // ─── Web: hide splash immediately ─────────────────────────────────
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    SplashScreen.hide().catch(() => {});
  }, []);

  // ─── Web: register Firebase SW ────────────────────────────────────
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((reg) => {
        console.log('Firebase SW registered ✅');
        const token = storage.get('token');
        if (token) {
          initPushNotifications(reg).catch(err =>
            console.warn('Push re-init failed (non-critical):', err)
          );
        }
      })
      .catch((err) => console.error('Firebase SW registration failed:', err));
  }, []);

  // ─── Web: register app SW ─────────────────────────────────────────
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => console.log('App SW registered ✅', reg))
        .catch((err) => console.error('App SW registration failed:', err));
    });
  }, []);

  // ─── PWA install prompt suppression ───────────────────────────────
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => e.preventDefault();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // ─── Web: smooth scroll (Lenis) ───────────────────────────────────
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js';
    script.async = true;
    script.onload = () => {
      const lenis = new window.Lenis({
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      window.lenis = lenis;
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <NavigationBridge />

      <Routes>
        <Route path="/"                          element={<RootEntry storageReady={storageReady} launchChecked={launchChecked} />} />
        <Route path="/splash"                    element={<PWAFlashcardSplash />} />
        <Route path="/home"                      element={<HomePage />} />
        <Route path="/about"                     element={<About />} />
        <Route path="/program"                   element={<Program />} />
        <Route path="/contact"                   element={<Contact />} />
        <Route path="/book"                      element={<BookingPage />} />
        <Route path="/register"                  element={<Register />} />
        <Route path="/login"                     element={<Login />} />
        <Route path="/forgot-password"           element={<ForgotPass />} />
        <Route path="/dashboard"                 element={<Dashboard />} />
        <Route path="/reset-password-with-link"  element={<ResetPassword />} />
        <Route path="/super-admin-dashboard"     element={<SuperAdminDashboard />} />
        <Route path="/admin-dashboard"           element={<AdminDashboard />} />
        <Route path="/privacy-policy"            element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions"      element={<TermsAndConditions />} />
        <Route path="/payment-and-cancellations" element={<PaymentAndCancellations />} />
      </Routes>
    </Router>
  );
}

export default App;