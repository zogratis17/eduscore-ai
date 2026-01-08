import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/common/Card';
import Button from '../components/common/Button';

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending', // pending, uploading, success, error
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setUploadComplete(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 25 * 1024 * 1024 // 25MB
  });

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    // Simulate upload process
    const interval = setInterval(() => {
      setFiles(prevFiles => {
        const allComplete = prevFiles.every(f => f.progress >= 100);
        
        if (allComplete) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          return prevFiles.map(f => ({ ...f, status: 'success', progress: 100 }));
        }

        return prevFiles.map(f => {
          if (f.progress >= 100) return f;
          const newProgress = f.progress + Math.random() * 10;
          return {
            ...f,
            progress: Math.min(newProgress, 100),
            status: newProgress >= 100 ? 'success' : 'uploading'
          };
        });
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Upload Documents</h1>
        <p className="text-secondary-500 mt-1">Upload student assignments for automated evaluation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <Card className="lg:col-span-2">
          <CardContent className="p-8">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-secondary-300 hover:border-primary-400 hover:bg-secondary-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900">
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
              </h3>
              <p className="text-secondary-500 mt-2 mb-6 text-sm max-w-xs mx-auto">
                Support for PDF, DOCX, and TXT files. Maximum file size 25MB.
              </p>
              <Button variant="outline" onClick={(e) => e.stopPropagation()}>
                Browse Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Selected Files</span>
              <span className="text-xs font-normal text-secondary-500">{files.length} files</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px] p-0">
            {files.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-secondary-400 text-center">
                <FileText className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No files selected yet</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-100">
                {files.map((fileObj) => (
                  <div key={fileObj.id} className="p-4 flex items-center gap-3 relative group">
                    <div className="h-10 w-10 bg-secondary-100 rounded-lg flex items-center justify-center shrink-0">
                      <File className="h-5 w-5 text-secondary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {fileObj.file.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-secondary-500">
                          {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {fileObj.status === 'uploading' && (
                          <span className="text-xs text-primary-600">{Math.round(fileObj.progress)}%</span>
                        )}
                      </div>
                      {(fileObj.status === 'uploading' || fileObj.status === 'success') && (
                        <div className="h-1 w-full bg-secondary-100 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              fileObj.status === 'success' ? 'bg-green-500' : 'bg-primary-500'
                            }`}
                            style={{ width: `${fileObj.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    {fileObj.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <button 
                        onClick={() => removeFile(fileObj.id)}
                        disabled={uploading}
                        className="text-secondary-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-secondary-100 bg-white p-4">
            {uploadComplete ? (
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setFiles([])}>
                Upload More
              </Button>
            ) : (
              <Button 
                className="w-full" 
                disabled={files.length === 0 || uploading}
                onClick={handleUpload}
                isLoading={uploading}
              >
                {uploading ? 'Uploading...' : 'Start Upload'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-900">Upload Guidelines</h4>
          <ul className="mt-1 text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Ensure files are clear and readable if scanned.</li>
            <li>Supported formats: PDF, DOCX, TXT.</li>
            <li>For handwritten documents, ensure high contrast.</li>
            <li>Batch uploads are limited to 50 files per session.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
