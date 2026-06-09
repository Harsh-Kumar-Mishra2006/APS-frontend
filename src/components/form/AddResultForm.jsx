// src/components/form/AddResultForm.jsx (TABULAR UI VERSION)
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader, Search, Plus, Calendar, Trash2, AlertCircle, Send, GraduationCap, BookOpen, Award, User, RefreshCw, Minus, TrendingUp, TrendingDown } from 'lucide-react';

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

  const calculatePassingStatus = () => {
    let failedSubjects = [];
    subjects.forEach(sub => {
      const scored = parseInt(sub.scoredMarks) || 0;
      const passing = parseInt(sub.passingMarks) || 33;
      if (scored < passing) {
        failedSubjects.push(sub.subject || 'Unknown Subject');
      }
    });
    return {
      isPass: failedSubjects.length === 0,
      failedSubjects: failedSubjects
    };
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
  const passStatus = calculatePassingStatus();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  // Get grade based on percentage
  const getGrade = (percentage) => {
    const p = parseFloat(percentage);
    if (p >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (p >= 80) return { grade: 'A', color: 'text-green-500' };
    if (p >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (p >= 60) return { grade: 'B', color: 'text-blue-500' };
    if (p >= 50) return { grade: 'C+', color: 'text-yellow-600' };
    if (p >= 40) return { grade: 'C', color: 'text-orange-500' };
    if (p >= 33) return { grade: 'D', color: 'text-red-500' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const gradeInfo = getGrade(autoPercentage);

  return (
    <div className="max-h-[85vh] overflow-y-auto px-2">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg mb-3">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Add Student Result</h2>
        <p className="text-gray-500 text-sm mt-1">Enter marks in the table below - percentage and grade calculated automatically</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search Student Section */}
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
        
        {/* Exam Types Status */}
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
          <p className="text-xs text-green-600 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            {examTypes.length} exam type(s) available
          </p>
        )}

        {/* TABULAR SUBJECTS SECTION */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Subject-wise Marks Entry
            </h3>
            <button
              type="button"
              onClick={addSubject}
              className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center gap-1 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Subject Name</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Total Marks</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Passing Marks</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Scored Marks</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="divide-y divide-gray-200 bg-white">
                {subjects.map((subject, index) => {
                  const scored = parseInt(subject.scoredMarks) || 0;
                  const passing = parseInt(subject.passingMarks) || 33;
                  const total = parseInt(subject.totalMarks) || 100;
                  const isPassing = scored >= passing;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={subject.subject}
                          onChange={(e) => updateSubject(index, 'subject', e.target.value)}
                          placeholder="Subject Name"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </td>
                      
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={subject.totalMarks}
                          onChange={(e) => updateSubject(index, 'totalMarks', e.target.value)}
                          className="w-24 text-center px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </td>
                      
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={subject.passingMarks}
                          onChange={(e) => updateSubject(index, 'passingMarks', e.target.value)}
                          className="w-24 text-center px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </td>
                      
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={subject.scoredMarks}
                          onChange={(e) => updateSubject(index, 'scoredMarks', e.target.value)}
                          className={`w-24 text-center px-2 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-medium ${
                            subject.scoredMarks ? (isPassing ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : 'border-gray-200'
                          }`}
                        />
                      </td>
                      
                      <td className="px-4 py-3 text-center">
                        {subject.scoredMarks ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isPassing ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {isPassing ? 'Pass' : 'Fail'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Pending</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeSubject(index)}
                          disabled={subjects.length === 1}
                          className={`p-1.5 rounded-lg transition ${
                            subjects.length === 1 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Card */}
          {totalMax > 0 && (
            <div className="mt-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Result Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Marks</p>
                  <p className="text-2xl font-bold text-gray-800">{totalObtained} / {totalMax}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Percentage</p>
                  <p className="text-2xl font-bold text-purple-600">{autoPercentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Grade</p>
                  <p className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Overall Status</p>
                  <p className={`text-2xl font-bold ${passStatus.isPass ? 'text-green-600' : 'text-red-600'}`}>
                    {passStatus.isPass ? 'PASS' : 'FAIL'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Subjects</p>
                  <p className="text-2xl font-bold text-gray-800">{subjects.length}</p>
                </div>
              </div>
              
              {!passStatus.isPass && passStatus.failedSubjects.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Failed in: {passStatus.failedSubjects.join(', ')}
                  </p>
                </div>
              )}
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