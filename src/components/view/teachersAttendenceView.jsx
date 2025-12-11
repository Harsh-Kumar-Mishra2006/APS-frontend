// src/view/teacherAttendanceView.jsx
import React, { useState, useEffect } from 'react';
import { useTeacherPerformance } from '../../hooks/useTeacherPerformance';

const TeacherAttendanceView = () => {
  const [teacherEmail, setTeacherEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    teacherInfo,
    monthlyAttendance,
    attendanceSummary,
    loading,
    getAttendanceByMonth,
    refresh,
    getMonths,
    getAttendanceColor,
    formatMonthYear,
    formatPercentage
  } = useTeacherPerformance(teacherEmail);

  const months = getMonths();
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!teacherEmail) {
      setError('Please enter teacher email');
      return;
    }
    
    setSearching(true);
    setError('');
    
    try {
      await refresh();
      setFilterMonth('');
      setFilterYear('');
    } catch (err) {
      setError(err.message || 'Failed to fetch teacher data');
    } finally {
      setSearching(false);
    }
  };

  const handleFilter = async () => {
    if (!teacherEmail) {
      setError('Please search for a teacher first');
      return;
    }
    
    try {
      const result = await getAttendanceByMonth(filterMonth, filterYear);
      if (result.success) {
        // Filter is handled by the hook
        // No need to do anything here as monthlyAttendance will update
      }
    } catch (err) {
      setError(err.message || 'Failed to filter attendance');
    }
  };

  const clearFilters = () => {
    setFilterMonth('');
    setFilterYear('');
    refresh();
  };

  const filteredAttendance = monthlyAttendance.filter(record => {
    if (filterMonth && record.month !== filterMonth) return false;
    if (filterYear && record.year !== parseInt(filterYear)) return false;
    return true;
  });

  const sortedAttendance = [...filteredAttendance].sort((a, b) => {
    const monthOrder = months.map(m => m.value);
    const monthDiff = monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    if (monthDiff !== 0) return monthDiff;
    return b.year - a.year;
  });

  const viewRecordDetails = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Find Teacher Attendance</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher Email
            </label>
            <input
              type="email"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
              placeholder="Enter teacher email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="pt-6">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>

      {teacherInfo ? (
        <>
          {/* Teacher Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{teacherInfo.name}</h2>
                <p className="text-gray-600">{teacherInfo.email} • {teacherInfo.designation}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold px-4 py-2 rounded-lg ${getAttendanceColor(attendanceSummary?.overallPercentage || 0)}`}>
                  Overall Attendance: {formatPercentage(attendanceSummary?.overallPercentage || 0)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {attendanceSummary?.totalWorkingDays || 0} working days
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Month
                </label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Months</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleFilter}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-1"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {sortedAttendance.length}
                </div>
                <div className="text-sm text-blue-600">Attendance Records</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {attendanceSummary?.presentDays || 0}
                </div>
                <div className="text-sm text-green-600">Total Present Days</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">
                  {attendanceSummary?.leaveDays || 0}
                </div>
                <div className="text-sm text-yellow-600">Total Leave Days</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">
                  {attendanceSummary?.halfDays || 0}
                </div>
                <div className="text-sm text-purple-600">Total Half Days</div>
              </div>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
              <p className="text-gray-600 text-sm">
                Showing {sortedAttendance.length} record{sortedAttendance.length !== 1 ? 's' : ''}
              </p>
            </div>

            {sortedAttendance.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600">No attendance records found for this teacher.</p>
                {filterMonth || filterYear ? (
                  <p className="text-gray-500 text-sm mt-2">Try clearing your filters or adding new attendance records.</p>
                ) : null}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month/Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Working Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Present Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Half Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAttendance.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {formatMonthYear(record.month, record.year)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {record.workingDays}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {record.presentDays}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            {record.leaveDays || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {record.halfDays || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm ${getAttendanceColor(record.attendancePercentage)}`}>
                            {formatPercentage(record.attendancePercentage)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewRecordDetails(record)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teacher Selected</h3>
          <p className="text-gray-600">
            Enter a teacher email and click Search to view their attendance records.
          </p>
        </div>
      )}

      {/* Record Details Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendance Details - {formatMonthYear(selectedRecord.month, selectedRecord.year)}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Working Days</div>
                  <div className="text-2xl font-bold text-blue-700">{selectedRecord.workingDays}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Present Days</div>
                  <div className="text-2xl font-bold text-green-700">{selectedRecord.presentDays}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-600 mb-1">Leave Days</div>
                  <div className="text-2xl font-bold text-yellow-700">{selectedRecord.leaveDays || 0}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Half Days</div>
                  <div className="text-2xl font-bold text-purple-700">{selectedRecord.halfDays || 0}</div>
                </div>
              </div>
              
              <div className={`rounded-lg p-4 mb-6 ${getAttendanceColor(selectedRecord.attendancePercentage)}`}>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{formatPercentage(selectedRecord.attendancePercentage)}</div>
                  <div className="text-lg">Attendance Percentage</div>
                </div>
              </div>
              
              {selectedRecord.remarks && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Remarks</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedRecord.remarks}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-sm text-gray-500">
                <p>Last updated: {new Date(selectedRecord.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceView;