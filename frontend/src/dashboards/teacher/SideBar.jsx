import React from "react";
import profilePic from '../../assets/bd.jpeg';
import './SideBar.css';
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

function SideBar() {
    const location = useLocation();
    const { user } = useAuth();
    
    // Helper to determine active class
    const isActive = (path) => location.pathname === path ? "sidebar-link active" : "sidebar-link";

    return (
        <div className="teacher-sidebar">
            {/* Profile Section */}
            <div className="sidebar-profile">
                <div className="profile-img-container">
                    <img src={profilePic} alt="Teacher" />
                </div>
                <h3>{user?.firstName || user?.fullName || 'Teacher User'}</h3>
                <span className="role-badge">{user?.role || 'Educator'}</span>
                <p className="user-email">{user?.email || 'teacher@school.com'}</p>
            </div>

            <hr className="sidebar-divider" />

            {/* Navigation Links */}
            <nav className="sidebar-nav">
                {/* Main Section */}
                <div className="nav-section-header">Main</div>
                <NavLink to="/teacher" className={isActive("/teacher")} end>
                    <i className="fa-solid fa-house-user"></i>
                    <span>Dashboard</span>
                </NavLink>

                {/* Teaching Section */}
                <div className="nav-section-header">Teaching</div>
                <NavLink to="/teacher/students" className={isActive("/teacher/students")}>
                    <i className="fa-solid fa-users"></i>
                    <span>Students</span>
                </NavLink>

                <NavLink to="/teacher/grading" className={isActive("/teacher/grading")}>
                    <i className="fa-solid fa-marker"></i>
                    <span>Grading</span>
                </NavLink>

                <NavLink to="/teacher/myclasses" className={isActive("/teacher/myclasses")}>
                    <i className="fa-solid fa-chalkboard"></i>
                    <span>My Classes</span>
                </NavLink>

                <NavLink to="/teacher/assignments" className={isActive("/teacher/assignments")}>
                    <i className="fa-solid fa-file-lines"></i>
                    <span>Assignments</span>
                </NavLink>

                {/* Analytics & Reports Section */}
                <div className="nav-section-header">Analytics & Reports</div>
                <NavLink to="/teacher/attendance-summary" className={isActive("/teacher/attendance-summary")}>
                    <i className="fa-solid fa-calendar-check"></i>
                    <span>Attendance</span>
                </NavLink>

                <NavLink to="/teacher/exam-schedule" className={isActive("/teacher/exam-schedule")}>
                    <i className="fa-solid fa-calendar-days"></i>
                    <span>Exam Schedule</span>
                </NavLink>

                <NavLink to="/teacher/create-exam" className={isActive("/teacher/create-exam")}>
                    <i className="fa-solid fa-pencil-alt"></i>
                    <span>Create Exam</span>
                </NavLink>

                <NavLink to="/teacher/performance-report" className={isActive("/teacher/performance-report")}>
                    <i className="fa-solid fa-chart-line"></i>
                    <span>Performance Report</span>
                </NavLink>

                <NavLink to="/teacher/student-progress" className={isActive("/teacher/student-progress")}>
                    <i className="fa-solid fa-chart-pie"></i>
                    <span>Student Progress</span>
                </NavLink>
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                <p>&copy; 2026 SMS System</p>
                <small>v1.0.0</small>
            </div>
        </div>
    );
}
export default SideBar;