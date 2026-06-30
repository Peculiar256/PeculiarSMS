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
import './AdminCards.css';

const ITEMS_PER_PAGE = 10;

const TeacherSearch = () => {
  // Basic state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeachersCount, setNewTeachersCount] = useState(0);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [activeViewSection, setActiveViewSection] = useState('personal'); // 'personal', 'professional', 'contact'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTeacherForStatus, setSelectedTeacherForStatus] = useState(null);
  const [editError, setEditError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [teacherToEditId, setTeacherToEditId] = useState(null);
  
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
      const response = await axiosInstance.get('/teachers');
      const data = response.data;
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
      const response = await axiosInstance.get('/subjects');
      const data = response.data;
      const subjectList = Array.isArray(data) ? data : data.subjects || [];
      setSubjects(subjectList);

      // Extract unique specializations from subjects
      const specializations = [...new Set(subjectList.map((s) => s.name).filter(Boolean))];
      setUniqueSpecializations(specializations.sort());
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setSubjects([]);
      setUniqueSpecializations([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get('/departments');
      const data = response.data;
      const deptList = data.data || [];
      setDepartments(
        deptList.map((d) => (typeof d === 'string' ? d : d.name || d)).filter(Boolean)
      );
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await axiosInstance.get('/classes');
      const data = response.data;
      
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

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/^(\+256|0)/, '');
    return '+256' + cleaned;
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

    if (!validateEmail(email)) {
      setFormError('Invalid email format');
      return;
    }

    try {
      const teacherPayload = {
        firstName,
        lastName,
        email,
        phoneNumber: formatPhoneNumber(contactNumber),
        dateOfBirth,
        gender,
        nationality,
        qualifications: qualification,
        specialization,
        department,
        dateJoined: hireDate,
      };

      console.log('Teacher payload being sent:', teacherPayload);
      
      const response = await axiosInstance.post('/teachers', teacherPayload);

      setNewTeachersCount((prev) => prev + 1);
      resetForm();
      closeAddModal();
      fetchTeachers();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create teacher');
      console.error('Error creating teacher:', err);
    }
  };

  // Handle action buttons
const handleViewTeacher = async (teacher) => {
    try {
      const response = await axiosInstance.get(`/teachers/${teacher.id}`);
      const completeTeacher = response.data;
      console.log('Complete teacher data from API:', completeTeacher);

      const mappedTeacher = {
        ...completeTeacher,
        id: completeTeacher.id || teacher.id,
        firstName: completeTeacher.firstName || teacher.firstName,
        lastName: completeTeacher.lastName || teacher.lastName,
        email: completeTeacher.email || teacher.email,
        contactNumber: completeTeacher.phoneNumber || completeTeacher.contactNumber || teacher.contactNumber || teacher.phone,
        hireDate: completeTeacher.dateJoined || completeTeacher.hireDate || teacher.hireDate,
        qualification: completeTeacher.qualifications || completeTeacher.qualification || teacher.qualification,
        displayId: completeTeacher.teacher_id || completeTeacher.teacherId || teacher.id,
        department: (typeof completeTeacher.department === 'object' && completeTeacher.department?.name) 
          ? completeTeacher.department.name 
          : completeTeacher.department || completeTeacher.departmentName || teacher.department,
        nationality: completeTeacher.nationality || teacher.nationality,
        gender: completeTeacher.gender || teacher.gender,
        dateOfBirth: completeTeacher.dateOfBirth || teacher.dateOfBirth,
        specialization: completeTeacher.specialization || completeTeacher.successSubject || teacher.specialization,
        phone: completeTeacher.phoneNumber || teacher.phone,
      };
      console.log('Mapped teacher data:', mappedTeacher);
      setViewTeacher(mappedTeacher);
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      setViewTeacher(teacher);
    }
  };

  const closeViewTeacher = () => {
    setViewTeacher(null);
  };

  const handleEditTeacher = (teacher) => {
    setEditError('');
    // Use numeric id for API calls, not the string teacher_id
    const teacherId = teacher.id;
    setTeacherToEditId(teacherId);
    
    // Handle department which might be an object or string
    const deptValue = (typeof teacher.department === 'object' && teacher.department?.name) 
      ? teacher.department.name 
      : teacher.department || '';
    
    setEditFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      contactNumber: teacher.contactNumber || teacher.phone || '',
      dateOfBirth: teacher.dateOfBirth || '',
      gender: teacher.gender || '',
      nationality: teacher.nationality || '',
      qualification: teacher.qualification || '',
      specialization: teacher.specialization || teacher.successSubject || '',
      department: deptValue,
      hireDate: teacher.hireDate || teacher.dateJoined || '',
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
        phoneNumber: formatPhoneNumber(contactNumber),
        dateOfBirth: editFormData.dateOfBirth,
        gender: editFormData.gender,
        nationality: editFormData.nationality,
        qualifications: editFormData.qualification,
        specialization: editFormData.specialization,
        department: editFormData.department,
        dateJoined: editFormData.hireDate,
      };

      console.log('Update payload being sent:', updatePayload);
      
      const response = await axiosInstance.put(`/teachers/${teacherToEditId}`, updatePayload);

      closeEditTeacher();
      fetchTeachers();
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update teacher');
      console.error('Error updating teacher:', err);
    }
  };

const handleToggleStatus = async () => {
    try {
      setLoading(true);
      const newStatus = selectedTeacherForStatus.isActive === false;
      
      const response = await axiosInstance.patch(`/teachers/${selectedTeacherForStatus.id}/status?active=${newStatus}`);

      setSuccessMessage(`Teacher ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setIsStatusModalOpen(false);
      setSelectedTeacherForStatus(null);
      fetchTeachers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling teacher status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update teacher status');
    } finally {
      setLoading(false);
    }
  };

  // Class Assignment Functions
  const openAssignClassModal = async (teacher) => {
    try {
      // Fetch fresh teacher data to ensure we have all assigned classes
      const response = await axiosInstance.get(`/teachers/${teacher.id}`);
      const fullTeacher = response.data;
      
      // Extract class names from assignedClasses (could be strings or objects)
      let assignedClasses = [];
      if (fullTeacher.assignedClasses) {
        assignedClasses = fullTeacher.assignedClasses.map(cls => {
          if (typeof cls === 'string') return cls;
          return cls.name || cls.className || cls.class_name || '';
        }).filter(Boolean);
      }
      
      setSelectedTeacherForClassAssignment(fullTeacher);
      setSelectedClasses(assignedClasses);
      setAssignClassError('');
      setIsAssignClassModalOpen(true);
      fetchClasses();
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      // Fallback to using the teacher data we have
      const assignedClasses = (teacher.assignedClasses || []).map(cls => {
        if (typeof cls === 'string') return cls;
        return cls.name || cls.className || cls.class_name || '';
      }).filter(Boolean);
      setSelectedTeacherForClassAssignment(teacher);
      setSelectedClasses(assignedClasses);
      setAssignClassError('');
      setIsAssignClassModalOpen(true);
      fetchClasses();
    }
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
      
      const teacherId = selectedTeacherForClassAssignment.id;

      const payload = {
        assignedClasses: selectedClasses,
      };

      await axiosInstance.put(`/teachers/${teacherId}`, payload);
      console.log('Classes assigned successfully');

      closeAssignClassModal();
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
  const openAssignSubjectModal = async (teacher) => {
    try {
      // Fetch fresh teacher data to ensure we have all assigned subjects
      const response = await axiosInstance.get(`/teachers/${teacher.id}`);
      const fullTeacher = response.data;
      
      // Extract subject names from subjects (could be strings or objects)
      let assignedSubjects = [];
      if (fullTeacher.subjects) {
        assignedSubjects = fullTeacher.subjects.map(subject => {
          if (typeof subject === 'string') return subject;
          return subject.name || subject.subjectName || subject.subject_name || '';
        }).filter(Boolean);
      }
      
      setSelectedTeacherForSubjectAssignment(fullTeacher);
      setSelectedSubjects(assignedSubjects);
      setAssignSubjectError('');
      setIsAssignSubjectModalOpen(true);
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      // Fallback to using the teacher data we have
      const assignedSubjects = (teacher.subjects || []).map(subject => {
        if (typeof subject === 'string') return subject;
        return subject.name || subject.subjectName || subject.subject_name || '';
      }).filter(Boolean);
      setSelectedTeacherForSubjectAssignment(teacher);
      setSelectedSubjects(assignedSubjects);
      setAssignSubjectError('');
      setIsAssignSubjectModalOpen(true);
    }
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
      
      const teacherId = selectedTeacherForSubjectAssignment.id;
      const currentSubjects = selectedTeacherForSubjectAssignment.subjects || [];
      const subjectsToAdd = selectedSubjects.filter((s) => !currentSubjects.includes(s));
      const subjectsToRemove = currentSubjects.filter((s) => !selectedSubjects.includes(s));

      for (const subject of subjectsToAdd) {
        try {
          await axiosInstance.post(`/teachers/${teacherId}/subjects`, { subject: subject.trim() });
          console.log(`Successfully assigned subject: ${subject}`);
        } catch (err) {
          console.error(`Failed to assign ${subject}:`, err.response?.data || err.message);
          throw new Error(`Failed to assign ${subject}: ${err.response?.data?.message || err.message}`);
        }
      }

      for (const subject of subjectsToRemove) {
        try {
          await axiosInstance.delete(`/teachers/${teacherId}/subjects/${encodeURIComponent(subject)}`);
          console.log(`Successfully removed subject: ${subject}`);
        } catch (err) {
          console.error(`Failed to remove ${subject}:`, err.response?.data || err.message);
          throw new Error(`Failed to remove ${subject}: ${err.response?.data?.message || err.message}`);
        }
      }

      closeAssignSubjectModal();
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
      
      <section className="stats-grid" style={{ marginBottom: '24px' }}>
        <article className="stat-card">
          <div className="stat-icon teacher">
            <i className="fa-solid fa-user-tie"></i>
          </div>
          <div className="stat-info">
            <h3>Total Teachers</h3>
            <p>{totalTeachers}</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon teacher">
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <div className="stat-info">
            <h3>New Teachers</h3>
            <p>{newTeachersCount}</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon teacher">
            <i className="fa-solid fa-book-open"></i>
          </div>
          <div className="stat-info">
            <h3>Syllabus Progress</h3>
            <p>{`${syllabusProgress}%`}</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon departments">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div className="stat-info">
            <h3>Top Performing Departments</h3>
            <p>{topDepartment.count}</p>
          </div>
        </article>
      </section>

      <div className="search-section">
        <div className="teacher-header">
          <h2>Teacher Management</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <button type="button" className="btn-add-teacher" onClick={openAddModal} style={{ minWidth: '120px' }}>
                <i className="fa-solid fa-plus"></i> Add Teacher
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="button" className="btn-export" onClick={() => setShowFilters(!showFilters)} title="Toggle Filters" style={{ minWidth: '100px' }}>
                <i className="fa-solid fa-filter"></i> Filters
              </button>
              <button type="button" className="btn-export" onClick={handleExportCSV} title="Export as CSV" style={{ minWidth: '100px' }}>
                <i className="fa-solid fa-file-csv"></i>Export CSV
              </button>
              <button type="button" className="btn-export" onClick={handleExportExcel} title="Export as Excel" style={{ minWidth: '100px' }}>
                <i className="fa-solid fa-file-excel"></i>Export as Excel
              </button>
              <button type="button" className="btn-export" onClick={handleExportPDF} title="Export as PDF" style={{ minWidth: '100px' }}>
                <i className="fa-solid fa-file-pdf"></i>Export as PDF
              </button>
              <button 
                type="button" 
                className="btn-export" 
                onClick={handlePrintView}
                disabled={isPrintLoading}
                title="Print View" 
                style={{ minWidth: '100px' }}
              >
                <i className="fa-solid fa-print"></i> Print
              </button>
              <button 
                type="button" 
                className="btn-export" 
                onClick={() => setIsCSVImportOpen(true)}
                title="Import from CSV" 
                style={{ minWidth: '100px' }}
              >
                <i className="fa-solid fa-upload"></i> Import csv file
              </button>
              {!batchMode ? (
                <button type="button" className="btn-batch" onClick={() => setBatchMode(true)} title="Batch Operations" style={{ minWidth: '100px' }}>
                  <i className="fa-solid fa-check-double"></i> Batch
                </button>
              ) : (
                <button type="button" className="btn-batch-active" onClick={() => { setBatchMode(false); setSelectedTeachers(new Set()); }} title="Exit Batch Mode" style={{ minWidth: '100px' }}>
                  <i className="fa-solid fa-times"></i> Cancel Batch
                </button>
              )}
            </div>
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
          <div className="teacher-modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="teacher-modal-header" style={{ background: '#1E40AF', color: 'white', padding: '0', position: 'relative', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '50px' }}>
              <button 
                type="button" 
                onClick={closeViewTeacher} 
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
                <i className="fa-solid fa-user"></i>
              </div>
              <h2 style={{ margin: '10px 0 5px', fontSize: '24px', fontWeight: '600' }}>
                {viewTeacher.firstName} {viewTeacher.lastName}
              </h2>
              <p style={{ margin: '0 0 15px', fontSize: '14px', opacity: 0.9 }}>
                <strong>{viewTeacher.displayId || viewTeacher.teacher_id || viewTeacher.teacherId || viewTeacher.id}</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                  <i className="fa-solid fa-briefcase" style={{ marginRight: '5px' }}></i>
                  {viewTeacher.specialization || 'Not Assigned'}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                  <i className="fa-solid fa-building" style={{ marginRight: '5px' }}></i>
                  {viewTeacher.department || 'Unassigned'}
                </span>
              </div>
            </div>
            {/* Details Sections - Accordion Style */}
            <div style={{ padding: '15px 20px' }}>
              
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
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{viewTeacher.gender || 'Not Specified'}</p>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Nationality</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{viewTeacher.nationality || 'Not Specified'}</p>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Date of Birth</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{viewTeacher.dateOfBirth ? new Date(viewTeacher.dateOfBirth).toLocaleDateString() : 'Not Specified'}</p>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Hire Date</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{viewTeacher.hireDate ? new Date(viewTeacher.hireDate).toLocaleDateString() : 'Not Specified'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Professional Information Section */}
              <div style={{ marginBottom: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  onClick={() => setActiveViewSection(activeViewSection === 'professional' ? '' : 'professional')}
                  style={{ 
                    padding: '12px 15px', 
                    background: activeViewSection === 'professional' ? '#f0f4ff' : '#fff', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: activeViewSection === 'professional' ? '1px solid #e0e0e0' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-graduation-cap"></i>
                    Professional Information
                  </h4>
                  <i className={`fa-solid fa-chevron-${activeViewSection === 'professional' ? 'up' : 'down'}`} style={{ color: '#999', fontSize: '12px' }}></i>
                </div>
                
                {activeViewSection === 'professional' && (
                  <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#fff' }}>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Qualification</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{viewTeacher.qualification || 'Not Specified'}</p>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Specialization</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{viewTeacher.specialization || 'Not Assigned'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1', padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Department</p>
                      <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{viewTeacher.department || 'Unassigned'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Contact Information Section */}
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
                    Contact Information
                  </h4>
                  <i className={`fa-solid fa-chevron-${activeViewSection === 'contact' ? 'up' : 'down'}`} style={{ color: '#999', fontSize: '12px' }}></i>
                </div>
                
                {activeViewSection === 'contact' && (
                  <div style={{ padding: '15px', background: '#fff' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</p>
                        <p style={{ margin: '0', fontSize: '13px', fontWeight: '500', color: '#1E40AF' }}>{viewTeacher.email || 'Not Provided'}</p>
                      </div>
                      <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #1E40AF' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Phone Number</p>
                        <p style={{ margin: '0', fontSize: '13px', fontWeight: '500' }}>{viewTeacher.contactNumber || viewTeacher.phone || 'Not Provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button 
                  type="button" 
                  onClick={closeViewTeacher}
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
                    handleEditTeacher(viewTeacher);
                    closeViewTeacher();
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
                  Edit Teacher
                </button>
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
      {isStatusModalOpen && selectedTeacherForStatus && (
        <div className="teacher-modal-overlay" onClick={() => setIsStatusModalOpen(false)}>
          <div className="teacher-modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="teacher-modal-header">
              <h3 style={{ color: selectedTeacherForStatus.isActive !== false ? '#dc2626' : '#166534' }}>
                {selectedTeacherForStatus.isActive !== false ? 'Deactivate' : 'Activate'} Teacher
              </h3>
              <button className="teacher-modal-close" onClick={() => setIsStatusModalOpen(false)}>×</button>
            </div>
            <div className="teacher-modal-body py-4" style={{ padding: '20px' }}>
              <p style={{ fontSize: '15px', color: '#1f2937' }}>Are you sure you want to <strong>{selectedTeacherForStatus.isActive !== false ? 'deactivate' : 'activate'}</strong> <strong>{selectedTeacherForStatus.firstName} {selectedTeacherForStatus.lastName}</strong> ({selectedTeacherForStatus.teacherId})?</p>
              {selectedTeacherForStatus.isActive !== false ? (
                <div style={{ marginTop: '15px', padding: '12px', background: '#fff1f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <p className="text-muted small" style={{ margin: 0, color: '#991b1b' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                    Deactivated teachers will not be able to log in, but their payroll and academic records will be preserved.
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: '15px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                  <p className="text-muted small" style={{ margin: 0, color: '#166534' }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i>
                    This will restore the teacher's access to the system immediately.
                  </p>
                </div>
              )}
            </div>
            <div className="teacher-form-actions" style={{ padding: '0 20px 20px', display: 'flex', gap: '12px' }}>
              <button type="button" className="teacher-cancel-btn" style={{ flex: 1 }} onClick={() => setIsStatusModalOpen(false)}>Cancel</button>
              <button 
                type="button" 
                className={`btn ${selectedTeacherForStatus.isActive !== false ? 'btn-danger' : 'btn-success'}`} 
                style={{ flex: 1 }} 
                onClick={handleToggleStatus} 
                disabled={loading}
              >
                {loading ? 'Processing...' : (selectedTeacherForStatus.isActive !== false ? 'Confirm Deactivation' : 'Confirm Activation')}
              </button>
            </div>
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
                <th>Status</th>
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
                  <td>
                    <span className={`badge ${teacher.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                      {teacher.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="email">{teacher.email}</td>
                  <td className="phone">{teacher.contactNumber || teacher.phone || '-'}</td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minWidth: '180px' }}>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewTeacher(teacher)}
                        title="View Details"
                        style={{ padding: '5px 8px' }}
                      > <i className="fa-solid fa-eye"></i>
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleEditTeacher(teacher)}
                        title="Edit Teacher"
                        style={{ padding: '5px 8px' }}
                      > <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openAssignClassModal(teacher)}
                        title="Assign Classes"
                        style={{ padding: '5px 8px', backgroundColor: '#6c757d', color: 'white' }}
                      >
                        <i className="fa-solid fa-school"></i>
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => openAssignSubjectModal(teacher)}
                        title="Assign Subjects"
                        style={{ padding: '5px 8px', backgroundColor: '#22c55e', color: 'white !important' }}
                      >
                        <i className="fa-solid fa-book-open"></i>
                      </button>
                      <button
                        className={`btn ${teacher.isActive !== false ? 'btn-danger' : 'btn-success'} btn-sm`}
                        onClick={() => { setSelectedTeacherForStatus(teacher); setIsStatusModalOpen(true); }}
                        title={teacher.isActive !== false ? 'Deactivate' : 'Activate'}
                        style={{ padding: '5px 10px', minWidth: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <i className={`fa-solid ${teacher.isActive !== false ? 'fa-user-slash' : 'fa-user-check'}`}></i>
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
