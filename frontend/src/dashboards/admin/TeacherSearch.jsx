import React, { useState, useMemo, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { usePagination } from '../../hooks/usePagination';
import { applyFilters, getFilterOptions, resetFilters } from '../../utils/filterUtils';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exporters';
import { batchAssignClasses, batchAssignSubjects, batchDelete } from '../../utils/batchOperations';
import { printTeacherList } from '../../utils/printUtils';
import { getStatusOptions } from '../../utils/statusUtils';
import CSVImportModal from '../../components/CSVImportModal';
import StatusBadge from '../../components/StatusBadge';
import './TeacherSearch.css';

const API_BASE_URL = 'http://localhost:8080/api';
const ITEMS_PER_PAGE = 10;

const TeacherSearch = () => {
  // Basic state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeachersCount, setNewTeachersCount] = useState(0);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teacherToEditId, setTeacherToEditId] = useState('');
  const [editError, setEditError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Data from backend
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [uniqueSpecializations, setUniqueSpecializations] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Advanced Filtering State
  const [filters, setFilters] = useState({
    searchTerm: '',
    department: '',
    qualification: '',
    specialization: '',
    gender: '',
    hireDateFrom: '',
    hireDateTo: '',
    status: '', // New: Status filter
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});

  // CSV Import Modal State
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  
  // Print View State
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  // Batch Operations State
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState(new Set());
  const [isBatchOperating, setIsBatchOperating] = useState(false);
  const [batchError, setBatchError] = useState('');
  const [showBatchAssignModal, setShowBatchAssignModal] = useState(false);
  const [batchAssignType, setBatchAssignType] = useState(''); // 'classes' or 'subjects'
  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false);
  const [selectedTeacherForClassAssignment, setSelectedTeacherForClassAssignment] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [assignClassError, setAssignClassError] = useState('');
  const [assigningClasses, setAssigningClasses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Subject Assignment States
  const [isAssignSubjectModalOpen, setIsAssignSubjectModalOpen] = useState(false);
  const [selectedTeacherForSubjectAssignment, setSelectedTeacherForSubjectAssignment] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [assignSubjectError, setAssignSubjectError] = useState('');
  const [assigningSubjects, setAssigningSubjects] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    qualification: '',
    specialization: '',
    department: '',
    hireDate: '',
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    qualification: '',
    specialization: '',
    department: '',
    hireDate: '',
  });

  // Fetch data from backend on mount
  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchDepartments();
    fetchClasses();
  }, []);

  // API fetch functions
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teachers`);
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      const teacherList = (data.teachers || []).map((teacher) => ({
        ...teacher,
        displayId: teacher.teacher_id || teacher.teacherId || 'N/A',
      }));
      setTeachers(teacherList);
      setFilterOptions(getFilterOptions(teacherList));
      setError('');
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      const subjectList = Array.isArray(data) ? data : data.subjects || [];
      setSubjects(subjectList);

      // Extract unique specializations from subjects
      const specializations = [...new Set(subjectList.map((s) => s.name).filter(Boolean))];
      setUniqueSpecializations(specializations.sort());
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`);
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      const deptList = data.data || [];
      setDepartments(
        deptList.map((d) => (typeof d === 'string' ? d : d.name || d)).filter(Boolean)
      );
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments(['Science', 'Languages', 'Humanities', 'ICT']);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await fetch(`${API_BASE_URL}/classes`);
      if (!response.ok) throw new Error(`Failed to fetch classes: ${response.status}`);
      const data = await response.json();
      
      let classList = [];
      if (Array.isArray(data)) {
        classList = data;
      } else if (data.classes && Array.isArray(data.classes)) {
        classList = data.classes;
      } else if (data.data && Array.isArray(data.data)) {
        classList = data.data;
      } else {
        classList = [];
      }
      
      setClasses(classList);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Filter teachers based on advanced filters
  const filteredTeachers = useMemo(() => {
    return applyFilters(teachers, filters);
  }, [teachers, filters]);

  // Pagination
  const {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    goToFirstPage,
    goToLastPage,
    nextPage,
    prevPage,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(filteredTeachers, ITEMS_PER_PAGE);

  const totalTeachers = teachers.length;

  const syllabusProgress = useMemo(() => {
    return Math.min(100, 55 + teachers.length * 5);
  }, [teachers.length]);

  const topDepartment = useMemo(() => {
    const departmentCounts = teachers.reduce((acc, teacher) => {
      const key = teacher.department || 'Unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(departmentCounts);
    if (!entries.length) {
      return { name: 'N/A', count: 0 };
    }

    const [name, count] = entries.sort((a, b) => b[1] - a[1])[0];
    return { name, count };
  }, [teachers]);

  const openAddModal = () => {
    setFormError('');
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setFormError('');
    setIsAddModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      qualification: '',
      specialization: '',
      department: '',
      hireDate: '',
    });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const contactNumber = formData.contactNumber.trim();
    const dateOfBirth = formData.dateOfBirth;
    const gender = formData.gender;
    const nationality = formData.nationality;
    const qualification = formData.qualification;
    const specialization = formData.specialization;
    const department = formData.department;
    const hireDate = formData.hireDate;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !contactNumber ||
      !dateOfBirth ||
      !gender ||
      !nationality ||
      !qualification ||
      !specialization ||
      !department ||
      !hireDate
    ) {
      setFormError('Please fill in all teacher details.');
      return;
    }

    try {
      const teacherPayload = {
        firstName,
        lastName,
        email,
        contactNumber,
        dateOfBirth,
        gender,
        nationality,
        qualification,
        specialization,
        department,
        hireDate,
      };

      const response = await fetch(`${API_BASE_URL}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create teacher');
      }

      setNewTeachersCount((prev) => prev + 1);
      resetForm();
      closeAddModal();
      fetchTeachers(); // Refresh the list
    } catch (err) {
      setFormError(err.message || 'Failed to create teacher');
      console.error('Error creating teacher:', err);
    }
  };

  // Handle action buttons
  const handleViewTeacher = (teacher) => {
    setViewTeacher(teacher);
  };

  const closeViewTeacher = () => {
    setViewTeacher(null);
  };

  const handleEditTeacher = (teacher) => {
    setEditError('');
    // Use numeric id for API calls, not the string teacher_id
    const teacherId = teacher.id;
    setTeacherToEditId(teacherId);
    setEditFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      contactNumber: teacher.contactNumber || teacher.phone || '',
      dateOfBirth: teacher.dateOfBirth || '',
      gender: teacher.gender || '',
      nationality: teacher.nationality || '',
      qualification: teacher.qualification || '',
      specialization: teacher.specialization || '',
      department: teacher.department || '',
      hireDate: teacher.hireDate || '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditTeacher = () => {
    setEditError('');
    setIsEditModalOpen(false);
    setTeacherToEditId('');
  };

  const handleSaveEditedTeacher = async (e) => {
    e.preventDefault();

    const firstName = editFormData.firstName.trim();
    const lastName = editFormData.lastName.trim();
    const email = editFormData.email.trim();
    const contactNumber = editFormData.contactNumber.trim();
    const specialization = editFormData.specialization;

    if (!firstName || !email || !contactNumber || !specialization) {
      setEditError('Please fill in all required teacher details.');
      return;
    }

    try {
      const updatePayload = {
        firstName,
        lastName,
        email,
        contactNumber,
        dateOfBirth: editFormData.dateOfBirth,
        gender: editFormData.gender,
        nationality: editFormData.nationality,
        qualification: editFormData.qualification,
        specialization: editFormData.specialization,
        department: editFormData.department,
        hireDate: editFormData.hireDate,
      };

      const response = await fetch(`${API_BASE_URL}/teachers/${teacherToEditId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update teacher');
      }

      closeEditTeacher();
      fetchTeachers(); // Refresh the list
    } catch (err) {
      setEditError(err.message || 'Failed to update teacher');
      console.error('Error updating teacher:', err);
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}?`)) {
      return;
    }

    try {
      // Use numeric id for API calls, not the string teacher_id
      const teacherId = teacher.id;
      const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete teacher');
      }

      fetchTeachers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError('Failed to delete teacher');
    }
  };

  // Class Assignment Functions
  const openAssignClassModal = (teacher) => {
    setSelectedTeacherForClassAssignment(teacher);
    setSelectedClasses(teacher.assignedClasses || []);
    setAssignClassError('');
    setIsAssignClassModalOpen(true);
    // Fetch classes when modal opens to ensure we have fresh data
    fetchClasses();
  };

  const closeAssignClassModal = () => {
    setSelectedTeacherForClassAssignment(null);
    setSelectedClasses([]);
    setAssignClassError('');
    setIsAssignClassModalOpen(false);
  };

  const handleSelectClass = (className) => {
    setSelectedClasses((prev) => {
      if (prev.includes(className)) {
        return prev.filter((c) => c !== className);
      } else {
        return [...prev, className];
      }
    });
  };

  const handleSaveClassAssignment = async (e) => {
    e.preventDefault();

    if (!selectedTeacherForClassAssignment) {
      setAssignClassError('No teacher selected');
      return;
    }

    try {
      setAssigningClasses(true);
      setAssignClassError('');
      
      // Use numeric id for API calls, not the string teacher_id
      const teacherId = selectedTeacherForClassAssignment.id;

      const payload = {
        assignedClasses: selectedClasses,
      };

      // Use centralized axiosInstance (already has auth token via interceptor)
      await axiosInstance.put(`/teachers/${teacherId}`, payload);
      console.log('Classes assigned successfully');

      setAssignClassError('');
      closeAssignClassModal();
      
      // Refresh the teachers list
      await fetchTeachers();
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign classes';
      setAssignClassError(errorMessage);
      console.error('Error in handleSaveClassAssignment:', err);
    } finally {
      setAssigningClasses(false);
    }
  };

  // Subject Assignment Functions
  const openAssignSubjectModal = (teacher) => {
    setSelectedTeacherForSubjectAssignment(teacher);
    setSelectedSubjects(teacher.subjects || []);
    setAssignSubjectError('');
    setIsAssignSubjectModalOpen(true);
  };

  const closeAssignSubjectModal = () => {
    setSelectedTeacherForSubjectAssignment(null);
    setSelectedSubjects([]);
    setAssignSubjectError('');
    setIsAssignSubjectModalOpen(false);
  };

  const handleSelectSubject = (subjectName) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectName)) {
        return prev.filter((s) => s !== subjectName);
      } else {
        return [...prev, subjectName];
      }
    });
  };

  const handleSaveSubjectAssignment = async (e) => {
    e.preventDefault();

    if (!selectedTeacherForSubjectAssignment) {
      setAssignSubjectError('No teacher selected');
      return;
    }

    try {
      setAssigningSubjects(true);
      setAssignSubjectError('');
      
      // Use numeric id for API calls
      const teacherId = selectedTeacherForSubjectAssignment.id;

      // Get current subjects
      const currentSubjects = selectedTeacherForSubjectAssignment.subjects || [];

      // Find subjects to add and remove
      const subjectsToAdd = selectedSubjects.filter((s) => !currentSubjects.includes(s));
      const subjectsToRemove = currentSubjects.filter((s) => !selectedSubjects.includes(s));

      // Add new subjects (using centralized axiosInstance with auth)
      for (const subject of subjectsToAdd) {
        try {
          await axiosInstance.post(`/teachers/${teacherId}/subjects`, { subject: subject.trim() });
          console.log(`Successfully assigned subject: ${subject}`);
        } catch (err) {
          console.error(`Failed to assign ${subject}:`, err.response?.data || err.message);
          throw new Error(`Failed to assign ${subject}: ${err.response?.data?.message || err.message}`);
        }
      }

      // Remove subjects (using centralized axiosInstance with auth)
      for (const subject of subjectsToRemove) {
        try {
          await axiosInstance.delete(`/teachers/${teacherId}/subjects/${encodeURIComponent(subject)}`);
          console.log(`Successfully removed subject: ${subject}`);
        } catch (err) {
          console.error(`Failed to remove ${subject}:`, err.response?.data || err.message);
          throw new Error(`Failed to remove ${subject}: ${err.response?.data?.message || err.message}`);
        }
      }

      setAssignSubjectError('');
      closeAssignSubjectModal();
      
      // Refresh the teachers list to show updated subjects
      await fetchTeachers();
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to save subject assignment';
      setAssignSubjectError(errorMessage);
      console.error('Error in handleSaveSubjectAssignment:', err);
    } finally {
      setAssigningSubjects(false);
    }
  };

  // ===== ADVANCED FILTERING HANDLERS =====
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    goToPage(1); // Reset to first page when filter changes
  };

  const handleResetFilters = () => {
    setFilters(resetFilters());
    goToPage(1);
  };

  // ===== BATCH OPERATIONS HANDLERS =====
  const toggleTeacherSelection = (teacherId) => {
    const newSelected = new Set(selectedTeachers);
    if (newSelected.has(teacherId)) {
      newSelected.delete(teacherId);
    } else {
      newSelected.add(teacherId);
    }
    setSelectedTeachers(newSelected);
  };

  const selectAllTeachers = () => {
    if (selectedTeachers.size === filteredTeachers.length) {
      setSelectedTeachers(new Set());
    } else {
      setSelectedTeachers(new Set(filteredTeachers.map((t) => t.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTeachers.size === 0) {
      setBatchError('No teachers selected');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedTeachers.size} teacher(s)? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsBatchOperating(true);
      setBatchError('');
      const results = await batchDelete(Array.from(selectedTeachers));

      if (results.failed.length > 0) {
        setBatchError(`Deleted ${results.successful.length}, failed: ${results.failed.length}`);
      } else {
        setSuccessMessage(`Successfully deleted ${results.successful.length} teacher(s)`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }

      setSelectedTeachers(new Set());
      setBatchMode(false);
      await fetchTeachers();
    } catch (err) {
      setBatchError(err.message || 'Batch delete failed');
    } finally {
      setIsBatchOperating(false);
    }
  };

  const handleBatchAssignClasses = async (classNames) => {
    if (selectedTeachers.size === 0) {
      setBatchError('No teachers selected');
      return;
    }

    try {
      setIsBatchOperating(true);
      setBatchError('');
      const results = await batchAssignClasses(Array.from(selectedTeachers), classNames);

      if (results.failed.length > 0) {
        setBatchError(`Assigned to ${results.successful.length}, failed: ${results.failed.length}`);
      } else {
        setSuccessMessage(`Successfully assigned classes to ${results.successful.length} teacher(s)`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }

      setShowBatchAssignModal(false);
      setSelectedTeachers(new Set());
      await fetchTeachers();
    } catch (err) {
      setBatchError(err.message || 'Batch assign failed');
    } finally {
      setIsBatchOperating(false);
    }
  };

  const handleBatchAssignSubjects = async (subjectNames) => {
    if (selectedTeachers.size === 0) {
      setBatchError('No teachers selected');
      return;
    }

    try {
      setIsBatchOperating(true);
      setBatchError('');
      const results = await batchAssignSubjects(Array.from(selectedTeachers), subjectNames);

      if (results.failed.length > 0) {
        setBatchError(`Assigned to ${results.successful.length}, failed: ${results.failed.length}`);
      } else {
        setSuccessMessage(`Successfully assigned subjects to ${results.successful.length} teacher(s)`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }

      setShowBatchAssignModal(false);
      setSelectedTeachers(new Set());
      await fetchTeachers();
    } catch (err) {
      setBatchError(err.message || 'Batch assign failed');
    } finally {
      setIsBatchOperating(false);
    }
  };

  // ===== EXPORT HANDLERS =====
  const handleExportCSV = () => {
    const filename = `teachers_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filteredTeachers, filename);
    setSuccessMessage('CSV exported successfully');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleExportExcel = async () => {
    const filename = `teachers_${new Date().toISOString().split('T')[0]}.xlsx`;
    await exportToExcel(filteredTeachers, filename);
    setSuccessMessage('Excel exported successfully');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleExportPDF = async () => {
    const filename = `teachers_report_${new Date().toISOString().split('T')[0]}.pdf`;
    await exportToPDF(filteredTeachers, filename, filters);
    setSuccessMessage('PDF exported successfully');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // ===== PRINT & CSV IMPORT HANDLERS =====
  const handlePrintView = () => {
    try {
      setIsPrintLoading(true);
      printTeacherList(filteredTeachers, filters);
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
      setSuccessMessage(`Successfully imported ${result.successful.length} teacher(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchTeachers(); // Refresh the teacher list
    }
  };

  return (
    <div className="teacher-search-container">
      {error && <div className="error-banner" style={{ color: 'red', padding: '10px', background: '#fee' }}>{error}</div>}
      {successMessage && <div className="success-banner" style={{ color: 'green', padding: '10px', background: '#efe' }}>{successMessage}</div>}
      {batchError && <div className="error-banner" style={{ color: 'red', padding: '10px', background: '#fee' }}>{batchError}</div>}
      
      <section className="teacher-summary-cards" aria-label="Teacher summary cards">
        <article className="teacher-summary-card teacher-summary-total">
          <i className="fa-solid fa-user-tie teacher-summary-icon" aria-hidden="true"></i>
          <p>Total Teachers</p>
          <h3>{totalTeachers}</h3>
        </article>

        <article className="teacher-summary-card teacher-summary-new">
          <i className="fa-solid fa-user-plus teacher-summary-icon" aria-hidden="true"></i>
          <p>New Teachers</p>
          <h3>{newTeachersCount}</h3>
        </article>

        <article className="teacher-summary-card teacher-summary-progress">
          <i className="fa-solid fa-book-open teacher-summary-icon" aria-hidden="true"></i>
          <p>Syllabus Progress</p>
          <h3>{`${syllabusProgress}%`}</h3>
        </article>

        <article className="teacher-summary-card teacher-summary-top-department">
          <i className="fa-solid fa-trophy teacher-summary-icon" aria-hidden="true"></i>
          <p>Top Performing Departments</p>
          <h3>{topDepartment.count}</h3>
        </article>
      </section>

      <div className="search-section">
        <div className="teacher-header">
          <h2>Teacher Management</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
            <button type="button" className="btn-add-teacher" onClick={openAddModal} style={{ flex: 1, minWidth: '120px' }}>
              <i className="fa-solid fa-plus"></i> Add Teacher
            </button>
            <button type="button" className="btn-export" onClick={() => setShowFilters(!showFilters)} title="Toggle Filters" style={{ flex: 1, minWidth: '100px' }}>
              <i className="fa-solid fa-filter"></i> Filters
            </button>
            <button type="button" className="btn-export" onClick={handleExportCSV} title="Export as CSV" style={{ flex: 1, minWidth: '100px' }}>
              <i className="fa-solid fa-file-csv"></i>Export CSV
            </button>
            <button type="button" className="btn-export" onClick={handleExportExcel} title="Export as Excel" style={{ flex: 1, minWidth: '100px' }}>
              <i className="fa-solid fa-file-excel"></i>Export as Excel
            </button>
            <button type="button" className="btn-export" onClick={handleExportPDF} title="Export as PDF" style={{ flex: 1, minWidth: '100px' }}>
              <i className="fa-solid fa-file-pdf"></i>Export as PDF
            </button>
            <button 
              type="button" 
              className="btn-export" 
              onClick={handlePrintView}
              disabled={isPrintLoading}
              title="Print View" 
              style={{ flex: 1, minWidth: '100px' }}
            >
              <i className="fa-solid fa-print"></i> Print
            </button>
            <button 
              type="button" 
              className="btn-export" 
              onClick={() => setIsCSVImportOpen(true)}
              title="Import from CSV" 
              style={{ flex: 1, minWidth: '100px' }}
            >
              <i className="fa-solid fa-upload"></i> Import csv file
            </button>
            {!batchMode ? (
              <button type="button" className="btn-batch" onClick={() => setBatchMode(true)} title="Batch Operations" style={{ flex: 1, minWidth: '100px' }}>
                <i className="fa-solid fa-check-double"></i> Batch
              </button>
            ) : (
              <button type="button" className="btn-batch-active" onClick={() => { setBatchMode(false); setSelectedTeachers(new Set()); }} title="Exit Batch Mode" style={{ flex: 1, minWidth: '100px' }}>
                <i className="fa-solid fa-times"></i> Cancel Batch
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Bar (Always Visible) */}
        <div className="search-filters" style={{ marginTop: '15px' }}>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by teacher name, email, or ID..."
              value={filters.searchTerm}
              onChange={handleFilterChange}
              name="searchTerm"
              className="search-input"
            />
            <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
          </div>
        </div>

        {/* Advanced Filter Panel */}
        {showFilters && (
          <div className="advanced-filters-panel" style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', marginTop: '15px', border: '1px solid #ddd' }}>
            <h4 style={{ marginTop: 0 }}>Advanced Filters</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label>Search (Name/Email/ID)</label>
                <input
                  type="text"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="Search..."
                  className="search-input"
                />
              </div>

              <div>
                <label>Department</label>
                <select name="department" value={filters.department} onChange={handleFilterChange}>
                  <option value="">All Departments</option>
                  {filterOptions.departments?.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Qualification</label>
                <select name="qualification" value={filters.qualification} onChange={handleFilterChange}>
                  <option value="">All Qualifications</option>
                  {filterOptions.qualifications?.map((qual) => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Specialization</label>
                <select name="specialization" value={filters.specialization} onChange={handleFilterChange}>
                  <option value="">All Specializations</option>
                  {filterOptions.specializations?.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Gender</label>
                <select name="gender" value={filters.gender} onChange={handleFilterChange}>
                  <option value="">All Genders</option>
                  {filterOptions.genders?.map((gender) => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Hire Date From</label>
                <input
                  type="date"
                  name="hireDateFrom"
                  value={filters.hireDateFrom}
                  onChange={handleFilterChange}
                />
              </div>

              <div>
                <label>Hire Date To</label>
                <input
                  type="date"
                  name="hireDateTo"
                  value={filters.hireDateTo}
                  onChange={handleFilterChange}
                />
              </div>

              <div>
                <label>Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                  {getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="button" className="btn-reset" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        )}

        {/* Batch Operations Bar */}
        {batchMode && selectedTeachers.size > 0 && (
          <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '4px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{selectedTeachers.size} teacher(s) selected</strong></span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-warning" onClick={() => setShowBatchAssignModal(true)} title="Batch Assign Classes/Subjects">
                <i className="fa-solid fa-link"></i> Assign
              </button>
              <button type="button" className="btn-danger" onClick={handleBatchDelete} disabled={isBatchOperating} title="Batch Delete">
                <i className="fa-solid fa-trash"></i> {isBatchOperating ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="teacher-modal-overlay" onClick={closeAddModal}>
          <div className="teacher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="teacher-modal-header">
              <h3>Add Teacher</h3>
              <button type="button" className="teacher-modal-close" onClick={closeAddModal}>x</button>
            </div>

            <form className="teacher-form" onSubmit={handleAddTeacher}>
              {formError ? <p className="teacher-form-error">{formError}</p> : null}

              <div className="teacher-form-grid">
                <div className="teacher-form-field">
                  <label htmlFor="firstName">First Name</label>
                  <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="contactNumber">Contact Number</label>
                  <input id="contactNumber" name="contactNumber" type="text" value={formData.contactNumber} onChange={handleInputChange} placeholder="e.g +256700123456" />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="nationality">Nationality</label>
                  <select id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange}>
                    <option value="">Select nationality</option>
                    <option value="Ugandan">Ugandan</option>
                    <option value="Kenyan">Kenyan</option>
                    <option value="Tanzanian">Tanzanian</option>
                    <option value="Rwandan">Rwandan</option>
                    <option value="South Sudanese">South Sudanese</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="qualification">Qualification</label>
                  <select id="qualification" name="qualification" value={formData.qualification} onChange={handleInputChange}>
                    <option value="">Select qualification</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="specialization">Specialization</label>
                  <select id="specialization" name="specialization" value={formData.specialization} onChange={handleInputChange}>
                    <option value="">Select specialization</option>
                    {uniqueSpecializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="department">Department</label>
                  <select id="department" name="department" value={formData.department} onChange={handleInputChange}>
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="hireDate">Hire Date</label>
                  <input id="hireDate" name="hireDate" type="date" value={formData.hireDate} onChange={handleInputChange} />
                </div>
              </div>

              <div className="teacher-form-actions">
                <button type="button" className="teacher-cancel-btn" onClick={closeAddModal} disabled={loading}>Cancel</button>
                <button type="submit" className="teacher-save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Teacher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewTeacher && (
        <div className="teacher-modal-overlay" onClick={closeViewTeacher}>
          <div className="teacher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="teacher-modal-header">
              <h3>Teacher Details</h3>
              <button type="button" className="teacher-modal-close" onClick={closeViewTeacher}>x</button>
            </div>

            <div className="teacher-details-grid">
              <p><strong>Teacher Name:</strong> {viewTeacher.firstName} {viewTeacher.lastName}</p>
              <p><strong>Teacher ID:</strong> <strong>{viewTeacher.displayId || viewTeacher.teacher_id || viewTeacher.teacherId || viewTeacher.id}</strong></p>
              <p><strong>Email:</strong> {viewTeacher.email || '-'}</p>
              <p><strong>Contact Number:</strong> {viewTeacher.contactNumber || viewTeacher.phone || '-'}</p>
              <p><strong>Gender:</strong> {viewTeacher.gender || '-'}</p>
              <p><strong>Nationality:</strong> {viewTeacher.nationality || '-'}</p>
              <p><strong>Qualification:</strong> {viewTeacher.qualification || '-'}</p>
              <p><strong>Specialization:</strong> {viewTeacher.specialization || '-'}</p>
              <p><strong>Department:</strong> {viewTeacher.department || '-'}</p>
              <p><strong>Date of Birth:</strong> {viewTeacher.dateOfBirth || '-'}</p>
              <p><strong>Hire Date:</strong> {viewTeacher.hireDate || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="teacher-modal-overlay" onClick={closeEditTeacher}>
          <div className="teacher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="teacher-modal-header">
              <h3>Edit Teacher</h3>
              <button type="button" className="teacher-modal-close" onClick={closeEditTeacher}>x</button>
            </div>

            <form className="teacher-form" onSubmit={handleSaveEditedTeacher}>
              {editError ? <p className="teacher-form-error">{editError}</p> : null}

              <div className="teacher-form-grid">
                <div className="teacher-form-field">
                  <label htmlFor="editFirstName">First Name</label>
                  <input id="editFirstName" name="firstName" type="text" value={editFormData.firstName} onChange={handleEditInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editLastName">Last Name</label>
                  <input id="editLastName" name="lastName" type="text" value={editFormData.lastName} onChange={handleEditInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editEmail">Email</label>
                  <input id="editEmail" name="email" type="email" value={editFormData.email} onChange={handleEditInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editContactNumber">Contact Number</label>
                  <input id="editContactNumber" name="contactNumber" type="text" value={editFormData.contactNumber} onChange={handleEditInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editDateOfBirth">Date of Birth</label>
                  <input id="editDateOfBirth" name="dateOfBirth" type="date" value={editFormData.dateOfBirth} onChange={handleEditInputChange} />
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editGender">Gender</label>
                  <select id="editGender" name="gender" value={editFormData.gender} onChange={handleEditInputChange}>
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editNationality">Nationality</label>
                  <select id="editNationality" name="nationality" value={editFormData.nationality} onChange={handleEditInputChange}>
                    <option value="">Select nationality</option>
                    <option value="Ugandan">Ugandan</option>
                    <option value="Kenyan">Kenyan</option>
                    <option value="Tanzanian">Tanzanian</option>
                    <option value="Rwandan">Rwandan</option>
                    <option value="South Sudanese">South Sudanese</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editQualification">Qualification</label>
                  <select id="editQualification" name="qualification" value={editFormData.qualification} onChange={handleEditInputChange}>
                    <option value="">Select qualification</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editSpecialization">Specialization</label>
                  <select id="editSpecialization" name="specialization" value={editFormData.specialization} onChange={handleEditInputChange}>
                    <option value="">Select specialization</option>
                    {uniqueSpecializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editDepartment">Department</label>
                  <select id="editDepartment" name="department" value={editFormData.department} onChange={handleEditInputChange}>
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="teacher-form-field">
                  <label htmlFor="editHireDate">Hire Date</label>
                  <input id="editHireDate" name="hireDate" type="date" value={editFormData.hireDate} onChange={handleEditInputChange} />
                </div>
              </div>

              <div className="teacher-form-actions">
                <button type="button" className="teacher-cancel-btn" onClick={closeEditTeacher} disabled={loading}>Cancel</button>
                <button type="submit" className="teacher-save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading teachers...</div>
        ) : paginatedData.length > 0 ? (
          <table className="teachers-table">
            <thead>
              <tr>
                {batchMode && (
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedTeachers.size === filteredTeachers.length && filteredTeachers.length > 0}
                      onChange={selectAllTeachers}
                      title="Select all teachers"
                    />
                  </th>
                )}
                <th>Teacher Name</th>
                <th>Teacher ID</th>
                <th>Specialization</th>
                {/* <th>Status</th> */}
                <th>Email</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((teacher) => (
                <tr key={teacher.id}>
                  {batchMode && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTeachers.has(teacher.id)}
                        onChange={() => toggleTeacherSelection(teacher.id)}
                      />
                    </td>
                  )}
                  <td>{teacher.firstName} {teacher.lastName}</td>
                  <td><strong>{teacher.displayId || teacher.teacher_id || teacher.teacherId || teacher.id}</strong></td>
                  <td>
                    <span className="subject-badge">{teacher.specialization}</span>
                  </td>
                  {/* <td>
                    <StatusBadge teacher={teacher} size="small" />
                  </td> */}
                  <td className="email">{teacher.email}</td>
                  <td className="phone">{teacher.contactNumber || teacher.phone || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewTeacher(teacher)}
                        title="View Details"
                      > <i className="fa-solid fa-eye"></i>
                        View
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEditTeacher(teacher)}
                        title="Edit Teacher"
                      > <i className="fa-solid fa-pen-to-square"></i>
                        Edit
                      </button>
                      <button
                        className="btn btn-info"
                        onClick={() => openAssignClassModal(teacher)}
                        title="Assign Classes"
                      >
                        Assign Classes
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => openAssignSubjectModal(teacher)}
                        title="Assign Subjects"
                      >
                        Assign Subjects
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteTeacher(teacher)}
                        title="Delete Teacher"
                      > <i className="fa-solid fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <p>No teachers found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredTeachers.length > 0 && (
        <div className="pagination-controls" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', borderRadius: '4px', marginTop: '15px' }}>
          <div>
            <p>Showing {startIndex + 1} to {endIndex} of {totalItems} teachers</p>
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button type="button" onClick={goToFirstPage} disabled={currentPage === 1} className="btn btn-sm">
              <i className="fa-solid fa-chevron-left"></i> First
            </button>
            <button type="button" onClick={prevPage} disabled={currentPage === 1} className="btn btn-sm">
              <i className="fa-solid fa-chevron-left"></i> Prev
            </button>
            <span style={{ padding: '0 10px' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button type="button" onClick={nextPage} disabled={currentPage === totalPages} className="btn btn-sm">
              Next <i className="fa-solid fa-chevron-right"></i>
            </button>
            <button type="button" onClick={goToLastPage} disabled={currentPage === totalPages} className="btn btn-sm">
              Last <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      <div className="table-footer">
        <p>Showing {paginatedData.length} of {totalItems} teachers on this page (Total: {totalItems})</p>
      </div>

      {isAssignClassModalOpen && (
        <div className="teacher-modal-overlay" onClick={closeAssignClassModal}>
          <div className="teacher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="teacher-modal-header">
              <h3>Assign Classes to {selectedTeacherForClassAssignment?.firstName} {selectedTeacherForClassAssignment?.lastName}</h3>
              <button type="button" className="teacher-modal-close" onClick={closeAssignClassModal}>x</button>
            </div>

            <form className="teacher-form" onSubmit={handleSaveClassAssignment}>
              {assignClassError ? <p className="teacher-form-error">{assignClassError}</p> : null}

              <div className="teacher-form-field">
                <label>Select Classes</label>
                <div className="class-selection-container">
                  {loadingClasses ? (
                    <p className="text-muted">Loading classes...</p>
                  ) : classes.length > 0 ? (
                    <div className="class-checkboxes">
                      {classes.map((cls) => {
                        // Handle flexible field names from backend
                        const classId = cls.id || cls.classId || cls.class_id || `class-${Math.random()}`;
                        const className = cls.name || cls.className || cls.class_name || 'Unknown';
                        const classStream = cls.stream || cls.streamName || '';
                        const formLevel = cls.formLevel || cls.form_level || cls.level || '';
                        
                        return (
                          <div key={classId} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`class-${classId}`}
                              checked={selectedClasses.includes(className)}
                              onChange={() => handleSelectClass(className)}
                            />
                            <label htmlFor={`class-${classId}`}>
                              {className} {classStream && `(${classStream})`} {formLevel && `- Form ${formLevel}`}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted">No classes available</p>
                  )}
                </div>
              </div>

              <div className="teacher-form-field">
                <label>Selected Classes: {selectedClasses.length}</label>
                <div className="selected-classes-display">
                  {selectedClasses.length > 0 ? (
                    selectedClasses.map((cls) => (
                      <span key={cls} className="class-badge">
                        {cls}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted">No classes selected</p>
                  )}
                </div>
              </div>

              <div className="teacher-form-actions">
                <button type="button" className="teacher-cancel-btn" onClick={closeAssignClassModal}>Cancel</button>
                <button type="submit" className="teacher-save-btn" disabled={assigningClasses}>
                  {assigningClasses ? 'Assigning...' : 'Assign Classes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAssignSubjectModalOpen && (
        <div className="teacher-modal-overlay" onClick={closeAssignSubjectModal}>
          <div className="teacher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="teacher-modal-header">
              <h3>Assign Subjects to {selectedTeacherForSubjectAssignment?.firstName} {selectedTeacherForSubjectAssignment?.lastName}</h3>
              <button type="button" className="teacher-modal-close" onClick={closeAssignSubjectModal}>x</button>
            </div>

            <form className="teacher-form" onSubmit={handleSaveSubjectAssignment}>
              {assignSubjectError ? <p className="teacher-form-error">{assignSubjectError}</p> : null}

              <div className="teacher-form-field">
                <label>Available Subjects</label>
                <div className="subject-selection-container">
                  {subjects.length > 0 ? (
                    <div className="subject-checkboxes">
                      {subjects.map((subject) => {
                        // Handle flexible field names from backend
                        const subjectId = subject.id || subject.subjectId || subject.subject_id || `subject-${Math.random()}`;
                        const subjectName = subject.name || subject.subjectName || subject.subject_name || 'Unknown';
                        const subjectCode = subject.code || '';
                        
                        return (
                          <div key={subjectId} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`subject-${subjectId}`}
                              checked={selectedSubjects.includes(subjectName)}
                              onChange={() => handleSelectSubject(subjectName)}
                            />
                            <label htmlFor={`subject-${subjectId}`}>
                              {subjectName} {subjectCode && `(${subjectCode})`}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted">No subjects available</p>
                  )}
                </div>
              </div>

              <div className="teacher-form-field">
                <label>Selected Subjects: {selectedSubjects.length}</label>
                <div className="selected-subjects-display">
                  {selectedSubjects.length > 0 ? (
                    selectedSubjects.map((subj) => (
                      <span key={subj} className="subject-badge">
                        {subj}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted">No subjects selected</p>
                  )}
                </div>
              </div>

              <div className="teacher-form-field" style={{ fontSize: '0.9em', padding: '10px', background: '#f0f8ff', borderRadius: '4px', marginBottom: '15px' }}>
                <strong>ℹ️ Note:</strong> This assigns subjects to the teacher's profile. The teacher will be able to teach these subjects in any of their assigned classes.
              </div>

              <div className="teacher-form-actions">
                <button type="button" className="teacher-cancel-btn" onClick={closeAssignSubjectModal}>Cancel</button>
                <button type="submit" className="teacher-save-btn" disabled={assigningSubjects}>
                  {assigningSubjects ? 'Assigning...' : 'Assign Subjects'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Assign Modal */}
      {showBatchAssignModal && (
        <div className="teacher-modal-overlay" onClick={() => setShowBatchAssignModal(false)}>
          <div className="teacher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="teacher-modal-header">
              <h3>Batch Assign ({selectedTeachers.size} teachers selected)</h3>
              <button type="button" className="teacher-modal-close" onClick={() => setShowBatchAssignModal(false)}>x</button>
            </div>

            <form className="teacher-form" onSubmit={(e) => {
              e.preventDefault();
              const type = document.querySelector('input[name="batchAssignType"]:checked')?.value;
              if (type === 'classes') {
                const classCheckboxes = document.querySelectorAll('input[name="batchClasses"]:checked');
                const classes = Array.from(classCheckboxes).map(cb => cb.value);
                if (classes.length > 0) handleBatchAssignClasses(classes);
                else alert('Select at least one class');
              } else if (type === 'subjects') {
                const subjectCheckboxes = document.querySelectorAll('input[name="batchSubjects"]:checked');
                const subjects = Array.from(subjectCheckboxes).map(cb => cb.value);
                if (subjects.length > 0) handleBatchAssignSubjects(subjects);
                else alert('Select at least one subject');
              }
            }}>
              {batchError && <p className="teacher-form-error">{batchError}</p>}

              <div className="teacher-form-field">
                <label>What do you want to assign?</label>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ marginRight: '20px' }}>
                    <input type="radio" name="batchAssignType" value="classes" defaultChecked onChange={(e) => setBatchAssignType(e.target.value)} />
                    Classes
                  </label>
                  <label>
                    <input type="radio" name="batchAssignType" value="subjects" onChange={(e) => setBatchAssignType(e.target.value)} />
                    Subjects
                  </label>
                </div>
              </div>

              {batchAssignType === 'classes' && (
                <div className="teacher-form-field">
                  <label>Select Classes to Assign</label>
                  <div className="class-selection-container">
                    {classes.length > 0 ? (
                      <div className="class-checkboxes">
                        {classes.map((cls) => {
                          const classId = cls.id || cls.classId || cls.class_id;
                          const className = cls.name || cls.className || cls.class_name || 'Unknown';
                          return (
                            <div key={classId} className="checkbox-item">
                              <input
                                type="checkbox"
                                id={`batch-class-${classId}`}
                                name="batchClasses"
                                value={className}
                              />
                              <label htmlFor={`batch-class-${classId}`}>{className}</label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted">No classes available</p>
                    )}
                  </div>
                </div>
              )}

              {batchAssignType === 'subjects' && (
                <div className="teacher-form-field">
                  <label>Select Subjects to Assign</label>
                  <div className="subject-selection-container">
                    {subjects.length > 0 ? (
                      <div className="subject-checkboxes">
                        {subjects.map((subject) => {
                          const subjectId = subject.id || subject.subjectId || subject.subject_id;
                          const subjectName = subject.name || subject.subjectName || subject.subject_name || 'Unknown';
                          return (
                            <div key={subjectId} className="checkbox-item">
                              <input
                                type="checkbox"
                                id={`batch-subject-${subjectId}`}
                                name="batchSubjects"
                                value={subjectName}
                              />
                              <label htmlFor={`batch-subject-${subjectId}`}>{subjectName}</label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted">No subjects available</p>
                    )}
                  </div>
                </div>
              )}

              <div className="teacher-form-actions">
                <button type="button" className="teacher-cancel-btn" onClick={() => setShowBatchAssignModal(false)} disabled={isBatchOperating}>Cancel</button>
                <button type="submit" className="teacher-save-btn" disabled={isBatchOperating}>
                  {isBatchOperating ? 'Assigning...' : 'Assign to All Selected'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal 
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        onImportComplete={handleCSVImportComplete}
      />
    </div>
  );
};

export default TeacherSearch;
