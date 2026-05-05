import React, { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import "./Grades.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

const Grades = () => {
  const [gradeRows, setGradeRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all"); // NEW: Class filter
  const [successMessage, setSuccessMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState("analytics"); // NEW: Toggle between analytics and table

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
        
        // Log the data structure to debug
        console.log("Results from backend:", results[0]);
        
        // Map backend Result model to frontend format
        const mappedRows = results.map((result, index) => ({
          id: `RESULT-${result.id}`,
          student: result.studentName || result.studentNumber || `Student ${result.studentId}`,
          studentId: result.studentNumber || result.studentId,
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
      const matchesClass = classFilter === "all" || row.className === classFilter;

      return matchesSearch && matchesTerm && matchesSubject && matchesClass;
    });
  }, [searchTerm, termFilter, subjectFilter, classFilter, gradeRows]);

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

  // NEW: Grade Distribution Chart Data
  const gradeDistributionData = useMemo(() => {
    const distribution = {
      'D1 (80-100)': 0,
      'D2 (70-79)': 0,
      'C3-C6 (50-69)': 0,
      'P7-P8 (34-49)': 0,
      'F9 (<34)': 0,
    };

    filteredRows.forEach((row) => {
      if (row.average >= 80) distribution['D1 (80-100)']++;
      else if (row.average >= 70) distribution['D2 (70-79)']++;
      else if (row.average >= 50) distribution['C3-C6 (50-69)']++;
      else if (row.average >= 34) distribution['P7-P8 (34-49)']++;
      else distribution['F9 (<34)']++;
    });

    return {
      labels: Object.keys(distribution),
      datasets: [{
        data: Object.values(distribution),
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [filteredRows]);

  // NEW: Term Performance Chart Data
  const termPerformanceData = useMemo(() => {
    const termData = { term1: [], term2: [], term3: [] };
    filteredRows.forEach((row) => {
      if (termData[row.term]) termData[row.term].push(row.average);
    });

    const averages = Object.entries(termData).map(([term, scores]) => 
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    );

    return {
      labels: ['Term 1', 'Term 2', 'Term 3'],
      datasets: [{
        label: 'Average Performance (%)',
        data: averages,
        backgroundColor: '#667eea',
        borderRadius: 8,
      }],
    };
  }, [filteredRows]);

  // NEW: Export Handlers
  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      setError('No grade records to export');
      return;
    }

    const headers = ['Student Name', 'Student ID', 'Class', 'Subject', 'Average (%)', 'Grade', 'Term', 'Performance', 'Remarks'];
    const rows = filteredRows.map((row) => [
      row.student,
      row.studentId,
      row.className,
      row.subject,
      row.average,
      row.grade || getGradeLabel(row.average),
      row.term.replace('term', 'Term '),
      getPerformanceLabel(row.average),
      row.remarks || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          const cellStr = String(cell || '');
          return cellStr.includes(',') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `grades_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMessage('CSV exported successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleExportPDF = async () => {
    if (filteredRows.length === 0) {
      setError('No grade records to export');
      return;
    }

    try {
      setExporting(true);
      const jsPDF = (await import('jspdf')).jsPDF;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.text('Student Grades Report', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(10);
      const reportDate = new Date().toLocaleDateString();
      doc.text(`Generated: ${reportDate}`, 15, 25);
      doc.text(`Total Records: ${filteredRows.length}`, 15, 32);

      const tableData = filteredRows.map((row) => [
        row.student,
        row.studentId,
        row.className,
        row.subject,
        row.average,
        row.grade || getGradeLabel(row.average),
        row.term.replace('term', 'T'),
        getPerformanceLabel(row.average),
      ]);

      autoTable(doc, {
        head: [['Student Name', 'Student ID', 'Class', 'Subject', 'Avg (%)', 'Grade', 'Term', 'Performance']],
        body: tableData,
        startY: 40,
        margin: { top: 40 },
      });

      doc.save(`grades_report_${new Date().toISOString().split('T')[0]}.pdf`);
      setSuccessMessage('PDF exported successfully!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError('Failed to export PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedRows = lines.slice(1)
          .filter((line) => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: `IMPORTED-${index}`,
              student: values[0]?.trim() || '',
              studentId: values[1]?.trim() || `IMP-${index}`,
              className: values[2]?.trim() || '',
              subject: values[3]?.trim() || '',
              average: Number(values[4]) || 0,
              grade: values[5]?.trim() || '',
              term: `term${values[6]?.toLowerCase().replace('term', '')}` || 'term1',
              examCode: `IMP-${index}`,
            };
          });

        setGradeRows((prev) => [...prev, ...importedRows]);
        setSuccessMessage(`Imported ${importedRows.length} grade record(s) successfully!`);
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (err) {
        setError('Failed to import CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="grades-page">
      <div className="grades-header">
        <h1>Manage Student Grades and Academic Performance</h1>
        <p>Review subject outcomes, track class trends, and support struggling learners.</p>
        
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
            <i className="fa-solid fa-table"></i> Grades Table
          </button>
        </div>
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
          {/* ANALYTICS VIEW */}
          {viewMode === "analytics" && (
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="grades-chart-panel">
          <h2>Grade Distribution</h2>
          <div className="grades-chart-box" style={{ minHeight: '300px' }}>
            <Pie data={gradeDistributionData} options={chartOptions} />
          </div>
        </div>

        <div className="grades-chart-panel">
          <h2>Term Performance Trend</h2>
          <div className="grades-chart-box">
            <Bar data={termPerformanceData} options={chartOptions} />
          </div>
        </div>
      </div>
            </>
          )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
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

            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="all">All Classes</option>
              {[...new Set(gradeRows.map(r => r.className))].sort().map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleExportCSV}
              disabled={exporting || filteredRows.length === 0}
              style={{
                padding: '8px 12px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: exporting || filteredRows.length === 0 ? 0.6 : 1,
              }}
            >
              <i className="fa-solid fa-download"></i> Export CSV
            </button>

            <button
              onClick={handleExportPDF}
              disabled={exporting || filteredRows.length === 0}
              style={{
                padding: '8px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: exporting || filteredRows.length === 0 ? 0.6 : 1,
              }}
            >
              <i className="fa-solid fa-file-pdf"></i> Export PDF
            </button>

            <label style={{
              padding: '8px 12px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <i className="fa-solid fa-upload"></i> Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {successMessage && (
          <div style={{
            padding: '12px 16px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '6px',
            color: '#166534',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="fa-solid fa-check-circle"></i>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grades-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
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
                    <td><strong style={{color: "#0f172a", fontSize: "14px"}}>{row.student}</strong></td>
                    <td><span style={{color: "#64748b", fontSize: "12px"}}>{row.studentId}</span></td>
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
                  <td colSpan="8" className="no-grade-results">
                    No grade records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
        </>
      )}
    </div>
  );
};

export default Grades;
