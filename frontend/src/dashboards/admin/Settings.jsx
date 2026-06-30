import React, { useState, useEffect } from "react";
import axiosInstance from '../../services/axiosInstance';
import schoolService from '../../services/schoolService';
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

  const [schoolProfile, setSchoolProfile] = useState({
    schoolName: "",
    address: "",
    city: "",
    district: "",
    country: "Uganda",
    phoneNumber: "",
    email: "",
    website: "",
    motto: "",
    vision: "",
    mission: "",
    schoolType: "Secondary",
    registrationNumber: "",
    schoolLevel: "O & A Level",
    logo: null,
    principalName: "",
    establishedYear: "",
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

  const [emailData, setEmailData] = useState({
    currentPassword: "",
    newEmail: "",
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
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [schoolAccordionOpen, setSchoolAccordionOpen] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAdminProfile();
    }
    fetchSchoolProfile();
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

  const fetchSchoolProfile = async () => {
    setLoadingSchool(true);
    try {
      const result = await schoolService.getSchool();
      if (result.success && result.hasSchool && result.data) {
        const s = result.data;
        setSchoolProfile({
          schoolName: s.schoolName || "",
          address: s.address || "",
          city: s.city || "",
          district: s.district || "",
          country: s.country || "Uganda",
          phoneNumber: s.phoneNumber || "",
          email: s.email || "",
          website: s.website || "",
          motto: s.motto || "",
          vision: s.vision || "",
          mission: s.mission || "",
          schoolType: s.schoolType || "Secondary",
          registrationNumber: s.registrationNumber || "",
          schoolLevel: s.schoolLevel || "O & A Level",
          logo: s.logo || null,
          principalName: s.principalName || "",
          establishedYear: s.establishedYear || "",
        });
      }
    } catch {
      console.error('Failed to fetch school profile');
    } finally {
      setLoadingSchool(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setAdminProfile({ ...adminProfile, [field]: value });
  };

  const handleSchoolChange = (field, value) => {
    setSchoolProfile({ ...schoolProfile, [field]: value });
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

  const handleSchoolLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Logo file size must be under 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSchoolProfile({ ...schoolProfile, logo: event.target.result });
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

  const handleEmailChange = (field, value) => {
    setEmailData({ ...emailData, [field]: value });
  };

  const changeEmail = async () => {
    if (!emailData.currentPassword || !emailData.newEmail) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    setLoading(true);
    try {
      const storedEmail = user?.email || adminProfile.email;
      if (storedEmail) {
        await axiosInstance.put(`/auth/change-email?userEmail=${encodeURIComponent(storedEmail)}`, {
          currentPassword: emailData.currentPassword,
          newEmail: emailData.newEmail,
        });
        setMessage({ type: "success", text: "Email changed successfully" });
        // Update admin profile
        setAdminProfile({ ...adminProfile, email: emailData.newEmail });
        setEmailData({ currentPassword: "", newEmail: "" });
      } else {
        setMessage({ type: "error", text: "No email found in storage" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to change email" });
    } finally {
      setLoading(false);
    }
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

  const saveSchoolProfile = async () => {
    if (!schoolProfile.schoolName) {
      setMessage({ type: "error", text: "School name is required" });
      return;
    }
    setLoadingSchool(true);
    try {
      await schoolService.saveSchool(schoolProfile);
      setMessage({ type: "success", text: "School profile saved successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to save school profile" });
    } finally {
      setLoadingSchool(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      const storedEmail = user?.email || adminProfile.email;
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

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

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

      const schoolName = schoolProfile.schoolName || 'PECULIAR SCHOOL';
      const schoolAddress = [schoolProfile.address, schoolProfile.city, schoolProfile.district, schoolProfile.country].filter(Boolean).join(', ');
      const schoolContact = ['Tel: ' + schoolProfile.phoneNumber, 'Email: ' + schoolProfile.email].filter(Boolean).join(' | ');
      const studentName = selectedStudent?.firstName + ' ' + selectedStudent?.lastName;
      const studentIdNum = selectedStudent?.studentId || selectedStudent?.linn || selectedStudent?.id || 'N/A';
      const studentClass = formattedGrades[0]?.className || selectedStudent?.className || selectedStudent?.currentClass || 'N/A';
      const studentStream = formattedGrades[0]?.stream || 'N/A';

      const primaryColor = [0, 32, 69];
      const surfaceColor = [247, 249, 251];
      const labelColor = [67, 71, 78];
      const borderColor = [200, 204, 207];
      const pageMargin = 12;
      const pageWidth = 210;
      const contentWidth = pageWidth - (pageMargin * 2);

      let cursorY = 10;

      // ── HEADER ──────────────────────────────────────────────
      const headerHeight = 38;
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');

      if (schoolProfile.logo) {
        try {
          const logoImg = new Image();
          logoImg.src = schoolProfile.logo;
          await new Promise(resolve => { logoImg.onload = resolve; });
          doc.addImage(schoolProfile.logo, 'PNG', 15, 6, 26, 26);
        } catch {
          doc.setFillColor(255, 255, 255);
          doc.rect(15, 6, 26, 26, 'F');
        }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('ACADEMIC EXCELLENCE CENTER', pageWidth / 2, 10, { align: 'center' });
      doc.setFontSize(16);
      doc.text(schoolName.toUpperCase(), pageWidth / 2, 18, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      if (schoolAddress) doc.text(schoolAddress, pageWidth / 2, 24, { align: 'center' });
      if (schoolContact) doc.text(schoolContact, pageWidth / 2, 29, { align: 'center' });

      cursorY = headerHeight + 4;

      // ── STUDENT INFO BLOCK ───────────────────────────────────
      const infoBlockHeight = 26;
      doc.setFillColor(...surfaceColor);
      doc.rect(pageMargin, cursorY, contentWidth, infoBlockHeight, 'F');
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.rect(pageMargin, cursorY, contentWidth, infoBlockHeight, 'S');

      const col1X = pageMargin + 4;
      const col2X = pageMargin + (contentWidth / 2) + 2;
      const row1Y = cursorY + 5;
      const row2Y = cursorY + 13;
      const row3Y = cursorY + 21;

      const drawInfoLabel = (text, x, y) => {
        doc.setTextColor(...labelColor);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(text.toUpperCase(), x, y);
      };
      const drawInfoValue = (text, x, y, maxWidth = 80) => {
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(text || 'N/A', x, y + 5, { maxWidth });
      };

      drawInfoLabel('Student Name', col1X, row1Y);
      drawInfoValue(studentName, col1X, row1Y, 85);
      drawInfoLabel('Student ID', col2X, row1Y);
      drawInfoValue(studentIdNum, col2X, row1Y, 80);

      drawInfoLabel('Class / Form', col1X, row2Y);
      drawInfoValue(studentClass, col1X, row2Y, 85);
      drawInfoLabel('Stream', col2X, row2Y);
      drawInfoValue(studentStream, col2X, row2Y, 80);

      drawInfoLabel('Academic Year', col1X, row3Y);
      drawInfoValue(reportOptions.academicYear, col1X, row3Y, 40);
      drawInfoLabel('Term / Semester', col1X + 50, row3Y);
      drawInfoValue(reportOptions.term, col1X + 50, row3Y, 25);
      drawInfoLabel('Report Date', col2X, row3Y);
      drawInfoValue(new Date().toLocaleDateString('en-UG'), col2X, row3Y, 80);

      cursorY += infoBlockHeight + 5;

      // ── ACADEMIC RECORD TABLE ────────────────────────────────
      const sectionHeaderHeight = 7;
      doc.setFillColor(...primaryColor);
      doc.rect(pageMargin, cursorY, contentWidth, sectionHeaderHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('ACADEMIC RECORD', pageMargin + 4, cursorY + 5);
      cursorY += sectionHeaderHeight;

      autoTable(doc, {
        startY: cursorY,
        head: [['SUBJECT', 'MARKS / 100', 'PERCENTAGE', 'GRADE', 'REMARKS']],
        body: formattedGrades.map(g => [
          g.course,
          `${g.marks} / ${g.maxMarks}`,
          parseFloat(g.percentage).toFixed(1) + '%',
          g.grade,
          g.remarks
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [...primaryColor],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          lineColor: [...borderColor],
          lineWidth: 0.3
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [25, 28, 30],
          lineColor: [...borderColor],
          lineWidth: 0.3
        },
        alternateRowStyles: {
          fillColor: [...surfaceColor]
        },
        styles: {
          cellPadding: 3,
          lineWidth: 0.3,
          lineColor: [...borderColor]
        },
        columnStyles: {
          0: { cellWidth: 70, halign: 'left' },
          1: { cellWidth: 35, halign: 'center' },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' }
        }
      });

      cursorY = doc.lastAutoTable.finalY + 6;

      // ── TWO-COLUMN LAYOUT: GRADING SCALE + PERFORMANCE SUMMARY ──
      const leftColX = pageMargin;
      const rightColX = pageMargin + (contentWidth / 2) + 3;
      const twoColWidth = (contentWidth / 2) - 3;

      // Calculate available vertical space
      const pageBottom = 270;
      const availableHeight = pageBottom - cursorY;

      // LEFT COLUMN: Grading Scale
      doc.setFillColor(...primaryColor);
      doc.rect(leftColX, cursorY, twoColWidth, sectionHeaderHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('GRADING SCALE', leftColX + 4, cursorY + 5);
      const gradingTop = cursorY + sectionHeaderHeight;

      autoTable(doc, {
        startY: gradingTop,
        head: [['Grade', 'Range', 'Description']],
        body: [
          ['D1', '80 - 100', 'Distinction One'],
          ['D2', '75 - 79', 'Distinction Two'],
          ['C3', '70 - 74', 'Credit Three'],
          ['C4', '65 - 69', 'Credit Four'],
          ['C5', '60 - 64', 'Credit Five'],
          ['C6', '55 - 59', 'Credit Six'],
          ['P7', '50 - 54', 'Pass Seven'],
          ['P8', '45 - 49', 'Pass Eight'],
          ['F9', '0 - 44', 'Fail']
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [...primaryColor],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          lineColor: [...borderColor],
          lineWidth: 0.3
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [25, 28, 30],
          lineColor: [...borderColor],
          lineWidth: 0.3
        },
        alternateRowStyles: {
          fillColor: [...surfaceColor]
        },
        styles: {
          cellPadding: 2,
          lineWidth: 0.3,
          lineColor: [...borderColor]
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' },
          1: { cellWidth: 28, halign: 'center' },
          2: { cellWidth: twoColWidth - 46, halign: 'left' }
        }
      });

      const gradingBottom = doc.lastAutoTable.finalY;

      // RIGHT COLUMN: Performance Summary
      const summaryHeight = 28;
      const summaryY = cursorY;
      doc.setFillColor(...primaryColor);
      doc.rect(rightColX, summaryY, twoColWidth, sectionHeaderHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PERFORMANCE SUMMARY', rightColX + 4, summaryY + 5);

      doc.setFillColor(...surfaceColor);
      doc.rect(rightColX, summaryY + sectionHeaderHeight, twoColWidth, summaryHeight - sectionHeaderHeight, 'F');
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.rect(rightColX, summaryY + sectionHeaderHeight, twoColWidth, summaryHeight - sectionHeaderHeight, 'S');

      const summaryLabelX = rightColX + 4;
      const summaryValueX = rightColX + twoColWidth - 4;
      const summaryRow1 = summaryY + sectionHeaderHeight + 6;
      const summaryRow2 = summaryY + sectionHeaderHeight + 14;
      const summaryRow3 = summaryY + sectionHeaderHeight + 22;

      doc.setTextColor(...labelColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Average Score', summaryLabelX, summaryRow1);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(avgScore + ' / 100', summaryValueX, summaryRow1, { align: 'right' });

      doc.setTextColor(...labelColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Grade', summaryLabelX, summaryRow2);
      doc.setTextColor(...primaryColor);
      doc.text(overallGrade, summaryValueX, summaryRow2, { align: 'right' });

      doc.setTextColor(...labelColor);
      doc.text('Total Subjects', summaryLabelX, summaryRow3);
      doc.setTextColor(...primaryColor);
      doc.text(String(formattedGrades.length), summaryValueX, summaryRow3, { align: 'right' });

      // Move cursor below both columns
      cursorY = Math.max(gradingBottom, summaryY + summaryHeight) + 6;

      // ── ATTENDANCE RECORD ────────────────────────────────────
      const attendanceHeight = 22;
      doc.setFillColor(...primaryColor);
      doc.rect(pageMargin, cursorY, contentWidth, sectionHeaderHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('ATTENDANCE RECORD', pageMargin + 4, cursorY + 5);
      cursorY += sectionHeaderHeight;

      doc.setFillColor(...surfaceColor);
      doc.rect(pageMargin, cursorY, contentWidth, attendanceHeight, 'F');
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.rect(pageMargin, cursorY, contentWidth, attendanceHeight, 'S');

      doc.setTextColor(...labelColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Days Present:', pageMargin + 4, cursorY + 8);
      doc.setTextColor(...primaryColor);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('68 / 70', pageMargin + 4, cursorY + 17);

      const barX = pageMargin + 35;
      const barWidth = contentWidth - 40;
      const barHeight = 8;
      const barY = cursorY + 6;
      doc.setFillColor(220, 223, 228);
      doc.rect(barX, barY, barWidth, barHeight, 'F');
      doc.setFillColor(0, 108, 74);
      doc.rect(barX, barY, barWidth * 0.97, barHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('97%', barX + barWidth / 2, barY + 5.5, { align: 'center' });

      cursorY += attendanceHeight + 5;

      // ── CLASS TEACHER'S REMARKS ──────────────────────────────
      const remarksHeight = 28;
      doc.setFillColor(...primaryColor);
      doc.rect(pageMargin, cursorY, contentWidth, sectionHeaderHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text("CLASS TEACHER'S REMARKS", pageMargin + 4, cursorY + 5);
      cursorY += sectionHeaderHeight;

      doc.setFillColor(...surfaceColor);
      doc.rect(pageMargin, cursorY, contentWidth, remarksHeight, 'F');
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.rect(pageMargin, cursorY, contentWidth, remarksHeight, 'S');

      doc.setTextColor(...labelColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const remarksText = selectedStudent?.stream === 'Sciences'
        ? 'Sadat is a disciplined student who shows exceptional interest in Mathematics. Consistent effort will yield even better results.'
        : 'A dedicated learner with strong commitment to academic excellence. Keep striving for improvement in all subjects.';
      doc.text(remarksText, pageMargin + 4, cursorY + 7, { maxWidth: contentWidth - 8, lineHeightFactor: 1.5 });
      doc.text('Class Teacher', pageMargin + 4, cursorY + remarksHeight - 5);

      cursorY += remarksHeight + 5;

      // ── SIGNATURE LINES ──────────────────────────────────────
      const sigSectionHeight = 22;
      const sigColWidth = contentWidth / 3;

      doc.setTextColor(...labelColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('CLASS TEACHER', pageMargin + sigColWidth / 2, cursorY + 4, { align: 'center' });
      doc.text('PARENT / GUARDIAN', pageMargin + sigColWidth + sigColWidth / 2, cursorY + 4, { align: 'center' });
      doc.text("PRINCIPAL'S SIGNATURE", pageMargin + (sigColWidth * 2) + sigColWidth / 2, cursorY + 4, { align: 'center' });

      doc.setDrawColor(180, 184, 188);
      doc.setLineWidth(0.3);
      doc.line(pageMargin + 5, cursorY + 7, pageMargin + sigColWidth - 5, cursorY + 7);
      doc.line(pageMargin + sigColWidth + 5, cursorY + 7, pageMargin + (sigColWidth * 2) - 5, cursorY + 7);
      doc.line(pageMargin + (sigColWidth * 2) + 5, cursorY + 7, pageMargin + contentWidth - 5, cursorY + 7);

      cursorY += sigSectionHeight + 5;

      // ── FOOTER ───────────────────────────────────────────────
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.line(pageMargin, cursorY, pageMargin + contentWidth, cursorY);

      doc.setTextColor(...labelColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(schoolName.toUpperCase(), pageWidth / 2, cursorY + 8, { align: 'center' });

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('© ' + new Date().getFullYear() + ' ' + schoolName + '. All rights reserved.', pageWidth / 2, cursorY + 14, { align: 'center' });
      doc.text('This is a confidential document. For official use only. Any alteration to this report card renders it invalid.', pageWidth / 2, cursorY + 19, { align: 'center' });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(pageMargin, cursorY + 22, pageMargin + contentWidth, cursorY + 22);

      doc.setTextColor(...labelColor);
      doc.setFontSize(7);
      doc.text('CONTACT US', pageMargin + 30, cursorY + 27, { align: 'center' });
      doc.text('PRIVACY POLICY', pageWidth / 2, cursorY + 27, { align: 'center' });
      doc.text('VERIFICATION PORTAL', pageMargin + contentWidth - 30, cursorY + 27, { align: 'center' });

      doc.setDrawColor(180, 184, 188);
      doc.setLineWidth(0.3);
      doc.line(pageMargin, cursorY + 29, pageMargin + contentWidth, cursorY + 29);

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

      const schoolLogo = schoolProfile.logo;
      if (schoolLogo) {
        try {
          const schoolImg = new Image();
          schoolImg.src = schoolLogo;
          await new Promise(resolve => { schoolImg.onload = resolve; });
          doc.addImage(schoolLogo, 'PNG', 2, 1, 6, 13);
        } catch {
          doc.setTextColor(255, 255, 255);
        }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const schoolNameText = (schoolProfile.schoolName || 'PECULIAR SCHOOL').toUpperCase();
      const maxTextWidth = schoolLogo ? 72 : 85;
      doc.text(schoolNameText, schoolLogo ? 49 : 42.8, 7, { align: 'center', maxWidth: maxTextWidth });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const locationText = [schoolProfile.city, schoolProfile.country].filter(Boolean).join(', ') || 'Uganda';
      doc.text(locationText, 42.8, 12, { align: 'center' });

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
      doc.setFontSize(9);
      doc.text('ID: ' + idNumber, 35, 25);
      doc.text(fullName, 35, 31);
      doc.setFontSize(8);
      doc.text('Gender: ' + (userData.gender || 'N/A'), 35, 37);
      doc.text(type === 'student' ? 'Student' : 'Teacher', 35, 43);
      
      if (type === 'student') {
        doc.text('Class: ' + (userData.className || userData.currentClass || 'N/A'), 35, 49);
        doc.text('Stream: ' + (userData.stream || 'N/A'), 35, 54);
      } else {
        doc.text('Dept: ' + (userData.department?.name || 'N/A'), 35, 49);
        doc.text('Phone: ' + (userData.phone || 'N/A'), 35, 54);
      }

      doc.setFillColor(30, 64, 191);
      doc.rect(0, 56, 85.6, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.text(`${schoolProfile.schoolName || 'Peculiar School'} | ${new Date().getFullYear()}`, 42.8, 59, { align: 'center' });

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
            <i className="fa-solid fa-building-columns me-2"></i>Institution Profiles
          </h5>
        </div>
        <div className="card-body px-4">
          <div className="row g-4">
            {/* Admin Profile */}
            <div className="col-md-5">
              <div className="border rounded-3 p-3 h-100" style={{ background: '#f8f9fa' }}>
                <h6 className="fw-bold mb-3 text-dark-emphasis">
                  <i className="fa-solid fa-user-shield me-2" style={{ color: '#1E40AF' }}></i>Admin Profile
                </h6>
                <div className="text-center mb-3">
                  <div className="avatar-upload d-inline-block position-relative">
                    {adminProfile.avatar ? (
                      <img src={adminProfile.avatar} alt="Avatar" className="rounded-circle border" width="90" height="90" style={{ objectFit: 'cover', borderColor: '#1E40AF' }} />
                    ) : (
                      <div className="rounded-circle bg-white d-flex align-items-center justify-content-center" style={{ width: '90px', height: '90px', border: '2px solid #dee2e6' }}>
                        <i className="fa-solid fa-user fa-2x text-muted"></i>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="d-none" id="avatarInput" />
                    <label htmlFor="avatarInput" className="btn btn-sm btn-light position-absolute bottom-0 end-0 rounded-circle" style={{ border: '2px solid #1E40AF', width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF' }} title="Change photo">
                      <i className="fa-solid fa-camera fa-xs"></i>
                    </label>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small text-muted">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={adminProfile.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small text-muted">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={adminProfile.email}
                    disabled
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small text-muted">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    value={adminProfile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Role</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={adminProfile.role}
                    disabled
                  />
                </div>
                <button className="btn btn-success btn-sm w-100" onClick={saveProfile} disabled={loading}>
                  <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-save'} me-2`}></i>{loading ? 'Saving...' : 'Save Admin Profile'}
                </button>
              </div>
            </div>

            {/* School Profile */}
            <div className="col-md-7">
              <div className="border rounded-3 h-100" style={{ background: '#f8f9fa' }}>
                <div className="school-accordion">

                  {/* Toggle Button */}
                  <button
                    className="school-accordion-btn w-100 d-flex align-items-center justify-content-between px-3 py-2 border-0 bg-transparent"
                    type="button"
                    onClick={() => setSchoolAccordionOpen(!schoolAccordionOpen)}
                  >
                    <span className="fw-bold text-dark-emphasis">
                      <i className="fa-solid fa-school me-2" style={{ color: '#1E40AF' }}></i>School Profile
                    </span>
                    <i className={`fa-solid fa-chevron-down school-accordion-chevron ${schoolAccordionOpen ? 'rotated' : ''}`}></i>
                  </button>

                  {/* Collapsible Body */}
                  <div className={`school-accordion-body ${schoolAccordionOpen ? 'open' : ''}`}>
                    <div className="px-3 pb-3">
                      <div className="row g-2">

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">School Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.schoolName}
                      onChange={(e) => handleSchoolChange('schoolName', e.target.value)}
                      placeholder="Enter school name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">School Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={schoolProfile.schoolType}
                      onChange={(e) => handleSchoolChange('schoolType', e.target.value)}
                    >
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Primary & Secondary">Primary & Secondary</option>
                      <option value="High School">High School</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small text-muted">Address</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.address}
                      onChange={(e) => handleSchoolChange('address', e.target.value)}
                      placeholder="Street address / P.O. Box"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-muted">City / Town</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.city}
                      onChange={(e) => handleSchoolChange('city', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-muted">District</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.district}
                      onChange={(e) => handleSchoolChange('district', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-muted">Country</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.country}
                      onChange={(e) => handleSchoolChange('country', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={schoolProfile.phoneNumber}
                      onChange={(e) => handleSchoolChange('phoneNumber', e.target.value)}
                      placeholder="+256 XXX XXX XXX"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={schoolProfile.email}
                      onChange={(e) => handleSchoolChange('email', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Website</label>
                    <input
                      type="url"
                      className="form-control form-control-sm"
                      value={schoolProfile.website}
                      onChange={(e) => handleSchoolChange('website', e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Registration Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.registrationNumber}
                      onChange={(e) => handleSchoolChange('registrationNumber', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">School Level</label>
                    <select
                      className="form-select form-select-sm"
                      value={schoolProfile.schoolLevel}
                      onChange={(e) => handleSchoolChange('schoolLevel', e.target.value)}
                    >
                      <option value="O Level Only">O Level Only</option>
                      <option value="A Level Only">A Level Only</option>
                      <option value="O & A Level">O & A Level</option>
                      <option value="Primary">Primary</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Principal / Headteacher</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.principalName}
                      onChange={(e) => handleSchoolChange('principalName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-muted">Year Established</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.establishedYear}
                      onChange={(e) => handleSchoolChange('establishedYear', e.target.value)}
                      placeholder="e.g. 1995"
                      maxLength={4}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small text-muted">Motto</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={schoolProfile.motto}
                      onChange={(e) => handleSchoolChange('motto', e.target.value)}
                      placeholder="School motto"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Vision Statement</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={schoolProfile.vision}
                      onChange={(e) => handleSchoolChange('vision', e.target.value)}
                      placeholder="School vision"
                    ></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Mission Statement</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={schoolProfile.mission}
                      onChange={(e) => handleSchoolChange('mission', e.target.value)}
                      placeholder="School mission"
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small text-muted mb-1">School Logo</label>
                    <div className="d-flex align-items-center gap-3">
                      <div className="school-logo-upload">
                        {schoolProfile.logo ? (
                          <img src={schoolProfile.logo} alt="School Logo" className="school-logo-preview" />
                        ) : (
                          <div className="school-logo-placeholder">
                            <i className="fa-solid fa-image fa-2x"></i>
                            <small>No Logo</small>
                          </div>
                        )}
                      </div>
                      <div>
                        <input type="file" accept="image/*" onChange={handleSchoolLogoUpload} className="d-none" id="schoolLogoInput" />
                        <label htmlFor="schoolLogoInput" className="btn btn-outline btn-sm" style={{ borderColor: '#1E40AF', color: '#1E40AF' }}>
                          <i className="fa-solid fa-upload me-1"></i>Upload Logo
                        </label>
                        {schoolProfile.logo && (
                          <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => setSchoolProfile({ ...schoolProfile, logo: null })}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                        <div className="small text-muted mt-1">Used on ID cards & report cards. Max 5MB. PNG/JPG/SVG.</div>
                      </div>
                    </div>
                  </div>

                      </div>
                    </div>
                  </div>

                </div>
                <div className="px-3 pb-3">
                  <button className="btn btn-success btn-sm" onClick={saveSchoolProfile} disabled={loadingSchool}>
                    <i className={`fa-solid ${loadingSchool ? 'fa-spinner fa-spin' : 'fa-save'} me-2`}></i>{loadingSchool ? 'Saving...' : 'Save School Profile'}
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
                  className="btn btn-success" 
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
                  className="btn btn-success" 
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
                  className="btn btn-success" 
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
           
           <hr className="my-4" />
           
           <h6 className="fw-bold mb-3">Change Email (Admin Only)</h6>
           <p className="text-muted small mb-3">Update your email address without verification. Current password required for security.</p>
           <div className="row g-3">
             <div className="col-md-6">
               <input 
                 type="password" 
                 className="form-control" 
                 placeholder="Current Password"
                 value={emailData.currentPassword}
                 onChange={(e) => handleEmailChange('currentPassword', e.target.value)}
                 disabled={loading}
               />
             </div>
             <div className="col-md-6">
               <input 
                 type="email" 
                 className="form-control" 
                 placeholder="New Email Address"
                 value={emailData.newEmail}
                 onChange={(e) => handleEmailChange('newEmail', e.target.value)}
                 disabled={loading}
               />
             </div>
             <div className="col-12">
               <button className="btn btn-info" onClick={changeEmail} disabled={loading}>
                 <i className="fa-solid fa-envelope me-2"></i>{loading ? 'Updating...' : 'Update Email'}
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
                  className="btn btn-sm btn-outline-success mt-2" 
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
              className="btn btn-success" 
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
          <div className="class-modal" style={{ maxWidth: '500px' }}>
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
                    fontSize: '11px',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    {(schoolProfile.schoolName || 'PECULIAR SCHOOL').toUpperCase()} - {(schoolProfile.country || 'UGANDA').toUpperCase()}
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
                className="btn btn-success" 
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
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-danger" onClick={() => generateStudentReport(selectedStudent?.id)} disabled={loading || !selectedStudent}>
              <i className="fa-solid fa-download me-2"></i>{loading ? 'Generating...' : 'Generate Report Card'}
            </button>
            <button 
              className="btn btn-success" 
              onClick={async () => {
                setLoading(true);
                try {
                  await loadStudents();
                  for (const student of students) {
                    await generateStudentReport(student.id);
                    await new Promise(r => setTimeout(r, 500));
                  }
                  setMessage({ type: "success", text: `Generated ${students.length} report cards` });
                } catch {
                  setMessage({ type: "error", text: "Bulk generation failed" });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || students.length === 0}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-users'} me-2`}></i>Generate All Student Report Cards
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