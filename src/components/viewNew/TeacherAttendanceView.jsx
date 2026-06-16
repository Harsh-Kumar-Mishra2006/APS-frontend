// src/components/teacher/TeacherAttendanceView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Loader,
  User,
  Briefcase,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const TeacherAttendanceView = ({ teacherId }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Set default month to current month
  useEffect(() => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    setSelectedMonth(currentMonth);
  }, []);

  // Fetch attendance with pagination
  useEffect(() => {
    if (teacherId && selectedMonth && selectedYear) {
      fetchAttendance();
    }
  }, [teacherId, selectedMonth, selectedYear, currentPage]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        month: selectedMonth,
        year: selectedYear,
        page: currentPage,
        limit: 20 // Limit daily records
      };
      
      const response = await api.get(`attendance/teacher/${teacherId}`, { params });
      
      if (response.data.success) {
        setAttendanceData(response.data.data);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setHasMore(response.data.pagination?.hasMore || false);
      } else {
        setError('Failed to fetch attendance data');
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: { icon: CheckCircle, text: 'Present', class: 'bg-green-100 text-green-700' },
      absent: { icon: XCircle, text: 'Absent', class: 'bg-red-100 text-red-700' },
      late: { icon: Clock, text: 'Late', class: 'bg-yellow-100 text-yellow-700' },
      half_day: { icon: Clock, text: 'Half Day', class: 'bg-orange-100 text-orange-700' },
      not_marked: { icon: AlertCircle, text: 'Not Marked', class: 'bg-gray-100 text-gray-500' }
    };
    const badge = badges[status] || badges.not_marked;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const exportToCSV = () => {
    if (!attendanceData?.monthly_attendance) return;
    
    const headers = ['Month', 'Year', 'Working Days', 'Present', 'Absent', 'Late', 'Half Day', 'Percentage'];
    const csvData = attendanceData.monthly_attendance.map(record => [
      record.month,
      record.year,
      record.total_working_days,
      record.days_present,
      record.days_absent,
      record.days_late || 0,
      record.days_half_day || 0,
      `${record.percentage}%`
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher_attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Memoize summary calculations
  const summaryData = useMemo(() => {
    if (!attendanceData?.summary) return null;
    return attendanceData.summary;
  }, [attendanceData]);

  // Memoize monthly records
  const monthlyRecords = useMemo(() => {
    if (!attendanceData?.monthly_attendance) return [];
    return attendanceData.monthly_attendance;
  }, [attendanceData]);

  // Memoize daily records
  const dailyRecords = useMemo(() => {
    if (!attendanceData?.recent_daily_attendance) return [];
    return attendanceData.recent_daily_attendance;
  }, [attendanceData]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 text-gray-600">Loading attendance records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchAttendance}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!attendanceData) return null;

  const { teacher } = attendanceData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Attendance Record</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{teacher?.qualification || 'Teacher'}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{teacher?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{selectedMonth} {selectedYear}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex-1"></div>
          <div className="text-sm text-gray-500">
            {loading && <Loader className="w-4 h-4 animate-spin inline mr-1" />}
            {!loading && attendanceData && `${attendanceData.totalRecords || 0} records found`}
          </div>
        </div>
      </div>

      {/* Overall Summary Card */}
      {summaryData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Overall Attendance Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Working Days</p>
              <p className="text-2xl font-bold text-gray-800">{summaryData.totalWorkingDays || 0}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">{summaryData.totalPresent || 0}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <p className="text-xs text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">{summaryData.totalAbsent || 0}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <p className="text-xs text-gray-500">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{summaryData.totalLate || 0}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-xs text-gray-500">Percentage</p>
              <p className={`text-2xl font-bold ${getPercentageColor(summaryData.overallPercentage || 0)}`}>
                {summaryData.overallPercentage || 0}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Attendance Rate</span>
              <span>{summaryData.overallPercentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${getProgressColor(summaryData.overallPercentage || 0)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(summaryData.overallPercentage || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Monthly Records */}
      {monthlyRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Monthly Attendance History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Working Days</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Present</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Absent</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Late</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{record.month} {record.year}</td>
                    <td className="px-4 py-3 text-center">{record.total_working_days}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{record.days_present}</td>
                    <td className="px-4 py-3 text-center text-red-600">{record.days_absent}</td>
                    <td className="px-4 py-3 text-center text-yellow-600">{record.days_late || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${getPercentageColor(record.percentage)}`}>
                        {record.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Daily Attendance */}
      {dailyRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Daily Attendance Records
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
                className={`p-1 rounded ${!hasMore ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 p-4">
            {dailyRecords.map((day, idx) => (
              <div key={idx} className="border rounded-lg p-3 text-center hover:shadow-md transition">
                <p className="text-xs text-gray-500 font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="mt-2">{getStatusBadge(day.status)}</div>
                {day.check_in_time && (
                  <p className="text-xs text-gray-400 mt-1">In: {day.check_in_time}</p>
                )}
                {day.check_out_time && (
                  <p className="text-xs text-gray-400">Out: {day.check_out_time}</p>
                )}
              </div>
            ))}
          </div>
          {loading && (
            <div className="flex justify-center py-4">
              <Loader className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceView;