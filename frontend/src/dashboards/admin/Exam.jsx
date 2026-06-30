import React, { useMemo, useState, useEffect } from "react";
import "./Exam.css";
import "./AdminCards.css";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const API_BASE_URL = "http://localhost:8080/api";

function Exam() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [viewMode, setViewMode] = useState("table"); // Toggle between table and analytics

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "BOT",
    academicYear: new Date().getFullYear().toString(),
    term: "1",
    targetClasses: [],
    level: "O_LEVEL",
    startDate: "",
    endDate: "",
  });

  // Fetch exams and classes from backend
  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/exams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const examsList = Array.isArray(data) ? data : (data.exams || data.data || []);
        setExams(examsList);
        console.log('✅ Exams loaded from backend:', examsList);
      } else {
        console.warn('⚠️ Failed to fetch exams, using empty list');
        setExams([]);
      }
    } catch (err) {
      console.error('❌ Error fetching exams:', err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const classList = Array.isArray(data) ? data : (data.classes || data.data || []);
        setClasses(classList);
        console.log('✅ Classes loaded from backend:', classList);
      } else {
        console.warn('⚠️ Failed to fetch classes');
        setClasses([]);
      }
    } catch (err) {
      console.error('❌ Error fetching classes:', err);
      setClasses([]);
    }
  };

  // Get unique filters
  // Calculate basic statistics from backend exams
  const statistics = useMemo(() => {
    return {
      totalExams: exams.length,
      passRate: 0, // Will be calculated later from results data
      failRate: 0,
      totalStudents: 0,
    };
  }, [exams]);

  // Chart data based on exam types
  const passFailChartData = {
    labels: ["BOT", "MOT", "EOT", "UCE", "UACE"],
    datasets: [
      {
        label: "Exam Count",
        data: [
          exams.filter(e => e.type === "BOT").length,
          exams.filter(e => e.type === "MOT").length,
          exams.filter(e => e.type === "EOT").length,
          exams.filter(e => e.type === "UCE").length,
          exams.filter(e => e.type === "UACE").length,
        ],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"],
        borderColor: ["#1e40af", "#6d28d9", "#d97706", "#dc2626", "#374151"],
        borderWidth: 2,
      },
    ],
  };

  // Grade distribution by level
  const gradeChartData = {
    labels: ["O_LEVEL", "A_LEVEL"],
    datasets: [
      {
        label: "Exam Count by Level",
        data: [
          exams.filter(e => e.level === "O_LEVEL").length,
          exams.filter(e => e.level === "A_LEVEL").length,
        ],
        backgroundColor: ["#10b981", "#f59e0b"],
        borderColor: ["#059669", "#d97706"],
        borderWidth: 2,
      },
    ],
  };

  const handleAddExam = async () => {
    if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
      setMessage("Please fill in all required fields (Exam Code, Name, Start Date, End Date)");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');

      const payload = {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        academicYear: formData.academicYear,
        term: parseInt(formData.term),
        targetClasses: formData.targetClasses,
        level: formData.level,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: "DRAFT",
      };

      console.log('📤 Creating exam:', payload);

      const response = await fetch(`${API_BASE_URL}/exams`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to create exam");
      }

      const newExam = await response.json();
      
      setExams([...exams, newExam]);
      setMessage(`✅ Exam "${formData.name}" created successfully!`);
      setMessageType("success");
      
      console.log("✅ Exam created:", newExam);
      
      setIsAddModalOpen(false);
      setFormData({
        code: "",
        name: "",
        type: "BOT",
        academicYear: new Date().getFullYear().toString(),
        term: "1",
        targetClasses: [],
        level: "O_LEVEL",
        startDate: "",
        endDate: "",
      });
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Failed to create exam: ${err.message}`);
      setMessageType("error");
      console.error("Error creating exam:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');
      const newActive = selectedExam.isActive === false;

      const response = await fetch(`${API_BASE_URL}/exams/${selectedExam.id}/status?active=${newActive}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to update exam status");
      }

      setExams(exams.map(e => e.id === selectedExam.id ? { ...e, isActive: newActive } : e));
      setMessage(`✅ Exam ${newActive ? 'activated' : 'deactivated'} successfully!`);
      setMessageType("success");
      setIsStatusModalOpen(false);
      setSelectedExam(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Failed to update status: ${err.message}`);
      setMessageType("error");
      console.error("Error toggling status:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusModal = (exam) => {
    setSelectedExam(exam);
    setIsStatusModalOpen(true);
  };

  const handleEditExam = async () => {
    if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
      setMessage("Please fill in all required fields (Exam Code, Name, Start Date, End Date)");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');

      const payload = {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        academicYear: formData.academicYear,
        term: parseInt(formData.term),
        targetClasses: formData.targetClasses,
        level: formData.level,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      const response = await fetch(`${API_BASE_URL}/exams/${selectedExam.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to update exam");
      }

      const updatedExam = await response.json();
      setExams(exams.map(e => e.id === selectedExam.id ? updatedExam : e));
      setMessage(`✅ Exam "${formData.name}" updated successfully!`);
      setMessageType("success");
      setIsEditModalOpen(false);
      setSelectedExam(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`❌ Failed to update exam: ${err.message}`);
      setMessageType("error");
      console.error("Error updating exam:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (exam) => {
    setSelectedExam(exam);
    setFormData({
      code: exam.code || "",
      name: exam.name || "",
      type: exam.type || "BOT",
      academicYear: exam.academicYear || new Date().getFullYear().toString(),
      term: exam.term ? exam.term.toString() : "1",
      targetClasses: exam.targetClasses || [],
      level: exam.level || "O_LEVEL",
      startDate: exam.startDate ? exam.startDate.split('T')[0] : "",
      endDate: exam.endDate ? exam.endDate.split('T')[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h1>Exam Management</h1>
        <p>Create, manage, and analyze exam results</p>
        
        {/* View Toggle Buttons - Table first, Analytics second */}
        <div style={{marginTop: "16px", display: "flex", gap: "12px"}}>
          <button
            onClick={() => setViewMode("table")}
            style={{
              padding: "10px 20px",
              background: viewMode === "table" ? "#667eea" : "#e2e8f0",
              color: viewMode === "table" ? "white" : "#334155",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <i className="fa-solid fa-table"></i> Exams Table
          </button>
          <button
            onClick={() => setViewMode("analytics")}
            style={{
              padding: "10px 20px",
              background: viewMode === "analytics" ? "#667eea" : "#e2e8f0",
              color: viewMode === "analytics" ? "white" : "#334155",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <i className="fa-solid fa-chart-bar"></i> Analytics
          </button>
        </div>
      </div>

      {/* Message Notification */}
      {message && (
        <div className={`message-notification message-${messageType}`}>
          <span>{message}</span>
          <button className="close-notification" onClick={() => setMessage('')}>×</button>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {viewMode === "analytics" && (
        <>
      {/* Statistics Cards */}
      <section className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon classes">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-info">
            <h3>Total Exams</h3>
            <p>{statistics.totalExams}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon student">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Pass Rate</h3>
            <p>{statistics.passRate}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rooms">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Fail Rate</h3>
            <p>{statistics.failRate}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teacher">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <p>{statistics.totalStudents}</p>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="exam-analytics">
        <div className="analytics-card">
          <h3>Pass/Fail Rate</h3>
          <div className="chart-container">
            <Pie data={passFailChartData} options={chartOptions} />
          </div>
        </div>

        <div className="analytics-card">
          <h3>Grade Distribution</h3>
          <div className="chart-container">
            <Bar data={gradeChartData} options={chartOptions} />
          </div>
        </div>
      </section>
        </>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <>
          <section className="exam-filters-section">
        <div className="exam-header-actions">
          <h2>Exams List</h2>
          <button className="btn btn-success" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus me-2"></i> Add New Exam
          </button>
        </div>

        <div className="exam-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search exam code, name, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </section>

      {/* Exams Table */}
      <section className="exam-table-section">
        {loading ? (
          <div className="loading-spinner">
            <p>Loading exams...</p>
          </div>
        ) : (
          <table className="exam-table">
            <thead>
              <tr>
                <th>Exam Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Level</th>
                <th>Term</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Active Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <tr key={exam.id || exam.code}>
                    <td className="exam-code">{exam.code || '-'}</td>
                    <td className="exam-name">{exam.name || '-'}</td>
                    <td>{exam.type || '-'}</td>
                    <td>{exam.level || '-'}</td>
                    <td>{exam.term ? `Term ${exam.term}` : '-'}</td>
                    <td>{exam.startDate ? new Date(exam.startDate).toLocaleDateString() : '-'}</td>
                    <td>{exam.endDate ? new Date(exam.endDate).toLocaleDateString() : '-'}</td>
<td>
                      <span className={`badge ${exam.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                        {exam.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsDetailsModalOpen(true);
                          }}
                          title="View Details"
                          style={{ padding: '5px 10px' }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => openEditModal(exam)}
                          title="Edit"
                          style={{ padding: '5px 10px' }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className={`btn ${exam.isActive !== false ? 'btn-danger' : 'btn-success'} btn-sm`}
                          onClick={() => openStatusModal(exam)}
                          title={exam.isActive !== false ? 'Deactivate' : 'Activate'}
                          style={{ padding: '5px 10px', minWidth: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <i className={`fas ${exam.isActive !== false ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    <i className="fas fa-inbox me-2"></i>No exams found. Create a new exam to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
        </>
      )}

      {/* Add Exam Modal */}
      {isAddModalOpen && (
        <div className="exam-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="exam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <h3>Add New Exam</h3>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="exam-modal-body">
              <div className="form-group">
                <label>Exam Code * (e.g., BOT1-2024-S1)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., BOT1-2024"
                />
              </div>
              <div className="form-group">
                <label>Exam Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Beginning of Term Exam 2024"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Exam Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="BOT">BOT (Beginning of Term)</option>
                    <option value="MOT">MOT (Middle of Term)</option>
                    <option value="EOT">EOT (End of Term)</option>
                    <option value="UCE">UCE (National O-Level)</option>
                    <option value="UACE">UACE (National A-Level)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Level *</label>
                  <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                    <option value="O_LEVEL">O-Level</option>
                    <option value="A_LEVEL">A-Level</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Academic Year *</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
                <div className="form-group">
                  <label>Term *</label>
                  <select value={formData.term} onChange={(e) => setFormData({ ...formData, term: e.target.value })}>
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                    <option value="3">Term 3</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Target Classes * (Select one or more)</label>
                <div className="classes-checklist">
                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <div key={cls.id || cls.name} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`class-${cls.id || cls.name}`}
                          checked={formData.targetClasses.includes(cls.name || cls.code)}
                          onChange={(e) => {
                            const classValue = cls.name || cls.code;
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                targetClasses: [...formData.targetClasses, classValue]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targetClasses: formData.targetClasses.filter(c => c !== classValue)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`class-${cls.id || cls.name}`}>
                          {cls.name || cls.code}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No classes available. Please create classes first.</p>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setMessage('');
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleAddExam}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Add Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* STATUS TOGGLE MODAL */}
      {isStatusModalOpen && selectedExam && (
        <div className="exam-modal-overlay" onClick={() => setIsStatusModalOpen(false)}>
          <div className="exam-modal" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <h3>{selectedExam.isActive !== false ? 'Deactivate' : 'Activate'} Exam</h3>
              <button className="btn-close" onClick={() => setIsStatusModalOpen(false)}>×</button>
            </div>
            <div className="exam-modal-body py-4" style={{ padding: '20px' }}>
              <p>Are you sure you want to <strong>{selectedExam.isActive !== false ? 'deactivate' : 'activate'}</strong> the exam <strong>{selectedExam.name}</strong>?</p>
              {selectedExam.isActive !== false ? (
                <p className="text-muted small">Deactivating an exam hides it from general view but preserves all marks and results data.</p>
              ) : (
                <p className="text-muted small">This will make the exam active again for mark entry and reports.</p>
              )}
            </div>
            <div className="exam-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>Cancel</button>
              <button 
                className={`btn ${selectedExam.isActive !== false ? 'btn-danger' : 'btn-success'}`} 
                onClick={handleToggleStatus}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : (selectedExam.isActive !== false ? 'Deactivate' : 'Activate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Details Modal */}
      {isDetailsModalOpen && selectedExam && (
        <div className="exam-modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="exam-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <h3>{selectedExam.name} - Exam Details</h3>
              <button className="btn-close" onClick={() => setIsDetailsModalOpen(false)}>×</button>
            </div>
            <div className="exam-modal-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Exam Information</h6>
                  <p><strong>Exam Code:</strong> {selectedExam.code || '-'}</p>
                  <p><strong>Exam Name:</strong> {selectedExam.name || '-'}</p>
                  <p><strong>Type:</strong> {selectedExam.type || '-'}</p>
                  <p><strong>Level:</strong> {selectedExam.level || '-'}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Schedule & Status</h6>
                  <p><strong>Academic Year:</strong> {selectedExam.academicYear || '-'}</p>
                  <p><strong>Term:</strong> {selectedExam.term ? `Term ${selectedExam.term}` : '-'}</p>
                  <p><strong>Start Date:</strong> {selectedExam.startDate ? new Date(selectedExam.startDate).toLocaleDateString() : '-'}</p>
                  <p><strong>End Date:</strong> {selectedExam.endDate ? new Date(selectedExam.endDate).toLocaleDateString() : '-'}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <h6 className="fw-bold mb-3">Target Classes</h6>
                  <p>{selectedExam.targetClasses && selectedExam.targetClasses.length > 0 ? selectedExam.targetClasses.join(', ') : 'No classes assigned'}</p>
                </div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {isEditModalOpen && selectedExam && (
        <div className="exam-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="exam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <h3>Edit Exam</h3>
              <button className="btn-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className="exam-modal-body">
              <div className="form-group">
                <label>Exam Code * (e.g., BOT1-2024-S1)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., BOT1-2024"
                />
              </div>
              <div className="form-group">
                <label>Exam Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Beginning of Term Exam 2024"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Exam Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="BOT">BOT (Beginning of Term)</option>
                    <option value="MOT">MOT (Middle of Term)</option>
                    <option value="EOT">EOT (End of Term)</option>
                    <option value="UCE">UCE (National O-Level)</option>
                    <option value="UACE">UACE (National A-Level)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Level *</label>
                  <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                    <option value="O_LEVEL">O-Level</option>
                    <option value="A_LEVEL">A-Level</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Academic Year *</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
                <div className="form-group">
                  <label>Term *</label>
                  <select value={formData.term} onChange={(e) => setFormData({ ...formData, term: e.target.value })}>
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                    <option value="3">Term 3</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Target Classes * (Select one or more)</label>
                <div className="classes-checklist">
                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <div key={cls.id || cls.name} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`edit-class-${cls.id || cls.name}`}
                          checked={formData.targetClasses.includes(cls.name || cls.code)}
                          onChange={(e) => {
                            const classValue = cls.name || cls.code;
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                targetClasses: [...formData.targetClasses, classValue]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targetClasses: formData.targetClasses.filter(c => c !== classValue)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`edit-class-${cls.id || cls.name}`}>
                          {cls.name || cls.code}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No classes available. Please create classes first.</p>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setMessage('');
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleEditExam}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Exam;
