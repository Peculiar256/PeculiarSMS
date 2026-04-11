import React from "react";

function Courses() {
    const courses = [
        { id: 1, name: "Mathematics", instructor: "Mr. Smith", progress: 75 },
        { id: 2, name: "Science", instructor: "Ms. Johnson", progress: 85 },
        { id: 3, name: "English", instructor: "Mr. Brown", progress: 90 },
        { id: 4, name: "History", instructor: "Ms. Davis", progress: 70 },
        { id: 5, name: "Physics", instructor: "Mr. Wilson", progress: 80 },
        { id: 6, name: "Chemistry", instructor: "Ms. Taylor", progress: 88 },
    ];

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-book"></i> My Courses</h1>
                    <p>All courses you are enrolled in</p>
                </div>
            </div>

            <div className="grid-2">
                {courses.map((course) => (
                    <div key={course.id} className="card" style={{ cursor: 'pointer' }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">{course.name}</h5>
                            <p className="text-muted mb-3">
                                <i className="fa-solid fa-chalkboard-user"></i> {course.instructor}
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
                ))}
            </div>
        </div>
    );
}

export default Courses;
