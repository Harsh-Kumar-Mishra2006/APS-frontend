// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.valid) {
            setUser(data.data.user);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  // ========== NEW AUTHENTICATION FLOW ==========

// In AuthContext.jsx - Fix checkEmailRegistration function
const checkEmailRegistration = async (email) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { 
        success: true, 
        data: data.data,
        isRegistered: true,
        needsSetup: data.data?.needsSetup
      };
    } else {
      return { 
        success: false, 
        error: data.error || 'Email not registered',
        isRegistered: false
      };
    }
    
  } catch (error) {
    console.error('Check email error:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection.',
      isRegistered: false
    };
  }
};

  // 2. Complete registration for pre-registered users
  // In completeRegistration function
const completeRegistration = async (registrationData) => {
  try {
    console.log('Sending registration data:', registrationData);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/complete-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });
    
    const data = await response.json();
    console.log('Registration response:', data);
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { 
        success: true, 
        message: data.message,
        user: data.data.user
      };
    } else {
      console.error('Registration failed:', data.error);
      return { 
        success: false, 
        error: data.error || data.message || 'Registration failed',
        needsLogin: data.needsLogin
      };
    }
  } catch (error) {
    console.error('Complete registration error:', error);
    return { 
      success: false, 
      error: 'Network error. Please try again.'
    };
  }
};

const login = async (credentials) => {
  try {
    // SIMPLE: Just send to backend, no pre-checks
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: credentials.identifier || credentials.email,
        password: credentials.password,
        role: credentials.role
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { 
        success: true, 
        message: data.message,
        user: data.data.user
      };
    } else {
      // Return whatever backend says
      return { 
        success: false, 
        error: data.error || data.message
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: 'Network error. Please try again.'
    };
  }
};

  // 4. Admin signup (Demo only - creates admin without needing admin to add them)
  const adminSignup = async (adminData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/admin/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        return { 
          success: true, 
          message: data.message, 
          user: data.data.user 
        };
      } else {
        return { 
          success: false, 
          error: data.error || data.message 
        };
      }
    } catch (error) {
      console.error('Admin signup error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.'
      };
    }
  };

  // 5. Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message || data.error,
        resetToken: data.data?.resetToken
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.'
      };
    }
  };

  // 6. Reset password
  const resetPassword = async (resetData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
      });
      
      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message || data.error
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.'
      };
    }
  };

  // 7. Logout
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // 8. Get user profile
  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'No token found' };
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        if (data.error?.includes('Invalid token')) {
          logout();
        }
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // 9. Update profile
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        return { success: true, message: data.message, user: data.data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // 10. Change password
  const changePassword = async (passwordData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData),
      });
      
      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message || data.error
      };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Helper functions
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);

  const value = {
    // State
    user,
    loading,
    authChecked,
    
    // Authentication functions
    checkEmailRegistration,
    completeRegistration,
    login,
    adminSignup,
    forgotPassword,
    resetPassword,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    
    // Role helpers
    isAuthenticated: !!user,
    isAdmin: hasRole('admin'),
    isTeacher: hasRole('teacher'),
    isStudent: hasRole('student'),
    isParent: hasRole('parent'),
    
    // Authorization helpers
    hasRole,
    hasAnyRole,
    
    // Quick access to user info
    userId: user?._id,
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