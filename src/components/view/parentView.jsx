// src/components/view/ParentView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ParentView = ({ refreshTrigger }) => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const parentsPerPage = 8;

  useEffect(() => {
    fetchParents();
  }, [refreshTrigger]);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use the correct endpoint for parents
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/parents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Parents API Response:', response.data);
      
      if (response.data.success) {
        setParents(response.data.data || []);
      } else {
        toast.error(response.data.error || 'Failed to load parents');
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      if (error.response?.status === 404) {
        toast.error('Parents endpoint not found. Please check backend routes.');
      } else {
        toast.error('Failed to load parents data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (parentId) => {
    if (!window.confirm('Are you sure you want to delete this parent? This will also delete their user account.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/parents/${parentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Parent deleted successfully');
        fetchParents(); // Refresh the list
      } else {
        toast.error(response.data.error || 'Failed to delete parent');
      }
    } catch (error) {
      console.error('Error deleting parent:', error);
      toast.error(error.response?.data?.error || 'Failed to delete parent');
    }
  };

  // Filter parents based on search term
  const filteredParents = parents.filter(parent => {
    const parentName = parent.parentName || parent.name || '';
    const parentEmail = parent.parentEmail || parent.email || '';
    const studentName = parent.studentName || '';
    const studentEmail = parent.studentEmail || '';
    
    const searchLower = searchTerm.toLowerCase();
    return (
      parentName.toLowerCase().includes(searchLower) ||
      parentEmail.toLowerCase().includes(searchLower) ||
      studentName.toLowerCase().includes(searchLower) ||
      studentEmail.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const indexOfLastParent = currentPage * parentsPerPage;
  const indexOfFirstParent = indexOfLastParent - parentsPerPage;
  const currentParents = filteredParents.slice(indexOfFirstParent, indexOfLastParent);
  const totalPages = Math.ceil(filteredParents.length / parentsPerPage);

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.toString().replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return cleaned;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Test if API is accessible
  const testApiConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Testing API connection...');
      
      // Test parents endpoint
      const testResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/parents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Test Status:', testResponse.status);
      const testData = await testResponse.json();
      console.log('API Test Response:', testData);
      
      if (!testResponse.ok) {
        console.error('API Error:', testData);
      }
    } catch (error) {
      console.error('API Connection Test Failed:', error);
    }
  };

  // Run test on component mount
  useEffect(() => {
    testApiConnection();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading parents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Parents List</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredParents.length} parent{filteredParents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            onClick={fetchParents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        <div className="font-medium">Debug Info:</div>
        <div>API Base: {import.meta.env.VITE_API_BASE_URL}</div>
        <div>Parents Count: {parents.length}</div>
        <div>Filtered Count: {filteredParents.length}</div>
        <button 
          onClick={testApiConnection}
          className="mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
        >
          Test API Connection
        </button>
      </div>

      {filteredParents.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Parents Found</h4>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No parents match your search criteria.' : 'No parents have been added yet.'}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={fetchParents}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh List
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Parent Info</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Student Info</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentParents.map((parent) => {
                  const parentName = parent.parentName || parent.name || 'N/A';
                  const parentEmail = parent.parentEmail || parent.email || 'N/A';
                  const parentPhone = parent.parentPhone || parent.phone || 'N/A';
                  const occupation = parent.occupation || 'Not specified';
                  const studentName = parent.studentName || 'Not linked';
                  const studentEmail = parent.studentEmail || '';
                  const relationship = parent.relationship || 'Parent';
                  const isActive = parent.isActive !== false;
                  const createdAt = parent.createdAt || parent.createdAt;
                  const isLinked = parent.isLinkedToStudent || parent.linkedStudentId;
                  
                  return (
                    <tr key={parent._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {parent.profilePhoto ? (
                            <img
                              src={`${import.meta.env.VITE_API_BASE_URL || ''}${parent.profilePhoto}`}
                              alt={parentName}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(parentName)}&background=4f46e5&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(parentName)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {parentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {occupation}
                            </div>
                            {createdAt && (
                              <div className="text-xs text-gray-400">
                                Added: {formatDate(createdAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 break-words max-w-xs">{parentEmail}</div>
                        <div className="text-sm text-gray-500">{formatPhoneNumber(parentPhone)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className={`text-sm font-medium ${studentName !== 'Not linked' ? 'text-gray-900' : 'text-gray-400'}`}>
                            {studentName}
                          </div>
                          {studentEmail && (
                            <div className="text-sm text-gray-500">{studentEmail}</div>
                          )}
                          {isLinked && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1 w-fit">
                              Linked ✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {relationship}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Navigate to edit page or show modal
                              console.log('Edit parent:', parent._id);
                              toast.info('Edit feature coming soon');
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(parent._id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200 gap-4">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstParent + 1}-{Math.min(indexOfLastParent, filteredParents.length)} of {filteredParents.length} parents
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 mx-1 rounded ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParentView;