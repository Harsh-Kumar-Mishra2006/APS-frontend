import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Plus, Eye, Loader, X, CheckCircle, GraduationCap, Users } from 'lucide-react';
import AddResultForm from '../../components/form/AddResultForm';
import ViewResults from '../../components/view/ViewResults';
import CreateExamForm from '../../components/form/CreateExamForm';

const ResultManagement = () => {
  const { user, loading, authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'view', 'exams'
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resultData, setResultData] = useState(null);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access result management.</p>
        </div>
      </div>
    );
  }

  const handleSuccess = (message, result) => {
    setSuccessMessage(message);
    setResultData(result);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Exam & Result Management</h1>
          <p className="text-gray-600 mt-2">
            Manage exams, add student results, and publish to student/parent portals
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            Administrator Access - Full Control
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
                </div>
                <button onClick={() => setShowSuccess(false)} className="ml-2 text-green-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('add')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'add'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Result
              </button>
              <button
                onClick={() => setActiveTab('exams')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'exams'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Manage Exams
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'view'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                View All Results
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <AddResultForm onSuccess={handleSuccess} />
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <CreateExamForm onSuccess={handleSuccess} />
          </div>
        )}

        {activeTab === 'view' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ViewResults />
          </div>
        )}
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