import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  BarChart,
  Book,
  FileCheck
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import api from '../services/api';

const ResultsPage = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docRes, resRes] = await Promise.all([
          api.get(`/documents/${id}`),
          api.get(`/evaluation/results/${id}`)
        ]);
        setDoc(docRes.data);
        setResults(resRes.data);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  const radarData = results ? [
    { subject: 'Grammar', A: results.components?.grammar?.score || 0, fullMark: 100 },
    { subject: 'Vocabulary', A: results.components?.vocabulary?.score || 0, fullMark: 100 },
    { subject: 'Coherence', A: results.components?.coherence?.score || 0, fullMark: 100 },
    { subject: 'Relevance', A: results.components?.topic_relevance?.score || 0, fullMark: 100 },
    { subject: 'Originality', A: 100 - (results.components?.plagiarism?.percentage || 0), fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/results" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{doc?.filename}</h1>
            <p className="text-sm text-gray-500">Evaluation Report • ID: {id.substring(0,8)}</p>
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </button>
      </div>

      {/* Main Score & Grade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative">
             <svg className="h-48 w-48">
                <circle className="text-gray-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="85" cx="96" cy="96" />
                <circle 
                    className="text-primary-600 transition-all duration-1000 ease-out" 
                    strokeWidth="10" 
                    strokeDasharray={534} 
                    strokeDashoffset={534 - (534 * (results?.final_score || 0)) / 100} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="85" cx="96" cy="96" 
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-gray-900">{results?.final_score || 0}</span>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Score</span>
             </div>
          </div>
          <div className="mt-6">
            <span className={`text-2xl font-bold px-4 py-1.5 rounded-full ${results?.final_score >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                Grade {results?.grade || 'N/A'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
             <BarChart className="h-5 w-5 text-primary-500" />
             Competency Breakdown
           </h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                    name="Student"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                />
                </RadarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Grammar & Style */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Book className="h-5 w-5 text-blue-500" />
                    Grammar & Writing
                </h3>
                <span className="text-sm font-medium text-gray-500">Score: {results?.components?.grammar?.score}/100</span>
            </div>
            <div className="p-6 space-y-4">
                {(results?.components?.grammar?.errors || []).length > 0 ? (
                    results.components.grammar.errors.map((error, idx) => (
                        <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                {error.message}
                            </p>
                            <p className="text-xs text-red-600 mt-1 italic">Suggest: "{error.suggestion}"</p>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-2 opacity-20" />
                        <p className="text-sm text-gray-500">No major grammar errors found!</p>
                    </div>
                )}
            </div>
        </div>

        {/* Plagiarism & AI */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-purple-500" />
                    Integrity Report
                </h3>
                <span className={`text-sm font-bold ${results?.components?.plagiarism?.percentage > 20 ? 'text-red-600' : 'text-green-600'}`}>
                    Similarity: {results?.components?.plagiarism?.percentage || 0}%
                </span>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Originality Score</p>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full ${results?.components?.plagiarism?.percentage > 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${100 - (results?.components?.plagiarism?.percentage || 0)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">AI Text Probability</h4>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-gray-800">{results?.components?.ai_detection?.score || 0}%</span>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {results?.components?.ai_detection?.score > 50 
                                ? "Content shows high patterns of AI-generation." 
                                : "Content appears likely to be human-written."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* AI Feedback */}
      <div className="bg-primary-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="h-6 w-6 text-primary-300" />
                AI Constructive Feedback
            </h3>
            <p className="text-primary-100 leading-relaxed text-lg italic">
                "{results?.overall_feedback || "The document presents a well-structured argument with clear logical flow. To improve, focus on expanding the academic vocabulary and refining the sentence transitions in the conclusion."}"
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Book className="h-32 w-32" />
          </div>
      </div>
    </div>
  );
};

export default ResultsPage;
