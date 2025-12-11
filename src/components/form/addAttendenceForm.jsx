// src/components/attendance/AddAttendanceForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import studentPerformanceApi from '../../utils/studentPerformanceAPI';
import useStudentPerformance from '../../hooks/useStudentPerformance';

const AddAttendanceForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [attendanceFiles, setAttendanceFiles] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    class: '',
    section: '',
    attendanceType: 'daily',
    studentEmail: '',
    academicYear: studentPerformanceApi.getCurrentAcademicYear()
  });

  const [monthlyAttendanceData, setMonthlyAttendanceData] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    workingDays: 22,
    presentDays: 0,
    remarks: '',
    attendancePercentage: 0 // Add this initial value
  });

  // Fetch students when class/section changes
  useEffect(() => {
    if (formData.class && formData.section) {
      fetchStudents();
    }
  }, [formData.class, formData.section]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch performance records for the class and section
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
    } finally {
      setLoading(false);
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
        
        // Auto-fill class and section
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
    
    // Clear students when class/section changes
    if (['class', 'section', 'academicYear'].includes(name)) {
      setStudents([]);
      setSelectedStudents({});
    }
  };

  const handleMonthlyAttendanceChange = (e) => {
  const { name, value } = e.target;
  
  // Parse numeric values
  const newWorkingDays = name === 'workingDays' ? parseInt(value) : monthlyAttendanceData.workingDays;
  const newPresentDays = name === 'presentDays' ? parseInt(value) : monthlyAttendanceData.presentDays;
  
  // Calculate attendance percentage
  const attendancePercentage = newWorkingDays > 0 
    ? (newPresentDays / newWorkingDays) * 100 
    : 0;

  setMonthlyAttendanceData(prev => ({
    ...prev,
    [name]: name === 'year' || name === 'workingDays' || name === 'presentDays' 
      ? parseInt(value) || 0 
      : value,
    attendancePercentage // Add this line to store the calculated percentage
  }));
};

  const calculateAttendancePercentage = (presentDays, workingDays) => {
    if (!presentDays || !workingDays || workingDays === 0) return 0;
    return (presentDays / workingDays) * 100;
  };

  const handleStudentSelect = (studentId, status) => {
    setSelectedStudents(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleBulkSelect = (status) => {
    const newSelection = {};
    students.forEach(student => {
      newSelection[student._id] = status;
    });
    setSelectedStudents(newSelection);
  };

  const handleSubmitDailyAttendance = async (e) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error('Please select date');
      return;
    }

    const markedStudents = Object.entries(selectedStudents)
      .filter(([_, status]) => status)
      .map(([studentId, status]) => {
        const student = students.find(s => s._id === studentId);
        return { student, status };
      });

    if (markedStudents.length === 0) {
      toast.error('Please select attendance status for at least one student');
      return;
    }

    setLoading(true);

    try {
      const attendancePromises = markedStudents.map(({ student, status }) => {
        return studentPerformanceApi.markAttendance(
          student.performanceId,
          {
            date: formData.date,
            status: status,
            reason: '',
            markedBy: user._id
          }
        );
      });

      const results = await Promise.all(attendancePromises);
      const successfulMarks = results.filter(r => r.success).length;
      
      toast.success(`Attendance marked successfully for ${successfulMarks} students`);
      
      // Reset selection
      setSelectedStudents({});
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMonthlyAttendance = async (e) => {
    e.preventDefault();
    
    if (!monthlyAttendanceData.month || !monthlyAttendanceData.year) {
      toast.error('Please select month and year');
      return;
    }

    if (monthlyAttendanceData.workingDays <= 0) {
      toast.error('Working days must be greater than 0');
      return;
    }

    if (monthlyAttendanceData.presentDays > monthlyAttendanceData.workingDays) {
      toast.error('Present days cannot exceed working days');
      return;
    }

    setLoading(true);

    try {
      const updatePromises = students.map(student => {
        return studentPerformanceApi.updateMonthlyAttendance(
          student.performanceId,
          {
            ...monthlyAttendanceData,
            updatedBy: user._id
          }
        );
      });

      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(r => r.success).length;
      
      toast.success(`Monthly attendance updated for ${successfulUpdates} students`);
      
    } catch (error) {
      console.error('Error updating monthly attendance:', error);
      toast.error(error.error || 'Failed to update monthly attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (students.length === 0) {
      toast.error('Please load students first');
      return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('attendanceFile', file);
      formDataObj.append('month', monthlyAttendanceData.month);
      formDataObj.append('year', monthlyAttendanceData.year);
      formDataObj.append('forMonth', monthlyAttendanceData.month);
      formDataObj.append('description', `Attendance file for ${monthlyAttendanceData.month} ${monthlyAttendanceData.year}`);

      // Upload for first student as example
      if (students.length > 0) {
        const result = await studentPerformanceApi.uploadAttendanceFile(
          students[0].performanceId,
          formDataObj
        );

        if (result.success) {
          toast.success('Attendance file uploaded successfully');
          setAttendanceFiles(prev => [...prev, {
            id: result.data._id,
            fileName: file.name,
            month: monthlyAttendanceData.month,
            year: monthlyAttendanceData.year
          }]);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.error || 'Failed to upload file');
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const months = studentPerformanceApi.getMonths();
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Mark Student Attendance</h3>
      
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setFormData(prev => ({ ...prev, attendanceType: 'daily' }))}
            className={`px-4 py-2 rounded-lg font-medium ${
              formData.attendanceType === 'daily' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Daily Attendance
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, attendanceType: 'monthly' }))}
            className={`px-4 py-2 rounded-lg font-medium ${
              formData.attendanceType === 'monthly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Monthly Attendance
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, attendanceType: 'bulk' }))}
            className={`px-4 py-2 rounded-lg font-medium ${
              formData.attendanceType === 'bulk' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Common Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            Class *
          </label>
          <select
            name="class"
            value={formData.class}
            onChange={handleChange}
            required
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
            Section *
          </label>
          <select
            name="section"
            value={formData.section}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Section</option>
            {sections.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
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
      </div>

      {formData.attendanceType === 'daily' && (
        <DailyAttendanceForm
          formData={formData}
          handleChange={handleChange}
          students={students}
          loading={loading}
          selectedStudents={selectedStudents}
          handleStudentSelect={handleStudentSelect}
          handleBulkSelect={handleBulkSelect}
          handleSubmitDailyAttendance={handleSubmitDailyAttendance}
          setSelectedStudents={setSelectedStudents}
        />
      )}

      {formData.attendanceType === 'monthly' && (
        <MonthlyAttendanceForm
          monthlyAttendanceData={monthlyAttendanceData}
          handleMonthlyAttendanceChange={handleMonthlyAttendanceChange}
          students={students}
          loading={loading}
          handleSubmitMonthlyAttendance={handleSubmitMonthlyAttendance}
          months={months}
          years={years}
        />
      )}

      {formData.attendanceType === 'bulk' && (
        <BulkUploadForm
          handleFileUpload={handleFileUpload}
          attendanceFiles={attendanceFiles}
          setAttendanceFiles={setAttendanceFiles}
        />
      )}
    </div>
  );
};

// Sub-components for better organization
const DailyAttendanceForm = ({
  formData,
  handleChange,
  students,
  loading,
  selectedStudents,
  handleStudentSelect,
  handleBulkSelect,
  handleSubmitDailyAttendance,
  setSelectedStudents
}) => (
  <form onSubmit={handleSubmitDailyAttendance}>
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Date *
      </label>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
        className="w-full md:w-1/4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    {students.length > 0 ? (
      <>
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => handleBulkSelect('present')}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => handleBulkSelect('absent')}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Mark All Absent
          </button>
          <button
            type="button"
            onClick={() => setSelectedStudents({})}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Clear All
          </button>
        </div>

        <div className="border rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 font-medium text-gray-700">Select</div>
              <div className="col-span-2 font-medium text-gray-700">Roll No</div>
              <div className="col-span-3 font-medium text-gray-700">Student Name</div>
              <div className="col-span-3 font-medium text-gray-700">Email</div>
              <div className="col-span-3 font-medium text-gray-700">Status</div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {students.map((student) => (
              <div key={student._id} className="border-b px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={!!selectedStudents[student._id]}
                      onChange={(e) => handleStudentSelect(student._id, e.target.checked ? 'present' : null)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-900">{student.rollNumber}</span>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">{student.name?.charAt(0)}</span>
                      </div>
                      <span className="text-gray-900">{student.name}</span>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-gray-600 truncate">
                    {student.email}
                  </div>
                  <div className="col-span-3">
                    <div className="flex space-x-2">
                      {['present', 'absent', 'late', 'half-day'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStudentSelect(student._id, status)}
                          className={`px-3 py-1 rounded text-sm capitalize ${
                            selectedStudents[student._id] === status
                              ? status === 'present' ? 'bg-green-100 text-green-700 border border-green-300'
                              : status === 'absent' ? 'bg-red-100 text-red-700 border border-red-300'
                              : status === 'late' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                              : 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-700">Present</div>
            <div className="text-2xl font-bold text-green-800">
              {Object.values(selectedStudents).filter(s => s === 'present').length}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-700">Absent</div>
            <div className="text-2xl font-bold text-red-800">
              {Object.values(selectedStudents).filter(s => s === 'absent').length}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-700">Late</div>
            <div className="text-2xl font-bold text-yellow-800">
              {Object.values(selectedStudents).filter(s => s === 'late').length}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-700">Total Selected</div>
            <div className="text-2xl font-bold text-blue-800">
              {Object.keys(selectedStudents).length}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || Object.keys(selectedStudents).length === 0}
            className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
              loading || Object.keys(selectedStudents).length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Attendance...
              </div>
            ) : (
              'Save Daily Attendance'
            )}
          </button>
        </div>
      </>
    ) : (
      <div className="text-center py-8">
        {formData.studentEmail 
          ? 'No student found with this email'
          : 'Enter email or select class & section to load students'}
      </div>
    )}
  </form>
);

const MonthlyAttendanceForm = ({
  monthlyAttendanceData,
  handleMonthlyAttendanceChange,
  students,
  loading,
  handleSubmitMonthlyAttendance,
  months,
  years
}) => (
  <form onSubmit={handleSubmitMonthlyAttendance}>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Month *
        </label>
        <select
          name="month"
          value={monthlyAttendanceData.month}
          onChange={handleMonthlyAttendanceChange}
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
          Year *
        </label>
        <select
          name="year"
          value={monthlyAttendanceData.year}
          onChange={handleMonthlyAttendanceChange}
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
          Working Days *
        </label>
        <input
          type="number"
          name="workingDays"
          value={monthlyAttendanceData.workingDays}
          onChange={handleMonthlyAttendanceChange}
          min="1"
          max="31"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Present Days
        </label>
        <input
          type="number"
          name="presentDays"
          value={monthlyAttendanceData.presentDays}
          onChange={handleMonthlyAttendanceChange}
          min="0"
          max={monthlyAttendanceData.workingDays}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Remarks
      </label>
      <textarea
        name="remarks"
        value={monthlyAttendanceData.remarks}
        onChange={handleMonthlyAttendanceChange}
        rows="3"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Any remarks about this month's attendance..."
      />
    </div>

    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-blue-700">Attendance Percentage</div>
          <div className="text-3xl font-bold text-blue-800">
            {monthlyAttendanceData.attendancePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {monthlyAttendanceData.presentDays} / {monthlyAttendanceData.workingDays} days
          </div>
          <div className="text-xs text-gray-500">
            {monthlyAttendanceData.month} {monthlyAttendanceData.year}
          </div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="text-sm text-yellow-700 mb-2">Applied to:</div>
        <div className="text-lg font-semibold text-yellow-800">
          {students.length} students
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {students.map(s => s.name).join(', ')}
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={loading || students.length === 0}
        className={`px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-green-800'
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Updating Monthly Attendance...
          </div>
        ) : (
          `Update Attendance for ${students.length} Students`
        )}
      </button>
    </div>
  </form>
);

const BulkUploadForm = ({
  handleFileUpload,
  attendanceFiles,
  setAttendanceFiles
}) => (
  <div>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
      <input
        type="file"
        id="attendanceFile"
        accept=".xlsx,.xls,.csv,.pdf"
        onChange={handleFileUpload}
        className="hidden"
      />
      <label htmlFor="attendanceFile" className="cursor-pointer block">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-gray-600">Click to upload attendance file</p>
        <p className="text-sm text-gray-500 mt-1">Excel, CSV, or PDF files only (Max 15MB)</p>
        <p className="text-xs text-blue-500 mt-2">Download template</p>
      </label>
    </div>

    {attendanceFiles.length > 0 && (
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Uploaded Files</h4>
        <div className="space-y-2">
          {attendanceFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-900">{file.fileName}</div>
                  <div className="text-xs text-gray-500">
                    {file.month} {file.year}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAttendanceFiles(prev => prev.filter(f => f.id !== file.id))}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="text-sm text-gray-500">
      <p className="mb-2">📋 File should contain the following columns:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Student Email (Required)</li>
        <li>Student Name</li>
        <li>Roll Number</li>
        <li>Date (YYYY-MM-DD)</li>
        <li>Status (present/absent/late/half-day)</li>
        <li>Remarks (Optional)</li>
      </ul>
    </div>
  </div>
);

export default AddAttendanceForm;