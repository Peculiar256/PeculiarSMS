import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CSVImportModal from "../../components/CSVImportModal";
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

function escapeCsvCell(value) {
	const cell = String(value ?? "");
	return cell.includes(",") || cell.includes('"') || cell.includes("\n")
		? `"${cell.replace(/"/g, '""')}"`
		: cell;
}

function parseCsvLine(line) {
	const values = [];
	let current = "";
	let insideQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index];
		const nextCharacter = line[index + 1];

		if (character === '"') {
			if (insideQuotes && nextCharacter === '"') {
				current += '"';
				index += 1;
			} else {
				insideQuotes = !insideQuotes;
			}
		} else if (character === "," && !insideQuotes) {
			values.push(current);
			current = "";
		} else {
			current += character;
		}
	}

	values.push(current);
	return values;
}

function parseImportedStudents(csvText, fallbackClassName) {
	const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

	if (lines.length < 2) {
		throw new Error("CSV file is empty");
	}

	const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
	const students = [];

	for (let index = 1; index < lines.length; index += 1) {
		const values = parseCsvLine(lines[index]);
		if (values.length === 0) {
			continue;
		}

		const row = {};
		headers.forEach((header, headerIndex) => {
			row[header] = (values[headerIndex] || "").trim();
		});

		const name = row.name || row.fullname || row.studentname || `${row.firstname || ""} ${row.lastname || ""}`.trim();
		const className = row.classname || row.class || row.currentclass || fallbackClassName || "Unassigned";
		const subject = row.subject || row.subjectname || "Imported Student";
		const attendanceStatus = row.attendance || row.status || "";

		if (!name) {
			continue;
		}

		students.push({
			id: row.id || `IMPORTED-${Date.now()}-${index}`,
			name,
			className,
			subject,
			schoolClassId: undefined,
			attendanceStatus,
		});
	}

	return students;
}

async function writeStudentExcel(filteredStudents, attendance) {
	const XLSX = await import("xlsx");
	const worksheetData = filteredStudents.map((student) => ({
		"Student ID": student.id,
		Name: student.name,
		Class: student.className,
		Subject: student.subject,
		Attendance: attendance[student.id] || student.attendanceStatus || "Not marked",
	}));

	const worksheet = XLSX.utils.json_to_sheet(worksheetData);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
	worksheet["!cols"] = [
		{ wch: 15 },
		{ wch: 24 },
		{ wch: 18 },
		{ wch: 22 },
		{ wch: 16 },
	];
	XLSX.writeFile(workbook, `students_${new Date().toISOString().split("T")[0]}.xlsx`);
}

async function writeStudentPdf(filteredStudents, attendance) {
	const jsPDF = (await import("jspdf")).jsPDF;
	const autoTable = (await import("jspdf-autotable")).default;
	const doc = new jsPDF({ orientation: "landscape" });
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();

	doc.setFontSize(16);
	doc.text("Student Attendance Report", pageWidth / 2, 15, { align: "center" });

	doc.setFontSize(10);
	doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
	doc.text(`Total Students: ${filteredStudents.length}`, 14, 30);

	autoTable(doc, {
		head: [["Student ID", "Name", "Class", "Subject", "Attendance"]],
		body: filteredStudents.map((student) => [
			student.id,
			student.name,
			student.className,
			student.subject,
			attendance[student.id] || student.attendanceStatus || "Not marked",
		]),
		startY: 36,
		theme: "grid",
		headStyles: { fillColor: [0, 123, 255], textColor: 255, fontStyle: "bold" },
		alternateRowStyles: { fillColor: [245, 247, 250] },
		margin: { left: 14, right: 14 },
		didDrawPage: () => {
			doc.setFontSize(9);
			doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" });
		},
	});

	doc.save(`students_${new Date().toISOString().split("T")[0]}.pdf`);
}

function printStudentList(filteredStudents, attendance, selectedSubject) {
	const printWindow = window.open("", "", "height=700,width=1000");

	if (!printWindow) {
		throw new Error("Unable to open print window");
	}

	const rows = filteredStudents
		.map((student) => `
			<tr>
				<td>${student.id}</td>
				<td>${student.name}</td>
				<td>${student.className}</td>
				<td>${student.subject}</td>
				<td>${attendance[student.id] || student.attendanceStatus || "Not marked"}</td>
			</tr>
		`)
		.join("");

	printWindow.document.write(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>Student Attendance Report</title>
				<style>
					* { box-sizing: border-box; }
					body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #1f2937; }
					h1 { margin: 0 0 8px; font-size: 24px; }
					p { margin: 0 0 18px; color: #6b7280; }
					table { width: 100%; border-collapse: collapse; }
					th, td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; }
					thead { background: #007bff; color: #fff; }
					tbody tr:nth-child(even) { background: #f8fafc; }
				</style>
			</head>
			<body>
				<h1>Student Attendance Report</h1>
				<p>Subject: ${selectedSubject || "All subjects"} | Generated: ${new Date().toLocaleString()}</p>
				<table>
					<thead>
						<tr>
							<th>Student ID</th>
							<th>Name</th>
							<th>Class</th>
							<th>Subject</th>
							<th>Attendance</th>
						</tr>
					</thead>
					<tbody>${rows || "<tr><td colspan='5'>No students available</td></tr>"}</tbody>
				</table>
			</body>
		</html>
	`);
	printWindow.document.close();
	printWindow.focus();
	setTimeout(() => {
		printWindow.print();
	}, 250);
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
	const [importMessage, setImportMessage] = useState("");
	const [importError, setImportError] = useState("");
	const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);

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

	const handleExportCSV = () => {
		if (filteredStudents.length === 0) {
			setError("No students available to export");
			return;
		}

		const headers = ["Student ID", "Name", "Class", "Subject", "Attendance"];
		const rows = filteredStudents.map((student) => [
			student.id,
			student.name,
			student.className,
			student.subject,
			attendance[student.id] || student.attendanceStatus || "Not marked",
		]);
		const csvContent = [headers.join(","), ...rows.map((row) => row.map(escapeCsvCell).join(","))].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", `students_${new Date().toISOString().split("T")[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleExportExcel = async () => {
		if (filteredStudents.length === 0) {
			setError("No students available to export");
			return;
		}

		try {
			await writeStudentExcel(filteredStudents, attendance);
		} catch (exportError) {
			setError(`Failed to export Excel: ${exportError.message}`);
		}
	};

	const handleExportPDF = async () => {
		if (filteredStudents.length === 0) {
			setError("No students available to export");
			return;
		}

		try {
			await writeStudentPdf(filteredStudents, attendance);
	} catch (exportError) {
			setError(`Failed to export PDF: ${exportError.message}`);
		}
	};

	const handlePrintView = () => {
		if (filteredStudents.length === 0) {
			setError("No students available to print");
			return;
		}

		try {
			printStudentList(filteredStudents, attendance, selectedSubject);
		} catch (printError) {
			setError(`Failed to print students: ${printError.message}`);
		}
	};

	const handleImportClick = () => {
		setImportError("");
		setImportMessage("");
		setIsCSVImportOpen(true);
	};

	const parseStudentCSVFile = async (file) => {
		const csvText = await file.text();
		const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

		if (lines.length < 2) {
			throw new Error("CSV file is empty");
		}

		const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
		const data = [];

		for (let index = 1; index < lines.length; index += 1) {
			const values = parseCsvLine(lines[index]);
			const row = {};

			headers.forEach((header, headerIndex) => {
				row[header] = (values[headerIndex] || "").trim();
			});

			data.push({
				id: row.id || `IMPORTED-${Date.now()}-${index}`,
				name: row.name || row.fullname || row.studentname || `${row.firstname || ""} ${row.lastname || ""}`.trim(),
				className: row.classname || row.class || row.currentclass || (selectedClass === "All Classes" ? "Unassigned" : selectedClass),
				subject: row.subject || row.subjectname || "Imported Student",
				attendanceStatus: row.attendance || row.status || "",
				schoolClassId: undefined,
			});
		}

		return { rows: lines, data };
	};

	const validateStudentRow = (row) => {
		const errors = [];
		if (!row.name) {
			errors.push("Name is required");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	};

	const downloadStudentTemplate = () => {
		const headers = "id,name,classname,subject,attendance";
		const sample = "STU1001,Jane Doe,S2,Mathematics,Present";
		const csvContent = `${headers}\n${sample}`;
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.setAttribute("download", "student_import_template.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleStudentImportComplete = (result) => {
		const importedStudents = (result?.successful || []).map((student, index) => ({
			id: student.id || `IMPORTED-${Date.now()}-${index}`,
			name: student.name,
			className: student.className || (selectedClass === "All Classes" ? "Unassigned" : selectedClass),
			subject: student.subject || "Imported Student",
			schoolClassId: undefined,
			attendanceStatus: student.attendanceStatus || "",
		}));

		if (importedStudents.length === 0) {
			setImportError("No valid student rows were found in the CSV file");
			return;
		}

		setStudents((previousStudents) => [...previousStudents, ...importedStudents]);
		setImportMessage(`Imported ${importedStudents.length} student(s) successfully`);
		setImportError("");
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

				<div className="teacher-students-toolbar d-flex flex-wrap gap-2">
					<button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handleExportCSV}>
						<i className="fa-solid fa-file-csv"></i> CSV
					</button>
					<button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handleExportExcel}>
						<i className="fa-solid fa-file-excel"></i> Excel
					</button>
					<button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handleExportPDF}>
						<i className="fa-solid fa-file-pdf"></i> PDF
					</button>
					<button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handlePrintView}>
						<i className="fa-solid fa-print"></i> Print
					</button>
					<button type="button" className="btn btn-primary teacher-toolbar-btn" onClick={handleImportClick}>
						<i className="fa-solid fa-upload"></i> Import
					</button>
				</div>

				{importMessage && <p className="teacher-students-success">{importMessage}</p>}
				{importError && <p className="teacher-students-error">{importError}</p>}

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

			<CSVImportModal
				isOpen={isCSVImportOpen}
				onClose={() => setIsCSVImportOpen(false)}
				onImportComplete={handleStudentImportComplete}
				parseFile={parseStudentCSVFile}
				validateRow={validateStudentRow}
				downloadTemplate={downloadStudentTemplate}
				modalTitle="Import Students from CSV"
				processingText="Importing students..."
				entityName="student"
				requiredFields={["Name"]}
				optionalFields={["ID", "Class Name", "Subject", "Attendance"]}
				previewColumns={[
					{ key: "id", label: "Student ID" },
					{ key: "name", label: "Name" },
					{ key: "className", label: "Class" },
					{ key: "subject", label: "Subject" },
					{ key: "attendanceStatus", label: "Attendance" },
				]}
			/>
		</section>
	);
}

export default TeacherStudents;
