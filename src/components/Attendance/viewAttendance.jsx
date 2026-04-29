import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Calendar, Loader, Eye, BarChart3, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

const ViewAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [entityId, setEntityId] = useState(null);

  // Get the actual student/teacher ID from localStorage or user object
  useEffect(() => {
    if (user?.role === 'student') {
      // Try to get student ID from user object or localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = user.student?.id || storedUser.student?.id;
      if (studentId) {
        setEntityId(studentId);
      } else {
        console.error('No student ID found - please login again');
      }
    } else if (user?.role === 'teacher') {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const teacherId = user.teacher?.id || storedUser.teacher?.id;
      if (teacherId) {
        setEntityId(teacherId);
      } else {
        console.error('No teacher ID found - please login again');
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'student' && entityId) {
      fetchStudentAttendance();
    } else if (user?.role === 'teacher' && entityId) {
      fetchTeacherAttendance();
    }
  }, [selectedMonth, selectedYear, user, entityId]);

  const fetchStudentAttendance = async () => {
    if (!entityId) return;
    
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      
      const response = await api.get(`attendance/student/${entityId}`, { params });
      if (response.data.success) {
        setAttendanceData(response.data.data.attendance || []);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching student attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherAttendance = async () => {
    if (!entityId) return;
    
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      
      const response = await api.get(`attendance/teacher/${entityId}`, { params });
      if (response.data.success) {
        setAttendanceData(response.data.data.attendance || []);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching teacher attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // For admin view, show different content
  if (user?.role === 'admin') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Admin: View all students attendance coming soon</p>
          <p className="text-sm text-gray-500 mt-1">Use the "View Attendance" from student list</p>
        </div>
      </div>
    );
  }

  if (!entityId && (user?.role === 'student' || user?.role === 'teacher')) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load attendance data</p>
          <p className="text-sm text-gray-500 mt-1">Please try logging out and logging in again</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Eye className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attendance Records</h2>
            <p className="text-gray-600">
              {user?.role === 'student' ? 'Your attendance history' : 
               user?.role === 'teacher' ? 'Your attendance records' : 'Attendance Overview'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
            <option value="">All Months</option>
            {months.map(month => <option key={month} value={month}>{month}</option>)}
          </select>

          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && summary.totalWorkingDays > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-sm opacity-90">Total Working Days</p><p className="text-2xl font-bold">{summary.totalWorkingDays}</p></div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-sm opacity-90">Present</p><p className="text-2xl font-bold">{summary.totalPresent}</p></div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-sm opacity-90">Absent</p><p className="text-2xl font-bold">{summary.totalAbsent}</p></div>
              <XCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-sm opacity-90">Overall Percentage</p><p className="text-2xl font-bold">{summary.overallPercentage}%</p></div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {attendanceData && attendanceData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Working Days</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Present</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Absent</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remark</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{record.month}</td>
                  <td className="px-4 py-3 text-sm">{record.year}</td>
                  <td className="px-4 py-3 text-sm">{record.total_working_days || record.totalWorkingDays}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">{record.days_present || record.daysPresent}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{record.days_absent || record.daysAbsent}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (record.percentage || 0) >= 75 ? 'bg-green-100 text-green-700' :
                      (record.percentage || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.percentage || 0}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{record.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No attendance records found</p>
          <p className="text-sm text-gray-500 mt-1">
            {selectedMonth || selectedYear !== new Date().getFullYear() 
              ? 'Try selecting a different month or year' 
              : 'No records available for the selected period'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewAttendance;