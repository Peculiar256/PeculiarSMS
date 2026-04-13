import React, { useState } from "react";

function Settings() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklyReminders: true,
        publicProfile: false,
        fullName: "Student User",
        email: "student@school.com",
        phone: "+1 (555) 123-4567",
    });

    const handleToggle = (key) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleInputChange = (field, value) => {
        setSettings({ ...settings, [field]: value });
    };

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1><i className="fa-solid fa-gear"></i> Settings</h1>
                    <p>Manage your account and preferences</p>
                </div>
            </div>

            <div style={{ maxWidth: '600px' }}>
                {/* Profile Settings */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <h5 className="mb-0">Profile Information</h5>
                    </div>
                    <div className="card-body">
                        <div style={{ marginBottom: '16px' }}>
                            <label className="form-label fw-bold">Full Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={settings.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label className="form-label fw-bold">Email</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                value={settings.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label className="form-label fw-bold">Phone Number</label>
                            <input 
                                type="tel" 
                                className="form-control" 
                                value={settings.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div>
                            <button className="btn btn-primary">
                                <i className="fa-solid fa-save"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <h5 className="mb-0">Notification Preferences</h5>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '12px' }}>
                            <div>
                                <h6 style={{ margin: 0, fontWeight: 600 }}>Email Notifications</h6>
                                <small style={{ color: '#64748b' }}>Receive email updates about assignments</small>
                            </div>
                            <input 
                                type="checkbox" 
                                className="form-check-input" 
                                checked={settings.emailNotifications}
                                onChange={() => handleToggle('emailNotifications')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '12px' }}>
                            <div>
                                <h6 style={{ margin: 0, fontWeight: 600 }}>Push Notifications</h6>
                                <small style={{ color: '#64748b' }}>Receive browser notifications</small>
                            </div>
                            <input 
                                type="checkbox" 
                                className="form-check-input" 
                                checked={settings.pushNotifications}
                                onChange={() => handleToggle('pushNotifications')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '12px' }}>
                            <div>
                                <h6 style={{ margin: 0, fontWeight: 600 }}>Weekly Reminders</h6>
                                <small style={{ color: '#64748b' }}>Get weekly summary of your activities</small>
                            </div>
                            <input 
                                type="checkbox" 
                                className="form-check-input" 
                                checked={settings.weeklyReminders}
                                onChange={() => handleToggle('weeklyReminders')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h6 style={{ margin: 0, fontWeight: 600 }}>Public Profile</h6>
                                <small style={{ color: '#64748b' }}>Allow other students to view your profile</small>
                            </div>
                            <input 
                                type="checkbox" 
                                className="form-check-input" 
                                checked={settings.publicProfile}
                                onChange={() => handleToggle('publicProfile')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <h5 className="mb-0">Security</h5>
                    </div>
                    <div className="card-body">
                        <button className="btn btn-warning" style={{ marginRight: '8px', marginBottom: '12px' }}>
                            <i className="fa-solid fa-lock"></i> Change Password
                        </button>
                        <button className="btn btn-danger">
                            <i className="fa-solid fa-trash"></i> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
