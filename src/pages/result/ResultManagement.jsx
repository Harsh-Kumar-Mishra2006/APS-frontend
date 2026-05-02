import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Plus, Eye, Loader, X, CheckCircle, GraduationCap, Calendar, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import AddResultForm from '../../components/form/AddResultForm';
import ViewResults from '../../components/view/ViewResults';
import CreateExamForm from '../../components/form/CreateExamForm';

const ResultManagement = () => {
  const { user, loading, authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('add');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-pulse"></div>
            <Loader className="w-12 h-12 animate-spin text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading Result Dashboard...</p>
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
          <p className="text-gray-600 mb-6">Only administrators can access result management.</p>
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
    { id: 'add', label: 'Add Result', icon: Plus, color: 'purple', description: 'Add student exam results' },
    { id: 'exams', label: 'Manage Exams', icon: GraduationCap, color: 'blue', description: 'Create and manage exams' },
    { id: 'view', label: 'View Results', icon: Eye, color: 'green', description: 'View all published results' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Exam & Result Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">📊 Results Dashboard</h1>
              <p className="text-lg text-purple-100 max-w-2xl">
                Manage exams, add student results, and publish to student/parent portals
              </p>
            </div>
            
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const colorGradients = {
              purple: 'from-purple-500 to-purple-600',
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600'
            };
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                  ${isActive ? `bg-gradient-to-r ${colorGradients[tab.color]} text-white shadow-xl scale-105 ring-2 ring-white ring-opacity-50` : 'bg-white text-gray-700 hover:shadow-lg border border-gray-100'}
                `}
              >
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
                  <p className={`text-sm ${isActive ? 'text-purple-100' : 'text-gray-500'}`}>
                    {tab.description}
                  </p>
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

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-20 right-4 z-50 animate-slide-in">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg max-w-md">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Success!</p>
                  <p className="text-sm">{successMessage}</p>
                </div>
                <button onClick={() => setShowSuccess(false)} className="ml-2 text-green-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse bg-${tabs.find(t => t.id === activeTab)?.color}-500`}></div>
              <span className="text-sm font-medium text-gray-600">
                {activeTab === 'add' && 'Adding New Student Result'}
                {activeTab === 'exams' && 'Managing Exams'}
                {activeTab === 'view' && 'Viewing Results'}
              </span>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            {activeTab === 'add' && <AddResultForm onSuccess={(msg) => { setSuccessMessage(msg); setShowSuccess(true); }} />}
            {activeTab === 'exams' && <CreateExamForm onSuccess={(msg) => { setSuccessMessage(msg); setShowSuccess(true); }} />}
            {activeTab === 'view' && <ViewResults />}
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Calendar className="w-3 h-3" />
            Results are automatically published to student and parent portals
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ResultManagement;