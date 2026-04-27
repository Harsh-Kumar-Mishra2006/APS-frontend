// src/pages/teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  BarChart3,
  Loader,
  User,
  Briefcase,
  Award,
  Users,
  BookOpen
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [teacherInfo, setTeacherInfo] = useState(null);

  useEffect(() => {
    fetchTeacherInfo();
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchTeacherInfo = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setTeacherInfo(response.data.data.teacher);
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      
      const response = await api.get(`/attendance/teacher/${user?.teacher?.id}`, { params });
      if (response.data.success) {
        setAttendanceData(response.data.data.attendance);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 75) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { text: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Needs Improvement', color: 'text-orange-600', bg: 'bg-orange-100' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
                <p className="text-green-100">Teacher Portal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100">Teacher ID</p>
              <p className="font-semibold">{teacherInfo?.teacherId || 'N/A'}</p>
              <p className="text-sm text-green-100 mt-1">Qualification</p>
              <p className="font-semibold">{teacherInfo?.qualification || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Working Days</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.totalWorkingDays}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Days Present</p>
                  <p className="text-2xl font-bold text-green-600">{summary.totalPresent}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Days Absent</p>
                  <p className="text-2xl font-bold text-red-600">{summary.totalAbsent}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Overall Attendance</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.overallPercentage}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Professional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Specialization</p>
                <p className="font-semibold text-gray-800">{teacherInfo?.specialization || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Experience</p>
                <p className="font-semibold text-gray-800">{teacherInfo?.experience || 0} years</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Qualification</p>
                <p className="font-semibold text-gray-800">{teacherInfo?.qualification || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Status Card */}
        {summary && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-800">Attendance Status</h2>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Months</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-600">
                    Overall Attendance Percentage
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {summary.overallPercentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
                <div 
                  style={{ width: `${summary.overallPercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                ></div>
              </div>
              <div className="text-center mt-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getAttendanceStatus(summary.overallPercentage).bg} ${getAttendanceStatus(summary.overallPercentage).color}`}>
                  {getAttendanceStatus(summary.overallPercentage).text}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Attendance History Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Attendance History</h2>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading attendance records...</p>
            </div>
          ) : attendanceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceData.map((record) => {
                    const status = getAttendanceStatus(record.percentage);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.totalWorkingDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{record.daysPresent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{record.daysAbsent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{record.percentage}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.remark || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attendance records found</p>
              <p className="text-sm text-gray-500 mt-1">Attendance records will appear here once added by admin</p>
            </div>
          )}
        </div>

        {/* My Classes Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">My Classes</h2>
          </div>
          <p className="text-gray-600 text-center py-4">
            Class assignments and schedules will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;