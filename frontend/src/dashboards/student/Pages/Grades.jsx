import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

function Grades() {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [gpa, setGpa] = useState("N/A");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

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

    const exportToCSV = () => {
        const headers = ['Course', 'Midterm', 'Exam', 'Assignment', 'Final Grade', 'Remarks'];
        const rows = grades.map(g => [
            g.course,
            g.midterm || '-',
            g.marks || '-',
            g.assignment || '-',
            g.grade || '-',
            g.remarks || ''
        ]);

        const csvContent = [
            ['Student Name', user?.fullName || 'N/A'],
            ['Academic Year', new Date().getFullYear().toString()],
            ['Average GPA', gpa],
            [],
            [headers.join(',')],
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${user?.fullName || 'Student'}_Grades_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        window.print();
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h3 style={{ color: '#2c4ebb', margin: 0 }}>AVERAGE: {gpa}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => setShowPreview(true)}
                            title="Preview grades"
                        >
                            <i className="fa-solid fa-eye"></i> Preview
                        </button>
                        <button 
                            className="btn btn-sm btn-success"
                            onClick={exportToCSV}
                            title="Export as CSV"
                        >
                            <i className="fa-solid fa-file-csv"></i> CSV
                        </button>
                        <button 
                            className="btn btn-sm btn-danger"
                            onClick={exportToPDF}
                            title="Export as PDF"
                        >
                            <i className="fa-solid fa-file-pdf"></i> PDF
                        </button>
                    </div>
                </div>
            </div>

            {showPreview && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '30px',
                        maxWidth: '800px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Grade Report Preview</h3>
                            <button 
                                onClick={() => setShowPreview(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
                            <p><strong>Student Name:</strong> {user?.fullName || 'N/A'}</p>
                            <p><strong>Student ID:</strong> {user?.id || 'N/A'}</p>
                            <p><strong>Academic Year:</strong> {new Date().getFullYear()}</p>
                            <p><strong>Average GPA:</strong> <span style={{ color: '#2c4ebb', fontWeight: 'bold' }}>{gpa}</span></p>
                        </div>

                        <table className="performance-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f3f4f6' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Course</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Marks</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Grade</th>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((grade, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{grade.course}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <span style={{ 
                                                backgroundColor: getGradeColor(grade.marks) + '20', 
                                                color: getGradeColor(grade.marks),
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontWeight: 'bold'
                                            }}>
                                                {grade.marks || '-'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                            {grade.grade || '-'}
                                        </td>
                                        <td style={{ padding: '10px', fontSize: '0.9em', color: '#666' }}>
                                            {grade.remarks || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                className="btn btn-sm btn-success"
                                onClick={exportToCSV}
                            >
                                <i className="fa-solid fa-file-csv"></i> Download CSV
                            </button>
                            <button 
                                className="btn btn-sm btn-danger"
                                onClick={exportToPDF}
                            >
                                <i className="fa-solid fa-file-pdf"></i> Print/PDF
                            </button>
                            <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => setShowPreview(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
