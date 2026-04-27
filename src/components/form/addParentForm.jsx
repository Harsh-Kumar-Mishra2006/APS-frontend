// src/components/forms/AddParentForm.jsx
import React, { useState } from 'react';
import api from '../../utils/api';
import { X, Loader, Plus, Trash2 } from 'lucide-react';

const AddParentForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    occupation: '',
    address: '',
    children: [] // Will store student IDs
  });
  const [childInput, setChildInput] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const addChild = () => {
    if (childInput && !formData.children.includes(childInput)) {
      setFormData({
        ...formData,
        children: [...formData.children, childInput]
      });
      setChildInput('');
    }
  };

  const removeChild = (childId) => {
    setFormData({
      ...formData,
      children: formData.children.filter(c => c !== childId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['name', 'email', 'username', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/add-parent', formData);
      
      if (response.data.success) {
        onSuccess(
          response.data.message,
          response.data.data.temporaryPassword
        );
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add parent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Parent/Guardian</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Personal Information</h3>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Robert Smith"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="parent@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="parent123"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Software Engineer"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Parent's Address"
            ></textarea>
          </div>

          {/* Children Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2 mt-2">Children Information</h3>
            <p className="text-sm text-gray-600 mb-3">
              Add student IDs to link children to this parent. You can add multiple students.
            </p>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={childInput}
                onChange={(e) => setChildInput(e.target.value)}
                placeholder="Enter Student ID (e.g., STU2024001)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addChild}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {formData.children.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Linked Children:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.children.map((child, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm font-mono">{child}</span>
                      <button
                        type="button"
                        onClick={() => removeChild(child)}
                        className="hover:text-purple-900 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Adding Parent...
              </>
            ) : (
              'Add Parent'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddParentForm;