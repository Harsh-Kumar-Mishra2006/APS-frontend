// src/utils/studentPerformanceApi.js - FIXED VERSION
import api from './api';

const studentPerformanceApi = {
  // ========== PERFORMANCE RECORDS MANAGEMENT ==========
  
  /**
   * Create a new student performance record (Admin only) with email verification
   * @param {Object} data - { studentId, studentEmail, academicYear, class, section }
   * @returns {Promise} API response
   */
  createPerformanceRecord: async (data) => {
    try {
      const response = await api.post('student-performance', data); // REMOVED /api
      return response.data;
    } catch (error) {
      console.error('Create performance record error:', error);
      throw error.response?.data || { success: false, error: 'Failed to create performance record' };
    }
  },

  /**
   * Get performance record for a specific student by ID
   * @param {string} studentId - Student ID
   * @returns {Promise} Student performance data
   */
  getStudentPerformance: async (studentId) => {
    try {
      const response = await api.get(`student-performance/student/${studentId}`); // REMOVED /api
      return response.data;
    } catch (error) {
      console.error('Get student performance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch student performance' };
    }
  },

  /**
   * Get performance record for a specific student by Email
   * @param {string} email - Student email
   * @returns {Promise} Student performance data
   */
  getStudentPerformanceByEmail: async (email) => {
    try {
      const response = await api.get(`student-performance/email/${email}`); // REMOVED /api
      return response.data;
    } catch (error) {
      console.error('Get student performance by email error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch student performance' };
    }
  },

  /**
   * Get performance data for an entire class
   * @param {Object} params - { class, section, academicYear }
   * @returns {Promise} Class performance data
   */
  getClassPerformance: async (params = {}) => {
    try {
      const response = await api.get('student-performance/class', { params }); // REMOVED /api
      return response.data;
    } catch (error) {
      console.error('Get class performance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch class performance' };
    }
  },

  // ========== ATTENDANCE MANAGEMENT ==========
  
  /**
   * Mark daily attendance for a student
   * @param {string} performanceId - Performance record ID
   * @param {Object} data - { date, status, reason }
   * @returns {Promise} Updated performance data
   */
  markAttendance: async (performanceId, data) => {
    try {
      const response = await api.post(`student-performance/${performanceId}/attendance`, data); // REMOVED /api
      return response.data;
    } catch (error) {
      console.error('Mark attendance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to mark attendance' };
    }
  },

  /**
   * Update monthly attendance with working days and present days
   * @param {string} performanceId - Performance record ID
   * @param {Object} data - { month, year, workingDays, presentDays, remarks }
   * @returns {Promise} Updated monthly attendance data
   */
  updateMonthlyAttendance: async (performanceId, data) => {
    try {
      const response = await api.put(`student-performance/${performanceId}/monthly-attendance`, data); // REMOVED /api
      return response.data;
    } catch (error) {
      console.error('Update monthly attendance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to update monthly attendance' };
    }
  },

  /**
   * Get monthly attendance data
   * @param {string} performanceId - Performance record ID
   * @param {Object} params - { month, year } (optional)
   * @returns {Promise} Monthly attendance data
   */
  getMonthlyAttendance: async (performanceId, params = {}) => {
    try {
      const response = await api.get(`student-performance/${performanceId}/monthly-attendance`, { params }); // REMOVED /api
      return response.data;
    } catch (error) {
      console.error('Get monthly attendance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch monthly attendance' };
    }
  },

  /**
   * Upload attendance file (Excel/PDF/CSV)
   * @param {string} performanceId - Performance record ID
   * @param {FormData} formData - Contains file and metadata { month, year, forMonth, description }
   * @returns {Promise} Upload result
   */
  uploadAttendanceFile: async (performanceId, formData) => {
    try {
      const response = await api.post(`student-performance/${performanceId}/upload-attendance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload attendance file error:', error);
      throw error.response?.data || { success: false, error: 'Failed to upload attendance file' };
    }
  },

  /**
   * Delete an attendance file
   * @param {string} performanceId - Performance record ID
   * @param {string} fileId - File ID to delete
   * @returns {Promise} Deletion result
   */
  deleteAttendanceFile: async (performanceId, fileId) => {
    try {
      const response = await api.delete(`student-performance/${performanceId}/attendance-file/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Delete attendance file error:', error);
      throw error.response?.data || { success: false, error: 'Failed to delete attendance file' };
    }
  },

  /**
   * Download attendance file
   * @param {string} performanceId - Performance record ID
   * @param {string} fileId - File ID to download
   * @returns {Promise} File blob
   */
  downloadAttendanceFile: async (performanceId, fileId) => {
    try {
      const response = await api.get(`student-performance/${performanceId}/download-attendance/${fileId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Download attendance file error:', error);
      throw error.response?.data || { success: false, error: 'Failed to download attendance file' };
    }
  },

  // ========== EXAM RESULTS MANAGEMENT ==========
  
  /**
   * Add exam result with multiple subjects
   * @param {string} performanceId - Performance record ID
   * @param {Object} data - { examType, examMonth, examYear, subjects[], remarks, conductedDate }
   * @returns {Promise} Updated performance data
   */
  addExamResult: async (performanceId, data) => {
    try {
      const response = await api.post(`student-performance/${performanceId}/exam-result`, data);
      return response.data;
    } catch (error) {
      console.error('Add exam result error:', error);
      throw error.response?.data || { success: false, error: 'Failed to add exam result' };
    }
  },

  /**
   * Get exam results with filtering
   * @param {string} performanceId - Performance record ID
   * @param {Object} params - { examType, month, year }
   * @returns {Promise} Filtered exam results
   */
  getExamResultsByFilter: async (performanceId, params = {}) => {
    try {
      const response = await api.get(`student-performance/${performanceId}/exam-results`, { params });
      return response.data;
    } catch (error) {
      console.error('Get exam results by filter error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch exam results' };
    }
  },

  // ========== CLASS PERFORMANCE MANAGEMENT ==========
  
  /**
   * Add class performance metrics
   * @param {string} performanceId - Performance record ID
   * @param {Object} data - { month, year, participationScore, homeworkCompletion, disciplineScore, extraCurricular, remarks }
   * @returns {Promise} Updated performance data
   */
  addClassPerformance: async (performanceId, data) => {
    try {
      const response = await api.post(`student-performance/${performanceId}/class-performance`, data);
      return response.data;
    } catch (error) {
      console.error('Add class performance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to add class performance' };
    }
  },

  // ========== TEACHER REMARKS ==========
  
  /**
   * Add teacher remark for a student
   * @param {string} performanceId - Performance record ID
   * @param {Object} data - { remark, subject, category }
   * @returns {Promise} Updated performance data
   */
  addTeacherRemark: async (performanceId, data) => {
    try {
      const response = await api.post(`student-performance/${performanceId}/teacher-remark`, data);
      return response.data;
    } catch (error) {
      console.error('Add teacher remark error:', error);
      throw error.response?.data || { success: false, error: 'Failed to add teacher remark' };
    }
  },

  // ========== PERFORMANCE SCORES ==========
  
  /**
   * Update performance scores (0-10 scale)
   * @param {string} performanceId - Performance record ID
   * @param {Object} data - { overallScore, academicScore, behaviorScore, attendanceScore }
   * @returns {Promise} Updated performance data
   */
  updatePerformanceScores: async (performanceId, data) => {
    try {
      const response = await api.put(`student-performance/${performanceId}/performance-scores`, data);
      return response.data;
    } catch (error) {
      console.error('Update performance scores error:', error);
      throw error.response?.data || { success: false, error: 'Failed to update performance scores' };
    }
  },

  // ========== STATISTICS & ANALYTICS ==========
  
  /**
   * Get performance statistics for a student
   * @param {string} studentId - Student ID
   * @returns {Promise} Performance statistics
   */
  getPerformanceStatistics: async (studentId) => {
    try {
      const response = await api.get(`student-performance/${studentId}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Get performance statistics error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch performance statistics' };
    }
  },

  // ========== ATTENDANCE STATUS ENUM ==========
  
  getAttendanceStatuses: () => {
    return [
      { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800' },
      { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800' },
      { value: 'late', label: 'Late', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'half-day', label: 'Half Day', color: 'bg-blue-100 text-blue-800' }
    ];
  },

  // ========== TEACHER REMARK CATEGORIES ==========
  
  getTeacherRemarkCategories: () => {
    return [
      { value: 'academic', label: 'Academic', color: 'bg-blue-100 text-blue-800' },
      { value: 'behavior', label: 'Behavior', color: 'bg-purple-100 text-purple-800' },
      { value: 'improvement', label: 'Improvement', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'achievement', label: 'Achievement', color: 'bg-green-100 text-green-800' }
    ];
  },

  // ========== SUBJECT MANAGEMENT ==========
  
  /**
   * Create default subject structure for exam results
   * @param {Object} subjectData - { subjectName, totalMarks, obtainedMarks, subjectCode }
   * @returns {Object} Formatted subject object
   */
  createSubjectData: (subjectData) => {
    const percentage = subjectData.totalMarks > 0 
      ? (subjectData.obtainedMarks / subjectData.totalMarks) * 100 
      : 0;
    
    let grade = '';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else grade = 'F';

    return {
      ...subjectData,
      percentage,
      grade
    };
  },

  /**
   * Prepare exam data with multiple subjects
   * @param {Object} examData - { examType, examMonth, examYear, subjects[], remarks, conductedDate }
   * @returns {Object} Formatted exam data
   */
  prepareExamData: (examData) => {
    const processedSubjects = examData.subjects.map(subject => 
      studentPerformanceApi.createSubjectData(subject)
    );

    // Calculate overall percentage
    const totalMarks = processedSubjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
    const totalObtained = processedSubjects.reduce((sum, subject) => sum + subject.obtainedMarks, 0);
    const overallPercentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
    
    let overallGrade = '';
    if (overallPercentage >= 90) overallGrade = 'A+';
    else if (overallPercentage >= 80) overallGrade = 'A';
    else if (overallPercentage >= 70) overallGrade = 'B';
    else if (overallPercentage >= 60) overallGrade = 'C';
    else if (overallPercentage >= 50) overallGrade = 'D';
    else overallGrade = 'F';

    return {
      ...examData,
      subjects: processedSubjects,
      overallPercentage,
      overallGrade,
      conductedDate: examData.conductedDate || new Date().toISOString().split('T')[0]
    };
  },

  /**
   * Create default subject object
   * @returns {Object} Default subject object
   */
  createDefaultSubject: () => ({
    subjectName: '',
    totalMarks: 100,
    obtainedMarks: 0,
    subjectCode: '',
    percentage: 0,
    grade: 'F'
  }),

  // ========== MONTH & DATE UTILITIES ==========
  
  /**
   * Get available months for selection
   * @returns {Array} Array of month objects { value, label }
   */
  getMonths: () => {
    return [
      { value: 'January', label: 'January' },
      { value: 'February', label: 'February' },
      { value: 'March', label: 'March' },
      { value: 'April', label: 'April' },
      { value: 'May', label: 'May' },
      { value: 'June', label: 'June' },
      { value: 'July', label: 'July' },
      { value: 'August', label: 'August' },
      { value: 'September', label: 'September' },
      { value: 'October', label: 'October' },
      { value: 'November', label: 'November' },
      { value: 'December', label: 'December' }
    ];
  },

  /**
   * Get exam types for selection
   * @returns {Array} Array of exam type objects { value, label }
   */
  getExamTypes: () => {
    return [
      { value: 'mid-semester', label: 'Mid Semester' },
      { value: 'end-semester', label: 'End Semester' },
      { value: 'unit-test', label: 'Unit Test' },
      { value: 'assignment', label: 'Assignment' },
      { value: 'practical', label: 'Practical' },
      { value: 'project', label: 'Project' }
    ];
  },

  /**
   * Get years for selection (current and next 2 years)
   * @returns {Array} Array of years
   */
  getYears: () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear + i);
  },

  /**
   * Get current academic year
   * @returns {string} Current academic year
   */
  getCurrentAcademicYear: () => {
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth();
    // If current month is after June (6), academic year is current-next
    if (month >= 6) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  },

  // ========== HELPER FUNCTIONS ==========
  
  /**
   * Format date for API (YYYY-MM-DD)
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  /**
   * Format date for display (DD/MM/YYYY)
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDisplayDate: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  /**
   * Format month-year string
   * @param {string} month - Month name
   * @param {number} year - Year
   * @returns {string} Formatted month-year string
   */
  formatMonthYear: (month, year) => {
    return `${month} ${year}`;
  },

  /**
   * Calculate percentage from marks
   * @param {number} obtained - Obtained marks
   * @param {number} total - Total marks
   * @returns {number} Percentage
   */
  calculatePercentage: (obtained, total) => {
    return total > 0 ? (obtained / total) * 100 : 0;
  },

  /**
   * Get grade from percentage
   * @param {number} percentage - Percentage score
   * @returns {string} Grade
   */
  getGrade: (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  },

  /**
   * Get color class for grade
   * @param {string} grade - Grade
   * @returns {string} Tailwind CSS class
   */
  getGradeColor: (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Get color for attendance percentage
   * @param {number} percentage - Attendance percentage
   * @returns {string} Tailwind CSS class
   */
  getAttendanceColor: (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  },

  /**
   * Create FormData for file upload
   * @param {File} file - File to upload
   * @param {Object} metadata - Additional data { month, year, forMonth, description, studentEmail }
   * @returns {FormData} FormData object
   */
  createFileFormData: (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('attendanceFile', file);
    
    // Add metadata
    Object.keys(metadata).forEach(key => {
      if (metadata[key] !== undefined && metadata[key] !== null) {
        formData.append(key, metadata[key]);
      }
    });
    
    return formData;
  },

  /**
   * Download file from blob response
   * @param {Blob} blob - File blob
   * @param {string} fileName - Desired file name
   */
  downloadFileFromBlob: (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Validate student email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Calculate attendance statistics
   * @param {Array} attendanceRecords - Array of attendance records
   * @param {string} month - Month name
   * @param {number} year - Year
   * @returns {Object} Attendance statistics
   */
  calculateAttendanceStats: (attendanceRecords, month, year) => {
    const monthlyRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.toLocaleString('default', { month: 'long' });
      const recordYear = recordDate.getFullYear();
      return recordMonth === month && recordYear === year;
    });

    const totalDays = monthlyRecords.length;
    const presentDays = monthlyRecords.filter(a => a.status === 'present').length;
    const absentDays = monthlyRecords.filter(a => a.status === 'absent').length;
    const lateDays = monthlyRecords.filter(a => a.status === 'late').length;
    const halfDays = monthlyRecords.filter(a => a.status === 'half-day').length;
    
    const presentCount = presentDays + (lateDays * 0.75) + (halfDays * 0.5);
    const percentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;

    return {
      month,
      year,
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      halfDays,
      attendancePercentage: percentage
    };
  },

  /**
   * Format percentage for display
   * @param {number} percentage - Percentage value
   * @returns {string} Formatted percentage
   */
  formatPercentage: (percentage) => {
    return percentage ? percentage.toFixed(1) + '%' : '0%';
  },

  /**
   * Format score for display
   * @param {number} score - Score value
   * @returns {string} Formatted score
   */
  formatScore: (score) => {
    return score ? score.toFixed(1) : '0.0';
  }
};

export default studentPerformanceApi;