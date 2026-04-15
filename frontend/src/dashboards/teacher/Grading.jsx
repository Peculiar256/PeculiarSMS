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