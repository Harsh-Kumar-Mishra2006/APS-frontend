// Footer.jsx
import React from 'react';
import {Instagram,Twitter,Youtube,Linkedin} from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-900 font-bold text-lg">APS</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                Achievement Public School
              </h3>
            </div>
            <p className="text-blue-100 mb-4 max-w-md leading-relaxed">
              Empowering students to reach their full potential through quality education, 
              innovative teaching methods, and a nurturing environment that fosters growth and excellence.
            </p>
            <div className="flex space-x-4">
                <div className="w-10 h-10 bg-pink-700 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-blue-900 transition-all duration-300 cursor-pointer">
                  <Instagram/>
                </div>
                <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-blue-900 transition-all duration-300 cursor-pointer">
                  <Twitter/>
                </div>
                <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-blue-900 transition-all duration-300 cursor-pointer">
                  <Youtube/>
                </div>
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-blue-900 transition-all duration-300 cursor-pointer">
                  <Linkedin/>
                </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-300">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Admissions', 'Academics', 'Gallery', 'Contact'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-blue-100 hover:text-yellow-300 transition-colors duration-300 flex items-center group">
                    <svg className="w-3 h-3 mr-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-300">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-blue-100">123 Education Lane, Knowledge City, KC 12345</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-blue-100">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-blue-100">info@achievementpublic.edu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-200 text-sm mb-4 md:mb-0">
            © 2024 Achievement Public School. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#privacy" className="text-blue-200 hover:text-yellow-300 transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#terms" className="text-blue-200 hover:text-yellow-300 transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#sitemap" className="text-blue-200 hover:text-yellow-300 transition-colors duration-300">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;