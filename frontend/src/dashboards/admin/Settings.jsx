import React, { useState, useEffect } from "react";
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

function Settings() {
  const [showPassword, setShowPassword] = useState(false);
  const { user, updateUser } = useAuth();
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

  const [reportOptions, setReportOptions] = useState({
    studentReport: true,
    teacherReport: true,
    attendanceReport: true,
    academicYear: "2024",
    term: "1",
  });

  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAdminProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAdminProfile = async () => {
    try {
      if (user) {
        setAdminProfile({
          fullName: user.fullName || user.name || "Admin User",
          email: user.email || "admin@school.ac.ug",
          phone: user.phone || "+256 700 123 456",
          role: user.role || "Administrator",
          avatar: user.avatar || null,
          lastLogin: user.lastLogin || new Date().toISOString(),
        });
      }
    } catch {
      console.error('Failed to fetch profile');
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

  const handleReportChange = (field, value) => {
    setReportOptions({ ...reportOptions, [field]: value });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        fullName: adminProfile.fullName,
        phone: adminProfile.phone,
        avatar: adminProfile.avatar,
      };

      updateUser(updatedUser);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch {
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
        await axiosInstance.put(`/auth/change-password?userEmail=${encodeURIComponent(storedEmail)}`, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
        setMessage({ type: "success", text: "Password changed successfully" });
      } else {
        setMessage({ type: "error", text: "No email found in storage" });
      }
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setMessage({ type: "error", text: "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await axiosInstance.get('/students');
      const data = response.data;
      const studentList = Array.isArray(data?.students) ? data.students : (Array.isArray(data) ? data : []);
      setStudents(studentList);
    } catch (err) {
      setStudents([]);
      setMessage({ type: "error", text: "Failed to load students: " + (err.response?.data?.message || err.message) });
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await axiosInstance.get('/teachers');
      const data = response.data;
      const teacherList = data?.teachers || data || [];
      setTeachers(teacherList);
    } catch (err) {
      setTeachers([]);
      setMessage({ type: "error", text: "Failed to load teachers: " + (err.response?.data?.message || err.message) });
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axiosInstance.get(`/students/${studentId}`);
      setSelectedStudent(response.data);
    } catch {
      setMessage({ type: "error", text: "Failed to fetch student details" });
    }
  };

  const generateStudentReport = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const resultsResponse = await axiosInstance.get(`/students/${studentId}/results`);
      const resultData = resultsResponse.data;

      const jsPDF = (await import('jspdf')).jsPDF;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      
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
      
      const totalMarks = formattedGrades.reduce((sum, g) => sum + g.marks, 0);
      const avgScore = formattedGrades.length > 0 ? (totalMarks / formattedGrades.length).toFixed(1) : 0;
      const bestSubjects = [...formattedGrades].sort((a, b) => b.marks - a.marks).slice(0, 3);
      
      let overallGrade = "Average";
      if (avgScore >= 80) overallGrade = "Excellent";
      else if (avgScore >= 70) overallGrade = "Very Good";
      else if (avgScore >= 60) overallGrade = "Good";
      else if (avgScore >= 50) overallGrade = "Satisfactory";
      
      doc.setFontSize(22);
      doc.text('ACADEMIC PERFORMANCE REPORT', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Peculiar School - Uganda', 105, 30, { align: 'center' });
      doc.text('Academic Excellence Center', 105, 36, { align: 'center' });
      
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
      
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 200;
      doc.setFontSize(8);
      doc.text('© ' + new Date().getFullYear() + ' Peculiar School. All rights reserved.', 105, finalY + 20, { align: 'center' });
      doc.text('This is a confidential document. For official use only.', 105, finalY + 27, { align: 'center' });
      
      doc.save(`report-card-${selectedStudent?.studentId || selectedStudent?.id || 'unknown'}.pdf`);
      setMessage({ type: "success", text: "Report card generated and downloaded" });
    } catch {
      setMessage({ type: "error", text: "Failed to generate report card. Please check student data." });
    } finally {
      setLoading(false);
    }
  };

  const generateIdCard = async (type, userId) => {
    if (!userId) {
      setMessage({ type: "error", text: "Please select a user first" });
      return;
    }

    setLoading(true);
    try {
      const userData = type === 'student' 
        ? (await axiosInstance.get(`/students/${userId}`)).data
        : (await axiosInstance.get(`/teachers/${userId}`)).data;
      
      const jsPDF = (await import('jspdf')).jsPDF;
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85.6, 53.98]
      });

      const idNumber = type === 'student' ? userData.studentId || userData.linn || userData.id : userData.teacherId || userData.id;
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      const photoUrl = userData.avatar || userData.photoUrl || userData.profilePicture;

      doc.setFillColor(30, 64, 191);
      doc.rect(0, 0, 85.6, 15, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('PECULIAR SCHOOL', 42.8, 9, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Uganda', 42.8, 13, { align: 'center' });

      if (photoUrl) {
        try {
          const img = new Image();
          img.src = photoUrl;
          await new Promise(resolve => { img.onload = resolve; });
          doc.addImage(img, 'JPEG', 5, 20, 25, 25);
        } catch {
          doc.setFillColor(230, 230, 230);
          doc.rect(5, 20, 25, 25, 'F');
        }
      } else {
        doc.setFillColor(230, 230, 230);
        doc.rect(5, 20, 25, 25, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text('PHOTO', 17.5, 34, { align: 'center' });
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text('ID: ' + idNumber, 35, 25);
      doc.text(fullName, 35, 32);
      doc.setFontSize(8);
      doc.text(type === 'student' ? 'Student' : 'Teacher', 35, 38);
      
      if (type === 'student') {
        doc.text('Class: ' + (userData.className || userData.currentClass || 'N/A'), 35, 44);
        doc.text('Stream: ' + (userData.stream || 'N/A'), 35, 50);
      } else {
        doc.text('Dept: ' + (userData.department?.name || 'N/A'), 35, 44);
        doc.text('Phone: ' + (userData.phone || 'N/A'), 35, 50);
      }

      doc.setFillColor(30, 64, 191);
      doc.rect(0, 48, 85.6, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.text(`Valid: ${new Date().getFullYear()}`, 42.8, 51, { align: 'center' });

      doc.save(`id-card-${idNumber}.pdf`);
      setMessage({ type: "success", text: "ID Card generated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to generate ID card" });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      await axiosInstance.get('/reports/stats', {
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
    } catch {
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
              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control" 
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Current Password"
                />
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">New Password</label>
              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control" 
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="New Password"
                />
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Confirm Password</label>
              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm New Password"
                />
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="col-12">
              <button className="btn btn-warning" onClick={changePassword} disabled={loading}>
                <i className="fa-solid fa-key me-2"></i>{loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Generation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-dark-emphasis">
            <i className="fa-solid fa-id-card me-2"></i>ID Card Generation
          </h5>
        </div>
        <div className="card-body px-4">
          <p className="text-muted mb-3">Generate professional ID cards for students and teachers with photo, details, and school branding.</p>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Student</label>
              <div className="d-flex gap-2">
                <select 
                  className="form-select flex-grow-1" 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const student = Array.isArray(students) ? students.find(s => String(s.id) === String(val)) : null;
                      if (student) setSelectedStudent(student);
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
                    <option value="" disabled>No students loaded</option>
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
              {selectedStudent && (
                <button 
                  className="btn btn-sm btn-outline-primary mt-2" 
                  onClick={() => { setPreviewType('student'); setShowPreview(true); }}
                >
                  <i className="fa-solid fa-eye me-1"></i>Preview ID Card
                </button>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Teacher</label>
              <div className="d-flex gap-2">
                <select 
                  className="form-select flex-grow-1" 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const teacher = Array.isArray(teachers) ? teachers.find(t => String(t.id) === String(val)) : null;
                      if (teacher) setSelectedTeacher(teacher);
                    } else {
                      setSelectedTeacher(null);
                    }
                  }}
                  disabled={loadingTeachers}
                >
                  <option value="">Select Teacher...</option>
                  {Array.isArray(teachers) && teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.teacherId || teacher.id} - {teacher.firstName} {teacher.lastName} ({teacher.department?.name || 'N/A'})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No teachers loaded</option>
                  )}
                </select>
                <button 
                  className="btn btn-outline-secondary btn-sm" 
                  onClick={loadTeachers}
                  disabled={loadingTeachers}
                  title="Refresh teacher list"
                >
                  <i className={`fa-solid ${loadingTeachers ? 'fa-spinner fa-spin' : 'fa-refresh'}`}></i>
                </button>
              </div>
              {selectedTeacher && (
                <button 
                  className="btn btn-sm btn-outline-info mt-2" 
                  onClick={() => { setPreviewType('teacher'); setShowPreview(true); }}
                >
                  <i className="fa-solid fa-eye me-1"></i>Preview ID Card
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-3 d-flex gap-2">
            <button 
              className="btn btn-primary" 
              onClick={() => generateIdCard('student', selectedStudent?.id)} 
              disabled={loading || !selectedStudent}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>Download Student ID Card
            </button>
            <button 
              className="btn btn-info" 
              onClick={() => generateIdCard('teacher', selectedTeacher?.id)} 
              disabled={loading || !selectedTeacher}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>Download Teacher ID Card
            </button>
          </div>
          
          <hr className="my-4" />
          
          <h6 className="fw-bold mb-3">Bulk ID Card Generation</h6>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-success" 
              onClick={async () => {
                setLoading(true);
                try {
                  await loadStudents();
                  for (const student of students) {
                    await generateIdCard('student', student.id);
                    await new Promise(r => setTimeout(r, 300));
                  }
                  setMessage({ type: "success", text: `Generated ${students.length} student ID cards` });
                } catch {
                  setMessage({ type: "error", text: "Bulk generation failed" });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || students.length === 0}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-users'} me-2`}></i>Generate All Student ID Cards
            </button>
            <button 
              className="btn btn-warning" 
              onClick={async () => {
                setLoading(true);
                try {
                  await loadTeachers();
                  for (const teacher of teachers) {
                    await generateIdCard('teacher', teacher.id);
                    await new Promise(r => setTimeout(r, 300));
                  }
                  setMessage({ type: "success", text: `Generated ${teachers.length} teacher ID cards` });
                } catch {
                  setMessage({ type: "error", text: "Bulk generation failed" });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || teachers.length === 0}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-chalkboard-user'} me-2`}></i>Generate All Teacher ID Cards
            </button>
          </div>
        </div>
      </div>

      {/* ID Card Preview Modal */}
      {showPreview && (previewType === 'student' ? selectedStudent : selectedTeacher) && (
        <div className="class-modal-overlay">
          <div className="class-modal" style={{ maxWidth: '400px' }}>
            <div className="class-modal-header">
              <h3>ID Card Preview</h3>
              <button className="btn-close" onClick={() => setShowPreview(false)}></button>
            </div>
            <div className="class-modal-body">
              <div className="id-card-preview" style={{ 
                width: '330px', 
                minHeight: '200px', 
                border: '2px solid #1E40AF', 
                borderRadius: '8px',
                padding: '10px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                position: 'relative',
                fontFamily: 'Arial, sans-serif'
              }}>
                <div style={{ 
                  background: '#1E40AF', 
                  color: 'white', 
                  padding: '5px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  fontSize: '12px',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}>
                  PECULIAR SCHOOL - UGANDA
                </div>
                
                <div className="d-flex">
                  <div style={{ width: '80px', height: '100px', background: '#e9ecef', borderRadius: '4px', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {(previewType === 'student' ? selectedStudent.avatar : selectedTeacher?.avatar) ? (
                      <img 
                        src={previewType === 'student' ? selectedStudent.avatar : selectedTeacher?.avatar} 
                        alt="Photo" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <i className="fa-solid fa-user fa-2x text-muted"></i>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, fontSize: '10px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>
                      {previewType === 'student' ? selectedStudent.firstName + ' ' + selectedStudent.lastName : selectedTeacher?.firstName + ' ' + selectedTeacher?.lastName}
                    </div>
                    <div><strong>ID:</strong> {previewType === 'student' ? (selectedStudent.studentId || selectedStudent.linn || selectedStudent.id) : (selectedTeacher?.teacherId || selectedTeacher?.id)}</div>
                    <div><strong>Type:</strong> {previewType === 'student' ? 'Student' : 'Teacher'}</div>
                    {previewType === 'student' ? (
                      <>
                        <div><strong>Class:</strong> {selectedStudent.className || selectedStudent.currentClass || 'N/A'}</div>
                        <div><strong>Stream:</strong> {selectedStudent.stream || 'N/A'}</div>
                      </>
                    ) : (
                      <>
                        <div><strong>Dept:</strong> {selectedTeacher?.department?.name || 'N/A'}</div>
                        <div><strong>Phone:</strong> {selectedTeacher?.phone || 'N/A'}</div>
                      </>
                    )}
                  </div>
                </div>
                
                <div style={{ 
                  position: 'absolute', 
                  bottom: '10px', 
                  left: '10px', 
                  right: '10px',
                  borderTop: '1px dashed #1E40AF',
                  paddingTop: '5px',
                  fontSize: '8px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  Valid: {new Date().getFullYear()} | Principal Signature
                </div>
              </div>
            </div>
            <div className="class-modal-footer">
              <button className="btn btn-secondary me-2" onClick={() => setShowPreview(false)}>Close</button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (previewType === 'student') {
                    generateIdCard('student', selectedStudent?.id);
                  } else {
                    generateIdCard('teacher', selectedTeacher?.id);
                  }
                  setShowPreview(false);
                }}
                disabled={loading}
              >
                <i className="fa-solid fa-download me-1"></i>Download ID Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Report Card */}
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