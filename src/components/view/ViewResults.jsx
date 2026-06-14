import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader, Search, Filter, Download, Eye, Mail, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

const ViewResults = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [filters, setFilters] = useState({
    examType: '',
    examYear: new Date().getFullYear().toString(),
    class: '',
    section: '',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const classes = ['Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const sections = ['A', 'B', 'C', 'D'];
  const statuses = ['all', 'Pass', 'Fail'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    fetchExamTypes();
    fetchResults();
  }, [filters.examType, filters.examYear, filters.class, filters.section]);

  const fetchExamTypes = async () => {
    try {
      const response = await api.get('results/exam-types');
      if (response.data.success) {
        setExamTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching exam types:', error);
    }
  };

  const fetchResults = async () => {
    if (!filters.examType) return;
    
    setLoading(true);
    try {
      const params = {
        examType: filters.examType,
        examYear: filters.examYear
      };
      if (filters.class) params.class = filters.class;
      if (filters.section) params.section = filters.section;
      
      const response = await api.get('results/class-results', { params });
      
      if (response.data.success) {
        const resultsData = response.data.data.students || [];
        // Transform to expected format
        const formattedResults = resultsData.map(item => ({
          studentId: item.student?.id,
          studentName: item.student?.name,
          rollNumber: item.student?.rollNumber,
          class: item.student?.class,
          section: item.student?.section,
          rank: item.result?.rank,
          totalMarks: item.result?.totalMarksObtained,
          totalMaxMarks: item.result?.totalMaxMarks,
          percentage: item.result?.percentage,
          status: item.result?.status,
          division: item.result?.division,
          subjects: item.result?.subjects,
          remarks: item.result?.remarks,
          resultDate: item.result?.resultDate
        }));
        setResults(formattedResults);
        setFilteredResults(formattedResults);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];
    
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    setFilteredResults(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters.status, results]);

  const getStatusColor = (status) => {
    if (status === 'Pass') return 'bg-green-100 text-green-800';
    if (status === 'Fail') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportToCSV = () => {
    const headers = ['Rank', 'Roll No', 'Student Name', 'Total Marks', 'Percentage', 'Status', 'Division'];
    const csvData = filteredResults.map(r => [
      r.rank || '-',
      r.rollNumber,
      r.studentName,
      `${r.totalMarks || 0}/${r.totalMaxMarks || 0}`,
      r.percentage ? `${r.percentage}%` : 'N/A',
      r.status,
      r.division || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam_results_${filters.examType}_${filters.examYear}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !results.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📊 Exam Results</h2>
        {filteredResults.length > 0 && (
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={filters.examType}
              onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[200px]"
            >
              <option value="">Select Exam Type</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Year</label>
            <select
              value={filters.examYear}
              onChange={(e) => setFilters({ ...filters, examYear: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={filters.class}
              onChange={(e) => setFilters({ ...filters, class: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All' : s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {!filters.examType ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <p>Please select an exam type and year to view results</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <p>No results found for {filters.examType} ({filters.examYear})</p>
          <p className="text-sm mt-2">Add results first using the "Add Result" tab</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total Marks</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Division</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.map((result, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">#{result.rank || '-'}</td>
                  <td className="px-4 py-3">{result.rollNumber}</td>
                  <td className="px-4 py-3 font-medium">{result.studentName}</td>
                  <td className="px-4 py-3 text-center">{result.totalMarks || 0}/{result.totalMaxMarks || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${getPercentageColor(result.percentage)}`}>
                      {result.percentage ? `${result.percentage}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(result.status)}`}>
                      {result.status === 'Pass' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {result.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{result.division || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Result Details</h3>
              <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">{selectedResult.studentName}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Roll Number:</span> {selectedResult.rollNumber}</p>
                  <p><span className="text-gray-500">Rank:</span> #{selectedResult.rank || 'Not ranked'}</p>
                  <p><span className="text-gray-500">Percentage:</span> {selectedResult.percentage}%</p>
                  <p><span className="text-gray-500">Status:</span> {selectedResult.status}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Performance Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Total Marks Obtained:</span> {selectedResult.totalMarks}</p>
                  <p><span className="text-gray-500">Maximum Marks:</span> {selectedResult.totalMaxMarks}</p>
                  <p><span className="text-gray-500">Division:</span> {selectedResult.division}</p>
                </div>
              </div>
              
              {selectedResult.subjects && selectedResult.subjects.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Subject-wise Marks</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Subject</th>
                        <th className="px-3 py-2 text-center">Total</th>
                        <th className="px-3 py-2 text-center">Passing</th>
                        <th className="px-3 py-2 text-center">Scored</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResult.subjects.map((sub, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{sub.subject}</td>
                          <td className="px-3 py-2 text-center">{sub.totalMarks}</td>
                          <td className="px-3 py-2 text-center">{sub.passingMarks}</td>
                          <td className="px-3 py-2 text-center font-medium">{sub.scoredMarks}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`text-xs font-medium ${sub.scoredMarks >= sub.passingMarks ? 'text-green-600' : 'text-red-600'}`}>
                              {sub.scoredMarks >= sub.passingMarks ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {selectedResult.remarks && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-semibold">Remarks:</span> {selectedResult.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResults;