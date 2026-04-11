import React, { useState } from "react";

function Messages() {
    const [messages, setMessages] = useState([
        { id: 1, from: "Mr. Smith", subject: "Mathematics Assignment", time: "2 hours ago", read: false, preview: "Please complete the problem set by..." },
        { id: 2, from: "Ms. Johnson", subject: "Lab Report Feedback", time: "1 day ago", read: true, preview: "Great work on your science lab report..." },
        { id: 3, from: "Mr. Brown", subject: "Essay Submission", time: "3 days ago", read: true, preview: "The essay submission deadline is..." },
        { id: 4, from: "Admin", subject: "Important Notice", time: "5 days ago", read: false, preview: "Please check the new school policies..." },
        { id: 5, from: "Ms. Davis", subject: "Project Guidelines", time: "1 week ago", read: true, preview: "Here are the guidelines for your history..." },
    ]);

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-envelope"></i> Messages</h1>
                    <p>Your messages and communications</p>
                </div>
                <button className="btn btn-primary">
                    <i className="fa-solid fa-pen"></i> New Message
                </button>
            </div>

            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '16px 24px',
                                    borderBottom: '1px solid #e2e8f0',
                                    backgroundColor: msg.read ? '#ffffff' : '#eff6ff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = msg.read ? '#f8fafc' : '#dbeafe'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = msg.read ? '#ffffff' : '#eff6ff'}
                            >
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: msg.read ? 'transparent' : '#2c4ebb',
                                    marginTop: '6px',
                                    flexShrink: 0
                                }}></div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                                        <h6 style={{ margin: 0, fontWeight: msg.read ? 500 : 600, color: '#1e293b' }}>
                                            {msg.from}
                                        </h6>
                                        <small style={{ color: '#94a3b8' }}>{msg.time}</small>
                                    </div>
                                    <p style={{ margin: '4px 0', fontWeight: 500, color: '#334155', fontSize: '14px' }}>
                                        {msg.subject}
                                    </p>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {msg.preview}
                                    </p>
                                </div>

                                <button className="btn btn-sm btn-light" style={{ marginLeft: '8px', flexShrink: 0 }}>
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Messages;
