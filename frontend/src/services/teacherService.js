import axiosInstance from './axiosInstance';

const API_BASE_URL = 'http://localhost:8080/api/teachers';

const teacherService = {
  /**
   * Get teacher by ID
   */
  getTeacherById: (teacherId) => {
    return axiosInstance.get(`/teachers/${teacherId}`);
  },

  /**
   * Get teacher's subjects
   */
  getTeacherSubjects: (teacherId) => {
    return axiosInstance.get(`/teachers/${teacherId}/subjects`);
  },

  /**
   * Get teacher's classes
   */
  getTeacherClasses: (teacherId) => {
    return axiosInstance.get(`/teachers/${teacherId}/classes`);
  },

  /**
   * Get teacher's attendance records
   */
  getTeacherAttendance: (teacherId) => {
    return axiosInstance.get(`/teachers/${teacherId}/attendance`);
  },

  /**
   * Get teacher's reports
   */
  getTeacherReports: (teacherId) => {
    return axiosInstance.get(`/teachers/${teacherId}/reports`);
  },

  /**
   * Get all active teachers
   */
  getActiveTeachers: () => {
    return axiosInstance.get('/teachers?activeOnly=true');
  },

  // ==================== DATA ACCESS CONTROL - FILTERED ENDPOINTS ====================

  /**
   * Get only classes assigned to the current teacher
   * Restricted to teacher's assigned classes only (data access control)
   */
  getMyAssignedClasses: (teacherId) => {
    return axiosInstance.get(`/teachers/${teacherId}/my-classes`);
  },

  /**
   * Get attendance records for only the current teacher's assigned classes
   * Restricted to teacher's assigned classes only (data access control)
   */
  getMyClassesAttendance: (teacherId) => {
    return axiosInstance.get(`/teachers/${teacherId}/my-attendance`);
  },

  /**
   * Get grades for only the current teacher's assigned classes
   * Restricted to teacher's assigned classes only (data access control)
   */
  getMyClassesGrades: (teacherId) => {
    return axiosInstance.get(`/teachers/${teacherId}/my-grades`);
  },
};

export default teacherService;
