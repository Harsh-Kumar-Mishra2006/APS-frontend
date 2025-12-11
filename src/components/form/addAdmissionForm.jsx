// src/components/forms/AddAdmissionForm.jsx
import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddAdmissionForm = ({ onAdmissionAdded }) => {
  const { hasAccess, loading, user } = useAdminAuth();
  const [submitting, setSubmitting] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [academicYears] = useState(['2024-25', '2025-26', '2026-27', '2027-28']);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    courseName: '',
    forClass: '',
    stream: '',
    academicYear: '2026-27',
    dates: {
      applicationStart: '',
      applicationEnd: '',
      examDate: '',
      interviewDate: '',
      admissionStart: ''
    },
    fees: {
      admissionFee: 0,
      monthlyFee: 0,
      quarterlyFee: 0,
      yearlyFee: 0,
      labFee: 0,
      computerFee: 0,
      otherCharges: 0
    },
    description: '',
    eligibility: {
      minAge: '',
      maxAge: '',
      minPercentage: '',
      otherRequirements: ''
    },
    seats: {
      total: 50,
      available: 50
    }
  });

  // Check if admin has access
  useEffect(() => {
    if (!loading && !hasAccess) {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/add-members';
    }
  }, [hasAccess, loading]);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          window.location.href = '/add-members';
          return;
        }

        // Verify token with backend
        const response = await api.get('/auth/profile');
        
        if (!response.data.success || response.data.data.role !== 'admin') {
          toast.error('Admin access required');
          window.location.href = '/add-members';
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
        toast.error('Authentication failed');
        window.location.href = '/add-members';
      }
    };

    if (!loading && hasAccess) {
      verifyAdmin();
    }
  }, [hasAccess, loading]);

  // Helper functions
  const formatDateForSubmission = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString();
  };

  const testConnection = async () => {
    try {
      const response = await api.get('/auth/profile');
      console.log('Connection test successful:', response.data);
      toast.success('Connected to server successfully!');
      setConnectionTested(true);
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection failed: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'dates' || parent === 'fees' || parent === 'eligibility') {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else if (name.includes('seats.')) {
      const [, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        seats: {
          ...prev.seats,
          [child]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDateChange = (dateType, dateValue) => {
    setFormData(prev => ({
      ...prev,
      dates: {
        ...prev.dates,
        [dateType]: dateValue
      }
    }));
  };

  const handleFeeChange = (feeType, feeValue) => {
    setFormData(prev => ({
      ...prev,
      fees: {
        ...prev.fees,
        [feeType]: parseFloat(feeValue) || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.courseName || !formData.forClass) {
        toast.error('Title, course name, and class are required');
        setSubmitting(false);
        return;
      }

      // Validate dates
      const startDate = new Date(formData.dates.applicationStart);
      const endDate = new Date(formData.dates.applicationEnd);
      
      if (endDate < startDate) {
        toast.error('Application end date must be after start date');
        setSubmitting(false);
        return;
      }

      // Prepare data for submission
      const submissionData = {
        title: formData.title,
        courseName: formData.courseName,
        forClass: formData.forClass,
        stream: formData.stream || null,
        academicYear: formData.academicYear,
        dates: {
          applicationStart: formatDateForSubmission(formData.dates.applicationStart),
          applicationEnd: formatDateForSubmission(formData.dates.applicationEnd),
          examDate: formatDateForSubmission(formData.dates.examDate),
          interviewDate: formatDateForSubmission(formData.dates.interviewDate),
          admissionStart: formatDateForSubmission(formData.dates.admissionStart),
        },
        fees: {
          admissionFee: Number(formData.fees.admissionFee) || 0,
          monthlyFee: Number(formData.fees.monthlyFee) || 0,
          quarterlyFee: Number(formData.fees.quarterlyFee) || 0,
          yearlyFee: Number(formData.fees.yearlyFee) || 0,
          labFee: Number(formData.fees.labFee) || 0,
          computerFee: Number(formData.fees.computerFee) || 0,
          otherCharges: Number(formData.fees.otherCharges) || 0,
        },
        description: formData.description,
        eligibility: {
          minAge: Number(formData.eligibility.minAge) || null,
          maxAge: Number(formData.eligibility.maxAge) || null,
          minPercentage: Number(formData.eligibility.minPercentage) || null,
          otherRequirements: formData.eligibility.otherRequirements || '',
        },
        seats: {
          total: Number(formData.seats.total) || 50,
          available: Number(formData.seats.total) || 50,
        },
      };

      console.log('Submitting data:', submissionData);

      const response = await api.post('/admissions', submissionData);
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        toast.success('Admission course created successfully!');
        
        if (onAdmissionAdded) {
          onAdmissionAdded();
        }
        
        // Reset form
        setFormData({
          title: '',
          courseName: '',
          forClass: '',
          stream: '',
          academicYear: '2026-27',
          dates: {
            applicationStart: '',
            applicationEnd: '',
            examDate: '',
            interviewDate: '',
            admissionStart: '',
          },
          fees: {
            admissionFee: 0,
            monthlyFee: 0,
            quarterlyFee: 0,
            yearlyFee: 0,
            labFee: 0,
            computerFee: 0,
            otherCharges: 0,
          },
          description: '',
          eligibility: {
            minAge: '',
            maxAge: '',
            minPercentage: '',
            otherRequirements: '',
          },
          seats: {
            total: 50,
            available: 50,
          },
        });
      } else {
        toast.error(response.data.error || 'Failed to create admission');
      }
    } catch (error) {
      console.error('Error creating admission:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
      });
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/add-members';
      } else {
        toast.error(error.response?.data?.error || 'Failed to create admission course');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // If still checking auth, show loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Admission Course</h2>
          <button 
            type="button"
            onClick={testConnection}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Test Connection
          </button>
        </div>
        
        {connectionTested && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
            ✓ Connected to server successfully
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Class 11 Admission 2026-27"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Class 11 Science, Nursery, etc."
              />
            </div>
          </div>

          {/* Class and Stream */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                For Class *
              </label>
              <select
                name="forClass"
                value={formData.forClass}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stream (For Class 11-12)
              </label>
              <select
                name="stream"
                value={formData.stream}
                onChange={handleChange}
                disabled={!['11', '12'].includes(formData.forClass)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Not Applicable</option>
                {['11', '12'].includes(formData.forClass) && (
                  <>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Humanities">Humanities</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year *
            </label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Important Dates */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Important Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(formData.dates).map(dateField => (
                <div key={dateField}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {dateField.replace(/([A-Z])/g, ' $1')} *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dates[dateField]}
                    onChange={(e) => handleDateChange(dateField, e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Fee Structure */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Fee Structure (in ₹)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Fee
                </label>
                <input
                  type="number"
                  value={formData.fees.admissionFee}
                  onChange={(e) => handleFeeChange('admissionFee', e.target.value)}
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Fee *
                </label>
                <input
                  type="number"
                  value={formData.fees.monthlyFee}
                  onChange={(e) => handleFeeChange('monthlyFee', e.target.value)}
                  required
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yearly Fee
                </label>
                <input
                  type="number"
                  value={formData.fees.yearlyFee}
                  onChange={(e) => handleFeeChange('yearlyFee', e.target.value)}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lab Fee
                </label>
                <input
                  type="number"
                  value={formData.fees.labFee}
                  onChange={(e) => handleFeeChange('labFee', e.target.value)}
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Computer Fee
                </label>
                <input
                  type="number"
                  value={formData.fees.computerFee}
                  onChange={(e) => handleFeeChange('computerFee', e.target.value)}
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Charges
                </label>
                <input
                  type="number"
                  value={formData.fees.otherCharges}
                  onChange={(e) => handleFeeChange('otherCharges', e.target.value)}
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter detailed description about the admission process, requirements, etc."
            />
          </div>

          {/* Eligibility */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Eligibility Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Age (years)
                </label>
                <input
                  type="number"
                  name="eligibility.minAge"
                  value={formData.eligibility.minAge}
                  onChange={handleChange}
                  min="0"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Age (years)
                </label>
                <input
                  type="number"
                  name="eligibility.maxAge"
                  value={formData.eligibility.maxAge}
                  onChange={handleChange}
                  min="0"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Percentage (%)
                </label>
                <input
                  type="number"
                  name="eligibility.minPercentage"
                  value={formData.eligibility.minPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Seats
                </label>
                <input
                  type="number"
                  name="seats.total"
                  value={formData.seats.total}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Requirements
              </label>
              <textarea
                name="eligibility.otherRequirements"
                value={formData.eligibility.otherRequirements}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any other requirements or conditions..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Creating...
                </>
              ) : 'Create Admission Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmissionForm;