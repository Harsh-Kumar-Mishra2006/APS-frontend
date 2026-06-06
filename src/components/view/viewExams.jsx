// src/components/view/ViewExams.jsx
import React from 'react';
import { Calendar, BookOpen, Award, Loader, AlertCircle } from 'lucide-react';

const ViewExams = ({ exams = [], examsLoading = false }) => {
  if (examsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading exams...</span>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Exams Found</h3>
        <p className="text-gray-500">
          Click the "Initialize Exams" button above to create predefined exams for the academic year.
        </p>
      </div>
    );
  }

  // Group exams by year
  const examsByYear = exams.reduce((acc, exam) => {
    if (!acc[exam.examYear]) {
      acc[exam.examYear] = [];
    }
    acc[exam.examYear].push(exam);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(examsByYear).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {sortedYears.map(year => (
        <div key={year}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Academic Year {year}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examsByYear[year].map((exam, index) => (
              <div key={exam.id || index} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{exam.examType}</h4>
                    {exam.term && (
                      <p className="text-xs text-purple-600 mt-1">{exam.term}</p>
                    )}
                  </div>
                  <div className="bg-purple-100 rounded-full px-2 py-1">
                    <span className="text-xs font-medium text-purple-700">
                      {exam.weightage}% weightage
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </p>
                  {exam.description && (
                    <p className="text-xs text-gray-500 mt-2">{exam.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-center gap-2 text-blue-800">
          <BookOpen className="w-4 h-4" />
          <span className="font-medium">Total Exams Available: {exams.length}</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          These are predefined exams for the academic year. Results can be added for any of these exams.
        </p>
      </div>
    </div>
  );
};

export default ViewExams;