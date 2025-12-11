// src/components/forms/AddTeacherForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AddTeacherForm = ({ onTeacherAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    educationalQualifications: [''],
    designation: 'Teacher',
    dateOfAppointment: '',
    subject: '',
    bio: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const designations = [
    'Principal',
    'Vice Principal',
    'Senior Teacher',
    'Teacher',
    'Assistant Teacher',
    'Head of Department',
    'Coordinator'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleQualificationChange = (index, value) => {
    const newQualifications = [...formData.educationalQualifications];
    newQualifications[index] = value;
    setFormData(prev => ({
      ...prev,
      educationalQualifications: newQualifications
    }));
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      educationalQualifications: [...prev.educationalQualifications, '']
    }));
  };

  const removeQualification = (index) => {
    if (formData.educationalQualifications.length > 1) {
      const newQualifications = formData.educationalQualifications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        educationalQualifications: newQualifications
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setProfilePhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('educationalQualifications', JSON.stringify(formData.educationalQualifications.filter(q => q.trim() !== '')));
      submitData.append('designation', formData.designation);
      submitData.append('dateOfAppointment', formData.dateOfAppointment);
      submitData.append('subject', formData.subject);
      submitData.append('bio', formData.bio);
      
      if (profilePhoto) {
        submitData.append('profilePhoto', profilePhoto);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/teachers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Teacher added successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          educationalQualifications: [''],
          designation: 'Teacher',
          dateOfAppointment: '',
          subject: '',
          bio: ''
        });
        setProfilePhoto(null);
        document.getElementById('profilePhoto').value = '';
        onTeacherAdded();
      } else {
        setError(data.error || 'Failed to add teacher');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add New Teacher</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter teacher's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">Optional. Max 5MB. JPG, PNG, GIF allowed.</p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation *
              </label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {designations.map(desig => (
                  <option key={desig} value={desig}>{desig}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Appointment *
              </label>
              <input
                type="date"
                name="dateOfAppointment"
                value={formData.dateOfAppointment}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., Mathematics, Science, English"
              />
            </div>
          </div>
        </div>

        {/* Educational Qualifications */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Educational Qualifications *</h4>
            <button
              type="button"
              onClick={addQualification}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              Add More
            </button>
          </div>
          {formData.educationalQualifications.map((qualification, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={qualification}
                onChange={(e) => handleQualificationChange(index, e.target.value)}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder={`Qualification ${index + 1} (e.g., MSc in Mathematics)`}
              />
              {formData.educationalQualifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQualification(index)}
                  className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Brief description about the teacher (optional)"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Teacher...
              </span>
            ) : (
              'Add Teacher'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacherForm;