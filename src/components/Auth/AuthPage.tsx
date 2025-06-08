import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleAuth from './GoogleAuth';
import EmailOTP from './EmailOTP';

type AuthMethod = 'google' | 'email';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('google');
  const [error, setError] = useState<string>('');

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const handleAuthError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Okto API Demo</h1>
          <p className="auth-subtitle">
            Try signing in using Google gAuth or email login using OTP, After completion you will be redirected to Dashboard.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="auth-card">
          {/* Auth Method Selector */}
          <div className="auth-tabs">
            <button
              onClick={() => setSelectedMethod('google')}
              className={`auth-tab ${selectedMethod === 'google' ? 'auth-tab-active' : ''}`}
            >
              <div className="auth-tab-content">
                <svg className="auth-tab-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedMethod('email')}
              className={`auth-tab ${selectedMethod === 'email' ? 'auth-tab-active' : ''}`}
            >
              <div className="auth-tab-content">
                <svg className="auth-tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email OTP</span>
              </div>
            </button>
          </div>

          {/* Global Error Display */}
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

          {/* Authentication Components */}
          <div className="auth-content">
            {selectedMethod === 'google' ? (
              <GoogleAuth 
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
              />
            ) : (
              <EmailOTP 
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            If this doesnt work, exxplore the github repository for more details.
          </p>
          <div className="auth-footer-info">
            <div className="auth-footer-powered">
              <span>Powered by</span>
              <span className="auth-footer-brand">Okto API Demo</span>
            </div>
            <span>•</span>
            <div className="auth-footer-status">
              <div className="status-indicator"></div>
              <span>Sandbox Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;