// src/lib/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://selling-buyer-backend-2.onrender.com',
  withCredentials: false,               // keep false if not using cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if available
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;
