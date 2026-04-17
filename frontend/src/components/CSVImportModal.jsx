import React, { useRef, useState } from 'react';
import { parseCSV, validateTeacherRow, downloadCSVTemplate } from '../utils/csvImporter';
import '../css/CSVImportModal.css';

const DEFAULT_REQUIRED_FIELDS = [
  'First Name',
  'Last Name',
  'Email (must be valid)',
  'Contact Number',
  'Gender (MALE/FEMALE)'
];

const DEFAULT_OPTIONAL_FIELDS = [
  'Department',
  'Qualification',
  'Specialization'
];

const DEFAULT_PREVIEW_COLUMNS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'contactNumber', label: 'Phone' },
  { key: 'gender', label: 'Gender' },
  { key: 'department', label: 'Department' }
];

const CSVImportModal = ({
  isOpen,
  onClose,
  onImportComplete,
  parseFile = parseCSV,
  validateRow = validateTeacherRow,
  downloadTemplate = downloadCSVTemplate,
  modalTitle = 'Import Teachers from CSV',
  processingText = 'Importing records...',
  entityName = 'teacher',
  requiredFields = DEFAULT_REQUIRED_FIELDS,
  optionalFields = DEFAULT_OPTIONAL_FIELDS,
  previewColumns = DEFAULT_PREVIEW_COLUMNS
}) => {
  const [importStep, setImportStep] = useState('upload'); // upload, preview, processing, complete
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState(null); // success, error, warning
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Please select a CSV file');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');

    try {
      const { rows, data } = await parseFile(file);
      setParsedData(data);

      // Validate all rows
      const results = data.map((record, index) => {
        const validation = validateRow(record, index + 2); // +2 because of header row
        return {
          rowNumber: index + 2,
          data: record,
          ...validation
        };
      });

      setValidationResults(results);
      setImportStep('preview');
    } catch (error) {
      setErrorMessage(`Error parsing file: ${error.message}`);
      setSelectedFile(null);
    }
  };

  const handleTemplateDownload = () => {
    downloadTemplate();
  };

  const invalidRows = validationResults.filter(r => !r.isValid);
  const validRows = validationResults.filter(r => r.isValid);

  const handleImport = async () => {
    if (validRows.length === 0) {
      setErrorMessage('No valid records to import');
      return;
    }

    setImportStep('processing');
    setImportStatus(null);
    setErrorMessage('');
    setImportProgress(0);

    try {
      const successfulImports = [];
      const failedImports = [];

      // Simulate API calls with progress
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];

        try {
          // TODO: Replace with actual API call
          // const response = await axiosInstance.post('/api/teachers', row.data);
          // successfulImports.push(response.data);

          // For now, simulate success
          successfulImports.push(row.data);

          // Update progress
          setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
        } catch (error) {
          failedImports.push({
            row: row.data,
            error: error.message
          });
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setImportStep('complete');
      const totalFailed = failedImports.length + invalidRows.length;

      if (totalFailed === 0) {
        setImportStatus('success');
        setErrorMessage(
          `Successfully imported ${successfulImports.length} ${entityName}${successfulImports.length !== 1 ? 's' : ''}`
        );
        onImportComplete?.({
          successful: successfulImports,
          failed: failedImports,
          invalidRows
        });
      } else if (successfulImports.length > 0) {
        setImportStatus('warning');
        setErrorMessage(
          `Imported ${successfulImports.length} ${entityName}${successfulImports.length !== 1 ? 's' : ''}, but ${totalFailed} had issues`
        );
        onImportComplete?.({
          successful: successfulImports,
          failed: failedImports,
          invalidRows
        });
      } else {
        setImportStatus('error');
        setErrorMessage(`Import failed - no ${entityName}s could be added`);
      }
    } catch (error) {
      setImportStep('complete');
      setImportStatus('error');
      setErrorMessage(`Import error: ${error.message}`);
    }
  };

  const handleReset = () => {
    setImportStep('upload');
    setSelectedFile(null);
    setParsedData([]);
    setValidationResults([]);
    setImportProgress(0);
    setImportStatus(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content csv-import-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 {modalTitle}</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          {importStep === 'upload' && (
            <div className="upload-section">
              <div className="upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <div
                  className="upload-drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => {
                    e.preventDefault();
                    e.currentTarget.classList.add('drag-over');
                  }}
                  onDragLeave={e => {
                    e.currentTarget.classList.remove('drag-over');
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('drag-over');
                    const files = e.dataTransfer.files;
                    if (files?.[0]) {
                      fileInputRef.current.files = files;
                      handleFileSelect({ target: { files } });
                    }
                  }}
                >
                  <div className="upload-icon">📄</div>
                  <h3>Drag and drop your CSV file here</h3>
                  <p>or click to browse</p>
                  <p className="file-info">Accepted format: .csv (max 10MB)</p>
                </div>
              </div>

              <div className="template-section">
                <h4>Need help?</h4>
                <p>Download a template CSV file to see the correct format:</p>
                <button
                  className="btn-template"
                  onClick={handleTemplateDownload}
                >
                  📋 Download CSV Template
                </button>
              </div>

              <div className="import-requirements">
                <div className="requirements-row">
                  <div className="requirements-column">
                    <h4>Required Fields:</h4>
                    <ul>
                      {requiredFields.map((field) => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </div>
                  {optionalFields.length > 0 && (
                    <div className="requirements-column">
                      <h4>Optional Fields:</h4>
                      <ul>
                        {optionalFields.map((field) => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {importStep === 'preview' && (
            <div className="preview-section">
              <div className="preview-stats">
                <div className="stat-item success">
                  <span className="number">{validRows.length}</span>
                  <span className="label">Valid Records</span>
                </div>
                {invalidRows.length > 0 && (
                  <div className="stat-item warning">
                    <span className="number">{invalidRows.length}</span>
                    <span className="label">Invalid Records</span>
                  </div>
                )}
              </div>

              {invalidRows.length > 0 && (
                <div className="invalid-records">
                  <h4>⚠️ Invalid Records (will be skipped):</h4>
                  <div className="invalid-list">
                    {invalidRows.slice(0, 5).map(row => (
                      <div key={row.rowNumber} className="invalid-item">
                        <strong>Row {row.rowNumber}:</strong>
                        <ul>
                          {row.errors?.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {invalidRows.length > 5 && (
                      <p className="more-errors">... and {invalidRows.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}

              <div className="preview-table">
                <h4>Preview of Valid Records:</h4>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {previewColumns.map((column) => (
                          <th key={column.key}>{column.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx}>
                          {previewColumns.map((column) => (
                            <td key={column.key}>{row.data[column.key] ?? '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {validRows.length > 10 && (
                    <p className="more-records">... and {validRows.length - 10} more records</p>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className={`error-banner ${importStatus}`}>
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {importStep === 'processing' && (
            <div className="processing-section">
              <div className="progress-container">
                <div className="progress-circle">
                  <div className="progress-number">{importProgress}%</div>
                </div>
                <p>{processingText}</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
              </div>
              <p className="progress-text">
                Please wait while we process your data
              </p>
            </div>
          )}

          {importStep === 'complete' && (
            <div className="complete-section">
              <div className={`completion-icon ${importStatus}`}>
                {importStatus === 'success' && '✓'}
                {importStatus === 'warning' && '⚠'}
                {importStatus === 'error' && '✕'}
              </div>

              <h3>
                {importStatus === 'success' && 'Import Completed Successfully'}
                {importStatus === 'warning' && 'Import Completed with Warnings'}
                {importStatus === 'error' && 'Import Failed'}
              </h3>

              {errorMessage && (
                <p className={`completion-message ${importStatus}`}>
                  {errorMessage}
                </p>
              )}

              <div className="completion-details">
                <p>Total records processed: {validRows.length + invalidRows.length}</p>
                <p>Valid records imported: {validRows.length}</p>
                {invalidRows.length > 0 && (
                  <p>Invalid records skipped: {invalidRows.length}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {importStep === 'upload' && (
            <>
              <button className="btn-secondary" onClick={handleClose}>
                Cancel
              </button>
            </>
          )}

          {importStep === 'preview' && (
            <>
              <button className="btn-secondary" onClick={handleReset}>
                Choose Different File
              </button>
              <button
                className="btn-primary"
                onClick={handleImport}
                disabled={validRows.length === 0}
              >
                Import {validRows.length} Records
              </button>
            </>
          )}

          {importStep === 'processing' && (
            <button className="btn-secondary" disabled>
              Processing...
            </button>
          )}

          {importStep === 'complete' && (
            <>
              <button className="btn-secondary" onClick={handleReset}>
                Import Another File
              </button>
              <button className="btn-primary" onClick={handleClose}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
