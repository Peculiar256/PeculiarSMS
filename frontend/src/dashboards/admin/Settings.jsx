import React, { useState, useEffect } from "react";
import axiosInstance from '../../services/axiosInstance';
import './Settings.css';

function Settings() {
  const [adminProfile, setAdminProfile] = useState({
    fullName: "Admin User",
    email: "admin@school.ac.ug",
    phone: "+256 700 123 456",
    role: "Administrator",
    avatar: null,
    lastLogin: new Date().toISOString(),
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [idGeneration, setIdGeneration] = useState({
    studentIdPrefix: "STU",
    teacherIdPrefix: "TCH",
    staffIdPrefix: "STF",
    startNumber: "1000",
    count: "10",
  });

  const [reportOptions, setReportOptions] = useState({
    studentReport: true,
    teacherReport: true,
    attendanceReport: true,
    academicYear: "2024",
    term: "1",
  });

  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  useEffect(() => {
    loadStudents();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedEmail = localStorage.getItem('email');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setAdminProfile({
          fullName: userData.fullName || userData.name || "Admin User",
          email: storedEmail || userData.email || "admin@school.ac.ug",
          phone: userData.phone || "+256 700 123 456",
          role: userData.role || "Administrator",
          avatar: userData.avatar || null,
          lastLogin: userData.lastLogin || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleProfileChange = (field, value) => {
    setAdminProfile({ ...adminProfile, [field]: value });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAdminProfile({ ...adminProfile, avatar: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleIdChange = (field, value) => {
    setIdGeneration({ ...idGeneration, [field]: value });
  };

  const handleReportChange = (field, value) => {
    setReportOptions({ ...reportOptions, [field]: value });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : {};
      
      const updatedUser = {
        ...parsedUser,
        fullName: adminProfile.fullName,
        phone: adminProfile.phone,
        avatar: adminProfile.avatar,
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save profile" });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      const storedEmail = localStorage.getItem('email');
      if (storedEmail) {
        const response = await axiosInstance.put(`/auth/change-password?userEmail=${encodeURIComponent(storedEmail)}`, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
        setMessage({ type: "success", text: "Password changed successfully" });
      } else {
        setMessage({ type: "error", text: "No email found in storage" });
      }
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  const generateIds = async (type) => {
    setLoading(true);
    try {
      const prefix = idGeneration[`${type}IdPrefix`];
      const startNum = parseInt(idGeneration.startNumber) || 1000;
      const count = parseInt(idGeneration.count) || 10;
      const generatedIds = Array.from({ length: count }, (_, i) => `${prefix}${(startNum + i).toString().padStart(4, '0')}`);
      
      console.log(`Generated ${type} IDs:`, generatedIds);
      setMessage({ type: "success", text: `Generated ${count} ${type} IDs: ${generatedIds.slice(0, 5).join(', ')}${count > 5 ? '...' : ''}` });
    } catch (err) {
      setMessage({ type: "error", text: `Failed to generate ${type} IDs` });
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await axiosInstance.get('/students');
      const data = response.data;
      console.log('Students response:', data);
      const studentList = Array.isArray(data?.students) ? data.students : (Array.isArray(data) ? data : []);
      console.log('Processed students:', studentList);
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to load students:', err);
      setStudents([]);
      setMessage({ type: "error", text: "Failed to load students: " + (err.response?.data?.message || err.message) });
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axiosInstance.get(`/students/${studentId}`);
      setSelectedStudent(response.data);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    }
  };

  const generateStudentReport = async (studentId) => {
    setLoading(true);
    try {
      const resultsResponse = await axiosInstance.get(`/students/${studentId}/results`);
      const resultData = resultsResponse.data;

      const jsPDF = (await import('jspdf')).jsPDF;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      
      // Extract and format grades
      const grades = resultData?.grades || resultData?.results || [];
      const formattedGrades = grades.map(g => ({
        subjectCode: g.subjectCode,
        course: g.subject || g.subjectName || g.subjectCode || "Unknown Subject",
        marks: g.marksObtained || g.score || 0,
        maxMarks: g.maxMarks || 100,
        percentage: g.percentage || ((g.marksObtained || 0) / (g.maxMarks || 100) * 100).toFixed(1),
        grade: g.grade || 'N/A',
        gradePoints: g.gradePoints || 0,
        remarks: g.remarks || '-',
        classPosition: g.classPosition || '-',
        stream: g.stream || 'N/A',
        className: g.className || selectedStudent?.className || selectedStudent?.currentClass || ''
      }));
      
      // Calculate statistics
      const totalMarks = formattedGrades.reduce((sum, g) => sum + g.marks, 0);
      const avgScore = formattedGrades.length > 0 ? (totalMarks / formattedGrades.length).toFixed(1) : 0;
      const bestSubjects = [...formattedGrades].sort((a, b) => b.marks - a.marks).slice(0, 3);
      
      let overallGrade = "Average";
      if (avgScore >= 80) overallGrade = "Excellent";
      else if (avgScore >= 70) overallGrade = "Very Good";
      else if (avgScore >= 60) overallGrade = "Good";
      else if (avgScore >= 50) overallGrade = "Satisfactory";
      
      // Build PDF content
      doc.setFontSize(22);
      doc.text('ACADEMIC PERFORMANCE REPORT', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Peculiar School - Uganda', 105, 30, { align: 'center' });
      doc.text('Academic Excellence Center', 105, 36, { align: 'center' });
      
      // Student Info Table
      autoTable(doc, {
        startY: 45,
        body: [
          ['Student Name', selectedStudent?.firstName + ' ' + selectedStudent?.lastName],
          ['Student ID', selectedStudent?.studentId || selectedStudent?.linn || selectedStudent?.id || 'N/A'],
          ['Class/Form', formattedGrades[0]?.className || selectedStudent?.className || selectedStudent?.currentClass || 'N/A'],
          ['Stream', formattedGrades[0]?.stream || 'N/A'],
          ['Academic Year', reportOptions.academicYear],
          ['Term', reportOptions.term],
          ['Report Date', new Date().toLocaleDateString('en-UG')]
        ],
        theme: 'plain',
        styles: { fontSize: 10 }
      });
      
      // Detailed Marks Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Subject', 'Marks', '%', 'Grade', 'Remarks']],
        body: formattedGrades.map(g => [
          g.course,
          `${g.marks}/${g.maxMarks}`,
          parseFloat(g.percentage).toFixed(1) + '%',
          g.grade,
          g.remarks
        ]),
        theme: 'grid'
      });
      
      // Performance Summary
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        body: [
          ['Performance Summary', ''],
          ['Overall Grade', overallGrade],
          ['Average Score', avgScore + '/100'],
          ['Total Subjects', String(formattedGrades.length)]
        ],
        theme: 'plain',
        styles: { fontSize: 10 }
      });
      
      // Best Performing
      if (bestSubjects.length > 0) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 10,
          body: [
            ['Strengths (Best Performing)', ''],
            ...bestSubjects.map((s, i) => [`   ${i+1}. ${s.course}`, `${s.marks}/${s.maxMarks} (${s.grade})`])
          ],
          theme: 'plain',
          styles: { fontSize: 10 }
        });
      }
      
      // Footer
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 200;
      doc.setFontSize(8);
      doc.text('© ' + new Date().getFullYear() + ' Peculiar School. All rights reserved.', 105, finalY + 20, { align: 'center' });
      doc.text('This is a confidential document. For official use only.', 105, finalY + 27, { align: 'center' });
      
      doc.save(`report-card-${selectedStudent?.studentId || selectedStudent?.id || 'unknown'}.pdf`);
      setMessage({ type: "success", text: "Report card generated and downloaded" });
    } catch (err) {
      console.error('Report generation error:', err);
      setMessage({ type: "error", text: "Failed to generate report card. Please check student data." });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/reports/stats', {
        params: {
          academicYear: reportOptions.academicYear,
          term: reportOptions.term,
        }
      });
      
      const reportTypes = [];
      if (reportOptions.studentReport) reportTypes.push('Student');
      if (reportOptions.teacherReport) reportTypes.push('Teacher');
      if (reportOptions.attendanceReport) reportTypes.push('Attendance');
      
      setMessage({ type: "success", text: `Reports ready for: ${reportTypes.join(', ')}` });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to generate reports" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
        </div>
      )}

      {/* Profile Settings */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-dark-emphasis">
            <i className="fa-solid fa-user me-2"></i>Admin Profile
          </h5>
        </div>
        <div className="card-body px-4">
          <div className="row g-3">
            <div className="col-12 col-md-2 text-center">
              <div className="avatar-upload">
                {adminProfile.avatar ? (
                  <img src={adminProfile.avatar} alt="Avatar" className="rounded-circle mb-2" width="80" height="80" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-2" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                    <i className="fa-solid fa-user fa-2x text-muted"></i>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="d-none" id="avatarInput" />
                <label htmlFor="avatarInput" className="btn btn-sm btn-outline" style={{ borderColor: '#1E40AF', color: '#1E40AF' }}>
                  <i className="fa-solid fa-camera me-1"></i>Change Photo
                </label>
              </div>
            </div>
            <div className="col-12 col-md-10">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={adminProfile.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={adminProfile.email}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    value={adminProfile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Role</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={adminProfile.role}
                    disabled
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" onClick={saveProfile} disabled={loading}>
                    <i className="fa-solid fa-save me-2"></i>{loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-dark-emphasis">
            <i className="fa-solid fa-shield-halved me-2"></i>Security
          </h5>
        </div>
        <div className="card-body px-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Current Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">New Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Confirm Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              />
            </div>
            <div className="col-12">
              <button className="btn btn-warning" onClick={changePassword} disabled={loading}>
                <i className="fa-solid fa-key me-2"></i>{loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ID Generation Settings */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-dark-emphasis">
            <i className="fa-solid fa-id-badge me-2"></i>ID Generation
          </h5>
        </div>
        <div className="card-body px-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Student ID Prefix</label>
              <input 
                type="text" 
                className="form-control" 
                value={idGeneration.studentIdPrefix}
                onChange={(e) => handleIdChange('studentIdPrefix', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Teacher ID Prefix</label>
              <input 
                type="text" 
                className="form-control" 
                value={idGeneration.teacherIdPrefix}
                onChange={(e) => handleIdChange('teacherIdPrefix', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Staff ID Prefix</label>
              <input 
                type="text" 
                className="form-control" 
                value={idGeneration.staffIdPrefix}
                onChange={(e) => handleIdChange('staffIdPrefix', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Start Number</label>
              <input 
                type="number" 
                className="form-control" 
                value={idGeneration.startNumber}
                onChange={(e) => handleIdChange('startNumber', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-success" onClick={() => generateIds('student')} disabled={loading}>
              <i className="fa-solid fa-user-plus me-2"></i>Generate Student IDs
            </button>
            <button className="btn btn-info" onClick={() => generateIds('teacher')} disabled={loading}>
              <i className="fa-solid fa-chalkboard-user me-2"></i>Generate Teacher IDs
            </button>
            <button className="btn btn-secondary" onClick={() => generateIds('staff')} disabled={loading}>
              <i className="fa-solid fa-users me-2"></i>Generate Staff IDs
            </button>
          </div>
        </div>
      </div>

      {/* Student Report Generation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-dark-emphasis">
            <i className="fa-solid fa-file-arrow-down me-2"></i>Student Report Card
          </h5>
        </div>
        <div className="card-body px-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Student</label>
              <div className="d-flex gap-2">
                <select 
                  className="form-select flex-grow-1" 
                  onChange={async (e) => {
                    const val = e.target.value;
                    if (val) {
                      const student = Array.isArray(students) ? students.find(s => String(s.id) === String(val)) : null;
                      if (student) {
                        setSelectedStudent(student);
                      } else {
                        await fetchStudentDetails(val);
                      }
                    } else {
                      setSelectedStudent(null);
                    }
                  }}
                  disabled={loadingStudents}
                >
                  <option value="">Select Student...</option>
                  {Array.isArray(students) && students.length > 0 ? (
                    students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.studentId || student.linn || student.id} - {student.firstName} {student.lastName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No students available</option>
                  )}
                </select>
                <button 
                  className="btn btn-outline-secondary btn-sm" 
                  onClick={loadStudents}
                  disabled={loadingStudents}
                  title="Refresh student list"
                >
                  <i className={`fa-solid ${loadingStudents ? 'fa-spinner fa-spin' : 'fa-refresh'}`}></i>
                </button>
              </div>
              {students.length === 0 && !loadingStudents && (
                <small className="text-muted">Click refresh to load students from database</small>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Academic Year</label>
              <select 
                className="form-select" 
                value={reportOptions.academicYear}
                onChange={(e) => handleReportChange('academicYear', e.target.value)}
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Term</label>
              <select 
                className="form-select" 
                value={reportOptions.term}
                onChange={(e) => handleReportChange('term', e.target.value)}
              >
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-danger" onClick={() => generateStudentReport(selectedStudent?.id)} disabled={loading || !selectedStudent}>
              <i className="fa-solid fa-download me-2"></i>{loading ? 'Generating...' : 'Generate Report Card'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Report Generation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-dark-emphasis">
            <i className="fa-solid fa-folder-open me-2"></i>Bulk Report Generation
          </h5>
        </div>
        <div className="card-body px-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Academic Year</label>
              <select 
                className="form-select" 
                value={reportOptions.academicYear}
                onChange={(e) => handleReportChange('academicYear', e.target.value)}
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Term</label>
              <select 
                className="form-select" 
                value={reportOptions.term}
                onChange={(e) => handleReportChange('term', e.target.value)}
              >
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check me-3">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  checked={reportOptions.studentReport}
                  onChange={(e) => handleReportChange('studentReport', e.target.checked)}
                  id="studentReport"
                />
                <label className="form-check-label" htmlFor="studentReport">Student Report</label>
              </div>
              <div className="form-check me-3">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  checked={reportOptions.teacherReport}
                  onChange={(e) => handleReportChange('teacherReport', e.target.checked)}
                  id="teacherReport"
                />
                <label className="form-check-label" htmlFor="teacherReport">Teacher Report</label>
              </div>
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  checked={reportOptions.attendanceReport}
                  onChange={(e) => handleReportChange('attendanceReport', e.target.checked)}
                  id="attendanceReport"
                />
                <label className="form-check-label" htmlFor="attendanceReport">Attendance Report</label>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-danger" onClick={generateReport} disabled={loading}>
              <i className="fa-solid fa-download me-2"></i>{loading ? 'Generating...' : 'Generate All Reports'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;