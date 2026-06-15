// src/components/admission/AdminAdmissionList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { 
  Eye, CheckCircle, XCircle, Clock, AlertCircle, 
  Search, Filter, Download, Loader, FileText, 
  Calendar, Users, BookOpen, TrendingUp
} from 'lucide-react';

const AdminAdmissionList = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    applyingForClass: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 20
  });

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Under Review': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Documents Required': 'bg-orange-100 text-orange-800',
    'Admission Confirmed': 'bg-purple-100 text-purple-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await api.get('admissions/admin/all', { params });
      
      if (response.data.success) {
        setApplications(response.data.data);
        setStats(response.data.statistics);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (id, newStatus, remarks) => {
    try {
      const response = await api.put(`admissions/admin/${id}/status`, {
        status: newStatus,
        remarks
      });
      
      if (response.data.success) {
        fetchApplications();
        if (selectedApp?.id === id) {
          setSelectedApp(null);
        }
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const exportToCSV = () => {
    const headers = ['App No.', 'Student Name', 'Class', 'Status', 'Submitted Date', 'Email', 'Phone'];
    const csvData = applications.map(app => [
      app.applicationNumber,
      app.studentName,
      app.applyingForClass,
      app.status,
      new Date(app.submittedAt).toLocaleDateString(),
      app.email,
      app.phoneNumber
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admissions_${new Date().toISOString().split('T')[0]}.csv`;
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admission Management</h1>
            <p className="text-sm opacity-80">Manage and process student applications</p>
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.underReview || 0}</p>
            <p className="text-xs text-gray-500">Review</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.confirmed || 0}</p>
            <p className="text-xs text-gray-500">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
            <p className="text-xs text-gray-500">Rejected</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              {Object.keys(statusColors).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={filters.applyingForClass}
              onChange={(e) => setFilters({ ...filters, applyingForClass: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Classes</option>
              {['Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Search by name, application number, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">App No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Class</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Submitted</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{app.applicationNumber}</td>
                  <td className="px-4 py-3 font-medium">{app.studentName}</td>
                  <td className="px-4 py-3 text-center">{app.applyingForClass}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedApp(app)}
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
        
        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No applications found
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Application Details</h3>
                <p className="text-sm text-gray-500 font-mono">{selectedApp.applicationNumber}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Status Update Section */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">Update Application Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Under Review', 'Approved', 'Documents Required', 'Admission Confirmed', 'Rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedApp.id, status, prompt('Add remarks (optional):') || '')}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        selectedApp.status === status 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-purple-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Personal Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Student Name:</span> {selectedApp.studentName}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedApp.phoneNumber}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedApp.email}</p>
                  <p><span className="text-gray-500">Age:</span> {selectedApp.age}</p>
                  <p><span className="text-gray-500">Gender:</span> {selectedApp.gender}</p>
                  <p><span className="text-gray-500">DOB:</span> {new Date(selectedApp.dateOfBirth).toLocaleDateString()}</p>
                  <p><span className="text-gray-500">Father:</span> {selectedApp.fatherName}</p>
                  <p><span className="text-gray-500">Mother:</span> {selectedApp.motherName}</p>
                  <p><span className="text-gray-500">Parent Phone:</span> {selectedApp.parentPhone}</p>
                  <p><span className="text-gray-500">Address:</span> {selectedApp.address}, {selectedApp.city}, {selectedApp.state} - {selectedApp.pincode}</p>
                </div>
              </div>

              {/* Academic Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Academic Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Applying For:</span> {selectedApp.applyingForClass}</p>
                  <p><span className="text-gray-500">Previous School:</span> {selectedApp.previousSchool || 'N/A'}</p>
                  <p><span className="text-gray-500">Previous Class:</span> {selectedApp.previousClass || 'N/A'}</p>
                  <p><span className="text-gray-500">Previous Percentage:</span> {selectedApp.previousPercentage || 'N/A'}%</p>
                  {selectedApp.preferredSubjects?.length > 0 && (
                    <p className="col-span-2"><span className="text-gray-500">Preferred Subjects:</span> {selectedApp.preferredSubjects.join(', ')}</p>
                  )}
                  {selectedApp.previousAchievements && (
                    <p className="col-span-2"><span className="text-gray-500">Achievements:</span> {selectedApp.previousAchievements}</p>
                  )}
                </div>
              </div>

              {/* Remarks */}
              {selectedApp.remarks && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-semibold">Admin Remarks:</span> {selectedApp.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmissionList;