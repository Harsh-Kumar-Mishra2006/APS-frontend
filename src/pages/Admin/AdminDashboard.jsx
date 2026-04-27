// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  ChalkboardUser, 
  Heart,
  Calendar,
  BarChart3,
  PlusCircle,
  Settings,
  UserPlus
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Students', value: '0', icon: GraduationCap, color: 'blue', link: '/users?role=student' },
    { label: 'Total Teachers', value: '0', icon: ChalkboardUser, color: 'green', link: '/users?role=teacher' },
    { label: 'Total Parents', value: '0', icon: Heart, color: 'purple', link: '/users?role=parent' },
    { label: 'Total Users', value: '0', icon: Users, color: 'orange', link: '/users' },
  ];

  const quickActions = [
    { label: 'Add Student', icon: GraduationCap, color: 'blue', link: '/add-members', tab: 'student' },
    { label: 'Add Teacher', icon: ChalkboardUser, color: 'green', link: '/add-members', tab: 'teacher' },
    { label: 'Add Parent', icon: Heart, color: 'purple', link: '/add-members', tab: 'parent' },
    { label: 'Mark Attendance', icon: Calendar, color: 'indigo', link: '/attendance' },
    { label: 'View Reports', icon: BarChart3, color: 'red', link: '/reports' },
    { label: 'Manage Users', icon: Settings, color: 'gray', link: '/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100 mt-2">Welcome back, {user?.name}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  state={{ activeTab: action.tab }}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className={`p-2 bg-${action.color}-100 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <span className="font-medium text-gray-700">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <div className="p-6 text-center text-gray-500">
            <PlusCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;