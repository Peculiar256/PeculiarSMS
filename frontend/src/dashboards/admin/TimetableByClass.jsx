import React, { useMemo, useState } from "react";
import "./TimetableByClass.css";

const timetableData = {
  "S.1": [
    {
      time: "8:00 AM - 9:00 AM",
      duration: "60 mins",
      monday: "Mathematics",
      tuesday: "English",
      wednesday: "Biology",
      thursday: "Physics",
      friday: "Chemistry",
    },
    {
      time: "9:00 AM - 10:00 AM",
      duration: "60 mins",
      monday: "English",
      tuesday: "Mathematics",
      wednesday: "Chemistry",
      thursday: "Biology",
      friday: "Physics",
    },
    {
      time: "10:00 AM - 10:20 AM",
      duration: "20 mins",
      monday: "Break Time",
      tuesday: "Break Time",
      wednesday: "Break Time",
      thursday: "Break Time",
      friday: "Break Time",
    },
    {
      time: "10:20 AM - 11:20 AM",
      duration: "60 mins",
      monday: "Biology",
      tuesday: "Physics",
      wednesday: "English",
      thursday: "Chemistry",
      friday: "Mathematics",
    },
    {
      time: "11:20 AM - 12:00 PM",
      duration: "40 mins",
      monday: "Lunch Time",
      tuesday: "Lunch Time",
      wednesday: "Lunch Time",
      thursday: "Lunch Time",
      friday: "Lunch Time",
    },
    {
      time: "12:00 PM - 1:00 PM",
      duration: "60 mins",
      monday: "Chemistry",
      tuesday: "Mathematics",
      wednesday: "Physics",
      thursday: "Biology",
      friday: "English",
    },
    {
      time: "1:00 PM - 2:00 PM",
      duration: "60 mins",
      monday: "Physics",
      tuesday: "Chemistry",
      wednesday: "Mathematics",
      thursday: "English",
      friday: "Biology",
    },
  ],
  "S.2": [
    {
      time: "8:00 AM - 9:00 AM",
      duration: "60 mins",
      monday: "English",
      tuesday: "Biology",
      wednesday: "Physics",
      thursday: "Chemistry",
      friday: "Mathematics",
    },
    {
      time: "9:00 AM - 10:00 AM",
      duration: "60 mins",
      monday: "Chemistry",
      tuesday: "English",
      wednesday: "Mathematics",
      thursday: "Physics",
      friday: "Biology",
    },
    {
      time: "10:00 AM - 10:20 AM",
      duration: "20 mins",
      monday: "Break Time",
      tuesday: "Break Time",
      wednesday: "Break Time",
      thursday: "Break Time",
      friday: "Break Time",
    },
    {
      time: "10:20 AM - 11:20 AM",
      duration: "60 mins",
      monday: "Physics",
      tuesday: "Mathematics",
      wednesday: "English",
      thursday: "Biology",
      friday: "Chemistry",
    },
    {
      time: "11:20 AM - 12:00 PM",
      duration: "40 mins",
      monday: "Lunch Time",
      tuesday: "Lunch Time",
      wednesday: "Lunch Time",
      thursday: "Lunch Time",
      friday: "Lunch Time",
    },
    {
      time: "12:00 PM - 1:00 PM",
      duration: "60 mins",
      monday: "Biology",
      tuesday: "Chemistry",
      wednesday: "Physics",
      thursday: "Mathematics",
      friday: "English",
    },
    {
      time: "1:00 PM - 2:00 PM",
      duration: "60 mins",
      monday: "Mathematics",
      tuesday: "Physics",
      wednesday: "Biology",
      thursday: "English",
      friday: "Chemistry",
    },
  ],
  "S.3": [
    {
      time: "8:00 AM - 9:00 AM",
      duration: "60 mins",
      monday: "Physics",
      tuesday: "Chemistry",
      wednesday: "English",
      thursday: "Mathematics",
      friday: "Biology",
    },
    {
      time: "9:00 AM - 10:00 AM",
      duration: "60 mins",
      monday: "Biology",
      tuesday: "Physics",
      wednesday: "Chemistry",
      thursday: "English",
      friday: "Mathematics",
    },
    {
      time: "10:00 AM - 10:20 AM",
      duration: "20 mins",
      monday: "Break Time",
      tuesday: "Break Time",
      wednesday: "Break Time",
      thursday: "Break Time",
      friday: "Break Time",
    },
    {
      time: "10:20 AM - 11:20 AM",
      duration: "60 mins",
      monday: "Mathematics",
      tuesday: "English",
      wednesday: "Biology",
      thursday: "Chemistry",
      friday: "Physics",
    },
    {
      time: "11:20 AM - 12:00 PM",
      duration: "40 mins",
      monday: "Lunch Time",
      tuesday: "Lunch Time",
      wednesday: "Lunch Time",
      thursday: "Lunch Time",
      friday: "Lunch Time",
    },
    {
      time: "12:00 PM - 1:00 PM",
      duration: "60 mins",
      monday: "English",
      tuesday: "Biology",
      wednesday: "Mathematics",
      thursday: "Physics",
      friday: "Chemistry",
    },
    {
      time: "1:00 PM - 2:00 PM",
      duration: "60 mins",
      monday: "Chemistry",
      tuesday: "Mathematics",
      wednesday: "Physics",
      thursday: "Biology",
      friday: "English",
    },
  ],
};

const TimetableByclass = () => {
  const classOptions = Object.keys(timetableData);
  const [selectedClass, setSelectedClass] = useState(classOptions[0]);

  const selectedTimetable = useMemo(
    () => timetableData[selectedClass] ?? [],
    [selectedClass]
  );

  const isSpecialSlot = (slot) => slot.monday === "Break Time" || slot.monday === "Lunch Time";
  const lessonCount = selectedTimetable.filter((slot) => !isSpecialSlot(slot)).length;
  const breakCount = selectedTimetable.length - lessonCount;

  return (
    <div className="timetable-page">
      <div className="timetable-header">
        <div>
          <h1>Class Timetable</h1>
          <p>View the weekly timetable from Monday to Friday.</p>
        </div>

        <div className="timetable-filter-box">
          <label htmlFor="class-filter">Select class</label>
          <select
            id="class-filter"
            value={selectedClass}
            onChange={(event) => setSelectedClass(event.target.value)}
          >
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="timetable-summary">
        <div className="timetable-summary-card primary">
          <span>Selected Class</span>
          <h2>{selectedClass}</h2>
        </div>

        <div className="timetable-summary-card accent">
          <span>Lessons Per Day</span>
          <h2>{lessonCount}</h2>
        </div>

        <div className="timetable-summary-card muted">
          <span>Break &amp; Lunch</span>
          <h2>{breakCount}</h2>
        </div>
      </div>

      <div className="timetable-table-panel">
        <div className="timetable-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Duration</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              {selectedTimetable.map((slot) => {
                const isBreak = slot.monday === "Break Time";
                const isLunch = slot.monday === "Lunch Time";
                const rowClass = isBreak ? "break-row" : isLunch ? "lunch-row" : "";

                return (
                  <tr key={slot.time} className={rowClass}>
                    <td>{slot.time}</td>
                    <td>{slot.duration}</td>
                    <td>{slot.monday}</td>
                    <td>{slot.tuesday}</td>
                    <td>{slot.wednesday}</td>
                    <td>{slot.thursday}</td>
                    <td>{slot.friday}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetableByclass;