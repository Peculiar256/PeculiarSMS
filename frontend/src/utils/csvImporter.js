/**
 * CSV Import utility for bulk teacher uploads
 */

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        // Handle both CRLF (\r\n) and LF (\n) line endings safely
        const lines = csv.split(/\r?\n/);
        
        if (lines.length < 2) {
          reject('CSV file is empty');
          return;
        }

        // Parse header and normalize to lowercase for easy lookup
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredFields = [
          'firstname', 
          'lastname', 
          'email', 
          'contactnumber', 
          'gender', 
          'qualification', 
          'specialization', 
          'department'
        ];
        
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        if (missingFields.length > 0) {
          reject(`Missing required columns: ${missingFields.join(', ')}`);
          return;
        }

        // Parse rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip trailing empty lines safely

          const values = parseCSVLine(line);
          if (values.length < headers.length) {
            reject(`Row ${i + 1} has fewer columns than header`);
            return;
          }

          const row = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx]?.trim() || '';
          });

          // Map clean normalized keys directly to API field configurations
          const teacher = {
            firstName: row.firstname,
            lastName: row.lastname,
            email: row.email,
            contactNumber: row.contactnumber,
            dateOfBirth: row.dateofbirth || '',
            gender: row.gender,
            nationality: row.nationality || '',
            qualification: row.qualification,
            specialization: row.specialization,
            department: row.department,
            hireDate: row.hiredate || new Date().toISOString().split('T')[0],
          };

          data.push(teacher);
        }

        resolve({
          rows: data.length,
          data: data
        });
      } catch (error) {
        reject(`Error parsing CSV: ${error.message}`);
      }
    };

    reader.onerror = () => reject('Error reading file');
    reader.readAsText(file);
  });
};

// Helper to parse CSV line handling quoted values smoothly
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next escaped double quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

// Validate teacher data row constraints
export const validateTeacherRow = (teacher, rowNumber) => {
  const errors = [];

  if (!teacher.firstName?.trim()) errors.push('First Name is required');
  if (!teacher.lastName?.trim()) errors.push('Last Name is required');
  
  if (!teacher.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(teacher.email)) {
    errors.push('Invalid email format');
  }

  if (!teacher.contactNumber?.trim()) errors.push('Contact Number is required');
  if (!teacher.gender?.trim()) errors.push('Gender is required');
  if (!teacher.qualification?.trim()) errors.push('Qualification is required');
  if (!teacher.specialization?.trim()) errors.push('Specialization is required');
  if (!teacher.department?.trim()) errors.push('Department is required');

  return {
    isValid: errors.length === 0,
    errors,
    rowNumber,
  };
};

// Email validation regular expression handler
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fixed to explicitly export matching headers to comply with lowercase rules
export const generateCSVTemplate = () => {
  const headers = [
    'firstname',
    'lastname',
    'email',
    'contactnumber',
    'dateofbirth',
    'gender',
    'nationality',
    'qualification',
    'specialization',
    'department',
    'hiredate',
  ];

  const sampleData = [
    'John,Doe,john.doe@school.com,+256700123456,1990-01-15,MALE,Ugandan,Masters,Mathematics,Science,2024-01-10',
    'Jane,Smith,jane.smith@school.com,+256700123457,1992-03-20,FEMALE,Ugandan,Bachelors,Physics,Science,2024-02-15',
  ];

  return [headers.join(','), ...sampleData].join('\n');
};

// Download template clean trigger
export const downloadCSVTemplate = () => {
  const csv = generateCSVTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'teacher_import_template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};