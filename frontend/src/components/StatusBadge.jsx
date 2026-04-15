import React from 'react';
import { getStatusBadgeProps } from '../utils/statusUtils';
import '../css/StatusBadge.css';

/**
 * Status Badge Component
 * Displays teacher status with color-coded badge
 */
const StatusBadge = ({ teacher, size = 'medium', showLabel = true }) => {
  const status = getStatusBadgeProps(teacher);

  return (
    <div
      className={`status-badge status-badge-${status.status.toLowerCase().replace('_', '-')} size-${size}`}
      style={{
        backgroundColor: status.backgroundColor,
        color: status.color,
        borderColor: status.color
      }}
      title={status.label}
    >
      <span className="status-icon">{status.icon}</span>
      {showLabel && <span className="status-label">{status.label}</span>}
    </div>
  );
};

export default StatusBadge;
