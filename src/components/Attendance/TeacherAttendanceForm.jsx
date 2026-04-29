import React, { useState } from 'react';
import api from '../../utils/api';
import { Save, Loader, CheckCircle, AlertCircle, BookOpen, Mail } from 'lucide-react';

const TeacherAttendanceForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    totalWorkingDays: 0,
    daysPresent: 0,
    remark: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Please enter teacher email' });
      return;
    }

    if (!formData.email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    if (formData.totalWorkingDays <= 0 || formData.daysPresent < 0) {
      setMessage({ type: 'error', text: 'Please enter valid attendance numbers' });
      return;
    }

    if (formData.daysPresent > formData.totalWorkingDays) {
      setMessage({ type: 'error', text: 'Days present cannot exceed total working days' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('attendance/teacher/add-by-email', {
        email: formData.email,
        month: formData.month,
        year: parseInt(formData.year),
        totalWorkingDays: parseInt(formData.totalWorkingDays),
        daysPresent: parseInt(formData.daysPresent),
        remark: formData.remark
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setFormData({
          email: '',
          month: new Date().toLocaleString('default', { month: 'long' }),
          year: new Date().getFullYear(),
          totalWorkingDays: 0,
          daysPresent: 0,
          remark: ''
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add attendance. Teacher email not found.' 
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <BookOpen className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Teacher Monthly Attendance</h2>
          <p className="text-gray-600">Enter teacher email and attendance details</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input - Only field needed to identify teacher */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Teacher Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="teacher@school.com"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter the teacher's registered email address</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Month *</label>
            <select name="month" value={formData.month} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required>
              {months.map(month => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Year *</label>
            <select name="year" value={formData.year} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Total Working Days *</label>
            <input type="number" name="totalWorkingDays" value={formData.totalWorkingDays} onChange={handleChange}
              min="0" max="31" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Days Present *</label>
            <input type="number" name="daysPresent" value={formData.daysPresent} onChange={handleChange}
              min="0" max={formData.totalWorkingDays} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Remark (Optional)</label>
            <textarea name="remark" value={formData.remark} onChange={handleChange}
              rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Any additional notes about attendance..." />
          </div>
        </div>

        <button type="submit" disabled={submitting || !formData.email}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Attendance Record
        </button>
      </form>

      {formData.email && formData.totalWorkingDays > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Attendance Preview:</h3>
          <p className="text-sm text-gray-600">Teacher Email: {formData.email}</p>
          <p className="text-sm text-gray-600">Attendance: {formData.daysPresent}/{formData.totalWorkingDays} days</p>
          <p className="text-sm text-gray-600">Percentage: {((formData.daysPresent / formData.totalWorkingDays) * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceForm;