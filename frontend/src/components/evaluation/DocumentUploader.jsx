import RubricSelector from './RubricSelector';

const DocumentUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [selectedRubricId, setSelectedRubricId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setError(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(0);

    try {
      // Pass prompt and rubricId to service
      const result = await evaluationService.uploadDocument(file, prompt, selectedRubricId, (percent) => {
        setProgress(percent);
      });

      setStatus('success');
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Reset after brief delay
      setTimeout(() => {
        setFile(null);
        setPrompt("");
        // setSelectedRubricId(null); // Keep the rubric selected for next upload? Maybe safer to keep it.
        setStatus('idle');
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);

    } catch (err) {
      console.error("Upload failed", err);
      setStatus('error');
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Document</h3>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="text-gray-500 mb-2">
            {file ? (
              <span className="font-medium text-blue-600">{file.name}</span>
            ) : (
              <span>Drag & drop or click to browse (PDF, DOCX, TXT)</span>
            )}
          </div>
          <div className="text-xs text-gray-400">Max size: 25MB</div>
        </label>
      </div>

      {/* Rubric Selection */}
      <div className="mt-6">
        <RubricSelector
          selectedRubricId={selectedRubricId}
          onSelect={setSelectedRubricId}
        />
      </div>

      {/* Prompt Input */}
      <div className="mt-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
          Essay Prompt (Optional)
        </label>
        <textarea
          id="prompt"
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Enter the essay prompt or topic description here to check for relevance..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {status === 'uploading' && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded text-sm text-center font-medium">
          Upload Successful!
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className={`mt-4 w-full py-2 px-4 rounded font-medium text-white transition-colors
          ${!file || status === 'uploading'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
          }`}
      >
        {status === 'uploading' ? 'Uploading...' : 'Upload & Analyze'}
      </button>
    </div>
  );
};

export default DocumentUploader;