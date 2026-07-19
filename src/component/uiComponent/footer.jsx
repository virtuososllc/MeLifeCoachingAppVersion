import React from 'react'
import { Link } from 'react-router-dom'; 
import LogoImg from '../../assests/Logo.jpg';
import {  Twitter, Instagram, Linkedin } from 'lucide-react';
import '../../css/footer.css'
function footer(){
  return (
    <>

    {/* NEW: SITE FOOTER */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand">
            {/* LEFT: Logo - Links to Home "/" */}
                     <Link to="/home" className="logo-footer">
                       <img src={LogoImg} alt="logo" className='logoImgfooter' />
                       <span style={{ color: '#f0f3f7' }}> MeLifeCoaching</span>
                     </Link>
            <p className="footer-mission">Our mission is to empower individuals to break free from limitations and design a life of purpose, joy, and authentic connection.</p>
          </div>
          <div className="footer-links">
            <h4 className="footer-heading">Quick Links</h4>
            <div className="footer-link-list">
               <Link to="/home">Home</Link>
            <Link to="/contact">Contact</Link>
             <Link to="/program">Program</Link>
            <Link to="/about">About</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms of Service</Link>
            <Link to="/payment-and-cancellations">Payment and Cancellations</Link>

              {/* <a href="#">Home</a>
              <a href="#">Program</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a> */}
            </div>
          </div>
          <div className="footer-connect">
            <h4 className="footer-heading">Connect</h4>
            <div className="social-links-footer">
              <Twitter className="social-icon" size={24} onClick={() => window.open('https://x.com/MELifeCoaching', '_blank')} />
              <Instagram className="social-icon" size={24} onClick={() => window.open('https://www.instagram.com/me_lifecoaching/', '_blank')} />
              {/* <Linkedin className="social-icon" size={24} href="https://linkedin.com" /> */}
             
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 MeLifeCoaching. All rights reserved.</span>
          <span>Designed for Impact (Virtuosos LLC)</span>
        </div>
      </footer>
   </>

  )
}
export default footer