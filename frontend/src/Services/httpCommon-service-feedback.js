import axios from 'axios';
import { baseURL } from '../Config/Settings';


console.log("Base URL:", import.meta.env.VITE_API_URL);


export const HTTP = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include user data if available
HTTP.interceptors.request.use(
  (config) => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Add user info to headers for backend authentication
        config.headers['X-User-ID'] = user._id || user.id || userId;
        config.headers['X-User-Role'] = user.role;
      } catch (error) {
        console.warn('Failed to parse user data from localStorage:', error.message);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
HTTP.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);