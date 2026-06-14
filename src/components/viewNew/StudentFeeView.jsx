// src/components/student/StudentFeeView.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Wallet, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader,
  TrendingUp,
  IndianRupee
} from 'lucide-react';

const StudentFeeView = ({ studentId, userRole }) => {
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const statuses = ['all', 'Paid', 'Pending', 'Partially Paid', 'Overdue'];

  useEffect(() => {
    if (studentId) {
      fetchFeeRecords();
    }
  }, [studentId, selectedYear, selectedStatus]);

  const fetchFeeRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedYear) params.year = selectedYear;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      
      const response = await api.get(`fees/student/${studentId}`, { params });
      
      if (response.data.success) {
        setFeeData(response.data.data);
      } else {
        setError('Failed to fetch fee records');
      }
    } catch (err) {
      console.error('Fee fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch fee records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Paid: { icon: CheckCircle, text: 'Paid', class: 'bg-green-100 text-green-700' },
      Pending: { icon: Clock, text: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
      'Partially Paid': { icon: AlertCircle, text: 'Partially Paid', class: 'bg-blue-100 text-blue-700' },
      Overdue: { icon: AlertCircle, text: 'Overdue', class: 'bg-red-100 text-red-700' }
    };
    const badge = badges[status] || badges.Pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportToCSV = () => {
    if (!feeData?.fees.length) return;
    
    const headers = ['Fee Month', 'Year', 'Total Amount', 'Amount Paid', 'Balance', 'Status', 'Due Date'];
    const csvData = feeData.fees.map(fee => [
      fee.feeMonth,
      fee.feeYear,
      fee.totalAmount,
      fee.totalPaid,
      fee.balanceAmount,
      fee.status,
      new Date(fee.dueDate).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_records_${studentId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!feeData) return null;

  const { student, fees, summary } = feeData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Fee Management</h1>
            <p className="text-sm opacity-80">Track your fee payments and dues</p>
          </div>
          {fees.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.total_fees)}</p>
          <p className="text-xs text-gray-500">Total Fees</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs text-gray-400">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_paid)}</p>
          <p className="text-xs text-gray-500">Total Paid</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-xs text-gray-400">Due</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_due)}</p>
          <p className="text-xs text-gray-500">Total Due</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-gray-400">Completion</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {summary.total_fees > 0 ? ((summary.total_paid / summary.total_fees) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-gray-500">Payment Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status === 'all' ? 'All' : status}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchFeeRecords}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Fee Records Table */}
      {fees.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No fee records found for the selected criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Paid</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.map((fee, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{fee.feeMonth}</p>
                      <p className="text-xs text-gray-500">{fee.feeYear}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(fee.totalAmount)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(fee.totalPaid)}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">{formatCurrency(fee.balanceAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${new Date(fee.dueDate) < new Date() && fee.status !== 'Paid' ? 'text-red-600' : 'text-gray-600'}`}>
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(fee.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedRecord(fee)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fee Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Fee Details</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <p className="font-semibold">{selectedRecord.feeMonth} {selectedRecord.feeYear}</p>
                <p className="text-sm text-gray-600">Due Date: {new Date(selectedRecord.dueDate).toLocaleDateString()}</p>
              </div>
              
              {/* Fee Components */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Fee Components</h4>
                <div className="space-y-2">
                  {selectedRecord.feeComponents.map((component, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{component.name}</span>
                      <span className="font-medium">{formatCurrency(component.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedRecord.totalAmount)}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment History */}
              {selectedRecord.payments && selectedRecord.payments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {selectedRecord.payments.map((payment, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                          <span className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Mode: {payment.mode}</span>
                          {payment.receiptNo && <span className="text-gray-500">Receipt: {payment.receiptNo}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRecord.remarks && (
                <div className="mt-4 bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">{selectedRecord.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeView;