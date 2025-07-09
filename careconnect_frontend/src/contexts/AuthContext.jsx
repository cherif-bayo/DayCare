import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../lib/config';
import { apiCall } from '../lib/mockApi';
import i18n from 'i18next';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('careconnect_token'));

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('careconnect_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.VALIDATE_TOKEN, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        localStorage.setItem('careconnect_user', JSON.stringify(userData.user));
      } else {
        // Token is invalid
        logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      // Don't logout on network error in production (mock API)
      if (import.meta.env.DEV) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      // log status code
      console.log('[AuthContext] login http status:', response.status);
  
      const data = await response.json();
  
      // log full payload
      console.log('[AuthContext] login response body:', data);
  
      if (response.ok && data.success) {
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('careconnect_token', data.access_token);
        localStorage.setItem('careconnect_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        // if the server is returning an error payload, let's see it
        console.warn('[AuthContext] login error payload:', data);
        return {
          success: false,
          error: data.error?.message || `Login failed (${response.status})`,
          code: data.error?.code,
        };
      }
    } catch (err) {
      console.error('[AuthContext] login network error:', err);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };
  

  const register = async (userData) => {
    try {
      const response = await apiCall(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('careconnect_token', data.token);
        localStorage.setItem('careconnect_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        // return { 
        //   success: false, 
        //   error: data.error?.message || 'Registration failed' 
        // };
        // Look up a translation for data.error.code, or fall back to data.error.message
        const code = data.error?.code;
        const errMsg = code
        ? i18n.t(`errors.${code}`)
        : (data.error?.message || i18n.t('errors.INTERNAL_ERROR'));
        return { success: false, error: errMsg, code };       
        // return the code so the form can highlight specific fields

      }
    } catch (error) {
      console.error('Registration error:', error);
      // return { 
      //   success: false, 
      //   error: 'Network error. Please try again.' 
      // };
      return {
        success: false,
        error: i18n.t('errors.INTERNAL_ERROR'),
        code: 'INTERNAL_ERROR'
      };
    }
  };

  const registerWithInvitation = async (userData, invitationToken) => {
    try {
      const response = await apiCall(API_ENDPOINTS.REGISTER_WITH_INVITATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, invitation_token: invitationToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('careconnect_token', data.token);
        localStorage.setItem('careconnect_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration with invitation error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('careconnect_token');
    localStorage.removeItem('careconnect_user');
  };

  const value = {
    user,
    token,
    accessToken: token,
    loading,
    login,
    register,
    registerWithInvitation,
    logout,
    isAuthenticated: !!user,
    isHoster: user?.role === 'admin',
    isDaycare: user?.user_type === 'daycare',
    isParent: user?.user_type === 'parent', 
    isAdmin: user?.user_type === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

