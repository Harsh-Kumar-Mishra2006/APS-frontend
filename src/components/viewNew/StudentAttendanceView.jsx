// src/components/student/StudentAttendanceView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import { 
  Calendar, CheckCircle, XCircle, Clock, AlertCircle,
  TrendingUp, Download, Loader, User, GraduationCap, Eye
} from 'lucide-react';

const StudentAttendanceView = ({ studentId, userRole }) => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [cachedData, setCachedData] = useState({});

  const months = useMemo(() => 
    ['January', 'February', 'March', 'April', 'May', 'June', 
     'July', 'August', 'September', 'October', 'November', 'December'], []
  );
  
  const years = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i), []
  );

  // Create cache key
  const getCacheKey = useCallback(() => {
    return `${studentId}_${selectedMonth}_${selectedYear}`;
  }, [studentId, selectedMonth, selectedYear]);

  // Fetch with caching
  const fetchAttendance = useCallback(async (forceRefresh = false) => {
    const cacheKey = getCacheKey();
    
    // Check cache first
    if (!forceRefresh && cachedData[cacheKey]) {
      setAttendanceData(cachedData[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await api.get(`attendance/student/${studentId}`, { 
        params, 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.data.success) {
        const data = response.data.data;
        setAttendanceData(data);
        // Cache the data
        setCachedData(prev => ({ ...prev, [cacheKey]: data }));
      } else {
        setError('Failed to fetch attendance data');
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
      if (err.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch attendance');
      }
    } finally {
      setLoading(false);
    }
  }, [studentId, selectedMonth, selectedYear, getCacheKey, cachedData]);

  useEffect(() => {
    if (studentId) {
      fetchAttendance();
    }
  }, [studentId, selectedMonth, selectedYear, fetchAttendance]);

  // Manual refresh
  const handleRefresh = () => {
    fetchAttendance(true);
  };

  const getStatusBadge = useCallback((status) => {
    const badges = {
      present: { icon: CheckCircle, text: 'Present', class: 'bg-green-100 text-green-700' },
      absent: { icon: XCircle, text: 'Absent', class: 'bg-red-100 text-red-700' },
      late: { icon: Clock, text: 'Late', class: 'bg-yellow-100 text-yellow-700' },
      'half-day': { icon: AlertCircle, text: 'Half Day', class: 'bg-orange-100 text-orange-700' },
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
  }, []);

  const getPercentageColor = useCallback((percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  const getProgressColor = useCallback((percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }, []);

  // Lazy load export function
  const exportToCSV = useCallback(async () => {
    if (!attendanceData?.monthly_records) return;
    
    // Dynamic import for file-saver (only when needed)
    const { saveAs } = await import('file-saver');
    
    const headers = ['Month', 'Year', 'Working Days', 'Present', 'Absent', 'Late', 'Half Day', 'Percentage'];
    const csvData = attendanceData.monthly_records.map(record => [
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
    saveAs(blob, `attendance_${attendanceData.student?.name}_${new Date().toISOString().split('T')[0]}.csv`);
  }, [attendanceData]);

  // Show skeleton loader for better UX
  if (loading && !attendanceData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-48 mb-3"></div>
            <div className="h-4 bg-white/20 rounded w-64"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="h-10 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!attendanceData) return null;

  const { student, current_month, monthly_records, recent_daily_attendance, summary } = attendanceData;

  // Limit recent attendance to last 15 days only for performance
  const limitedRecentAttendance = recent_daily_attendance?.slice(0, 15) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Attendance Overview</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                <span>{student?.class} {student?.section}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Roll No: {student?.rollNumber}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm"
            >
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Current Month Stats - Only show if data exists */}
      {current_month && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            {current_month.month} {current_month.year} Performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">{current_month.present}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <p className="text-xs text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">{current_month.absent}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <p className="text-xs text-gray-500">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{current_month.late || 0}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-xs text-gray-500">Half Day</p>
              <p className="text-2xl font-bold text-orange-600">{current_month.halfDay || 0}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-xs text-gray-500">Attendance</p>
              <p className={`text-2xl font-bold ${getPercentageColor(current_month.percentage)}`}>
                {current_month.percentage}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${getProgressColor(current_month.percentage)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${current_month.percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Monthly Records - Virtualized for performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Monthly Attendance History
          </h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Working Days</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Present</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Absent</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthly_records?.slice(0, 12).map((record, idx) => ( // Limit to last 12 months
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{record.month} {record.year}</td>
                  <td className="px-4 py-3 text-center">{record.total_working_days}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">{record.days_present}</td>
                  <td className="px-4 py-3 text-center text-red-600">{record.days_absent}</td>
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

      {/* Recent Daily Attendance - Limited to 15 days */}
      {limitedRecentAttendance.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Recent Attendance (Last 15 Days)
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 p-4">
            {limitedRecentAttendance.map((day, idx) => (
              <div key={idx} className="border rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="mt-1">{getStatusBadge(day.status)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(StudentAttendanceView);