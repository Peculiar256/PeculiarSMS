import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import './Department.css';
import './AdminCards.css';

const API_BASE_URL = 'http://localhost:8080/api';

function Department() {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentToToggle, setDepartmentToToggle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentCode: '',
    status: 'Active',
    building: '',
    floor: '',
    officeRoom: '',
    phoneNumber: '',
    email: '',
    academicFocus: '',
    visionStatement: '',
    missionStatement: '',
    establishedYear: new Date().getFullYear(),
    targetEnrollment: 100,
    minimumStaff: 3,
    isCoreDepartment: true,
  });

  // Fetch departments from backend on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      console.log('Department API Response:', response);
      console.log('Response Data:', response.data);
      
      // Backend returns { success: true, data: [...], total: X } or direct array
      let departmentsData = response.data;
      
      // If response has a data property that's an array, use it
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data) && response.data.data) {
        departmentsData = response.data.data;
      }
      
      const departmentsArray = Array.isArray(departmentsData) ? departmentsData : [];
      console.log('Final departments array:', departmentsArray);
      setDepartments(departmentsArray);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again.');
      setDepartments([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    console.log('Calculating metrics for departments:', departments);
    if (!Array.isArray(departments) || departments.length === 0) {
      return { totalDepartments: 0, activeDepartments: 0, inactiveDepartments: 0, suspendedDepartments: 0 };
    }
    
    const totalDepartments = departments.length;
    
    // Check what status values exist in the data
    const statusValues = departments.map(d => d.status);
    console.log('Status values in departments:', statusValues);
    
    // Case-insensitive comparison for each status
    const activeDepartments = departments.filter(d => {
      console.log(`Department "${d.name}" has status: "${d.status}"`);
      return d.status && d.status.toLowerCase() === 'active';
    }).length;

    const inactiveDepartments = departments.filter(d => {
      return d.status && d.status.toLowerCase() === 'inactive';
    }).length;

    const suspendedDepartments = departments.filter(d => {
      return d.status && d.status.toLowerCase() === 'suspended';
    }).length;
    
    console.log(`Total: ${totalDepartments}, Active: ${activeDepartments}, Inactive: ${inactiveDepartments}, Suspended: ${suspendedDepartments}`);

    return { totalDepartments, activeDepartments, inactiveDepartments, suspendedDepartments };
  }, [departments]);

  // Filter departments
  const filteredDepartments = useMemo(() => {
    if (!Array.isArray(departments)) {
      return [];
    }
    const term = searchTerm.toLowerCase();
    return departments.filter(dept => {
      if (!dept || !dept.name) return false;
      const matchesSearch = dept.name.toLowerCase().includes(term) ||
        (dept.departmentCode && dept.departmentCode.toLowerCase().includes(term)) ||
        (dept.academicFocus && dept.academicFocus.toLowerCase().includes(term));
      
      // Case-insensitive status comparison
      const matchesStatus = filterStatus === 'all' || 
        (dept.status && dept.status.toLowerCase() === filterStatus.toLowerCase());
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, departments]);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please fill in required fields (Department Name)');
      return;
    }

    try {
      const departmentData = {
        ...formData,
        establishedYear: parseInt(formData.establishedYear) || new Date().getFullYear(),
        targetEnrollment: parseInt(formData.targetEnrollment) || 100,
        minimumStaff: parseInt(formData.minimumStaff) || 3,
      };

      console.log('Submitting department:', departmentData);
      const response = await axios.post(`${API_BASE_URL}/departments`, departmentData);
      console.log('Department created successfully:', response.data);
      
      // Refresh departments list from backend
      console.log('Fetching updated departments...');
      await fetchDepartments();
      
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        description: '',
        departmentCode: '',
        status: 'Active',
        building: '',
        floor: '',
        officeRoom: '',
        phoneNumber: '',
        email: '',
        academicFocus: '',
        visionStatement: '',
        missionStatement: '',
        establishedYear: new Date().getFullYear(),
        targetEnrollment: 100,
        minimumStaff: 3,
        isCoreDepartment: true,
      });
      setError(null);
    } catch (err) {
      console.error('Error adding department:', err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to add department. Please try again.');
      }
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const departmentData = {
        ...formData,
        establishedYear: parseInt(formData.establishedYear) || new Date().getFullYear(),
        targetEnrollment: parseInt(formData.targetEnrollment) || 100,
        minimumStaff: parseInt(formData.minimumStaff) || 3,
      };

      await axios.put(`${API_BASE_URL}/departments/${selectedDepartment.id}`, departmentData);
      
      // Refresh departments list from backend
      await fetchDepartments();

      setIsEditModalOpen(false);
      setSelectedDepartment(null);
      setFormData({
        name: '',
        description: '',
        departmentCode: '',
        status: 'Active',
        building: '',
        floor: '',
        officeRoom: '',
        phoneNumber: '',
        email: '',
        academicFocus: '',
        visionStatement: '',
        missionStatement: '',
        establishedYear: new Date().getFullYear(),
        targetEnrollment: 100,
        minimumStaff: 3,
        isCoreDepartment: true,
      });
      setError(null);
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to update department. Please try again.');
      }
      console.error('Error updating department:', err);
    }
  };

  const handleToggleStatus = async () => {
    if (departmentToToggle) {
      setLoading(true);
      try {
        const isCurrentlyActive = departmentToToggle.status && departmentToToggle.status.toLowerCase() === 'active';
        const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
        
        await axios.patch(`${API_BASE_URL}/departments/${departmentToToggle.id}/status?active=${!isCurrentlyActive}`);
        
        // Refresh departments list from backend
        await fetchDepartments();
        
        setIsStatusModalOpen(false);
        setDepartmentToToggle(null);
        setError(null);
      } catch (err) {
        if (err.response?.data?.message) {
          alert(`Error: ${err.response.data.message}`);
        } else {
          alert('Failed to update department status. Please try again.');
        }
        console.error('Error toggling department status:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditModal = (dept) => {
    if (dept && dept.id) {
      setSelectedDepartment(dept);
      setFormData({ ...dept });
      setIsEditModalOpen(true);
    }
  };

  const openStatusModal = (dept) => {
    if (dept && dept.id) {
      setDepartmentToToggle(dept);
      setIsStatusModalOpen(true);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status && status.toLowerCase() === 'active') return 'badge bg-success';
    if (status && status.toLowerCase() === 'inactive') return 'badge bg-secondary';
    if (status && status.toLowerCase() === 'suspended') return 'badge bg-danger';
    return 'badge bg-warning';
  };

  return (
    <div className="department-page p-4">
      <div className="department-header mb-4">
        <div>
          <h1 className="mb-2">Department Management</h1>
          <p className="text-muted mb-0">Manage academic departments and their information.</p>
        </div>
        <button className="btn btn-success" onClick={() => setIsAddModalOpen(true)} disabled={loading}>
          <i className="fa-solid fa-plus me-2"></i> Add New Department
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
          <i className="fa-solid fa-spinner me-2"></i> Loading departments...
        </div>
      )}

      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon departments">
            <i className="fa-solid fa-building"></i>
          </div>
          <div className="stat-info">
            <h3>Total Departments</h3>
            <p>{metrics.totalDepartments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon attendance">
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Active</h3>
            <p>{metrics.activeDepartments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rooms">
            <i className="fa-solid fa-circle-pause"></i>
          </div>
          <div className="stat-info">
            <h3>Inactive</h3>
            <p>{metrics.inactiveDepartments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon student">
             <i className="fa-solid fa-ban"></i>
          </div>
          <div className="stat-info">
            <h3>Suspended</h3>
            <p>{metrics.suspendedDepartments}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="department-search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search department name or code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Department Name</th>
                  <th>Code</th>
                  <th>Academic Focus</th>
                  <th>Building</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map(dept => (
                    <tr key={dept.id}>
                      <td className="fw-bold">{dept.name}</td>
                      <td>{dept.departmentCode || '-'}</td>
                      <td>{dept.academicFocus || '-'}</td>
                      <td>{dept.building || '-'}</td>
                      <td>
                        <span className={getStatusBadgeClass(dept.status)}>
                          {dept.status}
                        </span>
                      </td>
                      <td>
                          <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setIsDetailsModalOpen(true);
                              }}
                              title="View Details"
                              style={{ padding: '5px 10px' }}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openEditModal(dept)}
                              title="Edit"
                              style={{ padding: '5px 10px' }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className={`btn ${dept.status && dept.status.toLowerCase() === 'active' ? 'btn-danger' : 'btn-success'} btn-sm`}
                              onClick={() => openStatusModal(dept)}
                              title={dept.status && dept.status.toLowerCase() === 'active' ? 'Deactivate' : 'Activate'}
                              style={{ padding: '5px 10px', minWidth: '38px' }}
                            >
                              <i className={`fas ${dept.status && dept.status.toLowerCase() === 'active' ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No departments found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department Details Modal */}
      {isDetailsModalOpen && selectedDepartment && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <h3>{selectedDepartment.name} - Department Details</h3>
              <button className="btn-close" onClick={() => setIsDetailsModalOpen(false)}></button>
            </div>
            <div className="department-modal-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Basic Information</h6>
                  <p><strong>Department Name:</strong> {selectedDepartment.name}</p>
                  <p><strong>Code:</strong> {selectedDepartment.departmentCode || '-'}</p>
                  <p><strong>Status:</strong> <span className={getStatusBadgeClass(selectedDepartment.status)}>{selectedDepartment.status}</span></p>
                  <p><strong>Established Year:</strong> {selectedDepartment.establishedYear || '-'}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Location & Contact</h6>
                  <p><strong>Building:</strong> {selectedDepartment.building || '-'}</p>
                  <p><strong>Floor:</strong> {selectedDepartment.floor || '-'}</p>
                  <p><strong>Office Room:</strong> {selectedDepartment.officeRoom || '-'}</p>
                  <p><strong>Phone:</strong> {selectedDepartment.phoneNumber || '-'}</p>
                  <p><strong>Email:</strong> {selectedDepartment.email || '-'}</p>
                </div>
              </div>
              {selectedDepartment.academicFocus && (
                <div className="mb-3">
                  <h6 className="fw-bold">Academic Focus</h6>
                  <p>{selectedDepartment.academicFocus}</p>
                </div>
              )}
              {selectedDepartment.description && (
                <div className="mb-3">
                  <h6 className="fw-bold">Description</h6>
                  <p>{selectedDepartment.description}</p>
                </div>
              )}
            </div>
            <div className="department-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <h3>Add New Department</h3>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}></button>
            </div>
            <div className="department-modal-body">
              <form className="row g-3" onSubmit={handleAddDepartment}>
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-muted">Required Information</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Department Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Mathematics"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-muted mt-2">Additional Information</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Department Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., MATH"
                    value={formData.departmentCode}
                    onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Established Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                    min="1950"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Academic Focus</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Pure and Applied Mathematics"
                    value={formData.academicFocus}
                    onChange={(e) => setFormData({ ...formData, academicFocus: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Department description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Building</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Science Block"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Floor</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 2"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Office Room</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Room 205"
                    value={formData.officeRoom}
                    onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+256 701 234567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="dept@school.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Target Enrollment</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.targetEnrollment}
                    onChange={(e) => setFormData({ ...formData, targetEnrollment: e.target.value })}
                    min="1"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Minimum Staff</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.minimumStaff}
                    onChange={(e) => setFormData({ ...formData, minimumStaff: e.target.value })}
                    min="1"
                  />
                </div>
              </form>
            </div>
            <div className="department-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleAddDepartment}>
                <i className="fas fa-plus me-2"></i> Create Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {isEditModalOpen && selectedDepartment && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <h3>Edit Department</h3>
              <button className="btn-close" onClick={() => setIsEditModalOpen(false)}></button>
            </div>
            <div className="department-modal-body">
              <form className="row g-3" onSubmit={handleEditDepartment}>
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-muted">Required Information</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Department Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-muted mt-2">Additional Information</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Department Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.departmentCode}
                    onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Established Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                    min="1950"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Academic Focus</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.academicFocus}
                    onChange={(e) => setFormData({ ...formData, academicFocus: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Building</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Floor</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Office Room</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.officeRoom}
                    onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Target Enrollment</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.targetEnrollment}
                    onChange={(e) => setFormData({ ...formData, targetEnrollment: e.target.value })}
                    min="1"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Minimum Staff</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.minimumStaff}
                    onChange={(e) => setFormData({ ...formData, minimumStaff: e.target.value })}
                    min="1"
                  />
                </div>
              </form>
            </div>
            <div className="department-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleEditDepartment}>
                <i className="fas fa-save me-2"></i> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TOGGLE MODAL */}
      {isStatusModalOpen && departmentToToggle && (
        <div className="department-modal-overlay">
          <div className="department-modal" style={{ maxWidth: "400px" }}>
            <div className="department-modal-header">
              <h3>{departmentToToggle.status && departmentToToggle.status.toLowerCase() === 'active' ? 'Deactivate' : 'Activate'} Department</h3>
              <button className="btn-close" onClick={() => {
                setIsStatusModalOpen(false);
                setDepartmentToToggle(null);
              }}></button>
            </div>
            <div className="department-modal-body py-4">
              <p>Are you sure you want to <strong>{departmentToToggle.status && departmentToToggle.status.toLowerCase() === 'active' ? 'deactivate' : 'activate'}</strong> the department <strong>{departmentToToggle.name}</strong>?</p>
              {departmentToToggle.status && departmentToToggle.status.toLowerCase() === 'active' ? (
                <p className="text-muted small">Deactivating a department preserves its history but hides it from current selection.</p>
              ) : (
                <p className="text-muted small">This will restore the department to active status.</p>
              )}
            </div>
            <div className="department-modal-footer">
              <button className="btn btn-secondary" onClick={() => {
                setIsStatusModalOpen(false);
                setDepartmentToToggle(null);
              }}>
                Cancel
              </button>
              <button 
                className={`btn ${departmentToToggle.status && departmentToToggle.status.toLowerCase() === 'active' ? 'btn-danger' : 'btn-success'}`} 
                onClick={handleToggleStatus}
                disabled={loading}
              >
                {loading ? 'Processing...' : (departmentToToggle.status && departmentToToggle.status.toLowerCase() === 'active' ? 'Deactivate' : 'Activate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Department;
