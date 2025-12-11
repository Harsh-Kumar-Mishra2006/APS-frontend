// HomeHeroPage.jsx
import React from 'react';

const HomeHeroPage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-indigo-400 rounded-full opacity-25 animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* School Badge/Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
              <span className="text-white font-bold text-lg">APS</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
              Achievement
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
              Public School
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Empowering young minds to achieve excellence through 
            <span className="font-semibold text-blue-700"> innovation</span>, 
            <span className="font-semibold text-yellow-500"> creativity</span>, and 
            <span className="font-semibold text-blue-700"> character</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-110 hover:bg-teal-400">
              <div className="text-3xl font-bold text-blue-900 mb-2">x+</div>
              <div className="text-gray-600 font-medium">Years of Excellence</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-110 hover:bg-lime-400 hover:text-indigo-700">
                <div className="text-3xl font-bold text-yellow-500 mb-2 hover:text-indigo-700">y+</div>
                <div className="text-gray-600 font-medium hover:text-indigo-700">Successful Students</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-110 hover:bg-cyan-400">
              <div className="text-3xl font-bold text-blue-900 mb-2">z%</div>
              <div className="text-gray-600 font-medium">Academic Success</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <span>Explore Admissions</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <span>About Us</span>
            </button>
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {['STEM Labs', 'Sports Academy', 'Arts Program', 'Global Exchange'].map((feature, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center shadow-md border border-white/30">
                <div className="text-sm font-semibold text-gray-800">{feature}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      
    </div>
  );
};

export default HomeHeroPage;