/**
 * Export utilities for TeacherSearch
 * Handles CSV, Excel, and PDF exports
 */

// CSV Export
export const exportToCSV = (teachers, filename = 'teachers.csv') => {
  if (!teachers || teachers.length === 0) {
    alert('No teachers to export');
    return;
  }

  const headers = [
    'Teacher ID',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Gender',
    'Date of Birth',
    'Nationality',
    'Qualification',
    'Specialization',
    'Department',
    'Hire Date',
  ];

  const rows = teachers.map((teacher) => [
    teacher.displayId || teacher.teacher_id || teacher.id || '',
    teacher.firstName || '',
    teacher.lastName || '',
    teacher.email || '',
    teacher.contactNumber || teacher.phone || '',
    teacher.gender || '',
    teacher.dateOfBirth || '',
    teacher.nationality || '',
    teacher.qualification || '',
    teacher.specialization || '',
    teacher.department || '',
    teacher.hireDate || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell || '');
          return cellStr.includes(',') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
        })
        .join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

// Excel Export using xlsx library
export const exportToExcel = async (teachers, filename = 'teachers.xlsx') => {
  if (!teachers || teachers.length === 0) {
    alert('No teachers to export');
    return;
  }

  try {
    const XLSX = await import('xlsx');

    const data = teachers.map((teacher) => ({
      'Teacher ID': teacher.displayId || teacher.teacher_id || teacher.id || '',
      'First Name': teacher.firstName || '',
      'Last Name': teacher.lastName || '',
      Email: teacher.email || '',
      Phone: teacher.contactNumber || teacher.phone || '',
      Gender: teacher.gender || '',
      'Date of Birth': teacher.dateOfBirth || '',
      Nationality: teacher.nationality || '',
      Qualification: teacher.qualification || '',
      Specialization: teacher.specialization || '',
      Department: teacher.department || '',
      'Hire Date': teacher.hireDate || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');

    // Auto-width columns
    const colWidths = [15, 12, 12, 20, 15, 10, 15, 12, 15, 15, 15, 15];
    worksheet['!cols'] = colWidths.map((width) => ({ wch: width }));

    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export to Excel. Make sure xlsx is installed.');
  }
};

// PDF Export using jsPDF and autoTable
export const exportToPDF = async (teachers, filename = 'teachers.pdf', filters = {}) => {
  if (!teachers || teachers.length === 0) {
    alert('No teachers to export');
    return;
  }

  try {
    const jsPDF = (await import('jspdf')).jsPDF;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title
    doc.setFontSize(16);
    doc.text('Teacher Report', pageWidth / 2, 15, { align: 'center' });

    // Metadata
    doc.setFontSize(10);
    const reportDate = new Date().toLocaleDateString();
    doc.text(`Generated: ${reportDate}`, 15, 25);

    if (Object.keys(filters).length > 0) {
      doc.text(`Filters Applied: ${JSON.stringify(filters)}`, 15, 32);
    }

    // Table data
    const tableData = teachers.map((teacher) => [
      teacher.displayId || teacher.teacher_id || teacher.id || '',
      `${teacher.firstName} ${teacher.lastName}`,
      teacher.email || '',
      teacher.specialization || '',
      teacher.department || '',
      teacher.qualification || '',
    ]);

    autoTable(doc, {
      head: [['ID', 'Name', 'Email', 'Specialization', 'Department', 'Qualification']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.internal.getPages().length;
        doc.setFontSize(9);
        doc.text(
          `Page ${doc.internal.getPageNumbers()} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      },
    });

    doc.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export to PDF. Make sure jsPDF and jspdf-autotable are installed.');
  }
};

// Generic download helper
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate reports with statistics
export const generateReport = (teachers, departments) => {
  const report = {
    totalTeachers: teachers.length,
    byDepartment: {},
    byQualification: {},
    byGender: {},
    hireDate: {
      oldest: null,
      newest: null,
    },
  };

  teachers.forEach((teacher) => {
    // By Department
    const dept = teacher.department || 'Unassigned';
    report.byDepartment[dept] = (report.byDepartment[dept] || 0) + 1;

    // By Qualification
    const qual = teacher.qualification || 'Unassigned';
    report.byQualification[qual] = (report.byQualification[qual] || 0) + 1;

    // By Gender
    const gender = teacher.gender || 'Unassigned';
    report.byGender[gender] = (report.byGender[gender] || 0) + 1;

    // Hire Date
    if (teacher.hireDate) {
      const hireDate = new Date(teacher.hireDate);
      if (!report.hireDate.oldest || hireDate < new Date(report.hireDate.oldest)) {
        report.hireDate.oldest = teacher.hireDate;
      }
      if (!report.hireDate.newest || hireDate > new Date(report.hireDate.newest)) {
        report.hireDate.newest = teacher.hireDate;
      }
    }
  });

  return report;
};
