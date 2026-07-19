import React, { useState } from 'react';
import { ArrowRight, User, Mail, Phone, Lock, Eye, EyeOff, Users, Loader2, Shield, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/registration.css';
import NavBar from './uiComponent/navBar';
import LogoImg from '../assests/Logo.jpg';
import userApiService from '../apiServices/userDashboardApiService';
import ConsentFormModal from './uiComponent/ConsentFormModal';

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRATION FLOW — HOW IT ALL WORKS
// ─────────────────────────────────────────────────────────────────────────────
//
//  STEP 1 — User fills the form (Name, Email, Phone, Password)
//
//  STEP 2 — Email OTP Verification
//    • User clicks "Verify" button next to the email field
//    • Frontend calls POST /api/auth/send-registration-otp  { email }
//    • Backend generates a 6-digit OTP, hashes it, saves it in the Otp
//      collection, then emails the plain code to the user
//    • User types the OTP and clicks "Confirm"
//    • Frontend calls POST /api/auth/verify-registration-otp  { email, otp }
//    • Backend compares the hash, deletes the OTP record, and returns a
//      short-lived verificationToken (JWT, valid 15 min)
//    • We store that token in React state — it proves the email is real
//
//  STEP 2.5 — Consent / Readiness Form (NEW)
//    • User clicks "Join" — instead of going straight to payment, we first
//      show the same Coaching Consent & Readiness form used on the Booking
//      flow (ConsentFormModal)
//    • User must answer honestly; the modal itself blocks submission if
//      they indicate they're not open to intense/clear/feedback-driven
//      conversations
//    • On successful submit, we store the consent answers and proceed to
//      Step 3 (payment), attaching consentForm to both the order-creation
//      and registration payloads for backend record-keeping
//
//  STEP 3 — Create a Razorpay Order on our backend
//    • Frontend calls POST /api/payment/create-order
//      { ...formData, verificationToken, orderType: 'registration', consentForm }
//    • Backend:
//        a) Validates verificationToken (email verified, not expired)
//        b) Validates Name/phone/password via middleware
//        c) Calls razorpay.orders.create({ amount: 3000000, currency: 'INR' })
//           (amount is in paise: ₹30,000 × 100 = 3,000,000 paise)
//        d) Returns { order_id, amount, currency, key_id }
//
//  STEP 4 — Open Razorpay Checkout Popup (SDK, no page redirect)
//    • We load the Razorpay JS SDK dynamically (script tag injected once)
//    • Configure it with the order details from Step 3
//    • rzp.open() shows the popup on top of this page
//    • User completes payment (card / UPI / netbanking / wallet)
//    • Razorpay calls our handler() callback with:
//        razorpay_payment_id  – unique ID for this specific payment
//        razorpay_order_id    – the order we created in Step 3
//        razorpay_signature   – HMAC-SHA256( order_id + "|" + payment_id )
//                               signed with your Razorpay KEY SECRET
//
//  STEP 5 — Backend Registration + Signature Verification
//    • Frontend sends all three Razorpay values + form data + consentForm to
//      POST /api/auth/register
//    • Backend:
//        a) Re-computes HMAC-SHA256 with KEY_SECRET — if it doesn't match
//           the signature, the payment is fake → reject
//        b) Creates User document in MongoDB (hasPaid: true, amountPaid: 3000000)
//        c) Sends invoice PDF + notification email
//        d) Returns { token (JWT 7d), user: { id, name, email, … } }
//    • Frontend stores token in sessionStorage → navigate('/dashboard')
//
// ─────────────────────────────────────────────────────────────────────────────

function Registration() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // All form fields in one object for easy spreading into API calls
  const [formData, setFormData] = useState({
    Name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    password: ''
  });

  // Per-field inline errors — populated from backend validation messages
  const [fieldErrors, setFieldErrors] = useState({});

  // ── OTP / email-verification state ──────────────────────────────────────
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);         // show OTP input row
  const [isVerified, setIsVerified] = useState(false);        // email confirmed ✓
  const [verificationToken, setVerificationToken] = useState(null); // JWT returned by backend

  const [otpLoading, setOtpLoading] = useState(false);       // spinners on OTP buttons
  const [isLoading, setIsLoading]   = useState(false);        // spinner on main submit button
  const [status, setStatus]         = useState(null);          // global banner {type, msg}

  // ── Consent / readiness form state ───────────────────────────────────────
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentData, setConsentData] = useState(null);

  // Quick client-side format check — prevents unnecessary OTP API calls
  const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email);

  // ── Generic change handler ───────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear inline error for this field as user corrects it
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }

    // If user edits the email after it was verified, reset verification
    // so they can't change to a different email and bypass OTP
    if (name === 'email' && isVerified) {
      setIsVerified(false);
      setVerificationToken(null);
      setIsOtpSent(false);
    }
  };

  // ── STEP 2a: Send OTP to the entered email ───────────────────────────────
  const handleSendOtp = async () => {
    if (!formData.email) {
      setFieldErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!isEmailValid) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    setOtpLoading(true);
    setStatus(null);
    try {
      await userApiService.sendVerificationOtp({ email: formData.email });
      setIsOtpSent(true); // reveal the 6-digit input + Confirm button
      setStatus({ type: 'success', msg: 'OTP sent to your email.' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Failed to send OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  // ── STEP 2b: Confirm the OTP the user typed ──────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    try {
      const res = await userApiService.verifyRegistrationOtp({ email: formData.email, otp });
      setVerificationToken(res.verificationToken); // keep this JWT — needed in Step 3
      setIsVerified(true);
      setIsOtpSent(false);  // hide OTP row, green tick appears on email input
      setStatus({ type: 'success', msg: 'Email Verified Successfully!' });
      setFieldErrors(prev => ({ ...prev, email: null }));
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Invalid OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  // ── STEP 2.5: Handle the main form submit — validate, then open consent modal ──
  // This replaces the old flow where the submit button went straight to payment.
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setStatus(null);
    setFieldErrors({});

    // Block progress if email hasn't been OTP-verified
    if (!isVerified || !verificationToken) {
      setStatus({ type: 'error', msg: 'Please verify your email before proceeding.' });
      setFieldErrors(prev => ({ ...prev, email: 'Verification required' }));
      return;
    }

    // Show the Coaching Consent & Readiness form before payment
    setShowConsentModal(true);
  };

  // Called when the consent form is submitted successfully
  const handleConsentSubmit = (data) => {
    setConsentData(data);
    setShowConsentModal(false);
    handlePaymentAndRegister(data);
  };

  // ── STEP 3 helper: inject Razorpay SDK <script> once ────────────────────
  // We load it on-demand instead of in index.html to avoid slowing page load
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; } // already loaded
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ── STEPS 3 + 4: Create order → open Razorpay popup ─────────────────────
  // Runs after the consent form is submitted (see handleConsentSubmit above).
  // Takes the consent form answers so they can be attached to the backend payloads.
  const handlePaymentAndRegister = async (consentFormData) => {
    setIsLoading(true);
    setStatus(null);
    setFieldErrors({});

    // Load Razorpay SDK before we need it
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setStatus({ type: 'error', msg: 'Razorpay SDK failed to load. Check your internet connection.' });
      setIsLoading(false);
      return;
    }

    try {
      const fullPhone = `${formData.countryCode}${formData.phone}`;

      // ── STEP 3: Ask backend to create a Razorpay Order ──────────────────
      // Amount is set SERVER-SIDE (₹30,000 = 3,000,000 paise) so the client
      // can never manipulate the price. Backend also validates the
      // verificationToken to ensure the email was verified.
      const orderData = await userApiService.createPaymentOrder({
        ...formData,
        Name: formData.Name,
        email: formData.email,
        phone: fullPhone,
        verificationToken,
        orderType: 'registration', // backend uses this to set amount = 3000000 paise
        consentForm: consentFormData,
      });

      // ── STEP 4: Configure Razorpay popup ────────────────────────────────
      const options = {
        key:       orderData.key_id,     // RAZORPAY_KEY_ID from backend (public key)
        amount:    orderData.amount,      // 3000000 paise = ₹30,000
        currency:  orderData.currency,   // 'INR'
        name:      "MeLifeCoaching",
        description: "15-Day Transformation Course — ₹30,000",
        image:     LogoImg,
        order_id:  orderData.order_id,   // e.g. "order_XXXXXXXXXXXXXXXX"

        // ── Payment success handler ────────────────────────────────────────
        // Razorpay SDK calls this automatically after a successful payment.
        // 'response' has three fields needed for backend signature verification.
        handler: async function (response) {
          // STEP 5 — send payment proof + form data + consent answers to our register endpoint
          await registerUser({
            ...formData,
            phone: fullPhone,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_signature:  response.razorpay_signature,
            consentForm: consentFormData,
          });
        },
         // Shows under the title in the popup — user sees their own details
          // description: `${formData.Name} · ${formData.email} · ${fullPhone}`,
        // Pre-fill so user doesn't have to retype in the popup
        prefill: {
          name:    formData.Name,
          email:   formData.email,
          contact: fullPhone,
        },

          notes: {
    customer_name:  formData.Name,
    customer_email: formData.email,
    customer_phone: fullPhone,
  },

        theme: { color: "#000000" },

        // Disable EMI payment method — users must pay the full amount upfront
        config: {
          display: {
            blocks: {
              emi: { name: "EMI", instruments: [{ method: "emi" }] }
            },
            hide: [{ method: "emi" }],  // hides EMI from the payment options list
            preferences: { show_default_blocks: true }
          }
        },

        modal: {
          // Fires if user closes the popup without completing payment
          ondismiss: function () {
            setIsLoading(false);
            setStatus({ type: 'error', msg: 'Payment cancelled. You can try again.' });
          }
        }
      };

      // Open the popup — user sees card/UPI/netbanking options on this page
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      // Backend validation errors come back with field-specific messages.
      // Map them to the right input so the user sees an inline tooltip.
      console.error("Payment Init Error:", error);
      const msg = error.message || '';
      const newErrors = {};

      if      (msg.toLowerCase().includes('email'))    newErrors.email    = msg;
      else if (msg.toLowerCase().includes('name'))     newErrors.Name     = msg;
      else if (msg.toLowerCase().includes('phone'))    newErrors.phone    = msg;
      else if (msg.toLowerCase().includes('password')) newErrors.password = msg;
      else setStatus({ type: 'error', msg: msg || 'Payment initialisation failed. Please try again.' });

      if (Object.keys(newErrors).length > 0) setFieldErrors(newErrors);
      setIsLoading(false);
    }
  };

  // ── STEP 5: Register the user after payment is verified ──────────────────
  // POST /api/auth/register
  // Backend re-verifies the Razorpay HMAC signature before creating the user.
  // If the signature doesn't match, registration is rejected (fraud prevention).
  const registerUser = async (payload) => {
    try {
      const data = await userApiService.userRegister(payload);
      setStatus({ type: 'success', msg: 'Payment successful! Account created. Redirecting…' });
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setFormData({ Name: '', email: '', phone: '', countryCode: '+91', password: '' });
      setConsentData(null);
      setTimeout(() => { navigate('/dashboard'); }, 1500);
    } catch (error) {
      console.error('Registration Error:', error);
      setStatus({ type: 'error', msg: `Registration failed: ${error.message}.` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>[styles]</style>
      <NavBar />

      {/* Coaching Consent & Readiness form — shown after clicking Join,
          before the Razorpay order is created */}
      <ConsentFormModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onSubmit={handleConsentSubmit}
        initialData={{ fullName: formData.Name, phone: formData.phone }}
      />

      <div className="register-page">
        <div className="register-container">

          {/* ── Left panel ─────────────────────────────────────────────── */}
          <div className="register-left">
            <div className="register-logo-box">
              <img src={LogoImg} alt="logo" className='logoImg-register' />
            </div>
            <h2 className="reg-headline">Begin Your Journey</h2>
            <p className="reg-sub">
              Transform your life in 15 days. Join thousands who have found clarity, purpose, and inner strength.
            </p>
            <div className="reg-stat">
              <Users size={18} /> 2,500+ Lives transformed
            </div>
          </div>

          {/* ── Right panel (form) ─────────────────────────────────────── */}
          <div className="register-right">
            <div className="reg-form-header">
              <h2 className="reg-form-title">Create Account</h2>
              <p className="reg-form-sub">Start your transformation journey today</p>
            </div>

            {/* Global success / error banner */}
            {status && (
              <div style={{
                padding: '12px', borderRadius: '8px', marginBottom: '20px',
                backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: status.type === 'success' ? '#059669' : '#dc2626',
                fontSize: '0.9rem', textAlign: 'center',
                border: status.type === 'success' ? '1px solid #d1fae5' : '1px solid #fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {status.type === 'error' && <AlertCircle size={16} />}
                {status.msg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} noValidate>

              {/* Full Name */}
              <div className="form-group-register">
                <label className="form-label-register">Full Name</label>
                <div className="input-with-icon-register">
                  <User size={18} className={`input-icon-register ${fieldErrors.Name ? 'error' : ''}`} />
                  <input
                    type="text" name="Name" value={formData.Name} onChange={handleChange}
                    className={`form-input-register form-input-padded-register ${fieldErrors.Name ? 'error' : ''}`}
                    placeholder="Enter your full name" required
                  />
                </div>
                {fieldErrors.Name && <div className="error-tooltip-register">{fieldErrors.Name}</div>}
              </div>

              {/* Email + OTP verification
                  — "Verify" button is disabled until a valid email format is typed
                  — After OTP confirmed: input is locked, green tick appears */}
              <div className="form-group-register">
                <label className="form-label-register">Email Address</label>
                <div className="input-with-icon-register">
                  <Mail size={18} className={`input-icon-register ${fieldErrors.email ? 'error' : ''}`} />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className={`form-input-register form-input-padded-register ${fieldErrors.email ? 'error' : ''}`}
                    placeholder="Enter your email address"
                    required
                    disabled={isVerified}
                    style={isVerified ? { borderColor: '#10b981', paddingRight: '40px' } : { paddingRight: '85px' }}
                  />
                  {isVerified ? (
                    // Green tick — shown once OTP is confirmed
                    <CheckCircle size={18} color="#10b981" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  ) : (
                    // "Verify" button — triggers OTP send (Step 2a)
                    <button
                      type="button"
                      className="otp-action-btn"
                      onClick={handleSendOtp}
                      disabled={otpLoading || !formData.email || !isEmailValid}
                      title={!isEmailValid ? "Enter a valid email first" : "Send OTP"}
                    >
                      {otpLoading ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                    </button>
                  )}
                </div>
                {fieldErrors.email && <div className="error-tooltip-register">{fieldErrors.email}</div>}

                {/* OTP input row — appears after "Verify" clicked, disappears after "Confirm" */}
                {isOtpSent && !isVerified && (
                  <div className="otp-verify-row">
                    <input
                      type="text"
                      className="otp-verify-input"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                    <button type="button" className="otp-confirm-btn" onClick={handleVerifyOtp} disabled={otpLoading}>
                      {otpLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm'}
                    </button>
                  </div>
                )}
              </div>

              {/* Phone + Country Code */}
              <div className="form-group-register">
                <label className="form-label-register">Phone Number</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    name="countryCode" value={formData.countryCode} onChange={handleChange}
                    className="form-select-country"
                    style={{ width: '100px', padding: '0 8px' }}
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (UAE)</option>
                    <option value="+61">+61 (AU)</option>
                  </select>
                  <div className="input-with-icon-register" style={{ flex: 1 }}>
                    <Phone size={18} className={`input-icon-register ${fieldErrors.phone ? 'error' : ''}`} />
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className={`form-input-register form-input-padded-register ${fieldErrors.phone ? 'error' : ''}`}
                      placeholder="Enter phone number" required
                    />
                  </div>
                </div>
                {fieldErrors.phone && <div className="error-tooltip-register">{fieldErrors.phone}</div>}
              </div>

              {/* Password */}
              <div className="form-group-register">
                <label className="form-label-register">Create Password</label>
                <div className="input-with-icon-register">
                  <Lock size={18} className={`input-icon-register ${fieldErrors.password ? 'error' : ''}`} />
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    className={`form-input-register form-input-padded-register ${fieldErrors.password ? 'error' : ''}`}
                    placeholder="Create a strong password" required
                  />
                  <button type="button" className="password-toggle-register" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <div className="error-tooltip-register">{fieldErrors.password}</div>}
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#9ca3af' }}>
                  • 8+ characters • Uppercase • Number
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="checkbox-group-register">
                <input type="checkbox" id="terms" className="checkbox-custom-register" required />
                <label htmlFor="terms" className="checkbox-label-register">
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" className="link-black-register">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="link-black-register">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit button
                  — Disabled until email is OTP-verified (isVerified = true)
                  — Now opens the Consent form first; payment starts only after
                    the consent form is submitted (see handleConsentSubmit)
                  — Shows spinner while Razorpay popup is open / payment processing */}
              <button className="btn-submit-register" disabled={isLoading || !isVerified}>
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing Payment…</>
                ) : (
                  <> Join <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.95rem', color: '#4b5563' }}>
              Already a member? <Link to="/login" className="link-black-register">Login</Link>
            </p>

            <div className="trust-badges-register">
              <div className="trust-item-register"><Shield size={14} color="#6b7280" /> SSL Secured</div>
              <div className="trust-item-register"><Lock size={14} color="#6b7280" /> Privacy Protected</div>
              <div className="trust-item-register"><Clock size={14} color="#6b7280" /> 24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Registration