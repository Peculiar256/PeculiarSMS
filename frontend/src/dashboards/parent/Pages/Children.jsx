import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, BarChart3 } from 'lucide-react';
import '../css/Children.css';
import parentService from '../../../services/parentService';

function Children() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildDetails();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    const data = await parentService.getMyChildren();
    if (data) {
      setChildren(data);
      if (data.length > 0) {
        setSelectedChild(data[0]);
      }
    }
    setLoading(false);
  };

  const loadChildDetails = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildDetails(selectedChild.id);
    if (data) {
      setChildDetails(data);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="children-container">
        <div className="children-header">
          <h1>My Children</h1>
          <p>Manage your children's academic information</p>
        </div>
        <div className="no-data-message">
          <Users size={48} />
          <h2>No Children Found</h2>
          <p>You don't have any children linked to your account.</p>
          <p>Please contact the school administrator to link your children.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="children-container">
      <div className="children-header">
        <h1>My Children</h1>
        <p>Manage your children's academic information</p>
      </div>

      {/* Children Grid */}
      <div className="children-grid">
        {children.map((child) => (
          <div
            key={child.id}
            className={`child-card ${selectedChild?.id === child.id ? 'active' : ''}`}
            onClick={() => setSelectedChild(child)}
          >
            <div className="child-avatar">{child.firstName.charAt(0)}</div>
            <h3>{child.firstName} {child.lastName}</h3>
            <p className="class-info">{child.className}</p>
            <p className="admission-id">Admission: {child.admissionId}</p>
          </div>
        ))}
      </div>

      {/* Child Details */}
      {selectedChild && childDetails && (
        <div className="child-details-section">
          <h2>{selectedChild.firstName} {selectedChild.lastName}</h2>

          {/* Basic Information */}
          <div className="details-grid">
            <div className="info-card">
              <h3>Basic Information</h3>
              <div className="info-item">
                <span className="label">Full Name:</span>
                <span className="value">{selectedChild.firstName} {selectedChild.lastName}</span>
              </div>
              <div className="info-item">
                <span className="label">Date of Birth:</span>
                <span className="value">{new Date(selectedChild.dateOfBirth).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="label">Gender:</span>
                <span className="value">{selectedChild.gender}</span>
              </div>
              <div className="info-item">
                <span className="label">Admission ID:</span>
                <span className="value">{selectedChild.admissionId}</span>
              </div>
            </div>

            <div className="info-card">
              <h3>Academic Information</h3>
              <div className="info-item">
                <span className="label">Class:</span>
                <span className="value">{selectedChild.className}</span>
              </div>
              <div className="info-item">
                <span className="label">Section:</span>
                <span className="value">{selectedChild.section || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Roll Number:</span>
                <span className="value">{selectedChild.rollNumber}</span>
              </div>
              <div className="info-item">
                <span className="label">Enrollment Date:</span>
                <span className="value">{new Date(selectedChild.enrollmentDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="info-card">
              <h3>Contact Information</h3>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{selectedChild.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{selectedChild.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Address:</span>
                <span className="value">{selectedChild.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Academic Stats */}
          <div className="academic-stats">
            <h2>Academic Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <BookOpen size={24} />
                <h4>Active Courses</h4>
                <p>{childDetails.activeCourses || 0}</p>
              </div>
              <div className="stat-item">
                <Award size={24} />
                <h4>Average GPA</h4>
                <p>{childDetails.gpa?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="stat-item">
                <BarChart3 size={24} />
                <h4>Class Rank</h4>
                <p>#{childDetails.classRank || 'N/A'}</p>
              </div>
              <div className="stat-item">
                <Users size={24} />
                <h4>Class Strength</h4>
                <p>{childDetails.classSize || 0}</p>
              </div>
            </div>
          </div>

          {/* Teachers List */}
          {childDetails.teachers && childDetails.teachers.length > 0 && (
            <div className="teachers-section">
              <h2>Class Teachers</h2>
              <div className="teachers-list">
                {childDetails.teachers.map((teacher) => (
                  <div key={teacher.id} className="teacher-card">
                    <div className="teacher-avatar">{teacher.name.charAt(0)}</div>
                    <div className="teacher-info">
                      <h4>{teacher.name}</h4>
                      <p>{teacher.subject}</p>
                      <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Children;
