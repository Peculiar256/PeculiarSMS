import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  User,
  Award,
} from 'lucide-react';
import './Body.css';
import parentService from '../../services/parentService';

function Body() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadPerformanceSummary();
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

  const loadPerformanceSummary = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildPerformanceSummary(selectedChild.id);
    if (data) {
      setPerformanceSummary(data);
    }
  };

  if (loading) {
    return (
      <div className="body-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="body-container">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Welcome back, Parent!</h1>
          <p>Stay informed about your child's academic progress and activities</p>
        </div>
      </div>

      {/* No Children Message */}
      {children.length === 0 && (
        <div className="no-children-message">
          <AlertCircle size={48} />
          <h2>No Children Found</h2>
          <p>You don't have any children linked to your account yet.</p>
          <p>Please contact the school administrator to link your children to your account.</p>
        </div>
      )}

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="child-selector">
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
                {child.firstName} {child.lastName} - {child.currentClass || 'N/A'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Overview Cards */}
      {selectedChild && (
        <div className="overview-cards-grid">
          {/* GPA Card */}
          <div className="overview-card">
            <div className="card-header">
              <Award size={24} />
              <span className="card-label">GPA</span>
            </div>
            <div className="card-value">
              {performanceSummary?.gpa?.toFixed(2) || 'N/A'}
            </div>
            <div className="card-footer">
              <span className="trend-badge positive">Excellent</span>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="overview-card">
            <div className="card-header">
              <Calendar size={24} />
              <span className="card-label">Attendance</span>
            </div>
            <div className="card-value">
              {performanceSummary?.attendancePercentage?.toFixed(1) || 'N/A'}%
            </div>
            <div className="card-footer">
              <span
                className={`trend-badge ${
                  (performanceSummary?.attendancePercentage || 0) >= 75
                    ? 'positive'
                    : 'warning'
                }`}
              >
                {(performanceSummary?.attendancePercentage || 0) >= 75
                  ? 'Good'
                  : 'Needs Improvement'}
              </span>
            </div>
          </div>

          {/* Active Courses Card */}
          <div className="overview-card">
            <div className="card-header">
              <BookOpen size={24} />
              <span className="card-label">Active Courses</span>
            </div>
            <div className="card-value">
              {performanceSummary?.activeCourses || 0}
            </div>
            <div className="card-footer">
              <span className="trend-badge neutral">
                {performanceSummary?.totalCourses || 0} total
              </span>
            </div>
          </div>

          {/* Pending Assignments Card */}
          <div className="overview-card">
            <div className="card-header">
              <CheckCircle size={24} />
              <span className="card-label">Assignments</span>
            </div>
            <div className="card-value">
              {performanceSummary?.pendingAssignments || 0}
            </div>
            <div className="card-footer">
              <span className="trend-badge warning">Pending</span>
            </div>
          </div>

          {/* Overall Performance Card */}
          <div className="overview-card">
            <div className="card-header">
              <TrendingUp size={24} />
              <span className="card-label">Performance</span>
            </div>
            <div className="card-value">
              {performanceSummary?.performanceRating || 'N/A'}
            </div>
            <div className="card-footer">
              <span
                className={`trend-badge ${
                  performanceSummary?.performanceRating === 'Excellent'
                    ? 'positive'
                    : performanceSummary?.performanceRating === 'Good'
                    ? 'neutral'
                    : 'warning'
                }`}
              >
                {performanceSummary?.performanceRating || 'N/A'}
              </span>
            </div>
          </div>

          {/* Class Rank Card */}
          <div className="overview-card">
            <div className="card-header">
              <BarChart3 size={24} />
              <span className="card-label">Class Rank</span>
            </div>
            <div className="card-value">
              {performanceSummary?.classRank
                ? `#${performanceSummary.classRank}`
                : 'N/A'}
            </div>
            <div className="card-footer">
              <span className="trend-badge neutral">
                of {performanceSummary?.classSize || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <CheckCircle size={20} />
            </div>
            <div className="activity-details">
              <h4>Grade Posted</h4>
              <p>Mathematics - 95/100</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <AlertCircle size={20} />
            </div>
            <div className="activity-details">
              <h4>Assignment Due</h4>
              <p>Physics Project - Due tomorrow</p>
              <span className="activity-time">5 hours ago</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <BookOpen size={20} />
            </div>
            <div className="activity-details">
              <h4>New Course Assigned</h4>
              <p>Advanced Chemistry 101</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Body;
