import React, { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

const EssayViewer = ({ text, grammarErrors = [] }) => {
  const [selectedError, setSelectedError] = useState(null);

  // Merge text and errors into segments
  const segments = useMemo(() => {
    if (!text) return [];
    
    // Sort errors by offset
    const sortedErrors = [...grammarErrors].sort((a, b) => a.offset - b.offset);
    
    const result = [];
    let lastIndex = 0;
    
    sortedErrors.forEach((error, idx) => {
      // Safety check for overlapping ranges (simplification: skip overlaps)
      if (error.offset < lastIndex) return;
      
      // Text before error
      if (error.offset > lastIndex) {
        result.push({
          text: text.slice(lastIndex, error.offset),
          type: 'text'
        });
      }
      
      // Error text
      const end = error.offset + error.length;
      result.push({
        text: text.slice(error.offset, end),
        type: 'error',
        data: error,
        id: idx
      });
      
      lastIndex = end;
    });
    
    // Remaining text
    if (lastIndex < text.length) {
      result.push({
        text: text.slice(lastIndex),
        type: 'text'
      });
    }
    
    return result;
  }, [text, grammarErrors]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
      {/* Text Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-8 overflow-y-auto font-serif text-lg leading-relaxed whitespace-pre-wrap">
        {segments.map((seg, i) => {
          if (seg.type === 'error') {
            const isSelected = selectedError?.id === seg.id;
            return (
              <span
                key={i}
                onClick={() => setSelectedError(isSelected ? null : { ...seg.data, id: seg.id })}
                className={`cursor-pointer transition-colors border-b-2 ${
                  isSelected 
                    ? 'bg-red-100 border-red-500' 
                    : 'bg-red-50 border-red-200 hover:bg-red-100'
                }`}
              >
                {seg.text}
              </span>
            );
          }
          return <span key={i}>{seg.text}</span>;
        })}
      </div>

      {/* Sidebar / Inspector */}
      <div className="w-full lg:w-80 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Feedback Inspector
        </h3>
        
        {selectedError ? (
          <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
            <h4 className="font-semibold text-red-700 mb-2">Issue Detected</h4>
            <p className="text-gray-700 mb-3">{selectedError.message}</p>
            {selectedError.suggestion && (
              <div className="bg-green-50 p-2 rounded border border-green-100">
                <span className="text-xs font-bold text-green-700 uppercase">Suggestion</span>
                <p className="text-green-800 font-medium mt-1">{selectedError.suggestion}</p>
              </div>
            )}
            <button 
              onClick={() => setSelectedError(null)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">Click on highlighted text to view detailed feedback.</p>
            <div className="mt-4 text-xs bg-white p-2 rounded border border-gray-200 inline-block">
              {grammarErrors.length} issues found
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EssayViewer;
