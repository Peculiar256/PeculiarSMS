import React, { useState } from 'react';
import './FeaturePages.css';

function AttendanceSummary() {
    const [weeklyData] = useState([
        { day: 'Mon', present: 28, absent: 2, total: 30, percentage: 93 },
        { day: 'Tue', present: 29, absent: 1, total: 30, percentage: 97 },
        { day: 'Wed', present: 27, absent: 3, total: 30, percentage: 90 },
        { day: 'Thu', present: 30, absent: 0, total: 30, percentage: 100 },
        { day: 'Fri', present: 26, absent: 4, total: 30, percentage: 87 },
    ]);

    const [classData] = useState([
        { class: 'S.4A', present: 27, absent: 3, rate: 90 },
        { class: 'S.4B', present: 29, absent: 1, rate: 97 },
        { class: 'S.5', present: 25, absent: 5, rate: 83 },
        { class: 'S.6', present: 28, absent: 2, rate: 93 },
    ]);

    const getPercentageColor = (percentage) => {
        if (percentage >= 95) return '#10b981';
        if (percentage >= 85) return '#f59e0b';
        return '#ef4444';
    };

    const handleExportCSV = () => {
        const headers = ['Day', 'Present', 'Absent', 'Total', 'Attendance %'];
        const rows = weeklyData.map((row) => [
            row.day,
            row.present,
            row.absent,
            row.total,
            row.percentage,
        ]);

        const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', 'attendance_summary.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;
            const doc = new jsPDF();

            doc.setFontSize(16);
            doc.text('Attendance Summary', 14, 16);

            autoTable(doc, {
                startY: 24,
                head: [['Day', 'Present', 'Absent', 'Total', 'Attendance %']],
                body: weeklyData.map((row) => [
                    row.day,
                    row.present,
                    row.absent,
                    row.total,
                    `${row.percentage}%`,
                ]),
            });

            doc.save('attendance_summary.pdf');
        } catch (error) {
            console.error('Failed to export PDF:', error);
        }
    };

    return (
        <div className="feature-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-calendar-check"></i> Attendance Summary</h1>
                    <p>Weekly and class-wise attendance analytics</p>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="stats-row">
                <div className="stat-box">
                    <div className="stat-number">92%</div>
                    <div className="stat-label">Weekly Average</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">110</div>
                    <div className="stat-label">Present This Week</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">10</div>
                    <div className="stat-label">Absent This Week</div>
                </div>
            </div>

            <div className="grid-2">
                {/* Weekly Attendance Chart */}
                <div className="attendance-export-column">
                    <button className="btn btn-primary attendance-export-btn" onClick={handleExportCSV}>
                        <i className="fa-solid fa-file-csv"></i> CSV
                    </button>
                    <div className="card">
                        <div className="card-header">
                            <h3>Weekly Attendance Trend</h3>
                        </div>
                        <div className="card-body">
                            <div className="attendance-chart">
                                {weeklyData.map((data, idx) => (
                                    <div key={idx} className="attendance-day">
                                        <div className="chart-bar">
                                            <div 
                                                className="bar-present" 
                                                style={{ height: `${(data.present / data.total) * 100}%` }}
                                                title={`${data.present} Present`}
                                            ></div>
                                            <div 
                                                className="bar-absent" 
                                                style={{ height: `${(data.absent / data.total) * 100}%` }}
                                                title={`${data.absent} Absent`}
                                            ></div>
                                        </div>
                                        <p className="day-label">{data.day}</p>
                                        <p className="percentage" style={{ color: getPercentageColor(data.percentage) }}>
                                            {data.percentage}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="legend">
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                                    <span>Present</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                                    <span>Absent</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class-wise Attendance */}
                <div className="attendance-export-column">
                    <button className="btn btn-primary attendance-export-btn" onClick={handleExportPDF}>
                        <i className="fa-solid fa-file-pdf"></i> PDF
                    </button>
                    <div className="card">
                        <div className="card-header">
                            <h3>Class-wise Attendance Rate</h3>
                        </div>
                        <div className="card-body">
                            <div className="class-attendance-list">
                                {classData.map((cls, idx) => (
                                    <div key={idx} className="attendance-row">
                                        <div className="class-info">
                                            <h5>{cls.class}</h5>
                                            <small>{cls.present} Present, {cls.absent} Absent</small>
                                        </div>
                                        <div className="attendance-rate">
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ 
                                                        width: `${cls.rate}%`,
                                                        backgroundColor: getPercentageColor(cls.rate)
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="rate-text">{cls.rate}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="card">
                <div className="card-header">
                    <h3>Quick Actions</h3>
                </div>
                <div className="card-body">
                    <div className="action-buttons">
                        <button className="btn btn-primary">
                            <i className="fa-solid fa-download"></i> Download Report
                        </button>
                        <button className="btn btn-secondary">
                            <i className="fa-solid fa-print"></i> Print Summary
                        </button>
                        <button className="btn btn-light">
                            <i className="fa-solid fa-share"></i> Share with Students
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttendanceSummary;
