import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, SpellCheck, FileCheck, BrainCircuit, Target, Sparkles, CheckCircle } from 'lucide-react';
import api from '../services/api';
import AnalysisView from '../components/studio/AnalysisView';

// ─── Processing Stages ────
const STAGES = [
  { key: 'analyzing_grammar', label: 'Grammar Analysis', icon: SpellCheck, color: 'text-blue-600' },
  { key: 'analyzing_plagiarism', label: 'Plagiarism Check', icon: FileCheck, color: 'text-purple-600' },
  { key: 'analyzing_with_gemini', label: 'AI Deep Analysis', icon: BrainCircuit, color: 'text-indigo-600' },
  { key: 'calculating_score', label: 'Calculating Score', icon: Target, color: 'text-emerald-600' },
  { key: 'generating_feedback', label: 'Generating Feedback', icon: Sparkles, color: 'text-amber-600' },
];

const ProcessingStepper = ({ currentStatus }) => {
  const [maxIdx, setMaxIdx] = useState(-1);

  React.useEffect(() => {
    const idx = STAGES.findIndex(s => s.key === currentStatus);
    if (idx > maxIdx) {
      setMaxIdx(idx);
    }
  }, [currentStatus, maxIdx]);

  // Lock the visible index to the maximum reached so far to prevent backward jumps during background retries
  const displayIdx = maxIdx >= 0 ? maxIdx : STAGES.findIndex(s => s.key === currentStatus);
  const progress = displayIdx >= 0 ? ((displayIdx + 1) / STAGES.length) * 100 : 0;
  const isQueued = displayIdx === -1;
  const estimatedTime = isQueued ? "30" : Math.max(5, 30 - (displayIdx * 5));

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6">
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 p-10 rounded-3xl shadow-xl border border-gray-100 max-w-2xl w-full backdrop-blur-sm">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-semibold mb-4 shadow-lg shadow-blue-200">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>AI Evaluation in Progress</span>
          </div>
          <p className="text-gray-600 text-base font-medium">
            {isQueued 
              ? 'Preparing your document...' 
              : currentStatus === 'retrying' 
                ? 'AI busy. Retrying automatically...' 
                : STAGES[displayIdx]?.label || 'Processing...'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {currentStatus === 'retrying' 
              ? '⏱️ Waiting for API slot to open (approx 30s)...' 
              : `⏱️ Estimated time remaining: ~${estimatedTime} seconds`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</span>
            <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Processing Stages */}
        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = idx < displayIdx;
            const isActive = idx === displayIdx;
            const isPending = idx > displayIdx;

            return (
              <div 
                key={stage.key} 
                className={`
                  flex items-center gap-4 p-4 rounded-xl transition-all duration-500 transform
                  ${isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 scale-105 shadow-md' : ''}
                  ${isDone ? 'bg-green-50/50 border border-green-100' : ''}
                  ${isPending ? 'bg-gray-50/50 border border-gray-100 opacity-60' : ''}
                `}
              >
                {/* Icon Circle */}
                <div className={`
                  relative h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
                  ${isDone ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-200' : ''}
                  ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-300 animate-pulse' : ''}
                  ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                `}>
                  {isDone && <CheckCircle className="h-6 w-6" />}
                  {isActive && <Loader2 className="h-5 w-5 animate-spin" />}
                  {isPending && <Icon className="h-5 w-5" />}
                  
                  {/* Pulse Ring for Active State */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></span>
                  )}
                </div>

                {/* Stage Label and Status */}
                <div className="flex-1">
                  <span className={`
                    font-semibold text-base block transition-colors duration-300
                    ${isActive ? 'text-blue-900' : ''}
                    ${isDone ? 'text-green-700' : ''}
                    ${isPending ? 'text-gray-500' : ''}
                  `}>
                    {stage.label}
                  </span>
                  {isActive && (
                    <span className="text-xs text-blue-600 font-medium mt-0.5 block animate-pulse">
                      Processing now...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-xs text-green-600 font-medium mt-0.5 block">
                      ✓ Completed
                    </span>
                  )}
                </div>

                {/* Stage Number */}
                <div className={`
                  text-xs font-bold px-2.5 py-1 rounded-full
                  ${isDone ? 'bg-green-100 text-green-700' : ''}
                  ${isActive ? 'bg-blue-100 text-blue-700' : ''}
                  ${isPending ? 'bg-gray-100 text-gray-400' : ''}
                `}>
                  {idx + 1}/{STAGES.length}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Message */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-800 text-center font-medium">
            🎯 Our AI is analyzing your essay with multiple quality checks
          </p>
        </div>
      </div>
    </div>
  );
};

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [docRes, resRes] = await Promise.all([
        api.get(`/documents/${id}`),
        api.get(`/evaluation/results/${id}`).catch(() => ({ data: null }))
      ]);
      const docData = docRes.data;
      setDoc(docData);

      const processingStatuses = [
        'pending', 'processing', 'completed', 'retrying',
        ...STAGES.map(s => s.key)
      ];

      const isStillProcessing =
        resRes.data?.status === 'processing' ||
        processingStatuses.includes(docData?.status);

      if (isStillProcessing && !resRes.data?.final_score) {
        setIsProcessing(true);
        setResults(null);
      } else {
        setIsProcessing(false);
        setResults(resRes.data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll while processing
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(async () => {
      try {
        const t = Date.now();
        const [docRes, resRes] = await Promise.all([
          api.get(`/documents/${id}?t=${t}`),
          api.get(`/evaluation/results/${id}?t=${t}`)
        ]);
        setDoc(docRes.data);
        if (resRes.data?.status !== 'processing') {
          setIsProcessing(false);
          setResults(resRes.data);
        }
      } catch (e) { /* retry */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [isProcessing, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (isProcessing) {
    return <ProcessingStepper currentStatus={doc?.status} />;
  }

  if (!results && !doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-amber-400 mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Document Not Found</h2>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <AnalysisView doc={doc} results={results} onBack={() => navigate('/dashboard')} />
    </div>
  );
};

export default ResultsPage;