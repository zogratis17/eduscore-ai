import api from './api';

export const evaluationService = {
  // --- Documents ---

  // Upload a single document
  uploadDocument: async (file, prompt, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    if (prompt) {
      formData.append('prompt', prompt);
    }
    if (file.rubric_id) {
      formData.append('rubric_id', file.rubric_id);
    } else if (prompt && typeof prompt === 'object' && prompt.rubric_id) {
      // Handle case where second arg is an options object or similar, but for now let's be explicit
      // Actually, I should check how I'm calling this. 
      // The signature is (file, prompt, onProgress).
      // I should change the signature or pass it in a different way.
      // Let's check how the component calls it.
      // It logic in DocumentUploader.jsx is: evaluationService.uploadDocument(file, prompt, ...)
      // I'll update the signature here to: uploadDocument: async (file, prompt, rubricId, onProgress) => {
    }

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
    const response = await api.get('/documents/');
    return response.data;
  },

  // Get single document details
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  deleteDocument: async (id) => {
    await api.delete(`/documents/${id}`);
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
  },

  // Download PDF Report
  downloadReport: async (documentId) => {
    const response = await api.get(`/reports/${documentId}/pdf`, {
      responseType: 'blob', // Important for binary data
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Try to extract filename from headers
    const contentDisposition = response.headers['content-disposition'];
    let filename = `report-${documentId}.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};