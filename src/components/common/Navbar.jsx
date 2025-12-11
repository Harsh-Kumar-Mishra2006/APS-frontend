// src/sections/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Bell, 
  User, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  Settings,
  Users,
  Home,
  Info,
  ClipboardList,
  Phone,
  Image,
  GraduationCap,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Base navigation items for all users
  const navigationItems = [
    { name: 'Home', href: '/', icon: Home, minWidth: 'md' },
    { name: 'About', href: '/about', icon: Info, minWidth: 'md' },
    { name: 'Admissions', href: '/admissions', icon: GraduationCap, minWidth: 'lg' },
    { name: 'Contact', href: '/contact', icon: Phone, minWidth: 'md' },
    { name: 'Gallery', href: '/gallery', icon: Image, minWidth: 'lg' },
  ];

  // Admin-only navigation items
  const adminNavigationItems = [
    { name: 'Add Members', href: '/add-members', icon: Users , minWidth: 'lg', role: 'admin' },
    { name: 'Add Data', href: '/add-data', icon: FileText, minWidth: 'lg', role: 'admin' },
    { name: 'View Data', href: '/student-data', icon: FileText, minWidth: 'lg', role: 'student' },
    { name: 'View Data', href: '/parent-data', icon: FileText, minWidth: 'lg', role: 'parent' },
    { name: 'View Data', href: '/teacher-data', icon: FileText, minWidth: 'lg', role: 'teacher' },
  ];

  // Get all navigation items based on role
  const getAllNavigationItems = () => {
    const allItems = [...navigationItems];
    
    if (user?.role === 'admin') {
      allItems.push(...adminNavigationItems);
    }
    
    return allItems;
  };

  // Check if link is current page
  const isCurrentPage = (href) => {
    return location.pathname === href;
  };

  // Get visible navigation items based on screen width
  const getVisibleNavigationItems = (screenSize) => {
    const allItems = getAllNavigationItems();
    
    // Filter items based on screen size
    return allItems.filter(item => {
      if (screenSize === 'mobile') return true; // Show all in mobile menu
      
      if (screenSize === 'tablet') {
        // For tablet, show items with minWidth 'md' or less
        return item.minWidth === 'md' || !item.minWidth;
      }
      
      // For desktop, show all items
      return true;
    });
  };

  // Profile menu items
  const getProfileMenuItems = () => {
    const baseItems = [
      {
        href: '/profile',
        icon: User,
        label: 'Profile',
        show: true
      },
      {
        href: '/settings',
        icon: Settings,
        label: 'Settings',
        show: true
      }
    ];

    const roleSpecificItems = [
      {
        href: '/admin/dashboard',
        icon: BarChart3,
        label: 'Admin Dashboard',
        show: user?.role === 'admin'
      }
    ];

    return [...baseItems, ...roleSpecificItems].filter(item => item.show);
  };

  // Role badge colors
  const getRoleBadgeColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
      parent: 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Role display names
  const getRoleDisplayName = (role) => {
    const names = {
      student: 'Student',
      teacher: 'Teacher',
      admin: 'Administrator',
      parent: 'Parent'
    };
    return names[role] || 'User';
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const profileMenuItems = getProfileMenuItems();

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-lg border-b border-blue-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Desktop Navigation */}
          <div className="flex items-center flex-1">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white hidden sm:inline">
                Achievement Public School
              </span>
              <span className="ml-2 text-xl font-bold text-white sm:hidden">
                APS
              </span>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex ml-6 space-x-1 flex-1">
              {getVisibleNavigationItems('desktop').map((item) => {
                const IconComponent = item.icon;
                const isCurrent = isCurrentPage(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
                      isCurrent
                        ? 'bg-blue-800 text-white shadow-inner'
                        : 'text-blue-100 hover:text-white hover:bg-blue-800'
                    }`}
                    title={item.name}
                  >
                    <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Tablet Navigation - Hidden on mobile and desktop */}
            <div className="hidden md:flex lg:hidden ml-4 space-x-1">
              {getVisibleNavigationItems('tablet').map((item) => {
                const IconComponent = item.icon;
                const isCurrent = isCurrentPage(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-2 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      isCurrent
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:text-white hover:bg-blue-800'
                    }`}
                    title={item.name}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Notifications, Profile, Mobile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications */}
            {isAuthenticated && (
              <button className="relative p-1.5 sm:p-2 text-blue-100 hover:text-white transition-colors rounded-lg hover:bg-blue-800">
              </button>
            )}

            {/* Desktop Profile Dropdown */}
            {isAuthenticated && (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center border-2 border-blue-200">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">
                      {user?.name || 'User'}
                    </p>
                    <p className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                      {getRoleDisplayName(user?.role)}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-blue-200" />
                </button>

                {/* Profile Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                        {getRoleDisplayName(user?.role)}
                      </span>
                    </div>
                    
                    {/* Menu Items */}
                    {profileMenuItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-md text-blue-100 hover:text-white hover:bg-blue-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Auth Buttons for non-authenticated users */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-blue-100 hover:text-white font-medium transition-colors text-sm px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors shadow-sm text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-blue-600 py-3 bg-blue-800 shadow-inner">
            {/* Navigation Links */}
            <div className="px-2 space-y-1">
              {getVisibleNavigationItems('mobile').map((item) => {
                const IconComponent = item.icon;
                const isCurrent = isCurrentPage(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      isCurrent
                        ? 'bg-blue-700 text-white shadow-inner'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                    {item.role === 'admin' && (
                      <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Mobile Auth Buttons for non-logged in users */}
              {!isAuthenticated && (
                <div className="px-3 pt-3 pb-2 flex flex-col space-y-2 border-t border-blue-600">
                  <Link
                    to="/login"
                    className="w-full text-center text-blue-100 hover:text-white font-medium transition-colors py-2.5 bg-blue-700 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full bg-yellow-500 text-gray-900 px-4 py-2.5 rounded-lg font-medium hover:bg-yellow-400 transition-colors shadow-sm text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile Profile Section for logged in users */}
              {isAuthenticated && (
                <div className="px-3 pt-4 pb-2 border-t border-blue-600">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center border-2 border-blue-200">
                      <span className="text-white text-lg font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user?.name}</p>
                      <p className="text-blue-200 text-sm truncate">{user?.email}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                        {getRoleDisplayName(user?.role)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Profile Links */}
                  <div className="space-y-1">
                    {profileMenuItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center px-3 py-2.5 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2.5 mt-2 text-red-300 hover:text-red-200 hover:bg-blue-700 rounded-lg transition-colors border-t border-blue-600"
                  >
                    <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tablet Profile Section (visible only on tablet) */}
      {isAuthenticated && (
        <div className="hidden md:flex lg:hidden border-t border-blue-600 bg-blue-800 px-4 py-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center border-2 border-blue-200">
                <span className="text-white text-xs font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium truncate max-w-[100px]">
                  {user?.name || 'User'}
                </p>
                <p className="text-blue-200 text-xs truncate max-w-[100px]">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                to="/profile"
                className="text-blue-100 hover:text-white text-sm px-2 py-1 rounded hover:bg-blue-700"
                title="Profile"
              >
                <User className="h-4 w-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-blue-100 hover:text-white text-sm px-2 py-1 rounded hover:bg-blue-700"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;