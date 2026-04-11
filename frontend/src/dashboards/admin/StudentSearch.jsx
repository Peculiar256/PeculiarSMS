import React, { useMemo, useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formError, setFormError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const handleDeleteStudent = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/students/${selectedStudent.id}`);
      
      // Close modal immediately
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      
      // Fetch in background (don't block UI)
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      setFormError(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    const status = isActive !== false ? 'active' : 'inactive';
    return <span className={`status-badge status-${status}`}>{status}</span>;
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
      <div className="search-header">
        <h2>Student Management</h2>
        <button className="btn btn-add-student" onClick={() => setIsAddModalOpen(true)}>
          Add Student
        </button>
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
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
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
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Save Student</button>
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button className="modal-close" onClick={() => setIsViewModalOpen(false)}>×</button>
            </div>
            <div className="student-details-grid">
              <p><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
              <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              <p><strong>Class:</strong> 
                <span className="class-badge">{selectedStudent.currentClass || selectedStudent.schoolClass?.name || 'Unassigned'}</span>
              </p>
              <p><strong>Phone:</strong> {selectedStudent.phoneNumber || 'N/A'}</p>
              <p><strong>Gender:</strong> {selectedStudent.gender || 'N/A'}</p>
              <p><strong>Stream:</strong> {selectedStudent.stream || 'N/A'}</p>
              <p><strong>Residence:</strong> {selectedStudent.residenceStatus || 'N/A'}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedStudent.isActive)}</p>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header delete-header">
              <h3>Delete Student</h3>
              <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>×</button>
            </div>
            <p>Are you sure you want to delete <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="form-actions delete-actions">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteStudent} disabled={loading}>Delete</button>
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
                <th>Name</th>
                <th>Student ID</th>
                <th>Class</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>{student.studentId}</td>
                  <td>
                    {/* Display current_class (what's stored in DB) */}
                    <span className="class-badge">
                      {student.currentClass || student.schoolClass?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td>{student.phoneNumber || '-'}</td>
                  <td>{getStatusBadge(student.isActive)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-info btn-sm" onClick={() => { setSelectedStudent(student); setIsViewModalOpen(true); }}>View</button>
                      <button className="btn btn-warning btn-sm" onClick={() => handleEditStudent(student)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setSelectedStudent(student); setIsDeleteModalOpen(true); }}>Delete</button>
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
    </div>
  );
};

export default StudentSearch;
