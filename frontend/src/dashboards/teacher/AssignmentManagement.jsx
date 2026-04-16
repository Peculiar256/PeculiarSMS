import React, { useRef, useState } from 'react';
import './FeaturePages.css';

function AssignmentManagement() {
    const uploadInputRef = useRef(null);
    const [assignments, setAssignments] = useState([
        { id: 1, title: 'Mathematics Homework', class: 'S.4A', dueDate: '2026-04-10', submissions: 25, total: 30, status: 'active' },
        { id: 2, title: 'English Essay', class: 'S.5', dueDate: '2026-04-12', submissions: 28, total: 35, status: 'active' },
        { id: 3, title: 'Physics Lab Report', class: 'S.4B', dueDate: '2026-04-08', submissions: 22, total: 28, status: 'closed' },
    ]);
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        class: '',
        dueDate: '',
        description: ''
    });

    const handleUploadClick = () => {
        uploadInputRef.current?.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newAssignment = {
            id: assignments.length + 1,
            ...formData,
            submissions: 0,
            total: 30,
            status: 'active'
        };
        setAssignments([newAssignment, ...assignments]);
        setFormData({ title: '', class: '', dueDate: '', description: '' });
        setShowModal(false);
    };

    const getSubmissionColor = (submissions, total) => {
        const percentage = (submissions / total) * 100;
        if (percentage >= 90) return '#10b981';
        if (percentage >= 70) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="feature-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-file-lines"></i> Assignment Management</h1>
                    <p>Create and track homework and assignments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fa-solid fa-plus"></i> New Assignment
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-box">
                    <div className="stat-number">{assignments.length}</div>
                    <div className="stat-label">Total Assignments</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">{assignments.filter(a => a.status === 'active').length}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">{Math.round(assignments.reduce((acc, a) => acc + (a.submissions / a.total), 0) / assignments.length * 100)}%</div>
                    <div className="stat-label">Avg Submission</div>
                </div>
            </div>

            {/* Assignments List */}
            <div className="card">
                <div className="card-header">
                    <h3>All Assignments</h3>
                </div>
                <div className="card-body">
                    <div className="assignments-list">
                        {assignments.map(assignment => (
                            <div key={assignment.id} className="assignment-card">
                                <div className="assignment-info">
                                    <h4>{assignment.title}</h4>
                                    <p className="class-label">{assignment.class}</p>
                                    <p className="due-date">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="assignment-metrics">
                                    <div className="submission-metric">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ 
                                                    width: `${(assignment.submissions / assignment.total) * 100}%`,
                                                    backgroundColor: getSubmissionColor(assignment.submissions, assignment.total)
                                                }}
                                            ></div>
                                        </div>
                                        <span className="submission-count">{assignment.submissions}/{assignment.total} submitted</span>
                                    </div>
                                </div>
                                <div className="assignment-actions">
                                    <span className={`status-badge status-${assignment.status}`}>{assignment.status}</span>
                                    <button className="btn btn-sm btn-secondary">View</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Assignment</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="assignment-form">
                            <div className="form-group">
                                <label>Assignment Title *</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g., Mathematics Homework"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Class *</label>
                                <select 
                                    value={formData.class}
                                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    <option value="S.4A">S.4A</option>
                                    <option value="S.4B">S.4B</option>
                                    <option value="S.5">S.5</option>
                                    <option value="S.6">S.6</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Due Date *</label>
                                <input 
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Assignment details and instructions..."
                                    rows="4"
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <input
                                    ref={uploadInputRef}
                                    type="file"
                                    style={{ display: 'none' }}
                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                />
                                <button type="button" className="btn btn-secondary" onClick={handleUploadClick}>
                                    <i className="fa-solid fa-upload"></i> Upload
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Assignment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignmentManagement;
