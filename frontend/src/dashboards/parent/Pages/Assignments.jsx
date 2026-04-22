import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '../css/Assignments.css';
import parentService from '../../../services/parentService';

function Assignments() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadAssignments();
      loadSubmissions();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    const data = await parentService.getMyChildren();
    if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0]);
    }
    setLoading(false);
  };

  const loadAssignments = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildAssignments(selectedChild.id);
    if (data) {
      setAssignments(data);
    }
  };

  const loadSubmissions = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildAssignmentSubmissions(selectedChild.id);
    if (data) {
      setSubmissions(data);
    }
  };

  const isAssignmentSubmitted = (assignmentId) => {
    return submissions.some((s) => s.assignmentId === assignmentId);
  };

  const getAssignmentStatus = (assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();

    if (isAssignmentSubmitted(assignment.id)) {
      return { label: 'Submitted', className: 'status-submitted', icon: CheckCircle };
    }
    if (dueDate < today) {
      return { label: 'Overdue', className: 'status-overdue', icon: AlertCircle };
    }
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2) {
      return { label: 'Due Soon', className: 'status-due-soon', icon: Clock };
    }
    return { label: 'Pending', className: 'status-pending', icon: Briefcase };
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'submitted') return isAssignmentSubmitted(assignment.id);
    if (filter === 'pending') return !isAssignmentSubmitted(assignment.id);
    if (filter === 'overdue') {
      const dueDate = new Date(assignment.dueDate);
      return dueDate < new Date() && !isAssignmentSubmitted(assignment.id);
    }
    return true;
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h1>Assignments & Submissions</h1>
        <p>Track your child's assignment completion status</p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="child-selector-bar">
          <label>Select Child:</label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => c.id === parseInt(e.target.value));
              setSelectedChild(child);
            }}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {children.length === 0 && (
        <div className="no-data-container">
          <p>No children found. Please link your children to your account.</p>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <Briefcase size={24} />
          <div>
            <h3>Total Assignments</h3>
            <p>{assignments.length}</p>
          </div>
        </div>
        <div className="stat-card submitted">
          <CheckCircle size={24} />
          <div>
            <h3>Submitted</h3>
            <p>{submissions.length}</p>
          </div>
        </div>
        <div className="stat-card pending">
          <Clock size={24} />
          <div>
            <h3>Pending</h3>
            <p>{assignments.length - submissions.length}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'submitted' ? 'active' : ''}`}
          onClick={() => setFilter('submitted')}
        >
          Submitted
        </button>
        <button
          className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </button>
      </div>

      {/* Assignments List */}
      <div className="assignments-list">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const dueDate = new Date(assignment.dueDate);
            const Icon = status.icon;

            return (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-header">
                  <div className="assignment-title">
                    <h3>{assignment.title}</h3>
                    <p>{assignment.subject}</p>
                  </div>
                  <span className={`status-badge ${status.className}`}>
                    <Icon size={16} />
                    {status.label}
                  </span>
                </div>

                <div className="assignment-content">
                  <p className="description">{assignment.description}</p>
                </div>

                <div className="assignment-footer">
                  <div className="due-date">
                    <span className="label">Due Date:</span>
                    <span className="value">{dueDate.toLocaleDateString()}</span>
                  </div>
                  <div className="teacher">
                    <span className="label">Teacher:</span>
                    <span className="value">{assignment.teacherName || 'N/A'}</span>
                  </div>
                  {isAssignmentSubmitted(assignment.id) && (
                    <div className="submitted-date">
                      <span className="label">Submitted:</span>
                      <span className="value">✓</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-data">
            <p>No assignments to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Assignments;
