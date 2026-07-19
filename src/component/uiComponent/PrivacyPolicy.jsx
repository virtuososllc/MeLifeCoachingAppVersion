import React, { useState } from 'react';
import { Shield, Eye, Lock, Database, UserCheck, Mail, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavBar from './navBar';
import Footer from './footer';

const sections = [
  {
    id: 'collection',
    icon: <Database size={20} />,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you register for our 15-Day Transformation Program, we collect your full name, email address, phone number, and payment details. This information is necessary to create your account and process your enrollment.'
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you interact with our platform, including pages visited, time spent, and features used. This helps us improve your learning experience.'
      },
      {
        subtitle: 'Device Information',
        text: 'We collect device type, browser type, IP address, and operating system to ensure our platform functions correctly across all devices.'
      }
    ]
  },
  {
    id: 'use',
    icon: <Eye size={20} />,
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'Program Delivery',
        text: 'Your information is primarily used to deliver the 15-Day Transformation Program, including sending daily content, progress updates, and course materials to your registered email.'
      },
      {
        subtitle: 'Communication',
        text: 'We use your contact details to send important program updates, respond to your queries, and provide support. You may opt out of marketing communications at any time.'
      },
      {
        subtitle: 'Improvement & Analytics',
        text: 'Aggregated, anonymised data helps us understand program effectiveness and improve content quality for future participants.'
      }
    ]
  },
  {
    id: 'sharing',
    icon: <UserCheck size={20} />,
    title: 'Information Sharing',
    content: [
      {
        subtitle: 'No Third-Party Selling',
        text: 'We never sell, rent, or trade your personal information to third parties. Your data is yours, and we treat it with complete confidentiality.'
      },
      {
        subtitle: 'Service Providers',
        text: 'We work with trusted service providers (payment processors like Razorpay, email delivery services) who are contractually bound to protect your data and use it only for the services they provide to us.'
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required by law, court order, or governmental authority, or to protect the safety of our users and platform.'
      }
    ]
  },
  {
    id: 'security',
    icon: <Lock size={20} />,
    title: 'Data Security',
    content: [
      {
        subtitle: 'Encryption & Protection',
        text: 'All data transmitted between your browser and our servers is encrypted using industry-standard SSL/TLS protocols. Payment information is processed securely through Razorpay\'s PCI-DSS compliant infrastructure — we never store raw card details.'
      },
      {
        subtitle: 'Access Controls',
        text: 'Access to personal data is restricted to authorised personnel only, on a need-to-know basis. All team members are trained on data protection best practices.'
      }
    ]
  },
  {
    id: 'rights',
    icon: <Shield size={20} />,
    title: 'Your Rights',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You have the right to access the personal information we hold about you and request corrections if any details are inaccurate.'
      },
      {
        subtitle: 'Deletion',
        text: 'You may request deletion of your personal data at any time by contacting us. Note that some information may be retained for legal or legitimate business purposes.'
      },
      {
        subtitle: 'Data Portability',
        text: 'You can request a copy of your personal data in a structured, machine-readable format.'
      }
    ]
  },
  {
    id: 'contact',
    icon: <Mail size={20} />,
    title: 'Contact Us',
    content: [
      {
        subtitle: 'Privacy Queries',
        text: 'For any questions about this Privacy Policy or your personal data, please contact us at contact@melifecoaching.com. We aim to respond to all privacy-related queries within 48 hours.'
      },
      {
        subtitle: 'Updates to This Policy',
        text: 'We may update this Privacy Policy periodically. Significant changes will be communicated via email. Continued use of our platform after changes constitutes acceptance of the updated policy.'
      }
    ]
  }
];

const AccordionItem = ({ section }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      marginBottom: '12px',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
      boxShadow: open ? '0 4px 20px rgba(0,0,0,0.08)' : 'none'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', background: open ? '#000' : '#fff',
          border: 'none', cursor: 'pointer', transition: 'background 0.25s',
          color: open ? '#fff' : '#111'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            width: 38, height: 38, borderRadius: '50%',
            background: open ? 'rgba(255,255,255,0.15)' : '#f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: open ? '#fff' : '#000', flexShrink: 0
          }}>{section.icon}</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'serif', textAlign: 'left' }}>{section.title}</span>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div style={{ padding: '24px', background: '#fafafa', borderTop: '1px solid #e5e7eb' }}>
          {section.content.map((item, i) => (
            <div key={i} style={{ marginBottom: i < section.content.length - 1 ? '20px' : 0 }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: '6px' }}>{item.subtitle}</h4>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7 }}>{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PrivacyPolicy = () => {
  return (
    <>
      <NavBar />
      <div style={{ background: '#fff', minHeight: '100vh', paddingTop: '80px', fontFamily: "'Georgia', serif" }}>

        {/* Hero */}
        <div style={{
          background: '#000', color: '#fff', padding: '80px 24px 60px',
          textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50px', padding: '6px 16px', fontSize: '0.8rem',
              fontFamily: 'sans-serif', fontWeight: 600, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#aaa', marginBottom: '24px'
            }}>
              <Shield size={14} /> Your Privacy Matters
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
              Privacy Policy
            </h1>
            <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 24px', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
              We believe privacy is a right, not a feature. Here's exactly how we handle your data.
            </p>
            <p style={{ color: '#555', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>Last updated: June 2025</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #eee', padding: '28px 24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { label: 'Data Sold', value: 'Never' },
              { label: 'Payment Security', value: 'PCI-DSS' },
              { label: 'Response Time', value: '48 hrs' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#000' }}>{s.value}</div>
                <div style={{ fontFamily: 'sans-serif', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
          <p style={{ fontFamily: 'sans-serif', fontSize: '1.05rem', color: '#64748b', lineHeight: 1.8, marginBottom: '40px', textAlign: 'center' }}>
            MeLifeCoaching ("we", "us", "our") is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights over it.
          </p>

          {sections.map(section => (
            <AccordionItem key={section.id} section={section} />
          ))}

          {/* Footer Note */}
          <div style={{
            marginTop: '48px', padding: '32px', background: '#000', borderRadius: '16px',
            textAlign: 'center', color: '#fff'
          }}>
            <Shield size={32} style={{ margin: '0 auto 16px', display: 'block', color: '#aaa' }} />
            <h3 style={{ fontFamily: 'serif', fontSize: '1.4rem', marginBottom: '10px' }}>We take your privacy seriously</h3>
            <p style={{ fontFamily: 'sans-serif', color: '#888', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Questions? Reach us at <a href="mailto:contact@melifecoaching.com" style={{ color: '#fff', fontWeight: 600 }}>contact@melifecoaching.com</a>
            </p>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#fff', color: '#000', padding: '10px 24px', borderRadius: '8px',
              fontFamily: 'sans-serif', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none'
            }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
