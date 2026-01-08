import api from './api';

export const evaluationService = {
  // --- Documents ---
  
  // Upload a single document
  uploadDocument: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // Get list of documents
  getDocuments: async () => {
    // Note: Backend endpoint for list needs implementation, using individual get for now or mock
    // Assuming GET /documents will be implemented
    const response = await api.get('/documents'); 
    return response.data;
  },

  // Get single document details
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // --- Evaluation ---

  // Trigger evaluation
  startEvaluation: async (documentId) => {
    const response = await api.post(`/evaluation/evaluate/${documentId}`);
    return response.data;
  },

  // Get results
  getResults: async (documentId) => {
    const response = await api.get(`/evaluation/results/${documentId}`);
    return response.data;
  }
};
