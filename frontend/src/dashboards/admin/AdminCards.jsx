import React, { useEffect, useState } from "react";
import './AdminCards.css'


function AdminCards (){
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalRooms: 0,
        totalDepartments: 0,
        attendanceRate: 0,
        loading: true,
        error: null
    });

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Get greeting based on time of day
    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // Fetch dashboard statistics from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/dashboard/stats", {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch stats: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("📊 Dashboard stats received:", data);
                
                // Map backend response to state
                setStats(prev => ({
                    ...prev,
                    totalStudents: data.totalStudents || 0,
                    totalTeachers: data.totalTeachers || 0,
                    totalClasses: data.totalClasses || 0,
                    totalRooms: data.totalRooms || 0,
                    totalDepartments: data.totalDepartments || 0,
                    attendanceRate: data.attendanceRate || 0,
                    loading: false
                }));
            } catch (err) {
                console.error("❌ Error fetching stats:", err);
                setStats(prev => ({
                    ...prev,
                    error: err.message,
                    loading: false
                }));
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="admin-container" style={{marginBottom: "-40px"}}>
            <div className="banner-container">
                <div className="banner-content">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <i className="fa-solid fa-sun" style={{ fontSize: "24px", color: "#fbbf24" }}></i>
                        <h1 style={{ margin: 0, fontSize: "28px", color: "white" }}>{getTimeGreeting()}, Admin!</h1>
                    </div>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "rgba(255, 255, 255, 0.95)" }}>
                        <i className="fa-solid fa-chart-line" style={{ marginRight: "8px", color: "#e0f2fe" }}></i>
                        You have a great day ahead. Monitor your school operations and make data-driven decisions.
                    </p>
                </div>
                <div className="banner-date">
                    <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", marginBottom: "4px" }}>TODAY</p>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>{currentDate}</span>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {stats.error && (
                <div style={{
                    padding: "12px 16px",
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    borderRadius: "6px",
                    color: "#991b1b",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    <i className="fa-solid fa-exclamation-circle"></i>
                    <span>{stats.error}</span>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon student">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Total Students</h3>
                        <p>{stats.loading ? "-" : stats.totalStudents.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon teacher">
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Total Teachers</h3>
                        <p>{stats.loading ? "-" : stats.totalTeachers}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon classes">
                        <i className="fa-solid fa-book-open"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Total Classes</h3>
                        <p>{stats.loading ? "-" : stats.totalClasses}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon attendance">
                        <i className="fa-solid fa-chart-pie"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Attendance Rate</h3>
                        <p>{stats.loading ? "-" : `${stats.attendanceRate.toFixed(1)}%`}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon rooms">
                        <i className="fa-solid fa-door-open"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Total Rooms</h3>
                        <p>{stats.loading ? "-" : stats.totalRooms}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon departments">
                        <i className="fa-solid fa-building"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Departments</h3>
                        <p>{stats.loading ? "-" : stats.totalDepartments}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AdminCards;