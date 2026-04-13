import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance for student API calls
const studentAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
studentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const studentService = {
  /**
   * Get student enrollment summary
   */
  getEnrollmentSummary: async (studentId) => {
    try {
      const response = await studentAPI.get(`/enrollments/student/${studentId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollment summary:', error);
      return null;
    }
  },

  /**
   * Get student's grades/results
   */
  getGrades: async (studentId) => {
    try {
      const response = await studentAPI.get(`/results/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      return null;
    }
  },

  /**
   * Get student's attendance statistics
   */
  getAttendanceStats: async (studentId) => {
    try {
      const response = await studentAPI.get(`/attendance/student/${studentId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return null;
    }
  },

  /**
   * Get comprehensive dashboard data for student
   */
  getDashboardData: async (studentId) => {
    try {
      const [enrollmentSummary, grades, attendanceStats] = await Promise.all([
        studentService.getEnrollmentSummary(studentId),
        studentService.getGrades(studentId),
        studentService.getAttendanceStats(studentId),
      ]);

      // Calculate metrics
      let coursesCount = 0;
      let gpa = 0;
      let attendancePercentage = 0;
      let pendingAssignments = 0;

      if (enrollmentSummary) {
        coursesCount = enrollmentSummary.subjectCount || 0;
      }

      if (grades && grades.results && grades.results.length > 0) {
        const totalMarks = grades.results.reduce((sum, r) => sum + (parseFloat(r.marksObtained) || 0), 0);
        gpa = (totalMarks / grades.results.length).toFixed(2);
      }

      if (attendanceStats) {
        attendancePercentage = Math.round(attendanceStats.attendancePercentage || attendanceStats.percentage || 0);
      }

      return {
        coursesCount,
        gpa: parseFloat(gpa) || 0,
        attendancePercentage,
        pendingAssignments,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};

export default studentService;
