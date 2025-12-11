// src/form/teacherAttendanceForm.jsx
import React, { useState } from 'react';
import { useTeacherPerformance } from '../../hooks/useTeacherPerformance';

const TeacherAttendanceForm = () => {
  const [teacherEmail, setTeacherEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
    workingDays: 0,
    presentDays: 0,
    leaveDays: 0,
    halfDays: 0,
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { teacherInfo, updateAttendance, refresh, getMonths, formatMonthYear } = useTeacherPerformance(teacherEmail);

  const months = getMonths();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!teacherEmail) {
      setMessage({ type: 'error', text: 'Please enter teacher email' });
      return;
    }
    
    setSearching(true);
    setMessage({ type: '', text: '' });
    
    try {
      await refresh();
      setFormData(prev => ({
        ...prev,
        month: '',
        workingDays: 0,
        presentDays: 0,
        leaveDays: 0,
        halfDays: 0,
        remarks: ''
      }));
      setMessage({ type: 'success', text: 'Teacher found! You can now add attendance.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to find teacher' });
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remarks' ? value : Number(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!teacherInfo) {
      setMessage({ type: 'error', text: 'Please search for a teacher first' });
      return;
    }
    
    if (!formData.month) {
      setMessage({ type: 'error', text: 'Please select a month' });
      return;
    }
    
    if (formData.presentDays > formData.workingDays) {
      setMessage({ type: 'error', text: 'Present days cannot exceed working days' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await updateAttendance(formData);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Attendance for ${formatMonthYear(formData.month, formData.year)} added successfully!` 
        });
        setFormData({
          month: '',
          year: new Date().getFullYear(),
          workingDays: 0,
          presentDays: 0,
          leaveDays: 0,
          halfDays: 0,
          remarks: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add attendance' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to add attendance' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setFormData(prev => ({
      ...prev,
      month
    }));
    
    // Set default working days based on month
    if (month) {
      const monthIndex = months.findIndex(m => m.value === month) + 1;
      const currentYear = new Date().getFullYear();
      const daysInMonth = new Date(currentYear, monthIndex, 0).getDate();
      
      // Assuming 6 working days per week (Monday to Saturday)
      const totalDays = daysInMonth;
      let workingDays = 0;
      
      // Simple calculation for working days (excluding Sundays)
      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, monthIndex - 1, day);
        if (date.getDay() !== 0) { // Not Sunday
          workingDays++;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        workingDays,
        presentDays: Math.min(prev.presentDays, workingDays)
      }));
    }
  };

  // Calculate derived values
  const attendancePercentage = formData.workingDays > 0 
    ? ((formData.presentDays + (formData.halfDays * 0.5)) / formData.workingDays) * 100 
    : 0;
  
  const totalAttendanceDays = formData.presentDays + (formData.halfDays * 0.5);
  const absentDays = formData.workingDays - totalAttendanceDays;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Teacher Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Find Teacher</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher Email
            </label>
            <input
              type="email"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
              placeholder="Enter teacher email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="pt-6">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Add Monthly Attendance
          {teacherInfo && (
            <span className="ml-2 text-blue-600 font-normal">
              for {teacherInfo.name}
            </span>
          )}
        </h2>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {teacherInfo ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Month and Year Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month *
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleMonthChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="2000"
                  max="2050"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Attendance Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Days
                </label>
                <input
                  type="number"
                  name="workingDays"
                  value={formData.workingDays}
                  onChange={handleInputChange}
                  min="1"
                  max="31"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Total working days in month
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Present Days *
                </label>
                <input
                  type="number"
                  name="presentDays"
                  value={formData.presentDays}
                  onChange={handleInputChange}
                  min="0"
                  max={formData.workingDays}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Days teacher was present
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Days
                </label>
                <input
                  type="number"
                  name="leaveDays"
                  value={formData.leaveDays}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Approved leave days
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Half Days
                </label>
                <input
                  type="number"
                  name="halfDays"
                  value={formData.halfDays}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Half-day attendance
                </p>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional comments or notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Summary Statistics */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Attendance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendancePercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Attendance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {totalAttendanceDays.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Total Attendance Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {absentDays > 0 ? absentDays.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-600">Absent Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formData.leaveDays}
                  </div>
                  <div className="text-sm text-gray-600">Leave Days</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    month: '',
                    year: new Date().getFullYear(),
                    workingDays: 0,
                    presentDays: 0,
                    leaveDays: 0,
                    halfDays: 0,
                    remarks: ''
                  });
                  setMessage({ type: '', text: '' });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.month}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-600">
              Enter a teacher email and click Search to begin adding attendance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendanceForm;