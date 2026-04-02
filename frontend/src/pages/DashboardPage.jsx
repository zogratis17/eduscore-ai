import React, { useEffect, useState } from 'react';
import {
  FileText,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Minus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { analyticsService } from '../services/analyticsService';

const StatsCard = ({ title, value, change, icon: Icon, color, delay }) => {
  const isPositive = change && change.startsWith('+') && change !== '+0';
  const isNegative = change && change.startsWith('-');
  const hasChange = change && change !== '' && change !== '0';

  // Map simple color strings back to gradient classes
  const colorMap = {
    'bg-blue-500': 'from-blue-500 to-indigo-600 shadow-blue-500/20',
    'bg-green-500': 'from-emerald-400 to-emerald-600 shadow-emerald-500/20',
    'bg-orange-500': 'from-amber-400 to-orange-500 shadow-orange-500/20',
    'bg-red-500': 'from-rose-400 to-red-500 shadow-red-500/20',
  };
  const gradientClass = colorMap[color] || 'from-gray-400 to-gray-500 shadow-gray-500/20';

  return (
    <div 
      className={`glass card-lift rounded-2xl p-6 animate-slide-up bg-white`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{title}</p>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
      {hasChange && (
        <div className="mt-4 flex items-center text-sm font-medium">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 
            isNegative ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-600'
          }`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5 mr-1" /> : 
             isNegative ? <TrendingDown className="h-3.5 w-3.5 mr-1" /> : 
             <Minus className="h-3.5 w-3.5 mr-1" />}
            {change}
          </span>
          <span className="text-gray-400 ml-2 text-xs">vs last month</span>
        </div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isPolling = false) => {
    try {
      // Don't set loading on updates to avoid UI flicker
      if (!isPolling) setLoading(true);

      const [docsRes, statsRes] = await Promise.all([
        api.get('/documents'),
        analyticsService.getDashboardStats(),
      ]);
      setDocuments(docsRes.data);
      setStats(statsRes);

      // Fetch grade distribution (non-blocking)
      try {
        const gradeRes = await analyticsService.getGradeDistribution();
        setGradeData(gradeRes);
      } catch (e) {
        console.warn('Grade distribution not available yet');
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      if (!isPolling) setError("Failed to load dashboard data.");
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Poll for updates if any documents are processing
  useEffect(() => {
    // Poll if any doc is pending/processing OR if we just uploaded (to catch new ones)
    // We can just poll every 10s generally, or 5s if active.
    const hasActive = documents.some(doc =>
      ['pending', 'processing'].includes(doc.status)
    );

    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, hasActive ? 3000 : 10000); // 3s if active, 10s idle

    return () => clearInterval(intervalId);
  }, [documents.map(d => d.status).join(',')]); // Re-bind when any doc's status changes

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'graded': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10';
      case 'evaluated': return 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/10';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200/60 ring-1 ring-blue-500/10';
      case 'processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-1 ring-indigo-500/10';
      case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200/60 ring-1 ring-gray-500/10';
      case 'failed':
      case 'failed_evaluation': return 'bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/10';
      default: return 'bg-gray-50 text-gray-600 border-gray-200/60 ring-1 ring-gray-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'graded': return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case 'evaluated': return <AlertCircle className="h-3 w-3 mr-1" />; // Needs Review
      case 'completed': return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case 'processing': return <Clock className="h-3 w-3 mr-1 animate-spin" />;
      case 'pending': return <Clock className="h-3 w-3 mr-1" />;
      case 'failed':
      case 'failed_evaluation': return <AlertCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'evaluated') return 'Needs Review';
    if (status === 'graded') return 'Graded';
    return status;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-glow-sm transition-all duration-200"
        >
          <div className="p-1 bg-white/20 rounded-md mr-2">
            <Users className="h-4 w-4" />
          </div>
          New Evaluation
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Documents"
          value={stats?.total_documents?.value ?? 0}
          change={stats?.total_documents?.change || ""}
          icon={FileText}
          color="bg-blue-500"
          delay="0ms"
        />
        <StatsCard
          title="Avg. Score"
          value={stats?.average_score?.value ?? 0}
          change={stats?.average_score?.change || ""}
          icon={CheckCircle2}
          color="bg-green-500"
          delay="50ms"
        />
        <StatsCard
          title="Pending Review"
          value={stats?.pending_review?.value ?? 0}
          change={stats?.pending_review?.change || ""}
          icon={Clock}
          color="bg-orange-500"
          delay="100ms"
        />
        <StatsCard
          title="Alerts"
          value={stats?.alerts?.value ?? 0}
          change={stats?.alerts?.change || ""}
          icon={AlertCircle}
          color="bg-red-500"
          delay="150ms"
        />
      </div>

      {/* Grade Distribution Chart */}
      {gradeData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                formatter={(value) => [`${value} essays`, 'Count']}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity */}
      <div className="glass rounded-2xl overflow-hidden bg-white animate-slide-up" style={{ animationDelay: '250ms' }}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Submissions</h2>
          <Link to="/results" className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading documents...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : documents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No documents found. Upload one to get started!</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {documents.slice(0, 5).map((doc, idx) => (
                  <tr key={doc._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100/80 rounded-lg mr-3 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200/60">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(doc.status === 'graded' || doc.status === 'evaluated') ? (
                        <span className="text-indigo-600 font-bold">{doc.final_score}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={(doc.status === 'evaluated' || doc.status === 'completed' || doc.status === 'graded') ? `/results/${doc._id}` : '#'}
                        className={`mr-4 ${doc.status === 'evaluated' ? 'text-amber-600 font-bold hover:text-amber-700' : 'text-primary-600 hover:text-primary-900'}`}
                      >
                        {doc.status === 'evaluated' ? 'Review Grade' : 'View'}
                      </Link>
                      <button className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
