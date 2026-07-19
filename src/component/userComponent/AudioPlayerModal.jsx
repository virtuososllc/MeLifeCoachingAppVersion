import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Globe } from 'lucide-react';
import '../../css/dashboard.css';
import CryptoJS from 'crypto-js';

const decryptUrl = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== 'string') return null;
  if (encryptedData.startsWith('http')) return encryptedData;
  try {
    if (!encryptedData.includes(':')) return encryptedData;
    const [ivHex, encryptedHex] = encryptedData.split(':');
    const secret    = import.meta.env.VITE_MEDIA_SECRET_KEY || 'my_super_secure_secret_key_12345';
    const key       = CryptoJS.SHA256(secret);
    const iv        = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted }, key,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8) || encryptedData;
  } catch (e) {
    console.error('Decryption failed:', e);
    return encryptedData;
  }
};

const getVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname.includes('youtu.be'))    return u.pathname.slice(1);
    if (url.includes('/embed/'))            return url.split('/embed/')[1].split('?')[0];
  } catch (err) {
    console.error('Invalid URL:', url, err);
  }
  return null;
};

const LANGUAGES = [
  { code: 'english', native: 'English', sub: 'English' },
  { code: 'hindi',   native: 'हिंदी',  sub: 'Hindi'   },
  { code: 'marathi', native: 'मराठी',  sub: 'Marathi' },
];

let playerMountCounter = 0;
const COUNTDOWN_SECONDS = 10;

const AudioPlayerModal = ({
  isOpen,
  onClose,
  session,
  onComplete,
  preferredLanguage = null,
  onLanguageChange
}) => {
  const [showPicker, setShowPicker]     = useState(true);
  const [selectedLang, setSelectedLang] = useState(null);
  const [activeUrl, setActiveUrl]       = useState(null);
  const [player, setPlayer]             = useState(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isReady, setIsReady]           = useState(false);
  const [countdown, setCountdown]       = useState(null);
  const countdownRef                    = useRef(null);
  const mountIdRef = useRef(`yt-player-${++playerMountCounter}`);

  // FIX: backend now always sends session.mediaUrls.english/hindi/marathi
  // No more fallback chain — clean single source of truth
  const getUrlForLang = (langCode) => {
    if (!langCode || !session) return null;
    const raw = session?.mediaUrls?.[langCode];
    return raw ? decryptUrl(raw) : null;
  };

  // ── Reset when modal opens ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && session) {
      setPlayer(null);
      setIsPlaying(false);
      setIsReady(false);
      setCountdown(null);
      clearInterval(countdownRef.current);

      // If user already has a saved language preference AND that language has
      // a valid URL for this session → skip the picker entirely
      const preferredUrl = preferredLanguage ? getUrlForLang(preferredLanguage) : null;

      if (preferredLanguage && preferredUrl) {
        setSelectedLang(preferredLanguage);
        setShowPicker(false);
        setActiveUrl(preferredUrl);
      } else {
        // No saved preference yet — show picker
        setSelectedLang(null);
        setShowPicker(true);
        setActiveUrl(null);
      }
    }
  }, [isOpen, session, preferredLanguage]);

  useEffect(() => {
    return () => clearInterval(countdownRef.current);
  }, []);

  useEffect(() => {
    if (showPicker && player) {
      try { player.destroy(); } catch (error) { console.warn('Error destroying player:', error); }
      setPlayer(null);
      setIsPlaying(false);
      setIsReady(false);
      setCountdown(null);
      clearInterval(countdownRef.current);
    }
  }, [player, showPicker]);

  const startCountdown = () => {
    setCountdown(COUNTDOWN_SECONDS);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (countdown === 0) { onComplete(session._id); onClose(); }
  }, [countdown]);

  useEffect(() => {
    if (!activeUrl || showPicker) return;
    const videoId = getVideoId(activeUrl);
    if (!videoId) return;
    const mountId = mountIdRef.current;

    const initPlayer = () => {
      const el = document.getElementById(mountId);
      if (!el) return;
      new window.YT.Player(mountId, {
        height: '100%', width: '100%', videoId,
        playerVars: {
          playsinline: 1, controls: 0, disablekb: 1,
          fs: 0, rel: 0, modestbranding: 1,
          iv_load_policy: 3, origin: window.location.origin
        },
        events: {
          onReady: (e) => { setPlayer(e.target); setIsReady(true); },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true); setCountdown(null); clearInterval(countdownRef.current);
            }
            if (e.data === window.YT.PlayerState.PAUSED)  setIsPlaying(false);
            if (e.data === window.YT.PlayerState.ENDED)   { setIsPlaying(false); startCountdown(); }
          }
        }
      });
    };

    if (!window.YT || !window.YT.Player) {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.getElementsByTagName('script')[0].parentNode.insertBefore(
          tag, document.getElementsByTagName('script')[0]
        );
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      setTimeout(initPlayer, 100);
    }
  }, [activeUrl, showPicker]);

  if (!isOpen || !session) return null;

  // Only show languages that have a valid URL for this session
  const availableLangs = LANGUAGES.filter(l => !!getUrlForLang(l.code));

  const handleLanguageSelect = (langCode) => {
    const url = getUrlForLang(langCode);
    if (!url) return;
    setSelectedLang(langCode);
    setActiveUrl(url);
    setShowPicker(false);
    // Save to backend so this picker never shows again
    if (onLanguageChange) onLanguageChange(langCode);
  };

  const togglePlay = () => {
    if (!player || !isReady) return;
    isPlaying ? player.pauseVideo() : player.playVideo();
  };

  const handleCancelCountdown = () => {
    clearInterval(countdownRef.current);
    setCountdown(null);
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  const radius       = 28;
  const circumference = 2 * Math.PI * radius;
  const progress     = countdown !== null ? (countdown / COUNTDOWN_SECONDS) * circumference : 0;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, backdropFilter: 'blur(10px)', padding: '16px'
    }}>
      <div style={{
        background: '#111', width: '100%', maxWidth: '500px',
        borderRadius: '24px', border: '1px solid #333', overflow: 'hidden',
        padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', gap: '0px'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isPlaying ? '#22c55e' : countdown !== null ? '#facc15' : '#666',
              boxShadow: isPlaying ? '0 0 10px #22c55e' : countdown !== null ? '0 0 10px #facc15' : 'none',
              transition: 'all 0.3s'
            }} />
            <h3 style={{
              color: '#fff', fontWeight: 600, fontSize: '0.9rem',
              textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0
            }}>
              {showPicker
                ? 'Select Language'
                : countdown !== null
                  ? 'Session Complete'
                  : isPlaying
                    ? 'Now Playing'
                    : 'Audio Session'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#222', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Picker — only shown once, never again after preference is saved */}
        {showPicker && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Globe size={14} color="#666" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Choose your language &nbsp;•&nbsp; भाषा निवडा &nbsp;•&nbsp; भाषा चुनें
              </span>
            </div>
            <p style={{ color: '#555', fontSize: '0.75rem', margin: '0 0 12px', lineHeight: 1.5 }}>
              ⚠️ This is a one-time choice. All sessions will play in the selected language.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {(availableLangs.length > 0 ? availableLangs : LANGUAGES).map(lang => {
                const isActive = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    style={{
                      flex: 1, padding: '14px 8px', borderRadius: '14px',
                      border: isActive ? '1px solid #fff' : '1px solid #2a2a2a',
                      background: isActive ? '#fff' : '#1a1a1a',
                      color: isActive ? '#000' : '#888',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4, transition: 'all 0.2s',
                      boxShadow: isActive ? '0 4px 16px rgba(255,255,255,0.15)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{lang.native}</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>
                      {lang.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Player — shown after language is selected/saved */}
        {!showPicker && activeUrl && (
          <>
            {/* Language info bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', background: '#0d0d0d', borderRadius: '10px',
              marginBottom: '16px', border: '1px solid #222'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#888' }}>
                <Globe size={12} /> {currentLang?.native}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#444' }}>Language locked</span>
            </div>

            {/* Blurred video */}
            <div
              onClick={countdown !== null ? undefined : togglePlay}
              style={{
                position: 'relative', width: '100%', aspectRatio: '16/9',
                background: '#000', borderRadius: '16px', overflow: 'hidden',
                marginBottom: '24px', border: '1px solid #222',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
                cursor: countdown !== null ? 'default' : 'pointer',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div style={{
                pointerEvents: 'none', width: '100%', height: '100%',
                filter: 'blur(30px) brightness(0.4) grayscale(100%)',
                transform: 'scale(1.3)'
              }}>
                <div id={mountIdRef.current} />
              </div>

              {/* Play/pause overlay */}
              {countdown === null && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10
                }}>
                  <div style={{
                    width: '64px', height: '64px',
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '12px', border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'transform 0.2s',
                    transform: isPlaying ? 'scale(0.95)' : 'scale(1)'
                  }}>
                    {isPlaying
                      ? <Pause size={28} color="white" fill="white" />
                      : <Play  size={28} color="white" fill="white" style={{ marginLeft: '4px' }} />
                    }
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {isReady ? (isPlaying ? 'Tap to Pause' : 'Tap to Play') : 'Loading Audio...'}
                  </span>
                </div>
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 20,
                  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '14px'
                }}>
                  <div style={{ position: 'relative', width: 72, height: 72 }}>
                    <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="36" cy="36" r={radius} fill="none" stroke="#222" strokeWidth="4" />
                      <circle
                        cx="36" cy="36" r={radius}
                        fill="none" stroke="#22c55e" strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <span style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '1.3rem'
                    }}>
                      {countdown}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: '0 0 4px' }}>
                      Session complete! 🎉
                    </p>
                    <p style={{ color: '#666', fontSize: '0.78rem', margin: 0 }}>
                      Marking complete and closing in {countdown}s…
                    </p>
                  </div>
                  <button
                    onClick={handleCancelCountdown}
                    style={{
                      background: 'none', border: '1px solid #333', borderRadius: '99px',
                      color: '#666', fontSize: '0.75rem', padding: '5px 16px', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Session info */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px', lineHeight: 1.3 }}>
                {session.title}
              </h2>
              <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', margin: 0 }}>
                DAY {session.dayNumber} • AUDIO ONLY • {currentLang?.sub?.toUpperCase()}
              </p>
            </div>
          </>
        )}

        {/* Complete button */}
        {!showPicker && (
          <button
            onClick={() => { onComplete(session._id); onClose(); }}
            className="btn1 btnprimary"
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', borderRadius: '12px' }}
          >
            Mark Complete & Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioPlayerModal;