import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess, onError }) => {
  const { loginWithGoogle, isLoading, error } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const initializeGoogle = () => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
      });
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      await loginWithGoogle(response.credential);
      onSuccess?.();
    } catch (error: any) {
      onError?.(error.message || 'Google authentication failed');
    }
  };

  return (
    <div className="google-auth">
      <div className="google-auth-header">
        <h3 className="google-auth-title">Sign in with Google</h3>
        <p className="google-auth-subtitle">
          Connect your Google account to access your Okto wallet
        </p>
      </div>

      <div className="google-button-container">
        <div 
          ref={googleButtonRef} 
          className="google-button"
        />
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Authenticating...</span>
        </div>
      )}

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

export default GoogleAuth;