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
      case 'evaluated': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and view all student submissions.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={fetchDocuments}
                className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-200"
            >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link 
                to="/upload" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
                Upload New
            </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filters
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                            <tr key={doc.id || doc._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">{doc.filename}</span>
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
                                        {(doc.status === 'completed' || doc.status === 'evaluated') && (
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
