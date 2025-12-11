// src/pages/About/ourAchievements.jsx
import React from 'react';

const OurAchievements = () => {
  const achievements = [
    {
      year: '2024',
      title: 'National Science Olympiad Champions',
      description: 'First place in the National Science Olympiad with 5 gold medals',
      category: 'Academic Excellence'
    },
    {
      year: '2023',
      title: 'Best School Award - State Level',
      description: 'Recognized as the best educational institution in the state',
      category: 'Institutional'
    },
    {
      year: '2023',
      title: 'Robotics Competition Winners',
      description: 'National champions in the Inter-School Robotics Challenge',
      category: 'Technology'
    },
    {
      year: '2022',
      title: 'Environmental Sustainability Award',
      description: 'Green School certification for eco-friendly initiatives',
      category: 'Social Responsibility'
    },
    {
      year: '2022',
      title: 'Sports Championship Trophy',
      description: 'State-level champions in basketball and athletics',
      category: 'Sports'
    },
    {
      year: '2021',
      title: 'Innovation in Education Award',
      description: 'Recognized for implementing innovative teaching methodologies',
      category: 'Educational Innovation'
    }
  ];

  const awardCategories = [
    { name: 'Academic Excellence', count: '25+', color: 'blue' },
    { name: 'Sports & Athletics', count: '18', color: 'green' },
    { name: 'Arts & Culture', count: '12', color: 'purple' },
    { name: 'Technology & Innovation', count: '15', color: 'yellow' }
  ];

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Celebrating excellence and recognition across various domains
          </p>
        </div>

        {/* Award Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {awardCategories.map((category, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br ${
                category.color === 'blue' ? 'from-blue-100 to-blue-200 hover:to-blue-600 hover:text-white' :
                category.color === 'green' ? 'from-green-100 to-green-200  hover:to-teal-600 hover:text-white' :
                category.color === 'purple' ? 'from-purple-100 to-purple-200  hover:to-pink-600 hover:text-white' :
                'from-yellow-100 to-yellow-200  hover:to-lime-600 hover:text-white'
              } rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl hover:scale-105`}
            >
              <div className="text-3xl font-bold text-gray-900 mb-2">{category.count}</div>
              <div className="text-lg font-semibold text-gray-800">{category.name}</div>
              <div className="text-sm text-gray-600 mt-1">Awards & Recognitions</div>
            </div>
          ))}
        </div>

        {/* Recent Achievements Timeline */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Recent Milestones</h3>
          <div className="space-y-8">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {achievement.year}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="text-xl font-semibold text-gray-900">{achievement.title}</h4>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mt-2 sm:mt-0">
                      {achievement.category}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legacy Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">A Legacy of Excellence</h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              For over 30 years, we've been committed to nurturing talent, fostering innovation, 
              and building character. Our achievements reflect our dedication to holistic education.
            </p>
            <button className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              View Complete Achievement History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurAchievements;