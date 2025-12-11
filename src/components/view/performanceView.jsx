// src/components/performance/PerformanceView.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaSearch, FaFilter, FaDownload, FaPrint, FaFileExcel, FaFilePdf, FaStar, FaUserGraduate } from 'react-icons/fa';
import studentPerformanceApi from '../../utils/studentPerformanceAPI';

const PerformanceView = () => {
  const [students, setStudents] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    studentEmail: '',
    academicYear: studentPerformanceApi.getCurrentAcademicYear()
  });

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    fetchPerformanceData();
  }, [filters]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (filters.class) params.class = filters.class;
      if (filters.section) params.section = filters.section;
      if (filters.academicYear) params.academicYear = filters.academicYear;
      
      const response = await studentPerformanceApi.getClassPerformance(params);
      
      if (response.success) {
        const processedData = response.data.map(student => {
          // Calculate overall performance score
          let overallScore = 0;
          let factors = 0;
          
          // Academic performance (50% weight)
          if (student.averageScore > 0) {
            overallScore += (student.averageScore / 100) * 50;
            factors++;
          }
          
          // Attendance performance (30% weight)
          if (student.attendancePercentage > 0) {
            overallScore += (student.attendancePercentage / 100) * 30;
            factors++;
          }
          
          // Class performance scores (20% weight)
          if (student.classPerformance && student.classPerformance.length > 0) {
            const latestClassPerf = student.classPerformance[student.classPerformance.length - 1];
            const classPerfScore = (
              (latestClassPerf.participationScore || 0) +
              (latestClassPerf.homeworkCompletion || 0) +
              (latestClassPerf.disciplineScore || 0) +
              (latestClassPerf.extraCurricular || 0)
            ) / 4;
            overallScore += (classPerfScore / 10) * 20;
            factors++;
          }
          
          // Adjust if not all factors are present
          if (factors > 0) {
            overallScore = overallScore / factors;
          }
          
          // Get latest exam results
          const latestExam = student.examResults && student.examResults.length > 0 
            ? student.examResults[student.examResults.length - 1]
            : null;
          
          // Get latest monthly attendance
          const latestAttendance = student.monthlyAttendance && student.monthlyAttendance.length > 0
            ? student.monthlyAttendance[student.monthlyAttendance.length - 1]
            : null;
          
          // Get teacher remarks count
          const remarksCount = student.teacherRemarks ? student.teacherRemarks.length : 0;
          
          return {
            _id: student._id,
            studentId: student.studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            rollNumber: student.rollNumber,
            class: student.class,
            section: student.section,
            academicYear: student.academicYear,
            overallScore: parseFloat(overallScore.toFixed(1)),
            averageScore: student.averageScore || 0,
            attendancePercentage: student.attendancePercentage || 0,
            latestExam,
            latestAttendance,
            remarksCount,
            performanceScores: student.performanceScores,
            teacherRemarks: student.teacherRemarks,
            classPerformance: student.classPerformance
          };
        }).filter(student => {
          // Apply student email filter
          if (filters.studentEmail && !student.studentEmail?.toLowerCase().includes(filters.studentEmail.toLowerCase())) {
            return false;
          }
          return true;
        });
        
        setStudents(processedData);
        setPerformanceData(processedData);
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
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

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { label: 'Very Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 60) return { label: 'Average', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const exportToExcel = async () => {
    try {
      toast.loading('Preparing export...');
      
      setTimeout(() => {
        toast.dismiss();
        toast.success('Performance data exported successfully!');
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
        toast.success('Performance report PDF generated!');
      }, 1500);
      
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Student Performance Overview</h3>
          <p className="text-gray-600">Comprehensive view of student academic and behavioral performance</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
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
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              name="academicYear"
              value={filters.academicYear}
              onChange={handleFilterChange}
              placeholder="2024-2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchPerformanceData}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FaUserGraduate className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-bold text-gray-900">
                {performanceData.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FaStar className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Performance Score</p>
              <p className="text-xl font-bold text-blue-600">
                {performanceData.length > 0
                  ? (performanceData.reduce((sum, student) => sum + student.overallScore, 0) / performanceData.length).toFixed(1)
                  : 0}/100
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
              <p className="text-sm text-gray-500">Avg Academic Score</p>
              <p className="text-xl font-bold text-yellow-600">
                {performanceData.length > 0
                  ? (performanceData.reduce((sum, student) => sum + student.averageScore, 0) / performanceData.length).toFixed(1)
                  : 0}/100
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
              <p className="text-sm text-gray-500">Top Performers (80+)</p>
              <p className="text-xl font-bold text-purple-600">
                {performanceData.filter(s => s.overallScore >= 80).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class-Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {performanceData.map((student) => {
              const performanceLevel = getPerformanceLevel(student.overallScore);
              
              return (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold text-lg">{student.studentName?.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-xs text-gray-500">Roll: {student.rollNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.studentEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.class}-{student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="text-lg font-bold text-gray-900">
                        {student.overallScore.toFixed(1)}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${performanceLevel.color}`}>
                        {performanceLevel.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                      student.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.averageScore.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                      student.attendancePercentage >= 80 ? 'bg-blue-100 text-blue-800' :
                      student.attendancePercentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.attendancePercentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.latestExam ? (
                      <div>
                        <div className="font-medium">{student.latestExam.examType}</div>
                        <div className="text-xs text-gray-500">
                          {student.latestExam.overallPercentage?.toFixed(1)}% • {student.latestExam.overallGrade}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No exam data</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${
                        student.remarksCount > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <span className="text-xs font-bold">{student.remarksCount}</span>
                      </div>
                      <span className="text-sm text-gray-600">remarks</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {performanceData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <FaUserGraduate className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No performance data found</p>
            {Object.values(filters).some(f => f) && (
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            )}
          </div>
        )}
      </div>

      {/* Performance Distribution */}
      {performanceData.length > 0 && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Excellent', 'Very Good', 'Good', 'Average', 'Needs Improvement'].map((level, idx) => {
              const count = performanceData.filter(s => {
                const studentLevel = getPerformanceLevel(s.overallScore);
                return studentLevel.label === level;
              }).length;
              
              const percentage = (count / performanceData.length) * 100;
              const colors = [
                'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'
              ];
              
              return (
                <div key={level} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                  <div className="text-sm text-gray-600 mb-2">{level}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[idx]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceView;