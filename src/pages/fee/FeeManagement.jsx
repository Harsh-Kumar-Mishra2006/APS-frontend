import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, Plus, Eye, Loader, X, CheckCircle } from 'lucide-react';
import AddFeeForm from '../../components/form/AddFeeForm';
import AllFeesView from '../../components/view/AllFeeView';

const FeeManagement = () => {
  const { user, loading, authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'view'
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [feeData, setFeeData] = useState(null);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators and teachers can access fee management.</p>
        </div>
      </div>
    );
  }

  const handleSuccess = (message, feeRecord) => {
    setSuccessMessage(message);
    setFeeData(feeRecord);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💰 Fee Management System</h1>
          <p className="text-gray-600 mt-2">
            Manage student fees, track payments, and view fee records
          </p>
          {user.role === 'admin' && (
            <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Administrator Access - Full Control
            </div>
          )}
          {user.role === 'teacher' && (
            <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Teacher Access - View Only
            </div>
          )}
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
                  {feeData && (
                    <div className="mt-2 bg-white rounded p-2 border border-green-300">
                      <p className="text-xs font-semibold">Fee Details:</p>
                      <p className="text-xs">Amount: ₹{feeData.total_amount}</p>
                      <p className="text-xs">Due Date: {new Date(feeData.due_date).toLocaleDateString()}</p>
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('add')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'add'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Fee Record
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'view'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                View All Fee Records
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'add' && user.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <AddFeeForm onSuccess={handleSuccess} />
          </div>
        )}

        {activeTab === 'add' && user.role !== 'admin' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-yellow-600 text-4xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
            <p className="text-yellow-700">Only administrators can add fee records.</p>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <AllFeesView userRole={user.role} />
          </div>
        )}
      </div>

      <style>{`
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

export default FeeManagement;