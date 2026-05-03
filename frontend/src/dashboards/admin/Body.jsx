import React from "react";
import './Body.css';
import { useNavigate } from "react-router-dom";


function Body (){
  const navigate = useNavigate();

      return(
        <div className="container-fluid py-4">
          <div className="row g-4">
            
            {/* Quick Actions Section */}
            <div className="col-12">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                  <h5 className="mb-0 fw-bold text-dark-emphasis">Quick Actions</h5>
                </div>
                <div className="card-body px-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-primary p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                        onClick={() => navigate('/admin/students')}
                      >
                        <span className="fw-semibold">
                          <i className="fa-solid fa-user-plus me-2"></i> Add New Student
                        </span>
                        <i className="fa-solid fa-chevron-right small"></i>
                      </button>
                    </div>

                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                        onClick={() => navigate('/admin/teachers')}
                      >
                        <span className="fw-semibold text-dark-emphasis">
                          <i className="fa-solid fa-chalkboard-user me-2 text-primary"></i> Add New Teacher
                        </span>
                        <i className="fa-solid fa-chevron-right small text-muted"></i>
                      </button>
                    </div>

                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                        onClick={() => navigate('/admin/classes')}
                      >
                        <span className="fw-semibold text-dark-emphasis">
                          <i className="fa-solid fa-door-open me-2 text-success"></i> Manage Classes
                        </span>
                        <i className="fa-solid fa-chevron-right small text-muted"></i>
                      </button>
                    </div>

                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                        onClick={() => navigate('/admin/attendance')}
                      >
                        <span className="fw-semibold text-dark-emphasis">
                          <i className="fa-solid fa-clipboard-check me-2 text-info"></i> View Attendance
                        </span>
                        <i className="fa-solid fa-chevron-right small text-muted"></i>
                      </button>
                    </div>

                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                        onClick={() => navigate('/admin/exams')}
                      >
                        <span className="fw-semibold text-dark-emphasis">
                          <i className="fa-solid fa-file-pen me-2 text-warning"></i> Manage Exams
                        </span>
                        <i className="fa-solid fa-chevron-right small text-muted"></i>
                      </button>
                    </div>

                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                        onClick={() => navigate('/admin/grades')}
                      >
                        <span className="fw-semibold text-dark-emphasis">
                          <i className="fa-solid fa-chart-line me-2 text-danger"></i> View Grades
                        </span>
                        <i className="fa-solid fa-chevron-right small text-muted"></i>
                      </button>
                    </div>

                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-light border p-3 text-start d-flex align-items-center justify-content-between rounded-3 activity-btn w-100"
                        onClick={() => navigate('/admin/departments')}
                      >
                        <span className="fw-semibold text-dark-emphasis">
                          <i className="fa-solid fa-sitemap me-2 text-secondary"></i> Manage Departments
                        </span>
                        <i className="fa-solid fa-chevron-right small text-muted"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )
}
export default Body;