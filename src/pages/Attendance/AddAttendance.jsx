// pages/Attendance/Attendance.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MarkStudentAttendance from '../../components/Attendance/MarkStudentAttendance';
import MarkTeacherAttendance from '../../components/Attendance/MarkTeacherAttendance';
import ViewAttendance from '../../components/Attendance/ViewAttendance';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Clock, 
  BarChart3,
  GraduationCap,
  BookOpen,
  Loader,
  CheckCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  Shield
} from 'lucide-react';

const Attendance = () => {
  const { user, loading, authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('mark-student');
  const [hoveredTab, setHoveredTab] = useState(null);

  // Check permissions
  const canMarkStudentAttendance = user?.role === 'admin' || user?.role === 'teacher';
  const canMarkTeacherAttendance = user?.role === 'admin';
  const canViewAttendance = user?.role === 'student' || user?.role === 'teacher' || user?.role === 'parent' || user?.role === 'admin';

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <Loader className="w-12 h-12 animate-spin text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading attendance dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    ...(canMarkStudentAttendance ? [{
      id: 'mark-student',
      label: 'Mark Student Attendance',
      icon: GraduationCap,
      description: 'Daily attendance for students using Student ID',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      badge: 'Teacher Access'
    }] : []),
    ...(canMarkTeacherAttendance ? [{
      id: 'mark-teacher',
      label: 'Mark Teacher Attendance',
      icon: BookOpen,
      description: 'Daily attendance for teachers using Teacher ID',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      badge: 'Admin Only'
    }] : []),
    ...(canViewAttendance ? [{
      id: 'view',
      label: 'View Records',
      icon: BarChart3,
      description: 'View attendance history and statistics',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      badge: user?.role === 'parent' ? 'Parent View' : 'Self View'
    }] : [])
  ];

  const getTabStyles = (tabId) => {
    const isActive = activeTab === tabId;
    const isHovered = hoveredTab === tabId;
    
    if (isActive) {
      const tab = tabs.find(t => t.id === tabId);
      return `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105 ring-2 ring-white ring-opacity-50`;
    }
    return `bg-white text-gray-700 hover:shadow-xl hover:scale-102 transition-all duration-300 border-2 border-gray-100 hover:border-${tabs.find(t => t.id === tabId)?.color}-300`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/20 rounded-full animate-float"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                animationDuration: Math.random() * 10 + 5 + 's'
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Daily Attendance System</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Attendance Management
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl">
                Mark daily attendance using Student/Teacher IDs • Auto-calculate monthly summaries
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div className="text-xs opacity-80">Current Date</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Cards */}
        <div className={`grid gap-6 mb-10 ${tabs.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`
                  group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                  ${getTabStyles(tab.id)}
                `}
              >
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"></div>
                )}
                
                <div className="relative z-10">
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                    ${isActive ? 'bg-white/20' : `bg-${tab.color}-100 group-hover:bg-${tab.color}-200`}
                  `}>
                    <Icon className={`w-7 h-7 ${isActive ? 'text-white' : `text-${tab.color}-600`}`} />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {tab.label}
                  </h3>
                  
                  <p className={`text-sm mb-3 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {tab.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isActive ? 'bg-white/20 text-white' : `bg-${tab.color}-50 text-${tab.color}-600`
                    }`}>
                      <Shield className="w-3 h-3" />
                      {tab.badge}
                    </span>
                    
                    <div className={`flex items-center gap-1 text-sm font-medium ${isActive ? 'text-white' : `text-${tab.color}-600`}`}>
                      <span>{isActive ? 'Active' : 'Click to open'}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                </div>
                
                {isActive && (
                  <div className="absolute bottom-3 right-3 opacity-20">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className={`
                w-2 h-2 rounded-full animate-pulse
                ${activeTab === 'mark-student' ? 'bg-blue-500' : activeTab === 'mark-teacher' ? 'bg-green-500' : 'bg-purple-500'}
              `}></div>
              <span className="text-sm font-medium text-gray-600">
                {activeTab === 'mark-student' && 'Mark Student Attendance (Daily)'}
                {activeTab === 'mark-teacher' && 'Mark Teacher Attendance (Daily)'}
                {activeTab === 'view' && 'View Attendance Records'}
              </span>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            {activeTab === 'mark-student' && canMarkStudentAttendance && (
              <div className="animate-fadeIn">
                <MarkStudentAttendance />
              </div>
            )}
            
            {activeTab === 'mark-teacher' && canMarkTeacherAttendance && (
              <div className="animate-fadeIn">
                <MarkTeacherAttendance />
              </div>
            )}
            
            {activeTab === 'view' && (
              <div className="animate-fadeIn">
                <ViewAttendance />
              </div>
            )}
          </div>
        </div>
        
        {/* Info Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xs text-blue-600">📝 Daily attendance auto-calculates monthly summary</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xs text-green-600">🎓 Teachers mark student attendance • Admin marks teacher attendance</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-xs text-purple-600">👨‍👩‍👧 Parents can view all children's attendance</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Attendance;