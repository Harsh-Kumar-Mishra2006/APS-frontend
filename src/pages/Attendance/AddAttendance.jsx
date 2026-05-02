import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentAttendanceForm from '../../components/Attendance/StudentAttendanceForm';
import TeacherAttendanceForm from '../../components/Attendance/TeacherAttendanceForm';
import ViewAttendance from '../../components/Attendance/viewAttendance';
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
  ChevronRight
} from 'lucide-react';

const Attendance = () => {
  const { user, loading, authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('monthly-student');
  const [hoveredTab, setHoveredTab] = useState(null);

  // Check permissions
  const canManageAttendance = user?.role === 'admin' || user?.role === 'teacher';
  const canViewOwnAttendance = user?.role === 'student' || user?.role === 'teacher' || user?.role === 'parent';

  

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

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md transform transition-all">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-red-500 text-5xl">⚠️</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only administrators can access the attendance management page.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'monthly-student', 
      label: 'Student Attendance', 
      icon: GraduationCap, 
      description: 'Add monthly attendance for students',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'monthly-teacher', 
      label: 'Teacher Attendance', 
      icon: BookOpen, 
      description: 'Add monthly attendance for teachers',
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      id: 'view', 
      label: 'View Records', 
      icon: BarChart3, 
      description: 'View and analyze attendance data',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const getTabStyles = (tabId) => {
    const isActive = activeTab === tabId;
    const isHovered = hoveredTab === tabId;
    
    if (isActive) {
      const tab = tabs.find(t => t.id === tabId);
      return `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`;
    }
    return `bg-white text-gray-700 hover:shadow-md hover:scale-102 transition-all duration-300 border-2 border-transparent hover:border-${tabs.find(t => t.id === tabId)?.color}-200`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Attendance Management System</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Track Attendance</h1>
              <p className="text-lg text-blue-100 max-w-2xl">
                Manage and monitor student and teacher attendance records efficiently
              </p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const colorClass = {
              blue: 'hover:border-blue-300 group-hover:bg-blue-50',
              green: 'hover:border-green-300 group-hover:bg-green-50',
              purple: 'hover:border-purple-300 group-hover:bg-purple-50'
            }[tab.color];
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`
                  group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                  ${isActive ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105 ring-2 ring-white ring-opacity-50` : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-100'}
                `}
              >
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"></div>
                )}
                
                <div className="relative z-10">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                    ${isActive ? 'bg-white/20' : `bg-${tab.color}-100 group-hover:bg-${tab.color}-200`}
                  `}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : `text-${tab.color}-600`}`} />
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {tab.label}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {tab.description}
                  </p>
                  
                  <div className={`flex items-center gap-1 text-sm font-medium ${isActive ? 'text-white' : `text-${tab.color}-600`}`}>
                    <span>{isActive ? 'Active' : 'Click to open'}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
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
          {/* Tab Indicator */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className={`
                w-2 h-2 rounded-full animate-pulse
                ${activeTab === 'monthly-student' ? 'bg-blue-500' : activeTab === 'monthly-teacher' ? 'bg-green-500' : 'bg-purple-500'}
              `}></div>
              <span className="text-sm font-medium text-gray-600">
                {activeTab === 'monthly-student' && 'Adding Student Attendance'}
                {activeTab === 'monthly-teacher' && 'Adding Teacher Attendance'}
                {activeTab === 'view' && 'Viewing Attendance Records'}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'monthly-student' && user?.role === 'admin' && (
              <div className="animate-fadeIn">
                <StudentAttendanceForm />
              </div>
            )}
            
            {activeTab === 'monthly-teacher' && user?.role === 'admin' && (
              <div className="animate-fadeIn">
                <TeacherAttendanceForm />
              </div>
            )}
            
            {activeTab === 'view' && (
              <div className="animate-fadeIn">
                <ViewAttendance />
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Clock className="w-3 h-3" />
            Attendance records are updated in real-time
          </p>
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
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Attendance;