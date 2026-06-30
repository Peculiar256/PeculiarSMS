/**
 * Print view utility for professional teacher reports
 */

export const printTeacherList = (teachers, filters = {}) => {
  const printWindow = window.open('', '', 'height=600,width=800');
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Teacher Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          .container { max-width: 100%; padding: 20px; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          
          .header p {
            color: #7f8c8d;
            font-size: 14px;
          }
          
          .metadata {
            background: #ecf0f1;
            padding: 10px 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
          }
          
          .metadata-item {
            display: flex;
            gap: 5px;
          }
          
          .metadata-label {
            font-weight: bold;
            color: #2c3e50;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          thead {
            background: #007bff;
            color: white;
            font-weight: bold;
          }
          
          th {
            padding: 12px;
            text-align: left;
            border: 1px solid #bdc3c7;
            font-size: 13px;
          }
          
          td {
            padding: 10px 12px;
            border: 1px solid #bdc3c7;
            font-size: 12px;
          }
          
          tbody tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          tbody tr:hover {
            background: #ecf0f1;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            color: white;
          }
          
          .badge-active { background-color: #27ae60; }
          .badge-inactive { background-color: #e74c3c; }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #bdc3c7;
            text-align: center;
            font-size: 11px;
            color: #95a5a6;
          }
          
          .summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
          }
          
          .summary-item {
            text-align: center;
          }
          
          .summary-item .number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
          }
          
          .summary-item .label {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 5px;
          }
          
          @media print {
            body { margin: 0; padding: 0; }
            .container { padding: 10px; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Teacher Report</h1>
            <p>Peculiar School Management System</p>
          </div>
          
          <div class="metadata">
            <div class="metadata-item">
              <span class="metadata-label">Generated:</span>
              <span>${new Date().toLocaleString()}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Total Teachers:</span>
              <span>${teachers.length}</span>
            </div>
            ${Object.keys(filters).length > 0 ? `
            <div class="metadata-item">
              <span class="metadata-label">Filters Applied:</span>
              <span>${JSON.stringify(filters).substring(0, 50)}...</span>
            </div>
            ` : ''}
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="number">${teachers.length}</div>
              <div class="label">Total Teachers</div>
            </div>
            <div class="summary-item">
              <div class="number">${getTopDepartment(teachers)}</div>
              <div class="label">Top Department</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Qualification</th>
                <th>Hire Date</th>
              </tr>
            </thead>
            <tbody>
              ${teachers.map(teacher => `
                <tr>
                  <td>${teacher.firstName} ${teacher.lastName}</td>
                  <td>${teacher.email || '-'}</td>
                  <td>${teacher.contactNumber || teacher.phone || '-'}</td>
                  <td>${teacher.specialization || '-'}</td>
                  <td>${teacher.department || '-'}</td>
                  <td>${teacher.qualification || '-'}</td>
                  <td>${teacher.hireDate ? new Date(teacher.hireDate).toLocaleDateString() : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is an automatically generated report. Print date: ${new Date().toLocaleString()}</p>
            <p>© 2026 Peculiar School Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Trigger print dialog after content loads
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

export const printStaffList = (staff, filters = {}) => {
  const printWindow = window.open('', '', 'height=600,width=800');
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Staff Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          .container { max-width: 100%; padding: 20px; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          
          .header p {
            color: #7f8c8d;
            font-size: 14px;
          }
          
          .metadata {
            background: #ecf0f1;
            padding: 10px 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
          }
          
          .metadata-item {
            display: flex;
            gap: 5px;
          }
          
          .metadata-label {
            font-weight: bold;
            color: #2c3e50;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          thead {
            background: #007bff;
            color: white;
            font-weight: bold;
          }
          
          th {
            padding: 12px;
            text-align: left;
            border: 1px solid #bdc3c7;
            font-size: 13px;
          }
          
          td {
            padding: 10px 12px;
            border: 1px solid #bdc3c7;
            font-size: 12px;
          }
          
          tbody tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          tbody tr:hover {
            background: #ecf0f1;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            color: white;
          }
          
          .badge-active { background-color: #27ae60; }
          .badge-inactive { background-color: #e74c3c; }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #bdc3c7;
            text-align: center;
            font-size: 11px;
            color: #95a5a6;
          }
          
          .summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
          }
          
          .summary-item {
            text-align: center;
          }
          
          .summary-item .number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
          }
          
          .summary-item .label {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 5px;
          }
          
          @media print {
            body { margin: 0; padding: 0; }
            .container { padding: 10px; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Staff Report</h1>
            <p>Peculiar School Management System</p>
          </div>
          
          <div class="metadata">
            <div class="metadata-item">
              <span class="metadata-label">Generated:</span>
              <span>${new Date().toLocaleString()}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Total Staff:</span>
              <span>${staff.length}</span>
            </div>
            ${Object.keys(filters).length > 0 ? `
            <div class="metadata-item">
              <span class="metadata-label">Filters Applied:</span>
              <span>${JSON.stringify(filters).substring(0, 50)}...</span>
            </div>
            ` : ''}
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="number">${staff.length}</div>
              <div class="label">Total Staff</div>
            </div>
            <div class="summary-item">
              <div class="number">${countByStatus(staff, 'ACTIVE')}</div>
              <div class="label">Active Staff</div>
            </div>
            <div class="summary-item">
              <div class="number">${countByStatus(staff, 'INACTIVE')}</div>
              <div class="label">Inactive Staff</div>
            </div>
            <div class="summary-item">
              <div class="number">${getTopDepartment(staff)}</div>
              <div class="label">Top Department</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Position</th>
                <th>Contract</th>
              </tr>
            </thead>
            <tbody>
              ${staff.map(s => `
                <tr>
                  <td>${s.staffId || '-'}</td>
                  <td>${s.firstName} ${s.lastName}</td>
                  <td>${s.email || '-'}</td>
                  <td>${s.phoneNumber || '-'}</td>
                  <td>${s.department || '-'}</td>
                  <td>${s.position || '-'}</td>
                  <td>${s.contractType || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is an automatically generated report. Print date: ${new Date().toLocaleString()}</p>
            <p>© 2026 Peculiar School Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

const countByStatus = (staff, status) => {
  return staff.filter(s => (s.status || '').toUpperCase() === status).length;
};

const getTopDepartment = (staff) => {
  if (staff.length === 0) return 'N/A';
  const departments = {};
  staff.forEach(s => {
    const dept = s.department || 'Unassigned';
    departments[dept] = (departments[dept] || 0) + 1;
  });
  const top = Object.entries(departments).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : 'N/A';
};
