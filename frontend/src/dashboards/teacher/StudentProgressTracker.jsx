import React, { useState } from 'react';
import './FeaturePages.css';

function StudentProgressTracker() {
    const [selectedClass, setSelectedClass] = useState('S.4A');
    const [students] = useState({
        'S.4A': [
            { id: 1, name: 'John Doe', email: 'john@school.com', avgScore: 83.7, trend: 'up', attendance: 92, risk: false },
            { id: 2, name: 'Jane Smith', email: 'jane@school.com', avgScore: 90, trend: 'stable', attendance: 98, risk: false },
            { id: 3, name: 'Mike Johnson', email: 'mike@school.com', avgScore: 72.3, trend: 'down', attendance: 85, risk: true },
            { id: 4, name: 'Sarah Williams', email: 'sarah@school.com', avgScore: 65.3, trend: 'down', attendance: 78, risk: true },
            { id: 5, name: 'Tom Brown', email: 'tom@school.com', avgScore: 57.7, trend: 'down', attendance: 70, risk: true },
        ],
        'S.4B': [
            { id: 6, name: 'Alice Green', email: 'alice@school.com', avgScore: 86.3, trend: 'up', attendance: 95, risk: false },
            { id: 7, name: 'Bob White', email: 'bob@school.com', avgScore: 77, trend: 'stable', attendance: 88, risk: false },
        ]
    });

    const [expandedStudent, setExpandedStudent] = useState(null);
    const [progressHistory] = useState({
        1: [70, 72, 75, 80, 80, 82, 84, 83, 83.7],
        2: [85, 87, 88, 88, 89, 90, 90, 90, 90],
        3: [82, 80, 78, 76, 75, 74, 72, 72.5, 72.3],
    });

    const classStudents = students[selectedClass] || [];
    const atRiskCount = classStudents.filter(s => s.risk).length;
    const excellentCount = classStudents.filter(s => s.avgScore >= 85).length;

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <i className="fa-solid fa-arrow-up text-success"></i>;
        if (trend === 'down') return <i className="fa-solid fa-arrow-down text-danger"></i>;
        return <i className="fa-solid fa-minus text-muted"></i>;
    };

    const getTrendColor = (trend) => {
        if (trend === 'up') return '#10b981';
        if (trend === 'down') return '#ef4444';
        return '#6b7280';
    };

    const getPerformanceLevel = (score) => {
        if (score >= 90) return { label: 'Excellent', color: '#10b981' };
        if (score >= 80) return { label: 'Good', color: '#3b82f6' };
        if (score >= 70) return { label: 'Average', color: '#f59e0b' };
        return { label: 'Below Average', color: '#ef4444' };
    };

    return (
        <div className="feature-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-chart-pie"></i> Student Progress Tracker</h1>
                    <p>Individual student performance history and trends</p>
                </div>
                <button className="btn btn-primary">
                    <i className="fa-solid fa-bell"></i> Send Alerts
                </button>
            </div>

            {/* Class Selection */}
            <div className="card">
                <div className="card-body">
                    <div className="class-selector">
                        {Object.keys(students).map(cls => (
                            <button
                                key={cls}
                                className={`class-btn ${selectedClass === cls ? 'active' : ''}`}
                                onClick={() => setSelectedClass(cls)}
                            >
                                {cls}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-row">
                <div className="stat-box">
                    <div className="stat-number">{classStudents.length}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">{excellentCount}</div>
                    <div className="stat-label">Excellent (≥85%)</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">{atRiskCount}</div>
                    <div className="stat-label">At Risk</div>
                    {atRiskCount > 0 && <div className="risk-indicator">Alert</div>}
                </div>
                <div className="stat-box">
                    <div className="stat-number">
                        {(classStudents.reduce((a, b) => a + b.attendance, 0) / classStudents.length).toFixed(0)}%
                    </div>
                    <div className="stat-label">Avg Attendance</div>
                </div>
            </div>

            {/* Student Progress List */}
            <div className="card">
                <div className="card-header">
                    <h3>Student List - {selectedClass}</h3>
                </div>
                <div className="card-body">
                    <div className="student-progress-list">
                        {classStudents.map(student => {
                            const performance = getPerformanceLevel(student.avgScore);
                            const isExpanded = expandedStudent === student.id;
                            return (
                                <div key={student.id} className="student-progress-card">
                                    <div 
                                        className="card-header-row"
                                        onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                                    >
                                        <div className="student-header">
                                            <div className="student-avatar">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="student-basic-info">
                                                <h5>{student.name}</h5>
                                                <p>{student.email}</p>
                                            </div>
                                        </div>

                                        <div className="student-metrics">
                                            <div className="metric">
                                                <span className="label">Score</span>
                                                <span 
                                                    className="value" 
                                                    style={{ color: performance.color }}
                                                >
                                                    {student.avgScore}/100
                                                </span>
                                            </div>
                                            <div className="metric">
                                                <span className="label">Performance</span>
                                                <span className="value" style={{ color: performance.color }}>
                                                    {performance.label}
                                                </span>
                                            </div>
                                            <div className="metric">
                                                <span className="label">Trend</span>
                                                <span className="value">{getTrendIcon(student.trend)}</span>
                                            </div>
                                            <div className="metric">
                                                <span className="label">Attendance</span>
                                                <span className="value">{student.attendance}%</span>
                                            </div>
                                            {student.risk && (
                                                <div className="risk-badge">
                                                    <i className="fa-solid fa-exclamation-triangle"></i> At Risk
                                                </div>
                                            )}
                                        </div>

                                        <div className="expand-icon">
                                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                        </div>
                                    </div>

                                    {/* Detailed View */}
                                    {isExpanded && (
                                        <div className="card-expanded">
                                            <div className="expanded-content">
                                                <div className="section">
                                                    <h4>Performance History</h4>
                                                    <div className="progress-chart">
                                                        <div className="chart-bars">
                                                            {progressHistory[student.id]?.map((score, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    className="chart-bar"
                                                                    title={`Term ${idx + 1}: ${score}`}
                                                                >
                                                                    <div 
                                                                        className="bar" 
                                                                        style={{ 
                                                                            height: `${score}%`,
                                                                            backgroundColor: getPerformanceLevel(score).color
                                                                        }}
                                                                    ></div>
                                                                    <span className="bar-label">T{idx + 1}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="section">
                                                    <h4>Status & Recommendations</h4>
                                                    {student.risk ? (
                                                        <div className="alert alert-warning">
                                                            <i className="fa-solid fa-exclamation-circle"></i>
                                                            <div>
                                                                <p><strong>Attention Required</strong></p>
                                                                <p>This student is showing a declining trend. Consider scheduling a meeting or providing additional support.</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="alert alert-success">
                                                            <i className="fa-solid fa-check-circle"></i>
                                                            <div>
                                                                <p><strong>Good Progress</strong></p>
                                                                <p>Student is performing well. Continue to encourage participation and engagement.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="section actions">
                                                    <button className="btn btn-sm btn-primary">
                                                        <i className="fa-solid fa-envelope"></i> Contact Parent
                                                    </button>
                                                    <button className="btn btn-sm btn-secondary">
                                                        <i className="fa-solid fa-note"></i> Add Note
                                                    </button>
                                                    <button className="btn btn-sm btn-light">
                                                        <i className="fa-solid fa-print"></i> Print Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProgressTracker;
