import React from "react";
import profilePic from '/src/assets/bd.jpeg'
import './Header.css'
import kyuLogo from '/src/assets/PS.png'
import { useLogout } from '../../hooks/useLogout';
import { useAuth } from '../../context/AuthContext';
import { Link } from "react-router-dom";

function Header() {
    const handleLogout = useLogout();
    const { user } = useAuth();
    return (
        <header className="navbar navbar-expand bg-white sticky-top shadow-sm p-3">
            <div className="container-fluid">
                {/* Brand / Logo */}
                <a className="navbar-brand d-flex align-items-center fw-bold text-success" href="#">
                    <img src={kyuLogo} alt="" width={50} height={50}/>
                    <span>Peculiar Secondary School</span>
                </a>

                <div className="navbar-collapse" id="navbarSupportedContent">
                    {/* Search Bar (Center) */}
                    <div className="mx-auto my-0 w-100" style={{ maxWidth: '500px' }}>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                                <i className="fa-solid fa-search text-muted"></i>
                            </span>
                            <input 
                                className="form-control bg-light border-start-0 rounded-end-pill py-2 shadow-none" 
                                type="search" 
                                placeholder="Search..." 
                                aria-label="Search" 
                            />
                        </div>
                    </div>

                    {/* Right Side Icons & Profile */}
                    <ul className="navbar-nav ms-auto align-items-center gap-3">
                        {/* Notifications */}
                        <li className="nav-item position-relative">
                            <a className="nav-link text-secondary" href="#">
                                <i className="fa-regular fa-bell fs-5"></i>
                                <span className="position-absolute top-10 start-100 translate-middle p-1 bg-danger border border-light rounded-circle notification-badge">
                                    <span className="visually-hidden">New alerts</span>
                                </span>
                            </a>
                        </li>

                        {/* Messages */}
                        <li className="nav-item position-relative d-none d-md-block">
                            <a className="nav-link text-secondary" href="#">
                                <i className="fa-regular fa-envelope fs-5"></i>
                            </a>
                        </li>

                        {/* User Profile */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User" className="rounded-circle object-fit-cover shadow-sm" width="40" height="40" />
                                ) : (
                                    <img src={profilePic} alt="User" className="rounded-circle object-fit-cover shadow-sm" width="40" height="40" />
                                )}
                                <div className="d-none d-md-block text-start">
                                    <p className="m-0 fw-semibold fs-6 lh-1 text-dark">{user?.firstName || user?.fullName || 'Admin User'}</p>
                                    <small className="text-muted" style={{ fontSize: '12px' }}>{user?.role || 'Administrator'}</small>
                                </div>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="navbarDropdown">
                                <li><a className="dropdown-item d-flex align-items-center gap-2 py-2" href="#"><i className="fa-regular fa-user text-muted"></i> My Profile</a></li>
                                <li><Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/admin/settings"><i className="fa-solid fa-gear text-muted"></i> Settings</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}><i className="fa-solid fa-arrow-right-from-bracket"></i> Logout</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    )
}
export default Header;