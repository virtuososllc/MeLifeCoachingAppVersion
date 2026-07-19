import React, { useState } from 'react';
import { CreditCard, RefreshCw, HelpCircle, AlertCircle, CheckCircle, Clock, ShieldCheck, XCircle, IndianRupee, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavBar from './navBar';
import Footer from './footer';

const faqs = [
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, RuPay), UPI, net banking, and popular mobile wallets through our Razorpay payment gateway. All transactions are processed in INR.'
  },
  {
    q: 'Is my payment information secure?',
    a: 'Absolutely. Payments are processed through Razorpay\'s PCI-DSS Level 1 compliant infrastructure — the highest level of payment security. We never store your card details on our servers.'
  },
  {
    q: 'Can I get a refund after starting the program?',
    a: 'Yes, within the 3-day refund window (72 hours of purchase), regardless of how much content you have accessed. After this window, we are unable to process refunds as digital content access cannot be reversed.'
  },
  {
    q: 'How long does a refund take?',
    a: 'Once approved, refunds are processed within 5–7 business days. The time for the amount to reflect in your account depends on your bank or payment provider.'
  },
  {
    q: 'What if there was a payment failure but money was deducted?',
    a: 'If your payment failed but an amount was debited, it is typically a temporary hold that reverses automatically within 3–5 business days. If it doesn\'t, please contact us with your transaction ID and we will resolve it immediately.'
  },
  {
    q: 'Do you offer EMI or instalment options?',
    a: 'For the 15-Day Transformation Program, we currently do not offer EMI or instalment plans.'
  }
];

const FaqItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: '10px', marginBottom: '10px',
      overflow: 'hidden', transition: 'box-shadow 0.2s',
      boxShadow: open ? '0 4px 16px rgba(0,0,0,0.06)' : 'none'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', background: open ? '#000' : '#fff',
          border: 'none', cursor: 'pointer', color: open ? '#fff' : '#111',
          transition: 'all 0.25s', gap: '12px'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.95rem', textAlign: 'left', lineHeight: 1.4 }}>{item.q}</span>
        {open ? <ChevronUp size={17} style={{ flexShrink: 0 }} /> : <ChevronDown size={17} style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ padding: '18px 20px', background: '#fafafa', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>{item.a}</p>
        </div>
      )}
    </div>
  );
};

const Badge = ({ icon, label, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f8fafc', border: '1px solid #e5e7eb',
    borderRadius: '50px', padding: '8px 16px',
    fontSize: '0.8rem', fontWeight: 600, color: '#444'
  }}>
    <span style={{ color }}>{icon}</span> {label}
  </div>
);

const PaymentAndCancellations = () => {
  return (
    <>
      <NavBar />
      <div style={{ background: '#fff', minHeight: '100vh', paddingTop: '80px', fontFamily: 'sans-serif' }}>

        {/* Hero */}
        <div style={{
          background: '#000', color: '#fff', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.4,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px)'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50px', padding: '6px 16px', fontSize: '0.75rem',
              fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#aaa', marginBottom: '24px'
            }}>
              <CreditCard size={13} /> Payments & Refunds
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px' }}>
              Payment & Cancellation Policy
            </h1>
            <p style={{ color: '#888', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.7 }}>
              Transparent pricing, secure checkout, and a fair cancellation policy — because trust is the foundation of your journey.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Badge icon={<ShieldCheck size={14} />} label="Razorpay Secured" color="#10b981" />
              <Badge icon={<RefreshCw size={14} />} label="3-Day Refund Window" color="#3b82f6" />
              <Badge icon={<IndianRupee size={14} />} label="INR Pricing" color="#f59e0b" />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>

          {/* Pricing Card */}
          <div style={{
            border: '2px solid #000', borderRadius: '20px', overflow: 'hidden', marginBottom: '48px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          }}>
            <div style={{ background: '#000', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ color: '#888', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Program Enrollment</p>
                <h2 style={{ fontFamily: 'Georgia, serif', color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>15-Day Transformation Program</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>₹499</div>
                <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px' }}>One-time payment for first Demo Session.</div>
              </div>
            </div>
            <div style={{ padding: '28px 32px', background: '#fafafa' }}>
              <p style={{ color: '#444', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>What's included</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {[
                  '15 days of structured content',
                  'Daily guided exercises',
                  'Audio sessions',
                  'Lifetime program access',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', color: '#333' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <section style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <CreditCard size={20} />
              </div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: '#111' }}>Payment Information</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {[
                {
                  icon: <ShieldCheck size={20} color="#10b981" />,
                  title: 'Secure Payments',
                  desc: 'All payments are processed via Razorpay — PCI-DSS Level 1 certified. Your card data is never stored on our servers.'
                },
                {
                  icon: <CreditCard size={20} color="#3b82f6" />,
                  title: 'Accepted Methods',
                  desc: 'Credit/debit cards (Visa, Mastercard, RuPay), UPI (GPay, PhonePe, Paytm), net banking, and mobile wallets.'
                },
                {
                  icon: <IndianRupee size={20} color="#f59e0b" />,
                  title: 'Currency & Tax',
                  desc: 'All prices are in Indian Rupees (INR) and are inclusive of applicable GST. No hidden charges.'
                },
                {
                  icon: <Clock size={20} color="#8b5cf6" />,
                  title: 'Instant Access',
                  desc: 'Your account is activated immediately upon successful payment confirmation. You\'ll receive a confirmation email within minutes.'
                },
              ].map((card, i) => (
                <div key={i} style={{
                  background: '#f8fafc', borderRadius: '12px', padding: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '10px' }}>{card.icon}</div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: '6px' }}>{card.title}</h4>
                  <p style={{ fontSize: '0.87rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cancellation & Refund */}
          <section style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <RefreshCw size={20} />
              </div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: '#111' }}>Cancellation & Refund Policy</h2>
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: '32px', marginBottom: '32px' }}>
              <div style={{
                position: 'absolute', left: '10px', top: '8px', bottom: '8px',
                width: '2px', background: 'linear-gradient(to bottom, #10b981, #ef4444)'
              }} />

              {[
                {
                  time: 'Within 72 hours of purchase',
                  status: 'eligible',
                  icon: <CheckCircle size={18} color="#10b981" />,
                  title: 'Full Refund Eligible',
                  desc: 'If you\'re not satisfied for any reason within 3 days of your purchase, contact us at contact@melifecoaching.com. We\'ll process a full refund with no questions asked.',
                  bg: '#ecfdf5', border: '#d1fae5'
                },
                {
                  time: 'After 72 hours',
                  status: 'ineligible',
                  icon: <XCircle size={18} color="#ef4444" />,
                  title: 'No Refund Available',
                  desc: 'After the 72-hour window, we are unable to process refunds. As this is a digital product with immediate access, we cannot recover the content once accessed.',
                  bg: '#fef2f2', border: '#fee2e2'
                },
                {
                  time: 'Exceptional circumstances',
                  status: 'review',
                  icon: <AlertCircle size={18} color="#f59e0b" />,
                  title: 'Case-by-Case Review',
                  desc: 'In cases of technical failure preventing access, or duplicate charges, please contact us. Each situation will be reviewed on its merits with a commitment to fairness.',
                  bg: '#fffbeb', border: '#fef3c7'
                },
              ].map((item, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: '20px', paddingLeft: '24px' }}>
                  <div style={{
                    position: 'absolute', left: '-32px', top: '16px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: '#fff', border: '2px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{item.icon}</div>
                  <div style={{
                    background: item.bg, border: `1px solid ${item.border}`,
                    borderRadius: '12px', padding: '20px'
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '6px' }}>
                      {item.time}
                    </p>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#111', marginBottom: '8px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How to Request */}
            <div style={{
              background: '#f8fafc', borderRadius: '14px', padding: '28px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '16px' }}>
                How to Request a Refund
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { step: '01', text: 'Email contact@melifecoaching.com with subject line "Refund Request"' },
                  { step: '02', text: 'Include your registered email address and Razorpay payment ID' },
                  { step: '03', text: 'We will confirm receipt within 24 hours and process within 5–7 business days' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <span style={{
                      fontWeight: 800, fontSize: '1.1rem', color: '#000',
                      background: '#fff', border: '2px solid #000',
                      borderRadius: '8px', width: '40px', height: '40px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontFamily: 'Georgia, serif'
                    }}>{s.step}</span>
                    <p style={{ fontSize: '0.92rem', color: '#444', lineHeight: 1.6, marginTop: '8px' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <HelpCircle size={20} />
              </div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: '#111' }}>Frequently Asked Questions</h2>
            </div>
            {faqs.map((item, i) => (
              <FaqItem key={i} item={item} index={i} />
            ))}
          </section>

          {/* Footer CTA */}
          <div style={{
            background: '#000', borderRadius: '20px', padding: '48px 40px',
            textAlign: 'center', color: '#fff',
            backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.04) 0%, transparent 60%)'
          }}>
            <CreditCard size={36} style={{ margin: '0 auto 16px', display: 'block', color: '#555' }} />
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>
              Ready to begin?
            </h3>
            <p style={{ color: '#888', maxWidth: '420px', margin: '0 auto 28px', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Secure payment. Instant access. 3-day money-back guarantee. Start your transformation today.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                background: '#fff', color: '#000', padding: '13px 32px',
                borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '8px'
              }}>
                Enroll Now
              </Link>
              <Link to="/contact" style={{
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '13px 28px',
                borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none'
              }}>
                Have Questions?
              </Link>
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </>
  );
};

export default PaymentAndCancellations;
