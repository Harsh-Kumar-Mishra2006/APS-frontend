// src/pages/AdmissionsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const AdmissionsList = () => {
  const { isAdmin } = useAdminAuth();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    academicYear: '',
    forClass: '',
    isActive: 'true',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAdmissions();
  }, [filters]);

  const fetchAdmissions = async () => {
    try {
      const params = new URLSearchParams({
        academicYear: filters.academicYear,
        forClass: filters.forClass,
        isActive: filters.isActive,
        page: filters.page,
        limit: filters.limit
      });

      const response = await api.get(`/admissions?${params}`);
      
      if (response.data.success) {
        setAdmissions(response.data.data);
        const total = response.data.total || 0;
        setTotalPages(Math.ceil(total / filters.limit));
      } else {
        toast.error('Failed to load admissions');
      }
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast.error(error.response?.data?.error || 'Failed to load admissions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this admission?')) {
      return;
    }

    try {
      const response = await api.delete(`/admissions/${id}`);
      if (response.data.success) {
        toast.success('Admission deactivated successfully');
        fetchAdmissions(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting admission:', error);
      toast.error(error.response?.data?.error || 'Failed to deactivate');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admissions</h1>
        {isAdmin && (
          <Link
            to="/admissions/create"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            + Create New Admission
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <select
              value={filters.academicYear}
              onChange={(e) => handleFilterChange('academicYear', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {['2024-25', '2025-26', '2026-27', '2027-28'].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={filters.forClass}
              onChange={(e) => handleFilterChange('forClass', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
              <option value="">All</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admissions Grid */}
      {admissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No admissions found</h3>
          <p className="text-gray-600 mb-4">Try changing your filters or create a new admission.</p>
          {isAdmin && (
            <Link
              to="/admissions/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Create First Admission
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {admissions.map(admission => (
              <div key={admission._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admission.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admission.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="text-sm text-gray-500">
                      {formatDate(admission.createdAt)}
                    </div>
                  </div>
                  
                  {/* Title and Course */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {admission.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{admission.courseName}</p>
                  
                  {/* Class and Stream */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Class {admission.forClass}
                    </span>
                    {admission.stream && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {admission.stream}
                      </span>
                    )}
                  </div>
                  
                  {/* Important Dates */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Application:</span>{' '}
                      {formatDate(admission.dates.applicationStart)} - {formatDate(admission.dates.applicationEnd)}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Exam:</span>{' '}
                      {formatDate(admission.dates.examDate)}
                    </div>
                  </div>
                  
                  {/* Fees and Seats */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(admission.fees.monthlyFee)}/month
                      </div>
                      <div className="text-sm text-gray-600">
                        Admission: {formatCurrency(admission.fees.admissionFee)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {admission.seats.available}/{admission.seats.total}
                      </div>
                      <div className="text-sm text-gray-600">Seats available</div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/admissions/${admission._id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      View Details
                    </Link>
                    
                    {isAdmin && (
                      <>
                        <Link
                          to={`/admissions/edit/${admission._id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(admission._id)}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handleFilterChange('page', page)}
                  className={`px-4 py-2 rounded-md ${
                    filters.page === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={filters.page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdmissionsList;