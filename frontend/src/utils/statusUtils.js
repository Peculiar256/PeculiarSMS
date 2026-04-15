/**
 * Teacher status utilities and indicators
 */

export const TEACHER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  RETIRED: 'RETIRED'
};

/**
 * Determine teacher status based on various criteria
 * @param {Object} teacher - Teacher data
 * @returns {Object} Status object with color, label, icon
 */
export const getTeacherStatus = (teacher) => {
  // Priority logic:
  // 1. If isActive is explicitly false -> INACTIVE
  // 2. If onLeave is true -> ON_LEAVE
  // 3. If both are false/absent -> check last activity or default to ACTIVE
  
  if (teacher.isActive === false) {
    return {
      status: TEACHER_STATUS.INACTIVE,
      label: 'Inactive',
      color: '#e74c3c',
      backgroundColor: '#fadbd8',
      icon: '⊘'
    };
  }
  
  if (teacher.onLeave === true) {
    return {
      status: TEACHER_STATUS.ON_LEAVE,
      label: 'On Leave',
      color: '#f39c12',
      backgroundColor: '#fdeaa3',
      icon: '⏸'
    };
  }
  
  if (teacher.isRetired === true) {
    return {
      status: TEACHER_STATUS.RETIRED,
      label: 'Retired',
      color: '#95a5a6',
      backgroundColor: '#ecf0f1',
      icon: '🏛'
    };
  }
  
  // Default to ACTIVE
  return {
    status: TEACHER_STATUS.ACTIVE,
    label: 'Active',
    color: '#27ae60',
    backgroundColor: '#d5f4e6',
    icon: '✓'
  };
};

/**
 * Status badge component props
 * @param {Object} teacher - Teacher data
 * @returns {Object} Props for status badge
 */
export const getStatusBadgeProps = (teacher) => {
  return getTeacherStatus(teacher);
};

/**
 * Filter teachers by status
 * @param {Array} teachers - Array of teachers
 * @param {String} status - Status to filter by
 * @returns {Array} Filtered teachers
 */
export const filterByStatus = (teachers, status) => {
  if (!status || status === 'ALL') return teachers;
  
  return teachers.filter(teacher => {
    const teacherStatus = getTeacherStatus(teacher).status;
    return teacherStatus === status;
  });
};

/**
 * Get summary statistics by status
 * @param {Array} teachers - Array of teachers
 * @returns {Object} Count of teachers by status
 */
export const getStatusSummary = (teachers) => {
  const summary = {
    [TEACHER_STATUS.ACTIVE]: 0,
    [TEACHER_STATUS.INACTIVE]: 0,
    [TEACHER_STATUS.ON_LEAVE]: 0,
    [TEACHER_STATUS.RETIRED]: 0,
    total: teachers.length
  };
  
  teachers.forEach(teacher => {
    const status = getTeacherStatus(teacher).status;
    summary[status]++;
  });
  
  return summary;
};

/**
 * Get all status options for filter dropdown
 * @returns {Array} Status options
 */
export const getStatusOptions = () => {
  return [
    { label: 'All Statuses', value: 'ALL' },
    { label: '✓ Active', value: TEACHER_STATUS.ACTIVE },
    { label: '⊘ Inactive', value: TEACHER_STATUS.INACTIVE },
    { label: '⏸ On Leave', value: TEACHER_STATUS.ON_LEAVE },
    { label: '🏛 Retired', value: TEACHER_STATUS.RETIRED }
  ];
};

/**
 * Get status color for charts/statistics
 * @param {String} status - Status value
 * @returns {String} Hex color code
 */
export const getStatusColor = (status) => {
  const colors = {
    [TEACHER_STATUS.ACTIVE]: '#27ae60',
    [TEACHER_STATUS.INACTIVE]: '#e74c3c',
    [TEACHER_STATUS.ON_LEAVE]: '#f39c12',
    [TEACHER_STATUS.RETIRED]: '#95a5a6'
  };
  return colors[status] || '#3498db';
};

/**
 * Get CSS class name for status badge
 * @param {String} status - Status value
 * @returns {String} CSS class name
 */
export const getStatusClassName = (status) => {
  const classes = {
    [TEACHER_STATUS.ACTIVE]: 'status-badge-active',
    [TEACHER_STATUS.INACTIVE]: 'status-badge-inactive',
    [TEACHER_STATUS.ON_LEAVE]: 'status-badge-on-leave',
    [TEACHER_STATUS.RETIRED]: 'status-badge-retired'
  };
  return classes[status] || 'status-badge-active';
};

/**
 * Calculate days since last activity
 * @param {Date} lastActivityDate - Last activity date
 * @returns {String} Human readable duration
 */
export const getDaysSinceLastActivity = (lastActivityDate) => {
  if (!lastActivityDate) return 'Never';
  
  const now = new Date();
  const last = new Date(lastActivityDate);
  const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};
