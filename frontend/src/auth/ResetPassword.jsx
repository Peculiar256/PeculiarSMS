import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import './ResetPassword.css'
import kyuLogo from '/src/assets/images-removebg-preview.png'
import { useAuth } from '../context/AuthContext';

function ResetPassword (){
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const result = await resetPassword(token, newPassword);
            if (result.success) {
                setSuccess(result.message || 'Password reset successfully');
                setNewPassword('');
                setConfirmPassword('');
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Reset password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="reset-container">
                <div className="reset-content" style={{ textAlign: 'center' }}>
                    <div className="Kyu">
                        <img src={kyuLogo} alt="" className="KyuLogo" />
                    </div>
                    <h1>Reset Password</h1>
                    <div style={{ color: 'red', padding: '20px' }}>
                        Invalid reset link. Please request a new password reset from the login page.
                    </div>
                    <Link to="/forgotPassword" style={{ color: 'blue', textDecoration: 'underline' }}>
                        Request new reset link
                    </Link>
                </div>
            </div>
        );
    }

    return(
        <div className="reset-container">
            <form onSubmit={handleSubmit} className="reset-content">
                
                <div className="Kyu">
                    <img src={kyuLogo} alt="" className="KyuLogo" />
                </div>
                <div>
                    <div className="reset-inputs">
                        {error && (
                            <div className="error-message" style={{ 
                                color: 'red', 
                                fontSize: '14px', 
                                marginBottom: '10px',
                                padding: '10px',
                                backgroundColor: '#ffe0e0',
                                borderRadius: '4px'
                            }}>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="success-message" style={{ 
                                color: 'green', 
                                fontSize: '14px', 
                                marginBottom: '10px',
                                padding: '10px',
                                backgroundColor: '#e0ffe0',
                                borderRadius: '4px'
                            }}>
                                {success}
                            </div>
                        )}
                        <label htmlFor="newPassword">New password</label>
                        <div className="reset-wrapper password-wrapper">
                            <i className="fa-solid fa-lock"></i>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                id="newPassword" 
                                placeholder="New password" 
                                required 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide password' : 'Show password'}
                                disabled={isLoading}
                            >
                                <i className={`fa-solid fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                        </div>
                    </div>
                    <div className="reset-inputs">
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <div className="reset-wrapper password-wrapper">
                            <i className="fa-solid fa-lock"></i>
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword" 
                                placeholder="Confirm password" 
                                required 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                                disabled={isLoading}
                            >
                                <i className={`fa-solid fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="reset-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <p>Remembered your password? <Link to='/login' id="press">Login</Link></p>
                </div>
            </form>
        </div>
    )
}
export default ResetPassword;