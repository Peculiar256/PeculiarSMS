import React, { useMemo, useState, useEffect } from "react";
import axiosInstance from '../../services/axiosInstance';
import { exportToCSV, exportToExcel } from '../../utils/exporters';
import './TimetableByClass.css';
import './AdminCards.css';

function TimetableByClass() {
  const [classes, setClasses] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [term, setTerm] = useState(1);
  const [selectedDay, setSelectedDay] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [formData, setFormData] = useState({
    className: '',
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    periodName: '',
    startTime: '08:00',
    endTime: '09:00',
    subjectCode: '',
    teacherId: '',
    room: '',
    periodType: 'LESSON',
    notes: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchTimetables();
    fetchSubjects();
    fetchTeachers();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (academicYear && term) {
      if (selectedClass) {
        fetchTimetableForClass();
      } else {
        fetchTimetables();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, academicYear, term]);

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get('/classes');
      const data = response.data;
      const classList = Array.isArray(data) ? data : data.classes || data || [];
      setClasses(Array.isArray(classList) ? classList : []);
    } catch {
      setClasses([]);
    }
  };

  const fetchTimetables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/timetable');
      setTimetables(Array.isArray(response.data) ? response.data : []);
    } catch {
      setTimetables([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetableForClass = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/timetable/class/${selectedClass}/year/${academicYear}/term/${term}`);
      setTimetables(Array.isArray(response.data) ? response.data : []);
    } catch {
      setTimetables([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/subjects');
      const data = response.data;
      const subjectList = data.subjects || data || [];
      setSubjects(Array.isArray(subjectList) ? subjectList : []);
    } catch {
      setSubjects([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get('/teachers');
      const data = response.data;
      const teacherList = data.teachers || data || [];
      setTeachers(Array.isArray(teacherList) ? teacherList : []);
    } catch {
      setTeachers([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axiosInstance.get('/rooms');
      const data = response.data;
      let roomList = [];
      if (Array.isArray(data)) {
        roomList = data;
      } else if (data.rooms && Array.isArray(data.rooms)) {
        roomList = data.rooms;
      }
      setRooms(Array.isArray(roomList) ? roomList : []);
    } catch {
      setRooms([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = async () => {
    try {
      const entry = {
        ...formData,
        periodNumber: parseInt(formData.periodNumber),
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
      };

      await axiosInstance.post('/timetable', entry);
      setShowAddModal(false);
      resetForm();
      fetchTimetableForClass();
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to add timetable entry');
      }
    }
  };

  const handleEditEntry = async () => {
    try {
      const entry = {
        ...formData,
        periodNumber: parseInt(formData.periodNumber),
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
      };

      await axiosInstance.put(`/timetable/${editingEntry.id}`, entry);
      setShowEditModal(false);
      setEditingEntry(null);
      resetForm();
      fetchTimetableForClass();
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to update timetable entry');
      }
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axiosInstance.delete(`/timetable/${id}`);
      fetchTimetableForClass();
    } catch (err) {
      alert('Failed to delete timetable entry');
    }
  };

  const resetForm = () => {
    setFormData({
      className: '',
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      periodName: '',
      startTime: '08:00',
      endTime: '09:00',
      subjectCode: '',
      teacherId: '',
      room: '',
      periodType: 'LESSON',
      notes: '',
    });
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setFormData({
      className: entry.className || '',
      dayOfWeek: entry.dayOfWeek || 'MONDAY',
      periodNumber: entry.periodNumber || 1,
      periodName: entry.periodName || '',
      startTime: entry.startTime ? entry.startTime.substring(0, 5) : '08:00',
      endTime: entry.endTime ? entry.endTime.substring(0, 5) : '09:00',
      subjectCode: entry.subjectCode || '',
      teacherId: entry.teacherId || '',
      room: entry.room || '',
      periodType: entry.periodType || 'LESSON',
      notes: entry.notes || '',
    });
    setShowEditModal(true);
  };

  const handleExportCSV = () => {
    const exportData = timetables.map(t => ({
      Day: t.dayOfWeek,
      Period: t.periodNumber,
      Time: `${t.startTime} - ${t.endTime}`,
      Subject: t.subjectName || t.subjectCode,
      Teacher: t.teacherName || '',
      Room: t.room || '',
      Type: t.periodType,
    }));
    exportToCSV(exportData, 'timetable.csv');
  };

  const handleExportExcel = async () => {
    const exportData = timetables.map(t => ({
      Day: t.dayOfWeek,
      Period: t.periodNumber,
      Time: `${t.startTime} - ${t.endTime}`,
      Subject: t.subjectName || t.subjectCode,
      Teacher: t.teacherName || '',
      Room: t.room || '',
      Type: t.periodType,
    }));
    await exportToExcel(exportData, 'timetable.xlsx');
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const periodTypes = ['LESSON', 'MORNING_PREP', 'BREAK', 'LUNCH', 'GAMES', 'ASSEMBLY', 'PRACTICAL', 'LIBRARY', 'CLUB', 'FREE_PERIOD', 'EVENING_PREP'];

  const filteredTimetables = useMemo(() => {
    return selectedDay === 'all'
      ? timetables
      : timetables.filter(t => t.dayOfWeek === selectedDay);
  }, [timetables, selectedDay]);

  const lessonCount = timetables.filter(t => t.periodType === 'LESSON').length;
  const breakCount = timetables.filter(t => t.periodType === 'BREAK').length;
  const lunchCount = timetables.filter(t => t.periodType === 'LUNCH').length;

  return (
    <div className="timetable-page">
      <div className="timetable-header">
        <div>
          <h1>Timetable Management</h1>
          <p>View and manage class schedules with API integration.</p>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="2024/2025">2024/2025</option>
            <option value="2025/2026">2025/2026</option>
          </select>
          <select
            className="form-select"
            value={term}
            onChange={(e) => setTerm(parseInt(e.target.value))}
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fa-solid fa-plus me-2"></i>Add Entry
          </button>
        </div>
      </div>

      <div className="timetable-filter-box">
        <label htmlFor="class-filter">Select Class</label>
        <select
          id="class-filter"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.name}>{cls.name}</option>
          ))}
        </select>
      </div>

      <div className="stats-grid" style={{ margin: "20px" }}>
        <div className="stat-card">
          <div className="stat-icon student">
            <i className="fa-solid fa-chalkboard"></i>
          </div>
          <div className="stat-info">
            <h3>Total Lessons</h3>
            <p>{lessonCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon attendance">
            <i className="fa-solid fa-mug-hot"></i>
          </div>
          <div className="stat-info">
            <h3>Break Periods</h3>
            <p>{breakCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon classes">
            <i className="fa-solid fa-utensils"></i>
          </div>
          <div className="stat-info">
            <h3>Lunch Periods</h3>
            <p>{lunchCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rooms">
            <i className="fa-solid fa-calendar-days"></i>
          </div>
          <div className="stat-info">
            <h3>Total Entries</h3>
            <p>{timetables.length}</p>
          </div>
        </div>
      </div>

      <div className="timetable-table-panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Timetable Schedule</h5>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Days</option>
              {days.map(day => (
                <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleExportCSV}>
              <i className="fa-solid fa-file-csv me-1"></i>CSV
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleExportExcel}>
              <i className="fa-solid fa-file-excel me-1"></i>Excel
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!loading && !error && (
          <div className="timetable-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Period</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimetables.length > 0 ? (
                  filteredTimetables
                    .sort((a, b) => {
                      const dayOrder = days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
                      if (dayOrder !== 0) return dayOrder;
                      return (a.periodNumber || 0) - (b.periodNumber || 0);
                    })
                    .map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.dayOfWeek?.charAt(0) + entry.dayOfWeek?.slice(1).toLowerCase()}</td>
                        <td>{entry.periodNumber}</td>
                        <td>{entry.startTime} - {entry.endTime}</td>
                        <td>{entry.subjectName || entry.subjectCode}</td>
                        <td>{entry.teacherName || '-'}</td>
                        <td>{entry.room || '-'}</td>
                        <td>
                          <span className={`badge ${entry.periodType === 'LESSON' ? 'bg-primary' : entry.periodType === 'BREAK' ? 'bg-warning' : entry.periodType === 'LUNCH' ? 'bg-success' : 'bg-secondary'}`}>
                            {entry.periodType}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEditModal(entry)}
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">No timetable entries found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="class-modal-overlay">
          <div className="class-modal">
            <div className="class-modal-header">
              <h3>Add Timetable Entry</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
            </div>
            <div className="class-modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Class Name</label>
                  <select
                    className="form-select"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Day</label>
                  <select
                    className="form-select"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Period Number</label>
                  <input
                    type="number"
                    className="form-control"
                    name="periodNumber"
                    value={formData.periodNumber}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Period Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="periodName"
                    value={formData.periodName}
                    onChange={handleInputChange}
                    placeholder="e.g., Period 1, Morning Prep"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.code}>{subject.name} ({subject.code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teacher</label>
                  <select
                    className="form-select"
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Room</label>
                  <select
                    className="form-select"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.roomNumber}>{room.roomNumber} - {room.roomName || 'Room'} ({room.building || 'N/A'})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Period Type</label>
                  <select
                    className="form-select"
                    name="periodType"
                    value={formData.periodType}
                    onChange={handleInputChange}
                  >
                    {periodTypes.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="class-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddEntry}>Add Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditModal && editingEntry && (
        <div className="class-modal-overlay">
          <div className="class-modal">
            <div className="class-modal-header">
              <h3>Edit Timetable Entry</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <div className="class-modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Class Name</label>
                  <select
                    className="form-select"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                  >
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Day</label>
                  <select
                    className="form-select"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Period Number</label>
                  <input
                    type="number"
                    className="form-control"
                    name="periodNumber"
                    value={formData.periodNumber}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.code}>{subject.name} ({subject.code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teacher</label>
                  <select
                    className="form-select"
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Room</label>
                  <select
                    className="form-select"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.roomNumber}>{room.roomNumber} - {room.roomName || 'Room'} ({room.building || 'N/A'})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Period Type</label>
                  <select
                    className="form-select"
                    name="periodType"
                    value={formData.periodType}
                    onChange={handleInputChange}
                  >
                    {periodTypes.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="class-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditEntry}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetableByClass;