import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';
import '../css/Grades.css';
import parentService from '../../../services/parentService';

function Grades() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadGrades();
    }
  }, [selectedChild]);

  useEffect(() => {
    filterGrades();
  }, [grades, selectedSubject]);

  const loadChildren = async () => {
    const data = await parentService.getMyChildren();
    if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0]);
    }
    setLoading(false);
  };

  const loadGrades = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildGrades(selectedChild.id);
    if (data) {
      setGrades(data);
    }
  };

  const filterGrades = () => {
    if (selectedSubject === 'all') {
      setFilteredGrades(grades);
    } else {
      setFilteredGrades(grades.filter((g) => g.subject === selectedSubject));
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'grade-excellent';
    if (score >= 80) return 'grade-very-good';
    if (score >= 70) return 'grade-good';
    if (score >= 60) return 'grade-satisfactory';
    return 'grade-poor';
  };

  const getGradeLabel = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'F';
  };

  const uniqueSubjects = [...new Set(grades.map((g) => g.subject))];
  const averageGrade =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(2)
      : 0;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="grades-container">
      <div className="grades-header">
        <h1>Grades & Results</h1>
        <p>Monitor your child's academic performance</p>
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

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <BarChart3 size={24} />
          <div>
            <h3>Average Grade</h3>
            <p>{averageGrade}</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div>
            <h3>Total Subjects</h3>
            <p>{uniqueSubjects.length}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <Filter size={18} />
        <label>Filter by Subject:</label>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="all">All Subjects</option>
          {uniqueSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Grades Table */}
      <div className="grades-table-container">
        {filteredGrades.length > 0 ? (
          <table className="grades-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam/Assessment</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Class Average</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((grade) => (
                <tr key={grade.id}>
                  <td className="subject-cell">{grade.subject}</td>
                  <td>{grade.examName || grade.assessmentType}</td>
                  <td>
                    <span className={`score ${getGradeColor(grade.score)}`}>
                      {grade.score}/100
                    </span>
                  </td>
                  <td>
                    <span className={`grade-badge ${getGradeColor(grade.score)}`}>
                      {getGradeLabel(grade.score)}
                    </span>
                  </td>
                  <td>{grade.classAverage?.toFixed(1) || 'N/A'}</td>
                  <td>{new Date(grade.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No grades available</p>
          </div>
        )}
      </div>

      {/* Subject-wise Summary */}
      {uniqueSubjects.length > 0 && (
        <div className="subject-summary">
          <h2>Subject-wise Performance</h2>
          <div className="subjects-grid">
            {uniqueSubjects.map((subject) => {
              const subjectGrades = grades.filter((g) => g.subject === subject);
              const avgScore =
                subjectGrades.reduce((sum, g) => sum + g.score, 0) / subjectGrades.length;
              return (
                <div key={subject} className="subject-card">
                  <h3>{subject}</h3>
                  <div className="subject-score">
                    <span className={getGradeColor(avgScore)}>{avgScore.toFixed(1)}</span>
                  </div>
                  <div className="subject-stats">
                    <p>Assessments: {subjectGrades.length}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Grades;
