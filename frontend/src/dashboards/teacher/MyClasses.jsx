import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
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

function MyClasses() {
  const { user } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [timetableRows, setTimetableRows] = useState(defaultTimetableRows);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherClasses, setTeacherClasses] = useState([]);

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

  return (
    <section className="my-classes-page">
      <div className="my-classes-header">
        <h2>My Classes</h2>
        <p>Timetable for assigned teaching periods.</p>
      </div>

      {error && <p style={{ color: '#d97706', padding: '10px', background: '#fef3c7' }}>{error}</p>}

      <div className="my-classes-filter-row">
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
    </section>
  );
}

export default MyClasses;
