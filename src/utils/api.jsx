/** @jsxRuntime classic */
/** @jsx React.createElement */

// api.js
import axios from 'axios';
import { getAuthToken, removeAuthToken } from './auth';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth token
apiClient.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Auto logout if 401 response
      removeAuthToken();
      window.location.reload();
    }
    
    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'API request failed';
    return Promise.reject(new Error(errorMessage));
  }
);

// Enhanced API request function
export const apiRequest = async (method, endpoint, data = null, config = {}) => {
  try {
    return await apiClient({
      method,
      url: endpoint,
      data,
      ...config
    });
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// Public data fetcher with caching
export const fetchPublicData = async (endpoint) => {
  try {
    const cacheKey = `cache_${endpoint}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Use cache if less than 5 minutes old
      if (Date.now() - timestamp < 300000) {
        return data;
      }
    }
    
    const data = await apiClient.get(endpoint);
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  } catch (error) {
    console.error('Error fetching public data:', error);
    throw error;
  }
};

// File upload helper
export const uploadFile = async (endpoint, file, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  return apiRequest('POST', endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};