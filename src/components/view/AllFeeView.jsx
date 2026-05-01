import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader, Search, Filter, Download, Eye, DollarSign, Calendar, CheckCircle, AlertCircle, Clock, X, Edit2 } from 'lucide-react';

const AllFeesView = ({ userRole }) => {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    status: 'all',
    year: new Date().getFullYear()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    total_fees: 0,
    total_collected: 0,
    total_due: 0,
    total_records: 0
  });

  const classes = ['Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const sections = ['A', 'B', 'C', 'D'];
  const statuses = ['all', 'pending', 'partial', 'paid', 'overdue'];
  const years = [2023, 2024, 2025, 2026];

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
      if (response.data.success) {
        setFees(response.data.data);
        applyFilters(response.data.data, searchTerm);
        calculateSummary(response.data.data);
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
        fee.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        fee.student_email?.toLowerCase().includes(search.toLowerCase()) ||
        fee.class?.toLowerCase().includes(search.toLowerCase()) ||
        fee.roll_number?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredFees(filtered);
  };

  const calculateSummary = (feeList) => {
    const total_fees = feeList.reduce((sum, fee) => sum + parseFloat(fee.total_amount || 0), 0);
    const total_collected = feeList.reduce((sum, fee) => sum + parseFloat(fee.amount_paid || 0), 0);
    const total_due = feeList.reduce((sum, fee) => sum + parseFloat(fee.balance_due || 0), 0);
    
    setSummary({
      total_fees,
      total_collected,
      total_due,
      total_records: feeList.length
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

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Class', 'Section', 'Roll No', 'Period', 'Year', 'Total Amount', 'Paid', 'Balance', 'Status', 'Due Date'];
    const csvData = filteredFees.map(fee => [
      fee.student_name,
      fee.student_email,
      fee.class,
      fee.section,
      fee.roll_number,
      `${fee.fee_month_from} - ${fee.fee_month_to}`,
      fee.fee_year,
      fee.total_amount,
      fee.amount_paid,
      fee.balance_due,
      fee.status,
      new Date(fee.due_date).toLocaleDateString()
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Records</p>
          <p className="text-2xl font-bold">{summary.total_records}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Fees</p>
          <p className="text-2xl font-bold">₹{summary.total_fees.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Collected</p>
          <p className="text-2xl font-bold">₹{summary.total_collected.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Due</p>
          <p className="text-2xl font-bold">₹{summary.total_due.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
              {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
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
              <tr key={fee.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{fee.student_name}</p>
                  <p className="text-xs text-gray-500">{fee.student_email}</p>
                  <p className="text-xs text-gray-500">Roll: {fee.roll_number}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{fee.class}</p>
                  <p className="text-sm text-gray-500">Section: {fee.section}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{fee.fee_month_from} - {fee.fee_month_to}</p>
                  <p className="text-xs text-gray-500">{fee.fee_year}</p>
                </td>
                <td className="px-4 py-3 text-right font-semibold">₹{parseFloat(fee.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-600">₹{parseFloat(fee.amount_paid).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">₹{parseFloat(fee.balance_due).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{new Date(fee.due_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(fee.status)}`}>
                    {getStatusIcon(fee.status)}
                    {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedFee(fee)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredFees.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No fee records found matching your criteria.
        </div>
      )}

      {/* Fee Details Modal */}
      {selectedFee && (
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
                  <p><span className="text-gray-500">Name:</span> {selectedFee.student_name}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedFee.student_email}</p>
                  <p><span className="text-gray-500">Class:</span> {selectedFee.class} {selectedFee.section}</p>
                  <p><span className="text-gray-500">Roll Number:</span> {selectedFee.roll_number}</p>
                </div>
              </div>
              
              {/* Fee Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Fee Information</h4>
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
              </div>
              
              {/* Fee Particulars */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Fee Breakdown</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedFee.particulars) && selectedFee.particulars.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span>{item.description}</span>
                      <span className="font-semibold">₹{parseFloat(item.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total Amount</span>
                    <span>₹{parseFloat(selectedFee.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">₹{parseFloat(selectedFee.amount_paid).toLocaleString()}</p>
                  {selectedFee.payment_mode && (
                    <p className="text-xs text-gray-500 mt-1">Mode: {selectedFee.payment_mode}</p>
                  )}
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Balance Due</p>
                  <p className="text-2xl font-bold text-red-600">₹{parseFloat(selectedFee.balance_due).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Remarks */}
              {selectedFee.remarks && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Remarks</p>
                  <p className="text-sm mt-1">{selectedFee.remarks}</p>
                </div>
              )}
              
              {/* Timestamps */}
              <div className="text-xs text-gray-400 border-t pt-3">
                <p>Added on: {new Date(selectedFee.createdAt).toLocaleString()}</p>
                {selectedFee.updatedAt && selectedFee.updatedAt !== selectedFee.createdAt && (
                  <p>Last updated: {new Date(selectedFee.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllFeesView;