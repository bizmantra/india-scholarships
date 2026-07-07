'use client';

import { useState, useEffect } from 'react';
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
    BookOpen 
} from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

export default function FinderWizardClient({ scholarships }: Props) {
    const [step, setStep] = useState<number>(1);
    const [state, setState] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [income, setIncome] = useState<string>('');
    const [marks, setMarks] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);

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
    };

    // Calculate dynamic outcomes
    useEffect(() => {
        if (step === totalSteps) {
            let filtered = scholarships;

            // Filter state
            if (state && state !== 'All India') {
                filtered = filtered.filter(s => s.state === state || s.state === 'All India');
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
                filtered = filtered.filter(s => s.level && s.level.toLowerCase().includes(level.toLowerCase()));
            }

            // Filter category/caste
            if (category) {
                filtered = filtered.filter(s => {
                    let castes = [];
                    try {
                        castes = JSON.parse(s.caste);
                    } catch {
                        castes = s.caste ? [s.caste] : [];
                    }
                    return castes.includes(category) || castes.includes('All') || castes.length === 0;
                });
            }

            setResults(filtered);
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                <Header />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-6">
                        <a href="/tools" className="hover:text-blue-700 font-medium">Tools</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Scholarship Finder Wizard</span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
                        {/* Sparkle background decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Sparkles className="w-32 h-32 text-purple-600" />
                        </div>

                        {step <= totalSteps ? (
                            <div>
                                {/* Wizard Header */}
                                <div className="flex justify-between items-center mb-8 border-b pb-4">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Question {step} of {totalSteps}</span>
                                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Profile Builder</h1>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalSteps }).map((_, i) => (
                                            <div 
                                                key={i}
                                                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                                                    i + 1 <= step ? 'bg-purple-600' : 'bg-gray-150'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Step Components */}
                                <div className="min-h-[220px] flex flex-col justify-center py-4">
                                    {step === 1 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900">Which state are you a resident of?</h3>
                                            </div>
                                            <select
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-hidden font-medium"
                                            >
                                                <option value="">Select your home state</option>
                                                <option value="All India">All India</option>
                                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Odisha">Odisha</option>
                                                <option value="Telangana">Telangana</option>
                                            </select>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900">What is your social caste category?</h3>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {['General', 'OBC', 'SC', 'ST', 'EBC', 'Minority'].map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setCategory(c)}
                                                        className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                                                            category === c 
                                                                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20' 
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
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <GraduationCap className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900">What is your current level of education?</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {[
                                                    { value: 'Pre-Matric', label: 'School (Class 1-10)' },
                                                    { value: 'Class 9-12', label: 'High School (Class 9-12)' },
                                                    { value: 'Post-Matric', label: 'Post-Matric (Diploma/ITI)' },
                                                    { value: 'UG', label: 'Undergraduate Degree (BA/B.Sc/B.Tech)' },
                                                    { value: 'PG', label: 'Postgraduate Degree (MA/M.Sc/MBA)' }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setLevel(opt.value)}
                                                        className={`px-5 py-4 rounded-xl border text-sm font-semibold text-left transition-all cursor-pointer ${
                                                            level === opt.value
                                                                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20'
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
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Coins className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900">What is your annual family income limit range?</h3>
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
                                                        onClick={() => setIncome(opt.val)}
                                                        className={`px-4 py-3.5 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                                                            income === opt.val
                                                                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20'
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
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BookOpen className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-extrabold text-lg text-gray-900">What were your marks in the last qualifying exam (%)?</h3>
                                            </div>
                                            <div className="relative max-w-sm">
                                                <input
                                                    type="number"
                                                    value={marks}
                                                    onChange={(e) => setMarks(e.target.value)}
                                                    min="0"
                                                    max="100"
                                                    placeholder="e.g. 75"
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-hidden font-semibold text-lg"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Wizard Controls */}
                                <div className="flex justify-between items-center mt-10 pt-6 border-t">
                                    <button
                                        onClick={handleBack}
                                        disabled={step === 1}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!isStepValid()}
                                        className="inline-flex items-center gap-1.5 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <span>{step === totalSteps ? 'View Results' : 'Next Step'}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* Output Header */}
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 sm:p-8 text-center sm:text-left mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-black">Matched {results.length} Scholarships!</h2>
                                        <p className="text-xs sm:text-sm text-purple-100 mt-2 font-medium">
                                            Found potential grants worth up to ₹{results.reduce((sum, s) => sum + (s.amount_annual || 0), 0).toLocaleString('en-IN')}+ matching your build profile.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleReset}
                                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Start Over</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <ShareButtons 
                                        title={`I built my profile on IndiaScholarships and found ${results.length} matching scholarships worth up to ₹${results.reduce((sum, s) => sum + (s.amount_annual || 0), 0).toLocaleString('en-IN')}! Try the wizard.`}
                                        url="https://www.indiascholarships.in/tools/finder-wizard"
                                    />
                                </div>

                                {/* Matching Cards Grid */}
                                {results.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {results.map((s) => (
                                            <ScholarshipCard
                                                key={s.id}
                                                scholarship={s}
                                                viewMode="grid"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-slate-50/50">
                                        <p className="text-gray-500 font-semibold mb-2">No scholarships exactly match your profile combinations</p>
                                        <button 
                                            onClick={handleReset}
                                            className="text-sm font-bold text-purple-700 hover:text-purple-800"
                                        >
                                            Adjust Profile Answers
                                        </button>
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
