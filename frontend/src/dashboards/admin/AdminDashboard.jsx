import React from "react";
import Header from "./Header";
import SideBar from "./SideBar";
import AdminCards from "./AdminCards";
import Body from "./Body";
// import StudentSearch from "../../StudentSearch";
import StudentSearch from "./StudentSearch"
// import TeacherSearch from "../../TeacherSearch";
import { Routes,Route } from "react-router-dom";
import OverviewDashboard from "./OverviewDashboard";
import TeacherSearch from "./TeacherSearch";
import Attendance from "./Attendance";
import Grades from "./Grades";
import TimetableByclass from "./TimetableByClass";
import Staff from "./Staff";
import Class from "./Class";
import Subjects from "./Subjects";
import Exam from "./Exam";
import Room from "./Room";
import Department from "./Department";
import Settings from "./Settings";

function AdminDashboard (){
    return(
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            <SideBar/>
            
            <div style={{ marginLeft: '250px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header/>
                
                <div style={{ padding: '20px', flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<OverviewDashboard/>} />
                        <Route path="students" element={<StudentSearch/>} />
                        <Route path="users" element={<Staff/>} />
                        <Route path="staff" element={<Staff/>} />
                        <Route path="teachers" element={<TeacherSearch/>} />
                        <Route path="grades" element={<Grades/>} />
                        <Route path="attendance" element={<Attendance/>} />
                        <Route path="timetable" element={<TimetableByclass/>} />
                        <Route path="classes" element={<Class/>} />
                        <Route path="subjects" element={<Subjects/>} />
                        <Route path="exams" element={<Exam/>} />
                        <Route path="rooms" element={<Room/>} />
                        <Route path="departments" element={<Department/>} />
                        <Route path="settings" element={<Settings/>} />
                    </Routes>
                </div>
            </div>
        </div>
    )
}
export default AdminDashboard;