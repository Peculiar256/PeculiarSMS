import React, { useMemo, useState } from "react";
import "./AddStudentMarks.css";

function getAutoGrade(mark) {
  const numericMark = Number(mark);
  if (!mark || Number.isNaN(numericMark)) {
    return "";
  }

  if (numericMark >= 80) return "A";
  if (numericMark >= 70) return "B";
  if (numericMark >= 60) return "C";
  if (numericMark >= 50) return "D";
  return "F";
}

function AddStudentMarks() {
  const [row, setRow] = useState({
    studentName: "",
    className: "",
    subject: "",
    marks: ""
  });
  const [message, setMessage] = useState("");

  const autoGrade = useMemo(() => getAutoGrade(row.marks), [row.marks]);

  const handleChange = (field, value) => {
    if (field === "marks") {
      if (value === "") {
        setRow((prev) => ({ ...prev, marks: "" }));
        return;
      }

      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        return;
      }

      const bounded = Math.max(1, Math.min(100, numeric));
      setRow((prev) => ({ ...prev, marks: String(bounded) }));
      return;
    }

    setRow((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  };

  const isValidRow =
    row.studentName.trim() !== "" &&
    row.className.trim() !== "" &&
    row.subject.trim() !== "" &&
    row.marks !== "";

  const buildPayload = (status) => ({
    studentName: row.studentName.trim(),
    className: row.className.trim(),
    subject: row.subject.trim(),
    marks: Number(row.marks),
    autoGrade,
    status,
    updatedAt: new Date().toISOString()
  });

  const handleSave = () => {
    if (!isValidRow) {
      setMessage("Fill all fields before saving.");
      return;
    }

    localStorage.setItem("add-student-marks-draft", JSON.stringify(buildPayload("draft")));
    setMessage("Draft saved successfully.");
  };

  const handleSubmit = () => {
    if (!isValidRow) {
      setMessage("Fill all fields before submitting.");
      return;
    }

    localStorage.setItem("add-student-marks-submitted", JSON.stringify(buildPayload("submitted")));
    setMessage("Marks submitted successfully.");
  };

  return (
    <section className="add-student-marks">
      <h3 className="add-student-marks-title">Students Detail</h3>
      <table className="add-student-marks-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Class</th>
            <th>Subject</th>
            <th>Marks</th>
            <th>Auto Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                className="add-student-marks-input"
                type="text"
                value={row.studentName}
                onChange={(event) => handleChange("studentName", event.target.value)}
              />
            </td>
            <td>
              <input
                className="add-student-marks-input"
                type="text"
                value={row.className}
                onChange={(event) => handleChange("className", event.target.value)}
              />
            </td>
            <td>
              <input
                className="add-student-marks-input"
                type="text"
                value={row.subject}
                onChange={(event) => handleChange("subject", event.target.value)}
              />
            </td>
            <td>
              <input
                className="add-student-marks-input"
                type="number"
                min="1"
                max="100"
                placeholder="1-100"
                value={row.marks}
                onChange={(event) => handleChange("marks", event.target.value)}
              />
            </td>
            <td className="add-student-marks-grade">{autoGrade || "-"}</td>
          </tr>
        </tbody>
      </table>

      <div className="add-student-marks-actions">
        <button type="button" className="add-student-marks-save" onClick={handleSave}>
          Save
        </button>
        <button type="button" className="add-student-marks-submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      {message ? <p className="add-student-marks-message">{message}</p> : null}
    </section>
  );
}

export default AddStudentMarks;
