import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Users, 
  Clock, 
  TrendingUp, 
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StatsCard = ({ title, value, change, icon: Icon, color }) => (
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
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-600 font-medium flex items-center">
        <TrendingUp className="h-4 w-4 mr-1" />
        {change}
      </span>
      <span className="text-gray-500 ml-2">from last month</span>
    </div>
  </div>
);

const DashboardPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents');
        setDocuments(response.data);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
        setError("Failed to load documents.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'evaluated': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate simple stats based on real data
  const totalDocs = documents.length;
  // Only count truly evaluated documents for the score average
  const evaluatedDocs = documents.filter(d => d.status === 'evaluated');
  const avgScore = evaluatedDocs.length > 0 
    ? (evaluatedDocs.reduce((acc, doc) => acc + (doc.final_score || 0), 0) / evaluatedDocs.length).toFixed(1) 
    : '-';

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
            value={totalDocs}
            change="+12%" 
            icon={FileText} 
            color="bg-blue-500" 
        />
        <StatsCard 
            title="Avg. Score" 
            value={avgScore}
            change="+2.1%" 
            icon={CheckCircle2} 
            color="bg-green-500" 
        />
        <StatsCard 
            title="Pending Review" 
            value={documents.filter(d => d.status === 'pending' || d.status === 'processing').length}
            change="-5%" 
            icon={Clock} 
            color="bg-orange-500" 
        />
        <StatsCard 
            title="Plagiarism Alerts" 
            value="-" 
            change="+1%" 
            icon={AlertCircle} 
            color="bg-red-500" 
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            <Link to="/documents" className="text-sm font-medium text-primary-600 hover:text-primary-500">
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
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {doc.final_score !== undefined && doc.final_score !== null ? doc.final_score : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link 
                                        to={(doc.status === 'evaluated' || doc.status === 'completed') ? `/results/${doc._id}` : '#'} 
                                        className="text-primary-600 hover:text-primary-900 mr-4"
                                    >
                                        View
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
