// components/ProfilePopup.jsx
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, LogOut, User, Settings, Shield, BookOpen, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePopup = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Handle escape key
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'teacher':
        return <BookOpen className="h-5 w-5" />;
      case 'student':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'from-purple-500 to-pink-500',
      teacher: 'from-green-500 to-teal-500',
      student: 'from-blue-500 to-cyan-500',
      parent: 'from-orange-500 to-red-500'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      teacher: 'bg-green-100 text-green-800',
      student: 'bg-blue-100 text-blue-800',
      parent: 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplayName = (role) => {
    const names = {
      admin: 'Administrator',
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent'
    };
    return names[role] || 'User';
  };

  const handleLogout = () => {
    console.log('🖱️ Logout clicked from popup');
    
    // Show confirmation
    if (window.confirm('Are you sure you want to logout?')) {
      console.log('✅ User confirmed logout');
      
      // Close popup immediately
      onClose();
      
      // Perform logout
      logout();
      
      // Force navigation to home
      navigate('/');
      window.location.href = '/'; // Double ensure navigation
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={popupRef}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-slide-up"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Profile</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Profile Content */}
          <div className="p-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-4 mb-6">
              <div className={`h-20 w-20 rounded-full bg-gradient-to-r ${getRoleColor(user?.role)} flex items-center justify-center shadow-lg`}>
                <span className="text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900">{user?.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                    {getRoleIcon(user?.role)}
                    <span className="ml-1">{getRoleDisplayName(user?.role)}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            {user?.phone && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                <p className="text-sm text-gray-900 font-medium">{user.phone}</p>
              </div>
            )}
            
            {/* Menu Items */}
            <div className="space-y-2">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <User className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                <span className="flex-1">Edit Profile</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              
              <Link
                to="/settings"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <Settings className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                <span className="flex-1">Settings</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              
              <div className="border-t border-gray-100 my-3"></div>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <LogOut className="h-5 w-5 mr-3 text-red-500 group-hover:text-red-600" />
                <span className="flex-1 text-left">Sign Out</span>
                <span className="text-xs text-red-400">→</span>
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <p className="text-xs text-center text-gray-500">
              Achievement Public School Portal
            </p>
          </div>
        </div>
      </div>
      
      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePopup;