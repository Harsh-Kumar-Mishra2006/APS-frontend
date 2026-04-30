import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X, Loader, Plus, Trash2, DollarSign, Calendar, Mail, AlertCircle } from 'lucide-react';

const AddFeeForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [formData, setFormData] = useState({
    feeMonthFrom: '',
    feeMonthTo: '',
    feeYear: new Date().getFullYear(),
    particulars: [{ description: '', amount: '' }],
    dueDate: '',
    remarks: ''
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const searchStudent = async () => {
    if (!searchEmail) {
      setError('Please enter student email');
      return;
    }

    setSearchLoading(true);
    setError('');
    
    try {
      // First get all students
      const response = await api.get(`auth/users?role=student`);
      if (response.data.success) {
        const foundStudent = response.data.data.find(
          s => s.email.toLowerCase() === searchEmail.toLowerCase()
        );
        
        if (foundStudent) {
          setStudent(foundStudent);
          setError('');
        } else {
          setError('Student not found with this email');
          setStudent(null);
        }
      }
    } catch (err) {
      setError('Failed to search student: ' + (err.response?.data?.error || err.message));
    } finally {
      setSearchLoading(false);
    }
  };

  const addParticular = () => {
    setFormData({
      ...formData,
      particulars: [...formData.particulars, { description: '', amount: '' }]
    });
  };

  const removeParticular = (index) => {
    const newParticulars = formData.particulars.filter((_, i) => i !== index);
    setFormData({ ...formData, particulars: newParticulars });
  };

  const updateParticular = (index, field, value) => {
    const newParticulars = [...formData.particulars];
    newParticulars[index][field] = value;
    setFormData({ ...formData, particulars: newParticulars });
  };

  const getTotalAmount = () => {
    return formData.particulars.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  };

  const validateMonths = () => {
    const fromIndex = months.indexOf(formData.feeMonthFrom);
    const toIndex = months.indexOf(formData.feeMonthTo);
    
    if (fromIndex === -1 || toIndex === -1) return false;
    
    const monthDiff = toIndex - fromIndex + 1;
    if (monthDiff > 12) {
      setError('Fee period cannot exceed 12 months. Maximum is one year.');
      return false;
    }
    if (monthDiff < 1) {
      setError('"To" month must be after "From" month');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!student) {
      setError('Please search and select a student first');
      return;
    }
    
    if (!formData.feeMonthFrom || !formData.feeMonthTo) {
      setError('Please select fee period');
      return;
    }
    
    if (!validateMonths()) return;
    
    if (!formData.dueDate) {
      setError('Please select due date');
      return;
    }
    
    const validParticulars = formData.particulars.filter(p => p.description && p.amount);
    if (validParticulars.length === 0) {
      setError('Please add at least one fee particular');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('fee/add-by-email', {
        email: student.email,
        feeMonthFrom: formData.feeMonthFrom,
        feeMonthTo: formData.feeMonthTo,
        feeYear: formData.feeYear,
        particulars: validParticulars,
        dueDate: formData.dueDate,
        remarks: formData.remarks
      });
      
      if (response.data.success) {
        onSuccess(
          `Fee record added for ${student.name}`,
          response.data.data.fee
        );
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add fee record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">💰 Add Fee Record</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Student Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">1. Find Student</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter student email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={searchStudent}
              disabled={searchLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              {searchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Search
            </button>
          </div>
          
          {student && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">{student.name}</p>
              <p className="text-sm text-green-600">
                Class: {student.student?.class} {student.student?.section} | 
                Roll: {student.student?.rollNumber} | 
                ID: {student.student?.studentId}
              </p>
            </div>
          )}
        </div>

        {/* Fee Period Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">2. Fee Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">From Month *</label>
              <select
                value={formData.feeMonthFrom}
                onChange={(e) => setFormData({ ...formData, feeMonthFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">To Month *</label>
              <select
                value={formData.feeMonthTo}
                onChange={(e) => setFormData({ ...formData, feeMonthTo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Year *</label>
              <select
                value={formData.feeYear}
                onChange={(e) => setFormData({ ...formData, feeYear: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fee Particulars Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">3. Fee Particulars</h3>
          <div className="space-y-3">
            {formData.particulars.map((particular, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="text"
                  value={particular.description}
                  onChange={(e) => updateParticular(index, 'description', e.target.value)}
                  placeholder="Description (e.g., Tuition Fee)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={particular.amount}
                  onChange={(e) => updateParticular(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="w-40 px-4 py-2 border border-gray-300 rounded-lg"
                />
                {formData.particulars.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticular(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addParticular}
              className="text-green-600 hover:text-green-700 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Another Particular
            </button>
            
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{getTotalAmount().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Due Date Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">4. Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Remarks (Optional)</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !student}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Adding Fee Record...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                Add Fee Record
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFeeForm;