import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import studentService from "../../services/studentService";
import './Body.css';

function Body() {
    const { user, refreshUserProfile } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        coursesCount: 0,
        gpa: 0,
        attendancePercentage: 0,
        pendingAssignments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Refresh user profile from server first
                const freshUser = await refreshUserProfile();
                if (!freshUser) {
                  console.warn('Could not refresh user profile');
                }
                
                const data = await studentService.getDashboardData(user.id);
                setDashboardData(data);
                console.log('📊 Dashboard data loaded:', data);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.id, refreshUserProfile]);

    return (
        <div className="container-fluid py-4">
            {/* Welcome Banner */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="welcome-banner">
                        <div className="banner-content">
                            <h1>Welcome back, {user?.fullName || 'Student'}!</h1>
                            <p>Stay on top of your courses and grades</p>
                        </div>
                        <div className="banner-icon">
                            <i className="fa-solid fa-book-open"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="dashboard-card">
                        <div className="card-icon enrolled">
                            <i className="fa-solid fa-book"></i>
                        </div>
                        <div className="card-content">
                            <h3>{loading ? '-' : dashboardData.coursesCount}</h3>
                            <p>Active Courses</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="dashboard-card">
                        <div className="card-icon avg">
                            <i className="fa-solid fa-star"></i>
                        </div>
                        <div className="card-content">
                            <h3>{loading ? '-' : dashboardData.gpa}</h3>
                            <p>GPA</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="dashboard-card">
                        <div className="card-icon attendance">
                            <i className="fa-solid fa-clipboard-check"></i>
                        </div>
                        <div className="card-content">
                            <h3>{loading ? '-' : `${dashboardData.attendancePercentage}%`}</h3>
                            <p>Attendance</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="dashboard-card">
                        <div className="card-icon assignments">
                            <i className="fa-solid fa-tasks"></i>
                        </div>
                        <div className="card-content">
                            <h3>{loading ? '-' : dashboardData.pendingAssignments}</h3>
                            <p>Pending Submissions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Overview */}
            <div className="row g-4">
                
                {/* Recent Activities */}
                <div className="col-12 col-xl-6">
                    <div className="card shadow-sm h-100 border-0">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="mb-0 fw-bold text-dark-emphasis">Recent Activities</h5>
                        </div>
                        <div className="card-body px-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h6 className="mb-1 fw-semibold text-dark">Assignment Submitted</h6>
                                    <small className="text-muted">Mathematics - Chapter 5</small>
                                </div>
                                <span className="badge bg-light text-secondary rounded-pill">2 hours ago</span>
                            </div>
                            <hr className="text-muted opacity-25" />
                            
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h6 className="mb-1 fw-semibold text-dark">Grade Posted</h6>
                                    <small className="text-muted">Science Quiz - 85/100</small>
                                </div>
                                <span className="badge bg-light text-secondary rounded-pill">1 day ago</span>
                            </div>
                            <hr className="text-muted opacity-25" />

                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h6 className="mb-1 fw-semibold text-dark">Attendance Marked</h6>
                                    <small className="text-muted">Present in all classes</small>
                                </div>
                                <span className="badge bg-light text-secondary rounded-pill">3 days ago</span>
                            </div>
                            <hr className="text-muted opacity-25" />

                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="mb-1 fw-semibold text-dark">New Assignment Posted</h6>
                                    <small className="text-muted">English - Essay Writing</small>
                                </div>
                                <span className="badge bg-light text-secondary rounded-pill">5 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="col-12 col-xl-6">
                    <div className="card shadow-sm h-100 border-0">
                        <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="mb-0 fw-bold text-dark-emphasis">Quick Actions</h5>
                        </div>
                        <div className="card-body px-4">
                            <div className="d-grid gap-3">
                                <button className="btn btn-primary p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn">
                                    <span className="fw-semibold">
                                        <i className="fa-solid fa-file-upload me-2"></i> Submit Assignment
                                    </span>
                                    <i className="fa-solid fa-chevron-right small"></i>
                                </button>

                                <button className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn">
                                    <span className="fw-semibold text-dark-emphasis">
                                        <i className="fa-solid fa-calendar-days me-2 text-primary"></i> View Schedule
                                    </span>
                                    <i className="fa-solid fa-chevron-right small text-muted"></i>
                                </button>

                                <button className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn">
                                    <span className="fw-semibold text-dark-emphasis">
                                        <i className="fa-solid fa-message me-2 text-info"></i> Message Instructor
                                    </span>
                                    <i className="fa-solid fa-chevron-right small text-muted"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Body;
