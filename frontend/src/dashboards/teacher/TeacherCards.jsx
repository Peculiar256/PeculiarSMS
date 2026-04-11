import React, { useState, useEffect } from "react";
import './TeacherCards.css';
import { useAuth } from '../../context/AuthContext';
import teacherService from '../../services/teacherService';

function TeacherCards() {
    const { user } = useAuth();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.id) {
            setError('No user ID available');
            setLoading(false);
            return;
        }
        
        const fetchTeacherData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await teacherService.getTeacherById(user.id);
                console.log('Full API response:', response); // Debug: full response
                console.log('Teacher data fetched:', response.data); // Debug: response data
                
                // Handle different response structures
                const teacherData = response.data?.teacher || response.data;
                console.log('Processed teacher data:', teacherData); // Debug: processed data
                console.log('Assigned classes:', teacherData?.assignedClasses); // Debug: classes
                console.log('Subjects:', teacherData?.subjects); // Debug: subjects
                console.log('Employment status field:', teacherData?.employmentStatus); // Debug: status field
                
                setTeacher(teacherData);
            } catch (err) {
                console.error('Error fetching teacher data:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load teacher data';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, [user]);

    if (loading) {
        return <div className="teacher-container"><p style={{ textAlign: 'center', padding: '20px' }}>Loading teacher data...</p></div>;
    }

    if (error) {
        return <div className="teacher-container"><p style={{ color: '#d97706', padding: '20px', background: '#fef3c7' }}>Error: {error}</p></div>;
    }

    if (!teacher) {
        return <div className="teacher-container"><p style={{ color: '#d97706', padding: '20px', background: '#fef3c7' }}>No teacher data available</p></div>;
    }

    const department = teacher?.department?.name || teacher?.departmentName || teacher?.department || 'Unassigned';
    const status = teacher?.employmentStatus ? String(teacher.employmentStatus).toUpperCase() : (teacher?.isActive ? 'ACTIVE' : 'INACTIVE');
    const fullName = teacher?.fullName || `${teacher?.firstName || ''} ${teacher?.lastName || ''}`.trim() || 'Teacher';
    const totalClasses = Array.isArray(teacher?.assignedClasses) ? teacher.assignedClasses.length : 0;
    const totalSubjects = Array.isArray(teacher?.subjects) ? teacher.subjects.length : 0;
    const experience = teacher?.yearsOfExperience || 0;
    const specialization = teacher?.specialization || 'Not specified';
    
    // Debug logs for all fields
    console.log('=== TEACHER DATA DEBUG ===');
    console.log('Full teacher object:', teacher);
    console.log('Department object:', teacher?.department);
    console.log('Department name (nested):', teacher?.department?.name);
    console.log('Department name (direct):', teacher?.departmentName);
    console.log('Final department value:', department);
    console.log('Assigned classes:', teacher?.assignedClasses, 'Count:', totalClasses);
    console.log('Subjects:', teacher?.subjects, 'Count:', totalSubjects);
    console.log('Employment status:', teacher?.employmentStatus);
    console.log('Final status:', status);
    console.log('Specialization:', specialization);
    console.log('Experience:', experience);
    console.log('========================');

    return(
        <div className="teacher-container">
            <div className="teacher-header-section">
                <h1 className="teacher-dashboard-title">Dashboard</h1>
                <h2 className="teacher-dashboard-subtitle">Welcome back, {fullName}! Here's your overview.</h2>
            </div>

            <div className="teacher-cards-grid">
                {/* Classes Card */}
                <div className="teacher-overview teacher-card-primary"> 
                    <div className="card-header-flex">
                        <div>
                            <h1>My Classes</h1>
                            <p className="card-description">Assigned classes</p>
                        </div>
                        <i className="fa-solid fa-calendar card-icon"></i>
                    </div>
                    <p className="card-value">{totalClasses}</p>
                </div>

                {/* Subjects Card */}
                <div className="teacher-overview teacher-card-success"> 
                    <div className="card-header-flex">
                        <div>
                            <h1>Subjects</h1>
                            <p className="card-description">Teaching specialization</p>
                        </div>
                        <i className="fa-solid fa-book card-icon"></i>
                    </div>
                    <p className="card-value">{totalSubjects}</p>
                    {teacher?.subjects?.length > 0 && (
                        <div className="subjects-list">
                            {teacher.subjects.slice(0, 3).map((subject, idx) => (
                                <span key={idx} className="subject-badge">{subject}</span>
                            ))}
                            {totalSubjects > 3 && <span className="subject-badge">+{totalSubjects - 3}</span>}
                        </div>
                    )}
                </div>

                {/* Experience Card */}
                <div className="teacher-overview teacher-card-info"> 
                    <div className="card-header-flex">
                        <div>
                            <h1>Experience</h1>
                            <p className="card-description">Years of service</p>
                        </div>
                        <i className="fa-solid fa-star card-icon"></i>
                    </div>
                    <p className="card-value">{experience}</p>
                    <small className="experience-text">years</small>
                </div>

                {/* Specialization Card */}
                <div className="teacher-overview teacher-card-warning"> 
                    <div className="card-header-flex">
                        <div>
                            <h1>Specialization</h1>
                            <p className="card-description">Primary expertise</p>
                        </div>
                        <i className="fa-solid fa-graduation-cap card-icon"></i>
                    </div>
                    <p className="card-value-text">{specialization}</p>
                </div>

                {/* Department Card */}
                <div className="teacher-overview teacher-card-secondary"> 
                    <div className="card-header-flex">
                        <div>
                            <h1>Department</h1>
                            <p className="card-description">Faculty</p>
                        </div>
                        <i className="fa-solid fa-building card-icon"></i>
                    </div>
                    <p className="card-value-text">{department}</p>
                </div>

                {/* Status Card */}
                <div className="teacher-overview teacher-card-danger"> 
                    <div className="card-header-flex">
                        <div>
                            <h1>Status</h1>
                            <p className="card-description">Employment status</p>
                        </div>
                        <i className="fa-solid fa-user-check card-icon"></i>
                    </div>
                    <p className="card-value-status">{status}</p>
                </div>
            </div>

            {/* Qualifications Section */}
            {teacher?.qualifications && (
                <div className="qualifications-section">
                    <h3>Qualifications</h3>
                    <p>{teacher.qualifications}</p>
                </div>
            )}
        </div>
    )
}
export default TeacherCards;