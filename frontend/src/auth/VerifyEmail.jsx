import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Handle verification code input
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setError('');
  };

  // Handle verify button click
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Connect to backend API for email verification
      // const response = await fetch('http://localhost:8080/api/verify-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ verificationCode })
      // });
      
      // Simulated success for now
      setTimeout(() => {
        setIsVerified(true);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setCountdown(60);
    setError('');
    
    try {
      // TODO: Connect to backend API to resend verification code
      // const response = await fetch('http://localhost:8080/api/resend-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // Simulate countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  // Success state UI
  if (isVerified) {
    return (
      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2 className="success-title">Email Verified!</h2>
          <p className="success-message">
            Your email has been successfully verified. Your account is now active and ready to use.
          </p>
          <button 
            className="verify-button verified"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className="verify-header">
          <div className="verify-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h2>Verify Your Email</h2>
          <p className="verify-subtitle">
            We've sent a verification code to your email address. Enter it below to verify your account.
          </p>
        </div>

        <form onSubmit={handleVerify}>
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="verify-form-group">
            <label htmlFor="verificationCode">Verification Code</label>
            <div className="code-input-wrapper">
              <input
                type="text"
                id="verificationCode"
                className="verification-code-input"
                placeholder="000000"
                value={verificationCode}
                onChange={handleCodeChange}
                maxLength="6"
                disabled={isLoading}
              />
              <span className="code-hint">{verificationCode.length}/6</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="verify-button"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                <span>Verify Email</span>
              </>
            )}
          </button>
        </form>

        <div className="verify-actions">
          <button 
            type="button"
            className="resend-button"
            onClick={handleResendCode}
            disabled={countdown > 0 || isLoading}
          >
            {countdown > 0 ? (
              <>
                <i className="fas fa-clock"></i>
                Resend in {countdown}s
              </>
            ) : (
              <>
                <i className="fas fa-redo"></i>
                Resend Code
              </>
            )}
          </button>
        </div>

        <div className="verify-footer">
          <p>Already verified? <Link to="/login" className="login-link">Go to Login</Link></p>
          <p className="support-text">
            <i className="fas fa-info-circle"></i>
            Didn't receive the code? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
