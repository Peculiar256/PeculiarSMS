# Teacher Data Display Guide

Complete reference for displaying teacher information across the frontend.

## 1. TeacherCards Component (Dashboard Summary)

**Purpose**: Quick overview of teacher statistics and status

**What to Display** (Recommended):
```
┌─────────────────────────────────────────────┐
│  Teacher Name: John James Doe               │
│  ID: TCH202600958                          │
├─────────────────────────────────────────────┤
│  📚 Classes: 4 (S4A, S4B, S5, S6 PCM)      │
│  📖 Subjects: 3 (Physics, Chemistry)        │
│  🏢 Department: Science                     │
│  🎓 Specialization: Quantum Physics         │
├─────────────────────────────────────────────┤
│  👤 Experience: 12 years                    │
│  💼 Status: ACTIVE (PERMANENT)              │
│  📧 Email: teacher@school.com               │
└─────────────────────────────────────────────┘
```

**Component Structure**:
```javascript
Card 1: Summary
  - Full name (firstName + lastName)
  - Teacher ID (teacher_id)
  - Department (department.name)
  
Card 2: Subjects & Classes
  - Subject count (subjects.length)
  - Class count (assignedClasses.length)
  - Subject list with icons
  - Class list
  
Card 3: Professional
  - Specialization
  - Years of experience
  - Primary subject
  
Card 4: Employment Status
  - Employment status badge
  - Employment type
  - Is active indicator
```

## 2. Teacher Profile View (Detailed)

**Purpose**: Complete teacher information for admin editing

**Layout**:
```
HEADER SECTION
├── Profile Picture
├── Full Name + ID
├── Email + Phone
└── Status Badge

DETAILS SECTIONS
├── Personal Information
│   ├── Date of Birth
│   ├── Gender
│   ├── Nationality
│   ├── NIN (if present)
│   └── Contact Info
│
├── Professional Information
│   ├── Primary Subject
│   ├── Specialization
│   ├── Qualifications
│   ├── Years of Experience
│   ├── Registration Number
│   └── Department
│
├── Assignment Details
│   ├── Assigned Classes (List)
│   ├── Subjects Can Teach (List)
│   ├── Is Class Teacher (Boolean)
│   └── Class Responsibility
│
├── Employment Details
│   ├── Employment Type
│   ├── Employment Status
│   ├── Date Joined
│   ├── Contract End Date (if applicable)
│   ├── Is Active
│   └── Is Department Head
│
├── Bank & Salary
│   ├── Bank Name
│   ├── Account Number
│   └── Salary Grade
│
├── Emergency Contact
│   ├── Contact Name
│   ├── Contact Phone
│   └── Relationship
│
└── Location Information (if populated)
    ├── District
    ├── County
    ├── Sub County
    ├── Parish
    ├── Village
    └── Full Address
```

## 3. Teacher List/Table View

**Purpose**: Quick scan of all teachers

**Columns**:
```
ID | Name | Department | Photo | Status | Email | Classes | Experience
```

**Data Mapping**:
- ID: teacher_id (display)
- Name: `${firstName} ${lastName}`
- Department: department.name
- Photo: User profile picture (if exists)
- Status: employmentStatus (with color badge)
- Email: email (clickable)
- Classes: assignedClasses.length
- Experience: yearsOfExperience

## 4. Assignment/Classes Section

**Purpose**: Show teacher's current assignments and responsibilities

**Display**:
```javascript
CLASS ASSIGNMENTS
├── Is Class Teacher: isClassTeacher (Boolean)
├── Class Responsibility: classResponsibility (String)
├── All Assigned Classes:
│   ├── S4A
│   ├── S4B
│   ├── S5
│   └── S6 PCM
└── Subjects Teaches:
    ├── Physics
    ├── Chemistry
    └── Biology
```

## 5. Employment Status Card

**Purpose**: Show employment type and status

**Display Strategy**:
```javascript
Status Badge:
  - Color code by status
    - ACTIVE → Green
    - ON_LEAVE → Yellow
    - SUSPENDED → Red
    - TERMINATED → Dark Red
    - RETIRED → Gray
    - RESIGNED → Gray
    
Type Badge:
  - PERMANENT → Solid badge
  - CONTRACT → Outline badge
  - PART_TIME → Dashed badge
  - INTERN → Light badge
  - VOLUNTEER → Gray badge

Dates:
  - Date Joined: dateJoined (format: Jan 15, 2015)
  - Contract End: contractEndDate (if PERMANENT show N/A, if CONTRACT show date)
```

## 6. Years of Experience Display

**Format Options**:
```javascript
// Option 1: Simple number
"12 years"

// Option 2: With level/badge
"12 years • Senior Teacher"

// Option 3: With range
"10-15 years"

// Default for null/0
"No experience recorded"
```

## 7. Department Display Strategy

**Important**: Department is a NESTED OBJECT

**Correct Extraction**:
```javascript
// ✅ CORRECT
const deptName = teacher?.department?.name  // "Science"

// ❌ WRONG
const deptName = teacher?.department       // Returns object {id, name}
```

**Fallback Sequence**:
```javascript
const department = 
  teacher?.department?.name ||           // Primary (nested object)
  teacher?.departmentName ||             // Flat field
  teacher?.department ||                 // Raw object (if exists)
  'Unassigned'                          // Default
```

**Display**:
```
Department: Science (with link to department details)

If null: "Not Assigned" or "Unassigned" (gray text)
```

## 8. Component Code Examples

### Correct Way to Extract All Fields

```javascript
const teacherDisplay = {
  // Identity
  id: teacher?.id,
  teacherId: teacher?.teacher_id || teacher?.teacherId,
  
  // Names
  firstName: teacher?.firstName || '',
  lastName: teacher?.lastName || '',
  otherNames: teacher?.otherNames || '',
  fullName: teacher?.fullName || 
    `${teacher?.firstName} ${teacher?.lastName}`.trim(),
  
  // Contact
  email: teacher?.email,
  phoneNumber: teacher?.phoneNumber,
  
  // Professional
  primarySubject: teacher?.primarySubject,
  specialization: teacher?.specialization,
  qualifications: teacher?.qualifications,
  yearsOfExperience: teacher?.yearsOfExperience || 0,
  
  // Department (NESTED!)
  department: teacher?.department?.name || 
    teacher?.departmentName || 'Unassigned',
  
  // Classes & Subjects
  assignedClasses: teacher?.assignedClasses || [],
  subjects: teacher?.subjects || [],
  classCount: teacher?.assignedClasses?.length || 0,
  subjectCount: teacher?.subjects?.length || 0,
  
  // Role & Status
  isClassTeacher: teacher?.isClassTeacher || false,
  classResponsibility: teacher?.classResponsibility,
  isDepartmentHead: teacher?.isDepartmentHead || false,
  employmentType: teacher?.employmentType || 'Unknown',
  employmentStatus: teacher?.employmentStatus || 'Unknown',
  isActive: teacher?.isActive || false,
  
  // Employment Dates
  dateJoined: teacher?.dateJoined,
  contractEndDate: teacher?.contractEndDate,
  
  // Bank Info
  bankName: teacher?.bankName,
  bankAccountNumber: teacher?.bankAccountNumber,
  salaryGrade: teacher?.salaryGrade,
  
  // Emergency
  emergencyContactName: teacher?.emergencyContactName,
  emergencyContactPhone: teacher?.emergencyContactPhone,
  emergencyContactRelationship: teacher?.emergencyContactRelationship,
  
  // Location
  district: teacher?.district,
  county: teacher?.county,
  subCounty: teacher?.subCounty,
  parish: teacher?.parish,
  village: teacher?.village,
  fullAddress: teacher?.fullAddress,
  
  // Audit
  isEmailVerified: teacher?.emailVerified || false,
  createdAt: teacher?.createdAt,
  updatedAt: teacher?.updatedAt
}
```

## 9. Status Display Helper

```javascript
// Status badge colors
const statusColors = {
  'ACTIVE': '#10b981',      // Green
  'ON_LEAVE': '#f59e0b',    // Amber
  'SUSPENDED': '#ef4444',   // Red
  'TERMINATED': '#991b1b',  // Dark Red
  'RETIRED': '#6b7280',     // Gray
  'RESIGNED': '#6b7280'     // Gray
}

// Employment type labels
const employmentTypeLabels = {
  'PERMANENT': 'Permanent Staff',
  'CONTRACT': 'Contract',
  'PART_TIME': 'Part-Time',
  'INTERN': 'Intern',
  'VOLUNTEER': 'Volunteer'
}

// Helper function
const getStatusBadge = (status) => ({
  label: status,
  color: statusColors[status] || '#gray',
  icon: status === 'ACTIVE' ? '✓' : '⚠️'
})
```

## 10. What NOT to Display

- `subjectAssignments` - This is @JsonIgnore (circular reference)
- `classesAsTeacher` - This is @JsonIgnore (circular reference)
- Database internal relationships (lazy-loaded)
- Password fields (write-only)

## 11. Recommended Display Order (Priority)

### Tier 1 (Essential - Always Show)
- Name (firstName + lastName)
- Teacher ID (teacher_id)
- Email
- Department
- Employment Status

### Tier 2 (Important - Show if available)
- Assigned Classes & Subjects
- Years of Experience
- Specialization
- Phone Number

### Tier 3 (Useful - Show in details/hover)
- Qualifications
- Bank details
- Emergency contact
- Location info

### Tier 4 (Administrative - Show only in admin panel)
- Registration Number
- Is Department Head
- Employment Type
- Contract dates
- Is Class Teacher / Class Responsibility
