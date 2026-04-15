import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const API_BASE_URL = 'http://localhost:8080/api';

function Courses() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_BASE_URL}/enrollments/student/${user.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch courses');

                const data = await response.json();
                console.log('📚 Courses data:', data);

                // Transform API response to component format
                const formattedCourses = (data.enrollments || data || []).map((enrollment, idx) => ({
                    id: enrollment.id || idx + 1,
                    name: enrollment.subjectName || enrollment.course || enrollment.name || "Unknown Course",
                    instructor: enrollment.teacherName || enrollment.instructor || "TBA",
                    progress: enrollment.progress || 0,
                    className: enrollment.className || "",
                    term: enrollment.term || 1,
                }));

                setCourses(formattedCourses);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching courses:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1><i className="fa-solid fa-book"></i> My Courses</h1>
                    <p>Loading your courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1><i className="fa-solid fa-book"></i> My Courses</h1>
                    <p style={{color: 'red'}}>Error loading courses: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-book"></i> My Courses</h1>
                    <p>All courses you are enrolled in</p>
                </div>
            </div>

            <div className="grid-2">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <div key={course.id} className="card" style={{ cursor: 'pointer' }}>
                            <div className="card-body">
                                <h5 className="card-title fw-bold">{course.name}</h5>
                                <p className="text-muted mb-2">
                                    <i className="fa-solid fa-chalkboard-user"></i> {course.instructor}
                                </p>
                                <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                                    <i className="fa-solid fa-layer-group"></i> {course.className || "Class TBA"} · Term {course.term}
                                </p>
                                
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <small className="text-muted">Progress</small>
                                        <small className="fw-bold text-primary">{course.progress}%</small>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div 
                                            className="progress-bar" 
                                            style={{ width: `${course.progress}%`, backgroundColor: '#2c4ebb' }}
                                        ></div>
                                    </div>
                                </div>

                                <button className="btn btn-primary btn-sm w-100">
                                    <i className="fa-solid fa-arrow-right"></i> Continue
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card">
                        <div className="card-body text-center">
                            <p className="text-muted">No courses enrolled yet</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Courses;
