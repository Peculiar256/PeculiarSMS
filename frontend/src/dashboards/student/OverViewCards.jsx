import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import './OverViewCards.css'

function OverViewCards(){
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendance: 0,
        assignmentsDue: 0,
        averageGrade: "N/A",
        reports: 0,
        feeDue: 0,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!user?.id) return;

        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                
                // Fetch attendance, results (grades), and fees in parallel
                const [attendanceRes, resultsRes, feesRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/students/${user.id}/attendance`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`http://localhost:8080/api/students/${user.id}/results`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`http://localhost:8080/api/students/${user.id}/fees`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const attendanceData = attendanceRes.ok ? await attendanceRes.json() : null;
                const resultsData = resultsRes.ok ? await resultsRes.json() : null;
                const feesData = feesRes.ok ? await feesRes.json() : null;

                console.log('📊 Attendance:', attendanceData);
                console.log('📊 Results:', resultsData);
                console.log('📊 Fees:', feesData);

                // Calculate average grade
                let avgGrade = "N/A";
                if (resultsData?.results && Array.isArray(resultsData.results)) {
                    const grades = resultsData.results
                        .map(r => typeof r.grade === 'number' ? r.grade : parseFloat(r.marksObtained || 0))
                        .filter(g => !isNaN(g));
                    if (grades.length > 0) {
                        const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
                        avgGrade = avg.toFixed(1);
                    }
                }

                // Calculate attendance percentage
                let attendanceRate = 0;
                if (attendanceData?.attendancePercentage) {
                    attendanceRate = attendanceData.attendancePercentage;
                } else if (attendanceData?.attendanceRate) {
                    attendanceRate = attendanceData.attendanceRate;
                }

                setStats({
                    attendance: Math.round(attendanceRate),
                    assignmentsDue: 0, // Not available in current API
                    averageGrade: avgGrade,
                    reports: resultsData?.results?.length || 0,
                    feeDue: feesData?.amountDue || 0,
                    loading: false,
                    error: null
                });
            } catch (err) {
                console.error('❌ Error fetching student stats:', err);
                setStats(prev => ({ ...prev, loading: false, error: err.message }));
            }
        };

        fetchStats();
    }, [user]);

    return(
        <div className="overCards">
            <div className="Card">
                <i className="fa-solid fa-users" style={{border:"1px solid #2c4ebb", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#2c4ebb",marginBottom:"5px"}}></i>
                <h1>{stats.loading ? "-" : `${stats.attendance}%`}</h1>
                <p>Attendance</p>
            </div>

            <div className="Card">
                <i className="fa-solid fa-person-chalkboard" style={{border:"1px solid green", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px",display:"grid", placeItems:"center",color:"green",marginBottom:"5px"}}></i>
                <h1>{stats.loading ? "-" : stats.assignmentsDue}</h1>
                <p>Assignments Due</p>
            </div>

            <div className="Card">
                <i className="fa-solid fa-graduation-cap" style={{border:"1px solid orange", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center",color:"orange",marginBottom:"5px"}}></i>
                <h1>{stats.loading ? "-" : stats.averageGrade}</h1>
                <p>Average Grade</p>
            </div>

            <div className="Card">
                <i className="fa-solid fa-font-awesome" style={{border:"1px solid #2c4ebb", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center",color:"#2c4ebb",marginBottom:"5px"}}></i>
                <h1>{stats.loading ? "-" : stats.reports}</h1>
                <p>Reports</p>
            </div>

            <div className="Card">
                <i className="fa-solid fa-comment" style={{border:"1px solid green", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center",color:"green",marginBottom:"5px"}}></i>
                <h1>{stats.loading ? "-" : `$${stats.feeDue}`}</h1>
                <p>Fee/Finance</p>
            </div>
        </div>
    )
}

export default OverViewCards;