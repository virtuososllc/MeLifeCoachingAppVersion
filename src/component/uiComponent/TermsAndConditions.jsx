import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight, CheckCircle, AlertTriangle, Scale, Users, BookOpen, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavBar from './navBar';
import Footer from './footer';

const tocItems = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'program', label: 'Program Description' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'account', label: 'Account & Access' },
  { id: 'conduct', label: 'User Conduct' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'disclaimer', label: 'Disclaimers' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'termination', label: 'Termination' },
  { id: 'governing', label: 'Governing Law' },
];

const sections = [
  {
    id: 'acceptance',
    icon: <CheckCircle size={22} />,
    title: 'Acceptance of Terms',
    content: `By accessing or using MeLifeCoaching's 15-Day Transformation Program ("Program"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not access or use the Program.

These Terms constitute a legally binding agreement between you and MeLifeCoaching. We reserve the right to update these Terms at any time. Continued use of the Program following any changes constitutes your acceptance of the revised Terms.`
  },
  {
    id: 'program',
    icon: <BookOpen size={22} />,
    title: 'Program Description',
    content: `The 15-Day Transformation Program is a structured personal development course delivered digitally. The Program includes daily exercises, audio/video content, guided reflections, and community support delivered over a 15-day period following successful enrollment and payment.

Access to Program materials begins upon successful payment verification. Content is made available in a structured, day-by-day format and is intended for personal, non-commercial use only. Program materials may be updated, improved, or modified at our discretion without prior notice.`
  },
  {
    id: 'eligibility',
    icon: <Users size={22} />,
    title: 'Eligibility',
    content: `The Program is open to individuals who are 18 years of age or older. By enrolling, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into this agreement.

The Program is not a substitute for professional medical, psychological, or therapeutic care. If you have a diagnosed mental health condition or are under medical supervision, please consult your healthcare provider before enrolling.`
  },
  {
    id: 'account',
    icon: <FileText size={22} />,
    title: 'Account & Access',
    content: `You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your login details with any other person. Each enrollment is for a single user only.

We reserve the right to suspend or terminate accounts found to be shared, transferred, or used in violation of these Terms. Upon termination, access to Program materials will be revoked without refund, subject to our Cancellation Policy.

You are responsible for ensuring you have the necessary internet connection and compatible device to access Program content.`
  },
  {
    id: 'conduct',
    icon: <Scale size={22} />,
    title: 'User Conduct',
    content: `You agree to use the Program solely for lawful personal development purposes. You must not:

• Reproduce, distribute, or publicly share Program content without written permission
• Use the Program for commercial purposes or to train competing products
• Attempt to reverse-engineer, scrape, or extract content in an automated manner
• Harass, threaten, or harm other participants in any community spaces
• Misrepresent your identity or affiliation

We reserve the right to remove content or access that violates these conduct guidelines without notice.`
  },
  {
    id: 'ip',
    icon: <FileText size={22} />,
    title: 'Intellectual Property',
    content: `All content within the Program — including but not limited to text, audio, video, graphics, exercises, and frameworks — is the exclusive intellectual property of MeLifeCoaching and is protected by applicable copyright laws.

You are granted a limited, non-exclusive, non-transferable licence to access and use Program content for your personal development during and after the Program period. This licence does not include rights to reproduce, adapt, or commercially exploit any content.`
  },
  {
    id: 'disclaimer',
    icon: <AlertTriangle size={22} />,
    title: 'Disclaimers',
    content: `The Program is provided for personal development and educational purposes only. Results vary by individual effort, commitment, and personal circumstances. MeLifeCoaching does not guarantee specific outcomes, transformations, or results from participation in the Program.

The Program does not constitute professional psychological, medical, financial, or legal advice. We disclaim all liability for decisions made based on Program content. Program content is provided "as is" without warranties of any kind, express or implied.`
  },
  {
    id: 'liability',
    icon: <Ban size={22} />,
    title: 'Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, MeLifeCoaching shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of data, loss of profits, or loss of goodwill — arising from your use of or inability to use the Program.

Our total liability for any claim arising from these Terms or the Program shall not exceed the amount you paid for your enrollment. Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above limitations may not apply to you.`
  },
  {
    id: 'termination',
    icon: <Ban size={22} />,
    title: 'Termination',
    content: `We reserve the right to terminate or suspend your access to the Program immediately and without prior notice if you breach these Terms, engage in fraudulent activity, or if we determine your continued access poses a risk to other users or the platform.

You may choose to discontinue use of the Program at any time. Termination does not automatically entitle you to a refund. Please refer to our Cancellation & Refund Policy for details on refund eligibility.`
  },
  {
    id: 'governing',
    icon: <Scale size={22} />,
    title: 'Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Program shall be subject to the exclusive jurisdiction of the courts located in India.

If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect. These Terms constitute the entire agreement between you and MeLifeCoaching regarding the Program.

For any questions about these Terms, contact us at hello@melifecoaching.com.`
  },
];

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <NavBar />
      <div style={{ background: '#fff', minHeight: '100vh', paddingTop: '80px', fontFamily: 'sans-serif' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
          color: '#fff', padding: '80px 24px 60px', textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50px', padding: '6px 16px', fontSize: '0.75rem',
            fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#aaa', marginBottom: '24px'
          }}>
            <FileText size={13} /> Legal Agreement
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: '#888', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.7 }}>
            Please read these terms carefully before enrolling in the 15-Day Transformation Program.
          </p>
          <p style={{ color: '#555', fontSize: '0.8rem' }}>Effective date: June 2025 · Version 1.0</p>
        </div>

        {/* Layout: TOC + Content */}
        <div style={{
          maxWidth: '1100px', margin: '0 auto', padding: '60px 24px 80px',
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '40px'
        }}>
          <style>{`
            @media(min-width: 1024px) {
              .terms-layout { grid-template-columns: 240px 1fr !important; }
            }
          `}</style>
          <div className="terms-layout" style={{
            display: 'grid', gridTemplateColumns: '1fr', gap: '40px'
          }}>
            {/* Sticky TOC */}
            <div>
              <div style={{
                position: 'sticky', top: '100px',
                background: '#f8fafc', borderRadius: '16px',
                padding: '24px', border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: '16px' }}>
                  Contents
                </p>
                {tocItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none',
                      background: activeSection === item.id ? '#000' : 'transparent',
                      color: activeSection === item.id ? '#fff' : '#555',
                      cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem',
                      fontWeight: activeSection === item.id ? 600 : 400,
                      transition: 'all 0.2s', marginBottom: '2px'
                    }}
                  >
                    <ChevronRight size={13} style={{ flexShrink: 0 }} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div>
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  id={section.id}
                  style={{
                    marginBottom: '48px',
                    paddingBottom: '48px',
                    borderBottom: idx < sections.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '12px',
                      background: '#000', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>{section.icon}</div>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>
                      {section.title}
                    </h2>
                  </div>
                  <div style={{ paddingLeft: '58px' }}>
                    {section.content.split('\n\n').map((para, i) => (
                      <p key={i} style={{ color: '#4b5563', fontSize: '0.97rem', lineHeight: 1.8, marginBottom: '14px', whiteSpace: 'pre-line' }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Footer CTA */}
              <div style={{
                background: '#000', borderRadius: '16px', padding: '40px',
                textAlign: 'center', color: '#fff'
              }}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '12px' }}>
                  Questions about these terms?
                </h3>
                <p style={{ color: '#888', marginBottom: '24px', lineHeight: 1.6 }}>
                  We're happy to clarify anything before you enroll.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/contact" style={{
                    background: '#fff', color: '#000', padding: '11px 28px',
                    borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none'
                  }}>Contact Us</Link>
                  <Link to="/register" style={{
                    border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '11px 28px',
                    borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none'
                  }}>Enroll Now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default TermsAndConditions;
