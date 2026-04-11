import React from "react";
import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="dashboard-footer">
            <div className="container-fluid">
                <div className="footer-content">
                    <div className="footer-section">
                        <h6>School Management System</h6>
                        <p>Empowering educational institutions with modern management solutions</p>
                    </div>
                    <div className="footer-section">
                        <h6>Quick Links</h6>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Contact</a></li>
                            <li><a href="#">Help</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h6>Support</h6>
                        <ul>
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Report Issue</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {currentYear} School Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
