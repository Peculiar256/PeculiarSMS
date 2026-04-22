import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import CSVImportModal from "../../components/CSVImportModal";
import "./MyClasses.css";

const API_BASE_URL = 'http://localhost:8080/api';

const defaultTimetableRows = [
  { id: 1, term: "Term 1", day: "Monday", time: "08:00 - 08:40", className: "S1", subject: "Chemistry", room: "Lab 1" },
  { id: 2, term: "Term 1", day: "Tuesday", time: "08:50 - 09:30", className: "S2", subject: "Chemistry", room: "Lab 2" },
  { id: 3, term: "Term 1", day: "Wednesday", time: "10:00 - 10:40", className: "S3", subject: "Chemistry", room: "Lab 1" },
  { id: 4, term: "Term 1", day: "Thursday", time: "11:20 - 12:00", className: "S1", subject: "Chemistry", room: "Lab 3" },
  { id: 5, term: "Term 1", day: "Friday", time: "12:40 - 13:20", className: "S4", subject: "Chemistry", room: "Lab 2" },
  { id: 6, term: "Term 2", day: "Monday", time: "08:00 - 08:40", className: "S2", subject: "Chemistry", room: "Lab 1" },
  { id: 7, term: "Term 2", day: "Tuesday", time: "08:50 - 09:30", className: "S3", subject: "Chemistry", room: "Lab 2" },
  { id: 8, term: "Term 2", day: "Wednesday", time: "10:00 - 10:40", className: "S1", subject: "Chemistry", room: "Lab 1" },
  { id: 9, term: "Term 2", day: "Thursday", time: "11:20 - 12:00", className: "S4", subject: "Chemistry", room: "Lab 3" },
  { id: 10, term: "Term 2", day: "Friday", time: "12:40 - 13:20", className: "S2", subject: "Chemistry", room: "Lab 2" },
  { id: 11, term: "Term 3", day: "Monday", time: "08:00 - 08:40", className: "S3", subject: "Chemistry", room: "Lab 1" },
  { id: 12, term: "Term 3", day: "Tuesday", time: "08:50 - 09:30", className: "S4", subject: "Chemistry", room: "Lab 2" },
  { id: 13, term: "Term 3", day: "Wednesday", time: "10:00 - 10:40", className: "S2", subject: "Chemistry", room: "Lab 1" },
  { id: 14, term: "Term 3", day: "Thursday", time: "11:20 - 12:00", className: "S1", subject: "Chemistry", room: "Lab 3" },
  { id: 15, term: "Term 3", day: "Friday", time: "12:40 - 13:20", className: "S4", subject: "Chemistry", room: "Lab 2" }
];

function toMinutes(timePoint) {
  const [hours, minutes] = timePoint.trim().split(":").map(Number);
  return (hours * 60) + minutes;
}

function getMinutesFromRange(timeRange) {
  const [start, end] = timeRange.split("-").map((part) => part.trim());
  if (!start || !end) {
    return "0 mins";
  }

  const durationMinutes = toMinutes(end) - toMinutes(start);
  return `${Math.max(0, durationMinutes)} mins`;
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

function MyClasses() {
  const { user } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [timetableRows, setTimetableRows] = useState(defaultTimetableRows);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);

  // Fetch teacher's assigned classes
  useEffect(() => {
    let mounted = true;

    async function loadTeacherClasses() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/teachers/${user.id}/classes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const classes = Array.isArray(data) ? data : data.classes || [];
          if (mounted) {
            setTeacherClasses(classes);
            console.log('Teacher classes loaded:', classes);
          }
        } else {
          console.warn('Failed to fetch teacher classes');
          if (mounted) {
            setTeacherClasses([]);
          }
        }
      } catch (err) {
        console.error('Error fetching teacher classes:', err);
        if (mounted) {
          setTeacherClasses([]);
        }
      }
    }

    loadTeacherClasses();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Fetch timetable for teacher's classes
  useEffect(() => {
    let mounted = true;

    async function loadTimetable() {
      if (teacherClasses.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem('accessToken');
        const allTimetable = [];

        // Fetch timetable for each assigned class
        for (const className of teacherClasses) {
          const response = await fetch(`${API_BASE_URL}/timetable/class/${className}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.json();
            const classTimetable = Array.isArray(data) ? data : (data.timetable || []);
            
            // Normalize timetable entries
            const normalized = classTimetable.map((entry, idx) => ({
              id: entry.id || `${className}-${idx}`,
              term: entry.term || "Term 1",
              day: entry.dayOfWeek || entry.day || "unknown",
              time: entry.time || `${entry.startTime || '08:00'} - ${entry.endTime || '08:40'}`,
              className: entry.className || className,
              subject: entry.subject || entry.subjectName || "N/A",
              room: entry.room || entry.roomName || "N/A"
            }));
            
            allTimetable.push(...normalized);
          }
        }

        if (mounted) {
          if (allTimetable.length > 0) {
            setTimetableRows(allTimetable);
            console.log('Timetable loaded:', allTimetable);
          } else {
            console.log('No timetable entries found, using defaults');
            setTimetableRows(defaultTimetableRows);
            setError("No timetable entries found for your classes");
          }
        }
      } catch (fetchError) {
        console.error('Error fetching timetable:', fetchError);
        if (mounted) {
          setTimetableRows(defaultTimetableRows);
          setError("Using default timetable because the API is temporarily unavailable.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTimetable();

    return () => {
      mounted = false;
    };
  }, [teacherClasses]);

  const filteredRows = useMemo(() => {
    const rowsForTerm = timetableRows.filter((row) => row.term === selectedTerm);

    return rowsForTerm.map((row) => ({
      ...row,
      period: getMinutesFromRange(row.time)
    }));
  }, [selectedTerm, timetableRows]);

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      setImportError("No timetable entries available to export");
      return;
    }

    const headers = ["Term", "Day", "Time", "Period", "Class", "Subject", "Room"];
    const rows = filteredRows.map((row) => [
      row.term,
      row.day,
      row.time,
      row.period,
      row.className,
      row.subject,
      row.room,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map(escapeCsvCell).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `my_classes_${selectedTerm.replace(/\s+/g, "_").toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (filteredRows.length === 0) {
      setImportError("No timetable entries available to export");
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(
        filteredRows.map((row) => ({
          Term: row.term,
          Day: row.day,
          Time: row.time,
          Period: row.period,
          Class: row.className,
          Subject: row.subject,
          Room: row.room,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "MyClasses");
      XLSX.writeFile(workbook, `my_classes_${selectedTerm.replace(/\s+/g, "_").toLowerCase()}.xlsx`);
    } catch (exportError) {
      setImportError(`Failed to export Excel: ${exportError.message}`);
    }
  };

  const handleExportPDF = async () => {
    if (filteredRows.length === 0) {
      setImportError("No timetable entries available to export");
      return;
    }

    try {
      const jsPDF = (await import("jspdf")).jsPDF;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(16);
      doc.text("My Classes Timetable", 14, 14);
      doc.setFontSize(10);
      doc.text(`Term: ${selectedTerm}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [["Term", "Day", "Time", "Period", "Class", "Subject", "Room"]],
        body: filteredRows.map((row) => [
          row.term,
          row.day,
          row.time,
          row.period,
          row.className,
          row.subject,
          row.room,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 123, 255] },
      });

      doc.save(`my_classes_${selectedTerm.replace(/\s+/g, "_").toLowerCase()}.pdf`);
    } catch (exportError) {
      setImportError(`Failed to export PDF: ${exportError.message}`);
    }
  };

  const handlePrint = () => {
    if (filteredRows.length === 0) {
      setImportError("No timetable entries available to print");
      return;
    }

    const printWindow = window.open("", "", "height=700,width=1100");
    if (!printWindow) {
      setImportError("Unable to open print window");
      return;
    }

    const rows = filteredRows
      .map(
        (row) =>
          `<tr><td>${row.day}</td><td>${row.time}</td><td>${row.period}</td><td>${row.className}</td><td>${row.subject}</td><td>${row.room}</td></tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>My Classes Timetable</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin: 0 0 8px; }
            p { margin: 0 0 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h2>My Classes Timetable</h2>
          <p>Term: ${selectedTerm}</p>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Period</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const parseTimetableCSV = async (file) => {
    const csvText = await file.text();
    const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    if (lines.length < 2) {
      throw new Error("CSV file is empty");
    }

    const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/\s+/g, ""));
    const data = lines.slice(1).map((line, index) => {
      const values = parseCsvLine(line);
      const row = {};
      headers.forEach((header, headerIndex) => {
        row[header] = (values[headerIndex] || "").trim();
      });

      return {
        id: row.id || `imported-${Date.now()}-${index}`,
        term: row.term || selectedTerm,
        day: row.day || "Monday",
        time: row.time || "08:00 - 08:40",
        className: row.classname || row.class || "N/A",
        subject: row.subject || "N/A",
        room: row.room || "N/A",
      };
    });

    return { rows: lines, data };
  };

  const validateTimetableRow = (row) => {
    const errors = [];
    if (!row.day) errors.push("Day is required");
    if (!row.time) errors.push("Time is required");
    if (!row.className) errors.push("Class is required");
    if (!row.subject) errors.push("Subject is required");

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const downloadTimetableTemplate = () => {
    const template = [
      "term,day,time,className,subject,room",
      "Term 1,Monday,08:00 - 08:40,S1,Chemistry,Lab 1",
      "Term 1,Tuesday,08:50 - 09:30,S2,Biology,Lab 2",
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "my_classes_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTimetableImportComplete = (result) => {
    const importedRows = result?.successful || [];
    if (importedRows.length === 0) {
      setImportError("No valid timetable rows were found in the CSV file");
      return;
    }

    setTimetableRows((previous) => [...previous, ...importedRows]);
    setImportMessage(`Imported ${importedRows.length} timetable row(s) successfully`);
    setImportError("");
    setIsCSVImportOpen(false);
  };

  return (
    <section className="my-classes-page">
      <div className="my-classes-header">
        <h2>My Classes</h2>
        <p>Timetable for assigned teaching periods.</p>
      </div>

      {error && <p style={{ color: '#d97706', padding: '10px', background: '#fef3c7' }}>{error}</p>}

      <div className="my-classes-filter-row">
        <div className="my-classes-filter-controls">
          <label htmlFor="termFilter">Term</label>
          <select
            id="termFilter"
            value={selectedTerm}
            onChange={(event) => setSelectedTerm(event.target.value)}
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>

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
          <button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={() => setIsCSVImportOpen(true)}>
            <i className="fa-solid fa-upload"></i> Import
          </button>
        </div>
      </div>

      {importMessage && <p className="my-classes-success">{importMessage}</p>}
      {importError && <p className="my-classes-error">{importError}</p>}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '20px' }}>Loading timetable...</p>
      ) : (
        <div className="my-classes-table-wrap">
          <table className="my-classes-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Period</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.day}</td>
                    <td>{row.time}</td>
                    <td>{row.period}</td>
                    <td>{row.className}</td>
                    <td>{row.subject}</td>
                    <td>{row.room}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="my-classes-empty">
                    No timetable entries found for this term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <CSVImportModal
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        onImportComplete={handleTimetableImportComplete}
        parseFile={parseTimetableCSV}
        validateRow={validateTimetableRow}
        downloadTemplate={downloadTimetableTemplate}
        modalTitle="Import Timetable from CSV"
        processingText="Importing timetable rows..."
        entityName="row"
        requiredFields={["Day", "Time", "Class Name", "Subject"]}
        optionalFields={["Term", "Room"]}
        previewColumns={[
          { key: "term", label: "Term" },
          { key: "day", label: "Day" },
          { key: "time", label: "Time" },
          { key: "className", label: "Class" },
          { key: "subject", label: "Subject" },
          { key: "room", label: "Room" },
        ]}
      />
    </section>
  );
}

export default MyClasses;
