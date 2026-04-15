/**
 * Filter utilities for TeacherSearch
 * Handles advanced filtering logic
 */

import { filterByStatus } from './statusUtils';

export const applyFilters = (teachers, filters) => {
  if (!filters || Object.values(filters).every((v) => !v)) {
    return teachers;
  }

  return teachers.filter((teacher) => {
    // Department filter
    if (filters.department && teacher.department !== filters.department) {
      return false;
    }

    // Qualification filter
    if (filters.qualification && teacher.qualification !== filters.qualification) {
      return false;
    }

    // Specialization filter
    if (filters.specialization && teacher.specialization !== filters.specialization) {
      return false;
    }

    // Gender filter
    if (filters.gender && teacher.gender !== filters.gender) {
      return false;
    }

    // Date range filter (hire date)
    if (filters.hireDateFrom && teacher.hireDate) {
      const teacherDate = new Date(teacher.hireDate);
      const fromDate = new Date(filters.hireDateFrom);
      if (teacherDate < fromDate) return false;
    }

    if (filters.hireDateTo && teacher.hireDate) {
      const teacherDate = new Date(teacher.hireDate);
      const toDate = new Date(filters.hireDateTo);
      if (teacherDate > toDate) return false;
    }

    // Search term (name, email, ID)
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.toLowerCase();
      const email = (teacher.email || '').toLowerCase();
      const id = (teacher.displayId || teacher.teacher_id || teacher.id || '').toString().toLowerCase();

      if (!fullName.includes(search) && !email.includes(search) && !id.includes(search)) {
        return false;
      }
    }

    return true;
  }).filter(teacher => {
    // Status filter
    if (filters.status && filters.status !== 'ALL') {
      return filterByStatus([teacher], filters.status).length > 0;
    }
    return true;
  });
};

export const getFilterOptions = (teachers) => {
  const departments = [...new Set(teachers.map((t) => t.department).filter(Boolean))].sort();
  const qualifications = [...new Set(teachers.map((t) => t.qualification).filter(Boolean))].sort();
  const specializations = [...new Set(teachers.map((t) => t.specialization).filter(Boolean))].sort();
  const genders = [...new Set(teachers.map((t) => t.gender).filter(Boolean))].sort();

  return {
    departments,
    qualifications,
    specializations,
    genders,
  };
};

export const resetFilters = () => ({
  searchTerm: '',
  department: '',
  qualification: '',
  specialization: '',
  gender: '',
  hireDateFrom: '',
  hireDateTo: '',
  status: '',
});
