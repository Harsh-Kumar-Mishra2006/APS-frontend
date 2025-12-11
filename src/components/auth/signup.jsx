// src/components/auth/Signup.jsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [step, setStep] = useState('role'); // 'role', 'email', 'form', 'admin-form'
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { checkEmailRegistration, completeRegistration, adminSignup } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get email from URL params if coming from login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    if (email) {
      setFormData(prev => ({ ...prev, email }));
      if (!selectedRole) {
        setStep('role');
      } else {
        setStep('email');
      }
    }
  }, [location]);

  const roles = [
    { value: 'admin', label: 'Admin', icon: '👑', color: 'border-purple-300', bgColor: 'bg-purple-50', textColor: 'text-purple-800' },
    { value: 'teacher', label: 'Teacher', icon: '👨‍🏫', color: 'border-blue-300', bgColor: 'bg-blue-50', textColor: 'text-blue-800' },
    { value: 'student', label: 'Student', icon: '👨‍🎓', color: 'border-green-300', bgColor: 'bg-green-50', textColor: 'text-green-800' },
    { value: 'parent', label: 'Parent', icon: '👨‍👦', color: 'border-orange-300', bgColor: 'bg-orange-50', textColor: 'text-orange-800' }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    
    // If admin selected, go directly to admin form
    if (role === 'admin') {
      setStep('admin-form');
      toast('Admin accounts can be created directly!');
    } else {
      setStep('email');
    }
  };

  const handleEmailCheck = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select your role first');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    
    // Check if email is registered by admin (for non-admin roles only)
    const result = await checkEmailRegistration(formData.email);
    
    if (result.success && result.isRegistered) {
      // Check if role matches
      if (result.data?.role !== selectedRole) {
        const errorMsg = `This email is registered as ${result.data?.role}, not ${selectedRole}`;
        toast.error(errorMsg);
        setError(errorMsg);
      } else if (result.data?.isActive && result.data?.password && result.data?.password !== '') {
        // Already registered and has password, redirect to login
        toast.success('Account already registered. Please login instead.');
        navigate('/login', { state: { email: formData.email } });
      } else {
        // Email is registered but user needs to create account
        setUserInfo({
          email: result.data?.email,
          role: result.data?.role,
          addedBy: result.data?.addedBy
        });
        setStep('form');
        toast.success('Email verified! Please complete your registration.');
      }
    } else {
      const errorMsg = result.error || 'Email not registered by admin. Contact administrator.';
      toast.error(errorMsg);
      setError(errorMsg);
    }
    
    setLoading(false);
  };

  const handleCompleteRegistration = async (e) => {
  e.preventDefault();
  
  // Validate all fields
  if (!formData.name || !formData.username || !formData.phone || 
      !formData.password || !formData.confirmPassword) {
    toast.error('All fields are required');
    return;
  }
  
  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }
  
  if (formData.password.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  setLoading(true);
  setError('');
  
  const registrationData = {
    email: formData.email,
    name: formData.name,
    username: formData.username,
    phone: formData.phone,
    password: formData.password,
    confirmPassword: formData.confirmPassword, // Make sure this is included
    role: selectedRole
  };
  
  console.log('Sending registration data:', registrationData);
  
  const result = await completeRegistration(registrationData);
  
  if (result.success) {
    toast.success('Registration completed successfully!');
    setSuccess('Account created! Redirecting to login...');
    
    setTimeout(() => {
      navigate('/login', { 
        state: { 
          email: formData.email,
          message: 'Account created successfully. Please login.'
        }
      });
    }, 2000);
  } else {
    if (result.needsLogin) {
      toast.error('Account already registered. Please login.');
      setTimeout(() => {
        navigate('/login', { state: { email: formData.email } });
      }, 2000);
    } else {
      toast.error(result.error || 'Registration failed');
      setError(result.error);
    }
  }
  
  setLoading(false);
};

  const handleAdminSignup = async (e) => {
    e.preventDefault();
    
    // Validate admin form
    if (!formData.name || !formData.email || !formData.username || 
        !formData.phone || !formData.password || !formData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    const adminData = {
      name: formData.name,
      email: formData.email,
      username: formData.username,
      phone: formData.phone,
      password: formData.password
    };
    
    const result = await adminSignup(adminData);
    
    if (result.success) {
      toast.success('Admin account created successfully!');
      setSuccess('Admin account created! Redirecting...');
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } else {
      toast.error(result.error || 'Admin signup failed');
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 'role' ? 'Select Your Role' : 
             step === 'email' ? 'Verify Your Email' : 
             step === 'admin-form' ? 'Create Admin Account' :
             'Complete Registration'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'role' ? 'Choose your role to continue' :
             step === 'email' ? 'Enter email registered by admin' :
             step === 'admin-form' ? 'Fill admin details (no approval needed)' :
             'Create your account'}
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Who are you?</h3>
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
            
            {selectedRole === 'admin' && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">👑 Admin Registration</h4>
                <p className="text-sm text-purple-700">
                  • No approval needed for admin accounts
                  • Can create other user accounts
                  • Full system access
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Email Check (for non-admin roles) */}
        {step === 'email' && selectedRole !== 'admin' && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Selected Role:</span> {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </p>
              <button
                onClick={() => setStep('role')}
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
            
            <form onSubmit={handleEmailCheck}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Your Registered Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@example.com"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter the email address that was registered by your school administrator
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.email}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Registration Form (for non-admin roles) */}
        {step === 'form' && selectedRole !== 'admin' && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                {selectedRole === 'teacher' ? '👨‍🏫 Teacher Registration' :
                 selectedRole === 'student' ? '👨‍🎓 Student Registration' : 
                 '👨‍👦 Parent Registration'}
              </h4>
              <p className="text-sm text-blue-700">
                Email: <span className="font-medium">{formData.email}</span>
              </p>
              <p className="text-sm text-blue-700">
                Role: <span className="font-medium">{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
              </p>
              <button
                onClick={() => setStep('email')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                ← Change email
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
            
            <form onSubmit={handleCompleteRegistration}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="johndoe"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This will be used for login along with your email
                  </p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1234567890"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Admin Registration Form */}
        {step === 'admin-form' && selectedRole === 'admin' && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">👑 Admin Registration</h4>
              <p className="text-sm text-purple-700">
                • No approval needed for admin accounts
                • Full system access and control
                • Can create other user accounts
              </p>
              <button
                onClick={() => setStep('role')}
                className="mt-2 text-sm text-purple-600 hover:text-purple-800"
              >
                ← Back to role selection
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
            
            <form onSubmit={handleAdminSignup}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="admin-email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="johndoe"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="+1234567890"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="admin-password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="admin-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="admin-confirm-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Creating Account...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;