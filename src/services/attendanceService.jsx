// src/services/attendanceService.js
import api from '../utils/api'; // Correct path to api.js

const attendanceService = {
  // Get student attendance
  getStudentAttendance: async (studentId, params = {}) => {
    const response = await api.get(`/attendance/student/${studentId}`, { params });
    return response.data;
  },

  // Get teacher attendance
  getTeacherAttendance: async (teacherId, params = {}) => {
    const response = await api.get(`/attendance/teacher/${teacherId}`, { params });
    return response.data;
  },

  // Get parent's children attendance
  getParentChildrenAttendance: async (params = {}) => {
    const response = await api.get('/attendance/parent/children', { params });
    return response.data;
  },

  // Get class attendance
  getClassAttendance: async (className, section, params = {}) => {
    const response = await api.get(`/attendance/class/${className}/${section}`, { params });
    return response.data;
  },

  // Mark student attendance
  markStudentAttendance: async (data) => {
    const response = await api.post('/attendance/student/mark', data);
    return response.data;
  },

  // Bulk mark student attendance
  bulkMarkStudentAttendance: async (data) => {
    const response = await api.post('/attendance/student/bulk-mark', data);
    return response.data;
  },

  // Mark teacher attendance
  markTeacherAttendance: async (data) => {
    const response = await api.post('/attendance/teacher/mark', data);
    return response.data;
  },

  // Get attendance statistics
  getAttendanceStatistics: async (params = {}) => {
    const response = await api.get('/attendance/statistics', { params });
    return response.data;
  }
};

export default attendanceService;