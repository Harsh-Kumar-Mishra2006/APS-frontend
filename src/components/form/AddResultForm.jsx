// src/components/form/AddResultForm.jsx (FIXED VERSION)
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader, Search, Plus, Calendar, Trash2, AlertCircle, Send, GraduationCap, BookOpen, Award, User, RefreshCw } from 'lucide-react';

const AddResultForm = ({ onSuccess, onRefreshExams }) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedExamYear, setSelectedExamYear] = useState(new Date().getFullYear());
  const [searchValue, setSearchValue] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [rank, setRank] = useState('');
  
  const [examTypes, setExamTypes] = useState([]);
  const [examTypesLoading, setExamTypesLoading] = useState(false);

  // Fetch available exam types from backend
  const fetchExamTypes = async () => {
    setExamTypesLoading(true);
    try {
      const response = await api.get('results/exam-types');
      console.log('Exam types response:', response.data);
      if (response.data.success) {
        setExamTypes(response.data.data);
      } else {
        setError('Failed to load exam types');
      }
    } catch (err) {
      console.error('Error fetching exam types:', err);
      setError(err.response?.data?.error || 'Failed to load exam types');
    } finally {
      setExamTypesLoading(false);
    }
  };

  // Load exam types on component mount
  useEffect(() => {
    fetchExamTypes();
  }, []);

  const searchStudent = async () => {
    if (!searchValue) {
      setError('Please enter student ID or email');
      return;
    }

    setSearchLoading(true);
    setError('');

    try {
      const response = await api.get('auth/users?role=student');
      
      if (response.data.success && response.data.data) {
        const searchTerm = searchValue.toLowerCase();
        const foundStudent = response.data.data.find(user => {
          const studentProfile = user.Student || user.student;
          
          return (
            user.email?.toLowerCase() === searchTerm ||
            user.name?.toLowerCase().includes(searchTerm) ||
            (studentProfile?.studentId && studentProfile.studentId.toLowerCase() === searchTerm) ||
            (studentProfile?.rollNumber && studentProfile.rollNumber.toString() === searchTerm)
          );
        });
        
        if (foundStudent) {
          const studentProfile = foundStudent.Student || foundStudent.student || {};
          const studentData = {
            id: foundStudent.id,
            studentId: studentProfile.studentId || foundStudent.id.toString(),
            name: foundStudent.name,
            email: foundStudent.email,
            class: studentProfile.class || 'N/A',
            section: studentProfile.section || 'N/A',
            rollNumber: studentProfile.rollNumber || 'N/A',
            user: foundStudent
          };
          setStudent(studentData);
          
          // Initialize subjects based on student's class
          initializeSubjectsForClass(studentData.class);
          setError('');
        } else {
          setError('Student not found. Check ID, email, or name.');
          setStudent(null);
        }
      } else {
        setError('Failed to fetch students list');
        setStudent(null);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Failed to search student');
      setStudent(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const initializeSubjectsForClass = (className) => {
    const classNum = parseInt(className);
    let subjectList = [];
    
    if (classNum <= 5) {
      subjectList = ['English', 'Mathematics', 'Science', 'Social Studies', 'General Knowledge', 'Computer Science'];
    } else if (classNum <= 8) {
      subjectList = ['English', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit/Hindi', 'Computer Science'];
    } else {
      subjectList = ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science'];
    }
    
    setSubjects(subjectList.map(subject => ({
      subject: subject,
      totalMarks: 100,
      passingMarks: 33,
      scoredMarks: ''
    })));
  };

  const addSubject = () => {
    setSubjects([...subjects, { subject: '', totalMarks: '100', passingMarks: '33', scoredMarks: '' }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const calculateAutoTotal = () => {
    let totalObtained = 0;
    let totalMax = 0;
    subjects.forEach(sub => {
      totalObtained += parseInt(sub.scoredMarks) || 0;
      totalMax += parseInt(sub.totalMarks) || 0;
    });
    return { totalObtained, totalMax };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!student) {
      setError('Please search and select a student');
      return;
    }

    if (!selectedExamType) {
      setError('Please select an exam type');
      return;
    }

    const validSubjects = subjects.filter(s => s.subject && s.scoredMarks !== '');
    if (validSubjects.length === 0) {
      setError('Please add at least one subject with marks');
      return;
    }

    const formattedSubjects = validSubjects.map(s => ({
      subject: s.subject,
      totalMarks: parseInt(s.totalMarks) || 100,
      passingMarks: parseInt(s.passingMarks) || 33,
      scoredMarks: parseInt(s.scoredMarks) || 0
    }));

    setLoading(true);
    setError('');

    try {
      const payload = {
        studentId: student.studentId,
        examType: selectedExamType,
        examYear: selectedExamYear,
        subjects: formattedSubjects,
        rank: rank ? parseInt(rank) : null,
        remarks: remarks || null
      };

      const response = await api.post('results/add-by-exam-type', payload);

      if (response.data.success) {
        // Reset form
        setStudent(null);
        setSearchValue('');
        setSelectedExamType('');
        setSubjects([]);
        setRemarks('');
        setRank('');
        
        if (onSuccess) {
          onSuccess(`Result for ${student.name} in ${selectedExamType} added successfully!`);
        }
        
        // Refresh exam types if needed
        fetchExamTypes();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.error || 'Failed to add result');
    } finally {
      setLoading(false);
    }
  };

  const { totalObtained, totalMax } = calculateAutoTotal();
  const autoPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <div className="max-h-[80vh] overflow-y-auto px-2">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg mb-3">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Add Student Result</h2>
        <p className="text-gray-500 text-sm mt-1">Enter marks to automatically calculate percentage and division</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search Student */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            Find Student (by ID, Email, or Name)
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter Student ID, Email, or Name"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={searchStudent}
              disabled={searchLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition flex items-center gap-2 font-medium"
            >
              {searchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
          
          {student && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-purple-200 shadow-sm">
              <p className="font-semibold text-purple-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Student Found
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                <p><span className="text-gray-500">Student ID:</span> <span className="font-medium">{student.studentId}</span></p>
                <p><span className="text-gray-500">Name:</span> <span className="font-medium">{student.name}</span></p>
                <p><span className="text-gray-500">Email:</span> {student.email}</p>
                <p><span className="text-gray-500">Class:</span> {student.class} {student.section}</p>
                <p><span className="text-gray-500">Roll No:</span> {student.rollNumber}</p>
              </div>
            </div>
          )}
        </div>

        {/* Select Exam Type and Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Select Exam Type
              </h3>
              <button
                type="button"
                onClick={fetchExamTypes}
                disabled={examTypesLoading}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
              >
                <RefreshCw className={`w-4 h-4 ${examTypesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
              required
              disabled={examTypesLoading}
            >
              <option value="">-- Choose Exam Type --</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Academic Year
            </h3>
            <select
              value={selectedExamYear}
              onChange={(e) => setSelectedExamYear(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
              required
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Show loading or empty state */}
        {examTypesLoading && (
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <Loader className="w-3 h-3 animate-spin" />
            Loading exam types...
          </p>
        )}
        
        {!examTypesLoading && examTypes.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              No exam types found. Please initialize exams first.
            </p>
          </div>
        )}
        
        {!examTypesLoading && examTypes.length > 0 && (
          <p className="text-xs text-green-600">
            ✓ {examTypes.length} exam type(s) available
          </p>
        )}

        {/* Subjects */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            Subject-wise Marks
          </h3>
          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-3">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subject.subject}
                    onChange={(e) => updateSubject(index, 'subject', e.target.value)}
                    placeholder="Subject Name"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={subject.totalMarks}
                    onChange={(e) => updateSubject(index, 'totalMarks', e.target.value)}
                    placeholder="Total"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={subject.passingMarks}
                    onChange={(e) => updateSubject(index, 'passingMarks', e.target.value)}
                    placeholder="Passing"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={subject.scoredMarks}
                    onChange={(e) => updateSubject(index, 'scoredMarks', e.target.value)}
                    placeholder="Scored"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSubject}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2 text-sm font-medium mt-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Subject
            </button>
          </div>

          {/* Live Summary Card */}
          {totalMax > 0 && (
            <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Total Marks</p>
                  <p className="text-xl font-bold text-gray-800">{totalObtained} / {totalMax}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Percentage</p>
                  <p className="text-xl font-bold text-purple-600">{autoPercentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-xl font-bold ${autoPercentage >= 33 ? 'text-green-600' : 'text-red-600'}`}>
                    {autoPercentage >= 33 ? 'Pass' : 'Fail'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rank & Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rank (Optional)</label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="Class Rank"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows="2"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            placeholder="Additional comments about performance..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !student || !selectedExamType || examTypes.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Publish Result
        </button>
      </form>
    </div>
  );
};

export default AddResultForm;