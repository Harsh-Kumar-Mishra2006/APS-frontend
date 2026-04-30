import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X, Eye, EyeOff, Copy, CheckCircle, Loader, Mail, Phone, User, Key, Briefcase, BookOpen, MapPin } from 'lucide-react';

const ViewTeachers = ({ onClose }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('auth/users?role=teacher');
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (userId) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTemporaryPassword = (user) => {
    // This would need to be stored or retrieved from backend
    return 'temp123456'; // Placeholder - you should store this
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📚 Teachers List</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Login Credentials</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Professional</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-500">ID: {teacher.teacher?.teacherId}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{teacher.email}</span>
                      <button onClick={() => copyToClipboard(teacher.email, `email-${teacher.id}`)}>
                        {copiedId === `email-${teacher.id}` ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-mono">
                        {showPasswords[teacher.id] ? teacher.temporaryPassword  : '.......' }
                      </span>
                      <button onClick={() => togglePassword(teacher.id)}>
                        {showPasswords[teacher.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => copyToClipboard(teacher.temporaryPassword  || 'temp123456', `pass-${teacher.id}`)}>
                        {copiedId === `pass-${teacher.id}` ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{teacher.phone}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm">{teacher.teacher?.qualification || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{teacher.teacher?.specialization || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{teacher.teacher?.experience} years exp</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="text-purple-600 hover:text-purple-800 text-sm">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {teachers.length === 0 && (
        <div className="text-center py-8 text-gray-500">No teachers added yet.</div>
      )}
    </div>
  );
};

export default ViewTeachers;