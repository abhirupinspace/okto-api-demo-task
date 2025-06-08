// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { SessionVerificationResponse, SessionConfig } from '../types/okto';
import oktoApi from '../services/oktoApi';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SessionVerificationResponse['data'] | null;
  authToken: string | null;
  sessionConfig: SessionConfig | null;
  error: string | null;
  isDemoMode: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { user: SessionVerificationResponse['data']; authToken: string; sessionConfig?: SessionConfig } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_SESSION_CONFIG'; payload: SessionConfig };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  authToken: null,
  sessionConfig: null,
  error: null,
  isDemoMode: oktoApi.isDemoModeEnabled(),
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        authToken: action.payload.authToken,
        sessionConfig: action.payload.sessionConfig || null,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_DEMO_MODE':
      return { ...state, isDemoMode: action.payload };
    case 'LOGOUT':
      return { ...initialState, isLoading: false, isDemoMode: state.isDemoMode };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  loginWithGoogle: (idToken: string) => Promise<void>;
  sendEmailOTP: (email: string) => Promise<string>;
  verifyEmailOTP: (email: string, otp: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('okto_auth_token');
        const storedSessionConfig = localStorage.getItem('okto_session_config');
        const storedDemoMode = localStorage.getItem('okto_demo_mode');

        // Set demo mode from storage or default
        const demoMode = storedDemoMode ? JSON.parse(storedDemoMode) : true;
        oktoApi.setDemoMode(demoMode);
        dispatch({ type: 'SET_DEMO_MODE', payload: demoMode });

        if (storedToken) {
          oktoApi.setAuthToken(storedToken);
          
          if (storedSessionConfig) {
            try {
              const sessionConfig = JSON.parse(storedSessionConfig);
              oktoApi.setSessionConfig(sessionConfig);
            } catch (e) {
              console.error('Failed to parse session config:', e);
            }
          }
          
          try {
            const sessionResponse = await oktoApi.verifySession();
            
            if (sessionResponse.status === 'success') {
              dispatch({
                type: 'SET_AUTHENTICATED',
                payload: {
                  user: sessionResponse.data,
                  authToken: storedToken,
                  sessionConfig: storedSessionConfig ? JSON.parse(storedSessionConfig) : undefined,
                },
              });
            } else {
              // Session invalid, clear storage
              localStorage.removeItem('okto_auth_token');
              localStorage.removeItem('okto_session_config');
              dispatch({ type: 'LOGOUT' });
            }
          } catch (error) {
            console.error('Session verification failed:', error);
            // In demo mode, don't clear tokens on verification failure
            if (!demoMode) {
              localStorage.removeItem('okto_auth_token');
              localStorage.removeItem('okto_session_config');
              dispatch({ type: 'LOGOUT' });
            } else {
              // For demo mode, create a mock session
              const mockUser: SessionVerificationResponse['data'] = {
                user_id: 'demo_user_123',
                vendor_id: 'demo_vendor_456',
                user_swa: '0x742d35Cc6639C0532fEb2C6F29C55E3d8E2b9f2A',
                vendor_swa: import.meta.env.VITE_OKTO_CLIENT_SWA || '0xDemo1234567890',
                is_session_added: true,
                sign_auth_relayer_user_ops: 'enabled'
              };
              
              dispatch({
                type: 'SET_AUTHENTICATED',
                payload: {
                  user: mockUser,
                  authToken: storedToken,
                  sessionConfig: storedSessionConfig ? JSON.parse(storedSessionConfig) : undefined,
                },
              });
            }
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const loginWithGoogle = async (idToken: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('Starting Google authentication...');
      const authToken = await oktoApi.authenticateWithGoogle(idToken);
      
      localStorage.setItem('okto_auth_token', authToken);
      
      const sessionConfig = oktoApi.getSessionConfig();
      if (sessionConfig) {
        localStorage.setItem('okto_session_config', JSON.stringify(sessionConfig));
      }

      const sessionResponse = await oktoApi.verifySession();
      
      if (sessionResponse.status === 'success') {
        dispatch({
          type: 'SET_AUTHENTICATED',
          payload: {
            user: sessionResponse.data,
            authToken,
          },
        });
        console.log('Google authentication successful');
      } else {
        throw new Error('Session verification failed after authentication');
      }
    } catch (error: any) {
      console.error('Google authentication failed:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Google authentication failed' 
      });
      throw error;
    }
  };

  const sendEmailOTP = async (email: string): Promise<string> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      console.log('Sending email OTP to:', email);
      const response = await oktoApi.sendEmailOTP(email);
      console.log('OTP sent successfully');
      return response.token;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send OTP';
      console.error('Send OTP failed:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const verifyEmailOTP = async (email: string, otp: string, token: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('Verifying email OTP...');
      const authToken = await oktoApi.verifyEmailOTP(email, otp, token);
      
      localStorage.setItem('okto_auth_token', authToken);
      
      const sessionConfig = oktoApi.getSessionConfig();
      if (sessionConfig) {
        localStorage.setItem('okto_session_config', JSON.stringify(sessionConfig));
      }

      const sessionResponse = await oktoApi.verifySession();
      
      if (sessionResponse.status === 'success') {
        dispatch({
          type: 'SET_AUTHENTICATED',
          payload: {
            user: sessionResponse.data,
            authToken,
          },
        });
        console.log('Email OTP verification successful');
      } else {
        throw new Error('Session verification failed after OTP verification');
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'OTP verification failed' 
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.authToken) {
        await oktoApi.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('okto_auth_token');
      localStorage.removeItem('okto_session_config');
      oktoApi.clearAuthToken();
      dispatch({ type: 'LOGOUT' });
      console.log('Logged out successfully');
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setDemoMode = (enabled: boolean) => {
    oktoApi.setDemoMode(enabled);
    localStorage.setItem('okto_demo_mode', JSON.stringify(enabled));
    dispatch({ type: 'SET_DEMO_MODE', payload: enabled });
    console.log(`Demo mode ${enabled ? 'enabled' : 'disabled'}`);
  };

  const value: AuthContextType = {
    ...state,
    loginWithGoogle,
    sendEmailOTP,
    verifyEmailOTP,
    logout,
    clearError,
    setDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};