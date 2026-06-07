// src/components/fee/AddFeeForm.jsx
import React, { useState } from 'react';
import api from '../../utils/api';
import { X, Loader, DollarSign, Calendar, Search, AlertCircle, Plus, Trash2 } from 'lucide-react';

const AddFeeForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [feeComponents, setFeeComponents] = useState([
    { name: 'Tuition Fee', amount: '' }
  ]);
  const [formData, setFormData] = useState({
    feeMonth: '',
    feeYear: new Date().getFullYear(),
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
      setError('Please enter student ID, email, or name');
      return;
    }

    setSearchLoading(true);
    setError('');
    
    try {
      // Search by student ID, email, or name
      const response = await api.get('auth/users?role=student');
      if (response.data.success) {
        const searchTerm = searchValue.toLowerCase();
        const foundStudent = response.data.data.find(s => 
          s.email?.toLowerCase() === searchTerm ||
          s.name?.toLowerCase().includes(searchTerm) ||
          s.student?.studentId?.toLowerCase() === searchTerm ||
          s.student?.rollNumber?.toString() === searchTerm
        );
        
        if (foundStudent) {
          setStudent(foundStudent);
          setError('');
        } else {
          setError('Student not found. Please check ID, email, or name.');
          setStudent(null);
        }
      }
    } catch (err) {
      setError('Failed to search student: ' + (err.response?.data?.error || err.message));
    } finally {
      setSearchLoading(false);
    }
  };

  const addFeeComponent = () => {
    setFeeComponents([...feeComponents, { name: '', amount: '' }]);
  };

  const removeFeeComponent = (index) => {
    if (feeComponents.length > 1) {
      setFeeComponents(feeComponents.filter((_, i) => i !== index));
    }
  };

  const updateFeeComponent = (index, field, value) => {
    const updated = [...feeComponents];
    updated[index][field] = value;
    setFeeComponents(updated);
  };

  const calculateTotalAmount = () => {
    return feeComponents.reduce((sum, component) => {
      return sum + (parseFloat(component.amount) || 0);
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!student) {
      setError('Please search and select a student first');
      return;
    }
    
    if (!formData.feeMonth) {
      setError('Please select fee month');
      return;
    }
    
    if (!formData.dueDate) {
      setError('Please select due date');
      return;
    }
    
    const validComponents = feeComponents.filter(c => c.name && c.amount);
    if (validComponents.length === 0) {
      setError('Please add at least one fee component with amount');
      return;
    }
    
    const totalAmount = calculateTotalAmount();
    if (totalAmount <= 0) {
      setError('Total amount must be greater than 0');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        studentId: student.student?.studentId || student.id.toString(),
        feeComponents: validComponents.map(c => ({
          name: c.name,
          amount: parseFloat(c.amount)
        })),
        feeMonth: formData.feeMonth,
        feeYear: parseInt(formData.feeYear),
        dueDate: formData.dueDate,
        remarks: formData.remarks || ''
      };
      
      const response = await api.post('fee/add', payload);
      
      if (response.data.success) {
        // Reset form
        setFeeComponents([{ name: 'Tuition Fee', amount: '' }]);
        setFormData({
          feeMonth: '',
          feeYear: new Date().getFullYear(),
          dueDate: '',
          remarks: ''
        });
        setStudent(null);
        setSearchValue('');
        
        if (onSuccess) {
          onSuccess(
            `Fee record added successfully for ${student.name}`,
            response.data.data
          );
        }
      }
    } catch (err) {
      console.error('Error adding fee:', err);
      setError(err.response?.data?.error || 'Failed to add fee record');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotalAmount();

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
          
          <div className="flex gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter Student ID, Email, or Name"
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
              <p className="font-semibold text-green-800">✅ Student Found</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                <p><span className="text-gray-600">Name:</span> {student.name}</p>
                <p><span className="text-gray-600">Student ID:</span> {student.student?.studentId || 'N/A'}</p>
                <p><span className="text-gray-600">Class:</span> {student.student?.class || 'N/A'} {student.student?.section || ''}</p>
                <p><span className="text-gray-600">Roll No:</span> {student.student?.rollNumber || 'N/A'}</p>
                <p><span className="text-gray-600">Email:</span> {student.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Fee Period Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">2. Fee Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Fee Month *</label>
              <select
                name="feeMonth"
                value={formData.feeMonth}
                onChange={handleInputChange}
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
              <label className="block text-gray-700 font-medium mb-2">Fee Year *</label>
              <select
                name="feeYear"
                value={formData.feeYear}
                onChange={handleInputChange}
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

        {/* Fee Components Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">3. Fee Components</h3>
          <div className="space-y-3">
            {feeComponents.map((component, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={component.name}
                    onChange={(e) => updateFeeComponent(index, 'name', e.target.value)}
                    placeholder="Fee Name (e.g., Tuition Fee, Transport Fee)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="w-40">
                  <input
                    type="number"
                    value={component.amount}
                    onChange={(e) => updateFeeComponent(index, 'amount', e.target.value)}
                    placeholder="Amount (₹)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {feeComponents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeeComponent(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addFeeComponent}
              className="text-green-600 hover:text-green-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Another Fee Component
            </button>
          </div>

          {/* Total Amount Display */}
          {totalAmount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Due Date Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">4. Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
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
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
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