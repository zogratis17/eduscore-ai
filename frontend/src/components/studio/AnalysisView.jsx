import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  ShieldAlert,
  Scale,
  CheckCircle2,
  Highlighter,
  Info,
  Copy,
  FileText,
  ChevronRight,
  AlertTriangle,
  Activity,
  Save,
  CheckCircle,
  Loader2,
  Download,
  Printer,
} from "lucide-react";
import api from "../../services/api";

const GrammarIssuesList = ({ text, errors }) => {
  if (!errors || errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
        <h3 className="text-xl font-bold text-slate-800">
          No Grammar Issues Found
        </h3>
        <p className="text-slate-500 text-sm mt-2">
          The AI didn't find any significant grammatical errors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto py-4">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Highlighter className="text-rose-500" />
        Identified Grammar Issues
      </h2>
      {errors.map((err, i) => {
        // Estimate page number (roughly 1500 chars per page)
        const pseudoPage =
          err.offset !== undefined ? Math.floor(err.offset / 1500) + 1 : "?";

        // Get context surrounding the error safely
        const start = Math.max(0, (err.offset || 0) - 60);
        const end = Math.min(
          text.length,
          (err.offset || 0) + (err.length || 0) + 60,
        );
        const prefix = text.substring(start, err.offset || 0);
        const issueText =
          err.offset !== undefined
            ? text.substring(err.offset, err.offset + err.length)
            : err.context || "Unknown";
        const suffix = text.substring(
          (err.offset || 0) + (err.length || 0),
          end,
        );

        return (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-400"></div>
            <div className="flex justify-between items-start mb-4 pl-2">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                  <AlertTriangle size={12} /> Grammar Issue
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                Approx. Page {pseudoPage}
              </span>
            </div>

            <div className="mb-5 pl-2">
              <p className="text-slate-800 font-medium text-base mb-2">
                {err.message}
              </p>
              {err.suggestion && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 inline-block">
                  <p className="text-emerald-800 text-sm font-semibold flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    Suggested Fix:{" "}
                    <span className="underline decoration-emerald-300 underline-offset-2">
                      {err.suggestion}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg font-serif text-slate-700 text-lg leading-relaxed border border-slate-200 shadow-inner">
              <span className="text-slate-400 leading-none mr-1">...</span>
              {prefix}
              <span className="bg-rose-200 text-rose-900 border-b-2 border-rose-400 rounded px-1 font-bold shadow-sm">
                {issueText}
              </span>
              {suffix}
              <span className="text-slate-400 leading-none ml-1">...</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AnalysisView = ({ doc, results, onBack }) => {
  const [activeTab, setActiveTab] = useState("rubric");
  const [showGrammar, setShowGrammar] = useState(false);
  const [showPlagiarism, setShowPlagiarism] = useState(false);

  // State to hold manual overrides for scores
  // Initialize from results or default
  const [scores, setScores] = useState({});
  const [rubricCriteria, setRubricCriteria] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const pdfUrlRef = useRef(null);

  // Only fetch PDF blob for PDF files
  useEffect(() => {
    const loadPdf = async () => {
      if (!doc) return;

      // Only load PDF for PDF files, not DOCX/TXT
      const isPdf =
        doc.file_type === "pdf" || doc.content_type === "application/pdf";
      if (!isPdf) {
        setLoadingPdf(false);
        return;
      }

      try {
        setLoadingPdf(true);
        const docId = doc._id || doc.id;
        const response = await api.get(`/documents/${docId}/view`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(response.data);
        pdfUrlRef.current = url;
        setPdfUrl(url);
      } catch (e) {
        console.error("Failed to load PDF:", e);
      } finally {
        setLoadingPdf(false);
      }
    };
    loadPdf();

    // Cleanup using ref to avoid stale closure
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, [doc]);

  useEffect(() => {
    if (results?.score_breakdown?.weighted_components) {
      // Map backend breakdown to UI format
      const criteria = results.score_breakdown.weighted_components.map((c) => ({
        id: c.name.toLowerCase().replace(/\s+/g, "_"),
        label: c.name,
        maxScore: 100, // Our backend uses 0-100 for everything
        weight: c.weight,
        description: c.reasoning || "Evaluated by AI",
        aiScore: c.raw_score,
      }));
      setRubricCriteria(criteria);

      const initialScores = {};
      criteria.forEach((c) => (initialScores[c.id] = c.aiScore));
      setScores(initialScores);
    }
  }, [results]);

  const handleScoreChange = (id, val) => {
    setScores((prev) => ({ ...prev, [id]: val }));
  };

  const calculateTotalScore = () => {
    let total = 0;
    rubricCriteria.forEach((c) => {
      const score = scores[c.id] || 0;
      // Weight is a percentage (e.g., 30 for 30%)
      // Score is 0-100.
      // Contribution = (Score * Weight) / 100
      total += (score * c.weight) / 100;
    });
    return total.toFixed(1);
  };

  if (!doc || !results)
    return <div className="p-8 text-center">Loading analysis...</div>;

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

  const handleDownload = async () => {
    try {
      const docId = doc._id || doc.id;
      const response = await api.get(`/documents/${docId}/view`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.original_filename || doc.filename || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  const handleFinalize = async () => {
    try {
      const finalScore = calculateTotalScore();
      // Use _id if available (Mongo default), fallback to id
      const docId = doc._id || doc.id;
      await api.post(`/evaluation/results/${docId}/finalize`, {
        final_score: parseFloat(finalScore),
        overrides: scores,
      });
      // Go back to dashboard after saving
      onBack();
    } catch (error) {
      console.error("Failed to finalize grade:", error);
      alert("Failed to save grade. Please try again.");
    }
  };

  const handlePrint = () => {
    setActiveTab("rubric");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden print:overflow-visible print:bg-white print:h-auto">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {doc.filename}
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                {doc.uploaded_by || "Student"}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Uploaded {new Date(doc.created_at).toLocaleDateString()} •{" "}
              {doc.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Current Grade
            </span>
            <span className="text-2xl font-bold text-indigo-600">
              {calculateTotalScore()}
              <span className="text-lg text-slate-400 font-normal">/100</span>
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Printer size={16} /> Export PDF
          </button>
          <button
            onClick={handleFinalize}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Save size={16} /> Finalize Grade
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden print:block print:overflow-visible print:h-auto">
        {/* Left Panel: Document Viewer */}
        <div className="flex-1 bg-slate-50 flex flex-col border-r border-slate-200 min-w-[50%] print:hidden">
          {/* Viewer Toolbar */}
          <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <FileText size={16} /> Document Viewer
              <span className="text-xs text-slate-400">
                ({doc.file_type?.toUpperCase()})
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Download document"
              >
                <Download size={12} /> Download
              </button>
              <button
                onClick={() => setShowGrammar(!showGrammar)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${showGrammar ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white border-slate-200 text-slate-500"}`}
              >
                <Highlighter size={12} /> Grammar
              </button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-hidden bg-slate-100">
            {loadingPdf ? (
              /* Loading State (only for PDFs) */
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-indigo-500 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-600 font-medium">Loading PDF...</p>
                  <p className="text-slate-400 text-sm mt-1">Please wait</p>
                </div>
              </div>
            ) : pdfUrl && !showGrammar ? (
              /* PDF Viewer - Only for PDF files and when grammar highlights are off */
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Document Viewer"
              />
            ) : doc.extracted_text ? (
              /* Text Viewer - For DOCX, TXT and fallback or Grammar highlight mode */
              <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-[800px] mx-auto bg-white min-h-[1000px] shadow-sm border border-slate-200 p-12 rounded-sm font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {(doc.file_type === "docx" ||
                    doc.file_type === "txt" ||
                    (pdfUrl && showGrammar)) && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <Info size={16} />
                        <span>
                          Viewing extracted text from{" "}
                          <strong>{doc.file_type?.toUpperCase()}</strong> file.
                          Click "Download" above to get the original file.
                        </span>
                      </p>
                    </div>
                  )}
                  {showGrammar ? (
                    <GrammarIssuesList
                      text={doc.extracted_text}
                      errors={results.components?.grammar?.errors || []}
                    />
                  ) : (
                    doc.extracted_text
                  )}
                </div>
              </div>
            ) : (
              /* Error State */
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">
                    No content available
                  </p>
                  <p className="text-slate-400 text-sm mb-4">
                    Text extraction may have failed
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <Download size={16} /> Download Original File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Evaluation Engine */}
        <div className="w-[450px] bg-white flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 print:w-full print:shadow-none print:border-none">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 print:hidden">
            <button
              onClick={() => setActiveTab("integrity")}
              className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === "integrity" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              <ShieldAlert size={16} /> Integrity
            </button>
            <button
              onClick={() => setActiveTab("rubric")}
              className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === "rubric" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              <Scale size={16} /> Rubric
            </button>
            <button
              onClick={() => setActiveTab("language")}
              className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === "language" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              <BrainCircuit size={16} /> Language
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar print:overflow-visible print:bg-white print:p-0">
            {activeTab === "integrity" && (
              <div className="space-y-6">
                {/* AI Suspicion Meter */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <BrainCircuit size={16} className="text-purple-600" /> AI
                    Content Detection
                  </h3>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${aiDetect?.score > 50 ? "bg-red-500" : "bg-green-500"} transition-all`}
                        style={{ width: `${aiDetect?.score || 0}%` }}
                      ></div>
                    </div>
                    <span
                      className={`font-bold text-sm ${aiDetect?.score > 50 ? "text-red-600" : "text-green-600"}`}
                    >
                      {aiDetect?.label || "Unknown"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {aiDetect?.reasoning || "No AI reasoning available."}
                  </p>
                </div>

                {/* Plagiarism Match */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-600" />{" "}
                    Plagiarism Check
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          Overall Similarity
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${plagiarism?.percentage > 20 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                        >
                          {plagiarism?.percentage || 0}% Match
                        </span>
                      </div>
                    </div>
                    {/* List matched docs if available */}
                    {plagiarism?.matches?.map((match, i) => (
                      <div
                        key={i}
                        className="p-3 bg-amber-50 border border-amber-100 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-amber-800">
                            {match.doc_id}
                          </span>
                          <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                            {match.similarity}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rubric" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100 print:hidden">
                  <span className="text-xs font-bold text-indigo-900">
                    Grading Mode
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const initialScores = {};
                        rubricCriteria.forEach(
                          (c) => (initialScores[c.id] = c.aiScore),
                        );
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
                  <div
                    key={c.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {c.label}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">
                          {c.description}
                        </p>
                      </div>
                      <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded print:bg-transparent print:border print:border-slate-300">
                        Weight: {c.weight}%
                      </div>
                    </div>

                    <div className="flex items-center gap-4 print:hidden">
                      <div className="flex-1">
                        <div className="relative pt-2 pb-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={scores[c.id] || 0}
                            onChange={(e) =>
                              handleScoreChange(c.id, parseInt(e.target.value))
                            }
                            className="w-full h-2.5 bg-gradient-to-r from-red-400 to-emerald-500 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-indigo-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center min-w-[3.5rem] print:hidden">
                        <span className="text-2xl font-bold text-indigo-700">
                          {scores[c.id] || 0}
                          <span className="text-sm text-slate-400 font-normal">
                            /100
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* AI Suggestion */}
                    <div className="mt-3 flex items-start gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100 print:border-none print:bg-transparent print:p-0">
                      <BrainCircuit
                        size={14}
                        className="text-indigo-600 mt-0.5 shrink-0 print:hidden"
                      />
                      <div>
                        <p className="text-xs text-indigo-900 font-medium print:text-slate-800 print:font-bold print:text-base">
                          Score: {scores[c.id] || c.aiScore}/100
                        </p>
                        <p className="text-[10px] text-indigo-700/80 leading-tight mt-1 print:hidden">
                          Accept this score or drag slider to override.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "language" && (
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${grammar?.score >= 80 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {grammar?.score || 0}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Grammar Score
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {grammar?.errors?.length || 0} issues found
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">
                    Vocabulary Richness
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">Score</span>
                        <span className="font-bold text-indigo-600">
                          {vocab?.score || 0}/100
                        </span>
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
                  <h3 className="text-sm font-bold text-slate-700 mb-2">
                    Topic Relevance
                  </h3>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Score</span>
                    <span className="font-bold text-green-600">
                      {results.components?.topic_relevance?.score || 0}/100
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${results.components?.topic_relevance?.score || 0}%`,
                      }}
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
