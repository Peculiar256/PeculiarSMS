/**
 * Batch operations utilities for TeacherSearch
 */

import axiosInstance from '../services/axiosInstance';

export const batchAssignClasses = async (teacherIds, classNames) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const teacherId of teacherIds) {
    try {
      await axiosInstance.put(`/teachers/${teacherId}`, {
        assignedClasses: classNames,
      });
      results.successful.push(teacherId);
    } catch (error) {
      results.failed.push({
        teacherId,
        error: error.response?.data?.message || error.message,
      });
    }
  }

  return results;
};

export const batchAssignSubjects = async (teacherIds, subjectNames) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const teacherId of teacherIds) {
    for (const subject of subjectNames) {
      try {
        await axiosInstance.post(`/teachers/${teacherId}/subjects`, {
          subject: subject.trim(),
        });
        if (!results.successful.includes(teacherId)) {
          results.successful.push(teacherId);
        }
      } catch (error) {
        if (!results.failed.find((f) => f.teacherId === teacherId)) {
          results.failed.push({
            teacherId,
            error: error.response?.data?.message || error.message,
          });
        }
      }
    }
  }

  return results;
};

export const batchDelete = async (teacherIds) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const teacherId of teacherIds) {
    try {
      await axiosInstance.delete(`/teachers/${teacherId}`);
      results.successful.push(teacherId);
    } catch (error) {
      results.failed.push({
        teacherId,
        error: error.response?.data?.message || error.message,
      });
    }
  }

  return results;
};

export const batchUpdateDepartment = async (teacherIds, department) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const teacherId of teacherIds) {
    try {
      await axiosInstance.put(`/teachers/${teacherId}`, {
        department,
      });
      results.successful.push(teacherId);
    } catch (error) {
      results.failed.push({
        teacherId,
        error: error.response?.data?.message || error.message,
      });
    }
  }

  return results;
};
