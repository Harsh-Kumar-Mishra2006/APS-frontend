import React, { useState } from 'react';
import api from '../../utils/api';
import { X, Loader, DollarSign, Calendar, Search, AlertCircle } from 'lucide-react';

const AddFeeForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState({
    currentMonth: '',
    currentYear: new Date().getFullYear(),
    pendingFrom: '',
    pendingFromYear: new Date().getFullYear(),
    monthsPending: 1,
    monthlyFee: '',
    transportFee: '',
    examFee: '',
    tuitionFee: '',
    lateFee: '',
    totalAmount: '',
    amountInWords: '',
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
      setError('Please enter student email');
      return;
    }

    setSearchLoading(true);
    setError('');
    
    try {
      const response = await api.get('auth/users?role=student');
      if (response.data.success) {
        const foundStudent = response.data.data.find(
          s => s.email.toLowerCase() === searchValue.toLowerCase()
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

  const calculateTotal = () => {
    const monthlyFee = parseFloat(formData.monthlyFee) || 0;
    const transportFee = parseFloat(formData.transportFee) || 0;
    const examFee = parseFloat(formData.examFee) || 0;
    const tuitionFee = parseFloat(formData.tuitionFee) || 0;
    const lateFee = parseFloat(formData.lateFee) || 0;
    
    const total = monthlyFee + transportFee + examFee + tuitionFee + lateFee;
    setFormData({ ...formData, totalAmount: total.toString() });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Recalculate total when any fee field changes
    if (['monthlyFee', 'transportFee', 'examFee', 'tuitionFee', 'lateFee'].includes(name)) {
      setTimeout(calculateTotal, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!student) {
      setError('Please search and select a student first');
      return;
    }
    
    if (!formData.currentMonth) {
      setError('Please select current month');
      return;
    }
    
    if (!formData.dueDate) {
      setError('Please select due date');
      return;
    }
    
    const totalAmount = parseFloat(formData.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('Please enter valid fee amounts');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        email: student.email,
        currentMonth: formData.currentMonth,
        currentYear: parseInt(formData.currentYear),
        pendingFrom: formData.pendingFrom || formData.currentMonth,
        pendingFromYear: parseInt(formData.pendingFromYear) || parseInt(formData.currentYear),
        monthsPending: parseInt(formData.monthsPending) || 1,
        monthlyFee: parseFloat(formData.monthlyFee) || 0,
        transportFee: parseFloat(formData.transportFee) || 0,
        examFee: parseFloat(formData.examFee) || 0,
        tuitionFee: parseFloat(formData.tuitionFee) || 0,
        lateFee: parseFloat(formData.lateFee) || 0,
        totalAmount: parseFloat(formData.totalAmount),
        amountInWords: formData.amountInWords || '',
        dueDate: formData.dueDate,
        remarks: formData.remarks || ''
      };
      
      console.log('Sending payload:', payload);
      
      const response = await api.post('fee/add-by-email', payload);
      
      if (response.data.success) {
        // Reset form
        setFormData({
          currentMonth: '',
          currentYear: new Date().getFullYear(),
          pendingFrom: '',
          pendingFromYear: new Date().getFullYear(),
          monthsPending: 1,
          monthlyFee: '',
          transportFee: '',
          examFee: '',
          tuitionFee: '',
          lateFee: '',
          totalAmount: '',
          amountInWords: '',
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
      console.error('Error adding fee:', err);
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
          
          <div className="flex gap-3">
            <input
              type="email"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter student email"
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
              <p className="font-semibold text-green-800">✅ {student.name}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Current Month *</label>
              <select
                name="currentMonth"
                value={formData.currentMonth}
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
              <label className="block text-gray-700 font-medium mb-2">Current Year *</label>
              <select
                name="currentYear"
                value={formData.currentYear}
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

        {/* Fee Details Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">3. Fee Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Monthly Fee</label>
              <input
                type="number"
                name="monthlyFee"
                value={formData.monthlyFee}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Transport Fee</label>
              <input
                type="number"
                name="transportFee"
                value={formData.transportFee}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Exam Fee</label>
              <input
                type="number"
                name="examFee"
                value={formData.examFee}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Tuition Fee</label>
              <input
                type="number"
                name="tuitionFee"
                value={formData.tuitionFee}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Late Fee</label>
              <input
                type="number"
                name="lateFee"
                value={formData.lateFee}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Total Amount *</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                placeholder="Total Amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-bold"
                required
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Pending Period Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">4. Pending Period (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Pending From Month</label>
              <select
                name="pendingFrom"
                value={formData.pendingFrom}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Same as Current</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Pending From Year</label>
              <select
                name="pendingFromYear"
                value={formData.pendingFromYear}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Months Pending</label>
              <input
                type="number"
                name="monthsPending"
                value={formData.monthsPending}
                onChange={handleInputChange}
                min="1"
                max="12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Due Date Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">5. Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2 items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Amount in Words (Optional)</label>
              <input
                type="text"
                name="amountInWords"
                value={formData.amountInWords}
                onChange={handleInputChange}
                placeholder="e.g., Rupees Five Thousand Only"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">6. Additional Information</h3>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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