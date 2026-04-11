import React from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";
import Body from "./Body";
import Footer from "./Footer";
import Courses from "./Pages/Courses";
import Grades from "./Pages/Grades";
import Attendance from "./Pages/Attendance";
import Assignments from "./Pages/Assignments";
import Schedule from "./Pages/Schedule";
import Messages from "./Pages/Messages";
import Settings from "./Pages/Settings";

function DashboardHome() {
    return (
        <>
            <div style={{ padding: '20px' }}>
                <Body />
                <Footer />
            </div>
        </>
    );
}

function StudentDashboard() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            <SideBar />
            
            <div style={{ marginLeft: '250px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                
                <div style={{ padding: '20px', flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="courses" element={<Courses />} />
                        <Route path="grades" element={<Grades />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="assignments" element={<Assignments />} />
                        <Route path="schedule" element={<Schedule />} />
                        <Route path="messages" element={<Messages />} />
                        <Route path="settings" element={<Settings />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;