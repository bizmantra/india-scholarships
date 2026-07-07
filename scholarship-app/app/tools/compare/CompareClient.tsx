'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { ArrowLeftRight, HelpCircle, X } from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

export default function CompareClient({ scholarships }: Props) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelect = (id: string) => {
        if (!id) return;
        if (selectedIds.includes(id)) return;
        if (selectedIds.length >= 3) return;
        setSelectedIds(prev => [...prev, id]);
    };

    const handleRemove = (id: string) => {
        setSelectedIds(prev => prev.filter(x => x !== id));
    };

    const comparedScholarships = selectedIds.map(id => scholarships.find(s => s.id === id)).filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-sm text-gray-500 mb-6">
                        <a href="/tools" className="hover:text-blue-700 font-medium">Tools</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Scholarship Compare Tool</span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                                <ArrowLeftRight className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Compare Scholarships</h1>
                                <p className="text-gray-500 text-sm mt-0.5">Select up to 3 scholarships to compare rules side-by-side.</p>
                            </div>
                        </div>

                        {/* Selectors Area */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 pb-8 border-b">
                            {Array.from({ length: 3 }).map((_, i) => {
                                const current = comparedScholarships[i];
                                return (
                                    <div key={i} className="border border-dashed border-gray-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-center min-h-[120px]">
                                        {current ? (
                                            <div className="relative">
                                                <button 
                                                    onClick={() => handleRemove(current.id)}
                                                    className="absolute -top-2 -right-2 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-full cursor-pointer transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="text-[10px] font-extrabold uppercase text-sky-700 tracking-wider">Slot {i + 1} Selected</span>
                                                <h4 className="font-bold text-sm text-gray-900 mt-1 line-clamp-2 leading-snug">{current.title}</h4>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Select Scholarship {i + 1}</label>
                                                <select
                                                    onChange={(e) => handleSelect(e.target.value)}
                                                    value=""
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                                                >
                                                    <option value="">Choose a scheme...</option>
                                                    {scholarships
                                                        .filter(s => !selectedIds.includes(s.id))
                                                        .map(s => (
                                                            <option key={s.id} value={s.id}>{s.title}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Comparison Matrix Table */}
                        {comparedScholarships.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-slate-50/30">
                                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-1/4">Criteria</th>
                                            {comparedScholarships.map(s => (
                                                <th key={s.id} className="py-4 px-6 text-sm font-extrabold text-gray-950 w-1/4 leading-snug">
                                                    {s.title}
                                                </th>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <th key={i} className="py-4 px-6 text-xs text-gray-400 font-semibold text-center italic w-1/4">Empty Slot</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-150 text-sm">
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Annual Benefit</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6 font-black text-emerald-700">
                                                    ₹{(s.amount_annual || s.amount_min || 0).toLocaleString('en-IN')}
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Provider Type</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6 text-gray-900 font-semibold">
                                                    {s.provider_type || 'Government'}
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Residency</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6 text-gray-900 font-medium">
                                                    {s.state || 'All India'}
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Academic Target</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6 text-gray-900 font-medium">
                                                    {s.level || 'All'}
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Caste Category</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6 text-gray-900 font-medium">
                                                    {s.caste.join(', ')}
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Min Marks Required</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6 text-gray-900 font-bold">
                                                    {s.min_marks > 0 ? `${s.min_marks}%` : 'No Minimum'}
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Family Income Limit</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6 text-gray-900 font-bold">
                                                    {s.income_limit > 0 ? `₹${s.income_limit.toLocaleString('en-IN')}` : 'No Limit'}
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Application Mode</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6 text-gray-900 font-medium">
                                                    {s.application_mode || 'Online'}
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-gray-700">Details Page</td>
                                            {comparedScholarships.map(s => (
                                                <td key={s.id} className="py-4 px-6">
                                                    <a 
                                                        href={`/scholarships/${s.slug}`}
                                                        className="text-xs font-bold text-sky-700 hover:text-sky-800 hover:underline"
                                                    >
                                                        Read Official Guide →
                                                    </a>
                                                </td>
                                            ))}
                                            {Array.from({ length: 3 - comparedScholarships.length }).map((_, i) => (
                                                <td key={i} className="py-4 px-6 text-center italic text-gray-300">-</td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-50 border border-dashed border-gray-200 rounded-3xl">
                                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                                <p className="text-gray-500 font-semibold mb-2">No scholarships selected for comparison</p>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto">Please select up to 3 options from the dropdown slots above to begin comparing eligibility and benefits.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
