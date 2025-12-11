// src/components/marks/AddMarksForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import studentPerformanceApi from '../../utils/studentPerformanceAPI';

const AddMarksForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    examType: '',
    examMonth: '',
    examYear: new Date().getFullYear(),
    class: '',
    section: '',
    conductedDate: new Date().toISOString().split('T')[0],
    remarks: '',
    studentEmail: '',
    academicYear: studentPerformanceApi.getCurrentAcademicYear()
  });
  const [subjects, setSubjects] = useState([
    studentPerformanceApi.createDefaultSubject()
  ]);

  const examTypes = studentPerformanceApi.getExamTypes();
  const months = studentPerformanceApi.getMonths();
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

  useEffect(() => {
    if (formData.class && formData.section) {
      fetchStudents();
    }
  }, [formData.class, formData.section]);

  const fetchStudents = async () => {
    try {
      const response = await studentPerformanceApi.getClassPerformance({
        class: formData.class,
        section: formData.section,
        academicYear: formData.academicYear
      });
      
      if (response.success) {
        setStudents(response.data.map(record => ({
          _id: record.studentId,
          name: record.studentName,
          rollNumber: record.rollNumber,
          email: record.studentEmail,
          performanceId: record._id,
          studentEmail: record.studentEmail,
          class: record.class,
          section: record.section
        })));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const fetchStudentByEmail = async () => {
    if (!formData.studentEmail || !studentPerformanceApi.validateEmail(formData.studentEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await studentPerformanceApi.getStudentPerformanceByEmail(formData.studentEmail);
      
      if (response.success && response.data) {
        const student = response.data;
        setStudents([{
          _id: student.studentId,
          name: student.studentName,
          rollNumber: student.rollNumber,
          email: student.studentEmail,
          performanceId: student._id,
          studentEmail: student.studentEmail,
          class: student.class,
          section: student.section
        }]);
        
        setFormData(prev => ({
          ...prev,
          class: student.class,
          section: student.section,
          academicYear: student.academicYear
        }));
      } else {
        toast.error('Student not found with this email');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching student by email:', error);
      toast.error('Failed to fetch student data');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (['class', 'section', 'academicYear'].includes(name)) {
      setStudents([]);
    }
  };

  const handleSubjectChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSubjects = [...subjects];
    
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [name]: name === 'totalMarks' || name === 'obtainedMarks' ? parseFloat(value) || 0 : value,
      percentage: name === 'totalMarks' || name === 'obtainedMarks' 
        ? calculateSubjectPercentage(
            name === 'obtainedMarks' ? value : updatedSubjects[index].obtainedMarks,
            name === 'totalMarks' ? value : updatedSubjects[index].totalMarks
          )
        : updatedSubjects[index].percentage,
      grade: name === 'obtainedMarks' || name === 'totalMarks'
        ? calculateGrade(
            name === 'obtainedMarks' ? value : updatedSubjects[index].obtainedMarks,
            name === 'totalMarks' ? value : updatedSubjects[index].totalMarks
          )
        : updatedSubjects[index].grade
    };
    
    setSubjects(updatedSubjects);
  };

  const calculateSubjectPercentage = (obtained, total) => {
    if (!obtained || !total || total === 0) return 0;
    return (parseFloat(obtained) / parseFloat(total)) * 100;
  };

  const calculateGrade = (obtained, total) => {
    const percentage = calculateSubjectPercentage(obtained, total);
    return studentPerformanceApi.getGrade(percentage);
  };

  const addSubject = () => {
    setSubjects([...subjects, studentPerformanceApi.createDefaultSubject()]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const updatedSubjects = [...subjects];
      updatedSubjects.splice(index, 1);
      setSubjects(updatedSubjects);
    }
  };

  const calculateOverallPercentage = () => {
    if (subjects.length === 0) return 0;
    
    const totalMarks = subjects.reduce((sum, subject) => sum + (subject.totalMarks || 0), 0);
    const totalObtained = subjects.reduce((sum, subject) => sum + (subject.obtainedMarks || 0), 0);
    
    return totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
  };

  const getOverallGrade = () => {
    const percentage = calculateOverallPercentage();
    return studentPerformanceApi.getGrade(percentage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.examType || !formData.examMonth || !formData.examYear) {
      toast.error('Please fill all required exam details');
      return;
    }

    if (students.length === 0) {
      toast.error('No students found');
      return;
    }

    const invalidSubjects = subjects.filter(s => !s.subjectName || s.totalMarks <= 0);
    if (invalidSubjects.length > 0) {
      toast.error('Please fill all subject details correctly');
      return;
    }

    setLoading(true);

    try {
      // Prepare exam data for all subjects
      const processedSubjects = subjects.map(subject => ({
        subjectName: subject.subjectName,
        totalMarks: subject.totalMarks,
        obtainedMarks: subject.obtainedMarks,
        percentage: subject.percentage || calculateSubjectPercentage(subject.obtainedMarks, subject.totalMarks),
        grade: subject.grade || calculateGrade(subject.obtainedMarks, subject.totalMarks),
        subjectCode: subject.subjectCode
      }));

      const totalMarks = processedSubjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
      const totalObtained = processedSubjects.reduce((sum, subject) => sum + subject.obtainedMarks, 0);
      const overallPercentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;

      const examData = {
        examType: formData.examType,
        examMonth: formData.examMonth,
        examYear: formData.examYear,
        subjects: processedSubjects,
        overallPercentage,
        overallGrade: studentPerformanceApi.getGrade(overallPercentage),
        remarks: formData.remarks,
        conductedDate: formData.conductedDate,
        uploadedBy: user._id
      };

      // Add exam results for each student
      const promises = students.map(student => 
        studentPerformanceApi.addExamResult(student.performanceId, examData)
      );

      const results = await Promise.all(promises);
      const successfulResults = results.filter(r => r.success).length;
      
      toast.success(`Marks added successfully for ${successfulResults} students`);
      
      // Reset form
      setSubjects([studentPerformanceApi.createDefaultSubject()]);
      setFormData({
        examType: '',
        examMonth: '',
        examYear: new Date().getFullYear(),
        class: '',
        section: '',
        conductedDate: new Date().toISOString().split('T')[0],
        remarks: '',
        studentEmail: '',
        academicYear: studentPerformanceApi.getCurrentAcademicYear()
      });
      setStudents([]);
      
    } catch (error) {
      console.error('Error adding marks:', error);
      toast.error(error.error || 'Failed to add marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Exam Marks</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Student Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Email
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                name="studentEmail"
                value={formData.studentEmail}
                onChange={handleChange}
                placeholder="student@example.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={fetchStudentByEmail}
                disabled={loading}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Load
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              placeholder="2024-2025"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Students Found</div>
            <div className="text-lg font-bold text-blue-600">{students.length}</div>
          </div>
        </div>

        {/* Exam Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Type *
            </label>
            <select
              name="examType"
              value={formData.examType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Exam Type</option>
              {examTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Month *
            </label>
            <select
              name="examMonth"
              value={formData.examMonth}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Year *
            </label>
            <select
              name="examYear"
              value={formData.examYear}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conducted Date
            </label>
            <input
              type="date"
              name="conductedDate"
              value={formData.conductedDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Class & Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Section</option>
              {sections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchStudents}
              disabled={!formData.class || !formData.section}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Load Class Students
            </button>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Subjects & Marks</h4>
            <button
              type="button"
              onClick={addSubject}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Subject
            </button>
          </div>

          {subjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  name="subjectName"
                  value={subject.subjectName}
                  onChange={(e) => handleSubjectChange(index, e)}
                  required
                  placeholder="e.g., Mathematics"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Code
                </label>
                <input
                  type="text"
                  name="subjectCode"
                  value={subject.subjectCode}
                  onChange={(e) => handleSubjectChange(index, e)}
                  placeholder="e.g., MATH101"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks *
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={subject.totalMarks}
                  onChange={(e) => handleSubjectChange(index, e)}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obtained Marks
                </label>
                <input
                  type="number"
                  name="obtainedMarks"
                  value={subject.obtainedMarks}
                  onChange={(e) => handleSubjectChange(index, e)}
                  min="0"
                  max={subject.totalMarks}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Subject Stats */}
              {subject.totalMarks > 0 && (
                <div className="col-span-full grid grid-cols-3 gap-4 mt-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-xs text-blue-700">Percentage</div>
                    <div className="text-sm font-bold text-blue-800">
                      {calculateSubjectPercentage(subject.obtainedMarks, subject.totalMarks).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-xs text-green-700">Grade</div>
                    <div className="text-sm font-bold text-green-800">
                      {calculateGrade(subject.obtainedMarks, subject.totalMarks)}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-xs text-yellow-700">Marks</div>
                    <div className="text-sm font-bold text-yellow-800">
                      {subject.obtainedMarks}/{subject.totalMarks}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overall Statistics */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700">Overall Statistics</div>
              <div className="flex items-center space-x-6 mt-2">
                <div>
                  <div className="text-xs text-gray-600">Total Subjects</div>
                  <div className="text-xl font-bold text-blue-800">{subjects.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Overall Percentage</div>
                  <div className="text-xl font-bold text-green-800">{calculateOverallPercentage().toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Overall Grade</div>
                  <div className="text-xl font-bold text-purple-800">{getOverallGrade()}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">This will be applied to all {students.length} students</div>
              <div className="text-xs text-gray-500">Based on email: {students.map(s => s.email).join(', ')}</div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks (Optional)
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="3"
            placeholder="Any remarks about this exam..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || students.length === 0}
            className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
              loading || students.length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-purple-700 hover:to-purple-800'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Marks...
              </div>
            ) : (
              `Add Marks for ${students.length} Students`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMarksForm;