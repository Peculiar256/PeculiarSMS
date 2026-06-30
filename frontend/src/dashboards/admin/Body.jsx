import React, { useState, useEffect, useMemo } from "react";
import './Body.css';
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import axiosInstance from '../../services/axiosInstance';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Body (){
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
  });
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [attendanceData, setAttendanceData] = useState({ present: 0, absent: 0, late: 0 });

  useEffect(() => {
    fetchStudentsByClass();
    fetchAttendanceStats();
  }, []);

  const fetchStudentsByClass = async () => {
    setLoadingStudents(true);
    try {
      // First try: get all students and count by form level
      const studentsResponse = await axiosInstance.get('/students');
      const studentList = studentsResponse.data?.students || [];
      
      const counts = { 'S.1': 0, 'S.2': 0, 'S.3': 0, 'S.4': 0, 'S.5': 0, 'S.6': 0 };
      
      studentList.forEach(student => {
        // Get form level from schoolClass first, then from currentClass string
        let formLevel = 0;
        if (student.schoolClass && student.schoolClass.formLevel) {
          formLevel = student.schoolClass.formLevel;
        } else if (student.schoolClass && student.schoolClass.name) {
          const match = student.schoolClass.name.match(/^S(\d+)/);
          formLevel = match ? parseInt(match[1]) : 0;
        } else if (student.currentClass || student.className) {
          const classStr = student.currentClass || student.className || '';
          const match = classStr.toString().match(/S(\d+)/);
          formLevel = match ? parseInt(match[1]) : 0;
        }
        
        const key = `S.${formLevel}`;
        if (Object.prototype.hasOwnProperty.call(counts, key)) {
          counts[key]++;
        }
      });
      
      const total = studentList.length;
      setStudentsByClass(counts);
      setDashboardStats(prev => ({ ...prev, totalStudents: total }));
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudentsByClass({ 'S.1': 0, 'S.2': 0, 'S.3': 0, 'S.4': 0, 'S.5': 0, 'S.6': 0 });
      setDashboardStats(prev => ({ ...prev, totalStudents: 0 }));
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await axiosInstance.get('/attendance/statistics');
      const stats = response.data;
      setAttendanceData({
        present: stats.todayPresent || 0,
        absent: stats.todayAbsent || 0,
        late: stats.todayLate || 0,
      });
    } catch (err) {
      console.error('Failed to fetch attendance stats:', err);
      setAttendanceData({ present: 0, absent: 0, late: 0 });
    } finally {
      setLoadingAttendance(false);
    }
  };

  const enrollmentChartData = useMemo(() => {
    const labels = ["S.1", "S.2", "S.3", "S.4", "S.5", "S.6"];
    const dataCounts = labels.map(cls => {
      const val = (studentsByClass[cls] || 0);
      return typeof val === 'number' ? val : 0;
    });
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Students",
          data: dataCounts,
          backgroundColor: "#1E40AF",
          borderColor: "#1E40AF",
          borderWidth: 1,
          borderRadius: 4,
          minBarLength: 5,
        },
      ],
    };
    
    return chartData;
  }, [studentsByClass]);

  const attendanceChartData = useMemo(() => ({
    labels: ["Present", "Absent", "Late"],
    datasets: [
      {
        data: [
          attendanceData.present,
          attendanceData.absent,
          attendanceData.late
        ],
        backgroundColor: ["#1E40AF", "#dc3545", "#ffc107"],
        borderWidth: 2,
      },
    ],
  }), [attendanceData]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      title: {
        display: true,
        text: 'Attendance',
        padding: { bottom: 10 },
      },
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
        },
      },
    },
  };

  const enrollmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const num = Number(value);
            return Number.isInteger(num) ? num : null;
          }
        },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Students'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Class'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Students per Class',
        padding: { bottom: 10 },
      },
      legend: {
        display: false
      },
    },
  };

  const recentActivities = useMemo(() => [
    { id: 1, action: "Student enrolled", details: `${dashboardStats.totalStudents} total students registered`, icon: "fa-user-plus", color: "success" },
    { id: 2, action: "Teacher registered", details: `${dashboardStats.totalTeachers} total teachers`, icon: "fa-chalkboard-user", color: "success" },
    { id: 3, action: "Attendance recorded", details: `${dashboardStats.attendanceRate}% attendance rate today`, icon: "fa-clipboard-check", color: "info" },
    { id: 4, action: "Classes available", details: `${dashboardStats.totalClasses} active classes`, icon: "fa-door-open", color: "warning" },
  ], [dashboardStats]);

  return(
    <div className="container-fluid py-3">
      <div >
        {/* Left Column - Quick Actions */}
        <div className="col-lg-12">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-bottom-0 pt-4 px-4">
              <h5 className="mb-0 fw-bold text-dark-emphasis">
                <i className="fa-solid fa-bolt me-2 text-warning"></i>Quick Actions
              </h5>
            </div>
            <div className="card-body px-4">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-success p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                    onClick={() => navigate('/admin/students')}
                  >
                    <span className="fw-semibold">
                      <i className="fa-solid fa-user-plus me-2"></i>Add New Student
                    </span>
                    <i className="fa-solid fa-chevron-right small"></i>
                  </button>
                </div>

                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                    onClick={() => navigate('/admin/teachers')}
                  >
                    <span className="fw-semibold text-dark-emphasis">
                      <i className="fa-solid fa-chalkboard-user me-2 text-success"></i>Add New Teacher
                    </span>
                    <i className="fa-solid fa-chevron-right small text-muted"></i>
                  </button>
                </div>

                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                    onClick={() => navigate('/admin/classes')}
                  >
                    <span className="fw-semibold text-dark-emphasis">
                      <i className="fa-solid fa-door-open me-2 text-success"></i>Manage Classes
                    </span>
                    <i className="fa-solid fa-chevron-right small text-muted"></i>
                  </button>
                </div>

                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                    onClick={() => navigate('/admin/attendance')}
                  >
                    <span className="fw-semibold text-dark-emphasis">
                      <i className="fa-solid fa-clipboard-check me-2 text-info"></i>View Attendance
                    </span>
                    <i className="fa-solid fa-chevron-right small text-muted"></i>
                  </button>
                </div>

                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                    onClick={() => navigate('/admin/exams')}
                  >
                    <span className="fw-semibold text-dark-emphasis">
                      <i className="fa-solid fa-file-pen me-2 text-warning"></i>Manage Exams
                    </span>
                    <i className="fa-solid fa-chevron-right small text-muted"></i>
                  </button>
                </div>

                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                    onClick={() => navigate('/admin/grades')}
                  >
                    <span className="fw-semibold text-dark-emphasis">
                      <i className="fa-solid fa-chart-line me-2 text-danger"></i>View Grades
                    </span>
                    <i className="fa-solid fa-chevron-right small text-muted"></i>
                  </button>
                </div>

                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                    onClick={() => navigate('/admin/departments')}
                  >
                    <span className="fw-semibold text-dark-emphasis">
                      <i className="fa-solid fa-sitemap me-2 text-secondary"></i>Manage Departments
                    </span>
                    <i className="fa-solid fa-chevron-right small text-muted"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Charts & Activity */}
        <div className="col-lg-12">
          <div className="row g-4">
            {/* Charts */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-2">
                  <h6 className="mb-0 fw-semibold">
                    <i className="fa-solid fa-chart-bar me-2 text-success"></i>Students by Class
                  </h6>
                </div>
                <div className="card-body p-2" style={{ height: '180px' }}>
                  {loadingStudents ? (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted small">Loading...</span>
                    </div>
                  ) : (
                    <Bar data={enrollmentChartData} options={enrollmentChartOptions} />
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-2">
                  <h6 className="mb-0 fw-semibold">
                    <i className="fa-solid fa-chart-pie me-2 text-warning"></i>Attendance
                  </h6>
                </div>
                <div className="card-body p-2" style={{ height: '180px' }}>
                  {loadingAttendance ? (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted small">Loading...</span>
                    </div>
                  ) : (
                    <Doughnut data={attendanceChartData} options={doughnutOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Log */}
          <div className="col-12 p-2">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom-0 py-3">
                <h5 className="mb-0 fw-bold text-dark-emphasis">
                  <i className="fa-solid fa-clock-rotate-left me-2 text-success"></i>Recent Activity
                </h5>
              </div>
              <div className="card-body px-3">
                <div className="activity-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item d-flex align-items-center px-4 py-2">
                      <div className={`activity-icon bg-${activity.color} bg-opacity-10 me-3`}>
                        <i className={`fa-solid ${activity.icon} text-${activity.color}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-medium">{activity.action}</p>
                        <small className="text-muted">{activity.details}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
export default Body;