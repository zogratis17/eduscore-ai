import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    // Add new files to state
    setFiles(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))]);
    setUploadStatus(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const removeFile = (name) => {
    setFiles(files.filter(f => f.name !== name));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus(null);

    // Upload files sequentially for now (could be parallel)
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        await api.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      setUploadStatus('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload student essays or assignments for AI evaluation. Supported formats: PDF, DOCX, TXT.
        </p>
      </div>

      {/* Dropzone */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400 bg-white'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary-50 rounded-full">
            <Upload className={`h-8 w-8 text-primary-600 ${isDragActive ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Maximum file size 25MB
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Files to Upload ({files.length})</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {files.map((file) => (
              <li key={file.name} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(file.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                </>
              ) : (
                <>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Upload successful! Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Upload failed. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
