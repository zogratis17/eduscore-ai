import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import api from '../services/api';

// Layout & Components
import FocusLayout from '../components/layout/FocusLayout';
import DocumentGrid from '../components/studio/DocumentGrid';
import DocumentUploader from '../components/evaluation/DocumentUploader';
import AnalysisView from '../components/studio/AnalysisView';

const StudioPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mode State
    const [selectedDocId, setSelectedDocId] = useState(id || null);

    // Data State
    const [documents, setDocuments] = useState([]);
    const [doc, setDoc] = useState(null);
    const [results, setResults] = useState(null);

    // UI State
    const [loading, setLoading] = useState(false); // For loading single doc
    const [loadingList, setLoadingList] = useState(false); // For loading library
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadKey, setUploadKey] = useState(0);

    // Sync URL
    useEffect(() => {
        setSelectedDocId(id);
    }, [id]);

    // -------------------------------------------------------------------------
    // LIBRARY MODE: Fetch List
    // -------------------------------------------------------------------------
    const fetchDocuments = useCallback(async () => {
        if (selectedDocId) return; // Don't fetch list if viewing a doc

        setLoadingList(true);
        try {
            const res = await api.get('/documents');
            // Sort by newest
            const sorted = (res.data || []).sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );
            setDocuments(sorted);
        } catch (error) {
            console.error("Failed to load documents", error);
        } finally {
            setLoadingList(false);
        }
    }, [selectedDocId]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // -------------------------------------------------------------------------
    // WORKSPACE MODE: Fetch Single Doc & Results
    // -------------------------------------------------------------------------
    const fetchDocData = useCallback(async () => {
        if (!selectedDocId) {
            setDoc(null);
            setResults(null);
            return;
        }

        setLoading(true);
        try {
            const [docRes, resRes] = await Promise.all([
                api.get(`/documents/${selectedDocId}`),
                api.get(`/evaluation/results/${selectedDocId}`).catch(() => ({ data: null }))
            ]);

            setDoc(docRes.data);
            const resData = resRes.data;

            if (resData?.status === 'processing') {
                setIsProcessing(true);
                setResults(null);
            } else {
                setIsProcessing(false);
                setResults(resData);
            }
        } catch (error) {
            console.error('Error fetching doc data:', error);
            setDoc(null);
        } finally {
            setLoading(false);
        }
    }, [selectedDocId]);

    useEffect(() => {
        fetchDocData();
    }, [fetchDocData]);

    // Polling Logic (Workspace)
    useEffect(() => {
        if (!isProcessing || !selectedDocId) return;
        const interval = setInterval(async () => {
            try {
                const t = Date.now();
                const [docRes, resRes] = await Promise.all([
                    api.get(`/documents/${selectedDocId}?t=${t}`),
                    api.get(`/evaluation/results/${selectedDocId}?t=${t}`)
                ]);
                setDoc(docRes.data);
                if (resRes.data?.status !== 'processing') {
                    setIsProcessing(false);
                    setResults(resRes.data);
                }
            } catch (e) { /* ignore */ }
        }, 3000);
        return () => clearInterval(interval);
    }, [isProcessing, selectedDocId]);


    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------
    const handleSelectDoc = (docId) => navigate(`/studio/${docId}`);

    const handleUploadSuccess = (response) => {
        if (response?.id) navigate(`/studio/${response.id}`);
        else fetchDocuments(); // Refresh list if generic success
    };

    // -------------------------------------------------------------------------
    // Renderers
    // -------------------------------------------------------------------------

    // A. Library View
    if (!selectedDocId) {
        return (
            <FocusLayout>
                <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                    <div className="max-w-6xl mx-auto space-y-12">

                        {/* Hero / Upload Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-full mb-4">
                                    <Sparkles size={24} />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Evaluation Studio</h1>
                                <p className="text-gray-500 mb-8 text-lg">
                                    Upload an essay to receive instant, detailed feedback on grammar, coherence, and relevance.
                                </p>
                                <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300">
                                    <DocumentUploader key={uploadKey} onUploadSuccess={handleUploadSuccess} />
                                </div>
                            </div>
                        </div>

                        {/* Recent Evaluations */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                Recent Evaluations
                                {loadingList && <Loader2 size={16} className="animate-spin text-gray-400" />}
                            </h2>
                            <DocumentGrid documents={documents} onSelect={handleSelectDoc} />
                        </div>
                    </div>
                </div>
            </FocusLayout>
        );
    }

    // B. Workspace View (Loading)
    if (loading) {
        return (
            <FocusLayout>
                <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                    <Loader2 className="h-10 w-10 animate-spin mb-3 text-indigo-600" />
                    <p className="font-medium text-gray-600">Loading workspace...</p>
                </div>
            </FocusLayout>
        );
    }

    // C. Workspace View (Processing)
    if (isProcessing) {
        return (
            <FocusLayout>
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="bg-white p-10 rounded-2xl shadow-lg border border-indigo-100 text-center max-w-lg">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Essay...</h3>
                        <p className="text-gray-500">
                            Our AI is reviewing vocabulary, coherence, and relevance. <br />
                            This usually takes 10-20 seconds.
                        </p>
                    </div>
                </div>
            </FocusLayout>
        );
    }

    // C2. Workspace View (Failed)
    if (doc?.status === 'failed_evaluation' || doc?.status === 'failed') {
        return (
            <FocusLayout>
                <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50">
                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-rose-100 text-center max-w-lg">
                        <AlertTriangle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Evaluation Failed</h3>
                        <p className="text-slate-600 mb-6">
                            The AI API rate limit was completely exhausted or the document parsing failed. We retried multiple times but the service is out of quota. Please try again later.
                        </p>
                        <button
                            onClick={() => {
                                setDoc(null);
                                navigate('/studio');
                            }}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                            Return to Library
                        </button>
                    </div>
                </div>
            </FocusLayout>
        );
    }

    // D. Workspace View (Analysis)
    if (doc) {
        return (
            <FocusLayout>
                <div className="flex-1 w-full h-full relative">
                    <AnalysisView
                        doc={doc}
                        results={results}
                        onBack={() => {
                            navigate('/studio');
                            setDoc(null);
                        }}
                    />
                </div>
            </FocusLayout>
        );
    }

    // E. Error State
    return (
        <FocusLayout>
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <AlertTriangle className="h-10 w-10 mb-3 opacity-50" />
                <p>Document not found or access denied.</p>
                <button onClick={() => navigate('/studio')} className="mt-4 text-indigo-600 hover:underline">
                    Return to Library
                </button>
            </div>
        </FocusLayout>
    );
};

export default StudioPage;
