// src/pages/About/stats.jsx
import React from 'react';

const Stats = () => {
  const stats = [
    {
      number: '30+',
      label: 'Years of Excellence',
      description: 'Three decades of educational leadership',
      colorVariant: 'tealToPink'
    },
    {
      number: '5,000+',
      label: 'Successful Alumni',
      description: 'Graduates making a difference worldwide',
      colorVariant: 'blueToPurple'
    },
    {
      number: '98%',
      label: 'Academic Success',
      description: 'University acceptance rate',
      colorVariant: 'greenToBlue'
    },
    {
      number: '50+',
      label: 'National Awards',
      description: 'Recognized for excellence',
      colorVariant: 'orangeToRed'
    }
  ];

  // Color configurations with clear names
  const colorConfigs = {
    tealToPink: {
      bgClasses: 'bg-gradient-to-br from-teal-600 to-pink-400',
      textClass: 'text-white1'
    },
    blueToPurple: {
      bgClasses: 'bg-gradient-to-br from-blue-600 to-purple-300',
      textClass: 'text-white2'
    },
    greenToBlue: {
      bgClasses: 'bg-gradient-to-br from-green-600 to-blue-300',
      textClass: 'text-white3'
    },
    orangeToRed: {
      bgClasses: 'bg-gradient-to-br from-orange-600 to-red-300',
      textClass: 'text-white4'
    },
    yellowToOrange: {
      bgClasses: 'bg-gradient-to-br from-yellow-600 to-orange-300',
      textClass: 'text-white2'
    }
  };

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Legacy in Numbers</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decades of excellence reflected through our achievements and impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const colors = colorConfigs[stat.colorVariant];
            
            return (
              <div 
                key={index}
                className={`group relative text-center p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100 hover:${colors.bgClasses} hover:shadow-4xl hover:scale-110`}
              >
                <div className={`${colors.textClass} transition-all duration-300`}>
                  <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {stat.label}
                  </h3>
                  <p className="text-gray-600 group-hover:text-white transition-colors">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional mini stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Student Clubs', value: '25+' },
            { label: 'Sports Teams', value: '15' },
            { label: 'Faculty Members', value: '120+' },
            { label: 'Student Ratio', value: '12:1' }
          ].map((item, index) => (
            <div key={index} className="h-20 w-70 justify-center items-center text-center bg-gradient-to-r from-emerald-300 to-sky-300 rounded-xl hover:shadow-2xl hover:scale-110  ">
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-black font-bold text-ellipsis text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;