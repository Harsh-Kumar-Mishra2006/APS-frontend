// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

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
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/verify');
        
        if (response.data.success && response.data.data.valid) {
          setUser(response.data.data.user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  // ============= ADMIN SIGNUP (First admin creates account) =============
  const adminSignup = async (adminData) => {
    try {
      const response = await api.post('/auth/admin/signup', {
        name: adminData.name,
        email: adminData.email,
        username: adminData.username,
        phone: adminData.phone,
        password: adminData.password
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setUser(response.data.data.user);
        return { 
          success: true, 
          message: response.data.message, 
          user: response.data.data.user 
        };
      } else {
        return { 
          success: false, 
          error: response.data.error || 'Signup failed' 
        };
      }
    } catch (error) {
      console.error('Admin signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Network error. Please try again.'
      };
    }
  };

  // ============= LOGIN (For all users: admin, teacher, student, parent) =============
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setUser(response.data.data.user);
        
        return { 
          success: true, 
          message: response.data.message,
          user: response.data.data.user,
          needsPasswordChange: response.data.data.needsPasswordChange
        };
      } else {
        return { 
          success: false, 
          error: response.data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Network error. Please try again.'
      };
    }
  };

  // ============= CHANGE PASSWORD (First login or voluntary) =============
  const changePassword = async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        // Update token if returned
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        return {
          success: true,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.error
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to change password'
      };
    }
  };

  // ============= FORGOT PASSWORD =============
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      return {
        success: response.data.success,
        message: response.data.message,
        resetToken: response.data.data?.resetToken
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Network error. Please try again.'
      };
    }
  };

  // ============= RESET PASSWORD =============
  const resetPassword = async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token: resetData.token,
        newPassword: resetData.newPassword
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to reset password'
      };
    }
  };

  // ============= LOGOUT =============
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // ============= GET PROFILE =============
  const getProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return { success: true, user: response.data.data };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      if (error.response?.status === 401) {
        logout();
      }
      return { success: false, error: 'Failed to fetch profile' };
    }
  };

  // ============= UPDATE PROFILE =============
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        phone: profileData.phone
      });
      
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return { success: true, message: response.data.message, user: response.data.data };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to update profile' };
    }
  };

  // ============= HELPER FUNCTIONS =============
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);

  const value = {
    // State
    user,
    loading,
    authChecked,
    
    // Auth functions
    adminSignup,
    login,
    changePassword,
    forgotPassword,
    resetPassword,
    logout,
    getProfile,
    updateProfile,
    
    // Role checks
    isAuthenticated: !!user,
    isAdmin: hasRole('admin'),
    isTeacher: hasRole('teacher'),
    isStudent: hasRole('student'),
    isParent: hasRole('parent'),
    isPrincipal: hasRole('principal'),
    
    // Helpers
    hasRole,
    hasAnyRole,
    
    // User info shortcuts
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    userRole: user?.role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};