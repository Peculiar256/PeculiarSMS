import React from "react";
import profilePic from '../../assets/bd.jpeg';
import './SideBar.css';
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

function SideBar() {
    const location = useLocation();
    const { user } = useAuth();
    const year = new Date().getFullYear();
    
    // Helper to determine active class
    const isActive = (path) => location.pathname === path ? "sidebar-link active" : "sidebar-link";

    return (
        <div className="admin-sidebar">
            {/* Profile Section */}
            <div className="sidebar-profile">
                <div className="profile-img-container">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="Admin" />
                    ) : (
                        <img src={profilePic} alt="Admin" />
                    )}
                </div>
                <h3>{user?.firstName || user?.fullName || 'Admin User'}</h3>
                <span className="role-badge">{user?.role || 'Administrator'}</span>
                <p className="user-email">{user?.email || 'admin@school.com'}</p>
            </div>

            <hr className="sidebar-divider" />

            {/* Navigation Links */}
            <nav className="sidebar-nav">
                <NavLink to="/admin" className={isActive("/admin")} end>
                    <i className="fa-solid fa-house-user"></i>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/admin/students" className={isActive("/admin/students")}>
                    <i className="fa-solid fa-users"></i>
                    <span>Students</span>
                </NavLink>

                <NavLink to="/admin/teachers" className={isActive("/admin/teachers")}>
                    <i className="fas fa-graduation-cap"></i>
                    <span>Teachers</span>
                </NavLink>

                <NavLink to="/admin/staff" className={isActive("/admin/staff")}>
                    <i className="fa-solid fa-user-gear"></i>
                    <span>Staff</span>
                </NavLink>

                <NavLink to="/admin/grades" className={isActive("/admin/grades")}>
                    <i className="fa-solid fa-marker"></i>
                    <span>Grades</span>
                </NavLink>

                <NavLink to="/admin/attendance" className={isActive("/admin/attendance")}>
                    <i className="fa-solid fa-clipboard-user"></i>
                    <span>Attendance</span>
                </NavLink>

                <NavLink to="/admin/timetable" className={isActive("/admin/timetable")}>
                    <i className="fa-solid fa-calendar-days"></i>
                    <span>Timetable</span>
                </NavLink>

                <NavLink to="/admin/classes" className={isActive("/admin/classes")}>
                    <i className="fa-solid fa-chalkboard"></i>
                    <span>Classes</span>
                </NavLink>

                <NavLink to="/admin/subjects" className={isActive("/admin/subjects")}>
                    <i className="fa-solid fa-book"></i>
                    <span>Subjects</span>
                </NavLink>

                <NavLink to="/admin/exams" className={isActive("/admin/exams")}>
                    <i className="fa-solid fa-file-pen"></i>
                    <span>Exams</span>
                </NavLink>

                <NavLink to="/admin/rooms" className={isActive("/admin/rooms")}>
                    <i className="fa-solid fa-door-open"></i>
                    <span>Rooms</span>
                </NavLink>

                <NavLink to="/admin/departments" className={isActive("/admin/departments")}>
                    <i className="fa-solid fa-building"></i>
                    <span>Departments</span>
                </NavLink>

                <NavLink to="/admin/settings" className={isActive("/admin/settings")}>
                    <i className="fa-solid fa-gear"></i>
                    <span>Settings</span>
                </NavLink>

            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                <p>&copy; Peculiar Technologies Ltd</p>
                <small>v1.0.0 {year}</small>
            </div>
        </div>
    )
}
export default SideBar;