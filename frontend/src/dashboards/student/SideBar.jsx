
import React from "react";
import { useAuth } from "../../context/AuthContext";
import profilePic from '../../assets/Me.jpeg';
import './SideBar.css';
import { NavLink, useLocation } from "react-router-dom";

function SideBar() {
    const { user } = useAuth();
    const location = useLocation();
    
    // Helper to determine active class
    const isActive = (path) => location.pathname.includes(path) ? "sidebar-link active" : "sidebar-link";

    return (
        <div className="student-sidebar">
            {/* Profile Section */}
            <div className="sidebar-profile">
                <div className="profile-img-container">
                    <img src={profilePic} alt="Student" />
                </div>
                <h3>{user?.fullName || 'Student'}</h3>
                <span className="role-badge">Student</span>
                <p className="user-email">{user?.email || 'student@school.com'}</p>
            </div>

            <hr className="sidebar-divider" />

            {/* Navigation Links */}
            <nav className="sidebar-nav">
                {/* Main Section */}
                <div className="sidebar-section-header">Main</div>
                <NavLink to="/student" className={isActive("/student")} end>
                    <i className="fa-solid fa-house-user"></i>
                    <span>Dashboard</span>
                </NavLink>

                {/* Academics Section */}
                <div className="sidebar-section-header">Academics</div>
                <NavLink to="/student/courses" className={isActive("/student/courses")}>
                    <i className="fa-solid fa-book"></i>
                    <span>My Courses</span>
                </NavLink>

                <NavLink to="/student/grades" className={isActive("/student/grades")}>
                    <i className="fa-solid fa-marker"></i>
                    <span>My Grades</span>
                </NavLink>

                <NavLink to="/student/assignments" className={isActive("/student/assignments")}>
                    <i className="fa-solid fa-tasks"></i>
                    <span>Assignments</span>
                </NavLink>

                {/* Attendance & Schedule Section */}
                <div className="sidebar-section-header">Schedule & Attendance</div>
                <NavLink to="/student/schedule" className={isActive("/student/schedule")}>
                    <i className="fa-solid fa-calendar-days"></i>
                    <span>Time Schedule</span>
                </NavLink>

                <NavLink to="/student/attendance" className={isActive("/student/attendance")}>
                    <i className="fa-solid fa-clipboard-user"></i>
                    <span>Attendance</span>
                </NavLink>

                {/* Communication Section */}
                <div className="sidebar-section-header">Communication</div>
                <NavLink to="/student/messages" className={isActive("/student/messages")}>
                    <i className="fa-solid fa-envelope"></i>
                    <span>Messages</span>
                </NavLink>

                {/* Settings */}
                <NavLink to="/student/settings" className={isActive("/student/settings")} style={{ marginTop: 'auto' }}>
                    <i className="fa-solid fa-gear"></i>
                    <span>Settings</span>
                </NavLink>
            </nav>
        </div>
    );
}

export default SideBar;