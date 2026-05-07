// components/Attendance/ViewAttendance.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Calendar, Loader, Eye, BarChart3, TrendingUp, 
  CheckCircle, XCircle, Clock, Sun, Users,
  ChevronLeft, ChevronRight, Download, Filter,
  Award, AlertTriangle, UserCheck
} from 'lucide-react';

const ViewAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('monthly'); // monthly or daily
  const [studentInfo, setStudentInfo] = useState(null);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [parentChildren, setParentChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (user?.role === 'parent') {
      fetchParentChildren();
    } else if (user?.role === 'student') {
      fetchStudentAttendance();
    } else if (user?.role === 'teacher') {
      fetchTeacherAttendance();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'student' && studentInfo) {
      fetchAttendanceData(studentInfo.id);
    } else if (user?.role === 'teacher' && teacherInfo) {
      fetchTeacherAttendanceData();
    } else if (user?.role === 'parent' && selectedChild) {
      fetchChildAttendance(selectedChild);
    }
  }, [selectedMonth, selectedYear, viewMode, studentInfo, teacherInfo, selectedChild]);

  const fetchParentChildren = async () => {
    setLoading(true);
    try {
      const response = await api.get('attendance/parent/children');
      if (response.data.success) {
        setParentChildren(response.data.data.children);
        if (response.data.data.children.length > 0) {
          setSelectedChild(response.data.data.children[0].student);
        }
      }
    } catch (error) {
      console.error('Error fetching parent children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = user.student?.id || storedUser.student?.id;
      
      if (!studentId) {
        console.error('No student ID found');
        setLoading(false);
        return;
      }

      setStudentInfo({ id: studentId });
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchAttendanceData = async (studentId) => {
    setLoading(true);
    try {
      const response = await api.get(`attendance/student/${studentId}`, {
        params: { month: selectedMonth, year: selectedYear }
      });
      
      if (response.data.success) {
        setMonthlyRecords(response.data.data.monthly_records || []);
        setDailyRecords(response.data.data.recent_daily_attendance || []);
        setSummary(response.data.data.summary);
        setStudentInfo(response.data.data.student);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildAttendance = async (child) => {
    setLoading(true);
    try {
      const response = await api.get(`attendance/student/${child.id}`, {
        params: { month: selectedMonth, year: selectedYear }
      });
      
      if (response.data.success) {
        setMonthlyRecords(response.data.data.monthly_records || []);
        setDailyRecords(response.data.data.recent_daily_attendance || []);
        setSummary(response.data.data.summary);
        setStudentInfo(response.data.data.student);
      }
    } catch (error) {
      console.error('Error fetching child attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherAttendance = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const teacherId = user.teacher?.id || storedUser.teacher?.id;
      
      if (!teacherId) {
        setLoading(false);
        return;
      }

      const response = await api.get(`attendance/teacher/${teacherId}`, {
        params: { month: selectedMonth, year: selectedYear }
      });
      
      if (response.data.success) {
        setMonthlyRecords(response.data.data.monthly_attendance || []);
        setDailyRecords(response.data.data.recent_daily_attendance || []);
        setSummary(response.data.data.summary);
        setTeacherInfo(response.data.data.teacher);
      }
    } catch (error) {
      console.error('Error fetching teacher attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherAttendanceData = async () => {
    if (!teacherInfo) return;
    setLoading(true);
    try {
      const response = await api.get(`attendance/teacher/${teacherInfo.id}`, {
        params: { month: selectedMonth, year: selectedYear }
      });
      
      if (response.data.success) {
        setMonthlyRecords(response.data.data.monthly_attendance || []);
        setDailyRecords(response.data.data.recent_daily_attendance || []);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'late': return 'bg-yellow-100 text-yellow-700';
      case 'half-day': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      case 'half-day': return <Sun className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading attendance records...</p>
      </div>
    );
  }

  // Parent View
  if (user?.role === 'parent') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Children's Attendance
          </h2>
        </div>
        
        <div className="p-6">
          {/* Child Selector */}
          {parentChildren.length > 0 && (
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              {parentChildren.map((child, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChild(child.student)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedChild?.id === child.student.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  {child.student.name} - {child.student.class}{child.student.section}
                </button>
              ))}
            </div>
          )}
          
          {selectedChild && (
            <StudentAttendanceView
              studentInfo={selectedChild}
              monthlyRecords={monthlyRecords}
              dailyRecords={dailyRecords}
              summary={summary}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              setSelectedMonth={setSelectedMonth}
              setSelectedYear={setSelectedYear}
              viewMode={viewMode}
              setViewMode={setViewMode}
              months={months}
              years={years}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          )}
        </div>
      </div>
    );
  }

  // Student View
  if (user?.role === 'student' && studentInfo) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            My Attendance Records
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {studentInfo.name} - {studentInfo.class}{studentInfo.section} (Roll No: {studentInfo.rollNumber})
          </p>
        </div>
        
        <div className="p-6">
          <StudentAttendanceView
            studentInfo={studentInfo}
            monthlyRecords={monthlyRecords}
            dailyRecords={dailyRecords}
            summary={summary}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            viewMode={viewMode}
            setViewMode={setViewMode}
            months={months}
            years={years}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </div>
      </div>
    );
  }

  // Teacher View
  if (user?.role === 'teacher' && teacherInfo) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            My Attendance Records
          </h2>
          <p className="text-green-100 text-sm mt-1">
            {teacherInfo.name} - {teacherInfo.teacherId}
          </p>
        </div>
        
        <div className="p-6">
          <TeacherAttendanceView
            teacherInfo={teacherInfo}
            monthlyRecords={monthlyRecords}
            dailyRecords={dailyRecords}
            summary={summary}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            viewMode={viewMode}
            setViewMode={setViewMode}
            months={months}
            years={years}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Unable to load attendance data</p>
      <p className="text-sm text-gray-400 mt-1">Please ensure you are logged in correctly</p>
    </div>
  );
};

// Student Attendance View Component
const StudentAttendanceView = ({ 
  studentInfo, monthlyRecords, dailyRecords, summary,
  selectedMonth, selectedYear, setSelectedMonth, setSelectedYear,
  viewMode, setViewMode, months, years,
  getStatusColor, getStatusIcon
}) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && summary.totalWorkingDays > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Days</p>
                <p className="text-2xl font-bold">{summary.totalWorkingDays}</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Present</p>
                <p className="text-2xl font-bold">{summary.totalPresent}</p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Absent</p>
                <p className="text-2xl font-bold">{summary.totalAbsent}</p>
              </div>
              <XCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Percentage</p>
                <p className="text-2xl font-bold">{summary.overallPercentage}%</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'monthly' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Monthly View
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'daily' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Daily View
          </button>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {months.map(month => <option key={month} value={month}>{month}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      {/* Monthly View */}
      {viewMode === 'monthly' && (
        monthlyRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Month</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Working Days</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Present</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Absent</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Late</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Half Day</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRecords.map((record) => (
                  <tr key={record.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{record.month}</td>
                    <td className="px-4 py-3">{record.year}</td>
                    <td className="px-4 py-3">{record.total_working_days}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">{record.days_present}</td>
                    <td className="px-4 py-3 text-red-600">{record.days_absent}</td>
                    <td className="px-4 py-3 text-yellow-600">{record.days_late || 0}</td>
                    <td className="px-4 py-3 text-orange-600">{record.days_half_day || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        record.percentage >= 75 ? 'bg-green-100 text-green-700' :
                        record.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No monthly records found for {selectedMonth} {selectedYear}</p>
          </div>
        )
      )}

      {/* Daily View */}
      {viewMode === 'daily' && (
        dailyRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Check In</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Check Out</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody>
                {dailyRecords.map((record) => (
                  <tr key={record.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{record.check_in_time || '-'}</td>
                    <td className="px-4 py-3">{record.check_out_time || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{record.remark || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No daily records found for {selectedMonth} {selectedYear}</p>
          </div>
        )
      )}
    </div>
  );
};

// Teacher Attendance View Component
const TeacherAttendanceView = ({ 
  teacherInfo, monthlyRecords, dailyRecords, summary,
  selectedMonth, selectedYear, setSelectedMonth, setSelectedYear,
  viewMode, setViewMode, months, years,
  getStatusColor, getStatusIcon
}) => {
  return (
    <div className="space-y-6">
      {/* Similar to StudentAttendanceView but for teachers */}
      {summary && summary.totalWorkingDays > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Days</p>
                <p className="text-2xl font-bold">{summary.totalWorkingDays}</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Present</p>
                <p className="text-2xl font-bold">{summary.totalPresent}</p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Absent</p>
                <p className="text-2xl font-bold">{summary.totalAbsent}</p>
              </div>
              <XCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Percentage</p>
                <p className="text-2xl font-bold">{summary.overallPercentage}%</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and table similar to student view */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'monthly' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Monthly View
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'daily' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Daily View
          </button>
        </div>

        <div className="flex gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            {months.map(month => <option key={month} value={month}>{month}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      {/* Monthly Table */}
      {viewMode === 'monthly' && monthlyRecords.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-left">Year</th>
              <th className="px-4 py-3 text-left">Working Days</th><th className="px-4 py-3 text-left">Present</th>
              <th className="px-4 py-3 text-left">Absent</th><th className="px-4 py-3 text-left">Percentage</th><th className="px-4 py-3 text-left">Remark</th></tr>
            </thead>
            <tbody>
              {monthlyRecords.map((record) => (
                <tr key={record.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{record.month}</td>
                  <td className="px-4 py-3">{record.year}</td>
                  <td className="px-4 py-3">{record.total_working_days}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{record.days_present}</td>
                  <td className="px-4 py-3 text-red-600">{record.days_absent}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.percentage >= 75 ? 'bg-green-100 text-green-700' : record.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{record.percentage}%</span></td>
                  <td className="px-4 py-3 text-gray-500">{record.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Daily Table */}
      {viewMode === 'daily' && dailyRecords.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Check In</th><th className="px-4 py-3 text-left">Check Out</th>
              <th className="px-4 py-3 text-left">Remark</th></tr>
            </thead>
            <tbody>
              {dailyRecords.map((record) => (
                <tr key={record.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>{getStatusIcon(record.status)}{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span></td>
                  <td className="px-4 py-3">{record.check_in_time || '-'}</td>
                  <td className="px-4 py-3">{record.check_out_time || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{record.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'monthly' && monthlyRecords.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg"><p className="text-gray-500">No monthly records found</p></div>
      )}
      {viewMode === 'daily' && dailyRecords.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg"><p className="text-gray-500">No daily records found</p></div>
      )}
    </div>
  );
};

export default ViewAttendance;