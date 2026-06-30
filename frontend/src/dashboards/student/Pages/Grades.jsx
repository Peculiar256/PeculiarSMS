import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./Grades.css";

function Grades() {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [gpa, setGpa] = useState("N/A");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [studentId, setStudentId] = useState("N/A");
    const [reportData, setReportData] = useState({
        studentClass: "N/A",
        stream: "N/A",
        classPosition: "N/A",
        academicYear: new Date().getFullYear().toString(),
        term: 1,
        bestSubjects: [],
        worstSubjects: [],
        overallGrade: "N/A",
        performanceTrend: "stable"
    });

    useEffect(() => {
        if (!user?.id) return;

        console.log('👤 User object:', user);

        const fetchGrades = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`http://localhost:8080/api/students/${user.id}/results`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch grades');

                const data = await response.json();
                console.log('📝 Grades data:', data);

                // Extract student ID from the response
                if (data.studentId) {
                    setStudentId(data.studentId);
                    console.log('✓ Student ID found:', data.studentId);
                }

                // Transform API response to component format
                const formattedGrades = (data.results || []).map(r => ({
                    subjectCode: r.subjectCode,
                    course: r.subjectName || r.subjectCode || "Unknown Subject",
                    marks: r.marksObtained || 0,
                    maxMarks: r.maxMarks || 100,
                    percentage: r.percentage || ((r.marksObtained || 0) / (r.maxMarks || 100) * 100).toFixed(1),
                    grade: r.grade || "-",
                    gradePoints: r.gradePoints || 0,
                    remarks: r.remarks || "",
                    classPosition: r.classPosition || "-",
                    paper1: r.paper1Marks || 0,
                    paper2: r.paper2Marks || 0,
                    paper3: r.paper3Marks || 0,
                    stream: r.stream || "N/A",
                    className: r.className || "N/A"
                }));

                // Sort by marks to find best and worst
                const sorted = [...formattedGrades].sort((a, b) => b.marks - a.marks);
                const bestSubjects = sorted.slice(0, 3);
                // Only show worst subjects if they scored below 75 (needs improvement threshold)
                const worstSubjects = sorted
                    .filter(s => s.marks < 75)
                    .slice(-2)
                    .reverse();

                // Calculate GPA from marks
                let totalGpa = 0;
                if (formattedGrades.length > 0) {
                    totalGpa = formattedGrades.reduce((sum, g) => sum + (parseFloat(g.marks) || 0), 0) / formattedGrades.length;
                }

                // Determine overall grade
                let overallGrade = "Average";
                if (totalGpa >= 80) overallGrade = "Excellent";
                else if (totalGpa >= 70) overallGrade = "Very Good";
                else if (totalGpa >= 60) overallGrade = "Good";
                else if (totalGpa >= 50) overallGrade = "Satisfactory";

                setGpa(totalGpa.toFixed(2));
                setGrades(formattedGrades);
                setReportData(prev => ({
                    ...prev,
                    studentClass: formattedGrades[0]?.className || "N/A",
                    stream: formattedGrades[0]?.stream || "N/A",
                    bestSubjects,
                    worstSubjects,
                    overallGrade
                }));
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching grades:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGrades();
    }, [user]);

    const getGradeColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 70) return '#3b82f6';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getGradeBackground = (score) => {
        if (score >= 80) return 'rgba(16, 185, 129, 0.1)';
        if (score >= 70) return 'rgba(59, 130, 246, 0.1)';
        if (score >= 60) return 'rgba(245, 158, 11, 0.1)';
        return 'rgba(239, 68, 68, 0.1)';
    };

    const exportToPDF = () => {
        setShowPreview(true);
        
        setTimeout(() => {
            const printWindow = window.open('', '', 'height=800,width=900');
            const reportContent = document.querySelector('.printable-report');
            
            if (!reportContent) {
                alert('Report could not be generated. Please try again.');
                return;
            }

            const styles = `
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #1f2937; background: white; }
                    .printable-report { max-width: 100%; padding: 40px; background: white; }
                    .report-header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 30px; padding-bottom: 25px; border-bottom: 3px solid #667eea; }
                    .school-logo { font-size: 48px; color: #667eea; }
                    .school-info h2 { margin: 0; color: #667eea; font-size: 24px; }
                    .school-info p { margin: 5px 0; color: #666; }
                    .report-title { text-align: center; font-size: 22px; font-weight: 700; color: #1f2937; margin: 20px 0 25px 0; text-transform: uppercase; letter-spacing: 1px; }
                    .student-info-section { margin: 25px 0; background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
                    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
                    .info-item { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                    .info-item label { font-weight: 700; color: #1f2937; font-size: 0.9rem; }
                    .info-item p { margin: 0; color: #666; font-size: 0.95rem; }
                    .performance-summary-section { margin: 30px 0; }
                    .performance-summary-section h3 { font-size: 1.1rem; color: #1f2937; margin-bottom: 15px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                    .summary-item { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center; }
                    .summary-item .label { margin: 0; font-size: 0.85rem; color: #666; text-transform: uppercase; font-weight: 600; }
                    .summary-item .value { margin: 10px 0 0 0; font-size: 28px; font-weight: 700; color: #1f2937; }
                    .marks-section { margin: 30px 0; }
                    .marks-section h3 { font-size: 1.1rem; color: #1f2937; margin-bottom: 15px; }
                    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .report-table thead { background: #f3f4f6; border-bottom: 2px solid #d1d5db; }
                    .report-table th { padding: 12px; text-align: left; font-weight: 700; color: #1f2937; font-size: 0.9rem; border: 1px solid #d1d5db; }
                    .report-table td { padding: 12px; border: 1px solid #d1d5db; color: #666; }
                    .report-table tbody tr:nth-child(even) { background: #f9fafb; }
                    .highlights-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
                    .highlight-box { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; }
                    .highlight-box.improvement { border-left-color: #ef4444; }
                    .highlight-box h4 { margin: 0 0 10px 0; color: #1f2937; font-size: 1rem; }
                    .highlight-box ul { margin: 0; padding-left: 20px; color: #666; }
                    .highlight-box li { margin: 8px 0; font-size: 0.95rem; }
                    .comments-section { margin: 30px 0; }
                    .comments-section h3 { font-size: 1.1rem; color: #1f2937; margin-bottom: 15px; }
                    .comments-box { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; border-left: 4px solid #667eea; }
                    .signature-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 60px; }
                    .sig-line { text-align: center; }
                    .sig-line p { margin: 0; color: #1f2937; font-size: 0.9rem; }
                    .sig-line p:first-child { min-height: 50px; border-top: 2px solid #1f2937; margin-bottom: 5px; }
                    .report-footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; font-size: 0.85rem; }
                    @media print { body { margin: 0; padding: 0; } .printable-report { padding: 20px; } }
                </style>
            `;

            const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Academic Performance Report</title>${styles}</head><body><div class="printable-report">${reportContent.innerHTML}</div></body></html>`;

            printWindow.document.write(html);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 250);
        }, 100);
    };

    const renderPerformanceBar = (marks, maxMarks = 100) => {
        const percentage = (marks / maxMarks) * 100;
        return (
            <div className="progress-bar-container">
                <div 
                    className="progress-bar-fill" 
                    style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getGradeColor(marks)
                    }}
                ></div>
            </div>
        );
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
        <div className="container-fluid grades-container">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-marker"></i> Academic Performance Report</h1>
                    <p>Your comprehensive grade report for {reportData.academicYear}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => setShowPreview(true)}
                        title="View full report"
                    >
                        <i className="fa-solid fa-eye"></i> Full Report
                    </button>
                    <button 
                        className="btn btn-sm btn-danger"
                        onClick={exportToPDF}
                        title="Print or export as PDF"
                    >
                        <i className="fa-solid fa-file-pdf"></i> PDF
                    </button>
                </div>
            </div>

            {/* Performance Summary Cards */}
            <div className="performance-summary">
                <div className="summary-card overall-grade">
                    <div className="card-icon">
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <div className="card-content">
                        <p className="card-label">Overall Performance</p>
                        <h3 className="card-value">{reportData.overallGrade}</h3>
                        <p className="card-subtext">Based on average marks</p>
                    </div>
                </div>

                <div className="summary-card gpa-card">
                    <div className="card-icon">
                        <i className="fa-solid fa-chart-pie"></i>
                    </div>
                    <div className="card-content">
                        <p className="card-label">Average Score</p>
                        <h3 className="card-value">{gpa}/100</h3>
                        <p className="card-subtext">{grades.length} subjects</p>
                    </div>
                </div>

                <div className="summary-card subjects-card">
                    <div className="card-icon">
                        <i className="fa-solid fa-book"></i>
                    </div>
                    <div className="card-content">
                        <p className="card-label">Subjects</p>
                        <h3 className="card-value">{grades.length}</h3>
                        <p className="card-subtext">Total enrolled</p>
                    </div>
                </div>
            </div>

            {/* Detailed Subjects Table */}
            <div className="card subjects-table-card">
                <div className="card-header">
                    <h5><i className="fa-solid fa-table"></i> Detailed Performance by Subject</h5>
                </div>
                <div className="table-responsive">
                    <table className="subjects-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Marks</th>
                                <th>Percentage</th>
                                <th>Grade</th>
                                <th>Performance</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.length > 0 ? (
                                grades.map((grade, idx) => (
                                    <tr key={idx} className="subject-row">
                                        <td className="subject-cell">
                                            <strong>{grade.course}</strong>
                                        </td>
                                        <td className="marks-cell">
                                            {grade.marks}/{grade.maxMarks}
                                        </td>
                                        <td className="percentage-cell">
                                            {parseFloat(grade.percentage).toFixed(1)}%
                                        </td>
                                        <td className="grade-cell">
                                            <span 
                                                className="grade-badge"
                                                style={{
                                                    backgroundColor: getGradeBackground(grade.marks),
                                                    color: getGradeColor(grade.marks),
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {grade.grade}
                                            </span>
                                        </td>
                                        <td className="performance-cell">
                                            {renderPerformanceBar(grade.marks)}
                                        </td>
                                        <td className="remarks-cell">
                                            <small>{grade.remarks || "-"}</small>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                        No grades available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Best & Worst Performing */}
            <div className="performance-highlights">
                <div className="highlight-section best-subjects">
                    <h4><i className="fa-solid fa-arrow-up"></i> Best Performing</h4>
                    <div className="highlight-list">
                        {reportData.bestSubjects.length > 0 ? (
                            reportData.bestSubjects.map((subject, idx) => (
                                <div key={idx} className="highlight-item">
                                    <span className="rank-badge">{idx + 1}</span>
                                    <div className="subject-info">
                                        <p className="subject-name">{subject.course}</p>
                                        <p className="subject-score">{subject.marks}/{subject.maxMarks}</p>
                                    </div>
                                    <span className="badge-success">{subject.grade}</span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">No data available</p>
                        )}
                    </div>
                </div>

                <div className="highlight-section needs-improvement">
                    <h4><i className="fa-solid fa-triangle-exclamation"></i> Needs Improvement</h4>
                    <div className="highlight-list">
                        {reportData.worstSubjects.length > 0 ? (
                            reportData.worstSubjects.map((subject, idx) => (
                                <div key={idx} className="highlight-item">
                                    <span className="rank-badge warning">{idx + 1}</span>
                                    <div className="subject-info">
                                        <p className="subject-name">{subject.course}</p>
                                        <p className="subject-score">{subject.marks}/{subject.maxMarks}</p>
                                    </div>
                                    <span className="badge-warning">{subject.grade}</span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">🌟 Outstanding! All subjects performing excellently (75+)</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Full Professional Report Modal */}
            {showPreview && (
                <div className="report-modal-overlay">
                    <div className="report-modal">
                        <button 
                            className="close-btn"
                            onClick={() => setShowPreview(false)}
                        >
                            ×
                        </button>

                        {/* Printable Report Content */}
                        <div className="printable-report">
                            {/* Header */}
                            <div className="report-header">
                                <div className="school-logo">
                                    <i className="fa-solid fa-school"></i>
                                </div>
                                <div className="school-info">
                                    <h2>Peculiar School</h2>
                                    <p>Academic Excellence Center</p>
                                    <p style={{ fontSize: '0.9em' }}>Uganda</p>
                                </div>
                            </div>

                            <h1 className="report-title">ACADEMIC PERFORMANCE REPORT</h1>

                            {/* Student Info Section */}
                            <div className="student-info-section">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Student Name:</label>
                                        <p>{user?.fullName || 'N/A'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Student ID:</label>
                                        <p>{studentId || user?.studentId || "N/A"}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Class/Form:</label>
                                        <p>{reportData.studentClass}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Stream:</label>
                                        <p>{reportData.stream}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Academic Year:</label>
                                        <p>{reportData.academicYear}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Report Date:</label>
                                        <p>{new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                        

                            {/* Detailed Marks Table */}
                            <div className="marks-section">
                                <h3>Detailed Subject Performance</h3>
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Marks</th>
                                            <th>%</th>
                                            <th>Grade</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.map((grade, idx) => (
                                            <tr key={idx}>
                                                <td>{grade.course}</td>
                                                <td>{grade.marks}/{grade.maxMarks}</td>
                                                <td>{parseFloat(grade.percentage).toFixed(1)}%</td>
                                                <td style={{ fontWeight: 'bold' }}>{grade.grade}</td>
                                                <td>{grade.remarks || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Performance Summary */}
                            <div className="performance-summary-section">
                                <h3>Performance Summary</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <p className="label">Overall Grade</p>
                                        <p className="value highlight">{reportData.overallGrade}</p>
                                    </div>
                                    <div className="summary-item">
                                        <p className="label">Average Score</p>
                                        <p className="value">{gpa}/100</p>
                                    </div>
                                    <div className="summary-item">
                                        <p className="label">Total Subjects</p>
                                        <p className="value">{grades.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="highlights-section">
                                <div className="highlight-box best">
                                    <h4>Strengths</h4>
                                    <ul>
                                        {reportData.bestSubjects.map((subject, idx) => (
                                            <li key={idx}>{subject.course}: {subject.marks}/100</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="highlight-box improvement">
                                    <h4>Areas for Improvement</h4>
                                    <ul>
                                        {reportData.worstSubjects.length > 0 ? (
                                            reportData.worstSubjects.map((subject, idx) => (
                                                <li key={idx}>{subject.course}: {subject.marks}/100 - Focus needed</li>
                                            ))
                                        ) : (
                                            <li>🌟 Excellent performance across all subjects! All scores are 75 or above.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Teacher Comments Section */}
                            <div className="comments-section">
                                <h3>Teacher's General Remarks</h3>
                                <div className="comments-box">
                                    <p style={{ minHeight: '60px', color: '#666' }}>
                                        Remarks from your teachers will appear here...
                                    </p>
                                </div>
                            </div>

                            {/* Signature Section */}
                            <div className="signature-section">
                                <div className="sig-line">
                                    <p>_________________________</p>
                                    <p>Class Teacher</p>
                                    <p className="date-line">Date: _____________</p>
                                </div>
                                <div className="sig-line">
                                    <p>_________________________</p>
                                    <p>Head Teacher</p>
                                    <p className="date-line">Date: _____________</p>
                                </div>
                                <div className="sig-line school-stamp">
                                    <p className="stamp-text">School Stamp/Seal</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="report-footer">
                                <p>© {new Date().getFullYear()} Peculiar School. All rights reserved.</p>
                                <p>This is a confidential document. For official use only.</p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => setShowPreview(false)}
                            >
                                Close
                            </button>
                            <button 
                                className="btn btn-sm btn-danger"
                                onClick={exportToPDF}
                            >
                                <i className="fa-solid fa-print"></i> Print/PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Grades;
