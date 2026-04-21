import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance for parent API calls
const parentAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
parentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
parentAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

const parentService = {
  /**
   * Get all children associated with the parent
   */
  getMyChildren: async () => {
    try {
      const response = await parentAPI.get('/parents/my-children');
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      return null;
    }
  },

  /**
   * Get a specific child's details
   */
  getChildDetails: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching child details:', error);
      return null;
    }
  },

  /**
   * Get child's overall performance summary
   */
  getChildPerformanceSummary: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/performance-summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      return null;
    }
  },

  /**
   * Get child's grades
   */
  getChildGrades: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/grades`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      return null;
    }
  },

  /**
   * Get child's grades by subject
   */
  getChildGradesBySubject: async (childId, subjectId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/grades/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject grades:', error);
      return null;
    }
  },

  /**
   * Get child's attendance record
   */
  getChildAttendance: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/attendance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return null;
    }
  },

  /**
   * Get child's attendance statistics
   */
  getChildAttendanceStats: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/attendance/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return null;
    }
  },

  /**
   * Get child's assignments
   */
  getChildAssignments: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/assignments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return null;
    }
  },

  /**
   * Get child's assignment submissions
   */
  getChildAssignmentSubmissions: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/submissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return null;
    }
  },

  /**
   * Get child's current courses/classes
   */
  getChildCourses: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/courses`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return null;
    }
  },

  /**
   * Get child's timetable/schedule
   */
  getChildSchedule: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return null;
    }
  },

  /**
   * Get messages between parent and teachers
   */
  getMessages: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return null;
    }
  },

  /**
   * Send message to teacher
   */
  sendMessage: async (childId, teacherId, messageText) => {
    try {
      const response = await parentAPI.post(`/parents/children/${childId}/messages`, {
        recipientId: teacherId,
        message: messageText,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  /**
   * Get parent's notifications
   */
  getNotifications: async () => {
    try {
      const response = await parentAPI.get('/parents/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return null;
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await parentAPI.put(`/parents/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  },

  /**
   * Get parent's fees/financial information
   */
  getChildFees: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/fees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      return null;
    }
  },

  /**
   * Get parent's fee payment history
   */
  getPaymentHistory: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/payments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return null;
    }
  },

  /**
   * Get behavior/conduct records
   */
  getChildBehavior: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/behavior`);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavior records:', error);
      return null;
    }
  },

  /**
   * Get performance report
   */
  getPerformanceReport: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/reports`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance report:', error);
      return null;
    }
  },

  /**
   * Get child's exams
   */
  getChildExams: async (childId) => {
    try {
      const response = await parentAPI.get(`/parents/children/${childId}/exams`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      return null;
    }
  },
};

export default parentService;
