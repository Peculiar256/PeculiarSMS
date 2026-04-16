import React from "react";

function Assignments() {
    const assignments = [
        { id: 1, title: "Mathematics Problem Set", course: "Mathematics", dueDate: "2026-04-15", status: "pending", submitted: false },
        { id: 2, title: "Science Lab Report", course: "Science", dueDate: "2026-04-10", status: "submitted", submitted: true },
        { id: 3, title: "English Essay", course: "English", dueDate: "2026-04-12", status: "submitted", submitted: true },
        { id: 4, title: "History Project", course: "History", dueDate: "2026-04-20", status: "pending", submitted: false },
        { id: 5, title: "Physics Assignment", course: "Physics", dueDate: "2026-04-08", status: "submitted", submitted: true },
        { id: 6, title: "Chemistry Worksheet", course: "Chemistry", dueDate: "2026-04-18", status: "pending", submitted: false },
    ];

    const getDaysRemaining = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getStatusColor = (status) => {
        return status === 'submitted' ? '#10b981' : '#f59e0b';
    };

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-tasks"></i> My Assignments</h1>
                    <p>Track your assignments and submissions</p>
                </div>
                <button className="btn btn-primary">
                    <i className="fa-solid fa-upload"></i> Submit Assignment
                </button>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="assignments-list">
                        {assignments.map((assign) => (
                            <div key={assign.id} className="assignment-card">
                                <div className="assignment-info" style={{ flex: 1 }}>
                                    <h4>{assign.title}</h4>
                                    <p className="class-label">{assign.course}</p>
                                    <p className="due-date">
                                        <i className="fa-solid fa-calendar"></i> Due: {assign.dueDate} ({getDaysRemaining(assign.dueDate)} days)
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    {assign.submitted ? (
                                        <span className="status-badge status-active">
                                            <i className="fa-solid fa-check"></i> Submitted
                                        </span>
                                    ) : (
                                        <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                                            <i className="fa-solid fa-clock"></i> Pending
                                        </span>
                                    )}
                                    <button className="btn btn-sm btn-light">
                                        <i className="fa-solid fa-eye"></i> View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Assignments;
