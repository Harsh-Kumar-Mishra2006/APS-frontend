// src/hooks/useTeacherPerformance.js
import { useState, useEffect, useCallback } from 'react';
import teacherPerformanceApi from '../utils/teacherPerformanceAPI';

export const useTeacherPerformance = (email) => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [teacherRemarks, setTeacherRemarks] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const fetchTeacherPerformance = useCallback(async () => {
    if (!email || !teacherPerformanceApi.validateEmail(email)) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch teacher performance data
      const result = await teacherPerformanceApi.getTeacherPerformance(email);
      
      if (result.success) {
        setTeacherData(result.data);
        
        // Fetch related data
        try {
          // Fetch attendance data
          const attendanceRes = await teacherPerformanceApi.getMonthlyAttendance(email);
          if (attendanceRes.success) {
            setMonthlyAttendance(attendanceRes.data);
          }
          
          // Fetch performance reviews
          const reviewsRes = await teacherPerformanceApi.getPerformanceReviews(email);
          if (reviewsRes.success) {
            setPerformanceReviews(reviewsRes.data);
          }
          
          // Fetch subject assignments
          const subjectsRes = await teacherPerformanceApi.getSubjectAssignments(email);
          if (subjectsRes.success) {
            setSubjectAssignments(subjectsRes.data);
          }
          
          // Fetch remarks
          const remarksRes = await teacherPerformanceApi.getTeacherRemarks(email);
          if (remarksRes.success) {
            setTeacherRemarks(remarksRes.data);
          }
          
          // Fetch statistics
          const statsRes = await teacherPerformanceApi.getTeacherStatistics(email);
          if (statsRes.success) {
            setStatistics(statsRes.data);
          }
        } catch (subError) {
          console.error('Error fetching sub-data:', subError);
          // Continue even if some sub-data fails
        }
      } else {
        setError(result.error || 'Failed to fetch teacher data');
      }
    } catch (err) {
      console.error('Fetch teacher performance error:', err);
      setError(err.error || 'Failed to fetch teacher performance data');
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (email) {
      fetchTeacherPerformance();
    }
  }, [email, fetchTeacherPerformance]);

  // Refresh function
  const refresh = () => {
    fetchTeacherPerformance();
  };

  // Clear data when email changes
  useEffect(() => {
    if (!email) {
      setTeacherData(null);
      setMonthlyAttendance([]);
      setPerformanceReviews([]);
      setSubjectAssignments([]);
      setTeacherRemarks([]);
      setStatistics(null);
      setLoading(false);
      setError(null);
    }
  }, [email]);

  // ========== TEACHER INFORMATION OPERATIONS ==========
  
  const updateTeacherInfo = async (infoData) => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const result = await teacherPerformanceApi.updateTeacherInfo(email, infoData);
      
      if (result.success) {
        setTeacherData(prev => ({ ...prev, ...result.data }));
      }
      
      return result;
    } catch (error) {
      console.error('Update teacher info error:', error);
      throw error;
    }
  };

  // ========== ATTENDANCE OPERATIONS ==========
  
  const updateAttendance = async (attendanceData) => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const preparedData = teacherPerformanceApi.prepareAttendanceData(attendanceData);
      const result = await teacherPerformanceApi.updateMonthlyAttendance(email, preparedData);
      
      if (result.success) {
        // Update monthly attendance state
        const updatedAttendance = [...monthlyAttendance];
        const existingIndex = updatedAttendance.findIndex(
          a => a.month === attendanceData.month && a.year === attendanceData.year
        );
        
        if (existingIndex === -1) {
          updatedAttendance.push(result.data);
        } else {
          updatedAttendance[existingIndex] = result.data;
        }
        
        setMonthlyAttendance(updatedAttendance);
        refresh(); // Refresh statistics
      }
      
      return result;
    } catch (error) {
      console.error('Update attendance error:', error);
      throw error;
    }
  };

  const getAttendanceByMonth = async (month, year) => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const result = await teacherPerformanceApi.getMonthlyAttendance(email, { month, year });
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      console.error('Get attendance by month error:', error);
      throw error;
    }
  };

  // ========== PERFORMANCE REVIEW OPERATIONS ==========
  
  const addPerformanceReview = async (reviewData) => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const preparedData = teacherPerformanceApi.preparePerformanceReview(reviewData);
      const result = await teacherPerformanceApi.addPerformanceReview(email, preparedData);
      
      if (result.success) {
        setPerformanceReviews(prev => [...prev, result.data]);
        refresh(); // Refresh statistics
      }
      
      return result;
    } catch (error) {
      console.error('Add performance review error:', error);
      throw error;
    }
  };

  const getReviewsByFilter = async (filters = {}) => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const result = await teacherPerformanceApi.getPerformanceReviews(email, filters);
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      console.error('Get reviews by filter error:', error);
      throw error;
    }
  };

  // ========== REMARK OPERATIONS ==========
  
  const addRemark = async (remarkData) => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const result = await teacherPerformanceApi.addTeacherRemark(email, {
        ...remarkData,
        date: new Date().toISOString()
      });
      
      if (result.success) {
        setTeacherRemarks(prev => [...prev, result.data]);
      }
      
      return result;
    } catch (error) {
      console.error('Add remark error:', error);
      throw error;
    }
  };

  // ========== SUBJECT ASSIGNMENT OPERATIONS ==========
  
  const assignSubject = async (assignmentData) => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const result = await teacherPerformanceApi.assignSubject(email, {
        ...assignmentData,
        assignedDate: new Date().toISOString()
      });
      
      if (result.success) {
        setSubjectAssignments(prev => [...prev, result.data]);
      }
      
      return result;
    } catch (error) {
      console.error('Assign subject error:', error);
      throw error;
    }
  };

  // ========== STATISTICS OPERATIONS ==========
  
  const getStatistics = async () => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const result = await teacherPerformanceApi.getTeacherStatistics(email);
      
      if (result.success) {
        setStatistics(result.data);
      }
      
      return result;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  };

  const getDashboardData = async () => {
    if (!email) {
      throw new Error('No email provided');
    }
    
    try {
      const result = await teacherPerformanceApi.getTeacherDashboard(email);
      return result;
    } catch (error) {
      console.error('Get dashboard data error:', error);
      throw error;
    }
  };

  // ========== HELPER FUNCTIONS ==========
  
  const getTeacherInfo = () => {
    if (!teacherData) return null;
    
    return {
      name: teacherData.teacherName || teacherData.name,
      email: teacherData.teacherEmail || teacherData.email,
      phone: teacherData.phoneNumber || teacherData.phone,
      subjects: teacherData.subjects || [],
      designation: teacherData.designation,
      qualification: teacherData.qualification,
      experience: teacherData.experience,
      joiningDate: teacherData.joiningDate,
      isActive: teacherData.isActive !== false
    };
  };

  const getAttendanceSummary = () => {
    if (!teacherData) return null;
    
    return {
      overallPercentage: teacherData.overallAttendancePercentage || 0,
      totalWorkingDays: teacherData.totalWorkingDays || 0,
      presentDays: teacherData.totalPresentDays || 0,
      leaveDays: teacherData.totalLeaveDays || 0,
      halfDays: teacherData.totalHalfDays || 0
    };
  };

  const getPerformanceSummary = () => {
    if (performanceReviews.length === 0) return null;
    
    const latestReview = performanceReviews[performanceReviews.length - 1];
    const overallScore = latestReview.overallScore || 0;
    
    return {
      overallScore,
      grade: teacherPerformanceApi.getScoreGrade(overallScore),
      lastReviewDate: latestReview.createdAt || latestReview.date,
      reviewCount: performanceReviews.length
    };
  };

  // ========== COMPUTED PROPERTIES ==========
  
  const teacherInfo = getTeacherInfo();
  const attendanceSummary = getAttendanceSummary();
  const performanceSummary = getPerformanceSummary();

  return {
    // State
    teacherData,
    loading,
    error,
    monthlyAttendance,
    performanceReviews,
    subjectAssignments,
    teacherRemarks,
    statistics,
    
    // Computed properties
    teacherInfo,
    attendanceSummary,
    performanceSummary,
    
    // Operations
    refresh,
    updateTeacherInfo,
    updateAttendance,
    getAttendanceByMonth,
    addPerformanceReview,
    getReviewsByFilter,
    addRemark,
    assignSubject,
    getStatistics,
    getDashboardData,
    
    // Helper functions from API
    getMonths: teacherPerformanceApi.getMonths,
    getReviewCategories: teacherPerformanceApi.getReviewCategories,
    getRemarkCategories: teacherPerformanceApi.getRemarkCategories,
    getScoreCategories: teacherPerformanceApi.getScoreCategories,
    calculateAttendancePercentage: teacherPerformanceApi.calculateAttendancePercentage,
    calculateOverallScore: teacherPerformanceApi.calculateOverallScore, // Add this
    getScoreGrade: teacherPerformanceApi.getScoreGrade, // Add this
    getScoreColor: teacherPerformanceApi.getScoreColor, // 
    getScoreGrade: teacherPerformanceApi.getScoreGrade,
    getScoreColor: teacherPerformanceApi.getScoreColor,
    getAttendanceColor: teacherPerformanceApi.getAttendanceColor,
    getRemarkColor: teacherPerformanceApi.getRemarkColor,
    formatDate: teacherPerformanceApi.formatDate,
    formatScore: teacherPerformanceApi.formatScore,
    formatPercentage: teacherPerformanceApi.formatPercentage,
    formatMonthYear: teacherPerformanceApi.formatMonthYear
  };
};