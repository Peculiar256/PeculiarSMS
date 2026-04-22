import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import '../css/Reports.css';
import parentService from '../../../services/parentService';

function Reports() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadReports();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    const data = await parentService.getMyChildren();
    if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0]);
    }
    setLoading(false);
  };

  const loadReports = async () => {
    if (!selectedChild) return;
    const data = await parentService.getPerformanceReport(selectedChild.id);
    if (data) {
      setReports(Array.isArray(data) ? data : [data]);
    }
  };

  const handleDownloadReport = (report) => {
    console.log('Downloading report:', report);
    // Implement actual download functionality
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Academic Reports</h1>
        <p>Download and view detailed academic reports</p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="child-selector-bar">
          <label>Select Child:</label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => c.id === parseInt(e.target.value));
              setSelectedChild(child);
            }}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {children.length === 0 && (
        <div className="no-data-container">
          <p>No children found. Please link your children to your account.</p>
        </div>
      )}

      {/* Reports List */}
      <div className="reports-grid">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className={`report-card ${selectedReport?.id === report.id ? 'active' : ''}`}
              onClick={() => setSelectedReport(report)}
            >
              <div className="report-icon">
                <FileText size={32} />
              </div>
              <h3>{report.title || report.reportType}</h3>
              <p className="report-period">{report.period}</p>
              <div className="report-meta">
                <span className="report-date">
                  <Calendar size={14} />
                  {new Date(report.generatedDate).toLocaleDateString()}
                </span>
              </div>
              <button className="download-btn" onClick={(e) => {
                e.stopPropagation();
                handleDownloadReport(report);
              }}>
                <Download size={16} />
                Download
              </button>
            </div>
          ))
        ) : (
          <div className="no-reports">
            <FileText size={48} />
            <p>No reports available</p>
          </div>
        )}
      </div>

      {/* Report Details */}
      {selectedReport && (
        <div className="report-details">
          <h2>{selectedReport.title || selectedReport.reportType}</h2>
          
          <div className="report-info">
            <div className="info-section">
              <h3>Report Summary</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Period:</span>
                  <span className="value">{selectedReport.period}</span>
                </div>
                <div className="info-item">
                  <span className="label">Generated:</span>
                  <span className="value">{new Date(selectedReport.generatedDate).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Class:</span>
                  <span className="value">{selectedReport.className || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Overall Grade:</span>
                  <span className="value">{selectedReport.overallGrade || 'N/A'}</span>
                </div>
              </div>
            </div>

            {selectedReport.summary && (
              <div className="info-section">
                <h3>Comments</h3>
                <p className="summary-text">{selectedReport.summary}</p>
              </div>
            )}

            {selectedReport.details && (
              <div className="info-section">
                <h3>Detailed Performance</h3>
                <div className="details-grid">
                  {Object.entries(selectedReport.details).map(([key, value]) => (
                    <div key={key} className="detail-item">
                      <span className="label">{key}:</span>
                      <span className="value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport.recommendations && (
              <div className="info-section">
                <h3>Recommendations</h3>
                <ul className="recommendations">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button className="download-full-btn" onClick={() => handleDownloadReport(selectedReport)}>
            <Download size={18} />
            Download Full Report
          </button>
        </div>
      )}

      {/* Report Types */}
      <div className="report-types">
        <h2>Available Report Types</h2>
        <div className="types-grid">
          <div className="type-card">
            <TrendingUp size={24} />
            <h3>Progress Report</h3>
            <p>Track overall academic progress</p>
          </div>
          <div className="type-card">
            <FileText size={24} />
            <h3>Performance Summary</h3>
            <p>Detailed subject-wise analysis</p>
          </div>
          <div className="type-card">
            <Calendar size={24} />
            <h3>Attendance Report</h3>
            <p>Attendance and punctuality records</p>
          </div>
          <div className="type-card">
            <TrendingUp size={24} />
            <h3>Conduct Report</h3>
            <p>Behavior and conduct assessment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
