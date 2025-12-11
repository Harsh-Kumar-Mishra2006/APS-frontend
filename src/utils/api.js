// src/utils/api.js - RECOMMENDED VERSION
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aps-backend-8aho.onrender.com/';

const api = axios.create({
  baseURL: API_BASE_URL,  // Just the base URL
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Add '/api' prefix to all requests automatically
    if (!config.url.startsWith('/api/')) {
      config.url = '/api/' + config.url;
    }
    
    console.log('🌐 API Request:', {
      url: config.url,
      method: config.method,
      fullURL: config.baseURL + config.url,
      hasToken: !!token,
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (!window.location.pathname.includes('/add-members')) {
        window.location.href = '/add-members';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;