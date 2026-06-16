import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import { Loader, Search, Filter, Download, Eye, Mail, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

const ViewResults = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
  const [isSearching, setIsSearching] = useState(false);

  const classes = ['Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const sections = ['A', 'B', 'C', 'D'];
  const statuses = ['all', 'Pass', 'Fail'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Fetch exam types only once on mount
  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        const response = await api.get('results/exam-types');
        if (response.data.success) {
          setExamTypes(response.data.data);
          // Auto-select first exam type if available
          if (response.data.data.length > 0) {
            setFilters(prev => ({ ...prev, examType: response.data.data[0] }));
          }
        }
      } catch (error) {
        console.error('Error fetching exam types:', error);
      }
    };
    fetchExamTypes();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyLocalFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.status, results]);

  // Fetch results when exam type or year changes (class/section changes also trigger)
  useEffect(() => {
    if (filters.examType && filters.examYear) {
      fetchResults();
    }
  }, [filters.examType, filters.examYear, filters.class, filters.section]);

  const fetchResults = useCallback(async () => {
    if (!filters.examType || !filters.examYear) return;
    
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
          id: item.student?.id,
          studentId: item.student?.id,
          studentName: item.student?.name || 'N/A',
          rollNumber: item.student?.rollNumber || 'N/A',
          class: item.student?.class || 'N/A',
          section: item.student?.section || 'N/A',
          rank: item.result?.rank || '-',
          totalMarks: item.result?.totalMarksObtained || 0,
          totalMaxMarks: item.result?.totalMaxMarks || 0,
          percentage: item.result?.percentage || 0,
          status: item.result?.status || 'Pending',
          division: item.result?.division || 'N/A',
          subjects: item.result?.subjects || [],
          remarks: item.result?.remarks || '',
          resultDate: item.result?.resultDate || null
        }));
        setResults(formattedResults);
        setFilteredResults(formattedResults);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      if (error.response?.status === 404) {
        setResults([]);
        setFilteredResults([]);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [filters.examType, filters.examYear, filters.class, filters.section]);

  const applyLocalFilters = useCallback(() => {
    let filtered = [...results];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.studentName?.toLowerCase().includes(term) ||
        r.rollNumber?.toLowerCase().includes(term) ||
        (r.class && r.class.toLowerCase().includes(term))
      );
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    setFilteredResults(filtered);
  }, [results, searchTerm, filters.status]);

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
    if (filteredResults.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = ['Rank', 'Roll No', 'Student Name', 'Class', 'Section', 'Total Marks', 'Percentage', 'Status', 'Division'];
    const csvData = filteredResults.map(r => [
      r.rank || '-',
      r.rollNumber,
      r.studentName,
      r.class,
      r.section,
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

  // Loading state with skeleton
  if (initialLoading) {
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
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
                placeholder="Search by name, roll number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={filters.examType}
              onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[200px] focus:ring-2 focus:ring-purple-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All' : s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {!filters.examType ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <p>Please select an exam type to view results</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Loading results...</span>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-lg">No results found</p>
          <p className="text-sm mt-2">
            {filters.class ? `For class ${filters.class} ${filters.section || ''}` : ''} 
            in {filters.examType} ({filters.examYear})
          </p>
          <p className="text-sm mt-1 text-purple-600">Add results first using the "Add Result" tab</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Class/Section</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total Marks</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.map((result, idx) => (
                <tr key={result.id || idx} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800">#{result.rank || '-'}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{result.rollNumber}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{result.studentName}</p>
                      <p className="text-xs text-gray-500">ID: {result.studentId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm">{result.class}</span>
                    {result.section && <span className="text-xs text-gray-500 block">Section {result.section}</span>}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {result.totalMarks || 0}/{result.totalMaxMarks || 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${getPercentageColor(result.percentage)}`}>
                      {result.percentage ? `${result.percentage}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(result.status)}`}>
                      {result.status === 'Pass' ? <CheckCircle className="w-3 h-3" /> : 
                       result.status === 'Fail' ? <AlertCircle className="w-3 h-3" /> : 
                       <Clock className="w-3 h-3" />}
                      {result.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded transition"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Result count */}
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            Showing {filteredResults.length} of {results.length} results
            {filters.class && ` for Class ${filters.class}`}
            {filters.section && `-${filters.section}`}
          </div>
        </div>
      )}

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Result Details</h3>
              <button 
                onClick={() => setSelectedResult(null)} 
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-lg">{selectedResult.studentName}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Roll Number:</span> {selectedResult.rollNumber}</p>
                  <p><span className="text-gray-500">Rank:</span> #{selectedResult.rank || 'Not ranked'}</p>
                  <p><span className="text-gray-500">Class:</span> {selectedResult.class} {selectedResult.section}</p>
                  <p><span className="text-gray-500">Percentage:</span> {selectedResult.percentage}%</p>
                  <p><span className="text-gray-500">Status:</span> 
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedResult.status)}`}>
                      {selectedResult.status}
                    </span>
                  </p>
                  <p><span className="text-gray-500">Division:</span> {selectedResult.division || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Performance Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Total Marks Obtained:</span> {selectedResult.totalMarks}</p>
                  <p><span className="text-gray-500">Maximum Marks:</span> {selectedResult.totalMaxMarks}</p>
                </div>
              </div>
              
              {selectedResult.subjects && selectedResult.subjects.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Subject-wise Marks</h4>
                  <div className="overflow-x-auto">
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
                          <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{sub.subject}</td>
                            <td className="px-3 py-2 text-center">{sub.totalMarks}</td>
                            <td className="px-3 py-2 text-center">{sub.passingMarks}</td>
                            <td className="px-3 py-2 text-center font-medium">{sub.scoredMarks}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                sub.scoredMarks >= sub.passingMarks ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {sub.scoredMarks >= sub.passingMarks ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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