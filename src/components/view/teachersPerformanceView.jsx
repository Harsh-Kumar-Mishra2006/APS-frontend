// src/view/teacherPerformanceView.jsx
import React, { useState, useEffect } from 'react';
import { useTeacherPerformance } from '../../hooks/useTeacherPerformance';

const TeacherPerformanceView = () => {
  const [teacherEmail, setTeacherEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    teacherInfo,
    performanceReviews,
    performanceSummary,
    loading,
    getReviewsByFilter,
    refresh,
    getMonths,
    getReviewCategories,
    getScoreCategories,
    getScoreColor,
    getScoreGrade,
    formatMonthYear,
    formatDate,
    formatScore
  } = useTeacherPerformance(teacherEmail);

  const months = getMonths();
  const reviewCategories = getReviewCategories();
  const scoreCategories = getScoreCategories();
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!teacherEmail) {
      setError('Please enter teacher email');
      return;
    }
    
    setSearching(true);
    setError('');
    
    try {
      await refresh();
      setFilterCategory('');
      setFilterMonth('');
      setFilterYear('');
    } catch (err) {
      setError(err.message || 'Failed to fetch teacher data');
    } finally {
      setSearching(false);
    }
  };

  const handleFilter = async () => {
    if (!teacherEmail) {
      setError('Please search for a teacher first');
      return;
    }
    
    try {
      const filters = {};
      if (filterCategory) filters.category = filterCategory;
      if (filterMonth) filters.month = filterMonth;
      if (filterYear) filters.year = parseInt(filterYear);
      
      const result = await getReviewsByFilter(filters);
      if (result.success) {
        // Filter is handled by the hook
      }
    } catch (err) {
      setError(err.message || 'Failed to filter reviews');
    }
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterMonth('');
    setFilterYear('');
    refresh();
  };

  const filteredReviews = performanceReviews.filter(review => {
    if (filterCategory && review.category !== filterCategory) return false;
    if (filterMonth && review.month !== filterMonth) return false;
    if (filterYear && review.year !== parseInt(filterYear)) return false;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const monthOrder = months.map(m => m.value);
    const monthDiff = monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    if (monthDiff !== 0) return monthDiff;
    return b.year - a.year;
  });

  const viewReviewDetails = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const getCategoryColor = (category) => {
    const categoryObj = reviewCategories.find(c => c.value === category);
    return categoryObj ? categoryObj.color : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Find Teacher Performance</h2>
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
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>

      {teacherInfo ? (
        <>
          {/* Teacher Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{teacherInfo.name}</h2>
                <p className="text-gray-600">{teacherInfo.email} • {teacherInfo.designation}</p>
              </div>
              {performanceSummary && (
                <div className="text-right">
                  <div className={`text-lg font-bold px-4 py-2 rounded-lg ${getScoreColor(performanceSummary.overallScore)}`}>
                    Overall Performance: {formatScore(performanceSummary.overallScore)}/10
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {performanceSummary.grade} • {performanceSummary.reviewCount} reviews
                  </p>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {reviewCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Month
                </label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Months</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleFilter}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-1"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {sortedReviews.length}
                </div>
                <div className="text-sm text-blue-600">Total Reviews</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {performanceSummary ? formatScore(performanceSummary.overallScore) : '0.0'}
                </div>
                <div className="text-sm text-green-600">Average Score</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">
                  {reviewCategories.filter(cat => 
                    sortedReviews.some(review => review.category === cat.value)
                  ).length}
                </div>
                <div className="text-sm text-purple-600">Review Types</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">
                  {performanceSummary ? performanceSummary.grade : 'N/A'}
                </div>
                <div className="text-sm text-yellow-600">Current Grade</div>
              </div>
            </div>
          </div>

          {/* Performance Reviews Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Performance Reviews</h3>
              <p className="text-gray-600 text-sm">
                Showing {sortedReviews.length} review{sortedReviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {sortedReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">No performance reviews found for this teacher.</p>
                {filterCategory || filterMonth || filterYear ? (
                  <p className="text-gray-500 text-sm mt-2">Try clearing your filters or adding new reviews.</p>
                ) : null}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month/Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Review Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reviewed On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedReviews.map((review, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {formatMonthYear(review.month, review.year)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(review.category)}`}>
                            {reviewCategories.find(c => c.value === review.category)?.label || review.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-bold px-3 py-1 rounded ${getScoreColor(review.overallScore)}`}>
                            {formatScore(review.overallScore)}/10
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium">{getScoreGrade(review.overallScore)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(review.reviewedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewReviewDetails(review)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teacher Selected</h3>
          <p className="text-gray-600">
            Enter a teacher email and click Search to view their performance reviews.
          </p>
        </div>
      )}

      {/* Review Details Modal */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Performance Review Details - {formatMonthYear(selectedReview.month, selectedReview.year)}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {/* Review Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(selectedReview.category)}`}>
                    {reviewCategories.find(c => c.value === selectedReview.category)?.label || selectedReview.category}
                  </span>
                </div>
                <div className={`text-3xl font-bold p-4 rounded ${getScoreColor(selectedReview.overallScore)}`}>
                  {formatScore(selectedReview.overallScore)}/10
                </div>
              </div>
              
              {/* Overall Grade */}
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {getScoreGrade(selectedReview.overallScore)}
                </div>
                <p className="text-gray-600">Overall Performance Grade</p>
              </div>
              
              {/* Detailed Scores */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Detailed Scores</h4>
                <div className="space-y-3">
                  {scoreCategories.map(category => (
                    <div key={category.key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{category.label}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(selectedReview.scores[category.key] / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm ${getScoreColor(selectedReview.scores[category.key])}`}>
                          {formatScore(selectedReview.scores[category.key])}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Strengths */}
              {selectedReview.strengths && selectedReview.strengths.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.strengths.map((strength, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Areas of Improvement */}
              {selectedReview.areasOfImprovement && selectedReview.areasOfImprovement.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Areas of Improvement</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.areasOfImprovement.map((area, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Feedback */}
              {selectedReview.feedback && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Feedback</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.feedback}</p>
                  </div>
                </div>
              )}
              
              {/* Review Metadata */}
              <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
                <p>Reviewed on: {formatDate(selectedReview.reviewedAt)}</p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPerformanceView;