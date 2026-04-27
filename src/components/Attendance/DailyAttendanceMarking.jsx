// src/components/attendance/DailyAttendanceMarking.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Search, 
  Save, 
  Clock, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Loader,
  CheckCircle,
  Frown,
  Sun,
  Moon
} from 'lucide-react';

const DailyAttendanceMarking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [classList, setClassList] = useState([]);

  // Fetch classes for dropdown
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/attendance/students/all');
      if (response.data.success && response.data.data) {
        const classes = [...new Set(response.data.data.map(s => s.class))];
        setClassList(classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) {
      setMessage({ type: 'error', text: 'Please select a class' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/attendance/daily/class', {
        params: {
          class: selectedClass,
          section: selectedSection || '',
          date: selectedDate
        }
      });

      if (response.data.success) {
        const attendanceMap = {};
        response.data.data.attendance.forEach(student => {
          attendanceMap[student.studentId] = {
            status: student.status,
            checkInTime: student.checkInTime || '',
            checkOutTime: student.checkOutTime || '',
            remark: student.remark || ''
          };
        });
        setAttendanceData(attendanceMap);
        setStudents(response.data.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Failed to fetch students' });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const markAll = (status) => {
    const newData = {};
    students.forEach(student => {
      newData[student.studentId] = {
        status: status,
        checkInTime: status === 'present' ? new Date().toLocaleTimeString() : '',
        checkOutTime: '',
        remark: ''
      };
    });
    setAttendanceData(newData);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      const attendance = attendanceData[student.studentId];
      if (!attendance || !attendance.status || attendance.status === 'not-marked') continue;

      try {
        await api.post('/attendance/daily/mark', {
          entityType: 'student',
          entityId: student.studentId,
          date: selectedDate,
          status: attendance.status,
          checkInTime: attendance.checkInTime || null,
          checkOutTime: attendance.checkOutTime || null,
          remark: attendance.remark || null
        });
        successCount++;
      } catch (error) {
        console.error(`Error marking attendance for student ${student.studentId}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      setMessage({ 
        type: 'success', 
        text: `Attendance marked for ${successCount} student(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`
      });
      fetchStudents(); // Refresh data
    } else if (errorCount > 0) {
      setMessage({ type: 'error', text: 'Failed to mark attendance. Please try again.' });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-300';
      case 'absent': return 'bg-red-100 text-red-700 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'half-day': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Attendance Marking</h2>
        <p className="text-gray-600">Mark attendance for students by class and section</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Class *</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {classList.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Section</label>
          <input
            type="text"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            placeholder="Optional"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchStudents}
            disabled={loading || !selectedClass}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Load Students
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {students.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => markAll('present')}
            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
          >
            <UserCheck className="w-4 h-4" /> Mark All Present
          </button>
          <button
            onClick={() => markAll('absent')}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
          >
            <UserX className="w-4 h-4" /> Mark All Absent
          </button>
          <button
            onClick={() => markAll('late')}
            className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 flex items-center gap-1"
          >
            <Sun className="w-4 h-4" /> Mark All Late
          </button>
        </div>
      )}

      {/* Students List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Frown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No students found. Please select a class and load students.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check In</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check Out</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remark</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const attendance = attendanceData[student.studentId] || { status: 'not-marked' };
                  return (
                    <tr key={student.studentId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                      <td className="px-4 py-3 text-sm font-medium">{student.studentName}</td>
                      <td className="px-4 py-3">
                        <select
                          value={attendance.status}
                          onChange={(e) => handleAttendanceChange(student.studentId, 'status', e.target.value)}
                          className={`px-2 py-1 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 ${getStatusColor(attendance.status)}`}
                        >
                          <option value="not-marked">-- Select --</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="half-day">Half Day</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="time"
                          value={attendance.checkInTime || ''}
                          onChange={(e) => handleAttendanceChange(student.studentId, 'checkInTime', e.target.value)}
                          disabled={attendance.status === 'absent' || attendance.status === 'not-marked'}
                          className="px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="time"
                          value={attendance.checkOutTime || ''}
                          onChange={(e) => handleAttendanceChange(student.studentId, 'checkOutTime', e.target.value)}
                          disabled={attendance.status === 'absent' || attendance.status === 'not-marked'}
                          className="px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={attendance.remark || ''}
                          onChange={(e) => handleAttendanceChange(student.studentId, 'remark', e.target.value)}
                          placeholder="Optional"
                          className="px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-32"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Attendance
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DailyAttendanceMarking;