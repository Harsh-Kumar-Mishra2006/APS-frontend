import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Loader, 
  Calendar, 
  BookOpen, 
  Eye, 
  AlertCircle, 
  Search,
  Filter,
  Clock,
  User,
  FileText,
  Trash2,
  Edit
} from 'lucide-react';

const ViewExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const examTypes = [
    'Unit Test 1', 'Unit Test 2', 'Unit Test 3',
    'Quarterly Exam', 'Half-Yearly Exam', 'Pre-Board Exam',
    'Annual Exam', 'Preliminary Exam', 'Term 1', 'Term 2'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    try {
      let url = 'results/exams';
      const params = [];
      if (filterYear) params.push(`examYear=${filterYear}`);
      if (filterType) params.push(`examType=${encodeURIComponent(filterType)}`);
      if (params.length) url += `?${params.join('&')}`;
      
      const response = await api.get(url);
      if (response.data.success) {
        setExams(response.data.data);
      } else {
        setError('Failed to fetch exams');
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(err.response?.data?.error || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [filterYear, filterType]);

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    
    setDeleting(true);
    try {
      // Note: You'll need to add a delete endpoint in your backend
      const response = await api.delete(`results/exam/${examToDelete.id}`);
      if (response.data.success) {
        fetchExams();
        setShowDeleteModal(false);
        setExamToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError(err.response?.data?.error || 'Failed to delete exam');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today < start) return 'bg-yellow-100 text-yellow-800';
    if (today > end) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today < start) return 'Upcoming';
    if (today > end) return 'Completed';
    return 'Ongoing';
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-3">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Manage Exams</h2>
        <p className="text-gray-500 text-sm mt-1">View, filter, and manage all exams</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter Exams</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Exam Types</option>
            {examTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {(filterYear || filterType) && (
          <button
            onClick={() => { setFilterYear(''); setFilterType(''); }}
            className="mt-3 text-sm text-green-600 hover:text-green-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No exams found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first exam in the "Manage Exams" tab</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-700">{exams.length}</p>
                <p className="text-xs text-gray-600">Total Exams</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">
                  {exams.filter(e => getStatusText(e.startDate, e.endDate) === 'Upcoming').length}
                </p>
                <p className="text-xs text-gray-600">Upcoming</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {exams.filter(e => getStatusText(e.startDate, e.endDate) === 'Ongoing').length}
                </p>
                <p className="text-xs text-gray-600">Ongoing</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">
                  {exams.filter(e => getStatusText(e.startDate, e.endDate) === 'Completed').length}
                </p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          {/* Exam Cards */}
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{exam.examType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.startDate, exam.endDate)}`}>
                      {getStatusText(exam.startDate, exam.endDate)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Year: {exam.examYear}</span>
                    </div>
                    {exam.term && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>Term: {exam.term}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {exam.description && (
                    <p className="text-sm text-gray-500 mt-2">{exam.description}</p>
                  )}
                  
                  {exam.addedByUser && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                      <User className="w-3 h-3" />
                      <span>Created by: {exam.addedByUser.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedExam(selectedExam === exam.id ? null : exam.id);
                    }}
                    className="px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                  {/* Add delete button only if you have delete endpoint */}
                  {/* <button
                    onClick={() => {
                      setExamToDelete(exam);
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button> */}
                </div>
              </div>
              
              {/* Expanded Details */}
              {selectedExam === exam.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-2">Exam Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium">{new Date(exam.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium">{new Date(exam.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">
                        {Math.ceil((new Date(exam.endDate) - new Date(exam.startDate)) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">{new Date(exam.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && examToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Delete Exam</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{examToDelete.examType}"? This will also delete all results associated with this exam.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExam}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExams;