import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader, Search, Filter, Download, Eye, Mail, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

const ViewResults = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [filters, setFilters] = useState({
    examId: '',
    class: '',
    section: '',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [resendingEmail, setResendingEmail] = useState(null);

  const classes = ['Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const sections = ['A', 'B', 'C', 'D'];
  const statuses = ['all', 'Pass', 'Fail'];

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, resultsRes] = await Promise.all([
        api.get('results/exams'),
        api.get('results/class-results', {
          params: {
            class: filters.class || '10th',
            examId: filters.examId
          }
        })
      ]);

      if (examsRes.data.success) setExams(examsRes.data.data);
      if (resultsRes.data.success) {
        setResults(resultsRes.data.data.results || []);
        setFilteredResults(resultsRes.data.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
    
    if (filters.section) {
      const sectionMap = { A: 'A', B: 'B', C: 'C', D: 'D' };
      filtered = filtered.filter(r => r.section === sectionMap[filters.section]);
    }
    
    setFilteredResults(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters.status, filters.section, results]);

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

  const resendEmail = async (resultId) => {
    setResendingEmail(resultId);
    try {
      const response = await api.post(`results/resend-email/${resultId}`);
      if (response.data.success) {
        alert('Email resent successfully!');
      }
    } catch (error) {
      alert('Failed to resend email');
    } finally {
      setResendingEmail(null);
    }
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
      r.division
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
            <select
              value={filters.examId}
              onChange={(e) => setFilters({ ...filters, examId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Exam</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.examType} {e.examYear}</option>
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
          
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Results Table */}
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
            {filteredResults.map((result) => (
              <tr key={result.studentId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">#{result.rank || '-'}</td>
                <td className="px-4 py-3">{result.rollNumber}</td>
                <td className="px-4 py-3 font-medium">{result.studentName}</td>
                <td className="px-4 py-3 text-center">{result.totalMarks || '-'}/{result.totalMaxMarks || '-'}</td>
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
                    className="text-blue-600 hover:text-blue-800 mr-2"
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

      {filteredResults.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No results found. Please add results first.
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
              
              {selectedResult.emailSent && (
                <div className="bg-green-50 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email notification sent to student and parent
                  {selectedResult.emailSentAt && (
                    <span className="text-xs"> at {new Date(selectedResult.emailSentAt).toLocaleString()}</span>
                  )}
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