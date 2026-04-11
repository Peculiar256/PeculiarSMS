import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './ForgotPassword.css'
import kyuLogo from '../../src/assets/PS.png';
import { useAuth } from '../context/AuthContext';


function ForgotPassword (){
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const result = await forgotPassword(email);
            if (result.success) {
                setSuccess(result.message || 'Reset link has been sent to your email');
                setEmail('');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.error || 'Failed to send reset link');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Forgot password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div className="forgot-container">
            <form onSubmit={handleSubmit} className="forgot-content">
                <div className="Kyu">
                    <img src={kyuLogo} alt="" className="KyuLogo" />
                </div>
                <h1>Forgot Password</h1>
                <div className="forgot-inputs">
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

                    <div className="forgot-data">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <i className="fa-solid fa-envelope left"></i>
                            <span className="divider"></span>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="Email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="forgot-btn">
                        <button 
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Link'}
                        </button>
                    </div>
                    <p>Remembered my Password? <Link to='/login' id="proceed">Login</Link></p>
                </div>
            </form>
        </div>
    )
}
export default ForgotPassword;