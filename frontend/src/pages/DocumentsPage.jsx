import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents');
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(doc => (doc._id || doc.id) !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'graded': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10';
      case 'evaluated': return 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/10';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200/60 ring-1 ring-blue-500/10';
      case 'processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-1 ring-indigo-500/10';
      case 'failed':
      case 'failed_evaluation': return 'bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/10';
      default: return 'bg-gray-50 text-gray-600 border-gray-200/60 ring-1 ring-gray-500/10';
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Documents</h1>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">Manage and view all student submissions.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={fetchDocuments}
                className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200"
            >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link 
                to="/upload" 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-glow-sm transition-all duration-200"
            >
                Upload New
            </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glass bg-white p-5 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200/80 rounded-xl leading-5 bg-surface-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 sm:text-sm transition-all duration-200"
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2.5 border border-gray-200/80 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            Filters
        </button>
      </div>

      {/* Documents Table */}
      <div className="glass bg-white rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        [1,2,3].map(i => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan="6" className="px-6 py-4 h-16 bg-gray-50/50"></td>
                            </tr>
                        ))
                    ) : filteredDocs.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                                No documents found. Upload one to get started!
                            </td>
                        </tr>
                    ) : (
                        filteredDocs.map((doc) => (
                            <tr key={doc.id || doc._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gray-100/80 rounded-lg mr-3 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200/60">
                                            <FileText className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{doc.filename}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                                    {doc.file_type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(doc.file_size_bytes / 1024).toFixed(1)} KB
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        {(doc.status === 'completed' || doc.status === 'evaluated' || doc.status === 'graded') && (
                                            <Link 
                                                to={`/results/${doc.id || doc._id}`}
                                                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(doc.id || doc._id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
