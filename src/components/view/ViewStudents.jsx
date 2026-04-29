import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X, Eye, EyeOff, Copy, CheckCircle, Loader, Mail, Phone, User, Key, GraduationCap, Calendar, MapPin } from 'lucide-react';

const ViewStudents = ({ onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('auth/users?role=student');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🎓 Students List</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Login Credentials</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Academic</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parents</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">ID: {student.student?.studentId}</p>
                    <p className="text-sm text-gray-500">Roll: {student.student?.rollNumber}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{student.email}</span>
                      <button onClick={() => copyToClipboard(student.email, `email-${student.id}`)}>
                        {copiedId === `email-${student.id}` ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-mono">
                        {showPasswords[student.id] ? student.tempPassword || 'temp123456' : '••••••••'}
                      </span>
                      <button onClick={() => togglePassword(student.id)}>
                        {showPasswords[student.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => copyToClipboard(student.tempPassword || 'temp123456', `pass-${student.id}`)}>
                        {copiedId === `pass-${student.id}` ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{student.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm">Class: {student.student?.class}</p>
                    <p className="text-sm">Section: {student.student?.section}</p>
                    <p className="text-sm text-gray-500">DOB: {student.student?.dateOfBirth}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm">Father: {student.student?.fatherName || 'N/A'}</p>
                    <p className="text-sm">Mother: {student.student?.motherName || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="text-center py-8 text-gray-500">No students added yet.</div>
      )}
    </div>
  );
};

export default ViewStudents;