/** @jsxRuntime classic */
/** @jsx React.createElement */

// services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.VITE_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      // You can add more status code handling here
    }
    return Promise.reject(error);
  });

  api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle different HTTP error statuses
      const message = error.response.data?.message || 'Request failed';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('No response received'));
    } else {
      return Promise.reject(new Error('Request setup error'));
    }
  }
);

export default api;