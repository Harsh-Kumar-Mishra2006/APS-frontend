import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  User, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  Settings,
  Users,
  Home,
  Info,
  Phone,
  Image,
  GraduationCap,
  BarChart3,
  FileText,
  PlusCircle,
  CalendarCheck,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [hiddenItems, setHiddenItems] = useState([]);
  const navRef = useRef(null);
  const itemsRef = useRef({});
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Define all navigation items
  const getAllNavigationItems = () => {
    const publicItems = [
      { name: 'Home', href: '/', icon: Home },
      { name: 'About', href: '/about', icon: Info },
      { name: 'Admissions', href: '/admissions', icon: GraduationCap },
      { name: 'Gallery', href: '/gallery', icon: Image },
      { name: 'Contact', href: '/contact', icon: Phone },
    ];

    const adminItems = [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Add Members', href: '/add-members', icon: PlusCircle },
      { name: 'Add Attendance', href: '/add-attendance', icon: CalendarCheck },
      { name: 'Fee Management', href: '/fee-management', icon: BarChart3 },
      { name: 'Result Management', href: '/result-management', icon: FileText },
    ];

    if (user?.role === 'admin') {
      return [...publicItems, ...adminItems];
    }
    
    return publicItems;
  };

  // Handle responsive overflow
  useEffect(() => {
    const handleResize = () => {
      if (!navRef.current) return;
      
      const container = navRef.current;
      const containerWidth = container.offsetWidth;
      let totalWidth = 0;
      const visible = [];
      const hidden = [];
      const allItems = getAllNavigationItems();

      // Calculate available width (reserve space for logo, profile, menu button)
      const reservedWidth = 300; // Space for logo + profile + menu button
      const availableWidth = containerWidth - reservedWidth;

      // Measure each item and determine what fits
      allItems.forEach((item) => {
        const itemElement = itemsRef.current[item.href];
        if (itemElement) {
          const itemWidth = itemElement.offsetWidth + 16; // width + margin
          if (totalWidth + itemWidth <= availableWidth) {
            totalWidth += itemWidth;
            visible.push(item);
          } else {
            hidden.push(item);
          }
        } else {
          // If element not measured yet, assume default width
          const estimatedWidth = 100;
          if (totalWidth + estimatedWidth <= availableWidth) {
            totalWidth += estimatedWidth;
            visible.push(item);
          } else {
            hidden.push(item);
          }
        }
      });

      setVisibleItems(visible);
      setHiddenItems(hidden);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

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

  const isCurrentPage = (href) => location.pathname === href;

  const getRoleBadgeColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
      parent: 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

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

  const profileMenuItems = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-lg border-b border-blue-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always visible */}
          <div className="flex-shrink-0 flex items-center">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white hidden sm:inline">
              Achievement Public School
            </span>
            <span className="ml-2 text-xl font-bold text-white sm:hidden">
              APS
            </span>
          </div>

          {/* Desktop Navigation - Handles overflow automatically */}
          <div className="hidden lg:flex items-center justify-end flex-1 ml-6" ref={navRef}>
            <div className="flex items-center space-x-1">
              {/* Visible items */}
              {visibleItems.map((item) => {
                const IconComponent = item.icon;
                const isCurrent = isCurrentPage(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    ref={(el) => (itemsRef.current[item.href] = el)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
                      isCurrent
                        ? 'bg-blue-800 text-white shadow-inner'
                        : 'text-blue-100 hover:text-white hover:bg-blue-800'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Dropdown for hidden items */}
              {hiddenItems.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-blue-100 hover:text-white hover:bg-blue-800 transition-colors"
                  >
                    More
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {hiddenItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <IconComponent className="h-4 w-4 mr-3" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Auth & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAuthenticated ? (
              <>
                {/* Desktop Profile Dropdown */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-blue-800 transition-colors"
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

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                          {getRoleDisplayName(user?.role)}
                        </span>
                      </div>
                      
                      {profileMenuItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <IconComponent className="h-4 w-4 mr-3" />
                            {item.label}
                          </Link>
                        );
                      })}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login" className="text-blue-100 hover:text-white font-medium px-3 py-1.5">
                  Log in
                </Link>
                <Link to="/signup" className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-1.5 rounded-md text-blue-100 hover:text-white hover:bg-blue-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Scrollable */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-blue-600 py-3 bg-blue-800 shadow-inner max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="px-2 space-y-1">
              {getAllNavigationItems().map((item) => {
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
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <div className="px-3 pt-3 pb-2 flex flex-col space-y-2 border-t border-blue-600">
                  <Link to="/login" className="w-full text-center text-blue-100 py-2.5 bg-blue-700 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/signup" className="w-full bg-yellow-500 text-gray-900 py-2.5 rounded-lg font-medium text-center" onClick={() => setIsMenuOpen(false)}>
                    Sign up
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="px-3 pt-4 pb-2 border-t border-blue-600">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user?.name}</p>
                      <p className="text-blue-200 text-sm truncate">{user?.email}</p>
                    </div>
                  </div>
                  
                  {profileMenuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center px-3 py-2.5 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconComponent className="h-5 w-5 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}
                  
                  <button onClick={handleLogout} className="flex items-center w-full px-3 py-2.5 mt-2 text-red-300 hover:text-red-200 hover:bg-blue-700 rounded-lg">
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;