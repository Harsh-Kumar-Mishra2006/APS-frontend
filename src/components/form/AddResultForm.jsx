import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader, Search, Plus, Trash2, AlertCircle, Mail, Send } from 'lucide-react';

const AddResultForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [subjects, setSubjects] = useState([
    { subject: '', totalMarks: '', passingMarks: '', scoredMarks: '' }
  ]);
  const [remarks, setRemarks] = useState('');
  const [rank, setRank] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('results/exams');
      if (response.data.success) {
        setExams(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const searchStudent = async () => {
    if (!searchValue) {
      setError('Please enter student email or ID');
      return;
    }

    setSearchLoading(true);
    setError('');

    try {
      const response = await api.get('auth/users?role=student');
      if (response.data.success) {
        const foundStudent = response.data.data.find(
          s => s.email.toLowerCase() === searchValue.toLowerCase() || 
               s.student?.studentId === searchValue
        );
        
        if (foundStudent) {
          setStudent(foundStudent);
          setError('');
        } else {
          setError('Student not found');
          setStudent(null);
        }
      }
    } catch (err) {
      setError('Failed to search student');
    } finally {
      setSearchLoading(false);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { subject: '', totalMarks: '', passingMarks: '', scoredMarks: '' }]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!student) {
      setError('Please search and select a student');
      return;
    }

    if (!selectedExam) {
      setError('Please select an exam');
      return;
    }

    const validSubjects = subjects.filter(s => s.subject && s.totalMarks && s.scoredMarks !== '');
    if (validSubjects.length === 0) {
      setError('Please add at least one subject with marks');
      return;
    }

    const formattedSubjects = validSubjects.map(s => ({
      subject: s.subject,
      totalMarks: parseInt(s.totalMarks),
      passingMarks: parseInt(s.passingMarks) || 0,
      scoredMarks: parseInt(s.scoredMarks)
    }));

    setLoading(true);
    setError('');

    try {
      const response = await api.post('results/add', {
        studentId: student.student.id,
        examId: parseInt(selectedExam),
        subjects: formattedSubjects,
        rank: rank ? parseInt(rank) : null,
        remarks: remarks || null,
        sendEmail
      });

      if (response.data.success) {
        // Reset form
        setStudent(null);
        setSearchValue('');
        setSelectedExam('');
        setSubjects([{ subject: '', totalMarks: '', passingMarks: '', scoredMarks: '' }]);
        setRemarks('');
        setRank('');
        
        if (onSuccess) {
          onSuccess(`Result for ${student.name} added successfully${response.data.emailSent ? ' and email sent!' : '!'}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎓 Add Student Result</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Student */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">1. Find Student</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter student email or Student ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={searchStudent}
              disabled={searchLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              {searchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
          
          {student && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="font-semibold text-purple-800">{student.name}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                <p><span className="text-gray-600">Email:</span> {student.email}</p>
                <p><span className="text-gray-600">Class:</span> {student.student?.class} {student.student?.section}</p>
                <p><span className="text-gray-600">Roll No:</span> {student.student?.rollNumber}</p>
                <p><span className="text-gray-600">Student ID:</span> {student.student?.studentId}</p>
              </div>
            </div>
          )}
        </div>

        {/* Select Exam */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">2. Select Exam</h3>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select Exam</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.examType} - {exam.examYear} {exam.term ? `(${exam.term})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Subjects */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">3. Subject-wise Marks</h3>
          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="text"
                  value={subject.subject}
                  onChange={(e) => updateSubject(index, 'subject', e.target.value)}
                  placeholder="Subject Name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <input
                  type="number"
                  value={subject.totalMarks}
                  onChange={(e) => updateSubject(index, 'totalMarks', e.target.value)}
                  placeholder="Total"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <input
                  type="number"
                  value={subject.passingMarks}
                  onChange={(e) => updateSubject(index, 'passingMarks', e.target.value)}
                  placeholder="Passing"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <input
                  type="number"
                  value={subject.scoredMarks}
                  onChange={(e) => updateSubject(index, 'scoredMarks', e.target.value)}
                  placeholder="Scored"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSubject}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Rank (Optional)</label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="Class Rank"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-700 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Send email notification to student & parent
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Remarks (Optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Additional comments about performance..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !student}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Add Result {sendEmail && '(Email will be sent)'}
        </button>
      </form>
    </div>
  );
};

export default AddResultForm;