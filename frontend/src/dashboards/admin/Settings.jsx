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

    const PAGE_HEIGHT = 297;
    const PAGE_WIDTH = 210;
    const pageMargin = 12;
    const contentWidth = PAGE_WIDTH - (pageMargin * 2);
    const primaryColor = [0, 32, 69];
    const surfaceColor = [247, 249, 251];
    const borderColor = [200, 204, 207];

    let cursorY = 10;

    // ── 1. HEADER ──────────────────────────────────────────────
    const headerHeight = 35;
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, PAGE_WIDTH, headerHeight, 'F');

    if (schoolProfile.logo) {
      try {
        doc.addImage(schoolProfile.logo, 'PNG', 15, 5, 25, 25);
      } catch (e) {
        console.error("Logo injection skipped", e);
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ACADEMIC EXCELLENCE CENTER', PAGE_WIDTH / 2, 9, { align: 'center' });
    doc.setFontSize(15);
    doc.text((schoolProfile.schoolName || 'PECULIAR SCHOOL').toUpperCase(), PAGE_WIDTH / 2, 16, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const schoolAddress = [schoolProfile.address, schoolProfile.city, schoolProfile.district, schoolProfile.country].filter(Boolean).join(', ');
    const schoolContact = ['Tel: ' + schoolProfile.phoneNumber, 'Email: ' + schoolProfile.email].filter(Boolean).join(' | ');
    if (schoolAddress) doc.text(schoolAddress, PAGE_WIDTH / 2, 22, { align: 'center' });
    if (schoolContact) doc.text(schoolContact, PAGE_WIDTH / 2, 27, { align: 'center' });

    cursorY = headerHeight + 5;

    // ── 2. STUDENT INFO BLOCK (Fixed Overlaps using Clean AutoTable) ──
    const studentName = `${selectedStudent?.firstName || ''} ${selectedStudent?.lastName || ''}`.trim();
    
    autoTable(doc, {
      startY: cursorY,
      margin: { horizontal: pageMargin },
      body: [
        [
          { content: `STUDENT NAME:\n${studentName || 'N/A'}`, styles: { fontStyle: 'bold' } },
          { content: `STUDENT ID:\n${selectedStudent?.studentId || 'N/A'}`, styles: { fontStyle: 'bold' } }
        ],
        [
          `CLASS / FORM:\n${selectedStudent?.className || selectedStudent?.currentClass || 'N/A'}`,
          `STREAM:\n${selectedStudent?.stream || 'N/A'}`
        ],
        [
          `ACADEMIC YEAR:\n${reportOptions.academicYear}`,
          `TERM / SEMESTER:\n${reportOptions.term}`
        ]
      ],
      theme: 'plain',
      styles: {
        fillColor: surfaceColor,
        textColor: primaryColor,
        fontSize: 9,
        cellPadding: 3,
        lineColor: borderColor,
        lineWidth: 0.2
      },
      columnStyles: {
        0: { cellWidth: contentWidth / 2 },
        1: { cellWidth: contentWidth / 2 }
      }
    });

    cursorY = doc.lastAutoTable.finalY + 5;

    // ── 3. ACADEMIC RECORD TABLE ────────────────────────────────
    doc.setFillColor(...primaryColor);
    doc.rect(pageMargin, cursorY, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ACADEMIC RECORD', pageMargin + 4, cursorY + 5);
    cursorY += 7;

    const grades = resultData?.grades || resultData?.results || [];
    const formattedGrades = grades.map(g => [
      g.subject || g.subjectName || g.subjectCode || "Unknown",
      `${g.marksObtained || g.score || 0} / ${g.maxMarks || 100}`,
      `${g.percentage || 0}%`,
      g.grade || 'N/A',
      g.remarks || '-'
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { horizontal: pageMargin },
      head: [['SUBJECT', 'MARKS / 100', 'PERCENTAGE', 'GRADE', 'REMARKS']],
      body: formattedGrades.length > 0 ? formattedGrades : [['No structural marks found', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [25, 28, 30] },
      alternateRowStyles: { fillColor: surfaceColor },
      styles: { cellPadding: 3, lineWidth: 0.2, lineColor: borderColor }
    });

    cursorY = doc.lastAutoTable.finalY + 5;

    // ── 4. TWO-COLUMN LAYOUT (GRADING SCALE & PERFORMANCE) ──
    const colWidth = (contentWidth / 2) - 2;
    const rightColX = pageMargin + colWidth + 4;

    // Left Column Side: Grading Scale Table
    autoTable(doc, {
      startY: cursorY,
      margin: { left: pageMargin, right: PAGE_WIDTH - rightColX + 2 },
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
      headStyles: { fillColor: primaryColor, fontSize: 8 },
      bodyStyles: { fontSize: 7.5, cellPadding: 1.5 }
    });
    const leftTableBottom = doc.lastAutoTable.finalY;

    // Right Column Side: Performance Summary Table (No manual boxes = No clipping!)
    const totalMarks = grades.reduce((sum, g) => sum + (g.marksObtained || g.score || 0), 0);
    const avgScore = grades.length > 0 ? (totalMarks / grades.length).toFixed(1) : '0.0';

    autoTable(doc, {
      startY: cursorY,
      margin: { left: rightColX, right: pageMargin },
      head: [[{ content: 'PERFORMANCE SUMMARY', colSpan: 2 }]],
      body: [
        ['Average Score', `${avgScore} / 100`],
        ['Overall Grade', avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Satisfactory'],
        ['Total Subjects', String(grades.length)]
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 8 },
      bodyStyles: { fontSize: 8.5, cellPadding: 3.5 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });
    const rightTableBottom = doc.lastAutoTable.finalY;

    cursorY = Math.max(leftTableBottom, rightTableBottom) + 5;

    // ── 5. ATTENDANCE RECORD ────────────────────────────────────
    doc.setFillColor(...primaryColor);
    doc.rect(pageMargin, cursorY, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.text('ATTENDANCE RECORD', pageMargin + 4, cursorY + 4.5);
    cursorY += 6;

    autoTable(doc, {
      startY: cursorY,
      margin: { horizontal: pageMargin },
      body: [[
        { content: 'Days Present:\n\n68 / 70', styles: { fontSize: 11, fontStyle: 'bold', valign: 'middle' } },
        { content: 'Attendance Rate: 97%\n(Excellent consistency and classroom involvement)', styles: { valign: 'middle' } }
      ]],
      theme: 'grid',
      styles: { fillColor: surfaceColor, fontSize: 9, cellPadding: 4 }
    });

    cursorY = doc.lastAutoTable.finalY + 5;

    // ── 6. CLASS TEACHER'S REMARKS ──────────────────────────────
    doc.setFillColor(...primaryColor);
    doc.rect(pageMargin, cursorY, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("CLASS TEACHER'S REMARKS", pageMargin + 4, cursorY + 4.5);
    cursorY += 6;

    const remarksText = selectedStudent?.stream === 'Sciences'
      ? 'Student is a disciplined student who shows exceptional interest in Sciences. Consistent effort will yield even better results.'
      : 'A dedicated learner with strong commitment to academic excellence. Keep striving for improvement in all subjects.';

    autoTable(doc, {
      startY: cursorY,
      margin: { horizontal: pageMargin },
      body: [[remarksText]],
      theme: 'grid',
      styles: { fillColor: surfaceColor, fontSize: 9, cellPadding: 4 }
    });

    cursorY = doc.lastAutoTable.finalY + 12;

    // ── 7. SIGNATURE LINES ──────────────────────────────────────
    const sigColWidth = contentWidth / 3;
    doc.setFontSize(8);
    doc.setTextColor(67, 71, 78);
    doc.setDrawColor(180, 184, 188);
    doc.setLineWidth(0.3);

    // Line 1
    doc.line(pageMargin, cursorY, pageMargin + sigColWidth - 5, cursorY);
    doc.text('CLASS TEACHER', pageMargin + (sigColWidth - 5) / 2, cursorY + 4, { align: 'center' });

    // Line 2
    doc.line(pageMargin + sigColWidth + 2, cursorY, pageMargin + (sigColWidth * 2) - 2, cursorY);
    doc.text('PARENT / GUARDIAN', pageMargin + sigColWidth + (sigColWidth / 2), cursorY + 4, { align: 'center' });

    // Line 3
    doc.line(pageMargin + (sigColWidth * 2) + 5, cursorY, pageMargin + contentWidth, cursorY);
    doc.text("PRINCIPAL'S SIGNATURE", pageMargin + (sigColWidth * 2) + 5 + (sigColWidth - 5) / 2, cursorY + 4, { align: 'center' });

    // ── 8. ABSOLUTE FIXED FOOTER (Prevents Page Overflow Cut-offs) ──
    const footerStartY = PAGE_HEIGHT - 26; 

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.line(pageMargin, footerStartY, pageMargin + contentWidth, footerStartY);

    doc.setTextColor(67, 71, 78);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolProfile.schoolName?.toUpperCase() || 'SCHOOL REPORT', PAGE_WIDTH / 2, footerStartY + 5, { align: 'center' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`© ${new Date().getFullYear()} Generated via Portal System. All rights reserved.`, PAGE_WIDTH / 2, footerStartY + 10, { align: 'center' });
    doc.text('This is a confidential academic transcript. Any unapproved modifications render this document invalid.', PAGE_WIDTH / 2, footerStartY + 14, { align: 'center' });

    doc.setFillColor(...primaryColor);
    doc.rect(pageMargin, footerStartY + 17, contentWidth, 0.5, 'F');

    doc.save(`report-card-${selectedStudent?.studentId || 'student'}.pdf`);
    setMessage({ type: "success", text: "Report card generated with fixed layout!" });
  } catch (err) {
    console.error(err);
    setMessage({ type: "error", text: "Failed to generate clear document view." });
  } finally {
    setLoading(false);
  }
};


  const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error('No image src'));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
};

const truncateText = (text, maxChars) => {
  if (!text) return '';
  return text.length > maxChars ? text.substring(0, maxChars - 1) + '…' : text;
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

    // ---- Standard CR80 card size ----
    const cardW = 85.6;
    const cardH = 54;
    const margin = 4;
    const contentW = cardW - (margin * 2);

    const primaryColor = [0, 32, 69];
    const secondaryColor = [0, 108, 74];
    const textColor = [25, 28, 30];
    const lightGray = [220, 220, 220];
    const borderGray = [196, 198, 207];

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const cardX = (pageW - cardW) / 2;
    const cardY = (pageH - cardH) / 2;

    const idNumber = type === 'student'
      ? (userData.studentId || userData.linn || userData.id)
      : (userData.teacherId || userData.id);
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown';
    const photoUrl = userData.avatar || userData.photoUrl || userData.profilePicture;
    const gender = userData.gender || 'N/A';
    const className = userData.className || userData.currentClass || 'N/A';
    const stream = userData.stream || '';
    const department = userData.department?.name || 'N/A';
    const phone = userData.phone || 'N/A';
    const dob = userData.dateOfBirth || userData.dob || '';
    const admissionDate = userData.admissionDate || userData.dateOfAdmission || '';
    const bloodGroup = userData.bloodGroup || '';
    const address = userData.address || '';
    const city = userData.city || '';
    const email = userData.email || userData.schoolEmail || '';
    const emergencyContactName = userData.emergencyContactName || userData.guardianName || '';
    const emergencyContactPhone = userData.emergencyContactPhone || userData.guardianPhone || '';

    const schoolLogo = schoolProfile.logo;
    const schoolNameText = (schoolProfile.schoolName || 'PECULIAR SCHOOL').toUpperCase();
    const locationText = [schoolProfile.city, schoolProfile.country].filter(Boolean).join(', ') || 'Uganda';
    const academicYear = schoolProfile.academicYear || new Date().getFullYear();
    const schoolMotto = schoolProfile.motto || '';
    const schoolWebsite = schoolProfile.website || '';
    const schoolPhone = schoolProfile.phone || '';

    let logoImg = null;
    if (schoolLogo) {
      try {
        logoImg = await loadImage(schoolLogo);
      } catch {
        console.error('School logo skipped — failed to load');
      }
    }

    let photoImg = null;
    if (photoUrl) {
      try {
        photoImg = await loadImage(photoUrl);
      } catch {
        console.error('Student photo skipped — failed to load');
      }
    }

    // ===================================================================
    // FRONT SIDE
    // ===================================================================

    // ---- Card outer border ----
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, 'S');

    // ---- Header background FIRST, logo drawn on top ----
    const headerH = 16;
    doc.setFillColor(...primaryColor);
    doc.rect(cardX, cardY, cardW, headerH, 'F');

    const logoSize = 12;
    if (logoImg) {
      try {
        doc.addImage(logoImg, 'PNG', cardX + margin, cardY + 2, logoSize, logoSize);
      } catch {
        console.error('School logo skipped — failed to render');
      }
    }

    const headerTextX = logoImg ? cardX + margin + logoSize + 2 : cardX + margin;

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const maxSchoolNameChars = logoImg ? 24 : 32;
    doc.text(truncateText(schoolNameText, maxSchoolNameChars), headerTextX, cardY + 6.5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(truncateText(locationText, maxSchoolNameChars + 6), headerTextX, cardY + 11.5);

    // ---- Photo + main info ----
    let cursorY = cardY + headerH + 4;
    const photoW = 22;
    const photoH = 24;

    if (photoImg) {
      try {
        doc.addImage(photoImg, 'JPEG', cardX + margin, cursorY, photoW, photoH);
        doc.setDrawColor(...borderGray);
        doc.rect(cardX + margin, cursorY, photoW, photoH, 'S');
      } catch {
        photoImg = null;
      }
    }
    if (!photoImg) {
      doc.setFillColor(...lightGray);
      doc.rect(cardX + margin, cursorY, photoW, photoH, 'F');
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.text('PHOTO', cardX + margin + photoW / 2, cursorY + photoH / 2, { align: 'center' });
    }

    const infoStartX = cardX + margin + photoW + 4;

    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(idNumber), infoStartX, cursorY + 3.5);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(truncateText(fullName, 22), infoStartX, cursorY + 9);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(
      type === 'student' ? `Class: ${className}${stream ? ' | ' + stream : ''}` : `Dept: ${department}`,
      infoStartX, cursorY + 14
    );

    doc.text(`Gender: ${gender}`, infoStartX, cursorY + 18.5);

    let extraY = cursorY + 23;
    if (type === 'student') {
      if (stream && !className.includes(stream)) {
        doc.text(`Stream: ${stream}`, infoStartX, extraY);
        extraY += 4.5;
      }
    }
    if (phone && phone !== 'N/A') {
      doc.text(`Phone: ${truncateText(phone, 18)}`, infoStartX, extraY);
    }

    cursorY += photoH + 4;

    // ---- Divider ----
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.line(cardX + margin, cursorY, cardX + cardW - margin, cursorY);
    cursorY += 3.5;

    // // ---- Personal details ----
    // doc.setFontSize(6.5);
    // doc.setFont('helvetica', 'bold');
    // doc.setTextColor(...secondaryColor);
    // doc.text('PERSONAL DETAILS', cardX + margin, cursorY);
    // cursorY += 3;

    // doc.setFontSize(6.5);
    // doc.setFont('helvetica', 'normal');
    // doc.setTextColor(...textColor);

    // const leftColX = cardX + margin;
    // const rightColX = cardX + margin + (contentW / 2);
    // const rowGap = 3.2;

    // if (email && email !== 'N/A') {
    //   doc.text(truncateText(email, 32), leftColX, cursorY);
    //   cursorY += rowGap;
    // }

    // const row = (leftLabel, leftVal, rightLabel, rightVal, y) => {
    //   if (leftVal) {
    //     doc.setFont('helvetica', 'normal');
    //     doc.text(leftLabel, leftColX, y);
    //     doc.setFont('helvetica', 'bold');
    //     doc.text(String(leftVal), leftColX + 13, y);
    //   }
    //   if (rightVal) {
    //     doc.setFont('helvetica', 'normal');
    //     doc.text(rightLabel, rightColX, y);
    //     doc.setFont('helvetica', 'bold');
    //     doc.text(String(rightVal), rightColX + 12, y);
    //   }
    //   doc.setFont('helvetica', 'normal');
    // };

    // row('D.O.B', dob, 'Blood', bloodGroup, cursorY);
    // if (dob || bloodGroup) cursorY += rowGap;

    // if (address || city) {
    //   const fullAddress = [address, city].filter(Boolean).join(', ');
    //   doc.text(truncateText(fullAddress, 30), leftColX, cursorY);
    //   cursorY += rowGap;
    // }

    // if (admissionDate) {
    //   doc.setFont('helvetica', 'normal');
    //   doc.text('Admitted', leftColX, cursorY);
    //   doc.setFont('helvetica', 'bold');
    //   doc.text(String(admissionDate), leftColX + 14, cursorY);
    //   doc.setFont('helvetica', 'normal');
    // }

    // ---- Footer ----
    const footerY = cardY + cardH - 6;
    doc.setFillColor(...primaryColor);
    doc.rect(cardX + margin, footerY - 2, contentW, 0.7, 'F');

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Issued: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      cardX + margin, footerY + 1.5
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text(`VALID FOR ${academicYear}`, cardX + cardW - margin, footerY + 1.5, { align: 'right' });

    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 140);
    doc.text(
      `This card is property of ${(schoolProfile.schoolName || 'Peculiar School').toUpperCase()}`,
      cardX + margin, footerY + 4.5,
      { maxWidth: contentW }
    );

    // ===================================================================
    // BACK SIDE — new page
    // ===================================================================
    doc.addPage('a4', 'landscape');

    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, 'S');

    // Thin colored top strip (brand accent, not a full header)
    doc.setFillColor(...primaryColor);
    doc.rect(cardX, cardY, cardW, 4, 'F');

    let backY = cardY + 8;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('EMERGENCY CONTACT', cardX + margin, backY);
    backY += 4;

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    if (emergencyContactName) {
      doc.text(`Name: ${truncateText(emergencyContactName, 30)}`, cardX + margin, backY);
      backY += 3.5;
    }
    if (emergencyContactPhone) {
      doc.text(`Phone: ${truncateText(emergencyContactPhone, 25)}`, cardX + margin, backY);
      backY += 3.5;
    }
    if (!emergencyContactName && !emergencyContactPhone) {
      doc.setTextColor(150, 150, 150);
      doc.text('Not provided', cardX + margin, backY);
      backY += 3.5;
      doc.setTextColor(...textColor);
    }

    backY += 2;
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.line(cardX + margin, backY, cardX + cardW - margin, backY);
    backY += 4;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('TERMS & CONDITIONS', cardX + margin, backY);
    backY += 3.5;

    doc.setFontSize(5.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    const terms = [
      'This card remains the property of the school and must be',
      'surrendered on request. If found, please return to the',
      'school office or contact the number below.',
      `${type === 'student' ? 'Student' : 'Staff'} must carry this card at all times on campus.`
    ];
    terms.forEach(line => {
      doc.text(line, cardX + margin, backY);
      backY += 3;
    });

    backY += 1.5;
    doc.setDrawColor(...borderGray);
    doc.line(cardX + margin, backY, cardX + cardW - margin, backY);
    backY += 4;

    // Signature line
    const sigLineY = backY + 6;
    doc.setDrawColor(...textColor);
    doc.setLineWidth(0.15);
    doc.line(cardX + margin, sigLineY, cardX + margin + 30, sigLineY);
    doc.setFontSize(5.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Head Teacher', cardX + margin, sigLineY + 3);

    // Simple decorative barcode-style bars under the ID number
    // NOTE: this is a visual placeholder, NOT a scannable barcode encoding.
    // For a real scannable code, use a barcode/QR library (see note below).
    const barcodeX = cardX + cardW - margin - 32;
    const barcodeY = backY - 2;
    const barcodeW = 32;
    const barcodeH = 10;
    doc.setDrawColor(...textColor);
    let bx = barcodeX;
    const barPattern = String(idNumber || '0').split('').map(c => c.charCodeAt(0) % 2 === 0 ? 1.2 : 0.6);
    barPattern.forEach(w => {
      doc.setLineWidth(w);
      doc.line(bx, barcodeY, bx, barcodeY + barcodeH);
      bx += w + 0.8;
    });
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(String(idNumber), barcodeX, barcodeY + barcodeH + 3, { maxWidth: barcodeW });

    // Footer contact info
    const backFooterY = cardY + cardH - 4;
    doc.setFontSize(5);
    doc.setTextColor(140, 140, 140);
    const contactLine = [schoolPhone, schoolWebsite].filter(Boolean).join(' | ') || schoolMotto;
    if (contactLine) {
      doc.text(truncateText(contactLine, 60), cardX + margin, backFooterY, { maxWidth: contentW });
    }

    doc.save(`id-card-${idNumber}.pdf`);
    setMessage({ type: "success", text: "ID Card (front & back) generated successfully" });
  } catch (err) {
    console.error(err);
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
          <div className="class-modal" style={{ maxWidth: '550px' }}>
            <div className="class-modal-header">
              <h3>ID Card Preview</h3>
              <button className="btn-close" onClick={() => setShowPreview(false)}></button>
            </div>
            <div className="class-modal-body">
               <div className="id-card-preview" style={{
                 width: '100%',
                 maxWidth: '525px',
                 minHeight: '340px',
                 border: '1px solid #c4c6cf',
                 borderRadius: '2px',
                 padding: '14px',
                 margin: '0 auto',
                 background: '#f7f9fb',
                 fontFamily: 'Work Sans, Arial, sans-serif',
                 boxSizing: 'border-box',
                 aspectRatio: '105/68',
                 position: 'relative',
                 overflow: 'hidden'
               }}>
                 {(() => {
                   const user = previewType === 'student' ? selectedStudent : selectedTeacher;
                   const photoUrl = user?.avatar || user?.photoUrl || user?.profilePicture;
                   return (
                   <div>
                     <div style={{
                       background: '#002045',
                       color: '#ffffff',
                       padding: '6px 10px',
                       position: 'relative',
                       minHeight: '54px'
                     }}>
                       {schoolProfile.logo && (
                         <img
                           src={schoolProfile.logo}
                           alt="Logo"
                           style={{
                             position: 'absolute',
                             left: '14px',
                             top: '50%',
                             transform: 'translateY(-50%)',
                             height: '28px',
                             width: '28px',
                             objectFit: 'contain',
                             borderRadius: '2px'
                           }}
                         />
                       )}
                       <div style={{ paddingLeft: schoolProfile.logo ? '46px' : '0' }}>
                         <div style={{
                           fontFamily: 'Work Sans, Arial, sans-serif',
                           fontSize: '14px',
                           fontWeight: '700',
                           lineHeight: '1.2',
                           letterSpacing: '0.02em',
                           color: '#ffffff'
                         }}>
                           {(schoolProfile.schoolName || 'PECULIAR SCHOOL').toUpperCase()}
                         </div>
                         <div style={{
                           fontFamily: 'Work Sans, Arial, sans-serif',
                           fontSize: '10px',
                           fontWeight: '400',
                           lineHeight: '1.2',
                           color: '#86a0cd',
                           marginTop: '2px'
                         }}>
                           {[schoolProfile.city, schoolProfile.country].filter(Boolean).join(', ') || 'Uganda'}
                         </div>
                       </div>
                     </div>

                     <div style={{ display: 'flex', gap: '12px', marginTop: '18px', alignItems: 'flex-start' }}>
                       <div style={{
                         width: '60px',
                         height: '68px',
                         background: '#e0e3e5',
                         borderRadius: '2px',
                         flexShrink: 0,
                         overflow: 'hidden',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center'
                       }}>
                         {photoUrl ? (
                           <img
                             src={photoUrl}
                             alt="Photo"
                             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                           />
                         ) : (
                           <i className="fa-solid fa-user fa-lg" style={{ color: '#74777f' }}></i>
                         )}
                       </div>

                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div style={{
                           fontFamily: 'Work Sans, Arial, sans-serif',
                           fontSize: '13px',
                           fontWeight: '700',
                           color: '#002045',
                           marginBottom: '4px',
                           lineHeight: '1.2'
                         }}>
                           {(user?.firstName ? `${user.firstName} ${user.lastName}` : 'Unknown Name') || 'Unknown Name'}
                         </div>
                         <div style={{
                           fontFamily: 'Work Sans, Arial, sans-serif',
                           fontSize: '11px',
                           fontWeight: '500',
                           color: '#191c1e',
                           marginBottom: '3px'
                         }}>
                           ID: {previewType === 'student' ? (user?.studentId || user?.linn || user?.id) : (user?.teacherId || user?.id)}
                         </div>
                         <div style={{
                           fontFamily: 'Work Sans, Arial, sans-serif',
                           fontSize: '10px',
                           color: '#43474e'
                         }}>
                           <div><span style={{ fontWeight: '600', color: '#43474e' }}>Gender:</span> {user?.gender || 'N/A'}</div>
                           {previewType === 'student' ? (
                             <>
                               <div><span style={{ fontWeight: '600', color: '#43474e' }}>Class:</span> {(user?.className || user?.currentClass || 'N/A')}{user?.stream ? ' | ' + user.stream : ''}</div>
                               {user?.phone && <div><span style={{ fontWeight: '600', color: '#43474e' }}>Phone:</span> {user.phone}</div>}
                             </>
                           ) : (
                             <>
                               <div><span style={{ fontWeight: '600', color: '#43474e' }}>Dept:</span> {user?.department?.name || 'N/A'}</div>
                               <div><span style={{ fontWeight: '600', color: '#43474e' }}>Phone:</span> {user?.phone || 'N/A'}</div>
                             </>
                           )}
                         </div>
                       </div>
                     </div>

                     <div style={{
                       position: 'absolute',
                       bottom: '0',
                       left: '0',
                       right: '0',
                       borderTop: '1px solid #c4c6cf',
                       padding: '8px 14px',
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       background: '#f7f9fb',
                       zIndex: '2'
                     }}>
                       <span style={{
                         fontFamily: 'Work Sans, Arial, sans-serif',
                         fontSize: '9px',
                         color: '#43474e'
                       }}>
                         Issued: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </span>
                       <span style={{
                         fontFamily: 'Work Sans, Arial, sans-serif',
                         fontSize: '9px',
                         fontWeight: '700',
                         color: '#006c4a',
                         letterSpacing: '0.08em'
                       }}>
                         VALID FOR 2026
                       </span>
                     </div>

                     <div style={{
                       position: 'absolute',
                       bottom: '22px',
                       left: '14px',
                       right: '14px',
                       textAlign: 'center',
                       fontSize: '8px',
                       color: '#74777f',
                       fontFamily: 'Work Sans, Arial, sans-serif',
                       zIndex: '1'
                     }}>
                       This card is property of {(schoolProfile.schoolName || 'Peculiar School').toUpperCase()}. Misuse is an offence.
                     </div>
                   </div>
                   );
                 })()}
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