import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import "./Class.css";

const API_BASE_URL = 'http://localhost:8080/api';

const sampleTimetable = [
  { day: "Monday", time: "8:00-9:00", subject: "Mathematics", teacher: "Mr. Okello" },
  { day: "Monday", time: "9:00-10:00", subject: "English", teacher: "Ms. Nakiyingi" },
  { day: "Tuesday", time: "8:00-9:00", subject: "Science", teacher: "Mr. Johnson" },
  { day: "Tuesday", time: "9:00-10:00", subject: "History", teacher: "Ms. Naomi" },
  { day: "Wednesday", time: "8:00-9:00", subject: "Mathematics", teacher: "Mr. Okello" },
  { day: "Wednesday", time: "9:00-10:00", subject: "Physics", teacher: "Mr. Tumwesigye" },
  { day: "Thursday", time: "8:00-9:00", subject: "Chemistry", teacher: "Mr. Johnson" },
  { day: "Thursday", time: "9:00-10:00", subject: "English", teacher: "Ms. Nakiyingi" },
  { day: "Friday", time: "8:00-9:00", subject: "Biology", teacher: "Ms. Naomi" },
  { day: "Friday", time: "9:00-10:00", subject: "Mathematics", teacher: "Mr. Okello" },
];

function Class() {
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoom, setFilterRoom] = useState("all");
  const [selectedClass, setSelectedClass] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [classToToggle, setClassToToggle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(5);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    formLevel: 1,
    levelType: 'O_LEVEL',
    academicYear: '2025-2026',
    stream: '',
    roomId: '',
    notes: '',
  });

  // Fetch classes and rooms on component mount
  useEffect(() => {
    fetchClasses();
    fetchRooms();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/classes`);
      const classesData = Array.isArray(response.data) ? response.data : [];
      setClasses(classesData);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please try again.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms`);
      const roomsData = Array.isArray(response.data) ? response.data : [];
      setRooms(roomsData);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setRooms([]);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!Array.isArray(classes) || classes.length === 0) {
      return { totalClasses: 0, totalStudents: 0, avgAttendance: 0, totalRooms: 0 };
    }
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students || 0), 0);
    const totalAttendance = classes.reduce((sum, cls) => sum + (cls.attendance || 0), 0);
    const avgAttendance = (totalAttendance / classes.length).toFixed(1);
    const totalRooms = [...new Set(classes.map((cls) => cls.roomNumber || cls.classroom))].length;

    return { totalClasses, totalStudents, avgAttendance, totalRooms };
  }, [classes]);

  // Get unique room numbers
  const uniqueRooms = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    return [...new Set(classes.map((cls) => cls.roomNumber || cls.classroom || '').filter(Boolean))].sort();
  }, [classes]);

  // Filter classes
  const filteredClasses = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return classes.filter((cls) => {
      const matchesSearch = (cls.name || '').toLowerCase().includes(normalizedTerm) || (cls.roomNumber || cls.classroom || '').toLowerCase().includes(normalizedTerm);
      const matchesRoom = filterRoom === "all" || (cls.roomNumber || cls.classroom) === filterRoom;

      return matchesSearch && matchesRoom;
    });
  }, [searchTerm, filterRoom, classes]);

  // Pagination
  const paginatedClasses = useMemo(() => {
    const startIndex = (currentPage - 1) * classesPerPage;
    return filteredClasses.slice(startIndex, startIndex + classesPerPage);
  }, [filteredClasses, currentPage, classesPerPage]);

  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);

  // Handle add class
  const handleAddClass = async () => {
    if (!formData.name || !formData.formLevel || !formData.levelType || !formData.academicYear || !formData.roomId) {
      alert("Please fill in all required fields including selecting a room");
      return;
    }

    try {
      const selectedRoom = rooms.find(r => r.id === parseInt(formData.roomId));
      
      const classData = {
        name: formData.name,
        formLevel: parseInt(formData.formLevel),
        levelType: formData.levelType,
        academicYear: formData.academicYear,
        stream: formData.stream,
        classroom: selectedRoom?.roomNumber || '',
        building: selectedRoom?.building || '',
        maxCapacity: selectedRoom?.capacity || 50,
        notes: formData.notes,
        isActive: true,
      };

      const response = await axios.post(`${API_BASE_URL}/classes`, classData);
      
      setClasses([...classes, response.data]);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        formLevel: 1,
        levelType: 'O_LEVEL',
        academicYear: '2025-2026',
        stream: '',
        roomId: '',
        notes: '',
      });
      setError(null);
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to add class. Please try again.');
      }
      console.error('Error adding class:', err);
    }
  };

  // Handle edit class
  const handleEditClass = async () => {
    if (!formData.name || !formData.formLevel || !formData.levelType || !formData.academicYear || !formData.roomId) {
      alert("Please fill in all required fields including selecting a room");
      return;
    }

    try {
      const selectedRoom = rooms.find(r => r.id === parseInt(formData.roomId));
      
      const classData = {
        name: formData.name,
        formLevel: parseInt(formData.formLevel),
        levelType: formData.levelType,
        academicYear: formData.academicYear,
        stream: formData.stream,
        classroom: selectedRoom?.roomNumber || '',
        building: selectedRoom?.building || '',
        maxCapacity: selectedRoom?.capacity || 50,
        notes: formData.notes,
      };

      const response = await axios.put(`${API_BASE_URL}/classes/${selectedClass.id}`, classData);
      
      setClasses(
        classes.map((cls) =>
          cls.id === selectedClass.id ? response.data : cls
        )
      );

      setIsEditModalOpen(false);
      setSelectedClass(null);
      setFormData({
        name: '',
        formLevel: 1,
        levelType: 'O_LEVEL',
        academicYear: '2025-2026',
        stream: '',
        roomId: '',
        notes: '',
      });
      setError(null);
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to update class. Please try again.');
      }
      console.error('Error updating class:', err);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    if (classToToggle) {
      try {
        const newStatus = classToToggle.isActive === false;
        await axios.patch(`${API_BASE_URL}/classes/${classToToggle.id}/status?active=${newStatus}`);
        
        setClasses(classes.map((cls) => 
          cls.id === classToToggle.id ? { ...cls, isActive: newStatus } : cls
        ));
        setIsStatusModalOpen(false);
        setClassToToggle(null);
        setError(null);
      } catch (err) {
        if (err.response?.data?.message) {
          alert(`Error: ${err.response.data.message}`);
        } else {
          alert('Failed to update class status. Please try again.');
        }
        console.error('Error toggling class status:', err);
      }
    }
  };

  // Open status modal
  const openStatusModal = (cls) => {
    setClassToToggle(cls);
    setIsStatusModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (cls) => {
    setSelectedClass(cls);
    // Find room by classroom number
    const room = rooms.find(r => r.roomNumber === (cls.classroom || cls.roomNumber));
    setFormData({
      name: cls.name,
      formLevel: cls.formLevel || 1,
      levelType: cls.levelType || 'O_LEVEL',
      academicYear: cls.academicYear || cls.year,
      stream: cls.stream || '',
      roomId: room?.id?.toString() || '',
      notes: cls.notes || '',
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="class-page p-4">
      <div className="class-header mb-4">
        <div>
          <h1 className="mb-2">Class Management</h1>
          <p className="text-muted mb-0">Manage classes, students, schedules, and performance data.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} disabled={loading}>
          <i className="fa-solid fa-plus me-2"></i> Add New Class
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
          <i className="fa-solid fa-spinner me-2"></i> Loading classes...
        </div>
      )}

      {/* Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="class-card total-card h-100">
            <i className="fa-solid fa-layer-group class-icon" style={{border:"1px solid #2563eb", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#2563eb",marginBottom:"5px"}} aria-hidden="true"></i>
            <h3>Total Classes</h3>
            <h2>{metrics.totalClasses}</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="class-card students-card h-100">
            <i className="fa-solid fa-users class-icon" style={{border:"1px solid #16a34a", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#16a34a",marginBottom:"5px"}} aria-hidden="true"></i>
            <h3>Total Students</h3>
            <h2>{metrics.totalStudents}</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="class-card attendance-card h-100">
            <i className="fa-solid fa-chart-pie class-icon" style={{border:"1px solid #f59e0b", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#f59e0b",marginBottom:"5px"}} aria-hidden="true"></i>
            <h3>Avg Attendance</h3>
            <h2>{metrics.avgAttendance}%</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="class-card rooms-card h-100">
            <i className="fa-solid fa-door-open class-icon" style={{border:"1px solid #8b5cf6", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#8b5cf6",marginBottom:"5px"}} aria-hidden="true"></i>
            <h3>Total Rooms</h3>
            <h2>{metrics.totalRooms}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="class-tabs mb-4">
        <button className={`tab-btn ${selectedTab === "overview" ? "active" : ""}`} onClick={() => setSelectedTab("overview")}>
          <i className="fa-solid fa-list me-2"></i> Classes List
        </button>
        <button className={`tab-btn ${selectedTab === "timetable" ? "active" : ""}`} onClick={() => setSelectedTab("timetable")}>
          <i className="fa-solid fa-calendar me-2"></i> Timetable
        </button>
      </div>

      {/* Classes List Tab */}
      {selectedTab === "overview" && (
        <div className="card">
          <div className="card-body">
            <h2 className="mb-4 fs-5">Classes Overview</h2>

            {/* Filters */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6 col-lg-4">
                <div className="class-search-wrapper">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search class or room number"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <select
                  className="form-select"
                  value={filterRoom}
                  onChange={(e) => {
                    setFilterRoom(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Rooms</option>
                  {uniqueRooms.map((room) => (
                    <option key={room} value={room}>
                      Room {room}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Class Name</th>
                    <th>Room Number</th>
                    <th>Teacher</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClasses.length > 0 ? (
                    paginatedClasses.map((cls) => (
                      <tr key={cls.id}>
                        <td className="fw-bold">{cls.name}</td>
                        <td>{cls.roomNumber}</td>
                        <td>{cls.teacher}</td>
                        <td>{cls.students}</td>
                        <td>
                          <span className={`badge ${cls.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                            {cls.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => {
                                setSelectedClass(cls);
                                setIsDetailsModalOpen(true);
                              }}
                              title="View Details"
                              style={{ padding: '5px 10px' }}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => openEditModal(cls)}
                              title="Edit"
                              style={{ padding: '5px 10px' }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className={`btn ${cls.isActive !== false ? 'btn-danger' : 'btn-success'} btn-sm`}
                              onClick={() => openStatusModal(cls)}
                              title={cls.isActive !== false ? 'Deactivate' : 'Activate'}
                              style={{ padding: '5px 10px', minWidth: '38px' }}
                            >
                              <i className={`fas ${cls.isActive !== false ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No classes found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-4" aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>
                        {page}
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
      )}

      {/* Timetable Tab */}
      {selectedTab === "timetable" && (
        <div className="card">
          <div className="card-body">
            <h2 className="mb-4 fs-5">Weekly Timetable</h2>

            <div className="timetable-grid">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                <div key={day} className="timetable-day">
                  <div className="day-header">{day}</div>
                  {sampleTimetable
                    .filter((slot) => slot.day === day)
                    .map((slot, idx) => (
                      <div key={idx} className="timetable-slot">
                        <div className="slot-time">{slot.time}</div>
                        <div className="slot-subject">{slot.subject}</div>
                        <div className="slot-teacher">{slot.teacher}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {isDetailsModalOpen && selectedClass && (
        <div className="class-modal-overlay">
          <div className="class-modal">
            <div className="class-modal-header">
              <h3>{selectedClass.name} - Class Details</h3>
              <button className="btn-close" onClick={() => setIsDetailsModalOpen(false)}></button>
            </div>
            <div className="class-modal-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Class Information</h6>
                  <p><strong>Class Name:</strong> {selectedClass.name}</p>
                  <p><strong>Room Number:</strong> {selectedClass.roomNumber}</p>
                  <p><strong>Teacher:</strong> {selectedClass.teacher}</p>
                  <p><strong>Academic Year:</strong> {selectedClass.year}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Class Metrics</h6>
                  <p><strong>Total Students:</strong> {selectedClass.students}</p>
                  <p><strong>Attendance Rate:</strong> <span className="badge bg-success">{selectedClass.attendance}%</span></p>
                </div>
              </div>
            </div>
            <div className="class-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TOGGLE MODAL */}
      {isStatusModalOpen && classToToggle && (
        <div className="class-modal-overlay">
          <div className="class-modal" style={{ maxWidth: "400px" }}>
            <div className="class-modal-header">
              <h3>{classToToggle.isActive !== false ? 'Deactivate' : 'Activate'} Class</h3>
              <button className="btn-close" onClick={() => {
                setIsStatusModalOpen(false);
                setClassToToggle(null);
              }}></button>
            </div>
            <div className="class-modal-body">
              <p>Are you sure you want to <strong>{classToToggle.isActive !== false ? 'deactivate' : 'activate'}</strong> the class <strong>{classToToggle.name}</strong>?</p>
              {classToToggle.isActive !== false ? (
                <p className="text-muted small">Deactivating a class will archive its records for the current term.</p>
              ) : (
                <p className="text-muted small">This will restore the class to the active curriculum.</p>
              )}
            </div>
            <div className="class-modal-footer">
              <button className="btn btn-secondary" onClick={() => {
                setIsStatusModalOpen(false);
                setClassToToggle(null);
              }}>
                Cancel
              </button>
              <button 
                className={`btn ${classToToggle.isActive !== false ? 'btn-danger' : 'btn-success'}`} 
                onClick={handleToggleStatus}
              >
                {classToToggle.isActive !== false ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="class-modal-overlay">
          <div className="class-modal">
            <div className="class-modal-header">
              <h3>Add New Class</h3>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}></button>
            </div>
            <div className="class-modal-body">
              <form className="row g-3">
                {/* Required Fields Section */}
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-muted">Required Information</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Class Name * <small className="text-muted">(e.g., S1, S2, S3)</small></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="S1A, S2C, S3B, etc."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <small className="text-muted">Class name without stream</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Form Level *</label>
                  <select
                    className="form-select"
                    value={formData.formLevel}
                    onChange={(e) => setFormData({ ...formData, formLevel: e.target.value })}
                  >
                    <option value="">Select Form Level</option>
                    <option value="1">S.1 (Form 1)</option>
                    <option value="2">S.2 (Form 2)</option>
                    <option value="3">S.3 (Form 3)</option>
                    <option value="4">S.4 (Form 4)</option>
                    <option value="5">S.5 (Form 5)</option>
                    <option value="6">S.6 (Form 6)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Level Type *</label>
                  <select
                    className="form-select"
                    value={formData.levelType}
                    onChange={(e) => setFormData({ ...formData, levelType: e.target.value })}
                  >
                    <option value="O_LEVEL">O-Level (S1-S4)</option>
                    <option value="A_LEVEL">A-Level (S5-S6)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Academic Year *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 2025-2026"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  />
                </div>

                {/* Optional Fields Section */}
                <div className="col-12 mt-3">
                  <h6 className="fw-bold mb-3 text-muted">Additional Information</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Stream <small className="text-muted">(Optional)</small></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="A, B, East, West (or leave empty)"
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  />
                  {/* <small className="text-muted">Added to class name: S1 + A = S1A</small> */}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Classroom/Room *</label>
                  <select
                    className="form-select"
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  >
                    <option value="">-- Select Room --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber} - {room.roomName || 'Room'} ({room.building || 'N/A'})
                      </option>
                    ))}
                  </select>
                  {/* <small className="text-muted">Building and capacity auto-populated from room</small> */}
                </div>

                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    placeholder="Additional notes about this class"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                  />
                </div>
              </form>
            </div>
            <div className="class-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddClass} disabled={loading}>
                <i className="fas fa-plus me-2"></i> Create Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && selectedClass && (
        <div className="class-modal-overlay">
          <div className="class-modal">
            <div className="class-modal-header">
              <h3>Edit Class</h3>
              <button className="btn-close" onClick={() => setIsEditModalOpen(false)}></button>
            </div>
            <div className="class-modal-body">
              <form className="row g-3">
                {/* Required Fields Section */}
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-muted">Required Information</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Class Name * <small className="text-muted">(e.g., S1, S2, S3)</small></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <small className="text-muted">Class name without stream</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Form Level *</label>
                  <select
                    className="form-select"
                    value={formData.formLevel}
                    onChange={(e) => setFormData({ ...formData, formLevel: e.target.value })}
                  >
                    <option value="">Select Form Level</option>
                    <option value="1">S.1 (Form 1)</option>
                    <option value="2">S.2 (Form 2)</option>
                    <option value="3">S.3 (Form 3)</option>
                    <option value="4">S.4 (Form 4)</option>
                    <option value="5">S.5 (Form 5)</option>
                    <option value="6">S.6 (Form 6)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Level Type *</label>
                  <select
                    className="form-select"
                    value={formData.levelType}
                    onChange={(e) => setFormData({ ...formData, levelType: e.target.value })}
                  >
                    <option value="O_LEVEL">O-Level (S1-S4)</option>
                    <option value="A_LEVEL">A-Level (S5-S6)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Academic Year *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  />
                </div>

                {/* Optional Fields Section */}
                <div className="col-12 mt-3">
                  <h6 className="fw-bold mb-3 text-muted">Additional Information</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Stream <small className="text-muted">(Optional)</small></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  />
                  <small className="text-muted">Added to class name: S1 + A = S1A</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Classroom/Room *</label>
                  <select
                    className="form-select"
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  >
                    <option value="">-- Select Room --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber} - {room.roomName || 'Room'} ({room.building || 'N/A'})
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">Building and capacity auto-populated from room</small>
                </div>

                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                  />
                </div>
              </form>
            </div>
            <div className="class-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditClass} disabled={loading}>
                <i className="fas fa-save me-2"></i> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Class;
