// src/components/fee/AllFeesView.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Loader, Search, Filter, Download, Eye, DollarSign, 
  Calendar, CheckCircle, AlertCircle, Clock, X, 
  Edit2, CreditCard, TrendingUp, Users, Wallet 
} from 'lucide-react';

const AllFeesView = ({ userRole, onAddPayment }) => {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    status: 'all',
    year: new Date().getFullYear()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    totalFees: 0,
    totalPaid: 0,
    totalDue: 0,
    totalRecords: 0
  });

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const statuses = ['all', 'Pending', 'Partially Paid', 'Paid', 'Overdue'];
  const years = [2023, 2024, 2025, 2026, 2027];
  const paymentModes = ['Cash', 'Cheque', 'Bank Transfer', 'Card', 'Online'];

  useEffect(() => {
    fetchAllFees();
  }, [filters]);

  const fetchAllFees = async () => {
    setLoading(true);
    try {
      let url = 'fee/all';
      const queryParams = [];
      
      if (filters.class) queryParams.push(`class=${filters.class}`);
      if (filters.section) queryParams.push(`section=${filters.section}`);
      if (filters.status !== 'all') queryParams.push(`status=${filters.status}`);
      if (filters.year) queryParams.push(`year=${filters.year}`);
      
      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }
      
      const response = await api.get(url);
      console.log('API Response:', response.data); // Debug log
      
      if (response.data.success) {
        setFees(response.data.data);
        applyFilters(response.data.data, searchTerm);
        
        // Handle summary - check both camelCase and snake_case
        if (response.data.summary) {
          const summaryData = response.data.summary;
          setSummary({
            totalFees: summaryData.totalAmount || summaryData.total_fees || 0,
            totalPaid: summaryData.totalPaid || summaryData.total_collected || 0,
            totalDue: summaryData.totalDue || summaryData.total_due || 0,
            totalRecords: response.data.count || response.data.data?.length || 0
          });
        } else {
          calculateSummary(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (feeList, search) => {
    let filtered = [...feeList];
    
    if (search) {
      filtered = filtered.filter(fee =>
        fee.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        fee.studentEmail?.toLowerCase().includes(search.toLowerCase()) ||
        fee.class?.toLowerCase().includes(search.toLowerCase()) ||
        fee.rollNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredFees(filtered);
  };

  const calculateSummary = (feeList) => {
    const totalFees = feeList.reduce((sum, fee) => sum + parseFloat(fee.totalAmount || 0), 0);
    const totalPaid = feeList.reduce((sum, fee) => sum + parseFloat(fee.totalPaid || 0), 0);
    const totalDue = feeList.reduce((sum, fee) => sum + parseFloat(fee.balanceAmount || 0), 0);
    
    setSummary({
      totalFees,
      totalPaid,
      totalDue,
      totalRecords: feeList.length
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(fees, value);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      const response = await api.post(`fee/payment/${selectedFee.id}`, {
        amount: parseFloat(paymentAmount),
        mode: paymentMode,
        remarks: `Payment collected via ${paymentMode}`
      });

      if (response.data.success) {
        alert('Payment added successfully!');
        setShowPaymentModal(false);
        setPaymentAmount('');
        fetchAllFees();
        setSelectedFee(null);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add payment');
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially paid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Class', 'Section', 'Roll No', 'Month', 'Year', 'Total Amount', 'Paid', 'Balance', 'Status', 'Due Date'];
    const csvData = filteredFees.map(fee => [
      fee.studentName,
      fee.studentEmail,
      fee.class,
      fee.section,
      fee.rollNumber,
      fee.feeMonth,
      fee.feeYear,
      fee.totalAmount,
      fee.totalPaid,
      fee.balanceAmount,
      fee.status,
      fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : ''
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Records</p>
              <p className="text-2xl font-bold">{summary.totalRecords || 0}</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Fees</p>
              <p className="text-2xl font-bold">₹{(summary.totalFees || 0).toLocaleString()}</p>
            </div>
            <Wallet className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Collected</p>
              <p className="text-2xl font-bold">₹{(summary.totalPaid || 0).toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Due</p>
              <p className="text-2xl font-bold">₹{(summary.totalDue || 0).toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name, email, class, roll..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class/Section</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Paid</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFees.map((fee) => (
              <tr key={fee.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{fee.studentName}</p>
                  <p className="text-xs text-gray-500">{fee.studentEmail}</p>
                  <p className="text-xs text-gray-500">Roll: {fee.rollNumber}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{fee.class}</p>
                  <p className="text-sm text-gray-500">Section: {fee.section}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{fee.feeMonth}</p>
                  <p className="text-xs text-gray-500">{fee.feeYear}</p>
                </td>
                <td className="px-4 py-3 text-right font-semibold">₹{parseFloat(fee.totalAmount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600 font-medium">₹{parseFloat(fee.totalPaid || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600 font-medium">₹{parseFloat(fee.balanceAmount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(fee.status)}`}>
                    {getStatusIcon(fee.status)}
                    {fee.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedFee(fee)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {fee.status !== 'Paid' && (
                      <button
                        onClick={() => {
                          setSelectedFee(fee);
                          setShowPaymentModal(true);
                        }}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Add Payment"
                      >
                        <CreditCard className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredFees.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl mt-4">
          No fee records found matching your criteria.
        </div>
      )}

      {/* Fee Details Modal */}
      {selectedFee && !showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Fee Details</h3>
              <button onClick={() => setSelectedFee(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Student Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedFee.studentName}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedFee.studentEmail}</p>
                  <p><span className="text-gray-500">Class:</span> {selectedFee.class} {selectedFee.section}</p>
                  <p><span className="text-gray-500">Roll Number:</span> {selectedFee.rollNumber}</p>
                </div>
              </div>
              
              {/* Fee Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Fee Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Period:</span> {selectedFee.feeMonth}</p>
                  <p><span className="text-gray-500">Year:</span> {selectedFee.feeYear}</p>
                  <p><span className="text-gray-500">Due Date:</span> {selectedFee.dueDate ? new Date(selectedFee.dueDate).toLocaleDateString() : 'N/A'}</p>
                  <p><span className="text-gray-500">Status:</span> 
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedFee.status)}`}>
                      {getStatusIcon(selectedFee.status)}
                      {selectedFee.status}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Fee Components */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Fee Breakdown</h4>
                <div className="space-y-2">
                  {selectedFee.feeComponents?.map((component, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1 border-b">
                      <span>{component.name}</span>
                      <span className="font-semibold">₹{parseFloat(component.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total Amount</span>
                    <span>₹{parseFloat(selectedFee.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment History */}
              {selectedFee.payments && selectedFee.payments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Payment History</h4>
                  <div className="space-y-2">
                    {selectedFee.payments.map((payment, idx) => (
                      <div key={idx} className="flex justify-between text-sm border-b pb-2">
                        <div>
                          <p className="font-medium">{payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</p>
                          <p className="text-xs text-gray-500">Mode: {payment.mode}</p>
                          {payment.receiptNo && <p className="text-xs text-gray-500">Receipt: {payment.receiptNo}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">₹{parseFloat(payment.amount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Payment Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">₹{parseFloat(selectedFee.totalPaid || 0).toLocaleString()}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Balance Due</p>
                  <p className="text-2xl font-bold text-red-600">₹{parseFloat(selectedFee.balanceAmount || 0).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Remarks */}
              {selectedFee.remarks && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Remarks</p>
                  <p className="text-sm mt-1">{selectedFee.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Add Payment</h3>
              <button onClick={() => {
                setShowPaymentModal(false);
                setSelectedFee(null);
              }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Student</p>
                <p className="font-semibold">{selectedFee.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Balance Due</p>
                <p className="text-2xl font-bold text-red-600">₹{parseFloat(selectedFee.balanceAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {paymentModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddPayment}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllFeesView;