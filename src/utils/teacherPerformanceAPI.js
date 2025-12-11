// src/utils/teacherPerformanceApi.js
import api from './api';

const teacherPerformanceApi = {
  // ========== TEACHER PERFORMANCE RECORDS ==========
  
  /**
   * Create teacher performance record
   * @param {Object} data - Teacher data
   * @returns {Promise} API response
   */
  createTeacherPerformance: async (data) => {
    try {
      const response = await api.post('/api/teacher-performance', data);
      return response.data;
    } catch (error) {
      console.error('Create teacher performance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to create teacher performance record' };
    }
  },

  /**
   * Get teacher performance by email
   * @param {string} email - Teacher email
   * @returns {Promise} Teacher performance data
   */
  getTeacherPerformance: async (email) => {
    try {
      const response = await api.get(`/api/teacher-performance/${email}`);
      return response.data;
    } catch (error) {
      console.error('Get teacher performance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch teacher performance' };
    }
  },

  /**
   * Get all teachers performance
   * @param {Object} params - Search and filter params
   * @returns {Promise} List of teachers performance
   */
  getAllTeachersPerformance: async (params = {}) => {
    try {
      const response = await api.get('/api/teacher-performance', { params });
      return response.data;
    } catch (error) {
      console.error('Get all teachers performance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch teachers performance' };
    }
  },

  /**
   * Create performance record from existing teacher
   * @param {string} teacherId - Teacher ID
   * @returns {Promise} Created performance record
   */
  createPerformanceFromTeacher: async (teacherId) => {
    try {
      const response = await api.post(`/api/teacher-performance/create-from-teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Create performance from teacher error:', error);
      throw error.response?.data || { success: false, error: 'Failed to create performance record' };
    }
  },

  /**
   * Get teachers without performance records
   * @returns {Promise} List of teachers
   */
  getTeachersWithoutPerformance: async () => {
    try {
      const response = await api.get('/api/teacher-performance/teachers/without-performance');
      return response.data;
    } catch (error) {
      console.error('Get teachers without performance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch teachers without performance' };
    }
  },

  // ========== TEACHER INFORMATION ==========
  
  /**
   * Update teacher basic information
   * @param {string} email - Teacher email
   * @param {Object} data - Updated teacher info
   * @returns {Promise} Updated teacher data
   */
  updateTeacherInfo: async (email, data) => {
    try {
      const response = await api.put(`/api/teacher-performance/${email}/info`, data);
      return response.data;
    } catch (error) {
      console.error('Update teacher info error:', error);
      throw error.response?.data || { success: false, error: 'Failed to update teacher information' };
    }
  },

  // ========== ATTENDANCE MANAGEMENT ==========
  
  /**
   * Update monthly attendance for teacher
   * @param {string} email - Teacher email
   * @param {Object} data - Attendance data
   * @returns {Promise} Updated attendance data
   */
  updateMonthlyAttendance: async (email, data) => {
    try {
      const response = await api.put(`/api/teacher-performance/${email}/attendance`, data);
      return response.data;
    } catch (error) {
      console.error('Update monthly attendance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to update monthly attendance' };
    }
  },

  /**
   * Get monthly attendance for teacher
   * @param {string} email - Teacher email
   * @param {Object} params - Month and year params
   * @returns {Promise} Monthly attendance data
   */
  getMonthlyAttendance: async (email, params = {}) => {
    try {
      const response = await api.get(`/api/teacher-performance/${email}/attendance`, { params });
      return response.data;
    } catch (error) {
      console.error('Get monthly attendance error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch monthly attendance' };
    }
  },

  // ========== PERFORMANCE REVIEWS ==========
  
  /**
   * Add performance review for teacher
   * @param {string} email - Teacher email
   * @param {Object} data - Review data
   * @returns {Promise} Added review data
   */
  addPerformanceReview: async (email, data) => {
    try {
      const response = await api.post(`/api/teacher-performance/${email}/review`, data);
      return response.data;
    } catch (error) {
      console.error('Add performance review error:', error);
      throw error.response?.data || { success: false, error: 'Failed to add performance review' };
    }
  },

  /**
   * Get performance reviews for teacher
   * @param {string} email - Teacher email
   * @param {Object} params - Filter params
   * @returns {Promise} Performance reviews
   */
  getPerformanceReviews: async (email, params = {}) => {
    try {
      const response = await api.get(`/api/teacher-performance/${email}/reviews`, { params });
      return response.data;
    } catch (error) {
      console.error('Get performance reviews error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch performance reviews' };
    }
  },

  // ========== REMARKS & COMMENTS ==========
  
  /**
   * Add remark for teacher
   * @param {string} email - Teacher email
   * @param {Object} data - Remark data
   * @returns {Promise} Added remark data
   */
  addTeacherRemark: async (email, data) => {
    try {
      const response = await api.post(`/api/teacher-performance/${email}/remark`, data);
      return response.data;
    } catch (error) {
      console.error('Add teacher remark error:', error);
      throw error.response?.data || { success: false, error: 'Failed to add teacher remark' };
    }
  },

  /**
   * Get teacher remarks
   * @param {string} email - Teacher email
   * @returns {Promise} Teacher remarks
   */
  getTeacherRemarks: async (email) => {
    try {
      const response = await api.get(`/api/teacher-performance/${email}/remarks`);
      return response.data;
    } catch (error) {
      console.error('Get teacher remarks error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch teacher remarks' };
    }
  },

  // ========== SUBJECT ASSIGNMENT ==========
  
  /**
   * Assign subject to teacher
   * @param {string} email - Teacher email
   * @param {Object} data - Assignment data
   * @returns {Promise} Assignment data
   */
  assignSubject: async (email, data) => {
    try {
      const response = await api.post(`/api/teacher-performance/${email}/assign-subject`, data);
      return response.data;
    } catch (error) {
      console.error('Assign subject error:', error);
      throw error.response?.data || { success: false, error: 'Failed to assign subject' };
    }
  },

  /**
   * Get teacher subject assignments
   * @param {string} email - Teacher email
   * @returns {Promise} Subject assignments
   */
  getSubjectAssignments: async (email) => {
    try {
      const response = await api.get(`/api/teacher-performance/${email}/subject-assignments`);
      return response.data;
    } catch (error) {
      console.error('Get subject assignments error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch subject assignments' };
    }
  },

  // ========== STATISTICS ==========
  
  /**
   * Get teacher statistics
   * @param {string} email - Teacher email
   * @returns {Promise} Teacher statistics
   */
  getTeacherStatistics: async (email) => {
    try {
      const response = await api.get(`/api/teacher-performance/${email}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Get teacher statistics error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch teacher statistics' };
    }
  },

  /**
   * Get teacher dashboard data
   * @param {string} email - Teacher email
   * @returns {Promise} Dashboard data
   */
  getTeacherDashboard: async (email) => {
    try {
      const response = await api.get(`/api/teacher-performance/${email}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Get teacher dashboard error:', error);
      throw error.response?.data || { success: false, error: 'Failed to fetch dashboard data' };
    }
  },

  // ========== HELPER FUNCTIONS ==========
  
  /**
   * Get months for selection
   * @returns {Array} Months array
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
   * Get performance review categories
   * @returns {Array} Categories array
   */
  getReviewCategories: () => {
    return [
      { value: 'principal', label: 'Principal Review', color: 'bg-purple-100 text-purple-800' },
      { value: 'colleague', label: 'Colleague Review', color: 'bg-blue-100 text-blue-800' },
      { value: 'student', label: 'Student Review', color: 'bg-green-100 text-green-800' },
      { value: 'self', label: 'Self Assessment', color: 'bg-yellow-100 text-yellow-800' }
    ];
  },

  /**
   * Get remark categories
   * @returns {Array} Remark categories
   */
  getRemarkCategories: () => {
    return [
      { value: 'achievement', label: 'Achievement', color: 'bg-green-100 text-green-800' },
      { value: 'improvement', label: 'Improvement', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'general', label: 'General', color: 'bg-blue-100 text-blue-800' },
      { value: 'disciplinary', label: 'Disciplinary', color: 'bg-red-100 text-red-800' }
    ];
  },

  /**
   * Get score categories for performance review
   * @returns {Array} Score categories
   */
  getScoreCategories: () => {
    return [
      { key: 'punctuality', label: 'Punctuality', description: 'Timeliness and regularity' },
      { key: 'subjectKnowledge', label: 'Subject Knowledge', description: 'Depth of subject understanding' },
      { key: 'teachingMethodology', label: 'Teaching Methodology', description: 'Effectiveness of teaching methods' },
      { key: 'classManagement', label: 'Class Management', description: 'Classroom discipline and organization' },
      { key: 'studentEngagement', label: 'Student Engagement', description: 'Ability to engage students' },
      { key: 'communicationSkills', label: 'Communication Skills', description: 'Clarity and effectiveness of communication' },
      { key: 'assessmentQuality', label: 'Assessment Quality', description: 'Fairness and quality of assessments' },
      { key: 'professionalDevelopment', label: 'Professional Development', description: 'Commitment to professional growth' }
    ];
  },

  /**
   * Calculate attendance percentage
   * @param {number} presentDays - Present days
   * @param {number} workingDays - Working days
   * @param {number} halfDays - Half days
   * @param {number} leaveDays - Leave days
   * @returns {number} Attendance percentage
   */
  calculateAttendancePercentage: (presentDays, workingDays, halfDays = 0, leaveDays = 0) => {
    if (workingDays <= 0) return 0;
    const effectiveDays = presentDays + (halfDays * 0.5);
    const totalAttendanceDays = effectiveDays;
    return (totalAttendanceDays / workingDays) * 100;
  },

  /**
   * Calculate total attendance days
   * @param {Object} attendanceData - Attendance data object
   * @returns {number} Total attendance days
   */
  calculateTotalAttendanceDays: (attendanceData) => {
    const { presentDays = 0, halfDays = 0 } = attendanceData;
    return presentDays + (halfDays * 0.5);
  },

  /**
   * Get grade for score
   * @param {number} score - Score (0-10)
   * @returns {string} Grade
   */
  getScoreGrade: (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Satisfactory';
    if (score >= 5) return 'Needs Improvement';
    return 'Poor';
  },

  /**
   * Calculate overall score from review scores
   * @param {Object} scores - Review scores object
   * @returns {number} Overall score (0-10)
   */
  calculateOverallScore: (scores) => {
    const scoreValues = Object.values(scores);
    if (scoreValues.length === 0) return 0;
    const sum = scoreValues.reduce((acc, score) => acc + (parseFloat(score) || 0), 0);
    return sum / scoreValues.length;
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Get current academic year
   * @returns {string} Academic year
   */
  getCurrentAcademicYear: () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}-${nextYear}`;
  },

  /**
   * Get years for selection (current year and 2 previous)
   * @returns {Array} Years array
   */
  getYears: () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  },

  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate: (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Format month-year string
   * @param {string} month - Month name
   * @param {number} year - Year
   * @returns {string} Formatted string
   */
  formatMonthYear: (month, year) => {
    return `${month} ${year}`;
  },

  /**
   * Prepare performance review data
   * @param {Object} reviewData - Raw review data
   * @returns {Object} Prepared review data
   */
  preparePerformanceReview: (reviewData) => {
    const overallScore = this.calculateOverallScore(reviewData.scores || {});
    return {
      ...reviewData,
      overallScore,
      grade: this.getScoreGrade(overallScore),
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Prepare attendance data
   * @param {Object} attendanceData - Raw attendance data
   * @returns {Object} Prepared attendance data
   */
  prepareAttendanceData: (attendanceData) => {
    const attendancePercentage = this.calculateAttendancePercentage(
      attendanceData.presentDays,
      attendanceData.workingDays,
      attendanceData.halfDays,
      attendanceData.leaveDays
    );
    
    return {
      ...attendanceData,
      attendancePercentage,
      totalAttendanceDays: this.calculateTotalAttendanceDays(attendanceData),
      month: attendanceData.month,
      year: attendanceData.year
    };
  },

  /**
   * Create default review scores object
   * @returns {Object} Default scores object
   */
  createDefaultScores: () => {
    return {
      punctuality: 8,
      subjectKnowledge: 9,
      teachingMethodology: 8,
      classManagement: 7,
      studentEngagement: 8,
      communicationSkills: 8,
      assessmentQuality: 7,
      professionalDevelopment: 8
    };
  },

  /**
   * Get color for score
   * @param {number} score - Score value
   * @returns {string} Tailwind color class
   */
  getScoreColor: (score) => {
    if (score >= 9) return 'bg-green-100 text-green-800';
    if (score >= 8) return 'bg-blue-100 text-blue-800';
    if (score >= 7) return 'bg-yellow-100 text-yellow-800';
    if (score >= 6) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  },

  /**
   * Get color for attendance percentage
   * @param {number} percentage - Attendance percentage
   * @returns {string} Tailwind color class
   */
  getAttendanceColor: (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  },

  /**
   * Get color for remark category
   * @param {string} category - Remark category
   * @returns {string} Tailwind color class
   */
  getRemarkColor: (category) => {
    switch (category) {
      case 'achievement':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'improvement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disciplinary':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  },

  /**
   * Format score for display
   * @param {number} score - Score value
   * @returns {string} Formatted score
   */
  formatScore: (score) => {
    return score ? score.toFixed(1) : '0.0';
  },

  /**
   * Format percentage for display
   * @param {number} percentage - Percentage value
   * @returns {string} Formatted percentage
   */
  formatPercentage: (percentage) => {
    return percentage ? percentage.toFixed(1) + '%' : '0%';
  }
};

export default teacherPerformanceApi;