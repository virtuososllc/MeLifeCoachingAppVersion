import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
} from 'lucide-react';
import '../../css/consentFormModal.css';
import testimonialApiService from '../../apiServices/testimonialApiService';

const initialFormState = {
  name: '',
  role: '',
  quote: '',
  stars: 5,
  avatarUrl: '',
};

const TOAST_DURATION = 4000; // ms — how long the toast stays visible

const TestimonialFormModal = ({ isOpen, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  // ── Toast state ───────────────────────────────────────────────────────────
  // { type: 'success' | 'error', text: string } | null
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const fileInputRef = useRef(null);

  const showToast = (type, text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, text });
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
  };

  // Clean up the toast timer if the component unmounts mid-countdown
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');

        const MAX = 500;

        let { width, height } = img;

        if (width > height) {
          if (width > MAX) {
            height *= MAX / width;
            width = MAX;
          }
        } else {
          if (height > MAX) {
            width *= MAX / height;
            height = MAX;
          }
        }

        canvas.width = width;
        canvas.height = height;

        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.8);

        setPreview(compressed);

        setFormData((prev) => ({
          ...prev,
          avatarUrl: compressed,
        }));
      };

      img.src = ev.target.result;
    };

    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim())
      newErrors.name = 'Name is required';

    if (!formData.role.trim())
      newErrors.role =
        "Tell us how you'd describe yourself (e.g. Member, HR Professional)";

    if (!formData.quote.trim())
      newErrors.quote =
        'Please share a few words about your experience.';
    else if (formData.quote.trim().length < 20)
      newErrors.quote =
        'A few more details would help others relate.';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setPreview('');
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await testimonialApiService.submitTestimonial(formData);

      showToast(
        'success',
        res.message || 'Thank you! Your story will appear once approved.'
      );

      setTimeout(() => {
        handleClose();

        if (onSubmitted) onSubmitted();
      }, 1800);
    } catch (err) {
      showToast('error', err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Toast notification — floats independently of the modal, top-right ── */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: toast.type === 'error' ? '#fef2f2' : '#ecfdf5',
            color: toast.type === 'error' ? '#dc2626' : '#059669',
            border: toast.type === 'error' ? '1px solid #fee2e2' : '1px solid #d1fae5',
            fontSize: '0.9rem',
            maxWidth: 340,
            animation: 'testimonial-toast-in 0.25s ease-out',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span style={{ flex: 1 }}>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              display: 'flex',
              padding: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes testimonial-toast-in {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="consent-modal-overlay"
        onClick={handleClose}
         style={{
      zIndex: 9999,
      overflowY: 'visible',
      padding: '20px',
    }}

      >
        <div
          className="consent-modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '90vh',overflowY: 'scroll',}}
        >
          <button
            className="consent-modal-close"
            onClick={handleClose}
          >
            <X size={20} />
          </button>

          <div className="consent-modal-header">
            <h2 className="consent-modal-title">
              Share Your Story
            </h2>

            <p className="consent-modal-sub">
              Tell others about your experience with
              MeLifeCoaching.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* PHOTO */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 25,
              }}
            >
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px dashed #d4d4d4',
                  position: 'relative',
                  background: '#fafafa',
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#777',
                      gap: 8,
                    }}
                  >
                    <Camera size={28} />
                    <span
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Upload Photo
                    </span>
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,.35)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: 0,
                    transition: '.2s',
                  }}
                  className="photo-overlay"
                >
                  <Camera color="#fff" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            {/* NAME */}

            <div className="consent-form-group">
              <label className="consent-form-label">
                Your Name
              </label>

              <input
                type="text"
                className={`consent-form-input ${
                  errors.name ? 'error' : ''
                }`}
                value={formData.name}
                placeholder="Enter your name"
                onChange={(e) =>
                  handleChange('name', e.target.value)
                }
              />

              {errors.name && (
                <div className="consent-error-text">
                  {errors.name}
                </div>
              )}
            </div>

            {/* ROLE */}

            <div className="consent-form-group">
              <label className="consent-form-label">
                How would you describe yourself?
              </label>

              <input
                type="text"
                className={`consent-form-input ${
                  errors.role ? 'error' : ''
                }`}
                value={formData.role}
                placeholder="Member, Entrepreneur..."
                onChange={(e) =>
                  handleChange('role', e.target.value)
                }
              />

              {errors.role && (
                <div className="consent-error-text">
                  {errors.role}
                </div>
              )}
            </div>

            {/* STORY */}

            <div className="consent-form-group">
              <label className="consent-form-label">
                Your Story
              </label>

              <textarea
                rows={5}
                className={`consent-form-textarea ${
                  errors.quote ? 'error' : ''
                }`}
                value={formData.quote}
                placeholder="Share your experience..."
                onChange={(e) =>
                  handleChange('quote', e.target.value)
                }
              />

              {errors.quote && (
                <div className="consent-error-text">
                  {errors.quote}
                </div>
              )}
            </div>

            {/* RATING */}

            <div className="consent-form-group">
              <label className="consent-form-label">
                Rating
              </label>

              <div className="consent-radio-row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className="consent-radio-option"
                  >
                    <input
                      type="radio"
                      checked={formData.stars === n}
                      onChange={() =>
                        handleChange('stars', n)
                      }
                    />

                    {'★'.repeat(n)}
                  </label>
                ))}
              </div>
            </div>

            <button
              className="consent-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  &nbsp;Submitting...
                </>
              ) : (
                'Submit Story'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default TestimonialFormModal;