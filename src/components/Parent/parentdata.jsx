// ParentData.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Award, TrendingUp, 
  Bell, BookOpen, BarChart3, MessageSquare,
  Clock, CheckCircle, XCircle, Eye
} from 'lucide-react';

const ParentData = () => {
  const [activeChild, setActiveChild] = useState(0);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState({});

  const children = [
    { id: 1, name: "Rahul Sharma", grade: "10th", rollNo: "101", avatar: "👦" },
    { id: 2, name: "Priya Sharma", grade: "8th", rollNo: "45", avatar: "👧" }
  ];

  useEffect(() => {
    // Mock data - replace with API call
    setAttendanceData([
      { month: "Jan", present: 22, absent: 3, late: 2 },
      { month: "Feb", present: 20, absent: 5, late: 3 },
      { month: "Mar", present: 24, absent: 2, late: 1 },
      { month: "Apr", present: 23, absent: 3, late: 2 }
    ]);

    setPerformanceData({
      overall: 85,
      subjects: [
        { name: "Mathematics", score: 92, trend: "up" },
        { name: "Science", score: 88, trend: "up" },
        { name: "English", score: 78, trend: "stable" },
        { name: "Social Studies", score: 91, trend: "up" }
      ],
      reviews: [
        { teacher: "Mr. Kumar", comment: "Excellent progress in mathematics", date: "2024-03-15", rating: 5 },
        { teacher: "Ms. Verma", comment: "Needs improvement in language skills", date: "2024-03-10", rating: 3 },
        { teacher: "Principal", comment: "Active participant in school activities", date: "2024-03-05", rating: 4 }
      ]
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="text-blue-600" size={36} />
            Parent Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Monitor your children's academic progress and activities</p>
        </div>

        {/* Children Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {children.map((child, index) => (
            <div 
              key={child.id}
              className={`p-4 rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 ${activeChild === index ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white shadow-md'}`}
              onClick={() => setActiveChild(index)}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{child.avatar}</div>
                <div>
                  <h3 className="font-semibold">{child.name}</h3>
                  <p className="text-sm opacity-90">Grade {child.grade}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Attendance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendance Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-green-600" />
                  Attendance Overview
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {((22/25)*100).toFixed(1)}% Present
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-sm text-gray-600">Present</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">22</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <XCircle className="text-red-600" size={20} />
                    <span className="text-sm text-gray-600">Absent</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">3</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="text-yellow-600" size={20} />
                    <span className="text-sm text-gray-600">Late</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">2</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={20} />
                    <span className="text-sm text-gray-600">Overall</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">88%</p>
                </div>
              </div>

              <div className="h-48">
                {/* Chart would go here */}
                <div className="flex items-end h-32 gap-2">
                  {attendanceData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${(item.present/25)*100}%` }}
                      />
                      <span className="text-xs mt-2 text-gray-600">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <MessageSquare className="text-purple-600" />
                Teacher Reviews
              </h2>
              
              <div className="space-y-4">
                {performanceData.reviews?.map((review, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{review.teacher}</h4>
                        <p className="text-sm text-gray-600">{review.date}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-3 h-3 rounded-full ${i < review.rating ? 'bg-yellow-400' : 'bg-gray-300'}`}
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

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            {/* Overall Performance */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award size={24} />
                Overall Performance
              </h2>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold mb-2">{performanceData.overall}%</div>
                <p className="opacity-90">Academic Score</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp size={20} />
                <span>+5.2% from last term</span>
              </div>
            </div>

            {/* Subject Scores */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Subject Scores</h2>
              <div className="space-y-4">
                {performanceData.subjects?.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{subject.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-1000"
                          style={{ width: `${subject.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-800">{subject.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                  <Bell size={20} />
                  <span>Set Attendance Alerts</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors">
                  <MessageSquare size={20} />
                  <span>Message Teacher</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">
                  <Eye size={20} />
                  <span>View Report Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentData;