import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/config/api';

/**
 * API Service - Handles all backend communication
 * This service provides methods to interact with the FastAPI backend
 */

// Create axios instance for API calls
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface DocumentUploadResponse {
  status: string;
  text: string;
  metadata?: {
    page_count: number;
    title?: string;
    author?: string;
  };
}

export interface DocumentUploadError {
  error: string;
  message: string;
}

export const DocumentService = {
  /**
   * Upload a document (PDF or DOCX) to the backend for processing
   * @param file - The file to upload
   * @returns Promise with the extracted text and metadata
   */
  async uploadDocument(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<DocumentUploadResponse>(
        '/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          error: error.response?.status || 'UNKNOWN_ERROR',
          message: error.response?.data?.detail || 'Failed to upload document',
        };
      }
      throw error;
    }
  },

  /**
   * Check backend health status
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to reach backend server');
    }
  },
};

export default apiClient;
