import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./TeacherStudents.css";

const API_BASE_URL = 'http://localhost:8080/api';

function normalizeStudent(student, index) {
	// Use className (computed from schoolClass, properly synced)
	// Falls back to other fields for backward compatibility
	const className = student.className || 
	                 student.schoolClass?.name ||
	                 student.currentClass || 
	                 student.class || 
	                 student.level || 
	                 "Unassigned";

	const derivedSubject =
		student.subject ??
		(Array.isArray(student.subjects) && student.subjects.length > 0 ? student.subjects[0] : "No subject");

	return {
		id: student.id ?? index + 1,
		name: student.name ?? student.fullName ?? "Unknown Student",
		className: className,  // ← NOW PROPERLY SYNCED
		subject: derivedSubject,
		schoolClassId: student.schoolClass?.id,  // For operations via relationship
	};
}

function TeacherStudents() {
	const { user } = useAuth();
	const [students, setStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedClass, setSelectedClass] = useState("All Classes");
	const [attendance, setAttendance] = useState({});
	const [teacherClasses, setTeacherClasses] = useState([]);
	const [teacherSubjects, setTeacherSubjects] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState("");
	const [submitError, setSubmitError] = useState("");
	const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
	const [selectedTerm, setSelectedTerm] = useState(1);
	const [selectedSessionType, setSelectedSessionType] = useState("FULL_DAY");
	const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-2026");
	const [selectedSubject, setSelectedSubject] = useState("");

	// Fetch teacher's assigned classes and subjects
	useEffect(() => {
		let mounted = true;

		async function loadTeacherClassesAndSubjects() {
			if (!user?.id) {
				setLoading(false);
				return;
			}

			try {
				const token = localStorage.getItem('accessToken');
				
				// Fetch classes
				const classesUrl = `${API_BASE_URL}/teachers/${user.id}/classes`;
				console.log(`📍 Fetching teacher classes from: ${classesUrl}`);
				
				const classesResponse = await fetch(classesUrl, {
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					}
				});

				console.log(`📊 Classes Response status:`, classesResponse.status, classesResponse.statusText);

				if (classesResponse.ok) {
					const data = await classesResponse.json();
					const classes = data.assignedClasses || data.classes || data.data || [];
					console.log(`✅ Extracted classes:`, classes);
					
					if (mounted) {
						setTeacherClasses(classes);
						console.log('✔️ Teacher classes set to state:', classes);
					}
				} else {
					console.warn('❌ Failed to fetch teacher classes - Status:', classesResponse.status);
					if (mounted) {
						setTeacherClasses([]);
					}
				}

				// Fetch subjects
				const subjectsUrl = `${API_BASE_URL}/teachers/${user.id}/subjects`;
				console.log(`📍 Fetching teacher subjects from: ${subjectsUrl}`);
				
				const subjectsResponse = await fetch(subjectsUrl, {
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					}
				});

				console.log(`📊 Subjects Response status:`, subjectsResponse.status, subjectsResponse.statusText);

				if (subjectsResponse.ok) {
					const data = await subjectsResponse.json();
					const subjects = Array.isArray(data) 
						? data 
						: (data.assignedSubjects || data.subjects || data.data || []);
					console.log(`✅ Extracted subjects:`, subjects);
					
					if (mounted) {
						setTeacherSubjects(subjects);
						console.log('✔️ Teacher subjects set to state:', subjects);
					}
				} else {
					console.warn('❌ Failed to fetch teacher subjects - Status:', subjectsResponse.status);
					if (mounted) {
						setTeacherSubjects([]);
					}
				}
			} catch (err) {
				console.error('❌ Error fetching teacher classes/subjects:', err);
				if (mounted) {
					setTeacherClasses([]);
					setTeacherSubjects([]);
				}
			}
		}

		loadTeacherClassesAndSubjects();

		return () => {
			mounted = false;
		};
	}, [user]);

	// Fetch students for the teacher's classes
	useEffect(() => {
		let mounted = true;

		async function loadStudents() {
			if (teacherClasses.length === 0) {
				setLoading(false);
				return;
			}

			setLoading(true);
			setError("");

			try {
				const token = localStorage.getItem('accessToken');
				const allStudents = [];

				console.log('Starting student fetch for classes:', teacherClasses);

				// Fetch students for each assigned class
				for (const classItem of teacherClasses) {
					// Handle both class objects and class name strings
					let className = typeof classItem === 'string' ? classItem : classItem.name;
					
					// Extract just the class name/form (e.g., "S1A" -> "S1", "S1B" -> "S1")
					// Remove stream identifiers (single letter at end, like A, B, G, etc)
					const baseClassName = className.replace(/[A-Za-z]$/, '');
					
					const url = `${API_BASE_URL}/students/class/${baseClassName}`;
					console.log(`🔵 Fetching students for class: ${className} (using base: ${baseClassName})`);
					console.log(`   URL: ${url}`);
					
					const response = await fetch(url, {
						headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json',
						}
					});

					console.log(`🟠 Response for ${baseClassName}:`, {
						status: response.status,
						statusText: response.statusText,
						ok: response.ok,
						headers: {
							contentType: response.headers.get('content-type')
						}
					});

					if (response.ok) {
						const data = await response.json();
						console.log(`🟢 Full response data for ${baseClassName}:`, data);
						
						const classStudents = Array.isArray(data) 
							? data 
							: (data.students || data.data || []);
						
						console.log(`✅ Extracted students for ${baseClassName}:`, classStudents);
						allStudents.push(...classStudents);
					} else {
						const errorText = await response.text();
						console.error(`🔴 Failed to fetch students for ${baseClassName}:`, {
							status: response.status,
							statusText: response.statusText,
							errorResponse: errorText
						});
					}
				}

				console.log('All students combined:', allStudents);

				const normalized = allStudents
					.map((student, index) => normalizeStudent(student, index));

				if (mounted) {
					setStudents(normalized);
					console.log('Students normalized and set:', normalized);
					if (normalized.length === 0) {
						setError("No students found in your assigned classes");
					}
				}
			} catch (fetchError) {
				console.error('Error fetching students:', fetchError);
				if (mounted) {
					setError("Failed to load students. Please try again.");
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		loadStudents();

		return () => {
			mounted = false;
		};
	}, [teacherClasses]);

	const availableClasses = useMemo(() => {
		// Use the fetched teacher classes directly, not derived from students
		return ["All Classes", ...teacherClasses];
	}, [teacherClasses]);

	const filteredStudents = useMemo(() => {
		console.log('Filtering students - selectedClass:', selectedClass);
		console.log('All students:', students);
		console.log('Student class names:', students.map(s => s.className));
		
		if (selectedClass === "All Classes") {
			return students;
		}

		const filtered = students.filter((student) => {
			console.log(`Comparing: "${student.className}" === "${selectedClass}"`, student.className === selectedClass);
			return student.className === selectedClass;
		});
		
		console.log('Filtered result:', filtered);
		return filtered;
	}, [selectedClass, students]);

	const availableSubjects = useMemo(() => {
		// Use teacher's assigned subjects from backend
		if (teacherSubjects.length > 0) {
			// Handle both object format { name: '...', code: '...' } and string format
			return teacherSubjects.map(s => typeof s === 'string' ? s : (s.name || s.code || s.subjectName || ''));
		}
		// Fallback to deriving from students if no teacher subjects data
		return [...new Set(filteredStudents.map(s => s.subject).filter(Boolean))];
	}, [teacherSubjects, filteredStudents]);

	const handleAttendanceChange = (studentId, status) => {
		setAttendance((prev) => ({
			...prev,
			[studentId]: status
		}));
	};

	const handleResetAttendance = () => {
		setAttendance({});
		setSubmitMessage("");
		setSubmitError("");
	};

	const handleSubmitAttendance = async () => {
		// Validate subject is selected
		if (!selectedSubject) {
			setSubmitError("Please select a subject");
			return;
		}

		// Get only students with attendance recorded
		const attendanceRecords = filteredStudents
			.filter(student => attendance[student.id])
			.map(student => ({
				studentId: student.id,
				className: selectedClass !== "All Classes" ? selectedClass : teacherClasses[0],
				date: attendanceDate, // User selected date
				status: attendance[student.id].toUpperCase(),
				academicYear: selectedAcademicYear, // User selected academic year
				term: selectedTerm, // User selected term
				sessionType: selectedSessionType, // User selected session type
				subjectName: selectedSubject, // Selected subject
				subjectCode: selectedSubject, // Could be enhanced to have separate code
				remarks: ""
			}));

		if (attendanceRecords.length === 0) {
			setSubmitError("Please mark attendance for at least one student");
			return;
		}

		setSubmitting(true);
		setSubmitError("");
		setSubmitMessage("");

		try {
			const token = localStorage.getItem('accessToken');

			console.log('📤 Submitting attendance records:', attendanceRecords);

			const response = await fetch(`${API_BASE_URL}/attendance/bulk`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(attendanceRecords)
			});

			console.log('📥 Response:', response.status, response.statusText);

			if (response.ok) {
				const data = await response.json();
				console.log('✅ Attendance submitted successfully:', data);
				setSubmitMessage(`✅ Attendance recorded successfully for ${attendanceRecords.length} student(s)!`);
				setAttendance({}); // Reset after successful submission
				
				// Clear success message after 3 seconds
				setTimeout(() => {
					setSubmitMessage("");
				}, 3000);
			} else {
				const errorData = await response.json();
				const errorMsg = errorData.error || errorData.message || `Failed to submit attendance (Status: ${response.status})`;
				setSubmitError(errorMsg);
				console.error('❌ Error response:', errorData);
			}
		} catch (err) {
			console.error('❌ Error submitting attendance:', err);
			setSubmitError(`Failed to submit attendance: ${err.message}`);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="teacher-students-page">
			<div className="teacher-students-header">
				<h2>Student Attendance</h2>
				<p>View students and track attendance.</p>
			</div>

			<div className="teacher-students-filter-row">
				<label htmlFor="classFilter">Class</label>
				<select
					id="classFilter"
					value={selectedClass}
					onChange={(event) => setSelectedClass(event.target.value)}
				>
					{availableClasses.map((className) => (
						<option key={className} value={className}>
							{className}
						</option>
					))}
				</select>
			</div>

			<div className="teacher-students-filter-row">
				<label htmlFor="attendanceDate">Date</label>
				<input
					id="attendanceDate"
					type="date"
					value={attendanceDate}
					onChange={(event) => setAttendanceDate(event.target.value)}
				/>
				
				<label htmlFor="academicYear">Academic Year</label>
				<select
					id="academicYear"
					value={selectedAcademicYear}
					onChange={(event) => setSelectedAcademicYear(event.target.value)}
				>
					<option value="2024-2025">2024-2025</option>
					<option value="2025-2026">2025-2026</option>
					<option value="2026-2027">2026-2027</option>
				</select>
				
				<label htmlFor="term">Term</label>
				<select
					id="term"
					value={selectedTerm}
					onChange={(event) => setSelectedTerm(Number(event.target.value))}
				>
					<option value={1}>Term 1</option>
					<option value={2}>Term 2</option>
					<option value={3}>Term 3</option>
				</select>
				
				<label htmlFor="sessionType">Session Type</label>
				<select
					id="sessionType"
					value={selectedSessionType}
					onChange={(event) => setSelectedSessionType(event.target.value)}
				>
					<option value="FULL_DAY">Full Day</option>
					<option value="MORNING">Morning</option>
					<option value="AFTERNOON">Afternoon</option>
				</select>

				<label htmlFor="subject">Subject</label>
				<select
					id="subject"
					value={selectedSubject}
					onChange={(event) => setSelectedSubject(event.target.value)}
				>
					<option value="">Select Subject</option>
					{availableSubjects.map((subject) => (
						<option key={subject} value={subject}>
							{subject}
						</option>
					))}
				</select>
			</div>

			{submitMessage && <p className="teacher-students-success">{submitMessage}</p>}
			{submitError && <p className="teacher-students-error">{submitError}</p>}
			{error ? <p className="teacher-students-info">{error}</p> : null}

			{loading ? (
				<p className="teacher-students-info">Loading students...</p>
			) : (
				<div className="teacher-students-table-wrap">
					<table className="teacher-students-table">
						<thead>
							<tr>
								<th>Student</th>
								<th>Class</th>
								<th>Subject</th>
								<th>Attendance</th>
							</tr>
						</thead>
						<tbody>
							{filteredStudents.length > 0 ? (
								filteredStudents.map((student) => (
									<tr key={student.id}>
										<td>{student.name}</td>
										<td>{student.className}</td>
										<td>{selectedSubject || "No subject selected"}</td>
										<td>
											<div className="attendance-buttons">
												<button
													type="button"
													className={attendance[student.id] === "Present" ? "active-present" : ""}
													onClick={() => handleAttendanceChange(student.id, "Present")}
												>
													Present
												</button>
												<button
													type="button"
													className={attendance[student.id] === "Absent" ? "active-absent" : ""}
													onClick={() => handleAttendanceChange(student.id, "Absent")}
												>
													Absent
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="4" className="teacher-students-empty">
										No students found for this class.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{!loading && filteredStudents.length > 0 && (
				<div className="teacher-students-actions">
					<button 
						className="btn-submit-attendance" 
						onClick={handleSubmitAttendance}
						disabled={submitting || Object.keys(attendance).length === 0}
					>
						{submitting ? 'Submitting...' : `Submit Attendance (${Object.keys(attendance).length})`}
					</button>
					<button 
						className="btn-reset-attendance" 
						onClick={handleResetAttendance}
						disabled={Object.keys(attendance).length === 0}
					>
						Reset
					</button>
				</div>
			)}
		</section>
	);
}

export default TeacherStudents;
