import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAIResults } from '@/services/mockApi';
import { FiArrowLeft, FiDownload, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiEdit3 } from 'react-icons/fi';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const results = mockAIResults;

  const radarData = [
    { subject: 'Grammar', score: results.grammarScore, fullMark: 100 },
    { subject: 'Relevance', score: results.relevanceScore, fullMark: 100 },
    { subject: 'Clarity', score: results.clarityScore, fullMark: 100 },
    { subject: 'Structure', score: 85, fullMark: 100 },
    { subject: 'Originality', score: 100 - results.plagiarismPercentage, fullMark: 100 },
  ];

  const comparisonData = [
    { category: 'Your Score', value: results.totalScore, fill: 'hsl(var(--primary))' },
    { category: 'Class Average', value: 78, fill: 'hsl(var(--muted-foreground))' },
    { category: 'Top Score', value: 95, fill: 'hsl(var(--success))' },
  ];

  const handleDownload = () => {
    // Simulate PDF download
    const blob = new Blob(['Mock PDF Report Content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EduScore_Report.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Evaluation Results</h1>
            <p className="text-muted-foreground">Physics Lab Report - January 15, 2024</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-card rounded-xl p-6 shadow-card text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${results.totalScore * 2.83} 283`}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <span className="text-3xl font-bold text-foreground">{results.totalScore}</span>
                <span className="text-muted-foreground">/{results.maxMarks}</span>
              </div>
            </div>
          </div>
          <p className="text-lg font-semibold text-foreground">Overall Score</p>
          <p className="text-sm text-success">Excellent Performance</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FiEdit3 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Grammar</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{results.grammarScore}%</p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${results.grammarScore}%` }} />
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Relevance</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{results.relevanceScore}%</p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${results.relevanceScore}%` }} />
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              results.plagiarismPercentage > 10 ? 'bg-destructive/10' : 'bg-success/10'
            }`}>
              <FiAlertCircle className={`w-5 h-5 ${
                results.plagiarismPercentage > 10 ? 'text-destructive' : 'text-success'
              }`} />
            </div>
            <span className="text-sm text-muted-foreground">Plagiarism</span>
          </div>
          <p className={`text-2xl font-bold ${
            results.plagiarismPercentage > 10 ? 'text-destructive' : 'text-success'
          }`}>
            {results.plagiarismPercentage}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Original content verified</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart - Strengths */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Comparison */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Score Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-success" />
            Strengths
          </h3>
          <ul className="space-y-3">
            {results.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-success/5">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="w-3.5 h-3.5 text-success" />
                </div>
                <span className="text-sm text-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-warning" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {results.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5">
                <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <FiAlertCircle className="w-3.5 h-3.5 text-warning" />
                </div>
                <span className="text-sm text-foreground">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Feedback */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Feedback Summary</h3>
        <p className="text-muted-foreground mb-6">{results.feedback}</p>
        
        <h4 className="font-medium text-foreground mb-3">Suggestions for Improvement</h4>
        <ul className="space-y-2">
          {results.suggestions.map((suggestion, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary">
                {idx + 1}
              </span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Highlighted Mistakes */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Highlighted Corrections</h3>
        <div className="space-y-3">
          {results.highlightedMistakes.map((mistake, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <span className="text-destructive line-through">{mistake.text}</span>
                <span className="mx-2 text-muted-foreground">→</span>
                <span className="text-success font-medium">{mistake.correction}</span>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground capitalize">
                {mistake.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
