// TeacherData.jsx
import React, { useState } from 'react';
import {
  User, Calendar, Award, TrendingUp, Users,
  MessageSquare, BarChart3, Clock, CheckCircle,
  BookOpen, Star, Download, Eye, Bell, Settings
} from 'lucide-react';

const TeacherData = () => {
  const [activeView, setActiveView] = useState('overview');

  const attendanceData = [
    { month: 'Jan', present: 22, total: 25 },
    { month: 'Feb', present: 20, total: 24 },
    { month: 'Mar', present: 23, total: 25 },
    { month: 'Apr', present: 24, total: 26 },
  ];

  const performanceMetrics = {
    overallRating: 4.6,
    reviews: [
      { type: 'Students', rating: 4.5, count: 45 },
      { type: 'Principal', rating: 4.8, count: 1 },
      { type: 'Administration', rating: 4.4, count: 3 },
      { type: 'Peers', rating: 4.7, count: 12 },
    ]
  };

  const classStats = {
    totalStudents: 45,
    averageScore: 78.5,
    topPerformer: { name: 'Rahul Sharma', score: 95 },
    improvementNeeded: 5
  };

  const recentReviews = [
    { reviewer: 'Student - Priya Verma', comment: 'Excellent teaching methodology', rating: 5, date: '2024-03-15' },
    { reviewer: 'Principal', comment: 'Great classroom management skills', rating: 5, date: '2024-03-14' },
    { reviewer: 'Admin - Mr. Gupta', comment: 'Timely submission of reports', rating: 4, date: '2024-03-12' },
    { reviewer: 'Student - Rohit Kumar', comment: 'Very supportive teacher', rating: 5, date: '2024-03-10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <User className="text-purple-600" size={36} />
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Welcome, Mr. Sharma! Mathematics - Grade 10th</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Active - Period 3</span>
            </div>
            <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg">
              <Bell size={20} />
            </button>
            <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-blue-500" size={24} />
              <div className="text-2xl font-bold text-gray-800">{classStats.totalStudents}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
            <p className="text-gray-500 text-sm">Teaching 3 classes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="text-yellow-500" size={24} />
              <div className="text-2xl font-bold text-gray-800">{performanceMetrics.overallRating}/5</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Overall Rating</h3>
            <p className="text-gray-500 text-sm">Based on all reviews</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-green-500" size={24} />
              <div className="text-2xl font-bold text-gray-800">94%</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Attendance Rate</h3>
            <p className="text-gray-500 text-sm">Last 4 months average</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-purple-500" size={24} />
              <div className="text-2xl font-bold text-gray-800">{classStats.averageScore}%</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Class Average</h3>
            <p className="text-gray-500 text-sm">Term exam scores</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Attendance & Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendance Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-blue-600" />
                  Monthly Attendance
                </h2>
                <select className="border rounded-lg px-3 py-2 text-sm">
                  <option>Last 4 Months</option>
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              
              <div className="h-64">
                <div className="flex items-end h-48 gap-4">
                  {attendanceData.map((month, index) => {
                    const percentage = (month.present / month.total) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-3/4 bg-gradient-to-t from-blue-400 to-cyan-300 rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                          style={{ height: `${percentage}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {month.present}/{month.total} ({percentage.toFixed(1)}%)
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 mt-2">{month.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Star className="text-yellow-600" />
                Recent Performance Reviews
              </h2>
              
              <div className="space-y-4">
                {recentReviews.map((review, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-yellow-300 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{review.reviewer}</h4>
                        <p className="text-sm text-gray-600">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            size={16}
                            className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Metrics & Actions */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Performance Metrics</h2>
              <div className="space-y-4">
                {performanceMetrics.reviews.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{metric.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(metric.rating/5)*100}%` }}
                        />
                      </div>
                      <span className="font-bold">{metric.rating}/5</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Overall Score</span>
                  <span className="text-2xl font-bold">{performanceMetrics.overallRating}/5</span>
                </div>
              </div>
            </div>

            {/* Class Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Class Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Top Performer</span>
                  <span className="font-bold text-blue-700">{classStats.topPerformer.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Class Average</span>
                  <span className="font-bold text-green-700">{classStats.averageScore}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700">Needs Attention</span>
                  <span className="font-bold text-yellow-700">{classStats.improvementNeeded} students</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                  <MessageSquare size={24} />
                  <span className="text-sm mt-2">Send Message</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors">
                  <BookOpen size={24} />
                  <span className="text-sm mt-2">Upload Marks</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">
                  <Eye size={24} />
                  <span className="text-sm mt-2">View Reports</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors">
                  <Download size={24} />
                  <span className="text-sm mt-2">Download Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherData;