import React, { useState } from 'react';
import { FileText, Calendar, ArrowRight, Trash2, Clock, CheckCircle2 } from 'lucide-react';

const DocumentGrid = ({ documents, onSelect, onDelete }) => {
    if (!documents || documents.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No previous evaluations found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
                <div
                    key={doc._id}
                    onClick={() => onSelect(doc._id)}
                    className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer relative"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText size={20} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${doc.status === 'completed' ? 'bg-green-100 text-green-700' :
                                doc.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-100 text-gray-600'
                            }`}>
                            {doc.status}
                        </span>
                    </div>

                    <h3 className="font-bold text-gray-800 mb-1 truncate pr-6">{doc.filename}</h3>
                    <p className="text-xs text-gray-500 mb-4">
                        Uploaded by {doc.uploaded_by || 'Unknown'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-400 gap-1">
                            <Calendar size={12} />
                            {new Date(doc.created_at).toLocaleDateString()}
                        </div>

                        {doc.final_score ? (
                            <span className="text-lg font-bold text-indigo-600">
                                {doc.final_score}<span className="text-xs text-gray-400 font-normal">/100</span>
                            </span>
                        ) : (
                            <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-600" />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentGrid;
