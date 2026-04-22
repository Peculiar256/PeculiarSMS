import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import '../css/Attendance.css';
import parentService from '../../../services/parentService';

function Attendance() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadAttendance();
      loadStats();
    }
  }, [selectedChild, selectedMonth]);

  const loadChildren = async () => {
    const data = await parentService.getMyChildren();
    if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0]);
    }
    setLoading(false);
  };

  const loadAttendance = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildAttendance(selectedChild.id);
    if (data) {
      setAttendance(data);
    }
  };

  const loadStats = async () => {
    if (!selectedChild) return;
    const data = await parentService.getChildAttendanceStats(selectedChild.id);
    if (data) {
      setStats(data);
    }
  };

  const getAttendanceStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return { label: 'Present', className: 'status-present' };
      case 'absent':
        return { label: 'Absent', className: 'status-absent' };
      case 'late':
        return { label: 'Late', className: 'status-late' };
      case 'excused':
        return { label: 'Excused', className: 'status-excused' };
      default:
        return { label: status, className: 'status-neutral' };
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const date = new Date(record.date);
    return date.getMonth() + 1 === selectedMonth;
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h1>Attendance Record</h1>
        <p>Monitor your child's attendance and punctuality</p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="child-selector-bar">
          <label>Select Child:</label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => c.id === parseInt(e.target.value));
              setSelectedChild(child);
            }}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {children.length === 0 && (
        <div className="no-data-container">
          <p>No children found. Please link your children to your account.</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card present">
            <Calendar size={24} />
            <div>
              <h3>Attendance Rate</h3>
              <p>{stats.attendancePercentage?.toFixed(1) || 0}%</p>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp size={24} />
            <div>
              <h3>Total Days Present</h3>
              <p>{stats.presentDays || 0}</p>
            </div>
          </div>
          <div className={`stat-card ${stats.absentDays > 5 ? 'warning' : ''}`}>
            <AlertCircle size={24} />
            <div>
              <h3>Days Absent</h3>
              <p>{stats.absentDays || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <Calendar size={24} />
            <div>
              <h3>Late Days</h3>
              <p>{stats.lateDays || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Month Selector */}
      <div className="month-selector">
        <label>Filter by Month:</label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2024, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        {filteredAttendance.length > 0 ? (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Class</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => {
                const date = new Date(record.date);
                const statusInfo = getAttendanceStatus(record.status);
                return (
                  <tr key={record.id}>
                    <td>{date.toLocaleDateString()}</td>
                    <td>{date.toLocaleDateString('en-US', { weekday: 'short' })}</td>
                    <td>
                      <span className={`status-badge ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{record.className || 'N/A'}</td>
                    <td>{record.remarks || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No attendance records for this month</p>
          </div>
        )}
      </div>

      {/* Attendance Legend */}
      <div className="attendance-legend">
        <h3>Status Guide</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-badge status-present">P</span>
            <span>Present</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge status-absent">A</span>
            <span>Absent</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge status-late">L</span>
            <span>Late</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge status-excused">E</span>
            <span>Excused Absence</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
