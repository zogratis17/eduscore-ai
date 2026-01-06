/**
 * API Configuration
 * Centralized API configuration for all backend service calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  endpoints: {
    upload: '/upload',
    health: '/',
  },
};

export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};
