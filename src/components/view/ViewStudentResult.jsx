import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Loader, FileText, CheckCircle, AlertCircle, Calendar, Award, TrendingUp, Eye, X } from 'lucide-react';

const StudentResultPortal = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      let studentId = null;
      
      if (user.role === 'student') {
        // Get student ID from profile
        const profileRes = await api.get('auth/profile');
        if (profileRes.data.success && profileRes.data.data.student) {
          studentId = profileRes.data.data.student.id;
        }
      } else if (user.role === 'parent') {
        // For parent, get first child's ID (or show selector)
        const profileRes = await api.get('auth/profile');
        if (profileRes.data.success && profileRes.data.data.parent) {
          const children = profileRes.data.data.parent.children || [];
          if (children.length > 0) {
            studentId = children[0]; // Show first child by default
          }
        }
      }
      
      if (!studentId) {
        setError('No student found');
        setLoading(false);
        return;
      }
      
      const response = await api.get(`results/student/${studentId}`);
      if (response.data.success) {
        setResultData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Pass') return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!resultData || resultData.results.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <p className="text-yellow-700">No results published yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 My Academic Results</h2>
        <p className="opacity-90">{resultData.student.name} - Class {resultData.student.class} {resultData.student.section}</p>
        <p className="opacity-80 text-sm">Roll Number: {resultData.student.rollNumber}</p>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Exams</p>
          <p className="text-2xl font-bold">{resultData.summary.totalExams}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Exams Passed</p>
          <p className="text-2xl font-bold">{resultData.summary.passedExams}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Exams Failed</p>
          <p className="text-2xl font-bold">{resultData.summary.failedExams}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Overall Percentage</p>
          <p className="text-2xl font-bold">{resultData.summary.overallPercentage}%</p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {resultData.results.map((result) => (
          <div key={result.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">{result.exam.examType}</h3>
                <p className="text-sm text-gray-500">{result.exam.examYear} {result.exam.term ? `- ${result.exam.term}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(result.status)}`}>
                  {result.status === 'Pass' ? <CheckCircle className="w-4 h-4 inline mr-1" /> : <AlertCircle className="w-4 h-4 inline mr-1" />}
                  {result.status}
                </span>
                <button
                  onClick={() => setSelectedResult(result)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Total Marks</p>
                <p className="font-semibold">{result.totalMarksObtained} / {result.totalMaxMarks}</p>
              </div>
              <div>
                <p className="text-gray-500">Percentage</p>
                <p className={`font-semibold ${getPercentageColor(result.percentage)}`}>{result.percentage}%</p>
              </div>
              <div>
                <p className="text-gray-500">Division</p>
                <p className="font-semibold">{result.division}</p>
              </div>
              <div>
                <p className="text-gray-500">Result Date</p>
                <p className="text-sm">{new Date(result.resultDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedResult.exam.examType} - Detailed Marks
              </h3>
              <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Exam Info */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-500">Exam:</span> {selectedResult.exam.examType}</p>
                  <p><span className="text-gray-500">Year:</span> {selectedResult.exam.examYear}</p>
                  <p><span className="text-gray-500">Term:</span> {selectedResult.exam.term || 'N/A'}</p>
                  <p><span className="text-gray-500">Result Date:</span> {new Date(selectedResult.resultDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Subject-wise Marks Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Subject</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Total Marks</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Passing Marks</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Scored Marks</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedResult.subjects.map((subject, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-medium">{subject.subject}</td>
                        <td className="px-4 py-2 text-center">{subject.totalMarks}</td>
                        <td className="px-4 py-2 text-center">{subject.passingMarks}</td>
                        <td className="px-4 py-2 text-center font-semibold">{subject.scoredMarks}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            subject.scoredMarks >= subject.passingMarks ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {subject.scoredMarks >= subject.passingMarks ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {subject.scoredMarks >= subject.passingMarks ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-4 py-2 font-bold">Total</td>
                      <td className="px-4 py-2 text-center font-bold">{selectedResult.totalMaxMarks}</td>
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-center font-bold">{selectedResult.totalMarksObtained}</td>
                      <td className="px-4 py-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Performance Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-gray-500 text-sm">Percentage</p>
                    <p className={`text-xl font-bold ${getPercentageColor(selectedResult.percentage)}`}>
                      {selectedResult.percentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Division</p>
                    <p className="text-xl font-bold">{selectedResult.division}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Rank</p>
                    <p className="text-xl font-bold">{selectedResult.rank ? `#${selectedResult.rank}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <p className={`text-xl font-bold ${selectedResult.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedResult.status}
                    </p>
                  </div>
                </div>
              </div>

              {selectedResult.remarks && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Remarks</p>
                  <p className="text-sm mt-1">{selectedResult.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResultPortal;