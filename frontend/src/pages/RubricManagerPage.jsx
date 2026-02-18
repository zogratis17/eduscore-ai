import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ClipboardList, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';

const emptyRow = () => ({ name: '', description: '', weight: '' });

const RubricManagerPage = () => {
    const [rubrics, setRubrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [criteria, setCriteria] = useState([emptyRow(), emptyRow(), emptyRow()]);

    useEffect(() => {
        fetchRubrics();
    }, []);

    const fetchRubrics = async () => {
        try {
            const res = await api.get('/rubrics');
            setRubrics(res.data);
        } catch (err) {
            console.error('Failed to fetch rubrics:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setCriteria([emptyRow(), emptyRow(), emptyRow()]);
        setEditingId(null);
        setFormError('');
        setShowForm(false);
    };

    const totalWeight = criteria.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);

    const handleSave = async () => {
        setFormError('');

        if (!name.trim()) {
            setFormError('Rubric name is required.');
            return;
        }
        if (criteria.filter(c => c.name.trim()).length < 2) {
            setFormError('At least 2 criteria are required.');
            return;
        }
        if (Math.abs(totalWeight - 100) > 0.1) {
            setFormError(`Weights must sum to 100% (currently ${totalWeight}%).`);
            return;
        }

        const validCriteria = criteria
            .filter(c => c.name.trim())
            .map(c => ({
                name: c.name.trim(),
                description: c.description.trim(),
                weight: parseFloat(c.weight) || 0,
            }));

        const payload = {
            name: name.trim(),
            description: description.trim(),
            criteria: validCriteria,
        };

        try {
            if (editingId) {
                await api.put(`/rubrics/${editingId}`, payload);
                setSuccessMsg('Rubric updated successfully!');
            } else {
                await api.post('/rubrics', payload);
                setSuccessMsg('Rubric created successfully!');
            }
            resetForm();
            fetchRubrics();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            const detail = err.response?.data?.detail;
            let message = 'Failed to save rubric.';
            if (typeof detail === 'string') {
                message = detail;
            } else if (Array.isArray(detail)) {
                message = detail.map(d => d.msg || JSON.stringify(d)).join('; ');
            }
            setFormError(message);
        }
    };

    const handleEdit = (rubric) => {
        setName(rubric.name);
        setDescription(rubric.description || '');
        setCriteria(
            rubric.criteria.map(c => ({
                name: c.name,
                description: c.description || '',
                weight: String(c.weight),
            }))
        );
        setEditingId(rubric._id);
        setShowForm(true);
        setFormError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this rubric? This cannot be undone.')) return;
        try {
            await api.delete(`/rubrics/${id}`);
            setRubrics(rubrics.filter(r => r._id !== id));
            setSuccessMsg('Rubric deleted.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const updateCriterion = (index, field, value) => {
        const updated = [...criteria];
        updated[index] = { ...updated[index], [field]: value };
        setCriteria(updated);
    };

    const addRow = () => setCriteria([...criteria, emptyRow()]);
    const removeRow = (i) => setCriteria(criteria.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rubric Manager</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Create and manage evaluation rubrics for essay scoring.
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Rubric
                    </button>
                )}
            </div>

            {/* Success message */}
            {successMsg && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                    <Check className="h-4 w-4" />
                    {successMsg}
                </div>
            )}

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {editingId ? 'Edit Rubric' : 'Create New Rubric'}
                        </h2>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {formError && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {formError}
                        </div>
                    )}

                    {/* Name & Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rubric Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Research Paper Rubric"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this rubric..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Criteria Table */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Criteria (weights must total 100%)
                            </label>
                            <span className={`text-sm font-medium ${Math.abs(totalWeight - 100) < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                                Total: {totalWeight}%
                            </span>
                        </div>
                        <div className="space-y-2">
                            {criteria.map((c, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={c.name}
                                        onChange={(e) => updateCriterion(i, 'name', e.target.value)}
                                        placeholder="Criterion name"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <input
                                        type="text"
                                        value={c.description}
                                        onChange={(e) => updateCriterion(i, 'description', e.target.value)}
                                        placeholder="Description (optional)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <div className="relative w-24">
                                        <input
                                            type="number"
                                            value={c.weight}
                                            onChange={(e) => updateCriterion(i, 'weight', e.target.value)}
                                            placeholder="Weight"
                                            min="0"
                                            max="100"
                                            className="w-full px-3 py-2 pr-7 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        <span className="absolute right-2 top-2.5 text-gray-400 text-sm">%</span>
                                    </div>
                                    <button
                                        onClick={() => removeRow(i)}
                                        disabled={criteria.length <= 2}
                                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addRow}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                            <Plus className="h-3 w-3" />
                            Add criterion
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {editingId ? 'Update Rubric' : 'Create Rubric'}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Rubric List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading rubrics...</div>
                ) : rubrics.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No rubrics found. Create your first one above!</p>
                    </div>
                ) : (
                    rubrics.map((rubric) => (
                        <div
                            key={rubric._id}
                            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-gray-900">{rubric.name}</h3>
                                        {rubric.is_default && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    {rubric.description && (
                                        <p className="text-sm text-gray-500 mt-1">{rubric.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(rubric)}
                                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-50"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    {!rubric.is_default && (
                                        <button
                                            onClick={() => handleDelete(rubric._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Criteria pills */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {rubric.criteria?.map((c, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                    >
                                        {c.name}
                                        <span className="text-gray-400">·</span>
                                        <span className="text-primary-600">{c.weight}%</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RubricManagerPage;
