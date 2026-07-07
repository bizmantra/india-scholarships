'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { GraduationCap, Landmark, ArrowRight, Share2, HelpCircle } from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

export default function AmountClient({ scholarships }: Props) {
    const [level, setLevel] = useState<string>('UG');
    const [category, setCategory] = useState<string>('General');
    const [stats, setStats] = useState({
        min: 0,
        max: 0,
        avg: 0,
        count: 0
    });
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        // Filter based on selected criteria
        const filtered = scholarships.filter(s => {
            // Level match
            const matchesLevel = s.level && s.level.toLowerCase().includes(level.toLowerCase());
            
            // Caste match
            let castes = [];
            try {
                castes = JSON.parse(s.caste);
            } catch {
                castes = s.caste ? [s.caste] : [];
            }
            const matchesCaste = castes.includes(category) || castes.includes('All') || castes.length === 0;

            return matchesLevel && matchesCaste;
        });

        // Compute statistics
        if (filtered.length > 0) {
            const amounts = filtered.map(s => s.amount_annual || s.amount_min || 0).filter(a => a > 0);
            if (amounts.length > 0) {
                const minVal = Math.min(...amounts);
                const maxVal = Math.max(...amounts);
                const sum = amounts.reduce((a, b) => a + b, 0);
                const avgVal = Math.round(sum / amounts.length);

                setStats({
                    min: minVal,
                    max: maxVal,
                    avg: avgVal,
                    count: filtered.length
                });
            } else {
                setStats({ min: 0, max: 0, avg: 0, count: filtered.length });
            }
        } else {
            setStats({ min: 0, max: 0, avg: 0, count: 0 });
        }

        setMatches(filtered);
    }, [level, category, scholarships]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                <Header />
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-sm text-gray-500 mb-6">
                        <a href="/tools" className="hover:text-blue-700 font-medium">Tools</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Scholarship Amount Calculator</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Control panel */}
                        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-50 text-violet-600 rounded-xl mb-6">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Benefit Estimator
                            </h1>
                            <p className="text-gray-600 text-sm mb-6">
                                Estimate how much financial benefit you can receive based on your education level and category.
                            </p>

                            <div className="space-y-6">
                                {/* Education Level */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                        Education Level
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'UG', label: 'Undergraduate' },
                                            { id: 'PG', label: 'Postgraduate' },
                                            { id: 'Class 9-12', label: 'Class 9-12' },
                                            { id: 'Pre-Matric', label: 'Class 1-10' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setLevel(opt.id)}
                                                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                    level === opt.id
                                                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Caste/Category */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                        Category
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['General', 'OBC', 'SC', 'ST', 'Minority'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setCategory(c)}
                                                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                    category === c
                                                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <ShareButtons 
                                        title={`My estimated scholarship amount on IndiaScholarships is ₹${stats.avg.toLocaleString('en-IN')}/yr! Estimate yours now.`}
                                        url="https://www.indiascholarships.in/tools/amount-calculator"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Benefit Estimation</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div className="bg-slate-50 border rounded-xl p-5 text-center">
                                        <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Minimum Estimate</span>
                                        <span className="text-2xl font-black text-gray-900 block mt-1">₹{stats.min.toLocaleString('en-IN')}</span>
                                        <span className="text-[10px] text-gray-400 font-bold block mt-1">per year</span>
                                    </div>
                                    <div className="bg-violet-600 text-white rounded-xl p-5 text-center shadow-lg shadow-violet-500/20">
                                        <span className="text-[10px] font-extrabold uppercase opacity-90 tracking-wider">Average Estimate</span>
                                        <span className="text-2xl font-black block mt-1">₹{stats.avg.toLocaleString('en-IN')}</span>
                                        <span className="text-[10px] opacity-90 block mt-1">per year</span>
                                    </div>
                                    <div className="bg-slate-50 border rounded-xl p-5 text-center">
                                        <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Maximum Potential</span>
                                        <span className="text-2xl font-black text-gray-900 block mt-1">₹{stats.max.toLocaleString('en-IN')}</span>
                                        <span className="text-[10px] text-gray-400 font-bold block mt-1">per year</span>
                                    </div>
                                </div>

                                <h3 className="font-extrabold text-base text-gray-900 mb-4">Top Matching Scholarship Tiers</h3>

                                {matches.length > 0 ? (
                                    <div className="space-y-4">
                                        {matches.slice(0, 4).map((s) => (
                                            <div key={s.id} className="border border-gray-150 rounded-xl p-4 flex justify-between items-center bg-slate-50/30">
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">{s.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">Level: {s.level} | State: {s.state}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-violet-700">₹{(s.amount_annual || s.amount_min || 0).toLocaleString('en-IN')}</span>
                                                    <a 
                                                        href={`/scholarships/${s.slug}`}
                                                        className="p-1.5 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-6">No matching scholarships for these parameters.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
