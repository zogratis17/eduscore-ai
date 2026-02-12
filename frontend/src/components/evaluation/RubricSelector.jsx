import React, { useState, useEffect } from 'react';
import { BookOpen, Check } from 'lucide-react';
import api from '../../services/api';

const RubricSelector = ({ selectedRubricId, onSelect }) => {
    const [rubrics, setRubrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRubrics = async () => {
            try {
                const response = await api.get('/rubrics');
                setRubrics(response.data);

                // Auto-select default if nothing selected
                if (!selectedRubricId && response.data.length > 0) {
                    const defaultRubric = response.data.find(r => r.is_default);
                    if (defaultRubric) {
                        onSelect(defaultRubric._id);
                    } else {
                        onSelect(response.data[0]._id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch rubrics", err);
                setError("Failed to load rubrics");
            } finally {
                setLoading(false);
            }
        };

        fetchRubrics();
    }, [onSelect, selectedRubricId]);

    if (loading) return <div className="text-sm text-gray-500">Loading rubrics...</div>;
    if (error) return <div className="text-sm text-red-500">Error loading rubrics. Using system default.</div>;

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Evaluation Rubric
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {rubrics.map((rubric) => (
                    <div
                        key={rubric._id}
                        onClick={() => onSelect(rubric._id)}
                        className={`
              relative flex items-start p-3 rounded-lg border cursor-pointer transition-all
              ${selectedRubricId === rubric._id
                                ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                : 'border-gray-200 hover:border-gray-300 bg-white'}
            `}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            <BookOpen className={`h-5 w-5 ${selectedRubricId === rubric._id ? 'text-primary-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${selectedRubricId === rubric._id ? 'text-primary-900' : 'text-gray-900'}`}>
                                    {rubric.name}
                                </p>
                                {selectedRubricId === rubric._id && (
                                    <Check className="h-4 w-4 text-primary-600" />
                                )}
                            </div>
                            <p className={`mt-1 text-xs ${selectedRubricId === rubric._id ? 'text-primary-700' : 'text-gray-500'}`}>
                                {rubric.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RubricSelector;
