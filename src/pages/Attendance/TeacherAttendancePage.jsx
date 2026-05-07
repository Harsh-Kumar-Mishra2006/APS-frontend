// pages/Attendance/TeacherAttendancePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Calendar, Users, UserCheck, Clock, BarChart3,
  BookOpen, Loader, CheckCircle, TrendingUp,
  Sparkles, Shield, Search, Eye, PenTool, X, Sun,
  Zap, Save, AlertCircle, Moon
} from 'lucide-react';

const TeacherAttendancePage = () => {
  const { user, loading, authChecked } = useAuth();
  
  // ============= ALL HOOKS MUST BE FIRST =============
  const [activeTab, setActiveTab] = useState('mark');
  const [submitting, setSubmitting] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewTeacherId, setViewTeacherId] = useState('');
  const [viewMonth, setViewMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewMode, setViewMode] = useState('monthly');
  const [formData, setFormData] = useState({
    teacherId: '',
    status: 'present',
    date: new Date().toISOString().split('T')[0],
    remark: '',
    checkInTime: '',
    checkOutTime: ''
  });

  // ============= DEFINE FUNCTIONS FIRST =============
  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await api.get('users?role=teacher');
      if (response.data.success) setTeachers(response.data.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Present', icon: CheckCircle, color: 'green' },
    { value: 'absent', label: 'Absent', icon: X, color: 'red' },
    { value: 'late', label: 'Late', icon: Clock, color: 'yellow' },
    { value: 'half-day', label: 'Half Day', icon: Sun, color: 'orange' },
    { value: 'on-leave', label: 'On Leave', icon: Calendar, color: 'purple' }
  ];

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teacherId) {
      setMessage({ type: 'error', text: 'Please enter Teacher ID' });
      return;
    }
    setSubmitting(true);
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
          teacherId: '', status: 'present', date: new Date().toISOString().split('T')[0],
          remark: '', checkInTime: '', checkOutTime: ''
        });
        setSelectedTeacher('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to mark attendance' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleViewAttendance = async () => {
    if (!viewTeacherId) {
      setMessage({ type: 'error', text: 'Please enter Teacher ID' });
      return;
    }
    setViewLoading(true);
    try {
      const response = await api.get(`attendance/teacher/${viewTeacherId}`, {
        params: { month: viewMonth, year: viewYear }
      });
      if (response.data.success) setAttendanceData(response.data.data);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to fetch attendance' });
    } finally {
      setViewLoading(false);
    }
  };

  // ============= useEffect AFTER function definitions =============
  useEffect(() => {
    fetchTeachers();
  }, []);

  // ============= AFTER ALL HOOKS AND FUNCTIONS, THEN CONDITIONAL RETURNS =============
  
  // Check loading state
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access teacher attendance management.</p>
        </div>
      </div>
    );
  }

  // ============= RENDER =============
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Teacher Attendance Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Teacher Attendance
              </h1>
              <p className="text-lg text-green-100">Mark daily attendance using Teacher ID • Auto-calculate monthly summaries</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div className="text-xs opacity-80">Current Date</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F3F4F6"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Switcher */}
        <div className="flex gap-3 bg-white rounded-xl p-1 mb-8 w-full md:w-auto shadow-lg">
          <button
            onClick={() => setActiveTab('mark')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'mark' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'view' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            View Records
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Mark Attendance Tab */}
        {activeTab === 'mark' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Mark Teacher Daily Attendance
              </h3>
              <p className="text-green-100 text-sm">Enter Teacher ID to mark daily attendance</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="teacherId" value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      placeholder="Enter Teacher ID (e.g., TCH001)" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      list="teachers-list" required />
                    <datalist id="teachers-list">
                      {teachers.map(teacher => <option key={teacher.id} value={teacher.teacher?.teacherId}>{teacher.name} - {teacher.teacher?.teacherId}</option>)}
                    </datalist>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Use School ID assigned to the teacher (e.g., TCH001)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <div className="flex gap-2 flex-wrap">
                    {statusOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <button key={option.value} type="button" onClick={() => setFormData({ ...formData, status: option.value })}
                          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            formData.status === option.value ? `bg-${option.color}-600 text-white shadow-md` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}>
                          <Icon className="w-4 h-4" /> {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
                  <input type="time" name="checkInTime" value={formData.checkInTime} onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
                  <input type="time" name="checkOutTime" value={formData.checkOutTime} onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                  <textarea name="remark" value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Any notes about this attendance..." />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                Mark Teacher Attendance
              </button>
            </form>
          </div>
        )}

        {/* View Attendance Tab */}
        {activeTab === 'view' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                View Teacher Attendance Records
              </h3>
              <p className="text-purple-100 text-sm">Enter Teacher ID to view attendance history</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID *</label>
                  <input type="text" value={viewTeacherId} onChange={(e) => setViewTeacherId(e.target.value)}
                    placeholder="Enter Teacher ID (e.g., TCH001)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select value={viewMonth} onChange={(e) => setViewMonth(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    {months.map(month => <option key={month} value={month}>{month}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select value={viewYear} onChange={(e) => setViewYear(parseInt(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={handleViewAttendance} disabled={viewLoading || !viewTeacherId}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-6">
                {viewLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                View Attendance
              </button>

              {attendanceData && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Teacher Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{attendanceData.teacher?.name}</p></div>
                      <div><p className="text-sm text-gray-500">Teacher ID</p><p className="font-medium">{attendanceData.teacher?.id}</p></div>
                      <div><p className="text-sm text-gray-500">Qualification</p><p className="font-medium">{attendanceData.teacher?.qualification || '-'}</p></div>
                    </div>
                  </div>

                  {attendanceData.summary?.totalWorkingDays > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-500 rounded-lg p-3 text-white text-center"><p className="text-xs">Total Days</p><p className="text-2xl font-bold">{attendanceData.summary.totalWorkingDays}</p></div>
                      <div className="bg-green-500 rounded-lg p-3 text-white text-center"><p className="text-xs">Present</p><p className="text-2xl font-bold">{attendanceData.summary.totalPresent}</p></div>
                      <div className="bg-red-500 rounded-lg p-3 text-white text-center"><p className="text-xs">Absent</p><p className="text-2xl font-bold">{attendanceData.summary.totalAbsent}</p></div>
                      <div className="bg-purple-500 rounded-lg p-3 text-white text-center"><p className="text-xs">Percentage</p><p className="text-2xl font-bold">{attendanceData.summary.overallPercentage}%</p></div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setViewMode('monthly')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${viewMode === 'monthly' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <BarChart3 className="w-4 h-4" /> Monthly View
                    </button>
                    <button onClick={() => setViewMode('daily')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${viewMode === 'daily' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Calendar className="w-4 h-4" /> Daily View
                    </button>
                  </div>

                  {viewMode === 'monthly' && attendanceData.monthly_attendance?.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Month</th><th className="px-4 py-2 text-left">Year</th><th className="px-4 py-2 text-left">Present</th><th className="px-4 py-2 text-left">Absent</th><th className="px-4 py-2 text-left">Percentage</th><th className="px-4 py-2 text-left">Remark</th></tr></thead>
                        <tbody>{attendanceData.monthly_attendance.map((record) => (<tr key={record.id} className="border-t"><td className="px-4 py-2">{record.month}</td><td className="px-4 py-2">{record.year}</td><td className="px-4 py-2 text-green-600">{record.days_present}</td><td className="px-4 py-2 text-red-600">{record.days_absent}</td><td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.percentage >= 75 ? 'bg-green-100 text-green-700' : record.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{record.percentage}%</span></td><td className="px-4 py-2">{record.remark || '-'}</td></tr>))}</tbody>
                      </table>
                    </div>
                  )}

                  {viewMode === 'daily' && attendanceData.recent_daily_attendance?.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-left">Check In</th><th className="px-4 py-2 text-left">Check Out</th><th className="px-4 py-2 text-left">Remark</th></tr></thead>
                        <tbody>{attendanceData.recent_daily_attendance.map((record) => (<tr key={record.id} className="border-t"><td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td><td className="px-4 py-2"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'present' ? 'bg-green-100 text-green-700' : record.status === 'absent' ? 'bg-red-100 text-red-700' : record.status === 'late' ? 'bg-yellow-100 text-yellow-700' : record.status === 'half-day' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>{record.status}</span></td><td className="px-4 py-2">{record.check_in_time || '-'}</td><td className="px-4 py-2">{record.check_out_time || '-'}</td><td className="px-4 py-2">{record.remark || '-'}</td></tr>))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-xs text-green-600">📝 Daily teacher attendance automatically calculates monthly summaries</p></div>
          <div className="bg-purple-50 rounded-xl p-3 text-center"><p className="text-xs text-purple-600">👨‍🏫 Use Teacher ID (e.g., TCH001) to mark attendance quickly</p></div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
};

export default TeacherAttendancePage;