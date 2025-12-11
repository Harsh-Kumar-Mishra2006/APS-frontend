// src/components/form/AddParentForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AddParentForm = ({ onParentAdded }) => {
  const { addParent } = useAuth();
  const [formData, setFormData] = useState({
    // Parent Information (REQUIRED)
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: 'Father',
    occupation: '',
    
    // Address fields
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Student Information (OPTIONAL - for linking to existing student)
    studentName: '',
    studentEmail: '',
    studentRollNumber: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: 'Father'
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState('new'); // 'new' or 'link'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searching, setSearching] = useState(false);

  // Search for existing students
  const searchStudents = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/parents/search/students?search=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchStudents(query);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setFormData(prev => ({
      ...prev,
      studentName: student.name,
      studentEmail: student.email,
      studentRollNumber: student.rollNumber
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setProfilePhoto(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Parent validation (REQUIRED)
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!formData.parentEmail.trim()) newErrors.parentEmail = 'Parent email is required';
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Phone number is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.parentEmail && !emailRegex.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (formData.parentPhone && !phoneRegex.test(formData.parentPhone.replace(/\D/g, ''))) {
      newErrors.parentPhone = 'Please enter a valid 10-digit phone number';
    }
    
    // Emergency contact validation
    if (formData.emergencyContactPhone && !phoneRegex.test(formData.emergencyContactPhone.replace(/\D/g, ''))) {
      newErrors.emergencyContactPhone = 'Please enter a valid 10-digit emergency phone number';
    }
    
    // Student validation (OPTIONAL - only if provided)
    if (formData.studentEmail && formData.studentEmail.trim() && !emailRegex.test(formData.studentEmail)) {
      newErrors.studentEmail = 'Please enter a valid student email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData
      const formDataToSend = new FormData();
      
      // Append parent fields (REQUIRED)
      formDataToSend.append('parentName', formData.parentName);
      formDataToSend.append('parentEmail', formData.parentEmail);
      formDataToSend.append('parentPhone', formData.parentPhone);
      formDataToSend.append('relationship', formData.relationship);
      formDataToSend.append('occupation', formData.occupation || '');
      
      // Address should be JSON string
      const addressObj = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      };
      formDataToSend.append('address', JSON.stringify(addressObj));
      
      // Emergency contact (REQUIRED by backend)
      const emergencyContactObj = {
        name: formData.emergencyContactName || `${formData.parentName} (Emergency)`,
        phone: formData.emergencyContactPhone || formData.parentPhone,
        relationship: formData.emergencyContactRelationship || formData.relationship
      };
      formDataToSend.append('emergencyContact', JSON.stringify(emergencyContactObj));
      
      // Append student fields only if provided (OPTIONAL)
      if (formData.studentName && formData.studentName.trim()) {
        formDataToSend.append('studentName', formData.studentName);
      }
      if (formData.studentEmail && formData.studentEmail.trim()) {
        formDataToSend.append('studentEmail', formData.studentEmail);
      }
      if (formData.studentRollNumber && formData.studentRollNumber.trim()) {
        formDataToSend.append('studentRollNumber', formData.studentRollNumber);
      }
      
      // Append profile photo if selected
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      console.log('FormData being sent:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value instanceof File ? `${value.name} (${value.type})` : value);
      }

      // Use AuthContext
      const result = await addParent(formDataToSend);
        
      if (result.success) {
        const message = selectedStudent 
          ? 'Parent added and linked to student successfully!'
          : 'Parent added successfully!';
        toast.success(message);
        
        // Reset form
        setFormData({
          parentName: '',
          parentEmail: '',
          parentPhone: '',
          relationship: 'Father',
          occupation: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          studentName: '',
          studentEmail: '',
          studentRollNumber: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelationship: 'Father'
        });
        setProfilePhoto(null);
        setSelectedStudent(null);
        setSearchQuery('');
        setSearchResults([]);
        setMode('new');
        document.getElementById('profilePhoto').value = '';
        
        if (onParentAdded) {
          onParentAdded();
        }
      } else {
        toast.error(result.error || 'Failed to add parent');
      }
    } catch (error) {
      console.error('Error adding parent:', error);
      toast.error(error.message || 'Failed to add parent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Parent</h3>
      
      {/* Mode Selection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Link to existing student?</h4>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => {
              setMode('new');
              setSelectedStudent(null);
              setFormData(prev => ({
                ...prev,
                studentName: '',
                studentEmail: '',
                studentRollNumber: ''
              }));
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'new' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Add Parent Only
          </button>
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'link' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Link to Existing Student
          </button>
        </div>
        
        {/* Explanation */}
        <p className="mt-3 text-sm text-gray-600">
          {mode === 'new' 
            ? "Add a parent account. Student can be linked later when registered."
            : "Search and link to an existing student. Student must already be registered."
          }
        </p>
      </div>
      
      {/* Student Search (Only in link mode) */}
      {mode === 'link' && (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Search Student</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by name, email, or roll number
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Start typing to search students..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searching && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg">
              {searchResults.map(student => (
                <div
                  key={student._id}
                  onClick={() => handleSelectStudent(student)}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedStudent?._id === student._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Class: {student.class}-{student.section} • Roll: {student.rollNumber}
                      </div>
                    </div>
                    {selectedStudent?._id === student._id && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Selected Student Info */}
          {selectedStudent && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-green-800">
                  Linked to: <strong>{selectedStudent.name}</strong> ({selectedStudent.class}-{selectedStudent.section})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setFormData(prev => ({
                    ...prev,
                    studentName: '',
                    studentEmail: '',
                    studentRollNumber: ''
                  }));
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove link
              </button>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parent Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Parent Information (Required)</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Name *
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.parentName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter parent's full name"
              />
              {errors.parentName && (
                <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter occupation"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Email Address *
              </label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter parent email address"
              />
              {errors.parentEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.parentEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Phone Number *
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.parentPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit phone number"
              />
              {errors.parentPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.parentPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter street address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter state"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter ZIP code"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Emergency Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Emergency contact name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Phone Number
              </label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Emergency phone number"
              />
              {errors.emergencyContactPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship to Student
              </label>
              <select
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Profile Photo */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Photo</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo (Optional)
            </label>
            <input
              id="profilePhoto"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
            {profilePhoto && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {profilePhoto.name}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Parent...
              </div>
            ) : (
              selectedStudent ? 'Add Parent & Link to Student' : 'Add Parent'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddParentForm;