import React from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";
import Body from "./Body";

// Pages
import Grades from "./Pages/Grades";
import Attendance from "./Pages/Attendance";
import Assignments from "./Pages/Assignments";
import Messages from "./Pages/Messages";
import Fees from "./Pages/Fees";
import Children from "./Pages/Children";
import Performance from "./Pages/Performance";
import Reports from "./Pages/Reports";

function DashboardHome() {
  return (
    <>
      <div style={{ padding: '20px' }}>
        <Body />
      </div>
    </>
  );
}

function ParentDashboard() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <SideBar />
      
      <div style={{ marginLeft: '250px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        
        <div style={{ padding: '20px', flex: 1 }}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="children" element={<Children />} />
            <Route path="performance" element={<Performance />} />
            <Route path="grades" element={<Grades />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="messages" element={<Messages />} />
            <Route path="fees" element={<Fees />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
