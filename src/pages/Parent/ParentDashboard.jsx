// src/pages/parent/ParentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Calendar,
  Loader,
  User,
  Heart,
  GraduationCap
} from 'lucide-react';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchChildrenData();
  }, []);

  const fetchChildrenData = async () => {
    setLoading(true);
    try {
      // Get parent profile with children
      const response = await api.get('/auth/profile');
      if (response.data.success && response.data.data.parent) {
        const childrenIds = response.data.data.parent.children || [];
        // Fetch details for each child
        const childrenDetails = [];
        for (const childId of childrenIds) {
          const childResponse = await api.get(`/attendance/student/${childId}`);
          if (childResponse.data.success) {
            childrenDetails.push({
              id: childId,
              ...childResponse.data.data.student,
              attendance: childResponse.data.data.attendance,
              summary: childResponse.data.data.summary
            });
          }
        }
        setChildren(childrenDetails);
        if (childrenDetails.length > 0) {
          setSelectedChild(childrenDetails[0]);
          setAttendanceData(childrenDetails[0].attendance);
          setSummary(childrenDetails[0].summary);
        }
      }
    } catch (error) {
      console.error('Error fetching children data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    setAttendanceData(child.attendance);
    setSummary(child.summary);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
              <p className="text-purple-100">Parent Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Children Selection */}
        {children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">My Children</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleChildSelect(child)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedChild?.id === child.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      selectedChild?.id === child.id ? 'bg-white/20' : 'bg-purple-100'
                    }`}>
                      <GraduationCap className={`w-5 h-5 ${
                        selectedChild?.id === child.id ? 'text-white' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">{child.name}</p>
                      <p className={`text-sm ${
                        selectedChild?.id === child.id ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {child.class} - {child.section} | Roll: {child.rollNumber}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Stats for Selected Child */}
        {selectedChild && summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Working Days</p>
                    <p className="text-2xl font-bold text-gray-800">{summary.totalWorkingDays}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Days Present</p>
                    <p className="text-2xl font-bold text-green-600">{summary.totalPresent}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Days Absent</p>
                    <p className="text-2xl font-bold text-red-600">{summary.totalAbsent}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Attendance %</p>
                    <p className="text-2xl font-bold text-purple-600">{summary.overallPercentage}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-sm font-semibold text-purple-600">
                  {selectedChild.name}'s Overall Attendance
                </span>
                <span className="text-sm font-semibold text-purple-600">
                  {summary.overallPercentage}%
                </span>
              </div>
              <div className="overflow-hidden h-2 flex rounded bg-purple-100">
                <div 
                  style={{ width: `${summary.overallPercentage}%` }}
                  className="bg-purple-500 transition-all duration-500"
                ></div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Attendance History - {selectedChild.name}
                </h2>
              </div>
              {attendanceData && attendanceData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendanceData.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.month}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.year}</td>
                          <td className="px-6 py-4 text-sm text-green-600">{record.daysPresent}</td>
                          <td className="px-6 py-4 text-sm text-red-600">{record.daysAbsent}</td>
                          <td className="px-6 py-4 text-sm font-semibold">{record.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No attendance records found</p>
                </div>
              )}
            </div>
          </>
        )}

        {children.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Children Linked</h3>
            <p className="text-gray-600">
              Your children's information will appear here once linked by the admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;