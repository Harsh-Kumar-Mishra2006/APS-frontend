// src/components/auth/Login.jsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [step, setStep] = useState('role'); // 'role', 'credentials'
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    identifier: '', // email or username
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  // useEffect(() => {
  //   const user = localStorage.getItem('user');
  //   if (user) {
  //     navigate('/');
  //   }
  // }, [navigate]);

  const roles = [
    { value: 'admin', label: 'Admin', icon: '👑', color: 'border-purple-300', bgColor: 'bg-purple-50', textColor: 'text-purple-800' },
    { value: 'teacher', label: 'Teacher', icon: '👨‍🏫', color: 'border-blue-300', bgColor: 'bg-blue-50', textColor: 'text-blue-800' },
    { value: 'student', label: 'Student', icon: '👨‍🎓', color: 'border-green-300', bgColor: 'bg-green-50', textColor: 'text-green-800' },
    { value: 'parent', label: 'Parent', icon: '👨‍👦', color: 'border-orange-300', bgColor: 'bg-orange-50', textColor: 'text-orange-800' }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setStep('credentials');
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  
  if (!selectedRole) {
    toast.error('Please select your role first');
    return;
  }
  
  if (!formData.identifier.trim()) {
    toast.error('Email or username is required');
    return;
  }
  
  if (!formData.password.trim()) {
    toast.error('Password is required');
    return;
  }

  setLoading(true);
  setError('');
  
  // Prepare login data - use 'identifier' field
  const loginData = {
    identifier: formData.identifier, // Use identifier
    password: formData.password,
    role: selectedRole
  };
  
  console.log('Sending login data:', loginData);
  
  // For admin login
  if (selectedRole === 'admin') {
    // Admin can login with email or username
    const result = await login(loginData);
    
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      setTimeout(() => navigate('/'), 1000);
    } else {
      if (result.needsSetup) {
        toast.error('Please complete registration first');
        navigate(`/signup?email=${encodeURIComponent(formData.identifier)}&role=${selectedRole}`);
      } else {
        toast.error(result.error || 'Login failed');
        setError(result.error);
      }
    }
  } else {
    // For non-admin roles
    const result = await login(loginData);
    
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      
      // Redirect based on role
      setTimeout(() => {
        switch (result.user.role) {
          case 'teacher':
            navigate('/');
            break;
          case 'student':
            navigate('/');
            break;
          case 'parent':
            navigate('/');
            break;
          default:
            navigate('/');
        }
      }, 1000);
    } else {
      if (result.needsSetup) {
        toast.error('Please complete registration first');
        navigate(`/signup?email=${encodeURIComponent(formData.identifier)}&role=${selectedRole}`);
      } else {
        toast.error(result.error || 'Login failed');
        setError(result.error);
      }
    }
  }
  
  setLoading(false);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 'role' ? 'Select Your Role to Login' : 'Enter Your Credentials'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'role' ? 'Choose your role to continue' : 
             selectedRole === 'admin' ? 'Enter your admin credentials' : 
             'Login with email or username'}
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">I am a...</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleRoleSelect(role.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedRole === role.value 
                      ? `${role.bgColor} ${role.color} shadow-md` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{role.icon}</div>
                  <div className={`font-semibold ${role.textColor}`}>
                    {role.label}
                  </div>
                  {selectedRole === role.value && (
                    <div className="mt-2 text-xs font-medium">
                      ✓ Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {selectedRole && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setStep('credentials')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Continue as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Credentials Entry */}
        {step === 'credentials' && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Selected Role:</span> {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </p>
              <button
                onClick={() => {
                  setStep('role');
                  setFormData({ identifier: '', password: '' });
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Change role
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedRole === 'admin' ? 'Email or Username' : 'Email or Username'}
                </label>
                <input
                  type="text"
                  id="identifier"
                  value={formData.identifier}
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={selectedRole === 'admin' ? "Enter email or username" : "Enter registered email or username"}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the email address or username you registered with
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <div className="mt-4 flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('role');
                      setFormData({ identifier: '', password: '' });
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ← Go back
                  </button>
                  <Link 
                    to="/forgot-password" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !formData.identifier || !formData.password}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </Link>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Forgot how to login?{' '}
            <Link to="/help" className="font-medium text-blue-600 hover:text-blue-500">
              See login guide
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;