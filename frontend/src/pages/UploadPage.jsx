import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import RubricSelector from '../components/evaluation/RubricSelector';

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'
  const [selectedRubricId, setSelectedRubricId] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [gradingMode, setGradingMode] = useState('suggested');
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
    let lastDocId = null;

    // Upload files sequentially
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        if (selectedRubricId) {
          formData.append('rubric_id', selectedRubricId);
        }
        if (prompt.trim()) {
          formData.append('prompt', prompt.trim());
        }
        formData.append('grading_mode', gradingMode);

        const response = await api.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        lastDocId = response.data._id || response.data.id;
      }
      setUploadStatus('success');

      // If single file, go straight to its results. If multiple, go to dashboard.
      if (files.length === 1 && lastDocId) {
        setTimeout(() => navigate(`/results/${lastDocId}`), 1500);
      } else {
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center sm:text-left mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Upload Documents</h1>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Upload student essays or assignments for AI evaluation. Supported formats: PDF, DOCX, TXT.
        </p>
      </div>

      <div className="space-y-6">
      {/* Dropzone */}
      <div className="glass bg-white p-6 md:p-8 rounded-2xl relative overflow-hidden animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">1</div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Select Scoring Rubric</h2>
        </div>
        <RubricSelector
          selectedRubricId={selectedRubricId}
          onSelect={setSelectedRubricId}
        />
      </div>

      <div className="glass bg-white p-6 md:p-8 rounded-2xl relative overflow-hidden animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">2</div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Essay Prompt / Topic <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span></h2>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-11">
          Provide the essay prompt for more accurate topic relevance scoring.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Discuss the impact of artificial intelligence on modern healthcare..."
          rows={3}
          className="w-full ml-11 max-w-[calc(100%-2.75rem)] px-4 py-3 border border-gray-200/80 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-surface-50 focus:bg-white resize-none transition-all duration-200"
        />
      </div>

      <div className="glass bg-white p-6 md:p-8 rounded-2xl relative overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">3</div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Grading Preference</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
          <div
            onClick={() => setGradingMode('suggested')}
            className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 ${gradingMode === 'suggested' ? 'border-primary-500 bg-primary-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${gradingMode === 'suggested' ? 'border-primary-600' : 'border-gray-300'}`}>
                {gradingMode === 'suggested' && <div className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-fade-in" />}
              </div>
              <span className={`font-bold ${gradingMode === 'suggested' ? 'text-primary-900' : 'text-gray-700'}`}>Suggested Scoring</span>
            </div>
            <p className="text-sm text-gray-500 ml-8 leading-relaxed">AI suggests detailed feedback and scores, but you finalize the grade via slider adjustment.</p>
          </div>

          <div
            onClick={() => setGradingMode('auto')}
            className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 ${gradingMode === 'auto' ? 'border-primary-500 bg-primary-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${gradingMode === 'auto' ? 'border-primary-600' : 'border-gray-300'}`}>
                {gradingMode === 'auto' && <div className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-fade-in" />}
              </div>
              <span className={`font-bold ${gradingMode === 'auto' ? 'text-primary-900' : 'text-gray-700'}`}>AI Auto-Grading</span>
            </div>
            <p className="text-sm text-gray-500 ml-8 leading-relaxed">AI automatically calculates and locks the grade based on the rubric. Best for bulk tasks.</p>
          </div>
        </div>
      </div>

      <div className="glass bg-white p-6 md:p-8 rounded-2xl relative overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">4</div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Upload Files</h2>
        </div>

      <div className="ml-11">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer relative overflow-hidden
            ${isDragActive ? 'border-primary-500 bg-primary-50/50 scale-[1.01] shadow-glow-sm' : 'border-gray-200 hover:border-primary-300 bg-surface-50 hover:bg-white'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
            <div className={`p-4 rounded-full transition-colors duration-300 ${isDragActive ? 'bg-white shadow-sm' : 'bg-white shadow-sm border border-gray-100'}`}>
              <Upload className={`h-8 w-8 transition-transform duration-300 ${isDragActive ? 'text-primary-600 -translate-y-1' : 'text-primary-500'}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 tracking-tight">
                {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Maximum file size 25MB
              </p>
            </div>
          </div>
        </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6 shadow-sm animate-slide-up">
          <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 tracking-wide uppercase">Files to Upload ({files.length})</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {files.map((file, idx) => (
              <li key={file.name} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 50}ms`}}>
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100/80 rounded-lg mr-4 border border-gray-200/60">
                    <FileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 shadow-sm hover:shadow-glow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200"
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
      </div>
      </div>
      </div>

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
