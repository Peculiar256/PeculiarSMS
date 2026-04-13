import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react'
import kyuLogo from '../../src/assets/PS.png';
import { useAuth } from '../context/AuthContext';
import './Login.css'


function LoginForm(){
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login, isAuthenticated, userRole } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            const dashboardRoutes = {
                STUDENT: '/student',
                TEACHER: '/teacher',
                ADMIN: '/admin',
                LIBRARIAN: '/librarian',
            };
            const redirectPath = dashboardRoutes[userRole] || '/login';
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, userRole, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                // Redirect to appropriate dashboard based on role
                const dashboardRoutes = {
                    STUDENT: '/student',
                    TEACHER: '/teacher',
                    ADMIN: '/admin',
                    LIBRARIAN: '/librarian',
                };
                const redirectPath = dashboardRoutes[result.user.role] || '/login';
                navigate(redirectPath, { replace: true });
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='loginForm'>
            <form onSubmit={handleSubmit} className='form-content'>
                <div className="Kyu">
                    <img src={kyuLogo} alt="" className="KyuLogo" />
                </div>
                <h1>Login Form</h1>
                <div className="login-inputs">
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

                    <div className="uesr-name">
                        <label htmlFor="username">Email</label>
                        <div className="login-user-wrapper">
                            <i className="fa-solid fa-user"></i>
                            <input 
                                type="email" 
                                id='username' 
                                required 
                                placeholder='Email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="uesr-name">
                        <label htmlFor="password">Password</label>
                        <div className="login-user-wrapper password-wrapper">
                            <i className="fa-solid fa-lock"></i>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                id='password'
                                required 
                                placeholder='Password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                    
                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    <p>Forgot password? <Link to='/forgotPassword' id ="reset" >Click here</Link></p>
                    <p>Don't have account? Contact your Admin.</p>
                </div>
            </form>
        </div>
    );
}

export default LoginForm