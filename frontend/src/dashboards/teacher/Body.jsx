import React, { useState, useEffect } from "react";
import './Body.css';
import TeacherStudents from "./TeacherStudents";
import AddStudentMarks from "../../auth/AddStudentMarks";
import MyClasses from "./MyClasses";
import { useAuth } from "../../context/AuthContext";
import teacherService from "../../services/teacherService";

function Body(){
    const { user } = useAuth();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        
        const fetchTeacherData = async () => {
            try {
                setLoading(true);
                const response = await teacherService.getTeacherById(user.id);
                setTeacher(response.data);
            } catch (err) {
                console.error('Error fetching teacher data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, [user]);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    if (loading) {
        return <div className="container-fluid py-4">Loading...</div>;
    }

    return(
        <div className="container-fluid py-4">
          {/* Welcome Banner */}
          <div className="banner-container mb-4">
            <div className="banner-content">
              <h1>Welcome back, {teacher?.fullName || 'Teacher'}!</h1>
              <p>Here's your teaching dashboard. Manage grades, attendance, and student progress all in one place.</p>
            </div>
            <div className="banner-date">
              <span>{currentDate}</span>
            </div>
          </div>

          {/* Dashboard Status Cards */}
          <div className="stats-grid mb-4">
            <div className="stat-card">
              <div className="stat-icon classes-today">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <div className="stat-info">
                <h3>Classes Assigned</h3>
                <p>{teacher?.assignedClasses?.length || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon students-count">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="stat-info">
                <h3>Subjects Teaching</h3>
                <p>{teacher?.subjects?.length || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon experience-rate">
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="stat-info">
                <h3>Years Experience</h3>
                <p>{teacher?.yearsOfExperience || 0}+</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon department-badge">
                <i className="fa-solid fa-building"></i>
              </div>
              <div className="stat-info">
                <h3>Department</h3>
                <p>{teacher?.department?.name || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            
            {/* Teacher Profile Section */}
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-gradient border-bottom-0 pt-4 px-4">
                  <h5 className="mb-0 fw-bold text-white">
                    <i className="fa-solid fa-user-tie me-2"></i> Your Profile
                  </h5>
                </div>
                <div className="card-body px-4">
                  <div className="profile-item mb-3">
                    <label className="profile-label">Specialization</label>
                    <p className="profile-value">{teacher?.specialization || 'Not specified'}</p>
                  </div>
                  <hr className="text-muted opacity-25" />

                  <div className="profile-item mb-3">
                    <label className="profile-label">Qualifications</label>
                    <p className="profile-value">{teacher?.qualifications || 'Not specified'}</p>
                  </div>
                  <hr className="text-muted opacity-25" />

                  <div className="profile-item mb-3">
                    <label className="profile-label">Primary Subject</label>
                    <p className="profile-value">{teacher?.primarySubject || 'Not assigned'}</p>
                  </div>
                  <hr className="text-muted opacity-25" />

                  <div className="profile-item">
                    <label className="profile-label">Employment Status</label>
                    <span className="badge bg-success">{teacher?.employmentStatus || 'ACTIVE'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects & Specialization Section */}
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-gradient border-bottom-0 pt-4 px-4">
                  <h5 className="mb-0 fw-bold text-white">
                    <i className="fa-solid fa-book me-2"></i> Teaching Subjects
                  </h5>
                </div>
                <div className="card-body px-4">
                  {teacher?.subjects && teacher.subjects.length > 0 ? (
                    <div className="subjects-container">
                      {teacher.subjects.map((subject, idx) => (
                        <div key={idx} className="subject-item">
                          <span className="subject-icon">
                            <i className="fa-solid fa-circle-dot"></i>
                          </span>
                          <span className="subject-name">{subject}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No subjects assigned yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-gradient border-bottom-0 pt-4 px-4">
                  <h5 className="mb-0 fw-bold text-white">
                    <i className="fa-solid fa-lightning me-2"></i> Quick Actions
                  </h5>
                </div>
                <div className="card-body px-4">
                  <div className="d-grid gap-3">
                    <button 
                      className="btn btn-primary p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn" 
                      data-bs-toggle="modal" 
                      data-bs-target="#markAttendanceModal"
                    >
                      <span className="fw-semibold">
                        <i className="fa-solid fa-clipboard-user me-2"></i> Mark Attendance
                      </span>
                      <i className="fa-solid fa-chevron-right small"></i>
                    </button>

                    <button 
                      className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn" 
                      data-bs-toggle="modal" 
                      data-bs-target="#AddStudentMarksModal"
                    >
                      <span className="fw-semibold text-dark-emphasis">
                        <i className="fa-solid fa-marker me-2 text-primary"></i> Add Student Marks
                      </span>
                      <i className="fa-solid fa-chevron-right small text-muted"></i>
                    </button>

                    <button 
                      className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn" 
                      data-bs-toggle="modal" 
                      data-bs-target="#MyclasssesModal"
                    >
                      <span className="fw-semibold text-dark-emphasis">
                        <i className="fa-solid fa-calendar-days me-2 text-warning"></i> View Your Timetable
                      </span>
                      <i className="fa-solid fa-chevron-right small text-muted"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Mark Attendance Modal */}
          <div className="modal fade" id="markAttendanceModal" tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom-0 pb-0">
                  <h3 className="modal-title fs-5 fw-bold ps-2">Mark Attendance</h3>
                  <button className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <TeacherStudents/>
                </div>
                <div className="modal-footer border-top-0">
                  <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Student Marks Modal */}
          <div className="modal fade" id="AddStudentMarksModal" tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom-0 pb-0">
                  <h3 className="modal-title fs-5 fw-bold ps-2">Add Student Marks</h3>
                  <button className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <AddStudentMarks/>
                </div>
                <div className="modal-footer border-top-0">
                  <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>

          {/* View Timetable Modal */}
          <div className="modal fade" id="MyclasssesModal" tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom-0 pb-0">
                  <h3 className="modal-title fs-5 fw-bold ps-2">Your Timetable</h3>
                  <button className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <MyClasses/>
                </div>
                <div className="modal-footer border-top-0">
                  <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}
export default Body;