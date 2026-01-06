import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { mockSubjects } from '@/services/mockApi';
import { DocumentService } from '@/services/api';
import { validateFile } from '@/utils/helpers';
import Alert from '@/components/common/Alert';
import Loader from '@/components/common/Loader';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!subject) {
      setError('Please select a subject');
      return;
    }

    if (!maxMarks || parseInt(maxMarks) <= 0) {
      setError('Please enter valid maximum marks');
      return;
    }

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Call the real backend API
      const response = await DocumentService.uploadDocument(file);
      
      if (response.status === 'success') {
        setProgress(100);
        setSuccess(true);
        
        // Store the response for later use
        sessionStorage.setItem('uploadedDocument', JSON.stringify(response));
        
        setTimeout(() => {
          navigate('/results');
        }, 2000);
      } else {
        setError('Upload failed. Please try again.');
        setProgress(0);
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.detail || 'Upload failed. Please try again.';
      setError(errorMessage);
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setSuccess(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Assignment</h1>
          <p className="text-muted-foreground">Submit your work for AI-powered evaluation</p>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {success && (
        <div className="mb-6">
          <Alert
            type="success"
            title="Upload Successful!"
            message="Your assignment has been submitted and is being evaluated. Redirecting to results..."
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : file
              ? 'border-success bg-success/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <input {...getInputProps()} />
          
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FiFile className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <FiX className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FiUploadCloud className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your assignment'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOCX (Max 10MB)
              </p>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {(uploading || progress > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {success ? 'Upload complete!' : 'Uploading...'}
              </span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${success ? 'bg-success' : 'gradient-primary'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground input-focus"
            disabled={uploading}
          >
            <option value="">Select a subject</option>
            {mockSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Max Marks */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Maximum Marks
          </label>
          <input
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(e.target.value)}
            min="1"
            max="1000"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground input-focus"
            disabled={uploading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || success}
          className="w-full py-3 btn-primary-gradient rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <Loader size="sm" />
          ) : success ? (
            <>
              <FiCheck className="w-5 h-5" />
              Submitted Successfully
            </>
          ) : (
            <>
              <FiUploadCloud className="w-5 h-5" />
              Submit Assignment
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Upload;
