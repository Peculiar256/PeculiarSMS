import React, { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Grades.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Grades = () => {
  const [gradeRows, setGradeRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Fetch results from backend
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/results", {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const results = await response.json();
        
        // Map backend Result model to frontend format
        const mappedRows = results.map((result, index) => ({
          id: `RESULT-${result.id}`,
          student: result.studentNumber || `Student ${result.studentId}`, // Fallback to student ID
          className: result.className,
          average: result.percentage || 0,
          subject: result.subjectName || result.subjectCode,
          term: `term${result.term}`,
          grade: result.grade,
          gradePoints: result.gradePoints,
          remarks: result.remarks,
          marksObtained: result.marksObtained,
          maxMarks: result.maxMarks,
          examCode: result.examCode,
        }));

        setGradeRows(mappedRows);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.message || "Failed to load grades from server");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const getGradeLabel = (average) => {
    // Using Ugandan O-Level grading scale
    if (average >= 80) return "D1";  // Distinction
    if (average >= 70) return "D2";  // Distinction
    if (average >= 65) return "C3";  // Credit
    if (average >= 60) return "C4";  // Credit
    if (average >= 55) return "C5";  // Credit
    if (average >= 50) return "C6";  // Credit
    if (average >= 40) return "P7";  // Pass
    if (average >= 34) return "P8";  // Pass
    return "F9";                     // Fail
  };

  const getPerformanceLabel = (average) => {
    if (average >= 75) return "Excellent";
    if (average >= 65) return "Good";
    if (average >= 55) return "Satisfactory";
    if (average >= 50) return "Fair";
    if (average >= 34) return "Pass";
    return "Needs Support";
  };

  const handleAverageChange = (rowId, value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return;
    }

    const boundedValue = Math.max(0, Math.min(100, numericValue));
    setGradeRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, average: boundedValue } : row))
    );
  };

  const classAverage = useMemo(() => {
    if (gradeRows.length === 0) return 0;
    const sum = gradeRows.reduce((total, row) => total + row.average, 0);
    return Math.round(sum / gradeRows.length);
  }, [gradeRows]);

  const topPerformance = useMemo(() => {
    if (gradeRows.length === 0) return 0;
    return Math.max(...gradeRows.map((row) => row.average));
  }, [gradeRows]);

  const subjectsAssessed = useMemo(() => {
    return new Set(gradeRows.map((row) => row.subject)).size;
  }, [gradeRows]);

  const needSupportCount = useMemo(() => {
    return gradeRows.filter((row) => row.average < 50).length;
  }, [gradeRows]);

  // Calculate subject overview from actual data
  const subjectOverview = useMemo(() => {
    const subjectMap = {};
    gradeRows.forEach((row) => {
      if (!subjectMap[row.subject]) {
        subjectMap[row.subject] = { scores: [], count: 0 };
      }
      subjectMap[row.subject].scores.push(row.average);
    });

    return Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      score: Math.round(
        data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      ),
    }));
  }, [gradeRows]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return gradeRows.filter((row) => {
      const matchesSearch =
        row.student.toLowerCase().includes(query) || row.className.toLowerCase().includes(query);
      const matchesTerm = termFilter === "all" || row.term === termFilter;
      const matchesSubject =
        subjectFilter === "all" || row.subject.toLowerCase() === subjectFilter.toLowerCase();

      return matchesSearch && matchesTerm && matchesSubject;
    });
  }, [searchTerm, termFilter, subjectFilter, gradeRows]);

  const chartData = {
    labels: subjectOverview.map((item) => item.subject),
    datasets: [
      {
        label: "Average Score (%)",
        data: subjectOverview.map((item) => item.score),
        backgroundColor: ["#2563eb", "#0ea5e9", "#22c55e", "#f59e0b"],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="grades-page">
      <div className="grades-header">
        <h1>Manage Student Grades and Academic Performance</h1>
        <p>Review subject outcomes, track class trends, and support struggling learners.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          padding: "12px 16px",
          background: "#fee2e2",
          border: "1px solid #fca5a5",
          borderRadius: "6px",
          color: "#991b1b",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <i className="fa-solid fa-exclamation-circle" style={{ fontSize: "18px" }}></i>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#6b7280"
        }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "32px", marginBottom: "16px" }}></i>
          <p>Loading student grades...</p>
        </div>
      ) : (
        <>
          <div className="grades-cards">
        <div className="grades-card class-average">
          <div>
            <h3>Class Average</h3>
            <h2>{`${classAverage}%`}</h2>
          </div>
          <i className="fa-solid fa-chart-line grades-icon" style={{border:"1px solid #2c4ebb", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#2c4ebb",marginBottom:"5px"}} aria-hidden="true"></i>
        </div>

        <div className="grades-card top-performance">
          <div>
            <h3>Top Performance</h3>
            <h2>{topPerformance}</h2>
          </div>
          <i className="fa-solid fa-trophy grades-icon" style={{border:"1px solid #f59e0b", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#f59e0b",marginBottom:"5px"}} aria-hidden="true"></i>
        </div>

        <div className="grades-card subjects-assessed">
          <div>
            <h3>Subjects Assessed</h3>
            <h2>{subjectsAssessed}</h2>
          </div>
          <i className="fa-solid fa-book-open grades-icon" style={{border:"1px solid green", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"green",marginBottom:"5px"}} aria-hidden="true"></i>
        </div>

        <div className="grades-card need-support">
          <div>
            <h3>Need Support</h3>
            <h2>{needSupportCount}</h2>
          </div>
          <i className="fa-solid fa-triangle-exclamation grades-icon" style={{border:"1px solid #ef4444", borderRadius:"50%",width:"50px", height: "50px", fontSize:"15px", display:"grid", placeItems:"center", color:"#ef4444",marginBottom:"5px"}} aria-hidden="true"></i>
        </div>
      </div>

      <div className="grades-chart-panel">
        <h2>Subject Performance Overview</h2>
        <div className="grades-chart-box">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="grades-table-panel">
        <div className="grades-table-header">
          <h2>Student Results</h2>

          <div className="grades-filters">
            <div className="grades-search-wrapper">
              <input
                type="text"
                placeholder="Search student"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            </div>

            <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)}>
              <option value="all">All Terms</option>
              <option value="term1">Term 1</option>
              <option value="term2">Term 2</option>
              <option value="term3">Term 3</option>
            </select>

            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="all">All Subjects</option>
              {[...new Set(gradeRows.map(r => r.subject))].sort().map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grades-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Avarage</th>
                <th>Grades</th>
                <th>Subject</th>
                <th>Performance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.student}</td>
                    <td>{row.className}</td>
                    <td>{row.average}%</td>
                    <td><span style={{fontWeight: "600", color: "#667eea"}}>{row.grade || getGradeLabel(row.average)}</span></td>
                    <td>{row.subject}</td>
                    <td>{getPerformanceLabel(row.average)}</td>
                    <td>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {row.remarks && <p>{row.remarks}</p>}
                        <p style={{ fontSize: "11px" }}>Exam: {row.examCode || "N/A"}</p>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-grade-results">
                    No grade records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Grades;
