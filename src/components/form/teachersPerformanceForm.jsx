// src/form/teacherPerformanceForm.jsx
import React, { useState } from 'react';
import { useTeacherPerformance } from '../../hooks/useTeacherPerformance';
import teacherPerformanceApi from '../../utils/teacherPerformanceAPI'; // Import API directly

const TeacherPerformanceForm = () => {
  const [teacherEmail, setTeacherEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    category: 'principal',
    month: '',
    year: new Date().getFullYear(),
    scores: {
      punctuality: 8,
      subjectKnowledge: 8,
      teachingMethodology: 8,
      classManagement: 8,
      studentEngagement: 8,
      communicationSkills: 8,
      assessmentQuality: 8,
      professionalDevelopment: 8
    },
    feedback: '',
    strengths: [''],
    areasOfImprovement: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { 
    teacherInfo, 
    addPerformanceReview, 
    refresh
  } = useTeacherPerformance(teacherEmail);

  // Get helper functions directly from the API
  const months = teacherPerformanceApi.getMonths();
  const reviewCategories = teacherPerformanceApi.getReviewCategories();
  const scoreCategories = teacherPerformanceApi.getScoreCategories();
  const calculateOverallScore = teacherPerformanceApi.calculateOverallScore;
  const getScoreGrade = teacherPerformanceApi.getScoreGrade;
  const getScoreColor = teacherPerformanceApi.getScoreColor;
  const formatMonthYear = teacherPerformanceApi.formatMonthYear;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!teacherEmail) {
      setMessage({ type: 'error', text: 'Please enter teacher email' });
      return;
    }
    
    setSearching(true);
    setMessage({ type: '', text: '' });
    
    try {
      await refresh();
      setMessage({ type: 'success', text: 'Teacher found! You can now add performance review.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to find teacher' });
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name in formData.scores) {
      setFormData(prev => ({
        ...prev,
        scores: {
          ...prev.scores,
          [name]: Math.min(10, Math.max(0, Number(value) || 0))
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleScoreChange = (category, value) => {
    const numValue = Math.min(10, Math.max(0, Number(value) || 0));
    setFormData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [category]: numValue
      }
    }));
  };

  const handleArrayFieldChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!teacherInfo) {
      setMessage({ type: 'error', text: 'Please search for a teacher first' });
      return;
    }
    
    if (!formData.month) {
      setMessage({ type: 'error', text: 'Please select a month' });
      return;
    }
    
    // Filter out empty strengths and areas of improvement
    const filteredStrengths = formData.strengths.filter(strength => strength.trim() !== '');
    const filteredAreas = formData.areasOfImprovement.filter(area => area.trim() !== '');
    
    const reviewData = {
      ...formData,
      strengths: filteredStrengths,
      areasOfImprovement: filteredAreas,
      feedback: formData.feedback.trim()
    };
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await addPerformanceReview(reviewData);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Performance review for ${formatMonthYear(formData.month, formData.year)} added successfully!` 
        });
        setFormData({
          category: 'principal',
          month: '',
          year: new Date().getFullYear(),
          scores: {
            punctuality: 8,
            subjectKnowledge: 8,
            teachingMethodology: 8,
            classManagement: 8,
            studentEngagement: 8,
            communicationSkills: 8,
            assessmentQuality: 8,
            professionalDevelopment: 8
          },
          feedback: '',
          strengths: [''],
          areasOfImprovement: ['']
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add performance review' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to add performance review' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall score using the imported function
  const overallScore = calculateOverallScore(formData.scores);
  const grade = getScoreGrade(overallScore);
  const scoreColor = getScoreColor(overallScore);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Teacher Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Find Teacher</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher Email
            </label>
            <input
              type="email"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
              placeholder="Enter teacher email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="pt-6">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Review Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Add Performance Review
          {teacherInfo && (
            <span className="ml-2 text-blue-600 font-normal">
              for {teacherInfo.name}
            </span>
          )}
        </h2>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {teacherInfo ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Type *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {reviewCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month *
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="2000"
                  max="2050"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Performance Scores */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Performance Evaluation Scores (0-10)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scoreCategories.map(category => (
                  <div key={category.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {category.label}
                        </label>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={formData.scores[category.key] || 0}
                          onChange={(e) => handleScoreChange(category.key, e.target.value)}
                          className="w-32"
                        />
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={formData.scores[category.key] || 0}
                          onChange={(e) => handleScoreChange(category.key, e.target.value)}
                          className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Score: {formData.scores[category.key] || 0}/10</span>
                      <span className={`px-2 py-1 rounded ${getScoreColor(formData.scores[category.key] || 0)}`}>
                        {getScoreGrade(formData.scores[category.key] || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Score Summary */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Overall Performance</h4>
                    <p className="text-gray-600">Based on all evaluation criteria</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold p-4 rounded-full ${scoreColor} w-24 h-24 flex flex-col items-center justify-center`}>
                      <span>{overallScore.toFixed(1)}</span>
                      <span className="text-sm font-normal">/10</span>
                    </div>
                    <div className="mt-2 text-lg font-semibold text-gray-900">{grade}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Strengths
                <button
                  type="button"
                  onClick={() => addArrayField('strengths')}
                  className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Another
                </button>
              </h3>
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => handleArrayFieldChange('strengths', index, e.target.value)}
                    placeholder="Enter a strength..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.strengths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('strengths', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Areas of Improvement */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Areas of Improvement
                <button
                  type="button"
                  onClick={() => addArrayField('areasOfImprovement')}
                  className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Another
                </button>
              </h3>
              {formData.areasOfImprovement.map((area, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => handleArrayFieldChange('areasOfImprovement', index, e.target.value)}
                    placeholder="Enter an area for improvement..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.areasOfImprovement.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('areasOfImprovement', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Feedback</h3>
              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide additional feedback, observations, or recommendations..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    category: 'principal',
                    month: '',
                    year: new Date().getFullYear(),
                    scores: {
                      punctuality: 8,
                      subjectKnowledge: 8,
                      teachingMethodology: 8,
                      classManagement: 8,
                      studentEngagement: 8,
                      communicationSkills: 8,
                      assessmentQuality: 8,
                      professionalDevelopment: 8
                    },
                    feedback: '',
                    strengths: [''],
                    areasOfImprovement: ['']
                  });
                  setMessage({ type: '', text: '' });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.month}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Performance Review'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-600">
              Enter a teacher email and click Search to begin adding performance review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPerformanceForm;