import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Grading.css";

const API_BASE_URL = "http://localhost:8080/api";

// Grade calculation function
function getGrade(mark) {
  // O-Level grading scale
  if (mark >= 80) return "D1";
  if (mark >= 70) return "D2";
  if (mark >= 65) return "C3";
  if (mark >= 60) return "C4";
  if (mark >= 55) return "C5";
  if (mark >= 50) return "C6";
  if (mark >= 40) return "P7";
  if (mark >= 34) return "P8";
  return "F9";
}

function escapeCsvCell(value) {
  const normalized = String(value ?? "");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function Grading() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [enteredMarks, setEnteredMarks] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  
  // Data from backend
  const [students, setStudents] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");

  // Fetch teacher's assigned classes and subjects
  useEffect(() => {
    let mounted = true;

    async function loadTeacherData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        
        // Fetch teacher's classes
        const classUrl = `${API_BASE_URL}/teachers/${user.id}/classes`;
        console.log(`📍 Fetching teacher classes from: ${classUrl}`);
        
        const classResponse = await fetch(classUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (classResponse.ok) {
          const classData = await classResponse.json();
          let classes = classData.assignedClasses || classData.classes || classData.data || [];
          if (mounted) {
            setTeacherClasses(classes);
            console.log('✔️ Teacher classes:', classes);
          }
        } else {
          console.warn('❌ Failed to fetch teacher classes');
        }

        // Fetch teacher's subjects
        const subjectUrl = `${API_BASE_URL}/teachers/${user.id}/subjects`;
        console.log(`📍 Fetching teacher subjects from: ${subjectUrl}`);
        
        const subjectResponse = await fetch(subjectUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (subjectResponse.ok) {
          const subjectData = await subjectResponse.json();
          let subjectsArray = Array.isArray(subjectData) ? subjectData : (subjectData.assignedSubjects || subjectData.subjects || subjectData.data || []);
          
          // Extract subject names/codes - handle both string and object formats
          const subjectNames = subjectsArray.map(subj => 
            typeof subj === 'string' ? subj : (subj.subjectName || subj.name || subj.subjectCode || subj.code)
          );
          
          if (mounted) {
            setTeacherSubjects(subjectNames);
            // Set first subject as default if available
            if (subjectNames.length > 0) {
              setSubject(subjectNames[0]);
            }
            console.log('✔️ Teacher subjects:', subjectNames);
          }
        } else {
          console.warn('❌ Failed to fetch teacher subjects');
        }
      } catch (err) {
        console.error('❌ Error fetching teacher data:', err);
      }
    }

    loadTeacherData();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Fetch available exams
  useEffect(() => {
    let mounted = true;

    async function loadExams() {
      try {
        const token = localStorage.getItem('accessToken');
        
        const examsUrl = `${API_BASE_URL}/exams`;
        console.log(`📍 Fetching exams from: ${examsUrl}`);
        
        const response = await fetch(examsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const examsData = await response.json();
          const examsList = Array.isArray(examsData) ? examsData : (examsData.exams || examsData.data || []);
          
          if (mounted) {
            setExams(examsList);
            // Set first exam as default if available
            if (examsList.length > 0) {
              setSelectedExam(examsList[0]);
              console.log('✔️ Exams loaded:', examsList);
            }
          }
        } else {
          console.warn('❌ Failed to fetch exams');
        }
      } catch (err) {
        console.error('❌ Error fetching exams:', err);
      }
    }

    loadExams();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch students for teacher's assigned classes
  useEffect(() => {
    let mounted = true;

    async function loadStudents() {
      if (teacherClasses.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem('accessToken');
        const allStudents = [];

        // Fetch students for each teacher's assigned class
        for (const classItem of teacherClasses) {
          let className = typeof classItem === 'string' ? classItem : classItem.name;
          // Extract base class name (e.g., "S1A" -> "S1")
          const baseClassName = className.replace(/[A-Za-z]$/, '');
          
          const url = `${API_BASE_URL}/students/class/${baseClassName}`;
          console.log(`🔵 Fetching students for class: ${className}`);
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.json();
            const classStudents = Array.isArray(data) ? data : (data.students || data.data || []);
            
            const normalizedStudents = classStudents.map((student) => ({
              id: student.id,
              name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
              className: student.className || student.currentClass || className,
              studentId: student.studentId || `STU${student.id}`,
              schoolClassId: student.schoolClass?.id,
            }));
            
            allStudents.push(...normalizedStudents);
          }
        }

        if (mounted) {
          setStudents(allStudents);
          console.log('✔️ Students loaded:', allStudents);
          // Set default class filter to first teacher's class
          if (teacherClasses.length > 0) {
            const firstClass = typeof teacherClasses[0] === 'string' ? teacherClasses[0] : teacherClasses[0].name;
            setClassFilter(firstClass);
          }
        }
      } catch (fetchError) {
        console.error('❌ Error fetching students:', fetchError);
        if (mounted) {
          setError("Failed to load students");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      mounted = false;
    };
  }, [teacherClasses]);



  const classOptions = useMemo(() => {
    // Use teacher's assigned classes
    return teacherClasses.map(c => typeof c === 'string' ? c : c.name);
  }, [teacherClasses]);

  const filteredStudents = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return students.filter((student) => {
      const matchesName = query === "" || student.name.toLowerCase().includes(query);
      const matchesClass = !classFilter || student.className === classFilter;

      return matchesName && matchesClass;
    });
  }, [searchText, classFilter, students]);

  useEffect(() => {
    setMessage("");
  }, [searchText, classFilter]);

  const getAutoGrade = (studentId) => {
    const rawMark = enteredMarks[studentId];
    if (rawMark === undefined || rawMark === "") {
      return "-";
    }

    return getGrade(Number(rawMark));
  };

  const handleMarkChange = (studentId, value) => {
    if (value === "") {
      setEnteredMarks((prev) => ({
        ...prev,
        [studentId]: ""
      }));
      setMessage("");
      return;
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return;
    }

    const bounded = Math.max(0, Math.min(100, numeric));
    setEnteredMarks((prev) => ({
      ...prev,
      [studentId]: bounded
    }));
    setMessage("");
  };

  const handleSave = async () => {
    const entries = filteredStudents
      .filter((student) => enteredMarks[student.id] !== undefined && enteredMarks[student.id] !== "")
      .map((student) => ({
        studentId: student.id,
        subjectCode: subject,  // Map 'subject' to 'subjectCode'
        subjectName: subject,  // Also send subject name for reference
        marksObtained: Number(enteredMarks[student.id]),  // Map 'marks' to 'marksObtained'
        grade: getAutoGrade(student.id),
        className: student.className,  // Add required className
        term: 1,
        academicYear: new Date().getFullYear().toString(),
        gradingScale: "O_LEVEL",  // Add required grading scale
        examId: 1,  // TODO: Get actual exam ID from context or API
        maxMarks: 100,  // Add max marks
        isPrincipal: false,
        isSubsidiary: false,
      }));

    if (entries.length === 0) {
      setMessage("Enter at least one student mark before saving.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      
      // Save as draft to localStorage for quick access
      const payload = {
        subject: subject,
        entries,
        status: "draft",
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(`teacher-${subject}-grade-draft`, JSON.stringify(payload));
      setMessage(`${entries.length} marks saved as draft for ${subject}`);
      setMessageType("success");
    } catch (err) {
      setMessage("Failed to save marks");
      setMessageType("error");
      console.error("Error saving marks:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedExam) {
      setMessage("Please select an exam first.");
      setMessageType("error");
      return;
    }

    const entries = filteredStudents
      .filter((student) => enteredMarks[student.id] !== undefined && enteredMarks[student.id] !== "")
      .map((student) => ({
        studentId: student.id,
        subjectCode: subject,
        subjectName: subject,
        marksObtained: Number(enteredMarks[student.id]),
        grade: getAutoGrade(student.id),
        className: student.className,
        term: selectedExam.term || 1,
        academicYear: selectedExam.academicYear || new Date().getFullYear().toString(),
        gradingScale: "O_LEVEL",
        examId: selectedExam.id,  // ✅ Use actual exam ID from selected exam
        maxMarks: 100,
        isPrincipal: false,
        isSubsidiary: false,
      }));

    if (entries.length === 0) {
      setMessage("Enter at least one student mark before submitting.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');
      
      console.log('📤 Submitting marks for exam:', selectedExam.name);
      console.log('   Exam ID:', selectedExam.id);
      console.log('   Token present:', !!token);
      console.log('   Entries:', entries.length);
      
      // Submit to backend with authentication
      const response = await fetch(`${API_BASE_URL}/results/bulk`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entries),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit marks");
      }

      const result = await response.json();
      
      // Also save to localStorage for backup
      const payload = {
        subject: subject,
        exam: selectedExam.name,
        entries,
        status: "submitted",
        submittedAt: new Date().toISOString()
      };
      localStorage.setItem(`teacher-${subject}-grade-submitted`, JSON.stringify(payload));

      setMessage(`${entries.length} marks submitted successfully for ${subject} in ${selectedExam.name}!`);
      setMessageType("success");
      
      console.log("✅ Marks submitted successfully:", result);
      
      // Clear entered marks after successful submission
      setTimeout(() => {
        setEnteredMarks({});
      }, 1500);
    } catch (err) {
      setMessage(`Failed to submit marks: ${err.message}`);
      setMessageType("error");
      console.error("❌ Error submitting marks:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const buildExportRows = () => {
    return filteredStudents.map((student) => {
      const rawMark = enteredMarks[student.id];
      const marks = rawMark === undefined || rawMark === "" ? "" : Number(rawMark);

      return {
        studentId: student.studentId || student.id,
        studentName: student.name,
        className: student.className,
        subject,
        exam: selectedExam?.name || "",
        marks,
        grade: marks === "" ? "-" : getGrade(marks),
      };
    });
  };

  const handleExportCSV = () => {
    const rows = buildExportRows();
    if (rows.length === 0) {
      setMessage("No students available to export.");
      setMessageType("error");
      return;
    }

    const headers = ["Student ID", "Student Name", "Class", "Subject", "Exam", "Marks", "Grade"];
    const dataRows = rows.map((row) => [
      row.studentId,
      row.studentName,
      row.className,
      row.subject,
      row.exam,
      row.marks,
      row.grade,
    ]);

    const csvContent = [headers.join(","), ...dataRows.map((row) => row.map(escapeCsvCell).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.setAttribute("download", `grading_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const rows = buildExportRows();
    if (rows.length === 0) {
      setMessage("No students available to export.");
      setMessageType("error");
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Grading");
      XLSX.writeFile(workbook, `grading_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (exportError) {
      setMessage(`Failed to export Excel: ${exportError.message}`);
      setMessageType("error");
    }
  };

  const handleExportPDF = async () => {
    const rows = buildExportRows();
    if (rows.length === 0) {
      setMessage("No students available to export.");
      setMessageType("error");
      return;
    }

    try {
      const jsPDF = (await import("jspdf")).jsPDF;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(14);
      doc.text("Grading Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Subject: ${subject || "N/A"}`, 14, 22);
      doc.text(`Exam: ${selectedExam?.name || "N/A"}`, 14, 28);

      autoTable(doc, {
        startY: 34,
        head: [["Student ID", "Student Name", "Class", "Subject", "Exam", "Marks", "Grade"]],
        body: rows.map((row) => [
          row.studentId,
          row.studentName,
          row.className,
          row.subject,
          row.exam,
          row.marks,
          row.grade,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 123, 255] },
      });

      doc.save(`grading_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (exportError) {
      setMessage(`Failed to export PDF: ${exportError.message}`);
      setMessageType("error");
    }
  };

  const handlePrint = () => {
    const rows = buildExportRows();
    if (rows.length === 0) {
      setMessage("No students available to print.");
      setMessageType("error");
      return;
    }

    const printWindow = window.open("", "", "height=700,width=1100");
    if (!printWindow) {
      setMessage("Unable to open print window.");
      setMessageType("error");
      return;
    }

    const tableRows = rows
      .map(
        (row) =>
          `<tr><td>${row.studentId}</td><td>${row.studentName}</td><td>${row.className}</td><td>${row.subject}</td><td>${row.exam}</td><td>${row.marks}</td><td>${row.grade}</td></tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
      <head>
        <title>Grading Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { margin-bottom: 8px; }
          p { margin: 4px 0 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Grading Report</h2>
        <p>Subject: ${subject || "N/A"} | Exam: ${selectedExam?.name || "N/A"}</p>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Exam</th>
              <th>Marks</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportMessage("");
    setImportError("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setImportError("Please upload a CSV file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const csvText = String(loadEvent.target?.result || "");
        const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

        if (lines.length < 2) {
          throw new Error("CSV file is empty.");
        }

        const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
        const studentIdIndex = headers.findIndex((header) => header === "student id" || header === "studentid");
        const marksIndex = headers.findIndex((header) => header === "marks" || header === "mark");

        if (studentIdIndex === -1 || marksIndex === -1) {
          throw new Error("CSV must include Student ID and Marks columns.");
        }

        const nextMarks = { ...enteredMarks };
        let updatedCount = 0;

        for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
          const values = parseCsvLine(lines[lineIndex]);
          const importedId = String(values[studentIdIndex] || "").trim();
          const importedMark = Number(values[marksIndex]);

          if (!importedId || Number.isNaN(importedMark)) {
            continue;
          }

          const match = students.find(
            (student) => String(student.studentId || student.id).trim().toLowerCase() === importedId.toLowerCase()
          );

          if (!match) {
            continue;
          }

          nextMarks[match.id] = Math.max(0, Math.min(100, importedMark));
          updatedCount += 1;
        }

        if (updatedCount === 0) {
          throw new Error("No matching students found in CSV.");
        }

        setEnteredMarks(nextMarks);
        setImportMessage(`Imported marks for ${updatedCount} students.`);
      } catch (importException) {
        setImportError(importException.message || "Failed to import CSV.");
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setImportError("Unable to read the selected file.");
      event.target.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <div className="grading-card">
      <div className="grading-header-row">
        <div>
          <h2>Grading Student</h2>
          <p>Enter student marks and review the grades.</p>
        </div>
      </div>

      <div className="grading-filters-grid">
        <div className="grading-field">
          <label htmlFor="exam-select">Exam *</label>
          <select
            id="exam-select"
            value={selectedExam?.id || ""}
            onChange={(event) => {
              const examId = parseInt(event.target.value);
              const selected = exams.find(e => e.id === examId);
              setSelectedExam(selected);
              setMessage("");
              setEnteredMarks({});
            }}
            required
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} - {exam.academicYear} Term {exam.term}
              </option>
            ))}
          </select>
        </div>

        <div className="grading-field">
          <label htmlFor="student-search">Search Student</label>
          <input
            id="student-search"
            type="text"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setMessage("");
            }}
            placeholder="Search by name"
          />
        </div>

        <div className="grading-field">
          <label htmlFor="class-filter">Class Filter *</label>
          <select
            id="class-filter"
            value={classFilter}
            onChange={(event) => {
              setClassFilter(event.target.value);
              setMessage("");
            }}
            required
          >
            <option value="">Select Class</option>
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="grading-field">
          <label htmlFor="subject-select">Subject *</label>
          <select
            id="subject-select"
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setMessage("");
              setEnteredMarks({});
            }}
            required
          >
            <option value="">Select Subject</option>
            {teacherSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="student-table-section">
        <label className="table-label">Students Table</label>
        <div className="teacher-students-toolbar d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handleExportCSV}>
            <i className="fa-solid fa-file-csv"></i> CSV
          </button>
          <button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handleExportExcel}>
            <i className="fa-solid fa-file-excel"></i> Excel
          </button>
          <button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handleExportPDF}>
            <i className="fa-solid fa-file-pdf"></i> PDF
          </button>
          <button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Print
          </button>
          <label className="btn btn-primary teacher-toolbar-btn mb-0">
            <i className="fa-solid fa-upload"></i> Import
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: "none" }} />
          </label>
        </div>
        {importMessage && <p className="grading-message grading-message-success">{importMessage}</p>}
        {importError && <p className="grading-message grading-message-error">{importError}</p>}
        <div className="teacher-students-table-wrap">
          <table className="teacher-students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Auto Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.className}</td>
                    <td>{subject}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="grading-marks-input"
                        placeholder="0-100"
                        value={enteredMarks[student.id] ?? ""}
                        onChange={(event) => handleMarkChange(student.id, event.target.value)}
                      />
                    </td>
                    <td>{getAutoGrade(student.id)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="teacher-students-empty">
                    No students found for this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grading-actions">
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={submitting || loading}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={submitting || loading}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {loading && <p className="grading-message grading-message-info">Loading students...</p>}
      {error && <p className="grading-message grading-message-error">{error}</p>}
      {message && (
        <p className={`grading-message grading-message-${messageType}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Grading;