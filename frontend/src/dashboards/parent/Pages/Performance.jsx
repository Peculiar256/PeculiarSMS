import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Target, Award } from 'lucide-react';
import '../css/Performance.css';
import parentService from '../../../services/parentService';

function Performance() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadPerformance();
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

  const loadPerformance = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildPerformanceSummary(selectedChild.id);
    if (data) {
      setPerformance(data);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="performance-container">
      <div className="performance-header">
        <h1>Academic Performance</h1>
        <p>Track your child's overall academic progress and trends</p>
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

      {performance && (
        <>
          {/* Performance Overview */}
          <div className="performance-grid">
            <div className="performance-card">
              <TrendingUp size={24} />
              <h3>Overall Performance</h3>
              <p className="performance-rating">{performance.performanceRating || 'N/A'}</p>
              <span className="performance-description">
                {performance.performanceDescription || 'No description'}
              </span>
            </div>

            <div className="performance-card">
              <Award size={24} />
              <h3>Current GPA</h3>
              <p className="performance-rating">{performance.gpa?.toFixed(2) || 'N/A'}</p>
              <span className="performance-description">
                {performance.gpaDescription || 'Grade Point Average'}
              </span>
            </div>

            <div className="performance-card">
              <BarChart3 size={24} />
              <h3>Class Rank</h3>
              <p className="performance-rating">
                #{performance.classRank || 'N/A'} of {performance.classSize || 0}
              </p>
              <span className="performance-description">Position in class</span>
            </div>

            <div className="performance-card">
              <Target size={24} />
              <h3>Improvement</h3>
              <p className={`performance-rating ${performance.improvement > 0 ? 'positive' : 'negative'}`}>
                {performance.improvement > 0 ? '+' : ''}{performance.improvement || 0}%
              </p>
              <span className="performance-description">Compared to last period</span>
            </div>
          </div>

          {/* Subject Performance */}
          {performance.subjectPerformance && performance.subjectPerformance.length > 0 && (
            <div className="subject-performance-section">
              <h2>Performance by Subject</h2>
              <div className="subject-bars">
                {performance.subjectPerformance.map((subject) => (
                  <div key={subject.id} className="subject-bar-item">
                    <div className="subject-bar-header">
                      <h4>{subject.name}</h4>
                      <span className="grade-percentage">{subject.average.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${subject.average}%` }}></div>
                    </div>
                    <p className="subject-status">
                      {subject.average >= 80
                        ? 'Excellent'
                        : subject.average >= 60
                        ? 'Good'
                        : 'Needs Improvement'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths and Weaknesses */}
          <div className="strengths-weaknesses">
            <div className="column">
              <h2>Strengths</h2>
              {performance.strengths && performance.strengths.length > 0 ? (
                <ul className="points-list">
                  {performance.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>

            <div className="column">
              <h2>Areas for Improvement</h2>
              {performance.areasForImprovement && performance.areasForImprovement.length > 0 ? (
                <ul className="points-list warning">
                  {performance.areasForImprovement.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No areas for improvement</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {performance.recommendations && performance.recommendations.length > 0 && (
            <div className="recommendations-section">
              <h2>Recommendations</h2>
              <div className="recommendations-list">
                {performance.recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation-item">
                    <span className="rec-number">{idx + 1}</span>
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Trend */}
          {performance.trend && (
            <div className="trend-section">
              <h2>Performance Trend</h2>
              <div className="trend-chart">
                {performance.trend.map((point, idx) => (
                  <div key={idx} className="trend-point">
                    <div className="trend-label">{point.period}</div>
                    <div className="trend-value">{point.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Performance;
