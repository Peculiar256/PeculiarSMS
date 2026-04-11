import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

function Attendance() {
    const { user } = useAuth();
    const [attendanceData, setAttendanceData] = useState([]);
    const [overallAttendance, setOverallAttendance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchAttendance = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`http://localhost:8080/api/students/${user.id}/attendance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch attendance');

                const data = await response.json();
                console.log('📋 Attendance data:', data);

                // Extract attendance records grouped by month or class
                const records = data.attendanceRecords || data.monthlyAttendance || [];
                setAttendanceData(records);

                // Get overall attendance rate
                const overall = data.attendancePercentage || data.attendanceRate || 0;
                setOverallAttendance(Math.round(overall));

                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching attendance:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [user]);

    // Transform API response to component format if needed
    const classWiseAttendance = attendanceData
        .filter(a => a.className)
        .map(a => ({
            class: a.className,
            attendance: a.percentage || a.attendanceRate || 0
        }))
        .slice(0, 4);

    const monthWiseAttendance = attendanceData
        .filter(a => a.month)
        .map(a => ({
            month: a.month,
            present: a.presentDays || a.present || 0,
            absent: a.absentDays || a.absent || 0,
            percentage: a.percentage || a.attendanceRate || 0
        }))
        .slice(0, 4);

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1><i className="fa-solid fa-clipboard-user"></i> Attendance</h1>
                    <p>Loading your attendance records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1><i className="fa-solid fa-clipboard-user"></i> Attendance</h1>
                    <p style={{color: 'red'}}>Error loading attendance: {error}</p>
                </div>
            </div>
        );
    }

    // Fallback data if API returns empty
    const displayMonthData = monthWiseAttendance.length > 0 ? monthWiseAttendance : [
        { month: "Loading...", present: 0, absent: 0, percentage: 0 }
    ];

    const displayClassData = classWiseAttendance.length > 0 ? classWiseAttendance : [
        { class: "No data", attendance: 0 }
    ];

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-clipboard-user"></i> Attendance</h1>
                    <p>Your attendance records and statistics</p>
                </div>
                <div>
                    <h3 style={{ color: '#2c4ebb', margin: 0 }}>Overall: {overallAttendance}%</h3>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '24px' }}>
                <div className="card">
                    <div className="card-header">
                        <h5>Monthly Attendance</h5>
                    </div>
                    <div className="card-body">
                        {displayMonthData.map((month, idx) => (
                            <div key={idx} style={{ marginBottom: '16px' }}>
                                <div className="d-flex justify-content-between mb-2">
                                    <small className="fw-bold">{month.month}</small>
                                    <small className="text-muted">{Math.round(month.percentage)}%</small>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div 
                                        className="progress-bar" 
                                        style={{ width: `${month.percentage}%`, backgroundColor: month.percentage >= 90 ? '#10b981' : '#f59e0b' }}
                                    ></div>
                                </div>
                                <small className="text-muted">Present: {month.present} | Absent: {month.absent}</small>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h5>Class-wise Attendance</h5>
                    </div>
                    <div className="card-body">
                        {displayClassData.map((cls, idx) => (
                            <div key={idx} className="attendance-row">
                                <div className="class-info">
                                    <h5>{cls.class}</h5>
                                </div>
                                <div className="attendance-rate" style={{ flex: 1 }}>
                                    <div className="progress-bar" style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${cls.attendance}%`, backgroundColor: '#10b981' }}></div>
                                    </div>
                                    <span className="rate-text" style={{ marginLeft: '12px' }}>{cls.attendance}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Attendance;
