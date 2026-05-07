// components/Attendance/MarkStudentAttendance.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Save, Loader, CheckCircle, AlertCircle, 
  GraduationCap, Calendar, Clock, UserCheck,
  Users, Search, Zap, TrendingUp, Award,
  Sun, Moon, Check, X, AlertTriangle
} from 'lucide-react';

const MarkStudentAttendance = () => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [singleMode, setSingleMode] = useState(true);
  const [formData, setFormData] = useState({
    studentId: '',
    status: 'present',
    date: new Date().toISOString().split('T')[0],
    remark: '',
    checkInTime: '',
    checkOutTime: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [todayStats, setTodayStats] = useState({ present: 0, absent: 0, late: 0, halfDay: 0 });

  // Fetch classes for bulk marking
  useEffect(() => {
    if (!singleMode && user?.role === 'teacher') {
      fetchClasses();
    }
  }, [singleMode, user]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      // Get teacher's assigned classes
      const response = await api.get('classes/teacher');
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudentsByClass = async () => {
    if (!selectedClass || !selectedSection) return;
    
    setLoadingClasses(true);
    try {
      const response = await api.get(`students/class/${selectedClass}/${selectedSection}`);
      if (response.data.success) {
        setStudents(response.data.data);
        // Initialize attendance list
        const initialList = response.data.data.map(student => ({
          studentId: student.studentId,
          name: student.name,
          rollNumber: student.rollNumber,
          status: 'present',
          remark: ''
        }));
        setAttendanceList(initialList);
        
        // Calculate initial stats
        updateStats(initialList);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const updateStats = (list) => {
    const stats = {
      present: list.filter(s => s.status === 'present').length,
      absent: list.filter(s => s.status === 'absent').length,
      late: list.filter(s => s.status === 'late').length,
      halfDay: list.filter(s => s.status === 'half-day').length
    };
    setTodayStats(stats);
  };

  const handleStatusChange = (index, status) => {
    const updatedList = [...attendanceList];
    updatedList[index].status = status;
    setAttendanceList(updatedList);
    updateStats(updatedList);
  };

  const handleBulkStatusChange = (status) => {
    const updatedList = attendanceList.map(student => ({
      ...student,
      status: status
    }));
    setAttendanceList(updatedList);
    updateStats(updatedList);
  };

  const handleSingleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentId) {
      setMessage({ type: 'error', text: 'Please enter Student ID' });
      return;
    }
    
    if (!formData.status) {
      setMessage({ type: 'error', text: 'Please select attendance status' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('attendance/student/mark', {
        studentId: formData.studentId,
        status: formData.status,
        date: formData.date,
        remark: formData.remark,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: `Attendance marked as ${formData.status} for Student ID: ${formData.studentId}` });
        setFormData({
          studentId: '',
          status: 'present',
          date: new Date().toISOString().split('T')[0],
          remark: '',
          checkInTime: '',
          checkOutTime: ''
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to mark attendance' 
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedSection) {
      setMessage({ type: 'error', text: 'Please select class and section' });
      return;
    }

    if (attendanceList.length === 0) {
      setMessage({ type: 'error', text: 'No students found in this class' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('attendance/student/bulk-mark', {
        class: selectedClass,
        section: selectedSection,
        date: formData.date,
        attendanceList: attendanceList.map(a => ({
          studentId: a.studentId,
          status: a.status,
          remark: a.remark
        }))
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Bulk attendance marked for ${response.data.data.marked} students in ${selectedClass}-${selectedSection}` 
        });
        
        // Reset selections
        setSelectedClass('');
        setSelectedSection('');
        setStudents([]);
        setAttendanceList([]);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to mark bulk attendance' 
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
    { value: 'half-day', label: 'Half Day', icon: Sun, color: 'orange' }
  ];

  const uniqueClasses = [...new Set(classes.map(c => c.class))];
  const sections = selectedClass ? classes.filter(c => c.class === selectedClass).map(c => c.section) : [];

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-3 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
        <button
          onClick={() => setSingleMode(true)}
          className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            singleMode ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Single Student
        </button>
        <button
          onClick={() => setSingleMode(false)}
          className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            !singleMode ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Bulk Class Attendance
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Single Student Mode */}
      {singleMode && (
        <form onSubmit={handleSingleSubmit} className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Mark Individual Student Attendance</h3>
                <p className="text-sm text-gray-600">Enter Student ID and attendance details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleSingleChange}
                    placeholder="Enter Student ID (e.g., STU001)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Use the School ID assigned to the student</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleSingleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
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
                    onChange={handleSingleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    onChange={handleSingleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleSingleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any notes about this attendance..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Mark Attendance
            </button>
          </div>
        </form>
      )}

      {/* Bulk Class Mode */}
      {!singleMode && (
        <form onSubmit={handleBulkSubmit} className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Bulk Class Attendance</h3>
                <p className="text-sm text-gray-600">Mark attendance for entire class at once</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Class</option>
                  {uniqueClasses.map(c => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    fetchStudentsByClass();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  disabled={!selectedClass}
                >
                  <option value="">Select Section</option>
                  {sections.map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {loadingClasses && (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto" />
                <p className="text-gray-500 mt-2">Loading students...</p>
              </div>
            )}

            {attendanceList.length > 0 && (
              <>
                {/* Quick Actions */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="text-sm text-gray-600 mr-2">Quick actions:</span>
                  {statusOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleBulkStatusChange(option.value)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 bg-${option.color}-100 text-${option.color}-700 hover:bg-${option.color}-200`}
                      >
                        <Icon className="w-3 h-3" />
                        All {option.label}
                      </button>
                    );
                  })}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-green-600">{todayStats.present}</div>
                    <div className="text-xs text-gray-600">Present</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <X className="w-5 h-5 text-red-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-red-600">{todayStats.absent}</div>
                    <div className="text-xs text-gray-600">Absent</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-yellow-600">{todayStats.late}</div>
                    <div className="text-xs text-gray-600">Late</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <Sun className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-orange-600">{todayStats.halfDay}</div>
                    <div className="text-xs text-gray-600">Half Day</div>
                  </div>
                </div>

                {/* Student List */}
                <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No.</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.map((student, index) => (
                        <tr key={student.studentId} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                          <td className="px-4 py-3 text-sm font-mono text-blue-600">{student.studentId}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {statusOptions.map(option => {
                                const Icon = option.icon;
                                const isSelected = student.status === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleStatusChange(index, option.value)}
                                    className={`p-1 rounded transition-all ${
                                      isSelected
                                        ? `bg-${option.color}-600 text-white`
                                        : `bg-gray-100 text-gray-500 hover:bg-${option.color}-100`
                                    }`}
                                    title={option.label}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={student.remark}
                              onChange={(e) => {
                                const updatedList = [...attendanceList];
                                updatedList[index].remark = e.target.value;
                                setAttendanceList(updatedList);
                              }}
                              placeholder="Remark"
                              className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Bulk Attendance ({attendanceList.length} Students)
                </button>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default MarkStudentAttendance;