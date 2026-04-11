import React, { useMemo, useState } from "react";
import "./CreateExam.css";

// Teacher's assigned classes and subjects (from timetable)
const teacherTimetable = [
  { id: 1, term: "Term 1", className: "S1", subject: "Chemistry", subjectCode: "CHM" },
  { id: 2, term: "Term 1", className: "S2", subject: "Chemistry", subjectCode: "CHM" },
  { id: 3, term: "Term 1", className: "S3", subject: "Chemistry", subjectCode: "CHM" },
  { id: 4, term: "Term 1", className: "S4", subject: "Chemistry", subjectCode: "CHM" },
  { id: 5, term: "Term 2", className: "S1", subject: "Chemistry", subjectCode: "CHM" },
  { id: 6, term: "Term 2", className: "S2", subject: "Chemistry", subjectCode: "CHM" },
  { id: 7, term: "Term 2", className: "S3", subject: "Chemistry", subjectCode: "CHM" },
  { id: 8, term: "Term 2", className: "S4", subject: "Chemistry", subjectCode: "CHM" },
  { id: 9, term: "Term 3", className: "S1", subject: "Chemistry", subjectCode: "CHM" },
  { id: 10, term: "Term 3", className: "S2", subject: "Chemistry", subjectCode: "CHM" },
  { id: 11, term: "Term 3", className: "S3", subject: "Chemistry", subjectCode: "CHM" },
  { id: 12, term: "Term 3", className: "S4", subject: "Chemistry", subjectCode: "CHM" },
];

const EXAM_TYPES = [
  { value: "BOT", label: "Beginning of Term" },
  { value: "MOT", label: "Mid of Term" },
  { value: "EOT", label: "End of Term" },
  { value: "MOCK", label: "Mock Examination" },
  { value: "CAT", label: "Continuous Assessment Test" },
  { value: "REMEDIAL", label: "Remedial/Supplementary" },
  { value: "PROMOTIONAL", label: "Promotional Exam" },
];

const EXAM_LEVELS = [
  { value: "O_LEVEL", label: "O-Level (S1-S4)" },
  { value: "A_LEVEL", label: "A-Level (S5-S6)" },
];

const GRADING_SCALES = [
  { value: "O_LEVEL", label: "Ugandan O-Level (9-Point)" },
  { value: "A_LEVEL", label: "Ugandan A-Level" },
];

function CreateExam() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "BOT",
    academicYear: new Date().getFullYear().toString(),
    term: "1",
    level: "O_LEVEL",
    startDate: "",
    endDate: "",
    description: "",
    gradingScale: "O_LEVEL",
    passMark: 34,
    totalMarks: 100,
  });

  // Get unique classes for current term
  const uniqueClasses = useMemo(() => {
    const classSet = new Set(
      teacherTimetable
        .filter(t => t.term === `Term ${formData.term}`)
        .map(t => ({ name: t.className, code: t.className }))
    );
    return Array.from(classSet);
  }, [formData.term]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleClassToggle = (className) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const generateExamCode = () => {
    const typeCode = formData.type.substring(0, 3);
    const termCode = formData.term;
    const year = formData.academicYear;
    const classCode = selectedClasses.length === 1 ? selectedClasses[0] : "ALL";
    return `${typeCode}${termCode}-${year}-${classCode}`;
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      setError("Exam code is required");
      return false;
    }
    if (!formData.name.trim()) {
      setError("Exam name is required");
      return false;
    }
    if (!formData.startDate) {
      setError("Start date is required");
      return false;
    }
    if (!formData.endDate) {
      setError("End date is required");
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date must be before end date");
      return false;
    }
    if (selectedClasses.length === 0) {
      setError("Select at least one class");
      return false;
    }
    if (formData.totalMarks < 1) {
      setError("Total marks must be at least 1");
      return false;
    }
    if (formData.passMark > formData.totalMarks) {
      setError("Pass mark cannot exceed total marks");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare exam data matching backend Exam model
      const examData = {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        academicYear: formData.academicYear,
        term: parseInt(formData.term),
        targetClasses: selectedClasses,
        level: formData.level,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        gradingScale: formData.gradingScale,
        passMark: parseInt(formData.passMark),
        totalMarks: parseInt(formData.totalMarks),
        status: "DRAFT", // Initial status
        isLocked: false,
        isPublished: false,
      };

      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create exam");
      }

      const createdExam = await response.json();
      setSuccessMessage(`Exam "${createdExam.name}" created successfully!`);

      // Reset form
      setFormData({
        code: "",
        name: "",
        type: "BOT",
        academicYear: new Date().getFullYear().toString(),
        term: "1",
        level: "O_LEVEL",
        startDate: "",
        endDate: "",
        description: "",
        gradingScale: "O_LEVEL",
        passMark: 34,
        totalMarks: 100,
      });
      setSelectedClasses([]);

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        // Refresh exams list if parent component has callback
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = () => {
    const code = generateExamCode();
    setFormData(prev => ({ ...prev, code }));
  };

  return (
    <div className="create-exam-container">
      {/* Header */}
      <div className="create-exam-header">
        <div>
          <h1><i className="fa-solid fa-pencil-alt"></i> Create Exam</h1>
          <p>Set up a new exam for your classes and prepare for grading</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="fa-solid fa-plus"></i> New Exam
        </button>
      </div>

      {/* Exam Creation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Exam</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="exam-form">
              {error && (
                <div className="alert alert-error">
                  <i className="fa-solid fa-exclamation-circle"></i> {error}
                </div>
              )}
              {successMessage && (
                <div className="alert alert-success">
                  <i className="fa-solid fa-check-circle"></i> {successMessage}
                </div>
              )}

              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-group">
                  <label htmlFor="name">Exam Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Chemistry End of Term 1 Examination"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="code">Exam Code *</label>
                    <div className="code-input-group">
                      <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g., EOT1-2026-S4"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleGenerateCode}
                        title="Auto-generate code"
                      >
                        <i className="fa-solid fa-magic"></i>
                      </button>
                    </div>
                    <small>Tip: Click magic button to auto-generate</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Exam Type *</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      {EXAM_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add instructions or notes for this exam"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Exam Details</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="academicYear">Academic Year *</label>
                    <input
                      type="text"
                      id="academicYear"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      placeholder="e.g., 2026"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="term">Term *</label>
                    <select
                      id="term"
                      name="term"
                      value={formData.term}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="1">Term 1</option>
                      <option value="2">Term 2</option>
                      <option value="3">Term 3</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="level">Level *</label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      required
                    >
                      {EXAM_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date *</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">End Date *</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Grading Configuration</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gradingScale">Grading Scale *</label>
                    <select
                      id="gradingScale"
                      name="gradingScale"
                      value={formData.gradingScale}
                      onChange={handleInputChange}
                      required
                    >
                      {GRADING_SCALES.map(scale => (
                        <option key={scale.value} value={scale.value}>
                          {scale.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="totalMarks">Total Marks *</label>
                    <input
                      type="number"
                      id="totalMarks"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="passMark">Pass Mark *</label>
                    <input
                      type="number"
                      id="passMark"
                      name="passMark"
                      value={formData.passMark}
                      onChange={handleInputChange}
                      min="0"
                      max={formData.totalMarks}
                      required
                    />
                    <small>(~{Math.round((formData.passMark / formData.totalMarks) * 100)}%)</small>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Select Classes *</h3>
                <p className="section-hint">Choose which classes will take this exam</p>

                {uniqueClasses.length === 0 ? (
                  <p className="no-classes">
                    No classes assigned for this term
                  </p>
                ) : (
                  <div className="classes-grid">
                    {uniqueClasses.map(cls => (
                      <label key={cls.name} className="class-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(cls.name)}
                          onChange={() => handleClassToggle(cls.name)}
                        />
                        <span className="class-name">{cls.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {selectedClasses.length > 0 && (
                  <div className="selected-classes-tag">
                    <span className="tag-label">Selected:</span>
                    {selectedClasses.map(cls => (
                      <span key={cls} className="class-tag">
                        {cls}
                        <button
                          type="button"
                          onClick={() => handleClassToggle(cls)}
                          className="remove-tag"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Creating...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i> Create Exam
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Cards */}
      {!isModalOpen && (
        <div className="info-section">
          <div className="info-card">
            <div className="icon"><i className="fa-solid fa-circle-info"></i></div>
            <h4>How to Create an Exam</h4>
            <ol>
              <li>Click "New Exam" button</li>
              <li>Fill in exam details and grading configuration</li>
              <li>Select the classes that will take the exam</li>
              <li>Submit to create the exam</li>
              <li>Once created, you can add student marks and grades</li>
            </ol>
          </div>

          <div className="info-card">
            <div className="icon"><i className="fa-solid fa-lightbulb"></i></div>
            <h4>Exam Types Explained</h4>
            <ul>
              <li><strong>BOT:</strong> Beginning of Term assessments</li>
              <li><strong>MOT:</strong> Mid-term examinations</li>
              <li><strong>EOT:</strong> End of term final exams</li>
              <li><strong>MOCK:</strong> Simulation exams (S4/S6)</li>
              <li><strong>CAT:</strong> Continuous assessment tests</li>
            </ul>
          </div>

          <div className="info-card highlight">
            <div className="icon"><i className="fa-solid fa-graduation-cap"></i></div>
            <h4>Next Steps After Creating Exam</h4>
            <p>After creating an exam, you can:</p>
            <ul>
              <li>Add student marks and grades</li>
              <li>View class performance analytics</li>
              <li>Generate grade reports</li>
              <li>Submit marks before deadline</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateExam;
