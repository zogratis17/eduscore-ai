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

const StatsCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change && change.startsWith('+') && change !== '+0';
  const isNegative = change && change.startsWith('-');
  const hasChange = change && change !== '' && change !== '0';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {hasChange && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium flex items-center ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : isNegative ? <TrendingDown className="h-4 w-4 mr-1" /> : <Minus className="h-4 w-4 mr-1" />}
            {change}
          </span>
          <span className="text-gray-500 ml-2">vs last month</span>
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
  }, [documents.length]); // Re-bind if list length changes (e.g. new upload), but not on status change to avoid jitter

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'graded': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'evaluated': return 'bg-amber-100 text-amber-800 border-amber-200'; // Needs Review
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed':
      case 'failed_evaluation': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Users className="h-4 w-4 mr-2" />
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
        />
        <StatsCard
          title="Avg. Score"
          value={stats?.average_score?.value ?? 0}
          change={stats?.average_score?.change || ""}
          icon={CheckCircle2}
          color="bg-green-500"
        />
        <StatsCard
          title="Pending Review"
          value={stats?.pending_review?.value ?? 0}
          change={stats?.pending_review?.change || ""}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatsCard
          title="Alerts"
          value={stats?.alerts?.value ?? 0}
          change={stats?.alerts?.change || ""}
          icon={AlertCircle}
          color="bg-red-500"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
          <Link to="/results" className="text-sm font-medium text-primary-600 hover:text-primary-500">
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
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.slice(0, 5).map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{doc.filename}</span>
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
                      {doc.status === 'graded' ? (
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
