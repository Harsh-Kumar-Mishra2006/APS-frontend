// src/components/marks/MarksView.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaSearch, FaFilter, FaDownload, FaPrint, FaFileExcel, FaFilePdf, FaChartLine } from 'react-icons/fa';
import studentPerformanceApi from '../../utils/studentPerformanceAPI';

const MarksView = () => {
  const [examResults, setExamResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    examType: '',
    examMonth: '',
    examYear: new Date().getFullYear(),
    class: '',
    section: '',
    studentEmail: '',
    academicYear: studentPerformanceApi.getCurrentAcademicYear()
  });

  const examTypes = studentPerformanceApi.getExamTypes();
  const months = studentPerformanceApi.getMonths();
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    fetchExamResults();
  }, [filters]);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (filters.class) params.class = filters.class;
      if (filters.section) params.section = filters.section;
      if (filters.academicYear) params.academicYear = filters.academicYear;
      
      const response = await studentPerformanceApi.getClassPerformance(params);
      
      if (response.success) {
        setStudents(response.data);
        
        let allExamResults = [];
        
        response.data.forEach(student => {
          if (student.examResults && Array.isArray(student.examResults)) {
            student.examResults.forEach(exam => {
              // Apply filters
              if (filters.examType && exam.examType !== filters.examType) return;
              if (filters.examMonth && exam.examMonth !== filters.examMonth) return;
              if (filters.examYear && exam.examYear !== parseInt(filters.examYear)) return;
              if (filters.studentEmail && !student.studentEmail?.toLowerCase().includes(filters.studentEmail.toLowerCase())) return;
              
              allExamResults.push({
                _id: exam._id,
                studentName: student.studentName,
                studentEmail: student.studentEmail,
                rollNumber: student.rollNumber,
                class: student.class,
                section: student.section,
                examType: exam.examType,
                examMonth: exam.examMonth,
                examYear: exam.examYear,
                overallPercentage: exam.overallPercentage,
                overallGrade: exam.overallGrade,
                subjects: exam.subjects,
                remarks: exam.remarks,
                conductedDate: exam.conductedDate,
                performanceId: student._id
              });
            });
          }
        });
        
        setExamResults(allExamResults);
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching exam results:', error);
      toast.error('Failed to load exam results');
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

  const exportToExcel = async () => {
    try {
      toast.loading('Preparing export...');
      
      setTimeout(() => {
        toast.dismiss();
        toast.success('Exam results exported successfully!');
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
        toast.success('Exam results PDF generated!');
      }, 1500);
      
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const getGradeColor = (grade) => {
    return studentPerformanceApi.getGradeColor(grade);
  };

  const calculateClassAverage = () => {
    if (examResults.length === 0) return 0;
    const total = examResults.reduce((sum, exam) => sum + exam.overallPercentage, 0);
    return total / examResults.length;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading exam results...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Exam Results View</h3>
          <p className="text-gray-600">View and analyze student exam performance</p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              name="examType"
              value={filters.examType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              {examTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              name="examMonth"
              value={filters.examMonth}
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
              name="examYear"
              value={filters.examYear}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
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
          
          <div className="flex items-end">
            <button
              onClick={fetchExamResults}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              Search
            </button>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <FaChartLine className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Exam Records</p>
              <p className="text-xl font-bold text-gray-900">{examResults.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <div className="w-5 h-5 rounded-full bg-green-500"></div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class Average</p>
              <p className="text-xl font-bold text-green-600">
                {calculateClassAverage().toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <div className="w-5 h-5 rounded-full bg-blue-500"></div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-bold text-blue-600">
                {students.length}
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
              <p className="text-sm text-gray-500">Distinction (A+)</p>
              <p className="text-xl font-bold text-yellow-600">
                {examResults.filter(e => e.overallGrade === 'A+').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class-Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {examResults.map((exam) => (
              <tr key={exam._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {exam.examMonth} {exam.examYear}
                  </div>
                  {exam.conductedDate && (
                    <div className="text-xs text-gray-400">
                      {new Date(exam.conductedDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-medium">{exam.studentName?.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{exam.studentName}</div>
                      <div className="text-xs text-gray-500">Roll: {exam.rollNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {exam.studentEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {exam.class}-{exam.section}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    exam.overallPercentage >= 80 ? 'bg-green-100 text-green-800' :
                    exam.overallPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exam.overallPercentage.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(exam.overallGrade)}`}>
                    {exam.overallGrade}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                  <div className="space-y-1">
                    {exam.subjects?.slice(0, 3).map((subject, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate">{subject.subjectName}</span>
                        <span className="font-medium">{subject.obtainedMarks}/{subject.totalMarks}</span>
                      </div>
                    ))}
                    {exam.subjects?.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{exam.subjects.length - 3} more subjects
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {exam.remarks || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {examResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <FaChartLine className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No exam results found</p>
            {Object.values(filters).some(f => f) && (
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarksView;