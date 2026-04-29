import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X, Eye, EyeOff, Copy, CheckCircle, Loader, Mail, Phone, User, Key, Briefcase, MapPin, Users } from 'lucide-react';

const ViewParents = ({ onClose }) => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await api.get('auth/users?role=parent');
      if (response.data.success) {
        setParents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
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
          <Loader className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">👨‍👩‍👧 Parents/Guardians List</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parent</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Login Credentials</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Children</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {parents.map((parent) => (
              <tr key={parent.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{parent.name}</p>
                    <p className="text-sm text-gray-500">{parent.parent?.occupation || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{parent.email}</span>
                      <button onClick={() => copyToClipboard(parent.email, `email-${parent.id}`)}>
                        {copiedId === `email-${parent.id}` ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-mono">
                        {showPasswords[parent.id] ? parent.tempPassword || 'temp123456' : '••••••••'}
                      </span>
                      <button onClick={() => togglePassword(parent.id)}>
                        {showPasswords[parent.id] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => copyToClipboard(parent.tempPassword || 'temp123456', `pass-${parent.id}`)}>
                        {copiedId === `pass-${parent.id}` ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{parent.phone}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{parent.parent?.children?.length || 0} children linked</span>
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

      {parents.length === 0 && (
        <div className="text-center py-8 text-gray-500">No parents added yet.</div>
      )}
    </div>
  );
};

export default ViewParents;