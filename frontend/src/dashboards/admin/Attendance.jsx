import React, { useMemo, useState, useEffect } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Attendance.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API_BASE_URL = "http://localhost:8080/api";

const statusLabel = {
  present: "PRESENT",
  absent: "ABSENT",
  late: "LATE",
  unknown: "UNKNOWN",
};

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalRecords, setOriginalRecords] = useState([]);
  const [viewMode, setViewMode] = useState("analytics"); // NEW: Toggle between analytics and table

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents();
    fetchAttendanceForToday();
  }, [selectedDate, classFilter]);

  // Fetch all students from backend
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      const studentList = (data.students || []).map((student) => ({
        id: student.id,
        studentId: student.student_id || student.studentId || `STU${student.id}`,
        name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        className: student.currentClass || student.className || "Unassigned",
        classId: student.schoolClass?.id || student.class_id,
      }));
      setStudents(studentList);

      // Extract unique classes
      const uniqueClasses = [...new Set(studentList.map((s) => s.className))].filter(c => c !== "Unassigned").sort();
      setClasses(uniqueClasses);
      console.log("Students loaded:", studentList);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students");
    }
  };

  // Fetch attendance for selected date
  const fetchAttendanceForToday = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/students`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();

      // Filter by class if selected
      let filteredStudents = (data.students || []);
      if (classFilter !== "all") {
        filteredStudents = filteredStudents.filter((s) => (s.currentClass || s.className) === classFilter);
      }

      // Create attendance records for today (default to present)
      const attendanceRecords = filteredStudents.map((student) => ({
        id: `${student.id}-${selectedDate}`,
        studentId: student.student_id || student.studentId || `STU${student.id}`,
        studentDatabaseId: student.id,
        student: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        className: student.currentClass || student.className || "Unassigned",
        status: "unknown", // Default status
        date: selectedDate,
      }));

      setRecords(attendanceRecords);
      setOriginalRecords(JSON.parse(JSON.stringify(attendanceRecords))); // Deep copy for comparison
      setHasChanges(false);
      setError("");
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const present = records.filter((row) => row.status === "present").length;
    const absent = records.filter((row) => row.status === "absent").length;
    const late = records.filter((row) => row.status === "late").length;
    const total = records.length;
    const attendanceRate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : "0.0";

    return { present, absent, late, attendanceRate, total };
  }, [records]);

  const classOptions = useMemo(() => {
    const uniqueClasses = [...new Set(students.map((s) => s.className))].sort();
    return uniqueClasses;
  }, [students]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        record.student.toLowerCase().includes(query) || 
        record.studentId.toLowerCase().includes(query);
      const matchesClass = classFilter === "all" || record.className === classFilter;
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [searchTerm, classFilter, statusFilter, records]);

  const chartData = {
    labels: ["Present", "Absent", "Late", "Unknown"],
    datasets: [
      {
        label: `Attendance for ${selectedDate}`,
        data: [totals.present, totals.absent, totals.late, totals.total - (totals.present + totals.absent + totals.late)],
        backgroundColor: ["#16a34a", "#dc2626", "#f59e0b", "#9ca3af"],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y", // Horizontal bar chart
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const handleMarkStatus = (recordId, newStatus) => {
    // Update local state only - don't send to backend yet
    setRecords((prev) => {
      const updated = prev.map((record) =>
        record.id === recordId ? { ...record, status: newStatus } : record
      );
      
      // Check if there are any changes from original
      const changed = JSON.stringify(updated) !== JSON.stringify(originalRecords);
      setHasChanges(changed);
      
      return updated;
    });
  };

  const handleSubmitAttendance = async () => {
    try {
      setSaving(true);
      
      // Get current academic year and term
      const currentYear = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const academicYear = month >= 1 && month <= 6 ? `${currentYear - 1}/${currentYear}` : `${currentYear}/${currentYear + 1}`;
      const term = month >= 1 && month <= 4 ? 1 : month >= 5 && month <= 8 ? 2 : 3;
      
      // Prepare bulk attendance records - only submit records with changes
      const attendanceRecords = records.map((record) => ({
        studentId: record.studentDatabaseId,
        className: record.className,
        status: record.status.toUpperCase(),
        date: selectedDate,
        academicYear: academicYear,
        term: term,
        remarks: "",
      }));

      // Send bulk attendance to backend
      const response = await fetch(`${API_BASE_URL}/attendance/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceRecords),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit attendance");
      }

      const result = await response.json();
      
      // Update original records to reflect saved state
      setOriginalRecords(JSON.parse(JSON.stringify(records)));
      setHasChanges(false);
      setError("");
      
      console.log("Attendance submitted successfully:", result);
      alert(`Attendance submitted successfully for ${records.length} student(s)`);
    } catch (err) {
      console.error("Error submitting attendance:", err);
      setError(`Failed to submit attendance: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetAttendance = () => {
    if (window.confirm("Are you sure you want to discard all changes?")) {
      setRecords(JSON.parse(JSON.stringify(originalRecords)));
      setHasChanges(false);
      setError("");
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      present: "Present",
      absent: "Absent",
      late: "Late",
      unknown: "Unknown",
    };
    return `attendance-badge ${status}`;
  };

  return (
    <div className="attendance-page p-4">
      <div className="attendance-header mb-4">
        <h1 className="mb-2">Attendance Tracker</h1>
        <p className="text-muted mb-0">Track, review, and manage student attendance records.</p>
        
        {/* NEW: View Toggle Buttons */}
        <div style={{marginTop: "16px", display: "flex", gap: "12px"}}>
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
            <i className="fa-solid fa-table"></i> Attendance Table
          </button>
        </div>
      </div>

      {/* ANALYTICS VIEW */}
      {viewMode === "analytics" && (
        <>
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="attendance-card present-card">
            <i className="fa-solid fa-user-check attendance-icon" style={{border:"1px solid #16a34a", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#16a34a",marginBottom:"5px"}} aria-hidden="true"></i>
            <h3>Present</h3>
            <h2>{totals.present}</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="attendance-card absent-card">
            <i className="fa-solid fa-user-xmark attendance-icon" style={{border:"1px solid #dc2626", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#dc2626",marginBottom:"5px"}} aria-hidden="true"></i>
            <h3>Absent</h3>
            <h2>{totals.absent}</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="attendance-card late-card">
            <i className="fa-solid fa-user-clock attendance-icon" style={{border:"1px solid #f59e0b", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#f59e0b",marginBottom:"5px"}} aria-hidden="true"></i>
            <h3>Late</h3>
            <h2>{totals.late}</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="attendance-card rate-card">
            <i className="fa-solid fa-chart-line attendance-icon" style={{border:"1px solid #2563eb", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#2563eb",marginBottom:"5px"}} aria-hidden="true"></i>
            <h3>Attendance Rate</h3>
            <h2>{totals.attendanceRate}%</h2>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="mb-3 fs-5">Daily Attendance Summary - {selectedDate}</h2>
          <div className="attendance-chart-box">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
        </>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
      <div className="card">
        <div className="card-body">
          <h2 className="mb-4 fs-5">Student Attendance Records</h2>

          {hasChanges && (
            <div style={{ 
              padding: "12px", 
              background: "#fff3cd", 
              color: "#856404", 
              marginBottom: "15px", 
              borderRadius: "4px",
              border: "1px solid #ffeeba"
            }}>
              <i className="fa-solid fa-exclamation-triangle" style={{ marginRight: "8px" }}></i>
              You have unsaved changes. Click <strong>Submit Attendance</strong> to save all records.
            </div>
          )}

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="attendance-search-wrapper">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by student name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <select 
                className="form-select" 
                value={classFilter} 
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mb-4" style={{ alignItems: "center" }}>
            <div className="col-12">
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetAttendance}
                  disabled={!hasChanges || saving}
                  style={{
                    padding: "8px 16px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: !hasChanges || saving ? "not-allowed" : "pointer",
                    opacity: !hasChanges || saving ? 0.5 : 1,
                  }}
                >
                  <i className="fa-solid fa-undo" style={{ marginRight: "6px" }}></i>
                  Reset Changes
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmitAttendance}
                  disabled={!hasChanges || saving}
                  style={{
                    padding: "8px 16px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: !hasChanges || saving ? "not-allowed" : "pointer",
                    opacity: !hasChanges || saving ? 0.5 : 1,
                  }}
                >
                  <i className="fa-solid fa-check" style={{ marginRight: "6px" }}></i>
                  {saving ? "Submitting..." : "Submit Attendance"}
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            {error && (
              <div style={{ padding: "15px", background: "#fee", color: "#c00", marginBottom: "15px", borderRadius: "4px" }}>
                {error}
              </div>
            )}
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i>
                Loading attendance records...
              </div>
            ) : (
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="fw-bold">{record.studentId}</td>
                        <td>{record.student}</td>
                        <td>{record.className}</td>
                        <td>
                          <span className={getStatusClass(record.status)}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              type="button" 
                              className="action-btn present-btn"
                              onClick={() => handleMarkStatus(record.id, "present")}
                              title="Mark Present"
                            >
                              <i className="fas fa-circle-check"></i>
                              <span className="action-label">Present</span>
                            </button>
                            <button 
                              type="button" 
                              className="action-btn absent-btn"
                              onClick={() => handleMarkStatus(record.id, "absent")}
                              title="Mark Absent"
                            >
                              <i className="fas fa-circle-xmark"></i>
                              <span className="action-label">Absent</span>
                            </button>
                            <button 
                              type="button" 
                              className="action-btn unknown-btn"
                              onClick={() => handleMarkStatus(record.id, "unknown")}
                              title="Mark Unknown"
                            >
                              <i className="fas fa-circle-question"></i>
                              <span className="action-label">Unknown</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-attendance-results text-center">
                        No attendance records match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Attendance;
