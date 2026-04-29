// src/pages/Attendance.jsx
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
  Loader
} from 'lucide-react';

const Attendance = () => {
  const { user, loading, authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('daily'); // daily, monthly-student, monthly-teacher, view

  // Check permissions
  const canManageAttendance = user?.role === 'admin' || user?.role === 'teacher';
  const canViewOwnAttendance = user?.role === 'student' || user?.role === 'teacher' || user?.role === 'parent';

  // ✅ Show loading while checking auth
    if (loading || !authChecked) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Checking authorization...</p>
          </div>
        </div>
      );
    }
  
    // Check if user is admin after auth is complete
    if (!user || user.role !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only administrators can access this page.</p>
          </div>
        </div>
      );
    }

  if (!canManageAttendance && !canViewOwnAttendance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view attendance.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'daily', label: 'Daily Attendance', icon: Clock, show: canManageAttendance },
    { id: 'monthly-student', label: 'Add Student Monthly', icon: GraduationCap, show: user?.role === 'admin' },
    { id: 'monthly-teacher', label: 'Add Teacher Monthly', icon: BookOpen, show: user?.role === 'admin' },
    { id: 'view', label: 'View Attendance', icon: BarChart3, show: true }
  ];

  const visibleTabs = tabs.filter(tab => tab.show);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-2">
            {canManageAttendance 
              ? 'Mark and manage attendance for students and teachers'
              : 'View your attendance records'}
          </p>
        </div>

        {/* Tabs */}
        {visibleTabs.length > 1 && (
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex flex-wrap gap-2">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-t-lg transition-all
                      ${activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'monthly-student' && user?.role === 'admin' && (
            <StudentAttendanceForm />
          )}
          
          {activeTab === 'monthly-teacher' && user?.role === 'admin' && (
            <TeacherAttendanceForm />
          )}
          
          {activeTab === 'view' && (
            <ViewAttendance />
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;