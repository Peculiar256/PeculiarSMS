import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import "./Subjects.css";

const API_BASE_URL = 'http://localhost:8080/api';

// Subject category options
const SUBJECT_CATEGORIES = [
  { value: 'LANGUAGES', label: 'Languages' },
  { value: 'MATHEMATICS', label: 'Mathematics' },
  { value: 'SCIENCES', label: 'Sciences' },
  { value: 'HUMANITIES', label: 'Humanities' },
  { value: 'RELIGIOUS_EDUCATION', label: 'Religious Education' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'VOCATIONAL', label: 'Vocational' },
  { value: 'CREATIVE_ARTS', label: 'Creative Arts' },
  { value: 'PHYSICAL_EDUCATION', label: 'Physical Education' },
];

// Subject level options
const SUBJECT_LEVELS = [
  { value: 'O_LEVEL', label: 'O-Level' },
  { value: 'A_LEVEL', label: 'A-Level' },
  { value: 'BOTH', label: 'Both' },
];

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "MATHEMATICS",
    level: "O_LEVEL",
    isCompulsory: true,
    isScience: false,
    isArts: false,
    paperCount: 1,
    maxMarksPerPaper: 100,
    creditUnits: 1,
    description: "",
    department: "",
    isActive: true,
  });

  // Fetch subjects from backend on component mount
  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/subjects`);
      console.log('Subjects API Response:', response.data);
      const subjectsArray = Array.isArray(response.data) ? response.data : [];
      setSubjects(subjectsArray);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects. Please try again.');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments from:', `${API_BASE_URL}/departments`);
      const response = await axios.get(`${API_BASE_URL}/departments`);
      console.log('Departments API Response:', response.data);
      console.log('Response type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      // Backend returns direct array or { success: true, data: [...], total: X }
      let departmentsData = [];
      
      if (Array.isArray(response.data)) {
        console.log('Response is direct array');
        departmentsData = response.data;
      } else if (response.data && typeof response.data === 'object' && response.data.data && Array.isArray(response.data.data)) {
        console.log('Extracting data from wrapped response');
        departmentsData = response.data.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        departmentsData = [];
      }
      
      // Filter for only valid departments with id and name
      const validDepartments = departmentsData.filter(d => d && d.id && d.name);
      console.log('Valid departments:', validDepartments);
      console.log('Departments count:', validDepartments.length);
      setDepartments(validDepartments);
    } catch (err) {
      console.error('Error fetching departments:', err);
      console.error('Error message:', err.message);
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      setDepartments([]);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSubjects = subjects.length;
    const activeSubjects = subjects.filter(s => s.isActive !== false).length;
    const compulsoryCount = subjects.filter((s) => s.isCompulsory === true).length;
    const electiveCount = subjects.filter((s) => s.isCompulsory === false).length;

    return { totalSubjects, activeSubjects, compulsoryCount, electiveCount };
  }, [subjects]);

  // Filter subjects
  const filteredSubjects = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return subjects.filter((subject) => {
      const isActive = subject.isActive !== false;
      const matchesSearch = subject.code.toLowerCase().includes(normalizedTerm) || 
                           subject.name.toLowerCase().includes(normalizedTerm);
      const matchesType = filterType === "all" || 
                         (filterType === "Compulsory" && subject.isCompulsory === true) ||
                         (filterType === "Elective" && subject.isCompulsory === false);

      return isActive && matchesSearch && matchesType;
    });
  }, [searchTerm, filterType, subjects]);

  // Pagination
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * subjectsPerPage;
    return filteredSubjects.slice(startIndex, startIndex + subjectsPerPage);
  }, [filteredSubjects, currentPage, subjectsPerPage]);

  const totalPages = Math.ceil(filteredSubjects.length / subjectsPerPage);

  // Handle add subject
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert("Please fill in required fields (Code and Name)");
      return;
    }

    setLoading(true);
    try {
      // Map department name/value to ID
      let departmentId = null;
      if (formData.department) {
        departmentId = parseInt(formData.department);
      }

      const subjectData = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        level: formData.level,
        isCompulsory: formData.isCompulsory,
        isScience: formData.isScience,
        isArts: formData.isArts,
        paperCount: parseInt(formData.paperCount) || 1,
        maxMarksPerPaper: parseInt(formData.maxMarksPerPaper) || 100,
        creditUnits: parseInt(formData.creditUnits) || 1,
        description: formData.description,
        departmentId: departmentId,
        isActive: formData.isActive,
      };

      console.log('Submitting subject:', subjectData);
      await axios.post(`${API_BASE_URL}/subjects`, subjectData);
      console.log('Subject created successfully');
      
      // Refresh subjects list from backend
      await fetchSubjects();
      
      setIsAddModalOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error adding subject:', err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to add subject. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit subject
  const handleEditSubject = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      // Map department name/value to ID
      let departmentId = null;
      if (formData.department) {
        departmentId = parseInt(formData.department);
      }

      const subjectData = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        level: formData.level,
        isCompulsory: formData.isCompulsory,
        isScience: formData.isScience,
        isArts: formData.isArts,
        paperCount: parseInt(formData.paperCount) || 1,
        maxMarksPerPaper: parseInt(formData.maxMarksPerPaper) || 100,
        creditUnits: parseInt(formData.creditUnits) || 1,
        description: formData.description,
        departmentId: departmentId,
        isActive: formData.isActive,
      };

      await axios.put(`${API_BASE_URL}/subjects/${selectedSubject.id}`, subjectData);
      
      // Refresh subjects list from backend
      await fetchSubjects();

      setIsEditModalOpen(false);
      setSelectedSubject(null);
      setFormData({
        code: "",
        name: "",
        category: "MATHEMATICS",
        level: "O_LEVEL",
        isCompulsory: true,
        isScience: false,
        isArts: false,
        paperCount: 1,
        maxMarksPerPaper: 100,
        creditUnits: 1,
        description: "",
        department: "",
        isActive: true,
      });
      setError(null);
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to update subject. Please try again.');
      }
      console.error('Error updating subject:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete subject
  const handleDeleteSubject = async () => {
    if (subjectToDelete) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/subjects/${subjectToDelete.id}`);
        
        // Refresh subjects list from backend
        await fetchSubjects();
        
        setIsDeleteConfirmModalOpen(false);
        setSubjectToDelete(null);
        setError(null);
      } catch (err) {
        if (err.response?.data?.message) {
          alert(`Error: ${err.response.data.message}`);
        } else {
          alert('Failed to delete subject. Please try again.');
        }
        console.error('Error deleting subject:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Open edit modal
  const openEditModal = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      category: subject.category || "MATHEMATICS",
      level: subject.level || "O_LEVEL",
      isCompulsory: subject.isCompulsory !== false,
      isScience: subject.isScience || false,
      isArts: subject.isArts || false,
      paperCount: subject.paperCount || 1,
      maxMarksPerPaper: subject.maxMarksPerPaper || 100,
      creditUnits: subject.creditUnits || 1,
      description: subject.description || "",
      department: subject.department || "",
      isActive: subject.isActive !== false,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteConfirmModal = (subject) => {
    setSubjectToDelete(subject);
    setIsDeleteConfirmModalOpen(true);
  };

  return (
    <div className="subjects-page p-4">
      <div className="subjects-header mb-4">
        <div>
          <h1 className="mb-2">Subjects Management</h1>
          <p className="text-muted mb-0">Manage subjects, assign categories, and view course information.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} disabled={loading}>
          <i className="fa-solid fa-plus me-2"></i> Add New Subject
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fa-solid fa-circle-exclamation me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="alert alert-info" role="alert">
          <i className="fa-solid fa-spinner me-2"></i> Processing...
        </div>
      )}

      {/* Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="subjects-card total-card">
            <div className="subjects-card-icon">
              <i className="fa-solid fa-book" aria-hidden="true"></i>
            </div>
            <div className="subjects-card-content">
              <h3>Total Subjects</h3>
              <h2>{metrics.totalSubjects}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="subjects-card active-card">
            <div className="subjects-card-icon">
              <i className="fa-solid fa-check-circle" aria-hidden="true"></i>
            </div>
            <div className="subjects-card-content">
              <h3>Active Subjects</h3>
              <h2>{metrics.activeSubjects}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="subjects-card compulsory-card">
            <div className="subjects-card-icon">
              <i className="fa-solid fa-book-open" aria-hidden="true"></i>
            </div>
            <div className="subjects-card-content">
              <h3>Compulsory</h3>
              <h2>{metrics.compulsoryCount}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="subjects-card elective-card">
            <div className="subjects-card-icon">
              <i className="fa-solid fa-graduation-cap" aria-hidden="true"></i>
            </div>
            <div className="subjects-card-content">
              <h3>Elective</h3>
              <h2>{metrics.electiveCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects List Tab */}
      <div className="card">
        <div className="card-body">
          <h2 className="mb-4 fs-5">Subjects Overview</h2>

          {/* Filters */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-6">
              <div className="subjects-search-wrapper">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search subject name or code"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-6">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Types</option>
                <option value="Compulsory">Compulsory</option>
                <option value="Elective">Elective</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubjects.length > 0 ? (
                  paginatedSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="fw-bold">{subject.code}</td>
                      <td>{subject.name}</td>
                      <td>
                        <span className={`badge ${subject.isCompulsory ? "bg-warning" : "bg-info"}`}>
                          {subject.isCompulsory ? "Compulsory" : "Elective"}
                        </span>
                      </td>
                      <td>
                        <small>{subject.category || 'N/A'}</small>
                      </td>
                      <td>
                        <span className={`badge ${subject.isActive ? "bg-success" : "bg-secondary"}`}>
                          {subject.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => {
                              setSelectedSubject(subject);
                              setIsDetailsModalOpen(true);
                            }}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => openEditModal(subject)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => openDeleteConfirmModal(subject)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      <i className="fas fa-inbox me-2"></i>No subjects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li key={index + 1} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Subject Details Modal */}
      {isDetailsModalOpen && selectedSubject && (
        <div className="subjects-modal-overlay">
          <div className="subjects-modal">
            <div className="subjects-modal-header">
              <h3>{selectedSubject.name} - Subject Details</h3>
              <button className="btn-close" onClick={() => setIsDetailsModalOpen(false)}></button>
            </div>
            <div className="subjects-modal-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Subject Information</h6>
                  <p><strong>Code:</strong> {selectedSubject.code}</p>
                  <p><strong>Name:</strong> {selectedSubject.name}</p>
                  <p><strong>Type:</strong> <span className={`badge ${selectedSubject.isCompulsory ? "bg-warning" : "bg-info"}`}>{selectedSubject.isCompulsory ? "Compulsory" : "Elective"}</span></p>
                  <p><strong>Category:</strong> {selectedSubject.category || 'N/A'}</p>
                  <p><strong>Level:</strong> {selectedSubject.level || 'N/A'}</p>
                  <p><strong>Description:</strong> {selectedSubject.description || "No description"}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Subject Details</h6>
                  <p><strong>Paper Count:</strong> {selectedSubject.paperCount || 1}</p>
                  <p><strong>Max Marks per Paper:</strong> {selectedSubject.maxMarksPerPaper || 100}</p>
                  <p><strong>Credit Units:</strong> {selectedSubject.creditUnits || 1}</p>
                  <p><strong>Department:</strong> {selectedSubject.department || 'N/A'}</p>
                  <p><strong>Is Science:</strong> {selectedSubject.isScience ? "Yes" : "No"}</p>
                  <p><strong>Is Arts:</strong> {selectedSubject.isArts ? "Yes" : "No"}</p>
                  <p><strong>Status:</strong> <span className={`badge ${selectedSubject.isActive ? "bg-success" : "bg-secondary"}`}>{selectedSubject.isActive ? "Active" : "Inactive"}</span></p>
                </div>
              </div>
            </div>
            <div className="subjects-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalOpen && subjectToDelete && (
        <div className="subjects-modal-overlay">
          <div className="subjects-modal" style={{ maxWidth: "400px" }}>
            <div className="subjects-modal-header">
              <h3>Delete Subject</h3>
              <button className="btn-close" onClick={() => {
                setIsDeleteConfirmModalOpen(false);
                setSubjectToDelete(null);
              }}></button>
            </div>
            <div className="subjects-modal-body">
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Warning!</strong> This action cannot be undone.
              </div>
              <p>Are you sure you want to delete the subject <strong>{subjectToDelete.name}</strong> ({subjectToDelete.code})?</p>
              <p className="text-muted mb-0">All associated data will be permanently removed.</p>
            </div>
            <div className="subjects-modal-footer">
              <button className="btn btn-secondary" onClick={() => {
                setIsDeleteConfirmModalOpen(false);
                setSubjectToDelete(null);
              }}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteSubject}>
                <i className="fas fa-trash me-2"></i> Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="subjects-modal-overlay">
          <div className="subjects-modal">
            <div className="subjects-modal-header">
              <h3>Add New Subject</h3>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}></button>
            </div>
            <div className="subjects-modal-body">
              <form className="row g-3" onSubmit={handleAddSubject}>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Subject Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., MTH"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    maxLength="10"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Subject Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Mathematics"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength="100"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {SUBJECT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Level *</label>
                  <select
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                  >
                    {SUBJECT_LEVELS.map(lvl => (
                      <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Type</label>
                  <select
                    className="form-select"
                    value={formData.isCompulsory ? "Compulsory" : "Elective"}
                    onChange={(e) => setFormData({ ...formData, isCompulsory: e.target.value === "Compulsory" })}
                  >
                    <option value="Compulsory">Compulsory</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select a Department</option>
                    {Array.isArray(departments) && departments.length > 0 ? (
                      departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))
                    ) : (
                      <option disabled>No departments available</option>
                    )}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Paper Count</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.paperCount}
                    onChange={(e) => setFormData({ ...formData, paperCount: e.target.value })}
                    min="1"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Max Marks/Paper</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.maxMarksPerPaper}
                    onChange={(e) => setFormData({ ...formData, maxMarksPerPaper: e.target.value })}
                    min="1"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Credit Units</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.creditUnits}
                    onChange={(e) => setFormData({ ...formData, creditUnits: e.target.value })}
                    min="1"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Subject description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength="500"
                    rows="2"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold mb-3 d-block">Subject Attributes</label>
                  <div className="row g-3 ps-3">
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isScience"
                          checked={formData.isScience}
                          onChange={(e) => setFormData({ ...formData, isScience: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isScience">
                          Is Science
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isArts"
                          checked={formData.isArts}
                          onChange={(e) => setFormData({ ...formData, isArts: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isArts">
                          Is Arts
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="subjects-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)} disabled={loading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddSubject} disabled={loading}>
                <i className="fas fa-plus me-2"></i> {loading ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditModalOpen && selectedSubject && (
        <div className="subjects-modal-overlay">
          <div className="subjects-modal">
            <div className="subjects-modal-header">
              <h3>Edit Subject</h3>
              <button className="btn-close" onClick={() => setIsEditModalOpen(false)}></button>
            </div>
            <div className="subjects-modal-body">
              <form className="row g-3" onSubmit={handleEditSubject}>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Subject Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    maxLength="10"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Subject Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength="100"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {SUBJECT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Level *</label>
                  <select
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                  >
                    {SUBJECT_LEVELS.map(lvl => (
                      <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Type</label>
                  <select
                    className="form-select"
                    value={formData.isCompulsory ? "Compulsory" : "Elective"}
                    onChange={(e) => setFormData({ ...formData, isCompulsory: e.target.value === "Compulsory" })}
                  >
                    <option value="Compulsory">Compulsory</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select a Department</option>
                    {Array.isArray(departments) && departments.length > 0 ? (
                      departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))
                    ) : (
                      <option disabled>No departments available</option>
                    )}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Paper Count</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.paperCount}
                    onChange={(e) => setFormData({ ...formData, paperCount: e.target.value })}
                    min="1"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Max Marks/Paper</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.maxMarksPerPaper}
                    onChange={(e) => setFormData({ ...formData, maxMarksPerPaper: e.target.value })}
                    min="1"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Credit Units</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.creditUnits}
                    onChange={(e) => setFormData({ ...formData, creditUnits: e.target.value })}
                    min="1"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength="500"
                    rows="2"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold mb-3 d-block">Subject Attributes</label>
                  <div className="row g-3 ps-3">
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="editIsScience"
                          checked={formData.isScience}
                          onChange={(e) => setFormData({ ...formData, isScience: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="editIsScience">
                          Is Science
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="editIsArts"
                          checked={formData.isArts}
                          onChange={(e) => setFormData({ ...formData, isArts: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="editIsArts">
                          Is Arts
                        </label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="editIsActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="editIsActive">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="subjects-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)} disabled={loading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditSubject} disabled={loading}>
                <i className="fas fa-save me-2"></i> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subjects;
