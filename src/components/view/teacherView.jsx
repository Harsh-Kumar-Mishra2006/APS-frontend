// src/components/view/TeacherView.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const TeacherView = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, [refreshTrigger]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTeachers(data.data);
      } else {
        setError(data.error || 'Failed to fetch teachers');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDesignationColor = (designation) => {
    const colors = {
      'Principal': 'bg-red-100 text-red-800',
      'Vice Principal': 'bg-orange-100 text-orange-800',
      'Senior Teacher': 'bg-purple-100 text-purple-800',
      'Head of Department': 'bg-blue-100 text-blue-800',
      'Coordinator': 'bg-green-100 text-green-800',
      'Teacher': 'bg-gray-100 text-gray-800',
      'Assistant Teacher': 'bg-yellow-100 text-yellow-800'
    };
    return colors[designation] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading teachers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Registered Teachers</h3>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {teachers.length} {teachers.length === 1 ? 'Teacher' : 'Teachers'}
        </span>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-gray-600 mb-2">No Teachers Yet</h4>
          <p className="text-gray-500">Start by adding the first teacher to your school.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Header with Photo/Initials */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center space-x-4">
                  {teacher.profilePhoto ? (
                    <img
                      src={`http://localhost:3000${teacher.profilePhoto}`}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {getInitials(teacher.name)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold">{teacher.name}</h4>
                    <p className="text-blue-100">{teacher.email}</p>
                  </div>
                </div>
              </div>

              {/* Teacher Details */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDesignationColor(teacher.designation)}`}>
                      {teacher.designation}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(teacher.dateOfAppointment).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Subject</h5>
                  <p className="text-gray-900 font-medium">{teacher.subject}</p>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Contact</h5>
                  <p className="text-gray-600">{teacher.phone}</p>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Qualifications</h5>
                  <div className="space-y-1">
                    {teacher.educationalQualifications.map((qual, index) => (
                      <p key={index} className="text-sm text-gray-600">• {qual}</p>
                    ))}
                  </div>
                </div>

                {teacher.bio && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Bio</h5>
                    <p className="text-sm text-gray-600 line-clamp-2">{teacher.bio}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Added on {new Date(teacher.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherView;