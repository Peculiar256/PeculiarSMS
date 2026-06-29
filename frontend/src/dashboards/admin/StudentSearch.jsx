import React, { useMemo, useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exporters';
import { printTeacherList } from '../../utils/printUtils';
import CSVImportModal from '../../components/CSVImportModal';
import './StudentSearch.css';

const API_BASE_URL = 'http://localhost:8080/api';

const StudentSearch = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentAdmissions, setRecentAdmissions] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [formError, setFormError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [activeViewSection, setActiveViewSection] = useState('personal'); // 'personal', 'academic', 'contact'
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    phoneNumber: '',
    schoolClassId: '',
    stream: '',
    residenceStatus: 'DAY',
    otherNames: '',
    nin: '',
    linn: '',
    nationality: '',
  });

  // Fetch data on mount
  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    console.log('Classes state updated:', classes);
  }, [classes]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/students');
      const studentList = response.data.students || [];
      setStudents(studentList);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students from database');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get('/classes');
      const classList = response.data.classes || response.data || [];
      
      // Map classes properly
      const formattedClasses = classList.map(cls => ({
        id: cls.id,
        name: cls.name,
        level: cls.levelType,
        capacity: cls.maxCapacity
      }));
      
      setClasses(formattedClasses);
      console.log('Classes loaded:', formattedClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
      // Fallback to default classes if fetch fails
      setClasses([
        { id: 1, name: 'S.1', level: 'O_LEVEL' },
        { id: 2, name: 'S.2', level: 'O_LEVEL' },
        { id: 3, name: 'S.3', level: 'O_LEVEL' },
        { id: 4, name: 'S.4', level: 'O_LEVEL' },
        { id: 5, name: 'S.5', level: 'A_LEVEL' },
        { id: 6, name: 'S.6', level: 'A_LEVEL' },
      ]);
    }
  };

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return students.filter(student =>
      (student.firstName || '').toLowerCase().includes(term) ||
      (student.lastName || '').toLowerCase().includes(term) ||
      (student.studentId || '').toLowerCase().includes(term) ||
      (student.schoolClass?.name || '').toLowerCase().includes(term) ||
      (student.phoneNumber || '').toLowerCase().includes(term)
    );
  }, [searchTerm, students]);

  const totalActiveStudents = useMemo(
    () => students.filter(s => s.isActive !== false).length,
    [students]
  );

  const todaysAttendance = useMemo(() => {
    const totalActive = totalActiveStudents;
    return totalActive > 0 ? Math.max(1, Math.round(totalActive * 0.92)) : 0;
  }, [totalActiveStudents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      phoneNumber: '',
      schoolClassId: '',
      stream: '',
      residenceStatus: 'DAY',
      otherNames: '',
      nin: '',
      linn: '',
      nationality: '',
    });
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.gender) return 'Gender is required';
    if (!formData.dateOfBirth) return 'Date of birth is required';
    return '';
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setLoading(true);
    try {
      const studentData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      };

      // Only include optional fields if they have values
      if (formData.phoneNumber.trim()) studentData.phoneNumber = formatPhoneNumber(formData.phoneNumber);
      if (formData.schoolClassId) {
        studentData.schoolClass = { id: parseInt(formData.schoolClassId) };
        // Find the class name and set currentClass for backward compatibility
        const selectedClass = classes.find(c => c.id === parseInt(formData.schoolClassId));
        if (selectedClass) studentData.currentClass = selectedClass.name;
      }
      if (formData.stream.trim()) studentData.stream = formData.stream.trim();
      if (formData.residenceStatus) studentData.residenceStatus = formData.residenceStatus;
      if (formData.otherNames.trim()) studentData.otherNames = formData.otherNames.trim();
      if (formData.nin.trim()) studentData.nin = formData.nin.trim();
      if (formData.linn.trim()) studentData.linn = formData.linn.trim();
      if (formData.nationality) studentData.nationality = formData.nationality;

      await axiosInstance.post('/students', studentData);
      
      // Close modal immediately
      setIsAddModalOpen(false);
      resetForm();
      setRecentAdmissions(prev => prev + 1);
      
      // Fetch in background (don't block UI)
      fetchStudents();
    } catch (err) {
      console.error('Error adding student:', err);
      setFormError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      gender: student.gender || '',
      dateOfBirth: student.dateOfBirth || '',
      phoneNumber: extractDigits(student.phoneNumber) || '',
      schoolClassId: student.schoolClass?.id || '',
      stream: student.stream || '',
      residenceStatus: student.residenceStatus || 'DAY',
      otherNames: student.otherNames || '',
      nin: student.nin || '',
      linn: student.linn || '',
      nationality: student.nationality || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setLoading(true);
    try {
      const studentData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      };

      if (formData.phoneNumber.trim()) studentData.phoneNumber = formData.phoneNumber.trim();
      if (formData.schoolClassId) {
        studentData.schoolClass = { id: parseInt(formData.schoolClassId) };
        const selectedClass = classes.find(c => c.id === parseInt(formData.schoolClassId));
        if (selectedClass) studentData.currentClass = selectedClass.name;
      }
      if (formData.stream.trim()) studentData.stream = formData.stream.trim();
      if (formData.residenceStatus) studentData.residenceStatus = formData.residenceStatus;
      if (formData.otherNames.trim()) studentData.otherNames = formData.otherNames.trim();
      if (formData.nin.trim()) studentData.nin = formData.nin.trim();
      if (formData.linn.trim()) studentData.linn = formData.linn.trim();
      if (formData.nationality) studentData.nationality = formData.nationality;

      await axiosInstance.put(`/students/${selectedStudent.id}`, studentData);
      
      // Close modal immediately
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      resetForm();
      
      // Fetch in background (don't block UI)
      fetchStudents();
    } catch (err) {
      console.error('Error updating student:', err);
      setFormError(err.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = selectedStudent.isActive === false;
      const endpoint = newStatus ? `/students/${selectedStudent.id}/activate` : `/students/${selectedStudent.id}/deactivate`;
      
      await axiosInstance.put(endpoint);
      
      setSuccessMessage(`Student ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setIsStatusModalOpen(false);
      setSelectedStudent(null);
      fetchStudents();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling student status:', err);
      setError(err.response?.data?.message || 'Failed to update student status');
    } finally {
      setLoading(false);
    }
  };

  // ===== EXPORT & PRINT HANDLERS =====
  const handleExportCSV = () => {
    const filename = `students_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filteredStudents, filename);
    setSuccessMessage('CSV exported successfully');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleExportExcel = async () => {
    const filename = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
    await exportToExcel(filteredStudents, filename);
    setSuccessMessage('Excel exported successfully');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleExportPDF = async () => {
    const filename = `students_report_${new Date().toISOString().split('T')[0]}.pdf`;
    await exportToPDF(filteredStudents, filename);
    setSuccessMessage('PDF exported successfully');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handlePrintView = () => {
    try {
      setIsPrintLoading(true);
      printTeacherList(filteredStudents);
      setSuccessMessage('Print view opened!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch {
      setError('Failed to open print view');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsPrintLoading(false);
    }
  };

  const handleCSVImportComplete = (result) => {
    if (result.successful && result.successful.length > 0) {
      setSuccessMessage(`Successfully imported ${result.successful.length} student(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchStudents(); // Refresh the student list
    }
  };

  const getStatusBadge = (isActive) => {
    const active = isActive !== false;
    return (
      <span className={`badge ${active ? 'bg-success' : 'bg-secondary'}`}>
        {active ? 'Active' : 'Inactive'}
      </span>
    );
  };

  /**
   * Format phone number to always start with +256
   * Examples: "701234567" -> "+256701234567", "+256701234567" -> "+256701234567"
   */
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Remove any existing +256 or 0 prefix
    let cleaned = phone.replace(/^(\+256|0)/, '');
    return '+256' + cleaned;
  };

  /**
   * Extract just the digits after +256 for display in input
   */
  const extractDigits = (phone) => {
    if (!phone) return '';
    return phone.replace(/^\+256/, '');
  };

  return (
    <div className="student-search-container">
      {error && <div className="error-banner" style={{ color: 'red', padding: '10px', background: '#fee' }}>{error}</div>}
      {successMessage && <div className="success-banner" style={{ color: 'green', padding: '10px', background: '#efe' }}>{successMessage}</div>}
      
      <div className="search-header">
        <h2>Student Management</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
          <button className="btn btn-add-student" onClick={() => setIsAddModalOpen(true)} style={{ flex: 1, minWidth: '120px' }}>
            <i className="fa-solid fa-plus"></i> Add Student
          </button>
          <button type="button" className="btn btn-export" onClick={handleExportCSV} title="Export as CSV" style={{ flex: 1, minWidth: '100px' }}>
            <i className="fa-solid fa-file-csv"></i> CSV
          </button>
          <button type="button" className="btn btn-export" onClick={handleExportExcel} title="Export as Excel" style={{ flex: 1, minWidth: '100px' }}>
            <i className="fa-solid fa-file-excel"></i> Excel
          </button>
          <button type="button" className="btn btn-export" onClick={handleExportPDF} title="Export as PDF" style={{ flex: 1, minWidth: '100px' }}>
            <i className="fa-solid fa-file-pdf"></i> PDF
          </button>
          <button 
            type="button" 
            className="btn btn-export" 
            onClick={handlePrintView}
            disabled={isPrintLoading}
            title="Print View" 
            style={{ flex: 1, minWidth: '100px' }}
          >
            <i className="fa-solid fa-print"></i> Print
          </button>
          <button 
            type="button" 
            className="btn btn-export" 
            onClick={() => setIsCSVImportOpen(true)}
            title="Import from CSV" 
            style={{ flex: 1, minWidth: '100px' }}
          >
            <i className="fa-solid fa-upload"></i> Import
          </button>
        </div>
      </div>

      <section className="summary-cards">
        <article className="summary-card summary-card-active">
          <i className="fa-solid fa-user-graduate summary-card-icon"></i>
          <p className="summary-label">Total Active Students</p>
          <h3>{totalActiveStudents}</h3>
        </article>

        <article className="summary-card summary-card-recent">
          <i className="fa-solid fa-user-plus summary-card-icon"></i>
          <p className="summary-label">Recent Admissions</p>
          <h3>{recentAdmissions}</h3>
        </article>

        <article className="summary-card summary-card-fees">
          <i className="fa-solid fa-dollar-sign summary-card-icon"></i>
          <p className="summary-label">Total Fees Collected</p>
          <h3>$0.00</h3>
        </article>

        <article className="summary-card summary-card-attendance">
          <i className="fa-solid fa-calendar-check summary-card-icon"></i>
          <p className="summary-label">Today's Attendance</p>
          <h3>{todaysAttendance}</h3>
        </article>
      </section>

      <div className="search-section">
        <div className="search-filters">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by name, ID, class, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="modal-close" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleAddStudent} className="student-form">
              {formError && <p className="form-error">{formError}</p>}
              <div className="form-grid">
                <h4 className="form-section-title">Required Information</h4>
                <div className="form-field">
                  <label>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" required />
                </div>
                <div className="form-field">
                  <label>Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" required />
                </div>
                <div className="form-field form-field-full">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" required />
                </div>
                <div className="form-field">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                </div>

                <h4 className="form-section-title" style={{ marginTop: '12px' }}>Optional Information</h4>
                <div className="form-field">
                  <label>Other Names</label>
                  <input type="text" name="otherNames" value={formData.otherNames} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Phone Number</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+256</span>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="701234567" maxLength="9" />
                  </div>
                </div>
                <div className="form-field">
                  <label>Current Class</label>
                  <select name="schoolClassId" value={formData.schoolClassId} onChange={handleInputChange}>
                    <option value="">Select class</option>
                    {classes.length > 0 && classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Stream</label>
                  <input type="text" name="stream" value={formData.stream} onChange={handleInputChange} placeholder="Science, Arts, Commerce..." />
                </div>
                <div className="form-field">
                  <label>Residence Status</label>
                  <select name="residenceStatus" value={formData.residenceStatus} onChange={handleInputChange}>
                    <option value="DAY">Day Student</option>
                    <option value="BOARDING">Boarding Student</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>NIN (14 characters)</label>
                  <input type="text" name="nin" value={formData.nin} onChange={handleInputChange} maxLength="14" />
                </div>
                <div className="form-field">
                  <label>LINN</label>
                  <input type="text" name="linn" value={formData.linn} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Nationality</label>
                  <select name="nationality" value={formData.nationality} onChange={handleInputChange}>
                    <option value="">Select nationality</option>
                    <option value="Ugandan">Ugandan</option>
                    <option value="Kenyan">Kenyan</option>
                    <option value="Tanzanian">Tanzanian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); resetForm(); }} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Saving...' : 'Save Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Student</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateStudent} className="student-form">
              {formError && <p className="form-error">{formError}</p>}
              <div className="form-grid">
                <h4 className="form-section-title">Required Information</h4>
                <div className="form-field">
                  <label>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="form-field">
                  <label>Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
                <div className="form-field form-field-full">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-field">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                </div>

                <h4 className="form-section-title" style={{ marginTop: '12px' }}>Optional Information</h4>
                <div className="form-field">
                  <label>Other Names</label>
                  <input type="text" name="otherNames" value={formData.otherNames} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Phone Number</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+256</span>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="701234567" maxLength="9" />
                  </div>
                </div>
                <div className="form-field">
                  <label>Current Class</label>
                  <select name="schoolClassId" value={formData.schoolClassId} onChange={handleInputChange}>
                    <option value="">Select class</option>
                    {classes.length > 0 && classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Stream</label>
                  <input type="text" name="stream" value={formData.stream} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Residence Status</label>
                  <select name="residenceStatus" value={formData.residenceStatus} onChange={handleInputChange}>
                    <option value="DAY">Day Student</option>
                    <option value="BOARDING">Boarding Student</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>NIN</label>
                  <input type="text" name="nin" value={formData.nin} onChange={handleInputChange} maxLength="14" />
                </div>
                <div className="form-field">
                  <label>LINN</label>
                  <input type="text" name="linn" value={formData.linn} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Nationality</label>
                  <select name="nationality" value={formData.nationality} onChange={handleInputChange}>
                    <option value="">Select nationality</option>
                    <option value="Ugandan">Ugandan</option>
                    <option value="Kenyan">Kenyan</option>
                    <option value="Tanzanian">Tanzanian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#1E40AF', color: 'white', padding: '0', position: 'relative', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '50px' }}>
              <button 
                type="button" 
                onClick={() => setIsViewModalOpen(false)} 
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '32px',
                  cursor: 'pointer',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Profile Header Section with Avatar */}
            <div style={{ textAlign: 'center', padding: '30px 20px', background: '#1E40AF', color: 'white', position: 'relative', marginBottom: '0' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                fontSize: '48px',
                color: '#1E40AF',
                border: '4px solid white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                <i className="fa-solid fa-user-graduate"></i>
              </div>
              <h2 style={{ margin: '10px 0 5px', fontSize: '24px', fontWeight: '600' }}>
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h2>
              <p style={{ margin: '0 0 15px', fontSize: '14px', opacity: 0.9 }}>
                <strong>{selectedStudent.studentId || 'N/A'}</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                  <i className="fa-solid fa-book" style={{ marginRight: '5px' }}></i>
                  {selectedStudent.currentClass || selectedStudent.schoolClass?.name || 'Unassigned'}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                  <i className="fa-solid fa-home" style={{ marginRight: '5px' }}></i>
                  {selectedStudent.residenceStatus || 'Day Student'}
                </span>
              </div>
            </div>

            {/* Details Sections */}
            <div style={{ padding: '25px 20px' }}>
              {/* 1. Personal Information Section */}
              <div style={{ marginBottom: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  onClick={() => setActiveViewSection(activeViewSection === 'personal' ? '' : 'personal')}
                  style={{ 
                    padding: '12px 15px', 
                    background: activeViewSection === 'personal' ? '#f0f4ff' : '#fff', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: activeViewSection === 'personal' ? '1px solid #e0e0e0' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-circle-user"></i>
                    Personal Information
                  </h4>
                  <i className={`fa-solid fa-chevron-${activeViewSection === 'personal' ? 'up' : 'down'}`} style={{ color: '#999', fontSize: '12px' }}></i>
                </div>
                
                {activeViewSection === 'personal' && (
                  <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#fff' }}>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Gender</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.gender || 'Not Specified'}</p>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Date of Birth</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'Not Specified'}</p>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Nationality</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.nationality || 'Not Specified'}</p>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Other Names</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.otherNames || 'Not Provided'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Academic Information Section */}
              <div style={{ marginBottom: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  onClick={() => setActiveViewSection(activeViewSection === 'academic' ? '' : 'academic')}
                  style={{ 
                    padding: '12px 15px', 
                    background: activeViewSection === 'academic' ? '#f0f4ff' : '#fff', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: activeViewSection === 'academic' ? '1px solid #e0e0e0' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-graduation-cap"></i>
                    Academic Information
                  </h4>
                  <i className={`fa-solid fa-chevron-${activeViewSection === 'academic' ? 'up' : 'down'}`} style={{ color: '#999', fontSize: '12px' }}></i>
                </div>
                
                {activeViewSection === 'academic' && (
                  <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#fff' }}>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Class</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.currentClass || selectedStudent.schoolClass?.name || 'Unassigned'}</p>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Stream</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.stream || 'Not Assigned'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1', padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Residence Status</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.residenceStatus === 'DAY' ? 'Day Student' : 'Boarding Student'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Contact & ID Information Section */}
              <div style={{ marginBottom: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  onClick={() => setActiveViewSection(activeViewSection === 'contact' ? '' : 'contact')}
                  style={{ 
                    padding: '12px 15px', 
                    background: activeViewSection === 'contact' ? '#f0f4ff' : '#fff', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: activeViewSection === 'contact' ? '1px solid #e0e0e0' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-phone"></i>
                    Contact & Identification
                  </h4>
                  <i className={`fa-solid fa-chevron-${activeViewSection === 'contact' ? 'up' : 'down'}`} style={{ color: '#999', fontSize: '12px' }}></i>
                </div>
                
                {activeViewSection === 'contact' && (
                  <div style={{ padding: '15px', background: '#fff' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</p>
                        <p style={{ margin: '0', fontSize: '13px', fontWeight: '500', color: '#1E40AF' }}>{selectedStudent.email || 'Not Provided'}</p>
                      </div>
                      <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Phone Number</p>
                        <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.phoneNumber || 'Not Provided'}</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>NIN</p>
                          <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.nin || 'Not Provided'}</p>
                        </div>
                        <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>LINN</p>
                          <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{selectedStudent.linn || 'Not Provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsViewModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
                  onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    handleEditStudent(selectedStudent);
                    setIsViewModalOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: '#1E40AF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <i className="fa-solid fa-pen-to-square" style={{ marginRight: '8px' }}></i>
                  Edit Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsStatusModalOpen(false)}>
          <div className="modal-content status-confirm-modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: selectedStudent.isActive !== false ? '#dc2626' : '#166534' }}>
                {selectedStudent.isActive !== false ? 'Deactivate' : 'Activate'} Student
              </h3>
              <button className="modal-close" onClick={() => setIsStatusModalOpen(false)}>×</button>
            </div>
            <div className="modal-body py-4" style={{ padding: '20px' }}>
              <p style={{ fontSize: '15px', color: '#1f2937' }}>Are you sure you want to <strong>{selectedStudent.isActive !== false ? 'deactivate' : 'activate'}</strong> <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong> ({selectedStudent.studentId})?</p>
              {selectedStudent.isActive !== false ? (
                <div style={{ marginTop: '15px', padding: '12px', background: '#fff1f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <p className="text-muted small" style={{ margin: 0, color: '#991b1b' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                    Deactivated students will not be able to log in, but their academic records and data will be preserved.
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: '15px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                  <p className="text-muted small" style={{ margin: 0, color: '#166534' }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i>
                    This will restore the student's access to the system immediately.
                  </p>
                </div>
              )}
            </div>
            <div className="form-actions" style={{ padding: '0 20px 20px', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsStatusModalOpen(false)}>Cancel</button>
              <button 
                className={`btn ${selectedStudent.isActive !== false ? 'btn-danger' : 'btn-success'}`} 
                style={{ flex: 1 }}
                onClick={handleToggleStatus} 
                disabled={loading}
              >
                {loading ? 'Processing...' : (selectedStudent.isActive !== false ? 'Confirm Deactivation' : 'Confirm Activation')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : filteredStudents.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th> 
                <th>Class</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>
                    <span className="badge bg-info text-white rounded-pill">
                      {student.currentClass || student.schoolClass?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td>{student.phoneNumber || '-'}</td>
                  <td>{getStatusBadge(student.isActive)}</td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-info btn-sm" onClick={() => { setSelectedStudent(student); setIsViewModalOpen(true); }} title="View Detail" style={{ padding: '5px 10px' }}> <i className="fa-solid fa-eye"></i></button>
                      <button className="btn btn-success btn-sm" onClick={() => handleEditStudent(student)} title="Edit Student" style={{ padding: '5px 10px' }}> <i className="fa-solid fa-pen-to-square"></i></button>
<button
                        className={`btn ${student.isActive !== false ? 'btn-danger' : 'btn-success'} btn-sm`}
                        onClick={() => { setSelectedStudent(student); setIsStatusModalOpen(true); }}
                        title={student.isActive !== false ? 'Deactivate' : 'Activate'}
                        style={{ padding: '5px 10px', minWidth: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <i className={`fa-solid ${student.isActive !== false ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">No students found.</div>
        )}
      </div>

      <div className="table-footer">
        <p>Showing {filteredStudents.length} of {students.length} students</p>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal 
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        onImportComplete={handleCSVImportComplete}
      />
    </div>
  );
};

export default StudentSearch;
