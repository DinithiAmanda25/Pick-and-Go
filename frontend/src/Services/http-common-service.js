import axios from 'axios';
import { baseURL } from '../Config/Settings';


console.log("Base URL:", import.meta.env.VITE_API_URL);


export const HTTP = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for debugging
HTTP.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);