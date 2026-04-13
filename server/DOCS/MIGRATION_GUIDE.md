# Backend Class Sync Migration Guide

## Overview

This guide walks you through linking existing students to their SchoolClass entities in the database. This solves the issue where students have `school_class_id = NULL` but have `current_class` string values.

## Database State Analysis

**Current Situation:**
- ✅ Classes exist: S1A, S1B, S5 (3 classes)
- ✅ Students exist: 15 students
- ❌ All students have: `school_class_id = NULL` (no links!)
- ❌ Students reference: "Senior 1", "Senior 2", "Senior 4", "S3A" (don't match class names)

## Solution Steps

### STEP 1: Run SQL Migration Script

Open MySQL terminal and run:

```bash
cd /home/wambogo/Public/Peculiar-School-Management-System
mysql -u root -p < MIGRATION_STUDENT_CLASS_SYNC.sql
```

**What this does:**
- ✅ Creates missing classes: "Senior 1", "Senior 2", "S3A", "Senior 4"
- ✅ Prepares database for linking
- ✅ Provides verification queries

**Expected output:**
```
Rows matched: 4, Changed: 4, Warnings: 0
```

### STEP 2: Verify SQL Migration Worked

```sql
-- Check new classes were created
SELECT id, name, form_level, stream FROM classes ORDER BY name;

-- Should show: S1A, S1B, S3A, S5, Senior 1, Senior 2, Senior 4
```

### STEP 3: Restart Backend Application

The backend needs to be running for the migration API endpoint to work.

```bash
# In the Java terminal, stop the current process
# Then restart:
cd /home/wambogo/Public/Peculiar-School-Management-System/server
mvn spring-boot:run
```

### STEP 4: Call Backend Migration Endpoint

Once the backend is running, trigger the student migration:

```bash
# Option A: Via curl
curl -X POST http://localhost:8080/api/students/migrate/link-to-classes

# Option B: Via browser
# Navigate to: http://localhost:8080/api/students/migrate/link-to-classes

# Option C: Via Postman
# Method: POST
# URL: http://localhost:8080/api/students/migrate/link-to-classes
```

**Expected response:**
```json
{
  "success": true,
  "message": "Student class migration completed",
  "totalStudents": 15,
  "linked": 9,
  "unmatched": 0,
  "nullClass": 6,
  "unmatchedStudents": [],
  "timestamp": "2026-04-10T16:50:00"
}
```

**What this means:**
- `linked: 9` → Students with current_class that matched a SchoolClass (e.g., "S3A" → class ID 21)
- `unmatched: 0` → No students with current_class that don't have matching classes
- `nullClass: 6` → Students who have NO current_class AND NO school_class_id (can't be auto-linked)

### STEP 5: Verify Migration Results

Check that students are now linked:

```sql
-- Check for any remaining unlinked students
SELECT 
    id,
    student_id,
    current_class,
    school_class_id
FROM students 
WHERE school_class_id IS NULL;

-- Should return fewer rows (or none) after successful migration
```

### STEP 6: Get Migration Report

Get a detailed report of linked vs unlinked students:

```bash
curl -X GET http://localhost:8080/api/students/migrate/report | json_pp
```

**Response shows:**
```json
{
  "total": 15,
  "linked": 9,
  "unlinked": 6,
  "linkedStudents": [...],
  "unlinkedStudents": [...]
}
```

## Handling Unmatched Students

If there are unlinked students after the migration, you have two options:

### Option A: Manually Link via API

```bash
# Link student 18 to class 20 (S5)
curl -X PUT http://localhost:8080/api/students/18/link-class/20
```

### Option B: Update Class Assignment via UI

Use the StudentSearch component:
1. Edit student
2. Select a class from the dropdown
3. Save

The backend will automatically link via `school_class_id`.

## For Null Class Students

Students with NO `current_class` AND NO `school_class_id` need to be assigned manually:

```bash
# Via API
curl -X PUT http://localhost:8080/api/students/24/link-class/12
# Links student 24 to class 12 (S1A)
```

Or through the UI by editing the student.

## Verification Checklist

✅ After complete migration, verify:

```sql
-- All students should have school_class_id or current_class (or both)
SELECT COUNT(*)
FROM students 
WHERE school_class_id IS NULL AND current_class IS NULL;
-- Should return 0 (or acceptable number of "unassigned" students)

-- Check sync: currentClass should match school_class.name where schoolClass is set
SELECT 
    s.student_id,
    s.current_class,
    c.name as school_class_name,
    CASE 
        WHEN s.current_class = c.name THEN 'SYNCED'
        WHEN s.current_class IS NULL THEN 'NO_CURRENT_CLASS'
        WHEN c.name IS NULL THEN 'NO_SCHOOL_CLASS'
        ELSE 'MISMATCH'
    END as status
FROM students s
LEFT JOIN classes c ON s.school_class_id = c.id
ORDER BY status;

-- All should show SYNCED or acceptable mismatches
```

## API Endpoints Added

### POST `/api/students/migrate/link-to-classes`

Automatically links all unlinked students to classes.

**Response:**
```json
{
  "success": true,
  "message": "Student class migration completed",
  "totalStudents": 15,
  "linked": 9,
  "unmatched": 0,
  "nullClass": 6,
  "unmatchedStudents": [],
  "timestamp": "2026-04-10T16:50:00"
}
```

### GET `/api/students/migrate/report`

Gets a detailed report of linked vs unlinked students.

**Response:**
```json
{
  "total": 15,
  "linked": 9,
  "unlinked": 6,
  "linkedStudents": [
    {
      "id": 2,
      "studentId": "S1202600148",
      "fullName": "Student Name",
      "currentClass": "Senior 1",
      "schoolClassId": 21,
      "schoolClassName": "Senior 1"
    }
  ],
  "unlinkedStudents": [
    {
      "id": 18,
      "studentId": "STU202600774",
      "fullName": "Another Student",
      "currentClass": null,
      "schoolClassId": null
    }
  ]
}
```

### PUT `/api/students/{studentId}/link-class/{classId}`

Manually link a specific student to a class.

**Example:**
```bash
curl -X PUT http://localhost:8080/api/students/18/link-class/20
```

**Response:**
```json
{
  "message": "Student successfully linked to class!",
  "student": {
    "id": 18,
    "studentId": "STU202600774",
    "currentClass": "S5",
    "className": "S5",
    "schoolClass": {
      "id": 20,
      "name": "S5",
      "formLevel": 5,
      "stream": "AD"
    }
  }
}
```

## Frontend Updates (Not Required, But Recommended)

The frontend already has the synced fields in API responses:
- `student.className` - Use for display (synced from schoolClass.name)
- `student.schoolClass` - Use for detailed class info
- `student.currentClass` - Legacy field, kept for backward compatibility

No frontend changes needed! The refactored backend handles all the syncing.

## Summary

**Quick checklist:**

1. ✅ Run SQL script: `mysql < MIGRATION_STUDENT_CLASS_SYNC.sql`
2. ✅ Verify: `SELECT COUNT(*) FROM classes WHERE name IN ('Senior 1', ...)`
3. ✅ Restart backend: `mvn spring-boot:run`
4. ✅ Call migration: `curl -X POST http://localhost:8080/api/students/migrate/link-to-classes`
5. ✅ Check report: `curl -X GET http://localhost:8080/api/students/migrate/report`
6. ✅ Verify DB: `SELECT COUNT(*) FROM students WHERE school_class_id IS NULL`

**Result:** All students will be properly linked to their SchoolClass entities! 🎉

## Troubleshooting

### Issue: Migration shows "unmatched" students

**Solution:** Create the classes they reference using the SQL script or Class UI

### Issue: Some students still have `school_class_id = NULL`

**Solution:** They have no `current_class` value. Assign them manually via:
- UI: Edit student → Select class
- API: `PUT /api/students/{id}/link-class/{classId}`

### Issue: `className` still shows as "Unassigned" in frontend

**Solution:** Hard refresh browser (Ctrl+Shift+R) to clear cache

### Issue: Backend won't start after changes

**Solution:**
```bash
# Clean rebuild
cd server
mvn clean install
mvn spring-boot:run
```

---

**Questions?** Check the API response messages - they include detailed error information!
