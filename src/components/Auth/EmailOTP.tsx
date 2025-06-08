// src/components/Auth/EmailOTP.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface EmailOTPProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const EmailOTP: React.FC<EmailOTPProps> = ({ onSuccess, onError }) => {
  const { sendEmailOTP, verifyEmailOTP, isLoading, error, clearError } = useAuth();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isValidEmail, setIsValidEmail] = useState(false);

  useEffect(() => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  useEffect(() => {
    // Countdown timer for OTP resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail) {
      onError?.('Please enter a valid email address');
      return;
    }

    try {
      clearError();
      const token = await sendEmailOTP(email);
      setSessionToken(token);
      setStep('otp');
      setCountdown(300); // 5 minutes countdown
      setOtp('');
    } catch (error: any) {
      onError?.(error.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      onError?.('Please enter the 6-digit OTP');
      return;
    }

    try {
      clearError();
      await verifyEmailOTP(email, otp, sessionToken);
      onSuccess?.();
    } catch (error: any) {
      onError?.(error.message || 'OTP verification failed');
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      clearError();
      const token = await sendEmailOTP(email);
      setSessionToken(token);
      setCountdown(300);
      setOtp('');
    } catch (error: any) {
      onError?.(error.message || 'Failed to resend OTP');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'email') {
    return (
      <div className="email-otp">
        <div className="email-otp-header">
          <h3 className="email-otp-title">Sign in with Email</h3>
          <p className="email-otp-subtitle">
            Enter your email address to receive a verification code
          </p>
        </div>

        <form onSubmit={handleSendOTP} className="email-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-input ${email && !isValidEmail ? 'form-input-error' : ''}`}
              placeholder="your.email@example.com"
              required
              disabled={isLoading}
            />
            {email && !isValidEmail && (
              <p className="form-error">Please enter a valid email address</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValidEmail || isLoading}
            className={`btn ${!isValidEmail || isLoading ? 'btn-disabled' : 'btn-primary'}`}
          >
            {isLoading ? (
              <div className="btn-loading">
                <div className="loading-spinner-small"></div>
                Sending OTP...
              </div>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <div className="error-content">
              <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="email-otp">
      <div className="email-otp-header">
        <h3 className="email-otp-title">Enter Verification Code</h3>
        <p className="email-otp-subtitle">
          We've sent a 6-digit code to <span className="email-highlight">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="otp-form">
        <div className="form-group">
          <label htmlFor="otp" className="form-label">
            Verification Code
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="form-input otp-input"
            placeholder="000000"
            maxLength={6}
            required
            disabled={isLoading}
          />
          <div className="otp-footer">
            <span className="otp-timer">
              {countdown > 0 ? (
                <>Code expires in {formatTime(countdown)}</>
              ) : (
                <span className="otp-expired">Code expired</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className={`btn-link ${countdown > 0 || isLoading ? 'btn-link-disabled' : ''}`}
            >
              Resend Code
            </button>
          </div>
        </div>

        <div className="otp-actions">
          <button
            type="submit"
            disabled={otp.length !== 6 || isLoading}
            className={`btn ${otp.length !== 6 || isLoading ? 'btn-disabled' : 'btn-primary'}`}
          >
            {isLoading ? (
              <div className="btn-loading">
                <div className="loading-spinner-small"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setOtp('');
              setSessionToken('');
              setCountdown(0);
              clearError();
            }}
            className="btn btn-secondary"
          >
            ← Back to Email
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <div className="error-content">
            <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailOTP;