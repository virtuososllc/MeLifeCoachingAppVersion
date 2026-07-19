import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Loader2, PenLine } from 'lucide-react';
import '../../css/stories.css';
import testimonialApiService from '../../apiServices/testimonialApiService';
import TestimonialFormModal from './TestimonialFormModal';

function Stories() {
  const scrollContainerRef = useRef(null);

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const loadTestimonials = () => {
    setLoading(true);
    setError(null);
    testimonialApiService
      .getTestimonials()
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Failed to load testimonials'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = container.firstElementChild?.clientWidth || 300;
      const gap = 32;
      const scrollAmount = cardWidth + gap;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getInitials = (name) => {
    if (!name || name === 'Anonymous') return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <section className="section-stories">
      <div className="section-title-wrapper">
        <p className="section-eyebrow">Testimonials</p>
        <h2 className="section-title">What people are saying</h2>
        <p className="section-subtitle">
          Real stories from people who transformed their lives with MeLifeCoaching.
        </p>

        
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 size={28} className="animate-spin" />
        </div>
      )}

      {!loading && error && (
        <p style={{ textAlign: 'center', color: '#dc2626' }}>
          Couldn't load testimonials right now. Please try again shortly.
        </p>
      )}

      {!loading && !error && testimonials.length === 0 && (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          No testimonials yet — be the first to share your story!
        </p>
      )}

      {!loading && !error && testimonials.length > 0 && (
        <div className="stories-wrapper">
          <button
            className="scroll-btn left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="stories-grid" ref={scrollContainerRef}>
            {testimonials.map((t) => (
              <div className="story-card" key={t._id || t.id}>
                <div className="quote-icon">
                  <Quote size={20} />
                </div>
                <p className="story-quote">{t.quote}</p>
                <div className="story-footer">
                  <div className="stars">{'★'.repeat(t.stars || 5)}</div>
                  <div className="story-header">
                    {t.avatarUrl ? (
                      <div
                        className="story-avatar"
                        style={{
                          backgroundImage: `url(${t.avatarUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ) : (
                      <div className="story-avatar story-avatar--initials">
                        {getInitials(t.name)}
                      </div>
                    )}
                    <div>
                      <div className="story-name">{t.name}</div>
                      <div className="story-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="scroll-btn right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}> 
          <button
          type="button"
          className="scroll-btn"
          style={{
            position: 'relative',
            width: '350px',
            padding: '10px 20px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onClick={() => setShowFormModal(true)}
        >
          <PenLine size={16} /> Share Your Story
        </button>
        </div>
        </div>
      )}

      <TestimonialFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmitted={loadTestimonials}
      />
    </section>
  );
}

export default Stories;