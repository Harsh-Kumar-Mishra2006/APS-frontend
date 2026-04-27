// src/pages/Login.jsx (Enhanced Version with Framer Motion)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCog, 
  GraduationCap, 
  BookOpen,
  Heart,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const roles = [
    { 
      id: 'admin', 
      name: 'Admin', 
      icon: UserCog, 
      gradient: 'from-blue-600 to-blue-700',
      lightBg: 'bg-blue-50',
      darkBg: 'bg-blue-600',
      textColor: 'text-blue-700',
      description: 'School Administrator'
    },
    { 
      id: 'teacher', 
      name: 'Teacher', 
      icon: BookOpen, 
      gradient: 'from-green-600 to-green-700',
      lightBg: 'bg-green-50',
      darkBg: 'bg-green-600',
      textColor: 'text-green-700',
      description: 'Faculty Member'
    },
    { 
      id: 'student', 
      name: 'Student', 
      icon: GraduationCap, 
      gradient: 'from-purple-600 to-purple-700',
      lightBg: 'bg-purple-50',
      darkBg: 'bg-purple-600',
      textColor: 'text-purple-700',
      description: 'Enrolled Student'
    },
    { 
      id: 'parent', 
      name: 'Parent', 
      icon: Heart, 
      gradient: 'from-pink-600 to-pink-700',
      lightBg: 'bg-pink-50',
      darkBg: 'bg-pink-600',
      textColor: 'text-pink-700',
      description: 'Parent/Guardian'
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('Please select your role first');
      return;
    }
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    
    setLoading(true);
    
    const result = await login({
      email: formData.email,
      password: formData.password
    });
    
    if (result.success) {
      if (result.user?.role !== selectedRole) {
        setError(`Invalid role selection. This account is registered as ${result.user?.role}. Please select the correct role.`);
        setLoading(false);
        return;
      }
      
      if (result.needsPasswordChange) {
        navigate('/change-password');
      } else {
        switch (result.user?.role) {
          case 'admin': navigate('/admin/dashboard'); break;
          case 'teacher': navigate('/teacher/dashboard'); break;
          case 'student': navigate('/student/dashboard'); break;
          case 'parent': navigate('/parent/dashboard'); break;
          default: navigate('/dashboard');
        }
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4"
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Login to School Management System</p>
        </div>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        {!selectedRole ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">Select Your Role</h2>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  return (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleRoleSelect(role.id)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-200
                        ${role.lightBg} border-gray-200 hover:shadow-lg
                        group overflow-hidden
                      `}
                    >
                      <div className="text-center relative z-10">
                        <div className={`inline-flex p-3 rounded-full bg-white shadow-sm mb-2 group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${role.textColor}`} />
                        </div>
                        <h3 className={`font-semibold ${role.textColor}`}>{role.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                      </div>
                      <motion.div 
                        className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                        whileHover={{ opacity: 0.1 }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Select your role to continue
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Selected Role Indicator */}
            <div className="mb-6">
              <div className={`
                flex items-center justify-between p-3 rounded-lg
                ${selectedRoleData.lightBg} border border-gray-200
              `}>
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`p-2 rounded-full bg-white`}
                  >
                    {React.createElement(selectedRoleData.icon, { 
                      className: `w-5 h-5 ${selectedRoleData.textColor}` 
                    })}
                  </motion.div>
                  <div>
                    <p className="text-sm text-gray-600">Logging in as</p>
                    <p className={`font-semibold ${selectedRoleData.textColor}`}>
                      {selectedRoleData.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email or Username
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email or username"
                  autoComplete="username"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
              
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
                  w-full py-2 rounded-lg font-semibold text-white transition duration-200 
                  disabled:opacity-50 flex items-center justify-center gap-2
                  bg-gradient-to-r ${selectedRoleData.gradient}
                `}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Login as {selectedRoleData.name}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/admin-signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Create Admin Account
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Note: Students, Teachers, and Parents can login with credentials provided by admin
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;