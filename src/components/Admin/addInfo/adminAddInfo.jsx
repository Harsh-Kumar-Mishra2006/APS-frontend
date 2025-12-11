// src/pages/admin/AdminAddInfo.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

// Student components
import AddAttendanceForm from '../../form/addAttendenceForm';
import AttendanceView from '../../view/attendenceView';
import AddMarksForm from '../../form/addMarksForm';
import TeacherReviewForm from '../../form/teachersReviewForm';
import MarksView from '../../view/marksView'; // New component
import PerformanceView from '../../view/performanceView'; // New component

// Import teacher components
import TeacherAttendanceForm from '../../form/teachersAttedenceForm';
import TeacherPerformanceForm from '../../form/teachersPerformanceForm';
import TeacherAttendanceView from '../../view/teachersAttendenceView';
import TeacherPerformanceView from '../../view/teachersPerformanceView';

const AdminAddInfo = () => {
  const { isAdmin } = useAuth();
  const [activeBlock, setActiveBlock] = useState('student'); // 'student' or 'teacher'
  const [activeSection, setActiveSection] = useState('attendance'); // 'attendance', 'marks', 'reviews', 'attendanceView', 'marksView', 'performanceView'
  const [activeTeacherSection, setActiveTeacherSection] = useState('attendance'); // 'attendance', 'performance', 'attendanceView', 'performanceView'

  // Redirect non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management Dashboard</h1>
        <p className="text-gray-600">Manage student and teacher performance data</p>
      </div>

      {/* Selection Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Student Block */}
        <div className={`rounded-xl shadow-lg p-6 transition-all ${
          activeBlock === 'student' 
            ? 'bg-blue-50 border-2 border-blue-500' 
            : 'bg-white border border-gray-200 hover:shadow-xl'
        }`}>
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-lg mr-4 ${
              activeBlock === 'student' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1.205a9 9 0 01-13.5 2.205" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Student Performance Management</h2>
              <p className="text-gray-600 text-sm">Manage student attendance, marks, reviews, and view reports</p>
            </div>
          </div>

          <button
            onClick={() => setActiveBlock('student')}
            className={`w-full py-3 rounded-lg font-medium ${
              activeBlock === 'student'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {activeBlock === 'student' ? '✓ Selected' : 'Select Student Block'}
          </button>

          {/* Student Options - Improved with 3 columns */}
          {activeBlock === 'student' && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {/* Attendance Section */}
              <button
                onClick={() => setActiveSection('attendance')}
                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                  activeSection === 'attendance' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Attendance
              </button>
              
              <button
                onClick={() => setActiveSection('attendanceView')}
                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                  activeSection === 'attendanceView' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Attendance
              </button>

              {/* Marks Section */}
              <button
                onClick={() => setActiveSection('marks')}
                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                  activeSection === 'marks' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Add Marks
              </button>
              
              <button
                onClick={() => setActiveSection('marksView')}
                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                  activeSection === 'marksView' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Marks
              </button>

              {/* Reviews & Performance */}
              <button
                onClick={() => setActiveSection('reviews')}
                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                  activeSection === 'reviews' ? 'bg-green-100 text-green-700 border border-green-300' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Add Reviews
              </button>
              
              <button
                onClick={() => setActiveSection('performanceView')}
                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                  activeSection === 'performanceView' ? 'bg-teal-100 text-teal-700 border border-teal-300' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Performance View
              </button>
            </div>
          )}
        </div>

        {/* Teacher Block - Keep as is */}
        <div className={`rounded-xl shadow-lg p-6 transition-all ${
          activeBlock === 'teacher' 
            ? 'bg-green-50 border-2 border-green-500' 
            : 'bg-white border border-gray-200 hover:shadow-xl'
        }`}>
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-lg mr-4 ${
              activeBlock === 'teacher' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Teacher Performance Management</h2>
              <p className="text-gray-600 text-sm">Manage teacher attendance, performance, and reviews</p>
            </div>
          </div>

          <button
            onClick={() => setActiveBlock('teacher')}
            className={`w-full py-3 rounded-lg font-medium ${
              activeBlock === 'teacher'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {activeBlock === 'teacher' ? '✓ Selected' : 'Select Teacher Block'}
          </button>

          {/* Teacher Options - Keep as is */}
          {activeBlock === 'teacher' && (
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setActiveTeacherSection('attendance')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeTeacherSection === 'attendance' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Teacher Attendance
              </button>
              <button
                onClick={() => setActiveTeacherSection('attendanceView')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeTeacherSection === 'attendanceView' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Teacher Attendance
              </button>
              <button
                onClick={() => setActiveTeacherSection('performance')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeTeacherSection === 'performance' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Performance Review
              </button>
              <button
                onClick={() => setActiveTeacherSection('performanceView')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeTeacherSection === 'performanceView' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Performance Reviews
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {activeBlock === 'student' && (
          <>
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-lg mr-4 ${
                activeSection === 'attendance' ? 'bg-blue-100' :
                activeSection === 'attendanceView' ? 'bg-blue-100' :
                activeSection === 'marks' ? 'bg-purple-100' :
                activeSection === 'marksView' ? 'bg-purple-100' :
                activeSection === 'reviews' ? 'bg-green-100' :
                'bg-teal-100'
              }`}>
                {activeSection === 'attendance' || activeSection === 'attendanceView' ? (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : activeSection === 'marks' || activeSection === 'marksView' ? (
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ) : activeSection === 'reviews' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeSection === 'attendance' ? 'Student Attendance Management' :
                   activeSection === 'attendanceView' ? 'View Student Attendance Records' :
                   activeSection === 'marks' ? 'Exam Marks Management' :
                   activeSection === 'marksView' ? 'View Exam Results' :
                   activeSection === 'reviews' ? 'Teacher Reviews Management' :
                   'Student Performance Overview'}
                </h2>
                <p className="text-gray-600">
                  {activeSection === 'attendance' ? 'Mark and manage student attendance (Daily/Monthly/Bulk)' :
                   activeSection === 'attendanceView' ? 'View and analyze student attendance records' :
                   activeSection === 'marks' ? 'Add and manage exam marks with multiple subjects' :
                   activeSection === 'marksView' ? 'View and analyze exam performance with filters' :
                   activeSection === 'reviews' ? 'Add and manage teacher reviews for students' :
                   'Comprehensive view of student academic and behavioral performance'}
                </p>
              </div>
            </div>

            {/* Student Content Section - Updated with new components */}
            {activeSection === 'attendance' && <AddAttendanceForm />}
            {activeSection === 'attendanceView' && <AttendanceView />}
            {activeSection === 'marks' && <AddMarksForm />}
            {activeSection === 'marksView' && <MarksView />}
            {activeSection === 'reviews' && <TeacherReviewForm />}
            {activeSection === 'performanceView' && <PerformanceView />}
          </>
        )}

        {activeBlock === 'teacher' && (
          <>
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-lg mr-4 ${
                activeTeacherSection === 'attendance' ? 'bg-green-100' :
                activeTeacherSection === 'attendanceView' ? 'bg-green-100' :
                activeTeacherSection === 'performance' ? 'bg-green-100' :
                'bg-green-100'
              }`}>
                {activeTeacherSection === 'attendance' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : activeTeacherSection === 'attendanceView' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : activeTeacherSection === 'performance' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTeacherSection === 'attendance' ? 'Teacher Attendance Management' :
                   activeTeacherSection === 'attendanceView' ? 'View Teacher Attendance Records' :
                   activeTeacherSection === 'performance' ? 'Teacher Performance Review Management' :
                   'View Teacher Performance Reviews'}
                </h2>
                <p className="text-gray-600">
                  {activeTeacherSection === 'attendance' ? 'Add and manage teacher monthly attendance' :
                   activeTeacherSection === 'attendanceView' ? 'View and analyze teacher attendance history' :
                   activeTeacherSection === 'performance' ? 'Add and manage teacher performance evaluations' :
                   'View and analyze teacher performance review history'}
                </p>
              </div>
            </div>

            {/* Teacher Content Section - Keep as is */}
            {activeTeacherSection === 'attendance' ? (
              <TeacherAttendanceForm />
            ) : activeTeacherSection === 'attendanceView' ? (
              <TeacherAttendanceView />
            ) : activeTeacherSection === 'performance' ? (
              <TeacherPerformanceForm />
            ) : (
              <TeacherPerformanceView />
            )}
          </>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-lg font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Teachers</p>
              <p className="text-lg font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Attendance</p>
              <p className="text-lg font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Performance Reviews</p>
              <p className="text-lg font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddInfo;