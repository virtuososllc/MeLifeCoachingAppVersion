// import React, { useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Zap, ArrowRight, Home, LayoutDashboard, X, Loader2, Lightbulb } from 'lucide-react';
// import { storage } from '../../apiServices/userDashboardApiService';
// import userApiService from '../../apiServices/userDashboardApiService';
// import { initPushNotifications } from '../../utils/flashcardNotification';
// import LogoImg from '../../assests/Logo.jpg';
// import '../../css/PWAFlashcardSplash.css';

// const FALLBACK_CARDS = [
//   { title: 'Daily Insight', tagline: 'Sharpen your mind', content: "Your mind is the most powerful tool you own. Sharpen it daily." },
//   { title: 'Daily Insight', tagline: 'Think differently', content: "Clarity comes not from thinking more, but from thinking differently." },
//   { title: 'Daily Insight', tagline: 'Keep growing', content: "Growth is not a destination. It is a direction." },
//   { title: 'Daily Insight', tagline: 'Listen to fear', content: "Fear is not a stop sign. It is a signal that something matters." },
//   { title: 'Daily Insight', tagline: 'Choose discipline', content: "Discipline is choosing long-term growth over short-term comfort." },
// ];

// function PWAFlashcardSplash() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [visible, setVisible] = useState(false);
//   const [countdown, setCountdown] = useState(20);
//   const [card, setCard] = useState(null);
//   const [loadingCard, setLoadingCard] = useState(true);
//   const [isFlipped, setIsFlipped] = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       initPushNotifications(); // fire and forget — don't await

//       try {
//         const token = storage.get('token');
//         const cardId = searchParams.get('cardId');

//         let res;
//         if (cardId && userApiService.fetchFlashcardById) {
//           try {
//             res = await userApiService.fetchFlashcardById(cardId, token);
//           } catch {
//             // fall back to daily endpoint if fetch-by-id fails
//             res = await userApiService.fetchDailyFlashcard(token);
//           }
//         } else {
//           res = await userApiService.fetchDailyFlashcard(token);
//         }

//         if (res?.card) {
//           setCard(res.card);
//         } else {
//           setCard(FALLBACK_CARDS[Math.floor(Math.random() * FALLBACK_CARDS.length)]);
//         }
//       } catch {
//         setCard(FALLBACK_CARDS[Math.floor(Math.random() * FALLBACK_CARDS.length)]);
//       } finally {
//         setLoadingCard(false);
//       }
//     };

//     load();
//     const t = setTimeout(() => setVisible(true), 100);
//     return () => clearTimeout(t);
//   }, []);

//   useEffect(() => {
//     if (countdown === 0) { navigate('/home', { replace: true }); return; }
//     const t = setInterval(() => setCountdown(prev => prev - 1), 1000);
//     return () => clearInterval(t);
//   }, [countdown]);

//   const handleDashboard = () => navigate('/home', { replace: true });
//   const handleHome = () => navigate('/home', { replace: true });

//   return (
//     <div className={`pwa-splash ${visible ? 'pwa-splash--visible' : ''}`}>

//       <button className="pwa-skip-btn" onClick={handleHome}>
//         Skip <X size={13} />
//       </button>

//       <div className="pwa-logo">
//         <img src={LogoImg} alt="logo" className="pwa-logo-img" />
//         <p className="pwa-logo-text">MeLifeCoaching</p>
//       </div>

//       <div className="pwa-day-badge">
//         <Zap size={11} /> Daily Insight
//       </div>

//       {loadingCard ? (
//         <div className="pwa-card">
//           <Loader2 size={20} className="animate-spin" style={{ margin: 'auto', display: 'block' }} />
//         </div>
//       ) : (
//         <div className="pwa-card-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
//           <div className={`pwa-card-inner ${isFlipped ? 'pwa-flipped' : ''}`}>

//             <div className="pwa-card pwa-front">
//               <div className="pwa-card-badge">
//                 <Lightbulb size={11} /> {card?.title || 'Daily Insight'}
//               </div>
//               <p className="pwa-front-text">{card?.tagline}</p>
//               <div className="pwa-divider" />
//               <p className="pwa-hint">Tap to flip</p>
//             </div>

//             <div className="pwa-card pwa-back">
//               <div className="pwa-card-badge pwa-card-badge--light">
//                 <Zap size={11} /> Key Learning
//               </div>
//               <p className="pwa-back-text">"{card?.content}"</p>
//             </div>

//           </div>
//         </div>
//       )}

//       <div className="pwa-countdown">
//         <svg width="44" height="44" className="pwa-countdown-svg">
//           <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
//           <circle
//             cx="22" cy="22" r="18" fill="none"
//             stroke="#fff" strokeWidth="3"
//             strokeDasharray={`${2 * Math.PI * 18}`}
//             strokeDashoffset={`${2 * Math.PI * 18 * (countdown / 20)}`}
//             strokeLinecap="round"
//             className="pwa-countdown-ring"
//           />
//         </svg>
//         <span className="pwa-countdown-number">{countdown}</span>
//       </div>

//       <div className="pwa-actions">
//         <button className="pwa-btn pwa-btn--outline" onClick={handleHome}>
//           <Home size={16} /> Home
//         </button>
//         <button className="pwa-btn pwa-btn--solid" onClick={handleDashboard}>
//           <LayoutDashboard size={16} /> Dashboard <ArrowRight size={14} />
//         </button>
//       </div>

//     </div>
//   );
// }

// export default PWAFlashcardSplash;


// new 

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, ArrowRight, Home, LogOut, Loader2, Lightbulb } from 'lucide-react';
import { storage } from '../../apiServices/userDashboardApiService';
import userApiService from '../../apiServices/userDashboardApiService';
import { initPushNotifications } from '../../utils/flashcardNotification';
import LogoImg from '../../assests/Logo.jpg';
import '../../css/PWAFlashcardSplash.css';
import { App } from '@capacitor/app';

const FALLBACK_CARDS = [
  { title: 'Daily Insight', tagline: 'Sharpen your mind', content: "Your mind is the most powerful tool you own. Sharpen it daily." },
  { title: 'Daily Insight', tagline: 'Think differently', content: "Clarity comes not from thinking more, but from thinking differently." },
  { title: 'Daily Insight', tagline: 'Keep growing', content: "Growth is not a destination. It is a direction." },
  { title: 'Daily Insight', tagline: 'Listen to fear', content: "Fear is not a stop sign. It is a signal that something matters." },
  { title: 'Daily Insight', tagline: 'Choose discipline', content: "Discipline is choosing long-term growth over short-term comfort." },
];

// Website homepage URL (used for the "Home" action redirect)
const WEBSITE_HOME_URL = 'https://www.melifecoaching.com';

function PWAFlashcardSplash() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [card, setCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const load = async () => {
      initPushNotifications(); // fire and forget — don't await

      try {
        const token = storage.get('token');
        const cardId = searchParams.get('cardId');

        let res;
        if (cardId && userApiService.fetchFlashcardById) {
          try {
            res = await userApiService.fetchFlashcardById(cardId, token);
          } catch {
            // fall back to daily endpoint if fetch-by-id fails
            res = await userApiService.fetchDailyFlashcard(token);
          }
        } else {
          res = await userApiService.fetchDailyFlashcard(token);
        }

        if (res?.card) {
          setCard(res.card);
        } else {
          setCard(FALLBACK_CARDS[Math.floor(Math.random() * FALLBACK_CARDS.length)]);
        }
      } catch {
        setCard(FALLBACK_CARDS[Math.floor(Math.random() * FALLBACK_CARDS.length)]);
      } finally {
        setLoadingCard(false);
      }
    };

    load();
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);
  
  const handleExit = () => {
  App.exitApp();
};
  useEffect(() => {
    if (countdown === 0) { handleExit(); return; }
    const t = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // const handleExit = () => navigate('/home', { replace: true });
  const handleHome = () => navigate('/home', { replace: true });

  // Exit the PWA only — never navigate, redirect, or log the user out.
  // window.close() only works if the window was opened via script (rare for
  // installed PWAs), but it's the only safe, non-destructive option available
  // from the web. If it doesn't close, nothing else happens (no redirect,
  // no history navigation, no auth/session changes).


  // // Redirect to the public website homepage (not the in-app dashboard)
  // const handleHome = () => {
  //   window.location.href = WEBSITE_HOME_URL;
  // };

  return (
    <div className={`pwa-splash ${visible ? 'pwa-splash--visible' : ''}`}>

      <div className="pwa-logo">
        <img src={LogoImg} alt="logo" className="pwa-logo-img" />
        <p className="pwa-logo-text">MeLifeCoaching</p>
      </div>

      <div className="pwa-day-badge">
        <Zap size={11} /> Daily Insight
      </div>

      {loadingCard ? (
        <div className="pwa-card">
          <Loader2 size={20} className="animate-spin" style={{ margin: 'auto', display: 'block' }} />
        </div>
      ) : (
        <div className="pwa-card-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`pwa-card-inner ${isFlipped ? 'pwa-flipped' : ''}`}>

            <div className="pwa-card pwa-front">
              <div className="pwa-card-badge">
                <Lightbulb size={11} /> {card?.title || 'Daily Insight'}
              </div>
              <p className="pwa-front-text">{card?.tagline}</p>
              <div className="pwa-divider" />
              <p className="pwa-hint">Tap to flip</p>
            </div>

            <div className="pwa-card pwa-back">
              <div className="pwa-card-badge pwa-card-badge--light">
                <Zap size={11} /> Key Learning
              </div>
              <p className="pwa-back-text">"{card?.content}"</p>
            </div>

          </div>
        </div>
      )}

      <div className="pwa-countdown">
        <svg width="44" height="44" className="pwa-countdown-svg">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="22" cy="22" r="18" fill="none"
            stroke="#fff" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * (countdown / 20)}`}
            strokeLinecap="round"
            className="pwa-countdown-ring"
          />
        </svg>
        <span className="pwa-countdown-number">{countdown}</span>
      </div>

      <div className="pwa-actions">
        {/* <button className="pwa-btn pwa-btn--outline" onClick={handleExit}>
          <LogOut size={16} /> Exit
        </button> */}
        <button className="pwa-btn pwa-btn--solid" onClick={handleHome}>
          <Home size={16} /> Home Page <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}

export default PWAFlashcardSplash;
