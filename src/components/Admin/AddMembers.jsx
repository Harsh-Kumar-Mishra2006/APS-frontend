// src/components/admin/AddMembers.jsx (UPDATED WITH ADMISSIONS)
import React, { useState } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import AddTeacherForm from '../form/AddTeacherForm';
import AddParentForm from '../form/addParentForm';
import AddStudentForm from '../form/addStudentForm';
import AddAdmissionForm from '../form/AddAdmissionForm'; // Add this import
import TeacherView from '../view/teacherView';
import ParentView from '../view/parentView';
import StudentView from '../view/studentView';
import AdmissionsView from '../view/addAdmissionView'; // Add this import

const AddMembers = () => {
  const { hasAccess, loading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('admissions'); // Default to admissions
  const [refreshTeachers, setRefreshTeachers] = useState(0);
  const [refreshParents, setRefreshParents] = useState(0);
  const [refreshStudents, setRefreshStudents] = useState(0);
  const [refreshAdmissions, setRefreshAdmissions] = useState(0); // Add this state

  const handleTeacherAdded = () => {
    setRefreshTeachers(prev => prev + 1);
  };

  const handleParentAdded = () => {
    setRefreshParents(prev => prev + 1);
  };

  const handleStudentAdded = () => {
    setRefreshStudents(prev => prev + 1);
  };

  const handleAdmissionAdded = () => {
    setRefreshAdmissions(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            School Management Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage admissions, teachers, parents, and students for Achievement Public School
          </p>
        </div>

        {/* Portal Cards - Updated with 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Admissions Portal - NEW */}
          <div 
            className={`bg-white rounded-2xl shadow-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 ${
              activeTab === 'admissions' ? 'border-orange-500 ring-4 ring-orange-100' : 'border-gray-200 hover:border-orange-300'
            }`}
            onClick={() => setActiveTab('admissions')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Admissions</h3>
              <p className="text-sm text-gray-600">Create and manage admission courses</p>
              <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
                New
              </span>
            </div>
          </div>

          {/* Teachers Portal */}
          <div 
            className={`bg-white rounded-2xl shadow-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 ${
              activeTab === 'teachers' ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setActiveTab('teachers')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l-9 5m9-5v6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Teachers</h3>
              <p className="text-sm text-gray-600">Register and manage teaching staff</p>
            </div>
          </div>

          {/* Parents Portal */}
          <div 
            className={`bg-white rounded-2xl shadow-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 ${
              activeTab === 'parents' ? 'border-green-500 ring-4 ring-green-100' : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={() => setActiveTab('parents')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Parents</h3>
              <p className="text-sm text-gray-600">Register and manage parent accounts</p>
            </div>
          </div>

          {/* Students Portal */}
          <div 
            className={`bg-white rounded-2xl shadow-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 ${
              activeTab === 'students' ? 'border-purple-500 ring-4 ring-purple-100' : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => setActiveTab('students')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.663 0-1.313.103-1.924.296M12 4.354A4 4 0 0012 14m0 0a4 4 0 004-4m-4 4a4 4 0 01-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Students</h3>
              <p className="text-sm text-gray-600">Register and manage student profiles</p>
            </div>
          </div>
        </div>

        {/* Active Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Admissions Tab */}
          {activeTab === 'admissions' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Admission Management</h2>
                  <p className="text-gray-600 mt-1">Create and manage admission courses for different classes</p>
                </div>
                <button
                  onClick={() => document.getElementById('admission-form').scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Admission
                </button>
              </div>

              <div id="admission-form" className="mb-8">
                <AddAdmissionForm onAdmissionAdded={handleAdmissionAdded} />
              </div>

              <div>
                <AdmissionsView refreshTrigger={refreshAdmissions} />
              </div>
            </div>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
                <button
                  onClick={() => document.getElementById('teacher-form').scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Add New Teacher
                </button>
              </div>

              <div id="teacher-form" className="mb-8">
                <AddTeacherForm onTeacherAdded={handleTeacherAdded} />
              </div>

              <div>
                <TeacherView refreshTrigger={refreshTeachers} />
              </div>
            </div>
          )}

          {/* Parents Tab */}
          {activeTab === 'parents' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Parent Management</h2>
                <button
                  onClick={() => document.getElementById('parent-form').scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Add New Parent
                </button>
              </div>

              <div id="parent-form" className="mb-8">
                <AddParentForm onParentAdded={handleParentAdded} />
              </div>

              <div>
                <ParentView refreshTrigger={refreshParents} />
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
                <button
                  onClick={() => document.getElementById('student-form').scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Add New Student
                </button>
              </div>

              <div id="student-form" className="mb-8">
                <AddStudentForm onStudentAdded={handleStudentAdded} />
              </div>

              <div>
                <StudentView refreshTrigger={refreshStudents} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMembers;