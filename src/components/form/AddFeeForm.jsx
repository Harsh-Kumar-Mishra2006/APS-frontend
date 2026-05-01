import React, { useState } from 'react';
import api from '../../utils/api';
import { X, Loader, Plus, Trash2, DollarSign, Calendar, Mail, Search, AlertCircle } from 'lucide-react';

const AddFeeForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [searchMethod, setSearchMethod] = useState('email'); // 'email' or 'studentId'
  const [searchValue, setSearchValue] = useState('');
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
    if (!searchValue) {
      setError(`Please enter student ${searchMethod === 'email' ? 'email' : 'ID'}`);
      return;
    }

    setSearchLoading(true);
    setError('');
    
    try {
      const response = await api.get('auth/users?role=student');
      if (response.data.success) {
        let foundStudent = null;
        
        if (searchMethod === 'email') {
          foundStudent = response.data.data.find(
            s => s.email.toLowerCase() === searchValue.toLowerCase()
          );
        } else {
          foundStudent = response.data.data.find(
            s => s.student?.studentId === searchValue
          );
        }
        
        if (foundStudent) {
          setStudent(foundStudent);
          setError('');
        } else {
          setError('Student not found with this ' + (searchMethod === 'email' ? 'email' : 'ID'));
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
        // Reset form
        setFormData({
          feeMonthFrom: '',
          feeMonthTo: '',
          feeYear: new Date().getFullYear(),
          particulars: [{ description: '', amount: '' }],
          dueDate: '',
          remarks: ''
        });
        setStudent(null);
        setSearchValue('');
        
        if (onSuccess) {
          onSuccess(
            `Fee record added for ${student.name}`,
            response.data.data.fee
          );
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add fee record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Fee Record</h2>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Student Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">1. Find Student</h3>
          
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={() => setSearchMethod('email')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                searchMethod === 'email'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Search by Email
            </button>
            <button
              type="button"
              onClick={() => setSearchMethod('studentId')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                searchMethod === 'studentId'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Search by Student ID
            </button>
          </div>
          
          <div className="flex gap-3">
            <input
              type={searchMethod === 'email' ? 'email' : 'text'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchMethod === 'email' ? 'Enter student email' : 'Enter Student ID (e.g., STU2024001)'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={searchStudent}
              disabled={searchLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              {searchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
          
          {student && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">{student.name}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                <p><span className="text-gray-600">Email:</span> {student.email}</p>
                <p><span className="text-gray-600">Class:</span> {student.student?.class} {student.student?.section}</p>
                <p><span className="text-gray-600">Roll No:</span> {student.student?.rollNumber}</p>
                <p><span className="text-gray-600">Student ID:</span> {student.student?.studentId}</p>
              </div>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  placeholder="Description (e.g., Tuition Fee, Sports Fee, Library Fee)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  value={particular.amount}
                  onChange={(e) => updateParticular(index, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {formData.particulars.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticular(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addParticular}
              className="text-green-600 hover:text-green-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Another Particular
            </button>
            
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
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
              <label className="block text-gray-700 font-medium mb-2  items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">5. Additional Information</h3>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Any additional notes or remarks about this fee record..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !student}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddFeeForm;