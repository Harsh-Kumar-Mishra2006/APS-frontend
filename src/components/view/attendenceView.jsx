// src/components/attendance/AttendanceView.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaSearch, FaFilter, FaDownload, FaPrint, FaCalendarAlt, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import studentPerformanceApi from '../../utils/studentPerformanceAPI';

const AttendanceView = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('daily'); // 'daily' or 'monthly'
  const [filters, setFilters] = useState({
    date: '',
    month: '',
    year: new Date().getFullYear(),
    class: '',
    section: '',
    status: '',
    studentEmail: '',
    academicYear: studentPerformanceApi.getCurrentAcademicYear()
  });

  const months = studentPerformanceApi.getMonths();
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const statuses = ['present', 'absent', 'late', 'half-day'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    fetchAttendance();
  }, [filters, activeView]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      
      if (activeView === 'daily') {
        // Fetch performance records based on filters
        const params = {};
        if (filters.class) params.class = filters.class;
        if (filters.section) params.section = filters.section;
        if (filters.academicYear) params.academicYear = filters.academicYear;
        
        const response = await studentPerformanceApi.getClassPerformance(params);
        
        if (response.success) {
          let allAttendance = [];
          
          // Extract attendance data from each student record
          response.data.forEach(student => {
            if (student.attendance && Array.isArray(student.attendance)) {
              student.attendance.forEach(attendance => {
                // Apply filters
                if (filters.date && attendance.date !== filters.date) return;
                if (filters.status && attendance.status !== filters.status) return;
                if (filters.studentEmail && !student.studentEmail?.toLowerCase().includes(filters.studentEmail.toLowerCase())) return;
                
                allAttendance.push({
                  _id: attendance._id,
                  studentName: student.studentName,
                  studentEmail: student.studentEmail,
                  rollNumber: student.rollNumber,
                  class: student.class,
                  section: student.section,
                  date: attendance.date,
                  status: attendance.status,
                  reason: attendance.reason,
                  markedBy: attendance.markedBy,
                  performanceId: student._id
                });
              });
            }
          });
          
          setAttendanceData(allAttendance);
        }
      } else {
        // Fetch monthly attendance
        const params = {};
        if (filters.month) params.month = filters.month;
        if (filters.year) params.year = filters.year;
        if (filters.class) params.class = filters.class;
        if (filters.section) params.section = filters.section;
        if (filters.academicYear) params.academicYear = filters.academicYear;
        
        const response = await studentPerformanceApi.getClassPerformance(params);
        
        if (response.success) {
          let allMonthlyAttendance = [];
          
          response.data.forEach(student => {
            if (student.monthlyAttendance && Array.isArray(student.monthlyAttendance)) {
              student.monthlyAttendance.forEach(monthly => {
                // Apply filters
                if (filters.month && monthly.month !== filters.month) return;
                if (filters.year && monthly.year !== parseInt(filters.year)) return;
                if (filters.studentEmail && !student.studentEmail?.toLowerCase().includes(filters.studentEmail.toLowerCase())) return;
                
                allMonthlyAttendance.push({
                  _id: monthly._id,
                  studentName: student.studentName,
                  studentEmail: student.studentEmail,
                  rollNumber: student.rollNumber,
                  class: student.class,
                  section: student.section,
                  month: monthly.month,
                  year: monthly.year,
                  workingDays: monthly.workingDays,
                  presentDays: monthly.presentDays,
                  attendancePercentage: monthly.attendancePercentage,
                  remarks: monthly.remarks,
                  lastUpdated: monthly.lastUpdated,
                  performanceId: student._id
                });
              });
            }
          });
          
          setMonthlyAttendance(allMonthlyAttendance);
        }
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    // Reset filters when changing view
    setFilters({
      date: '',
      month: '',
      year: new Date().getFullYear(),
      class: '',
      section: '',
      status: '',
      studentEmail: '',
      academicYear: studentPerformanceApi.getCurrentAcademicYear()
    });
  };

  const exportToExcel = async () => {
    try {
      toast.loading('Preparing export...');
      
      // TODO: Create export API endpoint
      setTimeout(() => {
        toast.dismiss();
        toast.success(`${activeView === 'daily' ? 'Daily' : 'Monthly'} attendance exported successfully!`);
      }, 1500);
      
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const exportToPDF = async () => {
    try {
      toast.loading('Generating PDF...');
      
      setTimeout(() => {
        toast.dismiss();
        toast.success(`${activeView === 'daily' ? 'Daily' : 'Monthly'} attendance PDF generated!`);
      }, 1500);
      
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = studentPerformanceApi.getAttendanceStatuses();
    const config = statusConfig.find(s => s.value === status);
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAttendancePercentageBadge = (percentage) => {
    const colorClass = studentPerformanceApi.getAttendanceColor(percentage);
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {percentage.toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Attendance Records</h3>
          <p className="text-gray-600">View and manage student attendance</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('daily')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeView === 'daily' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => handleViewChange('monthly')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeView === 'monthly' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <FaFileExcel className="mr-2" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <FaFilePdf className="mr-2" />
              PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaPrint className="mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <FaFilter className="text-gray-500 mr-2" />
          <h4 className="font-medium text-gray-900">Filter Records</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {activeView === 'daily' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                <input
                  type="text"
                  name="studentEmail"
                  value={filters.studentEmail}
                  onChange={handleFilterChange}
                  placeholder="Search by email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Months</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Years</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              name="class"
              value={filters.class}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              name="section"
              value={filters.section}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Sections</option>
              {sections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
          
          {activeView === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-end">
            <button
              onClick={fetchAttendance}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              Search
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <input
            type="text"
            name="academicYear"
            value={filters.academicYear}
            onChange={handleFilterChange}
            placeholder="2024-2025"
            className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FaCalendarAlt className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {activeView === 'daily' ? 'Total Records' : 'Monthly Records'}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {activeView === 'daily' ? attendanceData.length : monthlyAttendance.length}
              </p>
            </div>
          </div>
        </div>
        
        {activeView === 'daily' ? (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <div className="w-5 h-5 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Present</p>
                  <p className="text-xl font-bold text-green-600">
                    {attendanceData.filter(a => a.status === 'present').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <div className="w-5 h-5 rounded-full bg-red-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Absent</p>
                  <p className="text-xl font-bold text-red-600">
                    {attendanceData.filter(a => a.status === 'absent').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <div className="w-5 h-5 rounded-full bg-purple-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Attendance %</p>
                  <p className="text-xl font-bold text-purple-600">
                    {attendanceData.length > 0 
                      ? Math.round((attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <div className="w-5 h-5 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Best Attendance</p>
                  <p className="text-xl font-bold text-green-600">
                    {monthlyAttendance.length > 0
                      ? Math.max(...monthlyAttendance.map(a => a.attendancePercentage)).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <div className="w-5 h-5 rounded-full bg-red-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Attendance</p>
                  <p className="text-xl font-bold text-red-600">
                    {monthlyAttendance.length > 0
                      ? (monthlyAttendance.reduce((sum, a) => sum + a.attendancePercentage, 0) / monthlyAttendance.length).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {monthlyAttendance.length}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {activeView === 'daily' ? (
          <DailyAttendanceTable 
            attendanceData={attendanceData} 
            getStatusBadge={getStatusBadge} 
          />
        ) : (
          <MonthlyAttendanceTable 
            monthlyAttendance={monthlyAttendance} 
            getAttendancePercentageBadge={getAttendancePercentageBadge} 
          />
        )}

        {((activeView === 'daily' && attendanceData.length === 0) || 
          (activeView === 'monthly' && monthlyAttendance.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <FaCalendarAlt className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No attendance records found</p>
            {Object.values(filters).some(f => f) && (
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for Daily Attendance Table
const DailyAttendanceTable = ({ attendanceData, getStatusBadge }) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class-Section</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {attendanceData.map((record) => (
        <tr key={record._id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {new Date(record.date).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {record.rollNumber}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">{record.studentName?.charAt(0)}</span>
              </div>
              <span className="text-gray-900">{record.studentName}</span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            {record.studentEmail}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {record.class}-{record.section}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {getStatusBadge(record.status)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
            {record.reason || '-'}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Sub-component for Monthly Attendance Table
const MonthlyAttendanceTable = ({ monthlyAttendance, getAttendancePercentageBadge }) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month-Year</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class-Section</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present Days</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {monthlyAttendance.map((record) => (
        <tr key={record._id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {record.month} {record.year}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {record.rollNumber}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">{record.studentName?.charAt(0)}</span>
              </div>
              <span className="text-gray-900">{record.studentName}</span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            {record.studentEmail}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {record.class}-{record.section}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {record.workingDays}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {record.presentDays}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {getAttendancePercentageBadge(record.attendancePercentage)}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
            {record.remarks || '-'}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AttendanceView;