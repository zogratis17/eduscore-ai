import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, BrainCircuit, ShieldAlert, Scale, CheckCircle2,
    Highlighter, Info, Copy, FileText, ChevronRight, AlertTriangle,
    Activity, Save, CheckCircle
} from 'lucide-react';
import api from '../../services/api';

const AnalysisView = ({ doc, results, onBack }) => {
    const [activeTab, setActiveTab] = useState('rubric');
    const [showGrammar, setShowGrammar] = useState(true);
    const [showPlagiarism, setShowPlagiarism] = useState(true);

    // State to hold manual overrides for scores
    // Initialize from results or default
    const [scores, setScores] = useState({});
    const [rubricCriteria, setRubricCriteria] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);

    // Fetch PDF blob if text is missing
    useEffect(() => {
        const loadPdf = async () => {
            if (doc && !doc.extracted_text) {
                try {
                    const docId = doc._id || doc.id;
                    const response = await api.get(`/documents/${docId}/view`, { responseType: 'blob' });
                    const url = URL.createObjectURL(response.data);
                    setPdfUrl(url);
                } catch (e) {
                    console.error("Failed to load PDF:", e);
                }
            }
        };
        loadPdf();

        // Cleanup
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [doc]);

    useEffect(() => {
        if (results?.score_breakdown?.weighted_components) {
            // Map backend breakdown to UI format
            const criteria = results.score_breakdown.weighted_components.map(c => ({
                id: c.name.toLowerCase().replace(/\s+/g, '_'),
                label: c.name,
                maxScore: 100, // Our backend uses 0-100 for everything
                weight: c.weight,
                description: c.reasoning || "Evaluated by AI",
                aiScore: c.raw_score
            }));
            setRubricCriteria(criteria);

            const initialScores = {};
            criteria.forEach(c => initialScores[c.id] = c.aiScore);
            setScores(initialScores);
        }
    }, [results]);

    const handleScoreChange = (id, val) => {
        setScores(prev => ({ ...prev, [id]: val }));
    };

    const calculateTotalScore = () => {
        let total = 0;
        rubricCriteria.forEach(c => {
            const score = scores[c.id] || 0;
            // Weight is a percentage (e.g., 30 for 30%)
            // Score is 0-100.
            // Contribution = (Score * Weight) / 100
            total += (score * c.weight) / 100;
        });
        return total.toFixed(1);
    };

    if (!doc || !results) return <div className="p-8 text-center">Loading analysis...</div>;

    const grammar = results.components?.grammar;
    const plagiarism = results.components?.plagiarism;
    const aiDetect = results.components?.ai_detection;
    const vocab = results.components?.vocabulary;
    const coherence = results.components?.coherence;

    // Helper to split text for highlighting (simplified for now)
    // In a real implementation, we'd map grammar errors to character offsets.
    // For this demo, we'll just display the text and overlay potential spans if we had them mapped.
    // Since we don't have robust offset mapping in frontend JS yet, we'll render plain text 
    // but list the errors effectively.

    const handleFinalize = async () => {
        try {
            const finalScore = calculateTotalScore();
            // Use _id if available (Mongo default), fallback to id
            const docId = doc._id || doc.id;
            await api.post(`/evaluation/results/${docId}/finalize`, {
                final_score: parseFloat(finalScore),
                overrides: scores
            });
            // Go back to dashboard after saving
            onBack();
        } catch (error) {
            console.error("Failed to finalize grade:", error);
            alert("Failed to save grade. Please try again.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {doc.filename}
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                {doc.uploaded_by || 'Student'}
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500">
                            Uploaded {new Date(doc.created_at).toLocaleDateString()} • {doc.status}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Current Grade</span>
                        <span className="text-2xl font-bold text-indigo-600">{calculateTotalScore()}<span className="text-lg text-slate-400 font-normal">/100</span></span>
                    </div>
                    <button
                        onClick={handleFinalize}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                        <Save size={16} /> Finalize Grade
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left Panel: Document Viewer */}
                <div className="flex-1 bg-slate-50 flex flex-col border-r border-slate-200 min-w-[50%]">
                    {/* Viewer Toolbar */}
                    <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <FileText size={16} /> Document Viewer
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowGrammar(!showGrammar)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${showGrammar ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <Highlighter size={12} /> Grammar
                            </button>
                            <button
                                onClick={() => setShowPlagiarism(!showPlagiarism)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${showPlagiarism ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <Copy size={12} /> Plagiarism
                            </button>
                        </div>
                    </div>

                    {/* Document Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-100">
                        <div className="max-w-[800px] mx-auto bg-white min-h-[1000px] shadow-sm border border-slate-200 p-12 rounded-sm font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap relative">
                            {/* Text Layer */}
                            <div className="relative z-10">
                                {doc.extracted_text || <div className="text-center text-slate-400 italic mt-20">No printable text content found.</div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Evaluation Engine */}
                <div className="w-[450px] bg-white flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('integrity')}
                            className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'integrity' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <ShieldAlert size={16} /> Integrity
                        </button>
                        <button
                            onClick={() => setActiveTab('rubric')}
                            className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'rubric' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Scale size={16} /> Rubric
                        </button>
                        <button
                            onClick={() => setActiveTab('language')}
                            className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'language' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <BrainCircuit size={16} /> Language
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">

                        {activeTab === 'integrity' && (
                            <div className="space-y-6">
                                {/* AI Suspicion Meter */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                        <BrainCircuit size={16} className="text-purple-600" /> AI Content Detection
                                    </h3>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${aiDetect?.score > 50 ? 'bg-red-500' : 'bg-green-500'} transition-all`}
                                                style={{ width: `${aiDetect?.score || 0}%` }}
                                            ></div>
                                        </div>
                                        <span className={`font-bold text-sm ${aiDetect?.score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                                            {aiDetect?.label || 'Unknown'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {aiDetect?.reasoning || "No AI reasoning available."}
                                    </p>
                                </div>

                                {/* Plagiarism Match */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                        <ShieldAlert size={16} className="text-amber-600" /> Plagiarism Check
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-slate-800">Overall Similarity</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${plagiarism?.percentage > 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {plagiarism?.percentage || 0}% Match
                                                </span>
                                            </div>
                                        </div>
                                        {/* List matched docs if available */}
                                        {plagiarism?.similar_documents?.map((match, i) => (
                                            <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-amber-800">{match.id_}</span>
                                                    <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                                                        {(match.similarity * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'rubric' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <span className="text-xs font-bold text-indigo-900">Grading Mode</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const initialScores = {};
                                                rubricCriteria.forEach(c => initialScores[c.id] = c.aiScore);
                                                setScores(initialScores);
                                            }}
                                            className="text-xs px-2 py-1 bg-white border border-indigo-200 text-indigo-600 rounded hover:bg-indigo-50"
                                            title="Revert to AI suggested scores"
                                        >
                                            Reset to AI
                                        </button>
                                        <button
                                            onClick={() => setScores({})}
                                            className="text-xs px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
                                            title="Clear all scores"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {rubricCriteria.map((c) => (
                                    <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">{c.label}</h4>
                                                <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{c.description}</p>
                                            </div>
                                            <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                                Weight: {c.weight}%
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={scores[c.id] || 0}
                                                    onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value))}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                            <div className="flex flex-col items-center min-w-[3rem]">
                                                <span className="text-xl font-bold text-indigo-700">{scores[c.id]}<span className="text-sm text-slate-400 font-normal">/100</span></span>
                                            </div>
                                        </div>

                                        {/* AI Suggestion */}
                                        <div className="mt-3 flex items-start gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                            <BrainCircuit size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-indigo-900 font-medium">AI Suggested: {c.aiScore}/100</p>
                                                <p className="text-[10px] text-indigo-700/80 leading-tight mt-1">
                                                    Accept this score or drag slider to override.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'language' && (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${grammar?.score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div className="text-3xl font-bold text-slate-800 mb-1">{grammar?.score || 0}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grammar Score</div>
                                    <p className="text-xs text-slate-400 mt-1">{grammar?.errors?.length || 0} issues found</p>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 mb-3">Vocabulary Richness</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-600">Score</span>
                                                <span className="font-bold text-indigo-600">{vocab?.score || 0}/100</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all"
                                                    style={{ width: `${vocab?.score || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    {vocab?.reasoning && (
                                        <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                                            {vocab.reasoning}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 mb-2">Topic Relevance</h3>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-600">Score</span>
                                        <span className="font-bold text-green-600">{results.components?.topic_relevance?.score || 0}/100</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-green-500 transition-all"
                                            style={{ width: `${results.components?.topic_relevance?.score || 0}%` }}
                                        ></div>
                                    </div>
                                    {results.components?.topic_relevance?.reasoning && (
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {results.components.topic_relevance.reasoning}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisView;
