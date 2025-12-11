// StudentData.jsx
import React, { useState } from 'react';
import {
  User, BookOpen, Calendar, Award, TrendingUp,
  Clock, CheckCircle, XCircle, BarChart3, Target,
  Bell, Download, Share2, Star
} from 'lucide-react';

const StudentData = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const attendanceStats = {
    totalDays: 120,
    present: 108,
    absent: 8,
    late: 4,
    percentage: 90
  };

  const examResults = [
    { subject: "Mathematics", score: 92, max: 100, grade: "A+", trend: "up" },
    { subject: "Physics", score: 85, max: 100, grade: "A", trend: "up" },
    { subject: "Chemistry", score: 88, max: 100, grade: "A", trend: "stable" },
    { subject: "Biology", score: 78, max: 100, grade: "B+", trend: "down" },
    { subject: "English", score: 91, max: 100, grade: "A+", trend: "up" },
    { subject: "Computer Science", score: 95, max: 100, grade: "A+", trend: "up" }
  ];

  const performanceReviews = [
    { reviewer: "Mathematics Teacher", rating: 4.5, comment: "Excellent problem-solving skills", date: "2024-03-15" },
    { reviewer: "Physics Teacher", rating: 4.0, comment: "Good understanding of concepts", date: "2024-03-14" },
    { reviewer: "Class Teacher", rating: 4.2, comment: "Active participant in class", date: "2024-03-12" },
    { reviewer: "Principal", rating: 4.8, comment: "Excellent overall performance", date: "2024-03-10" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <User className="text-green-600" size={36} />
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Welcome back, Rahul! Track your academic journey</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Grade 10th - Section A</span>
            </div>
            <button className="bg-gradient-to-r from-green-500 to-cyan-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-shadow">
              <Bell size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {['overview', 'attendance', 'exams', 'performance'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white shadow-lg text-green-700' : 'text-gray-600 hover:bg-white/50'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <BookOpen size={24} />
              <TrendingUp size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-2">88.5%</h3>
            <p className="opacity-90">Overall Grade</p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Calendar size={24} />
              <CheckCircle size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-2">{attendanceStats.percentage}%</h3>
            <p className="opacity-90">Attendance Rate</p>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Award size={24} />
              <Star size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-2">4.3/5</h3>
            <p className="opacity-90">Performance Rating</p>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Target size={24} />
              <BarChart3 size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-2">7th</h3>
            <p className="opacity-90">Class Rank</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="text-blue-600" />
                  Exam Results
                </h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download size={18} />
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 text-gray-600">Subject</th>
                      <th className="text-left py-3 text-gray-600">Score</th>
                      <th className="text-left py-3 text-gray-600">Grade</th>
                      <th className="text-left py-3 text-gray-600">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examResults.map((exam, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-4">
                          <div className="font-medium">{exam.subject}</div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
                                style={{ width: `${exam.score}%` }}
                              />
                            </div>
                            <span className="font-bold">{exam.score}/{exam.max}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full font-bold ${exam.grade.includes('A') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {exam.grade}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className={`flex items-center ${exam.trend === 'up' ? 'text-green-600' : exam.trend === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
                            <TrendingUp size={16} className={exam.trend === 'down' ? 'rotate-180' : ''} />
                            <span className="ml-1">{exam.trend === 'up' ? 'Improving' : exam.trend === 'down' ? 'Needs Attention' : 'Stable'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Performance Reviews */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Performance Reviews</h2>
              <div className="space-y-4">
                {performanceReviews.map((review, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{review.reviewer}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="font-bold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                    <p className="text-gray-500 text-xs">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span>Present</span>
                  </div>
                  <span className="font-bold">{attendanceStats.present} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <XCircle className="text-red-500" size={20} />
                    <span>Absent</span>
                  </div>
                  <span className="font-bold">{attendanceStats.absent} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="text-yellow-500" size={20} />
                    <span>Late Arrival</span>
                  </div>
                  <span className="font-bold">{attendanceStats.late} days</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total Attendance</span>
                  <span className="text-2xl font-bold text-green-600">{attendanceStats.percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentData;