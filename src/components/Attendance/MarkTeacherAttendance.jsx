// components/Attendance/MarkTeacherAttendance.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Save, Loader, CheckCircle, AlertCircle, 
  BookOpen, Calendar, Clock, UserCheck,
  Search, Zap, Sun, Moon, X
} from 'lucide-react';

const MarkTeacherAttendance = () => {
  const [submitting, setSubmitting] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [formData, setFormData] = useState({
    teacherId: '',
    status: 'present',
    date: new Date().toISOString().split('T')[0],
    remark: '',
    checkInTime: '',
    checkOutTime: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await api.get('users?role=teacher');
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'teacherId') {
      const teacher = teachers.find(t => t.teacher?.teacherId === value);
      if (teacher) {
        setSelectedTeacher(teacher.name);
      } else {
        setSelectedTeacher('');
      }
    }
    
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.teacherId) {
      setMessage({ type: 'error', text: 'Please enter or select Teacher ID' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('attendance/teacher/mark', {
        teacherId: formData.teacherId,
        status: formData.status,
        date: formData.date,
        remark: formData.remark,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: `Teacher attendance marked as ${formData.status}` });
        setFormData({
          teacherId: '',
          status: 'present',
          date: new Date().toISOString().split('T')[0],
          remark: '',
          checkInTime: '',
          checkOutTime: ''
        });
        setSelectedTeacher('');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to mark teacher attendance' 
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Present', icon: CheckCircle, color: 'green' },
    { value: 'absent', label: 'Absent', icon: X, color: 'red' },
    { value: 'late', label: 'Late', icon: Clock, color: 'yellow' },
    { value: 'half-day', label: 'Half Day', icon: Sun, color: 'orange' },
    { value: 'on-leave', label: 'On Leave', icon: Calendar, color: 'purple' }
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Mark Teacher Daily Attendance</h3>
              <p className="text-sm text-gray-600">Enter Teacher ID to mark daily attendance</p>
            </div>
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  placeholder="Enter Teacher ID (e.g., TCH001)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  list="teachers-list"
                  required
                />
                <datalist id="teachers-list">
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.teacher?.teacherId}>
                      {teacher.name} - {teacher.teacher?.teacherId}
                    </option>
                  ))}
                </datalist>
              </div>
              {selectedTeacher && (
                <p className="text-xs text-green-600 mt-1">Selected: {selectedTeacher}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Use School ID assigned to the teacher (e.g., TCH001)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map(option => {
                  const Icon = option.icon;
                  const isSelected = formData.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: option.value })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        isSelected
                          ? `bg-${option.color}-600 text-white shadow-md`
                          : `bg-gray-100 text-gray-700 hover:bg-${option.color}-100`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
              <div className="relative">
                <Moon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Any notes about this attendance..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            Mark Teacher Attendance
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📌 Note:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Monthly attendance is automatically calculated from daily records</li>
          <li>• Teachers can view their own attendance from the "View Records" tab</li>
          <li>• Admin can view all teacher attendance records</li>
        </ul>
      </div>
    </div>
  );
};

export default MarkTeacherAttendance;