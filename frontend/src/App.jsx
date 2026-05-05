import React from "react";
import StudentDashboard from "./dashboards/student/StudentDashboard";
import { Routes, Route } from "react-router-dom";
import Libriarian from "./dashboards/librarian/LibrarianDashboard";
import LoginForm from "/src/auth/Login.jsx"
import StudentRegistration from '/src/auth/StudentRegistration.jsx'
import TeacherRegistration from "/src/auth/TeacherRegistration.jsx"
import AdminDashboard from "./dashboards/admin/AdminDashboard";
import TeacherDashboard from "./dashboards/teacher/TeacherDashboard";
import ParentDashboard from "./dashboards/parent/ParentDashboard";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import VerifyEmail from "./auth/VerifyEmail";
import StudentSearch from "./dashboards/admin/StudentSearch";
import TeacherSearch from "./dashboards/admin/TeacherSearch";
import Attendance from "./dashboards/admin/Attendance";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/student/Reg" element={<StudentRegistration />} />
      <Route path="/teachers/Reg" element={<TeacherRegistration />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes - Student - COMMENTED OUT */}
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Teacher - COMMENTED OUT */}
      <Route 
        path="/teacher/*" 
        element={
          <ProtectedRoute requiredRole="TEACHER">
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Admin - COMMENTED OUT */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Librarian - COMMENTED OUT */}
      <Route 
        path="/librarian" 
        element={
          <ProtectedRoute requiredRole="LIBRARIAN">
            <Libriarian />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Admin Additional Views - COMMENTED OUT */}
      <Route 
        path="/search" 
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <StudentSearch />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teachersearch" 
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <TeacherSearch />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/attendance" 
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Attendance />
          </ProtectedRoute>
        } 
      />

      {/* Public Routes - Student Dashboard */}
      {/* <Route path="/student/*" element={<StudentDashboard />} /> */}

      {/* Public Routes - Teacher Dashboard */}
      {/* <Route path="/teacher/*" element={<TeacherDashboard />} /> */}

      {/* Public Routes - Parent Dashboard */}
      {/* <Route path="/parent/*" element={<ParentDashboard />} /> */}

      {/* Public Routes - Admin Dashboard */}
      {/* <Route path="/admin/*" element={<AdminDashboard />} /> */}

      {/* Public Routes - Librarian Dashboard */}
      {/* <Route path="/librarian" element={<Libriarian />} /> */}

      {/* Public Routes - Admin Additional Views */}
      {/* <Route path="/search" element={<StudentSearch />} /> */}
      {/* <Route path="/teachersearch" element={<TeacherSearch />} /> */}
      {/* <Route path="/attendance" element={<Attendance />} /> */}

      {/* Catch-all redirect to login */}
      <Route path="/" element={<LoginForm />} />
      <Route path="*" element={<LoginForm />} />
    </Routes>
  );
}

export default App;
