import React from 'react';

function Footer() {
  return (
    <footer className="bg-sky-900 text-white font-sans mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-8">
        {/* Grid container for the columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          
          {/* Contact Us Column */}
          <div className="footer-column">
            <h4 className="text-2xl font-bold mb-5">Contact Us</h4>
            <ul className="space-y-2.5">
              <li>
                <img src="/images/Indian_Railway_Logo_1.png" alt="Railway logo" className="w-[90px] opacity-90 mb-4 mx-auto md:mx-0" />
              </li>
              <li className="text-slate-300">New Delhi, India</li>
              <li>
                <a href="mailto:hi@thinkdriven.in" className="text-slate-300 hover:text-white transition-colors duration-300">
                  centralcontrol@irctc.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="footer-column">
            <h4 className="text-2xl font-bold mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><a href="/reports" className="text-slate-300 hover:text-white transition-transform duration-200 inline-block hover:-translate-y-1">Reports</a></li>
              <li><a href="/schedules" className="text-slate-300 hover:text-white transition-transform duration-200 inline-block hover:-translate-y-1">Schedules</a></li>
              <li><a href="/maps" className="text-slate-300 hover:text-white transition-transform duration-200 inline-block hover:-translate-y-1">Maps</a></li>
             
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="footer">
            <h4 className="text-2xl font-bold mb-5">Follow Us</h4>
          <ul className="flex flex-col items-center pl-100  gap-4">
              <li><a href="https://www.instagram.com/railminindia?igsh=cG1lb2JxZXh6dWw1" target="_blank" rel="noopener noreferrer" className="block transition-transform duration-300 hover:-translate-y-1.5"><img src="/images/instagram.png" alt="instagram" className="w-8 h-8" /></a></li>
              <li><a href="https://x.com/RailMinIndia" target="_blank" rel="noopener noreferrer" className="block transition-transform duration-300 hover:-translate-y-1.5"><img src="/images/twitter.png" alt="instagram" className="w-8 h-8" /></a></li>
              <li><a href="https://www.facebook.com/RailMinIndia?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="block transition-transform duration-300 hover:-translate-y-1.5"><img src="/images/facebook.png" alt="facebook" className="w-8 h-8" /></a></li>
              <li><a href="http://indianrailways.gov.in" target="_blank" rel="noopener noreferrer" className="block transition-transform duration-300 hover:-translate-y-1.5"><img src="/images/world-wide-web.png" alt="website" className="w-8 h-8" /></a></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="text-center text-slate-300 mt-10 pt-5 border-t border-slate-700">
          <p>&copy; 2024 by Rail Marg All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;