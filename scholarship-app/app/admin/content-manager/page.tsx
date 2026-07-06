'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    RotateCw,
    AlertCircle,
    Edit2,
    CheckCircle,
    X,
    Plus,
    Trash2,
    Save,
    ExternalLink
} from 'lucide-react';

interface FaqItem {
    question: string;
    answer: string;
}

interface Scholarship {
    id: string;
    title: string;
    slug: string;
    provider: string;
    provider_type: string;
    state: string;
    level: string;
    caste: string;
    gender: string;
    amount_annual: number;
    deadline: string;
    docs_needed: string;
    helpline: string;
    faq_json: string;
    selection: string;
    step_guide: string;
    renewal: string;
    verified_status: string;
    official_source: string;
}

export default function ContentManager() {
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stateFilter, setStateFilter] = useState('All');
    const [verifiedFilter, setVerifiedFilter] = useState('All');

    // Modal editing state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [docsInput, setDocsInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveWarning, setSaveWarning] = useState<string | null>(null);

    const fetchScholarships = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/content');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch scholarship records.');
            }
            const data = await res.json();
            setScholarships(data.scholarships);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScholarships();
    }, []);

    // Open edit modal
    const handleEditClick = (s: Scholarship) => {
        setEditingScholarship({ ...s });
        
        // Parse FAQs
        let parsedFaqs: FaqItem[] = [];
        if (s.faq_json) {
            try {
                parsedFaqs = JSON.parse(s.faq_json);
            } catch {}
        }
        setFaqs(parsedFaqs);

        // Parse Docs Needed
        let parsedDocs = '';
        if (s.docs_needed) {
            try {
                const arr = JSON.parse(s.docs_needed);
                if (Array.isArray(arr)) parsedDocs = arr.join('\n');
                else parsedDocs = s.docs_needed;
            } catch {
                parsedDocs = s.docs_needed;
            }
        }
        setDocsInput(parsedDocs);
        setSaveWarning(null);
        setIsEditModalOpen(true);
    };

    // Close edit modal
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingScholarship(null);
        setFaqs([]);
        setDocsInput('');
        setSaveWarning(null);
    };

    // Handle Form Inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!editingScholarship) return;
        const { name, value } = e.target;
        setEditingScholarship(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [name]: value
            };
        });
    };

    // FAQ handlers
    const handleAddFaq = () => {
        setFaqs(prev => [...prev, { question: '', answer: '' }]);
    };

    const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
        setFaqs(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleRemoveFaq = (index: number) => {
        setFaqs(prev => prev.filter((_, i) => i !== index));
    };

    // Submit DB changes
    const handleSaveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingScholarship) return;

        setSaving(true);
        setSaveWarning(null);

        // Parse docs needed lines to array
        const docsArray = docsInput
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);

        // Construct update payload
        const payload = {
            id: editingScholarship.id,
            verified_status: editingScholarship.verified_status,
            amount_annual: Number(editingScholarship.amount_annual) || 0,
            deadline: editingScholarship.deadline,
            docs_needed: docsArray,
            helpline: editingScholarship.helpline,
            faq_json: faqs.filter(f => f.question.trim() && f.answer.trim()),
            selection: editingScholarship.selection,
            step_guide: editingScholarship.step_guide,
            renewal: editingScholarship.renewal
        };

        try {
            const res = await fetch('/api/admin/content/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to save changes.');
            }

            if (data.warning) {
                setSaveWarning(data.warning);
            }

            // Sync successfully, reload lists
            await fetchScholarships();
            
            if (!data.warning) {
                handleCloseModal();
            }
        } catch (err: any) {
            alert('Error saving record: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Filter scholarships
    const filteredScholarships = scholarships.filter(s => {
        const matchesSearch = 
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.slug.toLowerCase().includes(searchQuery.toLowerCase());
            
        const isVerified = ['yes', 'verified', 'true'].includes(String(s.verified_status).toLowerCase());
        const matchesVerified =
            verifiedFilter === 'All' ||
            (verifiedFilter === 'Verified' && isVerified) ||
            (verifiedFilter === 'Draft' && !isVerified);

        const matchesState =
            stateFilter === 'All' ||
            s.state === stateFilter;

        return matchesSearch && matchesVerified && matchesState;
    });

    // Unique states for filters
    const uniqueStates = Array.from(new Set(scholarships.map(s => s.state).filter(Boolean))).sort();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
                <RotateCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-xs font-bold tracking-wider uppercase">Loading database records...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto text-gray-400">
                <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Database Load Failed</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">{error}</p>
                <button 
                    onClick={fetchScholarships}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    Retry Loading Database
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            
            {/* Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Database Content Manager</h1>
                    <p className="text-sm text-gray-400 mt-1">Directly edit, verify, and update scholarship entries inside your SQLite database.</p>
                </div>
            </div>

            {/* Filters panel */}
            <div className="bg-[#0e1629] border border-gray-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search schemes by name or provider..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#121a2e] border border-gray-800 hover:border-gray-700 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-200 outline-none transition-all"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">State:</span>
                        <select 
                            value={stateFilter} 
                            onChange={(e) => setStateFilter(e.target.value)}
                            className="bg-[#121a2e] border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-1.5 outline-none hover:border-gray-700 transition-colors max-w-[150px]"
                        >
                            <option value="All">All States</option>
                            {uniqueStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Status:</span>
                        <select 
                            value={verifiedFilter} 
                            onChange={(e) => setVerifiedFilter(e.target.value)}
                            className="bg-[#121a2e] border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-1.5 outline-none hover:border-gray-700 transition-colors"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Verified">Verified Only</option>
                            <option value="Draft">Draft Only</option>
                        </select>
                    </div>
                </div>

            </div>

            {/* Scholarships Table List */}
            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-[#0c1220]/40">
                                <th className="p-4 pl-6">Scholarship Title</th>
                                <th className="p-4">Domicile State</th>
                                <th className="p-4">Amount (Annual)</th>
                                <th className="p-4">Deadline</th>
                                <th className="p-4 text-center">Verification Status</th>
                                <th className="p-4 pr-6 text-center">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-xs text-gray-300">
                            {filteredScholarships.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">No scholarships found.</td>
                                </tr>
                            ) : (
                                filteredScholarships.map(s => {
                                    const isVerified = ['yes', 'verified', 'true'].includes(String(s.verified_status).toLowerCase());
                                    return (
                                        <tr key={s.id} className="hover:bg-[#121a2e]/30 transition-colors">
                                            <td className="p-4 pl-6 max-w-sm">
                                                <span className="font-bold text-gray-200 block truncate">{s.title}</span>
                                                <span className="text-[10px] text-gray-500 block truncate mt-0.5">{s.provider}</span>
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {s.state || 'All India'}
                                            </td>
                                            <td className="p-4 font-bold text-emerald-400">
                                                {s.amount_annual > 0 ? `₹${s.amount_annual.toLocaleString('en-IN')}` : 'Varies'}
                                            </td>
                                            <td className="p-4 text-gray-400 font-mono text-[11px]">
                                                {s.deadline || 'Check Portal'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest ${
                                                    isVerified 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}>
                                                    {isVerified ? 'Verified' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-center">
                                                <button 
                                                    onClick={() => handleEditClick(s)}
                                                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700 inline-flex items-center justify-center cursor-pointer"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Database Row Edit Modal Dialog */}
            {isEditModalOpen && editingScholarship && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0d1324] border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
                        
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-[#0d1324] z-10 border-b border-gray-800/80 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-extrabold text-white text-base">Edit Scholarship Entry</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-xl">Updates write directly to sqlite `scholarships.db` and auto-regen WordPress migration files.</p>
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-800 text-gray-500 hover:text-white rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Save Warning Notification */}
                        {saveWarning && (
                            <div className="m-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 items-start">
                                <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-amber-200 text-xs">Saved, but Synchronization Warning:</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed mt-1">{saveWarning}</p>
                                    <button 
                                        onClick={handleCloseModal}
                                        className="mt-3 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Close Modal & Finish
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Modal Form */}
                        <form onSubmit={handleSaveSubmit} className="p-6 space-y-6">
                            
                            {/* Grid Block 1: Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#12192e]/40 p-5 rounded-2xl border border-gray-850">
                                
                                <div className="md:col-span-3">
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Scholarship Title</label>
                                    <input 
                                        type="text" 
                                        value={editingScholarship.title}
                                        disabled
                                        className="w-full bg-[#0a0d16] border border-gray-800 rounded-xl py-2 px-3 text-xs text-gray-500 outline-none cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Verification Status</label>
                                    <select
                                        name="verified_status"
                                        value={editingScholarship.verified_status}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#121a2e] border border-gray-800 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none focus:border-blue-500/80 transition-colors"
                                    >
                                        <option value="Draft">Draft (Pending Verification)</option>
                                        <option value="Verified">Verified (Audited & Active)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Annual Funding (Max ₹)</label>
                                    <input 
                                        type="number" 
                                        name="amount_annual"
                                        value={editingScholarship.amount_annual || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 50000"
                                        className="w-full bg-[#121a2e] border border-gray-800 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none focus:border-blue-500/80 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Application Last Date</label>
                                    <input 
                                        type="text" 
                                        name="deadline"
                                        value={editingScholarship.deadline || ''}
                                        onChange={handleInputChange}
                                        placeholder="YYYY-MM-DD or Not specified"
                                        className="w-full bg-[#121a2e] border border-gray-800 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none focus:border-blue-500/80 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Text inputs group */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Official Helpline Details</label>
                                    <input 
                                        type="text" 
                                        name="helpline"
                                        value={editingScholarship.helpline || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 011-123456 or help@domain.org"
                                        className="w-full bg-[#121a2e] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-gray-300 outline-none focus:border-blue-500/80 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Required Documents Checklist (One document per line)</label>
                                    <textarea 
                                        value={docsInput}
                                        onChange={(e) => setDocsInput(e.target.value)}
                                        rows={4}
                                        placeholder="Aadhaar Card&#10;Income Certificate&#10;Marks Card (Class 10)"
                                        className="w-full bg-[#121a2e] border border-gray-800 rounded-xl p-3 text-xs text-gray-300 outline-none focus:border-blue-500/80 transition-colors font-sans"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Selection Criteria</label>
                                        <textarea 
                                            name="selection"
                                            value={editingScholarship.selection || ''}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className="w-full bg-[#121a2e] border border-gray-800 rounded-xl p-3 text-xs text-gray-300 outline-none focus:border-blue-500/80 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Step-by-step Application Guide</label>
                                        <textarea 
                                            name="step_guide"
                                            value={editingScholarship.step_guide || ''}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className="w-full bg-[#121a2e] border border-gray-800 rounded-xl p-3 text-xs text-gray-300 outline-none focus:border-blue-500/80 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Renewal Terms & Conditions</label>
                                        <textarea 
                                            name="renewal"
                                            value={editingScholarship.renewal || ''}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className="w-full bg-[#121a2e] border border-gray-800 rounded-xl p-3 text-xs text-gray-300 outline-none focus:border-blue-500/80 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* FAQs Section */}
                            <div className="border-t border-gray-800 pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Dynamic Q&A FAQ Block</label>
                                    <button 
                                        type="button"
                                        onClick={handleAddFaq}
                                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/15 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add FAQ Question
                                    </button>
                                </div>

                                {faqs.length === 0 ? (
                                    <p className="text-[11px] text-gray-500 italic p-4 text-center border border-dashed border-gray-850 rounded-xl">No FAQ questions added yet. Renders fallback visual templates.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {faqs.map((faq, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 bg-[#121a2e]/50 border border-gray-850 rounded-2xl relative group">
                                                <div className="flex-1 space-y-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Question?"
                                                        value={faq.question}
                                                        onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                                                        className="w-full bg-[#0a0d16] border border-gray-800 rounded-lg py-1.5 px-3 text-xs text-gray-200 outline-none"
                                                    />
                                                    <textarea 
                                                        placeholder="Answer text..."
                                                        value={faq.answer}
                                                        onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                                                        rows={2}
                                                        className="w-full bg-[#0a0d16] border border-gray-800 rounded-lg py-1.5 px-3 text-xs text-gray-300 outline-none"
                                                    />
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveFaq(idx)}
                                                    className="p-2 self-center hover:bg-rose-500/10 text-gray-600 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                                    title="Remove FAQ"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form Actions Footer */}
                            <div className="sticky bottom-0 bg-[#0d1324] border-t border-gray-850 pt-4 flex items-center justify-between gap-4">
                                {editingScholarship.official_source && (
                                    <a 
                                        href={editingScholarship.official_source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 hover:underline"
                                    >
                                        Official portal source
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                <div className="flex items-center gap-3 ml-auto">
                                    <button 
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                                    >
                                        {saving ? (
                                            <RotateCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {saving ? 'Saving...' : 'Save & Audit Database'}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
