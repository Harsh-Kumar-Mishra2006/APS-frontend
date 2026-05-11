// src/components/Attendance/ViewAttendanceRecords.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, Users, Search, Loader, CheckCircle, X, Clock, Sun, AlertCircle, ChevronDown, Edit2, Save, Filter } from 'lucide-react';

const ViewAttendanceRecords = () => {
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingRecord, setEditingRecord] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showUpdateBox, setShowUpdateBox] = useState(false);

  const statusOptions = [
    { value: 'present', label: 'Present', icon: CheckCircle, color: 'green' },
    { value: 'absent', label: 'Absent', icon: X, color: 'red' },
    { value: 'late', label: 'Late', icon: Clock, color: 'yellow' },
    { value: 'half-day', label: 'Half Day', icon: Sun, color: 'orange' }
  ];

  // Fetch all teachers
  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await api.get('auth/users?role=teacher');
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Fetch all attendance records
  const fetchAllAttendance = async () => {
    setLoading(true);
    try {
      // Fetch attendance for each teacher and combine
      const allRecords = [];
      
      for (const teacher of teachers) {
        const teacherId = teacher.teacher?.teacherId || teacher.id;
        try {
          const response = await api.get(`attendance/teacher/${teacherId}`, {
            params: { month: '', year: '' }
          });
          
          if (response.data.success && response.data.data.recent_daily_attendance) {
            const recordsWithTeacher = response.data.data.recent_daily_attendance.map(record => ({
              ...record,
              teacherName: teacher.name,
              teacherId: teacherId,
              teacherSchoolId: teacher.teacher?.teacherId,
              status: record.status
            }));
            allRecords.push(...recordsWithTeacher);
          }
        } catch (err) {
          console.error(`Error fetching attendance for teacher ${teacher.name}:`, err);
        }
      }
      
      // Sort by date - most recent first
      const sortedRecords = allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceRecords(sortedRecords);
      setFilteredRecords(sortedRecords);
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setMessage({ type: 'error', text: 'Failed to fetch attendance records' });
    } finally {
      setLoading(false);
    }
  };

  // Update attendance status
  const handleUpdateAttendance = async () => {
    if (!editingRecord) return;
    
    setLoading(true);
    try {
      const response = await api.post('attendance/teacher/mark', {
        teacherId: editingRecord.teacherId,
        status: editingRecord.newStatus,
        date: editingRecord.date,
        remark: editingRecord.remark || '',
        checkInTime: editingRecord.check_in_time || '',
        checkOutTime: editingRecord.check_out_time || ''
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: `Attendance updated to ${editingRecord.newStatus}` });
        setEditingRecord(null);
        setShowUpdateBox(false);
        // Refresh records
        await fetchAllAttendance();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update attendance' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...attendanceRecords];
    
    if (filterDate) {
      filtered = filtered.filter(record => record.date === filterDate);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }
    
    if (selectedTeacher) {
      filtered = filtered.filter(record => record.teacherId === selectedTeacher);
    }
    
    setFilteredRecords(filtered);
  }, [filterDate, filterStatus, selectedTeacher, attendanceRecords]);

  // Initial fetch
  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (teachers.length > 0) {
      fetchAllAttendance();
    }
  }, [teachers]);

  const getStatusBadge = (status) => {
    const config = {
      present: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      absent: { color: 'bg-red-100 text-red-700', icon: X },
      late: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'half-day': { color: 'bg-orange-100 text-orange-700', icon: Sun }
    };
    const { color, icon: Icon } = config[status] || config.absent;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
        <Icon className="w-3 h-3" /> {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          All Teacher Attendance Records
        </h3>
        <p className="text-blue-100 text-sm">Most recent records displayed first • Click Edit to update status</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`m-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.teacher?.teacherId}>
                {teacher.name} ({teacher.teacher?.teacherId})
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Filter by date"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setSelectedTeacher('');
              setFilterDate('');
              setFilterStatus('all');
            }}
            className="px-3 py-1.5 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No attendance records found
          </div>
        ) : (
          <div className="divide-y">
            {filteredRecords.map((record, index) => (
              <div key={`${record.id}-${index}`} className="p-4 hover:bg-gray-50 transition group">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left side - Teacher info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-semibold text-gray-800">{record.teacherName}</h4>
                      <span className="text-sm text-gray-500">ID: {record.teacherId}</span>
                      {getStatusBadge(record.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(record.date).toLocaleDateString()}
                      </span>
                      {record.check_in_time && (
                        <span>Check In: {record.check_in_time}</span>
                      )}
                      {record.check_out_time && (
                        <span>Check Out: {record.check_out_time}</span>
                      )}
                    </div>
                    {record.remark && (
                      <p className="text-sm text-gray-500 mt-1">Remark: {record.remark}</p>
                    )}
                  </div>
                  
                  {/* Right side - Edit button */}
                  <button
                    onClick={() => {
                      setEditingRecord({
                        id: record.id,
                        teacherId: record.teacherId,
                        teacherName: record.teacherName,
                        date: record.date,
                        status: record.status,
                        newStatus: record.status,
                        remark: record.remark || '',
                        check_in_time: record.check_in_time || '',
                        check_out_time: record.check_out_time || ''
                      });
                      setShowUpdateBox(true);
                    }}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1 opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Dropdown Box */}
      {showUpdateBox && editingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUpdateBox(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Update Attendance</h3>
              <button onClick={() => setShowUpdateBox(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <input type="text" value={editingRecord.teacherName} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={editingRecord.date} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={editingRecord.newStatus}
                  onChange={(e) => setEditingRecord({ ...editingRecord, newStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                <textarea
                  value={editingRecord.remark}
                  onChange={(e) => setEditingRecord({ ...editingRecord, remark: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add remark..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUpdateBox(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAttendance}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAttendanceRecords;