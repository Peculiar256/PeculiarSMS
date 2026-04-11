import React, { useState } from 'react';
import './FeaturePages.css';

function ExamSchedule() {
    const [exams] = useState([
        { id: 1, code: 'BOT1-2026-S4', name: 'Beginning of Term 1', type: 'BOT', date: '2026-04-15', classes: 'S.4A, S.4B', subjects: 'English, Math, Science' },
        { id: 2, code: 'MOT1-2026-S5', name: 'Mid of Term 1', type: 'MOT', date: '2026-05-20', classes: 'S.5, S.6', subjects: 'All Subjects' },
        { id: 3, code: 'EOT1-2026-ALL', name: 'End of Term 1', type: 'EOT', date: '2026-06-30', classes: 'S.4A, S.4B, S.5, S.6', subjects: 'All Subjects' },
        { id: 4, code: 'BOT2-2026-S4', name: 'Beginning of Term 2', type: 'BOT', date: '2026-07-15', classes: 'S.4A, S.4B', subjects: 'English, Math, Science' },
        { id: 5, code: 'UCE-2026', name: 'Uganda Certificate of Education', type: 'UCE', date: '2026-11-01', classes: 'S.4A, S.4B', subjects: 'All Subjects' },
    ]);

    const getExamTypeColor = (type) => {
        const colors = {
            'BOT': '#3b82f6',
            'MOT': '#10b981',
            'EOT': '#f59e0b',
            'UCE': '#8b5cf6',
            'UACE': '#06b6d4'
        };
        return colors[type] || '#6b7280';
    };

    const getExamTypeLabel = (type) => {
        const labels = {
            'BOT': 'Beginning of Term',
            'MOT': 'Mid of Term',
            'EOT': 'End of Term',
            'UCE': 'National - UCE',
            'UACE': 'National - UACE'
        };
        return labels[type] || type;
    };

    const isUpcoming = (date) => {
        return new Date(date) > new Date();
    };

    return (
        <div className="feature-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-calendar-days"></i> Exam Schedule</h1>
                    <p>View upcoming exams and their details</p>
                </div>
            </div>

            {/* Filter/Stats */}
            <div className="stats-row">
                <div className="stat-box">
                    <div className="stat-number">{exams.length}</div>
                    <div className="stat-label">Total Exams</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">{exams.filter(e => isUpcoming(e.date)).length}</div>
                    <div className="stat-label">Upcoming</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">4</div>
                    <div className="stat-label">My Classes</div>
                </div>
            </div>

            {/* Exams List */}
            <div className="card">
                <div className="card-header">
                    <h3>Exam Calendar</h3>
                </div>
                <div className="card-body">
                    <div className="exams-list">
                        {exams.map(exam => (
                            <div 
                                key={exam.id} 
                                className={`exam-card ${isUpcoming(exam.date) ? 'upcoming' : 'past'}`}
                            >
                                <div className="exam-date">
                                    <div className="date-badge" style={{ backgroundColor: getExamTypeColor(exam.type) }}>
                                        {new Date(exam.date).getDate()}
                                    </div>
                                    <div className="date-info">
                                        <p className="month-year">
                                            {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                        {isUpcoming(exam.date) && <p className="upcoming-label">Upcoming</p>}
                                    </div>
                                </div>

                                <div className="exam-details">
                                    <h4>{exam.name}</h4>
                                    <p className="exam-code">{exam.code}</p>
                                    <div className="exam-meta">
                                        <div className="meta-item">
                                            <i className="fa-solid fa-tag"></i>
                                            <span className="type-badge" style={{ backgroundColor: getExamTypeColor(exam.type) + '20', color: getExamTypeColor(exam.type) }}>
                                                {getExamTypeLabel(exam.type)}
                                            </span>
                                        </div>
                                        <div className="meta-item">
                                            <i className="fa-solid fa-users"></i>
                                            <span>{exam.classes}</span>
                                        </div>
                                        <div className="meta-item">
                                            <i className="fa-solid fa-book"></i>
                                            <span>{exam.subjects}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="exam-actions">
                                    <button className="btn btn-sm btn-primary">
                                        <i className="fa-solid fa-eye"></i> View
                                    </button>
                                    <button className="btn btn-sm btn-secondary">
                                        <i className="fa-solid fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Exam Types Legend */}
            <div className="card">
                <div className="card-header">
                    <h3>Exam Type Reference</h3>
                </div>
                <div className="card-body">
                    <div className="legend-grid">
                        <div className="legend-item">
                            <span className="legend-badge" style={{ backgroundColor: getExamTypeColor('BOT') }}></span>
                            <div>
                                <h5>BOT - Beginning of Term</h5>
                                <p>Assessment at the start of each term</p>
                            </div>
                        </div>
                        <div className="legend-item">
                            <span className="legend-badge" style={{ backgroundColor: getExamTypeColor('MOT') }}></span>
                            <div>
                                <h5>MOT - Mid of Term</h5>
                                <p>Mid-term assessment and progress check</p>
                            </div>
                        </div>
                        <div className="legend-item">
                            <span className="legend-badge" style={{ backgroundColor: getExamTypeColor('EOT') }}></span>
                            <div>
                                <h5>EOT - End of Term</h5>
                                <p>Comprehensive assessment at term end</p>
                            </div>
                        </div>
                        <div className="legend-item">
                            <span className="legend-badge" style={{ backgroundColor: getExamTypeColor('UCE') }}></span>
                            <div>
                                <h5>UCE - National Exam</h5>
                                <p>Uganda Certificate of Education - O Level</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExamSchedule;
