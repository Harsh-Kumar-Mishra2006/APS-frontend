// src/pages/About/facilities.jsx
import React from 'react';

const Facilities = () => {
  const facilities = [
    {
      icon: '🔬',
      title: 'Advanced Science Labs',
      description: 'State-of-the-art laboratories for physics, chemistry, and biology with modern equipment',
      features: ['Digital Microscopes', 'Research-grade Equipment', 'Safety-first Design']
    },
    {
      icon: '💻',
      title: 'Technology Center',
      description: 'Cutting-edge computer labs and robotics workshop for 21st-century learning',
      features: ['3D Printing Lab', 'Programming Stations', 'AI & Robotics Kits']
    },
    {
      icon: '📚',
      title: 'Digital Library',
      description: 'Extensive collection of books, e-resources, and quiet study spaces',
      features: ['10,000+ Books', 'Online Databases', 'Reading Lounges']
    },
    {
      icon: '⚽',
      title: 'Sports Complex',
      description: 'Olympic-standard facilities for indoor and outdoor sports activities',
      features: ['Swimming Pool', 'Basketball Court', 'Athletics Track']
    },
    {
      icon: '🎭',
      title: 'Performing Arts',
      description: 'Dedicated spaces for music, dance, drama, and visual arts',
      features: ['Auditorium', 'Music Rooms', 'Art Studio']
    },
    {
      icon: '🏥',
      title: 'Health & Wellness',
      description: 'Comprehensive healthcare and counseling services for students',
      features: ['Medical Clinic', 'Counseling Center', 'Yoga Studio']
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">World-Class Facilities</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our campus is designed to inspire learning, creativity, and growth with modern infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{facility.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{facility.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{facility.description}</p>
                <ul className="space-y-2">
                  {facility.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 px-6 py-3 border-t border-blue-100">
                <button className="text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Campus Tour CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Experience Our Campus</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Schedule a personalized tour to see our facilities and meet our community
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Book a Campus Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facilities;