// src/components/reviews/TeacherReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import studentPerformanceApi from '../../utils/studentPerformanceAPI';

const TeacherReviewForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [formData, setFormData] = useState({
    remark: '',
    subject: '',
    category: 'academic',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = studentPerformanceApi.getTeacherRemarkCategories();

  const searchByEmail = async () => {
    if (!studentEmail.trim()) {
      toast.error('Please enter student email');
      return;
    }

    if (!studentPerformanceApi.validateEmail(studentEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const result = await studentPerformanceApi.getStudentPerformanceByEmail(studentEmail.toLowerCase());
      if (result.success) {
        setStudentDetails(result.data);
        setFormData(prev => ({ 
          ...prev, 
          subject: result.data.class || ''
        }));
        toast.success('Student found successfully');
      } else {
        toast.error(result.error || 'Student not found');
        setStudentDetails(null);
      }
    } catch (error) {
      toast.error(error.error || 'Failed to fetch student details');
      setStudentDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentDetails) {
      toast.error('Please search and select a student first');
      return;
    }

    if (!formData.remark.trim()) {
      toast.error('Please enter a remark');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const remarkData = {
        remark: formData.remark,
        subject: formData.subject,
        category: formData.category,
        teacherId: user._id,
        date: formData.date
      };

      const result = await studentPerformanceApi.addTeacherRemark(
        studentDetails._id,
        remarkData
      );

      if (result.success) {
        toast.success('Teacher remark added successfully');
        
        // Reset form
        setFormData({
          remark: '',
          subject: studentDetails.class || '',
          category: 'academic',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error adding teacher remark:', error);
      toast.error(error.error || 'Failed to add teacher remark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Teacher Review</h3>
      
      {/* Student Search Section */}
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Search Student by Email</h4>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Enter student email (e.g., student@example.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && searchByEmail()}
              />
            </div>
            <button
              onClick={searchByEmail}
              disabled={loading || !studentEmail}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Student Details */}
      {studentDetails && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold text-lg">
                  {studentDetails.studentName?.charAt(0) || 'S'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  {studentDetails.studentName}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Roll No: {studentDetails.rollNumber}</span>
                  <span>|</span>
                  <span>Class: {studentDetails.class}-{studentDetails.section}</span>
                  <span>|</span>
                  <span>Email: {studentDetails.studentEmail}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Academic Year: {studentDetails.academicYear}
                </div>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => {
                  setStudentDetails(null);
                  setStudentEmail('');
                }}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Change Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {studentDetails && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Mathematics or Class subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher Remark *
            </label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows="5"
              required
              placeholder="Enter your remark about the student's performance, behavior, or achievements..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-xs text-gray-500 mt-2">
              Provide constructive feedback about the student's performance
            </div>
          </div>

          {/* Category Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  className={`px-4 py-2 rounded-lg font-medium ${cat.color} ${
                    formData.category === cat.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-green-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Review...
                </div>
              ) : (
                'Add Teacher Review'
              )}
            </button>
          </div>
        </form>
      )}

      {!studentDetails && (
        <div className="text-center py-8 text-gray-500">
          Enter student email to search and add review
        </div>
      )}
    </div>
  );
};

export default TeacherReviewForm;