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
  const currentIdx = STAGES.findIndex(s => s.key === currentStatus);
  // If status not found (e.g. 'queued'), default to -1 (start)
  // If status is 'completed' or unknown future state, show all done? handled by parent showing AnalysisView

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            Evaluating Your Essay
          </div>
          <p className="text-gray-500 text-sm">Usually takes 10-30 seconds</p>
        </div>
        <div className="space-y-4">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            // logic: if currentIdx is valid, use it. if currentStatus is unknown/queued, everything is pending.
            // But usually we get a valid status. 
            // Treat 'queued' or 'processing' as index -1 (or 0).
            const isDone = idx < currentIdx;
            const isActive = idx === currentIdx;

            return (
              <div key={stage.key} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isActive ? 'bg-blue-50 border border-blue-100' : 'opacity-60'
                }`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isDone ? 'bg-green-100 text-green-600' : isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                  {isDone ? <CheckCircle className="h-5 w-5" /> : isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-500'}`}>{stage.label}</span>
              </div>
            );
          })}
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
      setDoc(docRes.data);
      if (resRes.data?.status === 'processing') {
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
        const [docRes, resRes] = await Promise.all([
          api.get(`/documents/${id}`),
          api.get(`/evaluation/results/${id}`)
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