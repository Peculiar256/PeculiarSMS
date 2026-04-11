import React from "react";
import './Body.css';
import { useNavigate } from "react-router-dom";


function Body (){
  const navigate = useNavigate();

      return(
        <div className="container-fluid py-4">
          <div className="row g-4">
            
            {/* Recent Activities Section */}
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                  <h5 className="mb-0 fw-bold text-dark-emphasis">Recent Activities</h5>
                </div>
                <div className="card-body px-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="mb-1 fw-semibold text-dark">New student enrolled</h6>
                      <small className="text-muted">Managed by Admin</small>
                    </div>
                    <span className="badge bg-light text-secondary rounded-pill">2 hours ago</span>
                  </div>
                  <hr className="text-muted opacity-25" />
                  
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="mb-1 fw-semibold text-dark">Attendance Marked for Today</h6>
                      <small className="text-muted">Class 10-A</small>
                    </div>
                    <span className="badge bg-light text-secondary rounded-pill">6 hours ago</span>
                  </div>
                  <hr className="text-muted opacity-25" />

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="mb-1 fw-semibold text-dark">Teacher Assigned</h6>
                      <small className="text-muted">Mr. Johnson - Math</small>
                    </div>
                    <span className="badge bg-light text-secondary rounded-pill">3 hours ago</span>
                  </div>
                  <hr className="text-muted opacity-25" />

                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="mb-1 fw-semibold text-dark">New Announcement posted</h6>
                      <small className="text-muted">Exam Schedule Released</small>
                    </div>
                    <span className="badge bg-light text-secondary rounded-pill">5 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                  <h5 className="mb-0 fw-bold text-dark-emphasis">Quick Actions</h5>
                </div>
                <div className="card-body px-4">
                  <div className="d-grid gap-3">
                    <button
                      className="btn btn-primary p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn"
                      onClick={() => navigate('/admin/students')}
                    >
                      <span className="fw-semibold">
                        <i className="fa-solid fa-user-plus me-2"></i> Add New Student
                      </span>
                      <i className="fa-solid fa-chevron-right small"></i>
                    </button>

                    <button
                      className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn"
                      onClick={() => navigate('/admin/teachers')}
                    >
                      <span className="fw-semibold text-dark-emphasis">
                        <i className="fa-solid fa-chalkboard-user me-2 text-primary"></i> Add New Teacher
                      </span>
                      <i className="fa-solid fa-chevron-right small text-muted"></i>
                    </button>
                    
                    {/* Placeholder for future buttons */}
                    {/* <button className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn">
                      <span className="fw-semibold text-dark-emphasis">
                        <i className="fa-solid fa-calendar-days me-2 text-warning"></i> View Timetable
                      </span>
                      <i className="fa-solid fa-chevron-right small text-muted"></i>
                    </button> */}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )
}
export default Body;