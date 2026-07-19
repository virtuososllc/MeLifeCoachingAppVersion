import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import '../../css/consentFormModal.css';

const radioQuestions = [
  {
    key: 'mentalHealthSupport',
    label: 'Are you currently receiving professional support for a mental health condition?',
    note: 'Please note: Coaching is focused on personal growth and transformation and is not a replacement for therapy or medical care.'
  },
  {
    key: 'opennessToIntensity',
    label: 'Real transformation often requires us to step outside our comfort zone and face difficult truths. Are you willing to have an honest and intense conversation if needed?'
  },
  {
    key: 'opennessToClarity',
    label: 'During this session, we will focus on clarity and honesty. Instead of "maybe," "probably," or "I think so," are you willing to communicate openly and give clear answers?'
  },
  {
    key: 'opennessToFeedback',
    label: 'Are you willing to be coached, receive feedback, and stay open to new perspectives and actions?'
  }
];

const initialFormState = {
  fullName: '',
  age: '',
  phone: '',
  mentalHealthSupport: '',
  transformationArea: '',
  opennessToIntensity: '',
  opennessToClarity: '',
  opennessToFeedback: ''
};

// `initialData` (optional): { fullName, phone } — used to prefill the form
// from values already entered on the parent page (e.g. Registration or
// Booking form), so the person doesn't have to retype their name/phone.
const ConsentFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Prefill fullName/phone whenever the modal opens with new initialData.
  // Only fills in fields that are currently empty, so it never overwrites
  // something the person already typed inside the consent form itself.
  useEffect(() => {
    if (!isOpen) return;
    setFormData(prev => ({
      ...prev,
      fullName: prev.fullName || initialData.fullName || '',
      phone: prev.phone || initialData.phone || '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData.fullName, initialData.phone]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    else if (isNaN(formData.age) || Number(formData.age) <= 0) newErrors.age = 'Enter a valid age';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid 10-digit phone number';

    if (!formData.mentalHealthSupport) newErrors.mentalHealthSupport = 'Please select an option';
    if (!formData.transformationArea.trim()) newErrors.transformationArea = 'Please share what you want to transform';
    if (!formData.opennessToIntensity) newErrors.opennessToIntensity = 'Please select an option';
    if (!formData.opennessToClarity) newErrors.opennessToClarity = 'Please select an option';
    if (!formData.opennessToFeedback) newErrors.opennessToFeedback = 'Please select an option';

    // Coaching readiness gate: must be willing to engage honestly
    if (
      formData.opennessToIntensity === 'No' ||
      formData.opennessToClarity === 'No' ||
      formData.opennessToFeedback === 'No'
    ) {
      newErrors.readiness = 'This coaching style requires openness to honest, intense, and clear conversations. Please reconsider before booking, or reach out to discuss your concerns first.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="consent-modal-overlay" onClick={onClose}>
      <div className="consent-modal-content" onClick={e => e.stopPropagation()}>
        <button className="consent-modal-close" onClick={onClose}><X size={20} /></button>

        <div className="consent-modal-header">
          <h2 className="consent-modal-title">Coaching Consent &amp; Readiness Form</h2>
          <p className="consent-modal-sub">
            Before we begin, please answer the following questions honestly.
            This conversation is designed to create clarity, awareness, and meaningful transformation.
          </p>
        </div>

        {errors.readiness && (
          <div className="consent-status-message consent-status-error">
            <AlertCircle size={18} />
            {errors.readiness}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <h3 className="consent-section-title">Personal Details</h3>

          <div className="consent-form-group">
            <label className="consent-form-label">1. Full Name</label>
            <input
              type="text"
              className={`consent-form-input ${errors.fullName ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
            />
            {errors.fullName && <div className="consent-error-text">{errors.fullName}</div>}
          </div>

          <div className="consent-form-row">
            <div className="consent-form-group">
              <label className="consent-form-label">2. Age</label>
              <input
                type="number"
                className={`consent-form-input ${errors.age ? 'error' : ''}`}
                placeholder="Age"
                value={formData.age}
                onChange={e => handleChange('age', e.target.value)}
              />
              {errors.age && <div className="consent-error-text">{errors.age}</div>}
            </div>

            <div className="consent-form-group">
              <label className="consent-form-label">3. Phone Number</label>
              <input
                type="tel"
                className={`consent-form-input ${errors.phone ? 'error' : ''}`}
                placeholder="10-digit phone number"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
              {errors.phone && <div className="consent-error-text">{errors.phone}</div>}
            </div>
          </div>

          <h3 className="consent-section-title">Consent &amp; Declaration</h3>

          {/* Q4 - mental health support */}
          <div className="consent-form-group">
            <label className="consent-form-label">
              4. Are you currently receiving professional support for a mental health condition?
            </label>
            <div className="consent-radio-row">
              {['Yes', 'No'].map(option => (
                <label key={option} className="consent-radio-option">
                  <input
                    type="radio"
                    name="mentalHealthSupport"
                    value={option}
                    checked={formData.mentalHealthSupport === option}
                    onChange={e => handleChange('mentalHealthSupport', e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
            <p className="consent-note">
              Please note: Coaching is focused on personal growth and transformation and is not a replacement for therapy or medical care.
            </p>
            {errors.mentalHealthSupport && <div className="consent-error-text">{errors.mentalHealthSupport}</div>}
          </div>

          {/* Q5 - transformation area */}
          <div className="consent-form-group">
            <label className="consent-form-label">
              5. What is the one area of your life that you want to transform as a result of this conversation?
            </label>
            <textarea
              className={`consent-form-textarea ${errors.transformationArea ? 'error' : ''}`}
              placeholder="Share what you'd like to focus on"
              rows={3}
              value={formData.transformationArea}
              onChange={e => handleChange('transformationArea', e.target.value)}
            />
            {errors.transformationArea && <div className="consent-error-text">{errors.transformationArea}</div>}
          </div>

          {/* Q6, Q7, Q8 - readiness questions */}
          {radioQuestions.slice(1).map((q, idx) => (
            <div className="consent-form-group" key={q.key}>
              <label className="consent-form-label">
                {idx + 6}. {q.label}
              </label>
              <div className="consent-radio-row">
                {['Yes', 'No'].map(option => (
                  <label key={option} className="consent-radio-option">
                    <input
                      type="radio"
                      name={q.key}
                      value={option}
                      checked={formData[q.key] === option}
                      onChange={e => handleChange(q.key, e.target.value)}
                    />
                    {option}
                  </label>
                ))}
              </div>
              {q.note && <p className="consent-note">{q.note}</p>}
              {errors[q.key] && <div className="consent-error-text">{errors[q.key]}</div>}
            </div>
          ))}

          <button type="submit" className="consent-submit-btn">
            Continue to Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsentFormModal;