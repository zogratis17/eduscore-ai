import axios from 'axios';
import { auth } from './firebase';

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Firebase token
api.interceptors.request.use(
  async (config) => {
    // --- MOCK AUTH PATH ---
    if (USE_MOCK_AUTH) {
      // In mock mode, we always use the static mock token
      config.headers.Authorization = `Bearer mock-token`;
      return config;
    }
    // ----------------------

    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (USE_MOCK_AUTH) {
         originalRequest.headers.Authorization = `Bearer mock-token`;
         return api(originalRequest);
      }

      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true); // Force refresh
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;