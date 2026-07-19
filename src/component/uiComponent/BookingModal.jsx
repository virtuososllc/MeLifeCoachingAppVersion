import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X,Mail, Phone, User, Loader2, AlertCircle, CheckCircle} from 'lucide-react';
import '../../css/bookingModal.css';
import userApiService from './../../apiServices/userDashboardApiService';
import ConsentFormModal from './ConsentFormModal';

const BookingModal =({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // --- OTP STATE ---
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // --- CONSENT FORM STATE ---
  // 'consent' -> showing the readiness/consent form first
  // 'booking' -> consent completed, showing the booking form
  const [step, setStep] = useState('consent');
  const [consentData, setConsentData] = useState(null);

  if (!isOpen) return null;

  // Reset everything when the whole modal is closed
  const handleClose = () => {
    setStep('consent');
    setConsentData(null);
    setFormData({ name: '', email: '', phone: '' });
    setErrors({});
    setStatus(null);
    setOtp('');
    setIsOtpSent(false);
    setIsVerified(false);
    setVerificationToken(null);
    onClose();
  };

  // Called when consent form is submitted successfully
  const handleConsentSubmit = (data) => {
    setConsentData(data);
    // Prefill booking form with name & phone from consent form
    setFormData(prev => ({
      ...prev,
      name: data.fullName,
      phone: data.phone
    }));
    setStep('booking');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    
    // Reset verification if email changes
    if (field === 'email' && isVerified) {
      setIsVerified(false);
      setVerificationToken(null);
      setIsOtpSent(false);
      setOtp('');
    }
  };

  // --- OTP LOGIC ---
  const handleSendOtp = async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      return;
    }
    setOtpLoading(true);
    setStatus(null);
    setErrors({});
    
    try {
      await userApiService.sendVerificationOtp({ email: formData.email });
      setIsOtpSent(true);
      setStatus({ type: 'success', text: 'OTP sent to your email.' });
    } catch (err) {
      if (err.message.toLowerCase().includes('email')) {
         setErrors(prev => ({ ...prev, email: err.message }));
      } else {
         setStatus({ type: 'error', text: err.message || 'Failed to send OTP.' });
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    setStatus(null);
    try {
      const res = await userApiService.verifyRegistrationOtp({ email: formData.email, otp });
      setVerificationToken(res.verificationToken);
      setIsVerified(true);
      setIsOtpSent(false);
      setStatus({ type: 'success', text: 'Email Verified Successfully!' });
      setErrors(prev => ({ ...prev, email: null }));
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Invalid OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setStatus(null);
    setErrors({});

    // 1. Verify Email Check
    if (!isVerified || !verificationToken) {
        setErrors(prev => ({ ...prev, email: "Please verify email first" }));
        setStatus({ type: 'error', text: 'Email verification is required.' });
        return;
    }

    setLoading(true);

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      setStatus({ type: 'error', text: 'Failed to load payment gateway.' });
      setLoading(false);
      return;
    }

    try {
      // Step A: Get Order ID from Backend (With verification token)
      const orderData = await userApiService.createSessionOrder({ 
          ...formData, 
          verificationToken,
          consentForm: consentData
      });

      // Step B: Configure Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MeLifeCoaching",

        // Shows name · email · phone under the title in the Razorpay popup
        description: `${formData.name} · ${formData.email} · ${formData.phone}`,

        order_id: orderData.order_id,
        handler: async function (response) {
          await confirmBooking({
            ...formData,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            amount: 499,
            consentForm: consentData
          });
        },
        prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
        },
        notes: {
          customer_name:  formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => { setLoading(false); setStatus({ type: 'error', text: 'Payment cancelled.' }); }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      
      const msg = err.message || '';
      const newErrors = {};

      if (msg.toLowerCase().includes('name')) newErrors.name = msg;
      else if (msg.toLowerCase().includes('email')) newErrors.email = msg;
      else if (msg.toLowerCase().includes('phone')) newErrors.phone = msg;
      else setStatus({ type: 'error', text: msg || 'Booking failed.' });

      if (Object.keys(newErrors).length > 0) setErrors(newErrors);
      
      setLoading(false);
      setFormData({ name: '', email: '', phone: '' });
    }
  };

  const confirmBooking = async (details) => {
    try {
      await userApiService.notifyAdminBooking({ ...details, sendInvoice: true });
      setStatus({ type: 'success', text: 'Booking Confirmed! Invoice sent to email.' });
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch  {
      setStatus({ type: 'success', text: 'Payment successful! (Email pending)' });
      setTimeout(handleClose, 2000);
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1: Show Consent / Readiness Form first ---
  if (step === 'consent') {
    return (
      <ConsentFormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleConsentSubmit}
      />
    );
  }

  // --- STEP 2: Show Booking Form ---
  return (
    <>
      <style>[styles]</style>
      <div className="booking-modal-overlay" onClick={handleClose}>
        <div className="booking-modal-content" onClick={e => e.stopPropagation()}>
          <button className="booking-modal-close" onClick={handleClose}><X size={20} /></button>
          
          <div className="booking-modal-header">
            <h2 className="booking-modal-title">Book First Session</h2>
            <p className="booking-modal-sub">Start your journey from Chaos to Clarity.</p>
          </div>

          <div className="booking-summary">
            <div className="booking-summary-row">
              <span className="booking-summary-label">Session Type</span>
              <span className="booking-summary-value">Demo / Intro Call</span>
            </div>
            <div className="booking-summary-row booking-summary-total">
              <span className="booking-summary-label">Total to Pay</span>
              <span className="booking-summary-value">₹499.00</span>
            </div>
          </div>

          {status && (
            <div className={`status-message ${status.type === 'error' ? 'status-error' : 'status-success'}`}>
              {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              {status.text}
            </div>
          )}

          <form onSubmit={handleBooking} noValidate>
            
            {/* NAME */}
            <div className="booking-form-group">
              <label className="booking-form-label">Full Name</label>
              <div className="booking-input-wrapper">
                <User size={18} className={`booking-input-icon ${errors.name ? 'error' : ''}`} />
                <input 
                  type="text" 
                  className={`booking-form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </div>
              {errors.name && <div className="error-tooltip">{errors.name}</div>}
            </div>

            {/* EMAIL (With OTP) */}
            <div className="booking-form-group">
              <label className="booking-form-label">Email Address</label>
              <div className="booking-input-wrapper">
                <Mail size={18} className={`booking-input-icon ${errors.email ? 'error' : ''}`} />
                <input 
                  type="email" 
                  className={`booking-form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  disabled={isVerified}
                  style={isVerified ? { borderColor: '#10b981', paddingRight: '40px', backgroundColor:'#f0fdf4' } : { paddingRight: '85px' }}
                />
                
                {isVerified ? (
                    <CheckCircle size={18} color="#10b981" style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)'}}/>
                ) : (
                    <button 
                        type="button" 
                        className="otp-action-btn"
                        onClick={handleSendOtp}
                        disabled={otpLoading || !formData.email}
                        title="Verify Email"
                    >
                        {otpLoading ? <Loader2 size={14} className="animate-spin"/> : 'Verify'}
                    </button>
                )}
              </div>
              {errors.email && <div className="error-tooltip">{errors.email}</div>}

              {/* OTP Input */}
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
                          {otpLoading ? <Loader2 size={16} className="animate-spin"/> : 'Confirm'}
                      </button>
                  </div>
              )}
            </div>

            {/* PHONE */}
            <div className="booking-form-group">
              <label className="booking-form-label">Phone Number</label>
              <div className="booking-input-wrapper">
                <Phone size={18} className={`booking-input-icon ${errors.phone ? 'error' : ''}`} />
                <input 
                  type="tel" 
                  className={`booking-form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Enter your phone" 
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>
              {errors.phone && <div className="error-tooltip">{errors.phone}</div>}
            </div>

            <button type="submit" className="booking-submit-btn" disabled={loading || !isVerified}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Processing...</> : 'Book'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default BookingModal;