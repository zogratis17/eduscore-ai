import React, { useState } from 'react';
import {
    ChevronDown, ChevronUp, Zap, Target, BookOpen, SpellCheck,
    FileCheck, Bot, Sparkles, AlertTriangle, ThumbsUp, Lightbulb,
    Edit3, BrainCircuit
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

// ─── Score Ring ───────────────────────────────────────────────────
const ScoreRing = ({ score, grade }) => {
    const circumference = 2 * Math.PI * 60; // Smaller radius for sidebar
    const offset = circumference - (circumference * score) / 100;
    const getColor = (s) => {
        if (s >= 80) return { ring: '#10b981', bg: 'bg-emerald-100 text-emerald-700' };
        if (s >= 60) return { ring: '#f59e0b', bg: 'bg-amber-100 text-amber-700' };
        return { ring: '#ef4444', bg: 'bg-red-100 text-red-700' };
    };
    const color = getColor(score);
    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <svg className="h-32 w-32" viewBox="0 0 140 140">
                    <circle strokeWidth="8" stroke="#f3f4f6" fill="transparent" r="60" cx="70" cy="70" />
                    <circle strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round" stroke={color.ring} fill="transparent" r="60" cx="70" cy="70"
                        style={{ transition: 'stroke-dashoffset 1s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900">{score}</span>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">/ 100</span>
                </div>
            </div>
            <span className={`mt-2 text-sm font-bold px-3 py-1 rounded-full ${color.bg}`}>Grade {grade}</span>
        </div>
    );
};

// ─── Gemini Insight ───────────────────────────────────────────────
const GeminiInsight = ({ data }) => {
    if (!data?.reasoning) return null;
    return (
        <div className="space-y-3 pt-2">
            <p className="text-sm text-gray-600 leading-relaxed text-justify">{data.reasoning}</p>

            {data.strengths?.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <ThumbsUp className="h-3 w-3" /> Strengths
                    </p>
                    <ul className="space-y-1">
                        {data.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5 pl-1">
                                <span className="text-emerald-400 mt-0.5">•</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {data.improvements?.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1 mb-1 mt-2">
                        <Lightbulb className="h-3 w-3" /> Improvements
                    </p>
                    <ul className="space-y-1">
                        {data.improvements.map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5 pl-1">
                                <span className="text-amber-400 mt-0.5">•</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// ─── Detail Card ──────────────────────────────────────────────────
const DetailCard = ({ title, icon: Icon, color, score, engineBadge, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
                        {/* Color prop is usually 'bg-blue-500', so we need text color logic or just use fixed colors */}
                        <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {score !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                {score}
                            </span>
                            {/* User Edit Button (Hybrid Scoring) */}
                            <span className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-pointer" title="Edit Score">
                                <Edit3 className="h-3 w-3" />
                            </span>
                        </div>
                    )}
                    {open ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
                </div>
            </button>
            {open && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {engineBadge === 'gemini' && (
                        <div className="mb-2 flex items-center gap-1.5">
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                <BrainCircuit className="h-3 w-3" /> AI Analysis
                            </span>
                        </div>
                    )}
                    {children}
                </div>
            )}
        </div>
    );
};


const InspectorPanel = ({ results, doc }) => {
    if (!results) {
        return (
            <div className="p-6 text-center">
                <p className="text-sm text-gray-500">Select a document to view analysis.</p>
            </div>
        );
    }

    const grammar = results.components?.grammar;
    const vocab = results.components?.vocabulary;
    const coherence = results.components?.coherence;
    const topic = results.components?.topic_relevance;
    const plagiarism = results.components?.plagiarism;
    const aiDetect = results.components?.ai_detection;

    const radarData = [
        { subject: 'Grammar', A: grammar?.score || 0, fullMark: 100 },
        { subject: 'Vocab', A: vocab?.score || 0, fullMark: 100 },
        { subject: 'Flow', A: results.components?.coherence?.score || 0, fullMark: 100 },
        { subject: 'Topic', A: results.components?.topic_relevance?.score || 0, fullMark: 100 },
        { subject: 'Original', A: 100 - (results.components?.plagiarism?.percentage || 0), fullMark: 100 },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Top: Score & Radar */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center">
                <ScoreRing score={results.final_score || 0} grade={results.grade || 'N/A'} />

                <div className="h-40 w-full mt-4 -mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.3} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Scrollable Details */}
            <div className="flex-1 overflow-y-auto">
                <DetailCard title="Grammar" icon={SpellCheck} color="bg-blue-500" score={grammar?.score} engineBadge="languagetool">
                    <p className="text-xs text-gray-600 mb-2">
                        Found <span className="font-bold">{grammar?.errors?.length || 0}</span> errors.
                    </p>
                </DetailCard>

                <DetailCard title="Vocabulary" icon={BookOpen} color="bg-teal-500" score={vocab?.score} engineBadge={vocab?.engine} defaultOpen>
                    <GeminiInsight data={vocab} />
                </DetailCard>

                <DetailCard title="Coherence" icon={Zap} color="bg-amber-500" score={coherence?.score} engineBadge={coherence?.engine}>
                    <GeminiInsight data={coherence} />
                </DetailCard>

                <DetailCard title="Relevance" icon={Target} color="bg-green-500" score={topic?.score} engineBadge={topic?.engine}>
                    <GeminiInsight data={topic} />
                    {doc?.prompt && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500 border border-gray-100">
                            Prompt: {doc.prompt.substring(0, 100)}...
                        </div>
                    )}
                </DetailCard>

                <DetailCard title="Plagiarism" icon={FileCheck} color="bg-purple-500" score={plagiarism ? 100 - (plagiarism.percentage || 0) : undefined}>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Similarity</span>
                        <span className="font-medium">{plagiarism?.percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${plagiarism?.percentage > 20 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(plagiarism?.percentage || 0, 100)}%` }} />
                    </div>
                </DetailCard>

                <DetailCard title="AI Detection" icon={Bot} color="bg-rose-500" score={aiDetect ? 100 - (aiDetect.score || 0) : undefined} engineBadge={aiDetect?.engine}>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Probability</span>
                        <span className="font-medium text-rose-600">{aiDetect?.score || 0}%</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{aiDetect?.reasoning}</p>
                </DetailCard>
            </div>

            {/* Disclaimer / Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                <span className="text-[10px] text-gray-400">
                    Scored by {results.scoring_engine === 'gemini' ? 'Gemini 2.5 Flash' : 'Statistical Model'}
                </span>
            </div>
        </div>
    );
};

export default InspectorPanel;
