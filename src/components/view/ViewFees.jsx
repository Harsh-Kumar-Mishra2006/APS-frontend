import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { X, Loader, DollarSign, Calendar, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react';

const ViewFees = ({ onClose, studentId: propStudentId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      let studentId = propStudentId;
      
      // If no studentId provided, get current user's student ID
      if (!studentId && user.role === 'student') {
        const response = await api.get('auth/profile');
        if (response.data.success && response.data.data.student) {
          studentId = response.data.data.student.id;
        }
      }
      
      if (!studentId) {
        setError('Student ID not found');
        setLoading(false);
        return;
      }
      
      const response = await api.get(`fee/student/${studentId}`);
      if (response.data.success) {
        setFeeData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch fee records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">💰 Fee Records</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {feeData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90">Total Fees</p>
              <p className="text-2xl font-bold">₹{feeData.summary.total_fees.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90">Total Paid</p>
              <p className="text-2xl font-bold">₹{feeData.summary.total_paid.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90">Total Due</p>
              <p className="text-2xl font-bold">₹{feeData.summary.total_due.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90">Payment Status</p>
              <p className="text-lg font-bold">
                {feeData.summary.paid_count} Paid / {feeData.summary.pending_count + feeData.summary.overdue_count} Pending
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Student Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <p><span className="text-gray-500">Name:</span> {feeData.student.name}</p>
              <p><span className="text-gray-500">Class:</span> {feeData.student.class} {feeData.student.section}</p>
              <p><span className="text-gray-500">Roll Number:</span> {feeData.student.rollNumber}</p>
              <p><span className="text-gray-500">Student ID:</span> {feeData.student.id}</p>
            </div>
          </div>

          {/* Fee Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Paid</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Balance</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feeData.fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{fee.fee_month_from} - {fee.fee_month_to}</p>
                      <p className="text-xs text-gray-500">{fee.fee_year}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{parseFloat(fee.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-600">₹{parseFloat(fee.amount_paid).toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600">₹{parseFloat(fee.balance_due).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{new Date(fee.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(fee.status)}`}>
                        {getStatusIcon(fee.status)}
                        {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedFee(fee)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {feeData.fees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No fee records found.
            </div>
          )}
        </>
      )}

      {/* Fee Details Modal */}
      {selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Fee Details</h3>
              <button onClick={() => setSelectedFee(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p><span className="text-gray-500">Period:</span> {selectedFee.fee_month_from} - {selectedFee.fee_month_to}</p>
                <p><span className="text-gray-500">Year:</span> {selectedFee.fee_year}</p>
                <p><span className="text-gray-500">Due Date:</span> {new Date(selectedFee.due_date).toLocaleDateString()}</p>
                <p><span className="text-gray-500">Status:</span> 
                  <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedFee.status)}`}>
                    {getStatusIcon(selectedFee.status)}
                    {selectedFee.status}
                  </span>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Fee Particulars</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {Array.isArray(selectedFee.particulars) && selectedFee.particulars.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.description}</span>
                      <span className="font-semibold">₹{parseFloat(item.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{parseFloat(selectedFee.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-xl font-bold text-green-600">₹{parseFloat(selectedFee.amount_paid).toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Balance Due</p>
                  <p className="text-xl font-bold text-red-600">₹{parseFloat(selectedFee.balance_due).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedFee.remarks && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Remarks</p>
                  <p className="text-sm">{selectedFee.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewFees;