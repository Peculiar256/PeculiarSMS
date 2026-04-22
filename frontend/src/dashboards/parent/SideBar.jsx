import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import profilePic from '../../assets/bd.jpeg';
import {
  Home,
  BarChart3,
  BookOpen,
  CheckCircle,
  MessageSquare,
  Briefcase,
  FileText,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import './SideBar.css';
import { useAuth } from '../../context/AuthContext';

function SideBar() {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/parent' },
    { label: 'My Children', icon: BookOpen, path: '/parent/children' },
    { label: 'Academic Performance', icon: BarChart3, path: '/parent/performance' },
    { label: 'Grades & Results', icon: CheckCircle, path: '/parent/grades' },
    { label: 'Attendance', icon: AlertCircle, path: '/parent/attendance' },
    { label: 'Assignments', icon: Briefcase, path: '/parent/assignments' },
    { label: 'Messages', icon: MessageSquare, path: '/parent/messages' },
    { label: 'Fee & Payments', icon: Briefcase, path: '/parent/fees' },
    { label: 'Reports', icon: FileText, path: '/parent/reports' },
  ];

  return (
    <div className="parent-sidebar">
      {/* Profile Section */}
      <div className="sidebar-profile">
        <div className="profile-img-container">
          <img src={profilePic} alt="Parent" />
        </div>
        <h3>{user?.firstName || user?.fullName || 'Parent User'}</h3>
        <span className="role-badge">{user?.role || 'Parent'}</span>
        <p className="user-email">{user?.email || 'parent@school.com'}</p>
      </div>

      <hr className="sidebar-divider" />

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="#help">Help & Support</a>
            </li>
            <li>
              <a href="#settings">Settings</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
