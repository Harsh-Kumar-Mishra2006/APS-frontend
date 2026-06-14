// src/components/student/StudentResultView.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Award, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Star,
  Medal
} from 'lucide-react';

const StudentResultView = ({ studentId, userRole }) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedResult, setSelectedResult] = useState(null);
  const [error, setError] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    fetchExamTypes();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchResults();
    }
  }, [studentId, selectedExam, selectedYear]);

  const fetchExamTypes = async () => {
    try {
      const response = await api.get('results/exam-types');
      if (response.data.success) {
        setExamTypes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching exam types:', err);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedExam) params.examType = selectedExam;
      if (selectedYear) params.examYear = selectedYear;
      
      const response = await api.get(`results/student/${studentId}`, { params });
      
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError('Failed to fetch results');
      }
    } catch (err) {
      console.error('Results fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const getGradeInfo = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-100' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 40) return { grade: 'C', color: 'text-orange-500', bg: 'bg-orange-100' };
    if (percentage >= 33) return { grade: 'D', color: 'text-red-500', bg: 'bg-red-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getStatusIcon = (status) => {
    if (status === 'Pass') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'Fail') return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  const exportToCSV = () => {
    if (!results.length) return;
    
    const headers = ['Exam Type', 'Exam Year', 'Percentage', 'Status', 'Division', 'Rank', 'Result Date'];
    const csvData = results.map(result => [
      result.examType,
      result.examYear,
      `${result.percentage}%`,
      result.status,
      result.division || 'N/A',
      result.rank || '-',
      new Date(result.resultDate).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${studentId}_${new Date().toISOString().split('T')[0]}.csv`;
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Academic Results</h1>
            <p className="text-sm opacity-80">View your exam performance and progress</p>
          </div>
          {results.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Exams</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchResults}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No results found for the selected criteria</p>
        </div>
      ) : (
        <>
          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {results.map((result, idx) => {
              const gradeInfo = getGradeInfo(result.percentage);
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{result.examType}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {result.examYear}
                        </p>
                      </div>
                      <div className={`${gradeInfo.bg} rounded-full p-2`}>
                        <span className={`text-lg font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{result.percentage}%</p>
                        <p className="text-xs text-gray-500">Percentage</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(result.status)}
                          <span className={`text-sm font-semibold ${result.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                            {result.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Status</p>
                      </div>
                      {result.rank && (
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Medal className="w-4 h-4 text-yellow-500" />
                            <span className="text-lg font-bold">#{result.rank}</span>
                          </div>
                          <p className="text-xs text-gray-500">Rank</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-500">Division</p>
                        <p className="font-medium">{result.division || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <button className="text-purple-600 text-sm flex items-center gap-1">
                          View Details <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{results.length}</p>
                <p className="text-xs text-gray-500">Exams Taken</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'Pass').length}
                </p>
                <p className="text-xs text-gray-500">Exams Passed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {(results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500">Average Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.rank && r.rank <= 3).length}
                </p>
                <p className="text-xs text-gray-500">Top 3 Rankings</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Result Details</h3>
              <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Header */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-lg">{selectedResult.examType}</h4>
                <p className="text-gray-600 text-sm">{selectedResult.examYear}</p>
              </div>
              
              {/* Subject-wise Marks */}
              {selectedResult.subjects && selectedResult.subjects.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Subject-wise Marks</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Subject</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold">Total</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold">Passing</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold">Scored</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedResult.subjects.map((sub, i) => {
                          const isPass = sub.scoredMarks >= sub.passingMarks;
                          return (
                            <tr key={i}>
                              <td className="px-4 py-2 font-medium">{sub.subject}</td>
                              <td className="px-4 py-2 text-center">{sub.totalMarks}</td>
                              <td className="px-4 py-2 text-center">{sub.passingMarks}</td>
                              <td className={`px-4 py-2 text-center font-semibold ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                                {sub.scoredMarks}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {isPass ? '✅ Pass' : '❌ Fail'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                     </table>
                  </div>
                </div>
              )}
              
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">Total Marks</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedResult.totalMarksObtained}/{selectedResult.totalMaxMarks}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedResult.percentage}%</p>
                </div>
              </div>
              
              {/* Remarks */}
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

export default StudentResultView;