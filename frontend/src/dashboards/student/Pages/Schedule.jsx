import React from "react";

function Schedule() {
    const schedule = [
        { day: "Monday", time: "09:00 - 10:00", subject: "Mathematics", room: "Room 101", teacher: "Mr. Smith" },
        { day: "Monday", time: "10:15 - 11:15", subject: "English", room: "Room 205", teacher: "Mr. Brown" },
        { day: "Monday", time: "11:30 - 12:30", subject: "Science", room: "Lab 1", teacher: "Ms. Johnson" },
        { day: "Tuesday", time: "09:00 - 10:00", subject: "History", room: "Room 303", teacher: "Ms. Davis" },
        { day: "Tuesday", time: "10:15 - 11:15", subject: "Physics", room: "Lab 2", teacher: "Mr. Wilson" },
        { day: "Tuesday", time: "11:30 - 12:30", subject: "Chemistry", room: "Lab 3", teacher: "Ms. Taylor" },
        { day: "Wednesday", time: "09:00 - 10:00", subject: "Mathematics", room: "Room 101", teacher: "Mr. Smith" },
        { day: "Wednesday", time: "10:15 - 11:15", subject: "Biology", room: "Lab 1", teacher: "Mr. Green" },
        { day: "Thursday", time: "09:00 - 10:00", subject: "English", room: "Room 205", teacher: "Mr. Brown" },
        { day: "Thursday", time: "10:15 - 11:15", subject: "Physics", room: "Lab 2", teacher: "Mr. Wilson" },
        { day: "Friday", time: "09:00 - 10:00", subject: "Science", room: "Lab 1", teacher: "Ms. Johnson" },
        { day: "Friday", time: "10:15 - 11:15", subject: "Mathematics", room: "Room 101", teacher: "Mr. Smith" },
    ];

    const days = [...new Set(schedule.map(s => s.day))];

    const getSubjectColor = (subject) => {
        const colors = {
            Mathematics: '#2c4ebb',
            English: '#10b981',
            Science: '#f59e0b',
            History: '#8b5cf6',
            Physics: '#ec4899',
            Chemistry: '#06b6d4',
            Biology: '#14b8a6'
        };
        return colors[subject] || '#2c4ebb';
    };

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-calendar-days"></i> Time Schedule</h1>
                    <p>Your weekly class schedule</p>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    {days.map((day) => (
                        <div key={day} style={{ marginBottom: '32px' }}>
                            <h5 style={{ color: '#1e293b', fontWeight: 600, marginBottom: '16px' }}>
                                <i className="fa-solid fa-calendar"></i> {day}
                            </h5>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {schedule.filter(s => s.day === day).map((cls, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        gap: '16px',
                                        padding: '16px',
                                        border: `2px solid ${getSubjectColor(cls.subject)}`,
                                        borderRadius: '8px',
                                        backgroundColor: getSubjectColor(cls.subject) + '10'
                                    }}>
                                        <div style={{
                                            width: '4px',
                                            backgroundColor: getSubjectColor(cls.subject),
                                            borderRadius: '2px'
                                        }}></div>
                                        <div style={{ flex: 1 }}>
                                            <h6 style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>
                                                {cls.subject}
                                            </h6>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                                                <div>
                                                    <small><i className="fa-solid fa-clock"></i> {cls.time}</small>
                                                </div>
                                                <div>
                                                    <small><i className="fa-solid fa-door-open"></i> {cls.room}</small>
                                                </div>
                                                <div>
                                                    <small><i className="fa-solid fa-user-tie"></i> {cls.teacher}</small>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm btn-light">
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Schedule;
