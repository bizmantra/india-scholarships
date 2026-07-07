'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { 
    Sparkles, 
    ChevronRight, 
    ChevronLeft, 
    RotateCcw,
    MapPin, 
    User, 
    GraduationCap, 
    Coins, 
    BookOpen,
    Landmark,
    Building2,
    Globe,
    CheckCircle2
} from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

type TabType = 'government' | 'private' | 'international' | 'all';

export default function FinderWizardClient({ scholarships }: Props) {
    const [step, setStep] = useState<number>(1);
    const [state, setState] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [income, setIncome] = useState<string>('');
    const [marks, setMarks] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);
    
    // Result tabs
    const [activeTab, setActiveTab] = useState<TabType>('government');
    const resultsRef = useRef<HTMLDivElement>(null);

    const totalSteps = 5;

    const handleNext = () => {
        if (step < totalSteps) setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const handleReset = () => {
        setStep(1);
        setState('');
        setCategory('');
        setLevel('');
        setIncome('');
        setMarks('');
        setResults([]);
        setActiveTab('government');
    };

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
            providerTypeLower.includes('department') ||
            providerTypeLower.includes('ministry') ||
            providerTypeLower.includes('implementing')
        ) {
            return 'government';
        }

        return 'private';
    };

    // Calculate dynamic outcomes
    useEffect(() => {
        if (step === totalSteps) {
            let filtered = scholarships;

            // Filter state
            if (state && state !== 'All India') {
                filtered = filtered.filter(s => s.state === state || s.state === 'All India' || s.state === 'NA');
            }

            // Filter income
            if (income) {
                const incomeVal = Number(income);
                filtered = filtered.filter(s => !s.income_limit || s.income_limit >= incomeVal);
            }

            // Filter marks
            if (marks) {
                const marksVal = Number(marks);
                filtered = filtered.filter(s => !s.min_marks || s.min_marks <= marksVal);
            }

            // Filter level
            if (level) {
                filtered = filtered.filter(s => {
                    const sLevel = s.level || '';
                    return sLevel.toLowerCase().includes(level.toLowerCase()) || 
                           (level === 'UG' && sLevel.includes('Undergraduate')) ||
                           (level === 'PG' && sLevel.includes('Postgraduate')) ||
                           (level === 'Class 9-12' && (sLevel.includes('11') || sLevel.includes('12') || sLevel.includes('9-12'))) ||
                           (level === 'Pre-Matric' && (sLevel.includes('Class 1') || sLevel.includes('Pre-Matric')));
                });
            }

            // Filter category/caste safely
            if (category) {
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
                    return castes.includes(category) || castes.includes('All') || castes.length === 0;
                });
            }

            setResults(filtered);
            
            // Smooth scroll to results if revealed
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [step, state, category, level, income, marks, scholarships]);

    // Validation for next button enablement
    const isStepValid = () => {
        if (step === 1) return state !== '';
        if (step === 2) return category !== '';
        if (step === 3) return level !== '';
        if (step === 4) return income !== '';
        if (step === 5) return marks !== '';
        return true;
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
                <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Guided Scholarship Finder</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
                            Scholarship Finder Wizard
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Build your student profile step-by-step to find matching scholarships to cover your fees and study costs.
                        </p>
                    </div>
                </section>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" ref={resultsRef}>
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-8">
                        <Link href="/tools" className="hover:text-blue-700 font-medium">Tools</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Scholarship Finder Wizard</span>
                    </div>

                    <div className="bg-white border border-gray-250 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
                        {/* Sparkle background decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Sparkles className="w-32 h-32 text-indigo-600" />
                        </div>

                        {step <= totalSteps && results.length === 0 ? (
                            <div>
                                {/* Wizard Header */}
                                <div className="flex justify-between items-center mb-8 border-b pb-4">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Question {step} of {totalSteps}</span>
                                        <h2 className="text-xl font-bold text-gray-900 mt-1">Tell Us About Yourself</h2>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalSteps }).map((_, i) => (
                                            <div 
                                                key={i}
                                                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                                                    i + 1 <= step ? 'bg-indigo-600' : 'bg-gray-150'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Step Components */}
                                <div className="min-h-[220px] flex flex-col justify-center py-4">
                                    {step === 1 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-5 h-5 text-indigo-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900 font-serif">Where do you live (State)?</h3>
                                            </div>
                                            <select
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-hidden font-semibold text-xs"
                                            >
                                                <option value="">Select your home state</option>
                                                <option value="All India">All India (Any State)</option>
                                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Odisha">Odisha</option>
                                                <option value="Telangana">Telangana</option>
                                            </select>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-5 h-5 text-indigo-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900 font-serif">What is your Caste Category?</h3>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'].map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setCategory(c)}
                                                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                            category === c 
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="flex items-center gap-2 mb-2">
                                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900 font-serif">What level are you studying?</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {[
                                                    { value: 'Pre-Matric', label: 'School (Class 1-10)' },
                                                    { value: 'Class 9-12', label: 'High School (Class 11-12)' },
                                                    { value: 'Post-Matric', label: 'Diploma / ITI / Polytechnic' },
                                                    { value: 'UG', label: 'Undergraduate Degree (BA, B.Sc, B.Tech, etc.)' },
                                                    { value: 'PG', label: 'Postgraduate Degree (MA, M.Sc, MTech, etc.)' }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setLevel(opt.value)}
                                                        className={`px-5 py-4 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                                                            level === opt.value
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Coins className="w-5 h-5 text-indigo-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900 font-serif">What is your annual family income?</h3>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {[
                                                    { val: '100000', label: 'Below ₹1 Lakh' },
                                                    { val: '250000', label: 'Below ₹2.5 Lakhs' },
                                                    { val: '350000', label: 'Below ₹3.5 Lakhs' },
                                                    { val: '500000', label: 'Below ₹5 Lakhs' },
                                                    { val: '800000', label: 'Below ₹8 Lakhs' },
                                                    { val: '1000000', label: 'Above ₹8 Lakhs' }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.val}
                                                        type="button"
                                                        onClick={() => setIncome(opt.val)}
                                                        className={`px-4 py-3.5 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                                                            income === opt.val
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900 font-serif">What was your score in the last exam (%)?</h3>
                                            </div>
                                            <div className="relative max-w-sm">
                                                <input
                                                    type="number"
                                                    value={marks}
                                                    onChange={(e) => setMarks(e.target.value)}
                                                    min="0"
                                                    max="100"
                                                    placeholder="e.g. 75"
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-hidden font-semibold text-lg"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Wizard Controls */}
                                <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        disabled={step === 1}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!isStepValid()}
                                        className="inline-flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <span>{step === totalSteps ? 'View Matches →' : 'Next Step'}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fadeIn">
                                {/* Output Header */}
                                <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white border border-indigo-900 rounded-2xl p-6 sm:p-8 text-center sm:text-left mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-black font-serif">Matched {results.length} Scholarships!</h2>
                                        <p className="text-xs sm:text-sm text-indigo-200 mt-2 font-medium">
                                            Found potential grants worth up to <strong>₹{results.reduce((max, s) => Math.max(max, s.amount_annual || s.amount_min || 0), 0).toLocaleString('en-IN')}/year</strong>.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleReset}
                                        className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Start Over</span>
                                    </button>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-extrabold text-sm text-gray-900 mb-4 uppercase tracking-wider">Your Matching Schemes</h3>
                                    
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
                                                            ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    <span>{tab.label}</span>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                                        activeTab === tab.id
                                                            ? 'bg-indigo-600 text-white font-extrabold'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Matching Cards Grid */}
                                    {tabFilteredMatches.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {tabFilteredMatches.map((s) => (
                                                <ScholarshipCard
                                                    key={s.id}
                                                    scholarship={s}
                                                    viewMode="grid"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-slate-50/30">
                                            <p className="text-gray-500 font-semibold mb-2">No matching scholarships in this category</p>
                                            <p className="text-xs text-gray-400">Try checking the other tabs above.</p>
                                        </div>
                                    )}
                                </div>

                                {results.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-500 font-bold">Share results:</span>
                                        <ShareButtons 
                                            title={`I found ${results.length} scholarships matching my profile on IndiaScholarships! Try the finder wizard.`}
                                            url="https://www.indiascholarships.in/tools/finder-wizard"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
