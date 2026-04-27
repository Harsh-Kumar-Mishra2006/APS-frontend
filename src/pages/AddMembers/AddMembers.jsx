// src/pages/AddMembers.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AddStudentForm from '../components/forms/AddStudentForm';
import AddTeacherForm from '../components/forms/AddTeacherForm';
import AddParentForm from '../components/forms/AddParentForm';
import { UserPlus, GraduationCap, ChalkboardUser, Users, X, CheckCircle } from 'lucide-react';

const AddMembers = () => {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState(null); // 'student', 'teacher', 'parent'
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Check if user is admin
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

  const handleSuccess = (message, password) => {
    setSuccessMessage(message);
    setGeneratedPassword(password);
    setShowSuccess(true);
    setActiveForm(null);
    
    // Auto hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const formComponents = {
    student: <AddStudentForm onSuccess={handleSuccess} onCancel={() => setActiveForm(null)} />,
    teacher: <AddTeacherForm onSuccess={handleSuccess} onCancel={() => setActiveForm(null)} />,
    parent: <AddParentForm onSuccess={handleSuccess} onCancel={() => setActiveForm(null)} />
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Members</h1>
          <p className="text-gray-600 mt-2">
            Add students, teachers, and parents to the school management system
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            Only Administrators can add new members
          </div>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg max-w-md">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Success!</p>
                  <p className="text-sm">{successMessage}</p>
                  {generatedPassword && (
                    <div className="mt-2 bg-white rounded p-2 border border-green-300">
                      <p className="text-xs font-mono">
                        <strong>Temporary Password:</strong> {generatedPassword}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        ⚠️ Please share this password with the user. They will need to change it on first login.
                      </p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="ml-2 text-green-700 hover:text-green-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selection Cards - Show when no form is active */}
        {!activeForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Student Card */}
            <button
              onClick={() => setActiveForm('student')}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-left group"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <GraduationCap className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Add Student</h3>
              <p className="text-gray-600 text-center text-sm">
                Register new students with their academic details, class, section, and personal information
              </p>
              <div className="mt-4 flex justify-center">
                <span className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Student
                </span>
              </div>
            </button>

            {/* Add Teacher Card */}
            <button
              onClick={() => setActiveForm('teacher')}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-left group"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                  <ChalkboardUser className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Add Teacher</h3>
              <p className="text-gray-600 text-center text-sm">
                Register new teachers with their qualifications, specialization, and professional details
              </p>
              <div className="mt-4 flex justify-center">
                <span className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Teacher
                </span>
              </div>
            </button>

            {/* Add Parent Card */}
            <button
              onClick={() => setActiveForm('parent')}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-left group"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                  <Users className="w-12 h-12 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Add Parent</h3>
              <p className="text-gray-600 text-center text-sm">
                Register parents/guardians and link them to their children in the system
              </p>
              <div className="mt-4 flex justify-center">
                <span className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Parent
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Active Form */}
        {activeForm && (
          <div className="mt-8">
            {formComponents[activeForm]}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddMembers;