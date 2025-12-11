// src/hooks/useStudentPerformance.js
import { useState, useEffect, useCallback } from 'react';
import studentPerformanceApi from '../utils/studentPerformanceAPI';

export const useStudentPerformance = (identifier, identifierType = 'email') => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [teacherRemarks, setTeacherRemarks] = useState([]);
  const [classPerformance, setClassPerformance] = useState([]);
  const [attendanceFiles, setAttendanceFiles] = useState([]);

  const fetchPerformance = useCallback(async () => {
    if (!identifier) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (identifierType === 'email') {
        result = await studentPerformanceApi.getStudentPerformanceByEmail(identifier);
      } else {
        result = await studentPerformanceApi.getStudentPerformance(identifier);
      }
      
      if (result.success) {
        setPerformanceData(result.data);
        setMonthlyAttendance(result.data.monthlyAttendance || []);
        setExamResults(result.data.examResults || []);
        setTeacherRemarks(result.data.teacherRemarks || []);
        setClassPerformance(result.data.classPerformance || []);
        setAttendanceFiles(result.data.attendanceFiles || []);
      } else {
        setError(result.error || 'Failed to fetch performance data');
      }
    } catch (err) {
      console.error('Fetch performance error:', err);
      setError(err.error || 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  }, [identifier, identifierType]);

  useEffect(() => {
    if (identifier) {
      fetchPerformance();
    } else {
      setPerformanceData(null);
      setMonthlyAttendance([]);
      setExamResults([]);
      setTeacherRemarks([]);
      setClassPerformance([]);
      setAttendanceFiles([]);
      setLoading(false);
      setError(null);
    }
  }, [identifier, fetchPerformance]);

  // Refresh function
  const refresh = () => {
    fetchPerformance();
  };

  // ========== ATTENDANCE OPERATIONS ==========
  
  const markAttendance = async (attendanceData) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.markAttendance(
        performanceData._id,
        attendanceData
      );
      
      if (result.success) {
        await refresh();
      }
      
      return result;
    } catch (error) {
      console.error('Mark attendance error:', error);
      throw error;
    }
  };

  const updateMonthlyAttendance = async (attendanceData) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.updateMonthlyAttendance(
        performanceData._id,
        attendanceData
      );
      
      if (result.success) {
        // Update monthly attendance state
        const updatedMonthlyAttendance = [...monthlyAttendance];
        const existingIndex = updatedMonthlyAttendance.findIndex(
          ma => ma.month === attendanceData.month && ma.year === attendanceData.year
        );
        
        if (existingIndex === -1) {
          updatedMonthlyAttendance.push(result.data);
        } else {
          updatedMonthlyAttendance[existingIndex] = result.data;
        }
        
        setMonthlyAttendance(updatedMonthlyAttendance);
        await refresh();
      }
      
      return result;
    } catch (error) {
      console.error('Update monthly attendance error:', error);
      throw error;
    }
  };

  const getMonthlyAttendanceData = async (params = {}) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.getMonthlyAttendance(
        performanceData._id,
        params
      );
      return result;
    } catch (error) {
      console.error('Get monthly attendance error:', error);
      throw error;
    }
  };

  const uploadAttendanceFile = async (file, metadata) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const formData = studentPerformanceApi.createFileFormData(file, metadata);
      
      const result = await studentPerformanceApi.uploadAttendanceFile(
        performanceData._id,
        formData
      );
      
      if (result.success) {
        await refresh();
      }
      
      return result;
    } catch (error) {
      console.error('Upload attendance file error:', error);
      throw error;
    }
  };

  // ========== EXAM RESULT OPERATIONS ==========
  
  const addExamResult = async (examData) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const preparedData = studentPerformanceApi.prepareExamData(examData);
      
      const result = await studentPerformanceApi.addExamResult(
        performanceData._id,
        preparedData
      );
      
      if (result.success) {
        setExamResults(prev => [...prev, preparedData]);
        await refresh();
      }
      
      return result;
    } catch (error) {
      console.error('Add exam result error:', error);
      throw error;
    }
  };

  const getFilteredExamResults = async (filters = {}) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.getExamResultsByFilter(
        performanceData._id,
        filters
      );
      return result;
    } catch (error) {
      console.error('Get filtered exam results error:', error);
      throw error;
    }
  };

  // ========== CLASS PERFORMANCE OPERATIONS ==========
  
  const addClassPerformance = async (classPerformanceData) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.addClassPerformance(
        performanceData._id,
        classPerformanceData
      );
      
      if (result.success) {
        await refresh();
      }
      
      return result;
    } catch (error) {
      console.error('Add class performance error:', error);
      throw error;
    }
  };

  // ========== TEACHER REMARK OPERATIONS ==========
  
  const addTeacherRemark = async (remarkData) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.addTeacherRemark(
        performanceData._id,
        remarkData
      );
      
      if (result.success) {
        await refresh();
      }
      
      return result;
    } catch (error) {
      console.error('Add teacher remark error:', error);
      throw error;
    }
  };

  // ========== PERFORMANCE SCORE OPERATIONS ==========
  
  const updatePerformanceScores = async (scoresData) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.updatePerformanceScores(
        performanceData._id,
        scoresData
      );
      
      if (result.success) {
        await refresh();
      }
      
      return result;
    } catch (error) {
      console.error('Update performance scores error:', error);
      throw error;
    }
  };

  // ========== FILE OPERATIONS ==========
  
  const downloadAttendanceFile = async (fileId, fileName) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const blob = await studentPerformanceApi.downloadAttendanceFile(
        performanceData._id,
        fileId
      );
      
      studentPerformanceApi.downloadFileFromBlob(blob, fileName);
      return { success: true };
    } catch (error) {
      console.error('Download attendance file error:', error);
      throw error;
    }
  };

  const deleteAttendanceFile = async (fileId) => {
    if (!performanceData?._id) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.deleteAttendanceFile(
        performanceData._id,
        fileId
      );
      
      if (result.success) {
        await refresh();
      }
      
      return result;
    } catch (error) {
      console.error('Delete attendance file error:', error);
      throw error;
    }
  };

  // ========== STATISTICS OPERATIONS ==========
  
  const getStatistics = async () => {
    if (!performanceData?.studentId) {
      throw new Error('No performance data available');
    }
    
    try {
      const result = await studentPerformanceApi.getPerformanceStatistics(
        performanceData.studentId
      );
      return result;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  };

  // ========== HELPER FUNCTIONS ==========
  
  const getStudentInfo = () => {
    if (!performanceData) return null;
    
    return {
      id: performanceData.studentId,
      email: performanceData.studentEmail,
      name: performanceData.studentName,
      rollNumber: performanceData.rollNumber,
      class: performanceData.class,
      section: performanceData.section,
      academicYear: performanceData.academicYear
    };
  };

  const getAttendanceSummary = () => {
    if (!performanceData) return null;
    
    return {
      totalPresent: performanceData.totalPresent || 0,
      totalAbsent: performanceData.totalAbsent || 0,
      attendancePercentage: performanceData.attendancePercentage || 0,
      monthlyAttendance: monthlyAttendance,
      totalAttendanceDays: performanceData.attendance?.length || 0
    };
  };

  const getExamSummary = () => {
    if (!performanceData) return null;
    
    return {
      averageScore: performanceData.averageScore || 0,
      totalExams: examResults.length,
      examResults: examResults,
      subjects: examResults.flatMap(exam => exam.subjects || [])
    };
  };

  const getPerformanceSummary = () => {
    if (!performanceData) return null;
    
    return {
      teacherRemarks: teacherRemarks.length,
      classPerformance: classPerformance.length,
      attendanceFiles: attendanceFiles.length,
      performanceScores: performanceData.performanceScores || {}
    };
  };

  return {
    // State
    performanceData,
    loading,
    error,
    monthlyAttendance,
    examResults,
    teacherRemarks,
    classPerformance,
    attendanceFiles,
    
    // Student Info
    studentInfo: getStudentInfo(),
    attendanceSummary: getAttendanceSummary(),
    examSummary: getExamSummary(),
    performanceSummary: getPerformanceSummary(),
    
    // Refresh
    refresh,
    
    // Operations
    markAttendance,
    updateMonthlyAttendance,
    getMonthlyAttendanceData,
    uploadAttendanceFile,
    downloadAttendanceFile,
    deleteAttendanceFile,
    
    addExamResult,
    getFilteredExamResults,
    
    addClassPerformance,
    addTeacherRemark,
    updatePerformanceScores,
    getStatistics,
    
    // Helper Functions
    // Attendance
    getAttendanceStatuses: studentPerformanceApi.getAttendanceStatuses,
    getAttendanceColor: studentPerformanceApi.getAttendanceColor,
    formatPercentage: studentPerformanceApi.formatPercentage,
    
    // Exam
    getExamTypes: studentPerformanceApi.getExamTypes,
    getGrade: studentPerformanceApi.getGrade,
    getGradeColor: studentPerformanceApi.getGradeColor,
    calculatePercentage: studentPerformanceApi.calculatePercentage,
    createDefaultSubject: studentPerformanceApi.createDefaultSubject,
    
    // Teacher Remarks
    getTeacherRemarkCategories: studentPerformanceApi.getTeacherRemarkCategories,
    
    // Dates & Months
    getMonths: studentPerformanceApi.getMonths,
    getYears: studentPerformanceApi.getYears,
    getCurrentAcademicYear: studentPerformanceApi.getCurrentAcademicYear,
    formatDate: studentPerformanceApi.formatDate,
    formatDisplayDate: studentPerformanceApi.formatDisplayDate,
    formatMonthYear: studentPerformanceApi.formatMonthYear,
    
    // General
    validateEmail: studentPerformanceApi.validateEmail,
    formatScore: studentPerformanceApi.formatScore,
    
    // API instance (for advanced use)
    api: studentPerformanceApi
  };
};

export default useStudentPerformance;