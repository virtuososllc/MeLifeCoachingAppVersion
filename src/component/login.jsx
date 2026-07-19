import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoImg from '../assests/Logo.jpg';
import { Infinity, Mail, Lock, EyeOff, Eye, Loader2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import '../css/login.css';
import NavBar from './uiComponent/navBar';
import userApiService, { storage } from '../apiServices/userDashboardApiService';
import { initPushNotifications } from '../utils/flashcardNotification'; // ✅ fixed import

function Login() {
  const navigate = useNavigate();

  const [step, setStep]               = useState('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus]           = useState(null);
  const [errors, setErrors]           = useState({});

  const [formData, setFormData] = useState({ email: '', password: '' });

  const [otp, setOtp]             = useState(new Array(6).fill(''));
  const [tempToken, setTempToken] = useState(null);
  const otpBoxReference           = useRef([]);

  // ── Input handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (status?.type === 'error') setStatus(null);
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newArr = [...otp];
    newArr[index] = value;
    setOtp(newArr);
    if (errors.otp) setErrors(prev => ({ ...prev, otp: null }));
    if (status?.type === 'error') setStatus(null);
    if (value && index < 5) otpBoxReference.current[index + 1]?.focus();
  };

  const handleOtpBackspace = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      otpBoxReference.current[index - 1]?.focus();
    }
  };

 const handleLoginSuccess = async (data) => {  // ✅ add async
  await storage.set('token', data.token);      // ✅ await
  await storage.set('user', JSON.stringify(data.user)); // ✅ await

  const isPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  setStatus({
    type: 'success',
    msg: `Logged in successfully!${isPWA ? " (App mode — you won't need to log in again)" : ''} Redirecting...`,
  });

  initPushNotifications().catch(err =>
    console.warn('Push init failed (non-critical):', err)
  );

  setTimeout(() => {
    const role = data.user?.role;
    if (role === 'superadmin') {
      navigate('/super-admin-dashboard', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, 1000);
};

  // ── Login (step 1) ─────────────────────────────────────────────
  const userLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatus(null);

    const newErrors = {};
    if (!formData.email.trim())    newErrors.email    = 'Please fill out this field.';
    if (!formData.password.trim()) newErrors.password = 'Please fill out this field.';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const response = await userApiService.userlogin({
        email:    formData.email.trim(),
        password: formData.password.trim(),
      });

      if (response.requiresOtp) {
        setTempToken(response.tempToken);
        setStep('otp');
        setStatus({ type: 'success', msg: 'OTP sent to your email.' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        handleLoginSuccess(response);
      }
    } catch (error) {
      console.error('Login Error:', error);
      setStatus({ type: 'error', msg: error.message || 'Credentials are invalid.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP verify (step 2) ────────────────────────────────────────
  const verifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatus(null);

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApiService.verifyOtp({ token: tempToken, otp: otpValue });
      handleLoginSuccess(response);
    } catch (error) {
      console.error('OTP Error:', error);
      setStatus({ type: 'error', msg: error.message || 'Invalid Code' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setIsLoading(true);
    setIsResending(true);
    setStatus(null);
    try {
      const response = await userApiService.userlogin({
        email:    formData.email.trim(),
        password: formData.password.trim(),
      });
      if (response.requiresOtp) {
        setTempToken(response.tempToken);
        setStatus({ type: 'success', msg: 'New OTP has been sent!' });
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      setStatus({ type: 'error', msg: error.message || 'Failed to resend OTP.' });
    } finally {
      setIsLoading(false);
      setIsResending(false);
    }
  };

  return (
    <>
      <NavBar />

      <div className="login-page">
        <div className="login-container">

          {/* Left Side (Black) */}
          <div className="login-left">
            <div className="login-logo-box">
              <img src={LogoImg} alt="Logo" className="logoImg-login" />
            </div>
            <h2 className="login-headline">
              {step === 'otp' ? 'Security Check' : 'Welcome Back'}
            </h2>
            <p className="login-sub">
              {step === 'otp'
                ? 'Protecting your account with Two-Factor Authentication.'
                : 'Pick up right where you left off.'}
            </p>
            <div className="login-stat">
              {step === 'otp' ? <ShieldCheck size={18} /> : <Infinity size={18} />}
              {step === 'otp' ? ' Secure Login' : ' Continue your growth'}
            </div>
          </div>

          {/* Right Side (White Form) */}
          <div className="login-right">

            {step === 'otp' && (
              <button className="btn-text" onClick={() => {
                setStep('credentials');
                setStatus(null);
                setOtp(new Array(6).fill(''));
                setErrors({});
              }}>
                <ArrowLeft size={16} /> Back
              </button>
            )}

            <div className="login-form-header">
              <h2 className="login-form-title">
                {step === 'otp' ? 'Enter OTP' : 'Login'}
              </h2>
              <p className="login-form-sub">
                {step === 'otp'
                  ? `We sent a 6-digit code to ${formData.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`
                  : 'Welcome back! Please enter your details.'}
              </p>
            </div>

            {status && (
              <div style={{
                padding: '12px', borderRadius: '8px', marginBottom: '20px',
                backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color:           status.type === 'success' ? '#059669' : '#dc2626',
                textAlign: 'center', fontSize: '0.9rem',
                border: status.type === 'success' ? '1px solid #d1fae5' : '1px solid #fee2e2',
              }}>
                {status.msg}
              </div>
            )}

            {/* FORM 1 — CREDENTIALS */}
            {step === 'credentials' && (
              <form onSubmit={userLogin} noValidate>
                <div className="formgroup-login">
                  <label className="formlabel-login">Email</label>
                  <div className="inputwithicon-login">
                    <Mail size={18} className={`inputicon-login ${errors.email ? 'error' : ''}`} />
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      className={`forminput-login forminputpadded-login ${errors.email ? 'error' : ''}`}
                      placeholder="Email" required
                    />
                    {errors.email && <div className="error-tooltip-login">{errors.email}</div>}
                  </div>
                </div>

                <div className="formgroup-login">
                  <label className="formlabel-login">Password</label>
                  <div className="inputwithicon-login">
                    <Lock size={18} className={`inputicon-login ${errors.password ? 'error' : ''}`} />
                    <input
                      type={showPassword ? 'text' : 'password'} name="password"
                      value={formData.password} onChange={handleChange}
                      className={`forminput-login forminputpadded-login ${errors.password ? 'error' : ''}`}
                      placeholder="Password" required
                    />
                    <button type="button" className="password-toggle-login" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {errors.password && <div className="error-tooltip-login">{errors.password}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.85rem' }}>
                  <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#1f2937' }}>
                    <input type="checkbox" className="checkboxcustom-login" /> Remember me
                  </label>
                  <Link to="/forgot-password" className="link-black-login">Forgot password?</Link>
                </div>

                <button className="btnsubmit-login" disabled={isLoading}>
                  {isLoading
                    ? <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                    : 'Login'}
                </button>
              </form>
            )}

            {/* FORM 2 — OTP */}
            {step === 'otp' && (
              <form onSubmit={verifyOtp}>
                <div className="otp-input-container" style={{ position: 'relative' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpBackspace(e, index)}
                      ref={(reference) => (otpBoxReference.current[index] = reference)}
                      className={`otp-box ${errors.otp ? 'error' : ''}`}
                      autoFocus={index === 0}
                    />
                  ))}
                  {errors.otp && (
                    <div className="error-tooltip-login" style={{ top: '55px', left: '50%', transform: 'translateX(-50%)' }}>
                      {errors.otp}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px', fontSize: '0.9rem', color: '#6b7280' }}>
                  Didn't receive the code?{' '}
                  <button type="button" className="resend-link" onClick={handleResendOtp} disabled={isLoading}>
                    {isResending ? 'Sending...' : 'Resend'}
                  </button>
                </div>

                <button className="btnsubmit-login" disabled={isLoading}>
                  {isLoading
                    ? <><Loader2 size={18} className="animate-spin" /> {isResending ? 'Sending OTP...' : 'Verifying OTP...'}</>
                    : 'Verify & Login'}
                </button>
              </form>
            )}

            {step === 'credentials' && (
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#374151' }}>
                Don't have an account?{' '}
                <Link to="/register" className="link-black-login" style={{ marginLeft: '4px' }}>Register</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;