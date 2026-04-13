# Results & Student Data Fetching Guide

## 1. STUDENT MODEL/ENTITY

**File:** [server/src/main/java/com/academix/server/model/Student.java](server/src/main/java/com/academix/server/model/Student.java)

### Student inherits from User, so it has:

**From User (inherited):**
- `id` (Long) - Primary key
- `firstName` (String, max 50)
- `lastName` (String, max 50)
- `otherNames` (String, max 100, optional)
- `email` (String, unique)
- `phoneNumber` (String)
- `nationality` (String)
- `gender` (String: MALE, FEMALE, OTHER)
- `dateOfBirth` (LocalDate)

**Student-specific fields:**
- `studentId` (String, unique) - e.g., "S12024001"
- `linn` (String) - Learner Identification Number
- `currentClass` (String) - e.g., "S.4A", "S.6"
- `stream` (String) - e.g., "Science", "Arts"
- `house` (String) - Boarding house name
- `residenceStatus` (Enum) - DAY or BOARDING
- `combination` (String) - Subject combination for higher classes

**Key Method:**
```java
public String getFullName() {
    // Returns: "firstName otherNames lastName" 
    // Example: "John Mark Doe"
}
```

---

## 2. RESULT CONTROLLER ENDPOINTS

**File:** [server/src/main/java/com/academix/server/controller/ResultController.java](server/src/main/java/com/academix/server/controller/ResultController.java)

### GET Endpoints (Query Results):

| Endpoint | Parameters | Returns | Use Case |
|----------|-----------|---------|----------|
| `GET /api/results` | None | List<Result> | Get all results |
| `GET /api/results/{id}` | id (Long) | Result | Get single result by ID |
| `GET /api/results/student/{studentId}` | studentId (Long) | List<Result> | Get all results for a student |
| `GET /api/results/student/{studentId}/exam/{examId}` | studentId, examId | List<Result> | Get student results for specific exam |
| `GET /api/results/class/{className}` | className (String) | List<Result> | Get all results for a class (e.g., "S.4A") |
| `GET /api/results/class/{className}/exam/{examId}` | className, examId | List<Result> | Get class results for specific exam |
| `GET /api/results/exam/{examId}` | examId (Long) | List<Result> | Get all results for an exam |
| `GET /api/results/report-card/student/{studentId}/exam/{examId}` | studentId, examId | Map | Get enriched report card (includes student name!) |
| `GET /api/results/distribution?examId=X&subjectCode=Y&className=Z` | Query params | Map | Grade distribution analysis |
| `GET /api/results/statistics` | None | Map | Overall result statistics |

### Key Filtering Supports:
- By **studentId** with exam filtering
- By **class name** with exam filtering
- By **exam** with optional subject filtering
- Combining class + exam for specific results

---

## 3. RESULT MODEL FIELDS

**File:** [server/src/main/java/com/academix/server/model/Result.java](server/src/main/java/com/academix/server/model/Result.java)

```java
@Entity
@Table(name = "results", indexes = {
    @Index(name = "idx_result_student", columnList = "student_id"),
    @Index(name = "idx_result_exam", columnList = "exam_id"),
    @Index(name = "idx_result_class", columnList = "class_name"),
    @Index(name = "idx_result_subject", columnList = "subject_code")
})
public class Result {
    Long id;
    Long studentId;                    // ← Reference to Student
    String studentNumber;              // Student's ID string (e.g., "S12024001")
    Long examId;                       // Reference to Exam
    String examCode;                   // Exam code for reference
    String subjectCode;                // Subject code
    String subjectName;                // Subject name
    String className;                  // Class name (e.g., "S.4A")
    String stream;                     // Stream info
    String academicYear;               // Academic year
    Integer term;                      // Term number
    Integer paper1Marks;               // Individual paper marks (if applicable)
    Integer paper2Marks;
    Integer paper3Marks;
    Integer marksObtained;             // Total marks
    Integer maxMarks;                  // Max possible marks (default 100)
    Double percentage;                 // Calculated percentage
    String grade;                      // Grade letter (A, B, C, D, F, etc.)
    Integer gradePoints;               // Grade point value
    LocalDateTime enteredAt;           // When result was entered
}
```

---

## 4. HOW TO GET STUDENT NAME FROM STUDENT_ID

### Option A: Using ResultService.getStudentReportCard() (Recommended)

This method automatically enriches results with student data:

```javascript
// Frontend API call
fetch(`/api/results/report-card/student/${studentId}/exam/${examId}`)
  .then(res => res.json())
  .then(reportCard => {
    console.log(reportCard.studentName);    // ← Get name here
    console.log(reportCard.className);      // e.g., "S.4A"
    console.log(reportCard.stream);         // e.g., "Science"
    // ... other enriched data
  });
```

**Backend code (ResultService.java, line 261):**
```java
@Transactional(readOnly = true)
public Map<String, Object> getStudentReportCard(Long studentId, Long examId) {
    Student student = studentRepository.findById(studentId)
        .orElseThrow(() -> new RuntimeException("Student not found"));
    
    List<Result> results = resultRepository.findByStudentIdAndExamId(studentId, examId);
    
    Map<String, Object> reportCard = new HashMap<>();
    reportCard.put("studentId", student.getStudentId());
    reportCard.put("studentName", student.getFullName());  // ← Full name populated
    reportCard.put("className", student.getCurrentClass());
    reportCard.put("stream", student.getStream());
    // ... includes grade distribution, aggregates, etc.
    return reportCard;
}
```

### Option B: Manual Join Query (SQL/JPQL)

If you need to add a custom query to ResultRepository:

```java
// Add to ResultRepository.java
@Query("SELECT r.studentId, r.studentNumber, r.subjectCode, r.marksObtained, " +
       "s.firstName, s.lastName, s.otherNames, s.currentClass " +
       "FROM Result r JOIN Student s ON r.studentId = s.id " +
       "WHERE r.className = :className AND r.examId = :examId " +
       "ORDER BY s.lastName, s.firstName")
List<Object[]> getResultsWithStudentNames(
    @Param("className") String className,
    @Param("examId") Long examId
);
```

### Option C: Frontend Enrichment (if doing separate calls)

```javascript
// 1. Fetch results
const results = await fetch(`/api/results/class/S.4A/exam/1`).then(r => r.json());

// 2. For each result, fetch student
const enrichedResults = await Promise.all(
  results.map(async (result) => {
    const student = await fetch(`/api/students/${result.studentId}`).then(r => r.json());
    return {
      ...result,
      studentName: `${student.firstName} ${student.lastName}`
    };
  })
);
```

---

## 5. EXISTING COMPONENTS THAT FETCH RESULTS

### StudentPerformanceReport.jsx

**File:** [frontend/src/dashboards/teacher/StudentPerformanceReport.jsx](frontend/src/dashboards/teacher/StudentPerformanceReport.jsx)

**Status:** Currently uses **mock/hardcoded data** (not connected to backend)

**Current structure:**
```javascript
const performanceData = {
    'S.4A': [
        { name: 'John Doe', mathAvg: 85, engAvg: 78, scienceAvg: 88, overallAvg: 83.7, grade: 'A' },
        { name: 'Jane Smith', mathAvg: 92, engAvg: 88, scienceAvg: 90, overallAvg: 90, grade: 'A+' },
        // ... more students
    ]
};
```

**What needs to be done:**
1. Replace hardcoded data with API call to `/api/results/class/{className}/exam/{examId}`
2. Fetch student names by joining with student data
3. Calculate averages by subject from actual results
4. Calculate overall averages

**Related component:** Used in [frontend/src/dashboards/teacher/TeacherDashboard.jsx](frontend/src/dashboards/teacher/TeacherDashboard.jsx) (line 13)

---

## 6. REPOSITORY METHODS FOR FETCHING DATA

**File:** [server/src/main/java/com/academix/server/repository/ResultRepository.java](server/src/main/java/com/academix/server/repository/ResultRepository.java)

### Basic Find Methods:
```java
List<Result> findByStudentId(Long studentId);
List<Result> findByClassName(String className);
List<Result> findByExamId(Long examId);
List<Result> findByClassNameAndExamId(String className, Long examId);
List<Result> findByStudentIdAndExamId(Long studentId, Long examId);
```

### Aggregate Query Methods:
```java
@Query("SELECT r.studentId, AVG(r.percentage) as avg FROM Result r " +
       "WHERE r.examId = :examId AND r.className = :className " +
       "GROUP BY r.studentId ORDER BY avg DESC")
List<Object[]> getTopPerformersInClass(Long examId, String className);

@Query("SELECT r.subjectCode, AVG(r.percentage), MIN(r.percentage), MAX(r.percentage), COUNT(r) " +
       "FROM Result r WHERE r.examId = :examId AND r.className = :className " +
       "GROUP BY r.subjectCode")
List<Object[]> getSubjectPerformanceAnalysis(Long examId, String className);

@Query("SELECT r.grade, COUNT(r) FROM Result r " +
       "WHERE r.examId = :examId AND r.subjectCode = :subjectCode AND r.className = :className " +
       "GROUP BY r.grade")
List<Object[]> getGradeDistribution(Long examId, String subjectCode, String className);
```

---

## 7. STUDENT REPOSITORY METHODS

**File:** [server/src/main/java/com/academix/server/repository/StudentRepository.java](server/src/main/java/com/academix/server/repository/StudentRepository.java)

### Fetching students with filtering:
```java
List<Student> findByCurrentClass(String currentClass);  // e.g., "S.4A"
List<Student> findByCurrentClassAndStream(String currentClass, String stream);
List<Student> findByCurrentClassAndIsActiveTrue(String currentClass);

@Query("SELECT s FROM Student s WHERE " +
       "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
       "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
       "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
List<Student> searchStudents(String searchTerm);

@Query("SELECT s FROM Student s WHERE " +
       "(:currentClass IS NULL OR s.currentClass = :currentClass) AND " +
       "(:stream IS NULL OR s.stream = :stream)")
List<Student> findByFilters(String currentClass, String stream, ...);
```

---

## RECOMMENDED APPROACH FOR ENRICHING RESULTS

```javascript
// Frontend - React
async function fetchClassResultsWithStudentNames(className, examId) {
  try {
    // Fetch results for class and exam
    const results = await fetch(
      `/api/results/class/${className}/exam/${examId}`
    ).then(r => r.json());

    // Enrich each result by fetching student info
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        // Option 1: Use report-card endpoint (includes more data)
        const reportCard = await fetch(
          `/api/results/report-card/student/${result.studentId}/exam/${examId}`
        ).then(r => r.json());
        
        return {
          ...result,
          studentName: reportCard.studentName,  // ← Now has student name!
          className: reportCard.className,
          stream: reportCard.stream,
        };
      })
    );

    // Group by student and calculate averages by subject
    const byStudent = {};
    for (const result of enrichedResults) {
      const key = result.studentId;
      if (!byStudent[key]) {
        byStudent[key] = {
          studentId: result.studentId,
          studentName: result.studentName,
          subjects: []
        };
      }
      byStudent[key].subjects.push({
        code: result.subjectCode,
        name: result.subjectName,
        marks: result.marksObtained,
        percentage: result.percentage,
        grade: result.grade
      });
    }

    return Object.values(byStudent);
  } catch (error) {
    console.error('Error fetching results:', error);
    return [];
  }
}
```

---

## QUICK REFERENCE: API CALLS

```bash
# Get all results for a class
curl "http://localhost:8080/api/results/class/S.4A"

# Get results for class and exam
curl "http://localhost:8080/api/results/class/S.4A/exam/1"

# Get one student's results
curl "http://localhost:8080/api/results/student/1"

# Get student's report card (INCLUDES STUDENT NAME!)
curl "http://localhost:8080/api/results/report-card/student/1/exam/1"

# Get top performers
curl "http://localhost:8080/api/results/class/S.4A/exam/1" | jq '.[] | select(.percentage > 80)'

# Get grade distribution
curl "http://localhost:8080/api/results/distribution?examId=1&subjectCode=MATH&className=S.4A"
```

---

## EXAMPLE RESPONSE STRUCTURES

### Result Object:
```json
{
  "id": 1,
  "studentId": 1,
  "studentNumber": "S12024001",
  "examId": 1,
  "subjectCode": "MATH",
  "subjectName": "Mathematics",
  "className": "S.4A",
  "stream": "Science",
  "marksObtained": 85,
  "maxMarks": 100,
  "percentage": 85.0,
  "grade": "A",
  "academicYear": "2024/2025",
  "term": 1,
  "enteredAt": "2024-04-08T10:30:00"
}
```

### Report Card Object (with student info):
```json
{
  "studentId": "S12024001",
  "studentName": "John Mark Doe",
  "className": "S.4A",
  "stream": "Science",
  "examCode": "Q2",
  "examName": "Quarter 2 Exams",
  "academicYear": "2024/2025",
  "term": 1,
  "aggregate": 18,
  "aggregateGrade": "A",
  "distinction": 3,
  "credits": 2,
  "passes": 2,
  "failures": 0
}
```
