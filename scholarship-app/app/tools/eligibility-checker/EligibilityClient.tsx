'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
    Search, 
    CheckCircle2, 
    ShieldCheck, 
    Loader2, 
    HelpCircle,
    Info,
    Landmark,
    Building2,
    Globe,
    Coins,
    BookOpen
} from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface FormData {
    state: string;
    category: string;
    level: string;
    income: string;
    marks: string;
}

interface Props {
    scholarships: any[];
}

type TabType = 'government' | 'private' | 'international' | 'all';

export default function EligibilityCheckerClient({ scholarships }: Props) {
    const [formData, setFormData] = useState<FormData>({
        state: '',
        category: '',
        level: '',
        income: '',
        marks: ''
    });

    const searchParams = useSearchParams();

    useEffect(() => {
        const stateParam = searchParams.get('state') || '';
        const categoryParam = searchParams.get('caste') || '';
        const levelParam = searchParams.get('level') || '';
        const incomeParam = searchParams.get('income') || '';

        let matchedCategory = '';
        const casteLower = categoryParam.toLowerCase();
        if (casteLower.includes('general')) matchedCategory = 'General';
        else if (casteLower.includes('obc')) matchedCategory = 'OBC';
        else if (casteLower.includes('sc')) matchedCategory = 'SC';
        else if (casteLower.includes('st')) matchedCategory = 'ST';
        else if (casteLower.includes('ebc')) matchedCategory = 'EBC';
        else if (casteLower.includes('minority')) matchedCategory = 'Minority';

        let matchedLevel = '';
        const levelLower = levelParam.toLowerCase();
        if (levelLower.includes('ug') || levelLower.includes('undergraduate') || levelLower.includes('degree') || levelLower.includes('college')) {
            matchedLevel = 'UG';
        } else if (levelLower.includes('pg') || levelLower.includes('postgraduate') || levelLower.includes('master')) {
            matchedLevel = 'PG';
        } else if (levelLower.includes('class 9-12') || levelLower.includes('11') || levelLower.includes('12')) {
            matchedLevel = 'Class 9-12';
        } else if (levelLower.includes('pre-matric') || levelLower.includes('pre matric') || levelLower.includes('school') || levelLower.includes('1-10')) {
            matchedLevel = 'Pre-Matric';
        } else if (levelLower.includes('post-matric') || levelLower.includes('post matric') || levelLower.includes('diploma') || levelLower.includes('iti')) {
            matchedLevel = 'Post-Matric';
        }

        let matchedIncome = '';
        if (incomeParam) {
            const inc = parseInt(incomeParam);
            if (!isNaN(inc)) {
                if (inc <= 100000) matchedIncome = '100000';
                else if (inc <= 250000) matchedIncome = '250000';
                else if (inc <= 350000) matchedIncome = '350000';
                else if (inc <= 500000) matchedIncome = '500000';
                else if (inc <= 800000) matchedIncome = '800000';
                else matchedIncome = '1000000';
            }
        }

        let matchedState = '';
        const stateLower = stateParam.toLowerCase();
        if (stateLower.includes('all') || stateLower.includes('india')) matchedState = 'All India';
        else if (stateLower.includes('andhra')) matchedState = 'Andhra Pradesh';
        else if (stateLower.includes('karnataka')) matchedState = 'Karnataka';
        else if (stateLower.includes('maharashtra')) matchedState = 'Maharashtra';
        else if (stateLower.includes('odisha') || stateLower.includes('orissa')) matchedState = 'Odisha';
        else if (stateLower.includes('telangana')) matchedState = 'Telangana';

        setFormData(prev => ({
            ...prev,
            state: matchedState || prev.state,
            category: matchedCategory || prev.category,
            level: matchedLevel || prev.level,
            income: matchedIncome || prev.income,
        }));
    }, [searchParams]);

    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('government');
    const resultsRef = useRef<HTMLDivElement>(null);

    // Helper to dynamically categorize scholarships
    const getScholarshipCategory = (s: any): TabType => {
        const titleLower = s.title.toLowerCase();
        const providerLower = (s.provider || '').toLowerCase();
        const providerTypeLower = (s.provider_type || '').toLowerCase();
        const amt = s.amount_annual || s.amount_min || 0;

        if (
            amt >= 500000 || 
            titleLower.includes('uk') || 
            titleLower.includes('us') || 
            titleLower.includes('cambridge') || 
            titleLower.includes('fulbright') || 
            titleLower.includes('commonwealth') || 
            titleLower.includes('abroad') || 
            titleLower.includes('foreign') ||
            providerLower.includes('foreign') ||
            providerLower.includes('embassy') ||
            providerTypeLower.includes('international')
        ) {
            return 'international';
        }

        if (
            providerTypeLower.includes('government') || 
            providerTypeLower.includes('central') || 
            providerTypeLower.includes('state') || 
            providerTypeLower.includes('ut') ||
            providerTypeLower.includes('status') ||
            providerTypeLower.includes('parent') ||
            providerTypeLower.includes('department') ||
            providerTypeLower.includes('ministry') ||
            providerTypeLower.includes('implementing')
        ) {
            return 'government';
        }

        return 'private';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            let filtered = scholarships;

            // Filter state
            if (formData.state && formData.state !== 'All India') {
                filtered = filtered.filter(s =>
                    s.state === formData.state || s.state === 'All India' || s.state === 'NA'
                );
            }

            // Filter income
            if (formData.income) {
                const incomeValue = parseInt(formData.income);
                filtered = filtered.filter(s =>
                    !s.income_limit || s.income_limit >= incomeValue
                );
            }

            // Filter marks
            if (formData.marks) {
                const marksValue = parseInt(formData.marks);
                filtered = filtered.filter(s =>
                    !s.min_marks || s.min_marks <= marksValue
                );
            }

            // Filter education level
            if (formData.level) {
                filtered = filtered.filter(s => {
                    const sLevel = s.level || '';
                    return sLevel.toLowerCase().includes(formData.level.toLowerCase()) || 
                           (formData.level === 'UG' && sLevel.includes('Undergraduate')) ||
                           (formData.level === 'PG' && sLevel.includes('Postgraduate')) ||
                           (formData.level === 'Class 9-12' && (sLevel.includes('11') || sLevel.includes('12') || sLevel.includes('9-12'))) ||
                           (formData.level === 'Pre-Matric' && (sLevel.includes('Class 1') || sLevel.includes('Pre-Matric')));
                });
            }

            // Filter category safely
            if (formData.category) {
                filtered = filtered.filter(s => {
                    let castes: string[] = [];
                    if (Array.isArray(s.caste)) {
                        castes = s.caste;
                    } else if (typeof s.caste === 'string') {
                        try {
                            const parsed = JSON.parse(s.caste);
                            castes = Array.isArray(parsed) ? parsed : [s.caste];
                        } catch {
                            castes = [s.caste];
                        }
                    }
                    castes = (castes || []).filter(c => c && c !== 'null');
                    return castes.includes(formData.category) || castes.includes('All') || castes.length === 0;
                });
            }

            setResults(filtered);
            setShowResults(true);
            setLoading(false);

            // Smooth scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }, 800);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Filter results by tab
    const tabFilteredMatches = results.filter(s => {
        if (activeTab === 'all') return true;
        return getScholarshipCategory(s) === activeTab;
    });

    const getCountForTab = (tab: TabType) => {
        if (tab === 'all') return results.length;
        return results.filter(s => getScholarshipCategory(s) === tab).length;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
            <div>
                <Header />

                {/* Hero Header */}
                <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-violet-950 text-white py-16 px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.1),transparent)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold mb-4">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Your Scholarship Eligibility</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
                            Scholarship Eligibility Checker
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Answer 5 simple questions to instantly check which government and private scholarships you qualify to apply for.
                        </p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" ref={resultsRef}>
                    <div className="text-sm text-gray-500 mb-8">
                        <a href="/tools" className="hover:text-blue-700 font-medium">Tools</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Eligibility Checker</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                        
                        {/* Profile Input Form */}
                        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-violet-600" />
                                <span>Check Your Profile</span>
                            </h2>
                            <p className="text-gray-500 text-xs leading-relaxed mb-6">
                                Enter your academic and family details to find exact matches from our verified scholarship directory.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* State */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Where do you live (State)?</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className="w-full text-xs font-semibold bg-white border border-gray-250 p-3 rounded-lg focus:outline-hidden focus:border-violet-500"
                                    >
                                        <option value="">Select your state</option>
                                        <option value="All India">All India (Any State)</option>
                                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Odisha">Odisha</option>
                                        <option value="Telangana">Telangana</option>
                                    </select>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">What is your Caste Category?</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full text-xs font-semibold bg-white border border-gray-250 p-3 rounded-lg focus:outline-hidden focus:border-violet-500"
                                    >
                                        <option value="">Select your category</option>
                                        <option value="General">General</option>
                                        <option value="OBC">OBC</option>
                                        <option value="SC">SC</option>
                                        <option value="ST">ST</option>
                                        <option value="EWS">EWS</option>
                                        <option value="Minority">Minority</option>
                                    </select>
                                </div>

                                {/* Education Level */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">What level are you studying?</label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        required
                                        className="w-full text-xs font-semibold bg-white border border-gray-250 p-3 rounded-lg focus:outline-hidden focus:border-violet-500"
                                    >
                                        <option value="">Select education level</option>
                                        <option value="Pre-Matric">Class 1 - 10</option>
                                        <option value="Class 9-12">Class 11 - 12</option>
                                        <option value="Post-Matric">Diploma / Polytechnic / ITI</option>
                                        <option value="UG">Undergraduate Degree (BA, BSc, BTech, etc.)</option>
                                        <option value="PG">Postgraduate Degree (MA, MSc, MTech, etc.)</option>
                                    </select>
                                </div>

                                {/* Annual Family Income */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">What is your total Family Income?</label>
                                    <select
                                        name="income"
                                        value={formData.income}
                                        onChange={handleChange}
                                        required
                                        className="w-full text-xs font-semibold bg-white border border-gray-250 p-3 rounded-lg focus:outline-hidden focus:border-violet-500"
                                    >
                                        <option value="">Select income range</option>
                                        <option value="100000">Below ₹1 Lakh</option>
                                        <option value="250000">₹1 - ₹2.5 Lakhs</option>
                                        <option value="350000">₹2.5 - ₹3.5 Lakhs</option>
                                        <option value="500000">₹3.5 - ₹5 Lakhs</option>
                                        <option value="800000">₹5 - ₹8 Lakhs</option>
                                        <option value="1000000">Above ₹8 Lakhs</option>
                                    </select>
                                </div>

                                {/* Marks */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">What was your score in the last exam (%)?</label>
                                    <input
                                        type="number"
                                        name="marks"
                                        value={formData.marks}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        max="100"
                                        placeholder="e.g. 75"
                                        className="w-full text-xs font-semibold bg-white border border-gray-250 p-3 rounded-lg focus:outline-hidden focus:border-violet-500"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-violet-700 hover:bg-violet-800 disabled:bg-violet-400 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Finding Scholarships...</span>
                                        </>
                                    ) : (
                                        <span>Check Eligible Scholarships →</span>
                                    )}
                                </button>
                            </form>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-6 text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> 100% Free</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Safe & Secured</span>
                            </div>
                        </div>

                        {/* Matches Results Section */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white border border-gray-250 rounded-2xl p-6 sm:p-8 shadow-xs min-h-[480px] flex flex-col justify-between">
                                {!showResults ? (
                                    <div className="flex flex-col items-center justify-center text-center py-24 flex-1">
                                        <div className="w-16 h-16 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-extrabold text-lg text-gray-900 mb-1">See your eligible matching schemes</h3>
                                        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                            Fill out your academic profile on the left and click the button to scan our verified database.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="animate-fadeIn flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                                <div>
                                                    <h3 className="font-extrabold text-base text-gray-900">Eligible Scholarships Found</h3>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">Found {results.length} total opportunities based on your criteria</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowResults(false)}
                                                    className="px-3 py-1.5 border border-gray-250 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 transition-colors"
                                                >
                                                    Modify Search
                                                </button>
                                            </div>

                                            {/* Matches Header Summary */}
                                            {results.length > 0 && (
                                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-5 mb-6 text-center">
                                                    <h4 className="font-extrabold text-sm text-emerald-900 leading-snug">🏆 Congratulations! You qualify to apply!</h4>
                                                    <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                                                        You matched with scholarships worth up to <strong>₹{results.reduce((max, s) => Math.max(max, s.amount_annual || s.amount_min || 0), 0).toLocaleString('en-IN')}/year</strong>.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Category Tab Filters */}
                                            <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto pb-1">
                                                {[
                                                    { id: 'government', label: 'Government', icon: Landmark },
                                                    { id: 'private', label: 'Private & Corporate', icon: Building2 },
                                                    { id: 'international', label: 'Study Abroad', icon: Globe },
                                                    { id: 'all', label: 'Show All', icon: Coins }
                                                ].map((tab) => {
                                                    const Icon = tab.icon;
                                                    const count = getCountForTab(tab.id as TabType);
                                                    return (
                                                        <button
                                                            key={tab.id}
                                                            type="button"
                                                            onClick={() => setActiveTab(tab.id as TabType)}
                                                            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
                                                                activeTab === tab.id
                                                                    ? 'border-violet-600 text-violet-700 bg-violet-50/50'
                                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <Icon className="w-3.5 h-3.5" />
                                                            <span>{tab.label}</span>
                                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                                                activeTab === tab.id
                                                                    ? 'bg-violet-600 text-white font-extrabold'
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                    {count}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Results Grid List */}
                                            {tabFilteredMatches.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {tabFilteredMatches.map((s) => (
                                                        <ScholarshipCard
                                                            key={s.id}
                                                            scholarship={s}
                                                            viewMode="grid"
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                                                    <p className="text-gray-500 font-semibold mb-2">No matching scholarships in this category</p>
                                                    <p className="text-xs text-gray-400">Try adjusting your category tab or filters.</p>
                                                </div>
                                            )}
                                        </div>

                                        {showResults && results.length > 0 && (
                                            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <span className="text-xs text-gray-500 font-bold">Share matches with friends:</span>
                                                <ShareButtons
                                                    title={`I matched with ${results.length} scholarships on IndiaScholarships Checker! Verify yours now.`}
                                                    url="https://www.indiascholarships.in/tools/eligibility-checker"
                                                />
                                            </div>
                                        )}
                                    </div>
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
