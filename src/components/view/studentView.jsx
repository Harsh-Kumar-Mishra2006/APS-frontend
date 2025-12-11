// src/components/view/StudentView.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const StudentView = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${import.meta.env.VITE_API_BASE_URL}/api/students?page=${page}&limit=10`;
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      if (selectedClass) {
        url += `&class=${selectedClass}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStudents(data.data);
        setPagination(data.pagination);
        
        // Extract unique classes for filter
        const uniqueClasses = [...new Set(data.data.map(student => student.class))];
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Student deleted successfully');
        fetchStudents();
      } else {
        alert(data.error || 'Failed to delete student');
      }
    } catch (error) {
      alert('Error deleting student');
      console.error('Delete error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, roll number..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                fetchStudents(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('');
                fetchStudents(1);
              }}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.663 0-1.313.103-1.924.296M12 4.354A4 4 0 0012 14m0 0a4 4 0 004-4m-4 4a4 4 0 01-4-4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Found</h3>
          <p className="text-gray-500">Add your first student using the form above.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold">{pagination.total}</div>
              <div className="text-sm opacity-90">Total Students</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold">
                {students.filter(s => s.gender === 'Male').length}
              </div>
              <div className="text-sm opacity-90">Male Students</div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold">
                {students.filter(s => s.gender === 'Female').length}
              </div>
              <div className="text-sm opacity-90">Female Students</div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => (
              <div key={student._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {student.profilePhoto ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL}${student.profilePhoto}`} 
                          alt={student.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-white shadow flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{student.name}</h3>
                      <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          student.gender === 'Male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : student.gender === 'Female'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.gender}
                        </span>
                        <span className="text-sm text-gray-600">
                          Age: {calculateAge(student.dateOfBirth)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </label>
                    <p className="text-sm text-gray-900">{student.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class & Section
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {student.class}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                        Section {student.section}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent
                    </label>
                    <p className="text-sm text-gray-900">{student.parentName}</p>
                    <p className="text-sm text-gray-600">{student.parentEmail}</p>
                    <p className="text-sm text-gray-600">{student.parentPhone}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admission Date
                    </label>
                    <p className="text-sm text-gray-900">{formatDate(student.admissionDate)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                    
                    <button
                      onClick={() => alert('Edit functionality coming soon!')}
                      className="px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <button
                onClick={() => fetchStudents(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {pagination.current} of {pagination.pages}
              </span>
              
              <button
                onClick={() => fetchStudents(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentView;