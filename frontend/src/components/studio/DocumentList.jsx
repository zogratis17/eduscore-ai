import React, { useEffect, useState } from 'react';
import { FileText, Clock, AlertCircle, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';
import api from '../../services/api';

const DocumentList = ({ onSelect, selectedId }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents');
            setDocuments(res.data);
        } catch (err) {
            console.error("Failed to fetch documents:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        // Poll for updates (simplified for sidebar)
        const interval = setInterval(fetchDocuments, 10000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
            case 'evaluated': return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
            case 'processing': return <Clock className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
            case 'pending': return <Clock className="h-3.5 w-3.5 text-gray-400" />;
            case 'failed':
            case 'failed_evaluation': return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
            default: return null;
        }
    };

    if (loading) return <div className="p-4 text-xs text-gray-400 text-center">Loading library...</div>;

    return (
        <div className="space-y-1">
            {documents.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-xs">
                    No documents yet.
                </div>
            )}

            {documents.map((doc) => (
                <div
                    key={doc._id}
                    onClick={() => onSelect(doc._id)}
                    className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${selectedId === doc._id
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                >
                    <div className="flex items-center min-w-0 gap-3">
                        <div className={`p-1.5 rounded-md ${selectedId === doc._id ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            <FileText className={`h-4 w-4 ${selectedId === doc._id ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${selectedId === doc._id ? 'text-blue-900' : 'text-gray-900'}`}>
                                {doc.filename}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                {getStatusIcon(doc.status)}
                                <span className="text-xs text-gray-400 truncate">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Hover Actions */}
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-400">
                        <MoreVertical className="h-3 w-3" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default DocumentList;
