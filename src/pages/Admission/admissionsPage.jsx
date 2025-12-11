import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import AdmissionsList from './admissionList';

const AdmissionPage = () => {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState('view');
  const [showAddForm, setShowAddForm] = useState(false);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    gradeLevel: '',
    ageRange: '',
    availableSeats: '',
    feeStructure: '',
    description: '',
    entranceExam: 'No',
    streams: '',
    importantDates: {
      registrationStart: '',
      registrationEnd: '',
      examDate: '',
      resultDate: ''
    }
  });

  const admissionGuidelines = {
    general: [
      'Admissions are open for Pre-Nursery to Grade 12',
      'Academic session begins in April each year',
      'Registration for new academic session starts from January',
      'Age criteria must be strictly followed as per CBSE guidelines'
    ],
    documents: [
      'Birth Certificate (issued by Municipal Corporation)',
      'Aadhaar Card of student and parents',
      'Passport size photographs (4 copies)',
      'Previous year\'s report card (for Grade 1 onwards)',
      'Transfer Certificate (for Grade 2 onwards)',
      'Address proof (Aadhaar Card/Passport/Electricity Bill)'
    ],
    process: [
      'Step 1: Online Registration & Form Submission',
      'Step 2: Entrance Test/Interaction (as applicable)',
      'Step 3: Document Verification',
      'Step 4: Fee Payment & Confirmation',
      'Step 5: Orientation Program for Parents & Students'
    ]
  };

  const gradeLevels = [
    { level: 'Pre-School (Nursery, LKG, UKG)', age: '3-5 years', seats: '60' },
    { level: 'Primary (Grade 1-5)', age: '6-10 years', seats: '120' },
    { level: 'Middle (Grade 6-8)', age: '11-13 years', seats: '90' },
    { level: 'Secondary (Grade 9-10)', age: '14-15 years', seats: '75' },
    { level: 'Senior Secondary (Grade 11-12)', age: '16-17 years', seats: '60', streams: ['Science', 'Commerce', 'Humanities'] }
  ];

  const importantDates = [
    { event: 'Online Application Starts', date: 'January 15, 2026' },
    { event: 'Last Date for Application', date: 'February 28, 2026' },
    { event: 'Entrance Tests (Grade 1-9)', date: 'March 5-10, 2026' },
    { event: 'Interaction (Pre-School)', date: 'March 12-15, 2026' },
    { event: 'Result Declaration', date: 'March 20, 2026' },
    { event: 'Fee Payment Deadline', date: 'March 31, 2026' },
    { event: 'New Session Begins', date: 'April 1, 2026' }
  ];

  const handleApplyNow = () => {
    toast.info('Redirecting to online application portal...');
    setTimeout(() => {
      window.open('https://applications.achievementschool.edu', '_blank');
    }, 1500);
  };

  const handleAddCourse = () => {
    setShowAddForm(true);
    setActiveTab('add');
    // Reset form data
    setFormData({
      courseName: '',
      gradeLevel: '',
      ageRange: '',
      availableSeats: '',
      feeStructure: '',
      description: '',
      entranceExam: 'No',
      streams: '',
      importantDates: {
        registrationStart: '',
        registrationEnd: '',
        examDate: '',
        resultDate: ''
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.courseName.trim() || !formData.gradeLevel.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Admission course added successfully!');
      setShowAddForm(false);
      setActiveTab('view');
      setLoading(false);
      
      // Reset form
      setFormData({
        courseName: '',
        gradeLevel: '',
        ageRange: '',
        availableSeats: '',
        feeStructure: '',
        description: '',
        entranceExam: 'No',
        streams: '',
        importantDates: {
          registrationStart: '',
          registrationEnd: '',
          examDate: '',
          resultDate: ''
        }
      });
    }, 1500);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setActiveTab('view');
    toast.info('Form cancelled');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      importantDates: {
        ...prev.importantDates,
        [name]: value
      }
    }));
  };

  const adminTabs = [
    { id: 'view', label: 'View Admissions', icon: '👁️' },
    { id: 'add', label: 'Add Course', icon: '➕' },
    { id: 'manage', label: 'Manage', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-yellow-400 rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Admissions
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                2026
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Begin your journey towards excellence at Achievement Public School. 
              Admissions now open for the academic session 2026.
            </p>
            {!showAddForm && (
              <button 
                onClick={handleApplyNow}
                className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-pulse"
              >
                🚀 Apply Online Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Controls - Only visible to admin */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
                <p className="text-gray-600">Manage admission courses</p>
              </div>
              {!showAddForm && (
                <button
                  onClick={handleAddCourse}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <span>➕</span> Add New Course
                </button>
              )}
            </div>

            {/* Admin Tabs */}
            {!showAddForm && (
              <div className="flex space-x-2 mb-6">
                {adminTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowAddForm(tab.id === 'add');
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Admission Form */}
          {showAddForm && activeTab === 'add' && (
            <div className="mb-8 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-300">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Add New Admission Course</h3>
                    <p className="text-gray-600 mt-2">Create a new admission course for upcoming batches</p>
                  </div>
                  <button
                    onClick={handleCancelForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ✕ Cancel
                  </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Course Name *
                      </label>
                      <input
                        type="text"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleInputChange}
                        placeholder="e.g., Senior Secondary - Science Stream"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Grade Level */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Grade Level *
                      </label>
                      <select
                        name="gradeLevel"
                        value={formData.gradeLevel}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Grade Level</option>
                        <option value="Pre-School">Pre-School (Nursery, LKG, UKG)</option>
                        <option value="Primary">Primary (Grade 1-5)</option>
                        <option value="Middle">Middle (Grade 6-8)</option>
                        <option value="Secondary">Secondary (Grade 9-10)</option>
                        <option value="Senior Secondary">Senior Secondary (Grade 11-12)</option>
                      </select>
                    </div>

                    {/* Age Range */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Age Range *
                      </label>
                      <input
                        type="text"
                        name="ageRange"
                        value={formData.ageRange}
                        onChange={handleInputChange}
                        placeholder="e.g., 16-17 years"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Available Seats */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Available Seats *
                      </label>
                      <input
                        type="number"
                        name="availableSeats"
                        value={formData.availableSeats}
                        onChange={handleInputChange}
                        placeholder="e.g., 60"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Streams (Optional) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Streams (Optional)
                      </label>
                      <input
                        type="text"
                        name="streams"
                        value={formData.streams}
                        onChange={handleInputChange}
                        placeholder="e.g., Science, Commerce, Humanities"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Entrance Exam Required */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Entrance Exam Required?
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="entranceExam"
                            value="Yes"
                            checked={formData.entranceExam === 'Yes'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-2 text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="entranceExam"
                            value="No"
                            checked={formData.entranceExam === 'No'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-2 text-gray-700">No</span>
                        </label>
                      </div>
                    </div>

                    {/* Fee Structure */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Fee Structure (Annual)
                      </label>
                      <input
                        type="text"
                        name="feeStructure"
                        value={formData.feeStructure}
                        onChange={handleInputChange}
                        placeholder="e.g., ₹85,000 per annum"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the course, curriculum, and special features..."
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Important Dates Section */}
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Important Dates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Registration Start Date
                        </label>
                        <input
                          type="date"
                          name="registrationStart"
                          value={formData.importantDates.registrationStart}
                          onChange={handleDateChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Registration End Date
                        </label>
                        <input
                          type="date"
                          name="registrationEnd"
                          value={formData.importantDates.registrationEnd}
                          onChange={handleDateChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Entrance Exam Date
                        </label>
                        <input
                          type="date"
                          name="examDate"
                          value={formData.importantDates.examDate}
                          onChange={handleDateChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Result Declaration Date
                        </label>
                        <input
                          type="date"
                          name="resultDate"
                          value={formData.importantDates.resultDate}
                          onChange={handleDateChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Admission Course'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      <AdmissionsList/>

      {/* View Admissions Section */}
      {activeTab === 'view' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Admission Courses</h2>
            {/* Admission courses list will go here */}
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No admission courses available</h3>
              <p className="text-gray-500">Add new admission courses using the admin panel</p>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines & Important Dates - Only shown for public view */}
      {!showAddForm && activeTab === 'view' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Rest of your existing content remains the same */}
          {/* ... */}
        </div>
      )}

      {/* CTA Section */}
      {!showAddForm && activeTab === 'view' && (
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Join over 5,000 successful alumni who started their journey at Achievement Public School
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleApplyNow}
                className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                Apply Online for 2026
              </button>
              <button className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-blue-900 transition-all duration-300">
                Download Prospectus
              </button>
            </div>
            <p className="text-blue-300 text-sm mt-6">
              Applications closing soon! Last date: February 28, 2026
            </p>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            🎓 Achievement Public School is affiliated with CBSE, New Delhi. 
            All admissions are subject to availability of seats and fulfillment of eligibility criteria.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdmissionPage;