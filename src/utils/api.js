// src/utils/api.js
import axios from 'axios';

// Change this to your local backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://schoolapp-backend2.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Don't add /api if it's already there or if it's a full URL
    if (!config.url.startsWith('/api/') && !config.url.startsWith('http')) {
      config.url = '/api/' + config.url;
    }
    
    console.log('🌐 API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;