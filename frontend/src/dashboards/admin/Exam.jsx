import React, { useMemo, useState } from "react";
import "./Exam.css";
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

// Sample exam data
const sampleExams = [
  {
    id: 1,
    name: "Mathematics Final Exam",
    subject: "Mathematics",
    class: "Form 4A",
    term: "Term 1",
    date: "2024-03-15",
    totalStudents: 45,
    grades: { A: 8, B: 12, C: 15, D: 8, F: 2 },
    passCount: 43,
    failCount: 2,
  },
  {
    id: 2,
    name: "English Literature Midterm",
    subject: "English",
    class: "Form 4B",
    term: "Term 1",
    date: "2024-03-10",
    totalStudents: 42,
    grades: { A: 5, B: 10, C: 18, D: 7, F: 2 },
    passCount: 40,
    failCount: 2,
  },
  {
    id: 3,
    name: "Physics Practical Exam",
    subject: "Physics",
    class: "Form 4A",
    term: "Term 2",
    date: "2024-06-05",
    totalStudents: 40,
    grades: { A: 10, B: 15, C: 10, D: 4, F: 1 },
    passCount: 39,
    failCount: 1,
  },
  {
    id: 4,
    name: "Chemistry Theory Exam",
    subject: "Chemistry",
    class: "Form 4B",
    term: "Term 2",
    date: "2024-06-08",
    totalStudents: 42,
    grades: { A: 6, B: 14, C: 16, D: 5, F: 1 },
    passCount: 41,
    failCount: 1,
  },
];

function Exam() {
  const [exams, setExams] = useState(sampleExams);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerm, setFilterTerm] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    class: "",
    term: "Term 1",
    date: "",
    totalStudents: "",
  });

  // Get unique filters
  const uniqueTerms = useMemo(() => {
    return [...new Set(exams.map((e) => e.term))];
  }, [exams]);

  const uniqueClasses = useMemo(() => {
    return [...new Set(exams.map((e) => e.class))];
  }, [exams]);

  const uniqueSubjects = useMemo(() => {
    return [...new Set(exams.map((e) => e.subject))];
  }, [exams]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalExams = exams.length;
    const totalPassCount = exams.reduce((sum, e) => sum + e.passCount, 0);
    const totalFailCount = exams.reduce((sum, e) => sum + e.failCount, 0);
    const totalStudents = exams.reduce((sum, e) => sum + e.totalStudents, 0);
    const passRate = totalStudents > 0 ? ((totalPassCount / totalStudents) * 100).toFixed(1) : 0;
    const failRate = totalStudents > 0 ? ((totalFailCount / totalStudents) * 100).toFixed(1) : 0;

    return { totalExams, passRate, failRate, totalPassCount, totalFailCount, totalStudents };
  }, [exams]);

  // Filter exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const searchMatch =
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const termMatch = filterTerm === "all" || exam.term === filterTerm;
      const classMatch = filterClass === "all" || exam.class === filterClass;
      const subjectMatch = filterSubject === "all" || exam.subject === filterSubject;

      return searchMatch && termMatch && classMatch && subjectMatch;
    });
  }, [exams, searchTerm, filterTerm, filterClass, filterSubject]);

  // Pagination
  const paginatedExams = useMemo(() => {
    const startIndex = (currentPage - 1) * examsPerPage;
    return filteredExams.slice(startIndex, startIndex + examsPerPage);
  }, [filteredExams, currentPage, examsPerPage]);

  const totalPages = Math.ceil(filteredExams.length / examsPerPage);

  // Grade distribution data (overall)
  const gradeDistribution = useMemo(() => {
    const totalGrades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    exams.forEach((exam) => {
      Object.keys(exam.grades).forEach((grade) => {
        totalGrades[grade] += exam.grades[grade];
      });
    });
    return totalGrades;
  }, [exams]);

  // Pass/Fail Rate Chart Data
  const passFailChartData = {
    labels: ["Passed", "Failed"],
    datasets: [
      {
        label: "Student Count",
        data: [statistics.totalPassCount, statistics.totalFailCount],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: ["#059669", "#dc2626"],
        borderWidth: 2,
      },
    ],
  };

  // Grade Distribution Chart Data
  const gradeChartData = {
    labels: ["A", "B", "C", "D", "F"],
    datasets: [
      {
        label: "Grade Distribution",
        data: [gradeDistribution.A, gradeDistribution.B, gradeDistribution.C, gradeDistribution.D, gradeDistribution.F],
        backgroundColor: [
          "#3b82f6",
          "#8b5cf6",
          "#f59e0b",
          "#ef4444",
          "#6b7280",
        ],
        borderColor: [
          "#1e40af",
          "#6d28d9",
          "#d97706",
          "#dc2626",
          "#374151",
        ],
        borderWidth: 2,
      },
    ],
  };

  const handleAddExam = () => {
    if (!formData.name || !formData.subject || !formData.class || !formData.date || !formData.totalStudents) {
      alert("Please fill in all required fields");
      return;
    }

    const newExam = {
      id: Math.max(...exams.map((e) => e.id), 0) + 1,
      name: formData.name,
      subject: formData.subject,
      class: formData.class,
      term: formData.term,
      date: formData.date,
      totalStudents: parseInt(formData.totalStudents),
      grades: { A: 0, B: 0, C: 0, D: 0, F: 0 },
      passCount: 0,
      failCount: 0,
    };

    setExams([...exams, newExam]);
    setIsAddModalOpen(false);
    setFormData({ name: "", subject: "", class: "", term: "Term 1", date: "", totalStudents: "" });
  };

  const handleDeleteExam = (id) => {
    setExams(exams.filter((exam) => exam.id !== id));
  };

  const handleViewExam = (exam) => {
    setSelectedExam(exam);
    setIsDetailsModalOpen(true);
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
      </div>

      {/* Statistics Cards */}
      <section className="exam-statistics">
        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="exam-stat-content">
            <p className="stat-label">Total Exams</p>
            <h3>{statistics.totalExams}</h3>
          </div>
        </div>

        <div className="exam-stat-card pass-rate">
          <div className="exam-stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="exam-stat-content">
            <p className="stat-label">Pass Rate</p>
            <h3>{statistics.passRate}%</h3>
          </div>
        </div>

        <div className="exam-stat-card fail-rate">
          <div className="exam-stat-icon">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="exam-stat-content">
            <p className="stat-label">Fail Rate</p>
            <h3>{statistics.failRate}%</h3>
          </div>
        </div>

        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="exam-stat-content">
            <p className="stat-label">Total Students</p>
            <h3>{statistics.totalStudents}</h3>
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

      {/* Filters and Search */}
      <section className="exam-filters-section">
        <div className="exam-header-actions">
          <h2>Exams List</h2>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus me-2"></i> Add New Exam
          </button>
        </div>

        <div className="exam-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search exam name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Term:</label>
            <select value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} className="filter-select">
              <option value="all">All Terms</option>
              {uniqueTerms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Class:</label>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="filter-select">
              <option value="all">All Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Subject:</label>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="filter-select">
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Exams Table */}
      <section className="exam-table-section">
        <table className="exam-table">
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Term</th>
              <th>Date</th>
              <th>Pass Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExams.length > 0 ? (
              paginatedExams.map((exam) => {
                const examPassRate = ((exam.passCount / exam.totalStudents) * 100).toFixed(1);
                return (
                  <tr key={exam.id}>
                    <td className="exam-name">{exam.name}</td>
                    <td>{exam.subject}</td>
                    <td>{exam.class}</td>
                    <td>{exam.term}</td>
                    <td>{new Date(exam.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`pass-rate-badge ${examPassRate >= 80 ? "high" : examPassRate >= 60 ? "medium" : "low"}`}>
                        {examPassRate}%
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-info" onClick={() => handleViewExam(exam)} title="View Details">
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteExam(exam.id)} title="Delete Exam">
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  <i className="fas fa-inbox me-2"></i>No exams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="exam-pagination">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
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
              <button className="page-link" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
                Next
              </button>
            </li>
          </ul>
        </nav>
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
                <label>Exam Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mathematics Final Exam"
                />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Class *</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="e.g., Form 4A"
                  />
                </div>
                <div className="form-group">
                  <label>Term *</label>
                  <select value={formData.term} onChange={(e) => setFormData({ ...formData, term: e.target.value })}>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Total Students *</label>
                  <input
                    type="number"
                    value={formData.totalStudents}
                    onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                    placeholder="e.g., 45"
                  />
                </div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddExam}>
                Add Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Details Modal */}
      {isDetailsModalOpen && selectedExam && (
        <div className="exam-modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="exam-modal exam-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <h3>{selectedExam.name}</h3>
              <button className="btn-close" onClick={() => setIsDetailsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="exam-modal-body">
              <div className="exam-details-grid">
                <div className="detail-item">
                  <label>Subject</label>
                  <p>{selectedExam.subject}</p>
                </div>
                <div className="detail-item">
                  <label>Class</label>
                  <p>{selectedExam.class}</p>
                </div>
                <div className="detail-item">
                  <label>Term</label>
                  <p>{selectedExam.term}</p>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <p>{new Date(selectedExam.date).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                  <label>Total Students</label>
                  <p>{selectedExam.totalStudents}</p>
                </div>
                <div className="detail-item">
                  <label>Pass Rate</label>
                  <p className="pass-rate-badge high">
                    {((selectedExam.passCount / selectedExam.totalStudents) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="exam-details-section">
                <h4>Grade Distribution</h4>
                <div className="grade-distribution">
                  {Object.entries(selectedExam.grades).map(([grade, count]) => (
                    <div key={grade} className="grade-item">
                      <span className="grade-label">{grade}</span>
                      <div className="grade-bar">
                        <div
                          className="grade-fill"
                          style={{
                            width: `${(count / selectedExam.totalStudents) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="grade-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="exam-details-section">
                <h4>Statistics</h4>
                <div className="statistics-grid">
                  <div className="stat">
                    <label>Passed</label>
                    <p className="stat-value pass">{selectedExam.passCount}</p>
                  </div>
                  <div className="stat">
                    <label>Failed</label>
                    <p className="stat-value fail">{selectedExam.failCount}</p>
                  </div>
                  <div className="stat">
                    <label>Pass Rate</label>
                    <p className="stat-value">
                      {((selectedExam.passCount / selectedExam.totalStudents) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Exam;
