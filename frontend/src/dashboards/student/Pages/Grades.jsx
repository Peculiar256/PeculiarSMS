import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

function Grades() {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [gpa, setGpa] = useState("N/A");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchGrades = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`http://localhost:8080/api/students/${user.id}/results`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch grades');

                const data = await response.json();
                console.log('📝 Grades data:', data);

                // Transform API response to component format
                const formattedGrades = (data.results || []).map(r => ({
                    course: r.subjectName || r.subjectCode || "Unknown Subject",
                    midterm: parseInt(r.midtermMark || r.paper1_marks || 0) || 0,
                    exam: parseInt(r.examMark || r.marksObtained || 0) || 0,
                    assignment: parseInt(r.assignmentMark || r.paper2_marks || 0) || 0,
                    final: parseFloat(r.finalGrade || r.grade || calculateFinal(r.marksObtained, 0, 0)) || 0,
                    marks: r.marksObtained || 0,
                    percentage: r.percentage || 0,
                    grade: r.grade || "-",
                    remarks: r.remarks || ""
                }));

                // Calculate GPA from average marks, not final grade
                if (formattedGrades.length > 0) {
                    const avgMarks = formattedGrades.reduce((sum, g) => sum + (parseFloat(g.marks) || 0), 0) / formattedGrades.length;
                    setGpa(avgMarks.toFixed(2));
                }

                setGrades(formattedGrades);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching grades:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGrades();
    }, [user]);

    const calculateFinal = (exam, midterm, assignment) => {
        return ((exam * 0.5) + (midterm * 0.3) + (assignment * 0.2)).toFixed(1);
    };

    const getGradeColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 80) return '#3b82f6';
        if (score >= 70) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1><i className="fa-solid fa-marker"></i> My Grades</h1>
                    <p>Loading your academic performance...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1><i className="fa-solid fa-marker"></i> My Grades</h1>
                    <p style={{color: 'red'}}>Error loading grades: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-marker"></i> My Grades</h1>
                    <p>View your academic performance</p>
                </div>
                <div>
                    <h3 style={{ color: '#2c4ebb', margin: 0 }}>AVERAGE: {gpa}</h3>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="performance-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Midterm</th>
                                <th>Exam</th>
                                <th>Assignment</th>
                                <th>Final Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.length > 0 ? (
                                grades.map((grade, idx) => (
                                    <tr key={idx}>
                                        <td><strong>{grade.course}</strong></td>
                                        <td>
                                            <span className="score" style={{ backgroundColor: getGradeColor(grade.midterm) + '20', color: getGradeColor(grade.midterm) }}>
                                                {grade.midterm || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="score" style={{ backgroundColor: getGradeColor(grade.marks) + '20', color: getGradeColor(grade.marks) }}>
                                                {grade.marks || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="score" style={{ backgroundColor: getGradeColor(grade.assignment) + '20', color: getGradeColor(grade.assignment) }}>
                                                {grade.assignment || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="score-highlight" style={{ backgroundColor: getGradeColor(grade.marks) + '20', color: getGradeColor(grade.marks) }}>
                                                {grade.grade || grade.marks || "-"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No grades available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Grades;
