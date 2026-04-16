import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './FeaturePages.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function StudentPerformanceReport() {
    const [selectedClass, setSelectedClass] = useState('S.4A');
    const [performanceData] = useState({
        'S.4A': [
            { name: 'John Doe', mathAvg: 85, engAvg: 78, scienceAvg: 88, overallAvg: 83.7, grade: 'A' },
            { name: 'Jane Smith', mathAvg: 92, engAvg: 88, scienceAvg: 90, overallAvg: 90, grade: 'A+' },
            { name: 'Mike Johnson', mathAvg: 70, engAvg: 75, scienceAvg: 72, overallAvg: 72.3, grade: 'B' },
            { name: 'Sarah Williams', mathAvg: 65, engAvg: 68, scienceAvg: 63, overallAvg: 65.3, grade: 'C' },
            { name: 'Tom Brown', mathAvg: 55, engAvg: 58, scienceAvg: 60, overallAvg: 57.7, grade: 'D' },
        ],
        'S.4B': [
            { name: 'Alice Green', mathAvg: 88, engAvg: 85, scienceAvg: 86, overallAvg: 86.3, grade: 'A' },
            { name: 'Bob White', mathAvg: 75, engAvg: 77, scienceAvg: 79, overallAvg: 77, grade: 'B' },
        ],
        'S.5': [
            { name: 'Carol Davis', mathAvg: 90, engAvg: 92, scienceAvg: 91, overallAvg: 91, grade: 'A+' },
        ]
    });

    const classStudents = performanceData[selectedClass] || [];

    const getGradeColor = (grade) => {
        const colors = {
            'A+': '#059669',
            'A': '#10b981',
            'B': '#3b82f6',
            'C': '#f59e0b',
            'D': '#ef4444'
        };
        return colors[grade] || '#6b7280';
    };

    const getGradeBackground = (grade) => {
        const colors = {
            'A+': '#d1fae5',
            'A': '#d1fae5',
            'B': '#dbeafe',
            'C': '#fef3c7',
            'D': '#fee2e2'
        };
        return colors[grade] || '#f3f4f6';
    };

    const getPerformanceStats = () => {
        if (classStudents.length === 0) return { avg: 0, highest: 0, lowest: 0 };
        const avgs = classStudents.map(s => s.overallAvg);
        return {
            avg: (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1),
            highest: Math.max(...avgs).toFixed(1),
            lowest: Math.min(...avgs).toFixed(1)
        };
    };

    const stats = getPerformanceStats();
    const studentCount = classStudents.length;

    const getSubjectAverage = (field) => {
        if (studentCount === 0) return 0;
        return Number((classStudents.reduce((sum, student) => sum + student[field], 0) / studentCount).toFixed(1));
    };

    const subjectChartData = {
        labels: ['Mathematics', 'English', 'Science'],
        datasets: [
            {
                label: 'Average Score',
                data: [
                    getSubjectAverage('mathAvg'),
                    getSubjectAverage('engAvg'),
                    getSubjectAverage('scienceAvg'),
                ],
                backgroundColor: ['#2c4ebb', '#3b82f6', '#0ea5e9'],
                borderRadius: 8,
                maxBarThickness: 56,
            },
        ],
    };

    const subjectChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y}%`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value) => `${value}%`,
                },
                grid: {
                    color: '#e2e8f0',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const gradeLabels = ['A+', 'A', 'B', 'C', 'D'];
    const gradeCounts = gradeLabels.map((grade) => classStudents.filter((student) => student.grade === grade).length);

    const gradeChartData = {
        labels: gradeLabels,
        datasets: [
            {
                label: 'Students',
                data: gradeCounts,
                backgroundColor: gradeLabels.map((grade) => getGradeColor(grade)),
                borderWidth: 0,
            },
        ],
    };

    const gradeChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.raw}`,
                },
            },
        },
    };

    return (
        <div className="feature-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-chart-line"></i> Student Performance Report</h1>
                    <p>Class-wise and subject-wise performance analysis</p>
                </div>
                <button className="btn btn-primary">
                    <i className="fa-solid fa-download"></i> Export Report
                </button>
            </div>

            {/* Class Selection */}
            <div className="card">
                <div className="card-body">
                    <div className="class-selector">
                        {Object.keys(performanceData).map(cls => (
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

            {/* Performance Stats */}
            <div className="stats-row">
                <div className="stat-box">
                    <div className="stat-number">{stats.avg}</div>
                    <div className="stat-label">Class Average</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">{stats.highest}</div>
                    <div className="stat-label">Highest Score</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">{stats.lowest}</div>
                    <div className="stat-label">Lowest Score</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">{studentCount}</div>
                    <div className="stat-label">Students</div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="card">
                <div className="card-header">
                    <h3>Performance Details - {selectedClass}</h3>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="performance-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Mathematics</th>
                                    <th>English</th>
                                    <th>Science</th>
                                    <th>Overall Average</th>
                                    <th>Grade</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classStudents.map((student, idx) => (
                                    <tr key={idx}>
                                        <td className="student-name">{student.name}</td>
                                        <td>
                                            <span className="score">{student.mathAvg}</span>
                                        </td>
                                        <td>
                                            <span className="score">{student.engAvg}</span>
                                        </td>
                                        <td>
                                            <span className="score">{student.scienceAvg}</span>
                                        </td>
                                        <td>
                                            <span className="score-highlight">{student.overallAvg}</span>
                                        </td>
                                        <td>
                                            <span 
                                                className="grade-badge" 
                                                style={{ 
                                                    backgroundColor: getGradeBackground(student.grade),
                                                    color: getGradeColor(student.grade)
                                                }}
                                            >
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Subject-wise Analysis */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3>Subject Performance</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ height: '280px' }}>
                            <Bar data={subjectChartData} options={subjectChartOptions} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Grade Distribution</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ height: '280px' }}>
                            <Doughnut data={gradeChartData} options={gradeChartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentPerformanceReport;
