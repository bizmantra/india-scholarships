'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Search, CheckCircle2, ShieldCheck } from 'lucide-react';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let filtered = scholarships;

        // Filter state
        if (formData.state && formData.state !== 'All India') {
            filtered = filtered.filter(s =>
                s.state === formData.state || s.state === 'All India'
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
            filtered = filtered.filter(s => s.level === formData.level);
        }

        // Filter category
        if (formData.category) {
            filtered = filtered.filter(s => {
                const castes = s.caste || [];
                return castes.includes(formData.category) || castes.includes('All');
            });
        }

        setResults(filtered);
        setShowResults(true);
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                <Header />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-sm text-gray-500 mb-6">
                        <a href="/tools" className="hover:text-blue-700 font-medium">Tools</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Scholarship Eligibility Checker</span>
                    </div>

                    {!showResults ? (
                        <>
                            {/* Hero Section */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl mb-4 shadow-sm">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                                    Scholarship Eligibility Checker
                                </h1>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Check and verify matching schemes worth lakhs instantly.
                                </p>
                            </div>

                            {/* Form */}
                            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs mb-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* State */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                            Which state are you from? *
                                        </label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-hidden font-medium"
                                        >
                                            <option value="">Select your state</option>
                                            <option value="All India">All India</option>
                                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Odisha">Odisha</option>
                                            <option value="Telangana">Telangana</option>
                                        </select>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                            What is your category? *
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-hidden font-medium"
                                        >
                                            <option value="">Select your category</option>
                                            <option value="General">General</option>
                                            <option value="OBC">OBC</option>
                                            <option value="SC">SC</option>
                                            <option value="ST">ST</option>
                                            <option value="EBC">EBC</option>
                                            <option value="Minority">Minority</option>
                                        </select>
                                    </div>

                                    {/* Education Level */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                            What is your education level? *
                                        </label>
                                        <select
                                            name="level"
                                            value={formData.level}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-hidden font-medium"
                                        >
                                            <option value="">Select education level</option>
                                            <option value="Class 9-12">Class 9-12</option>
                                            <option value="Pre-Matric">Pre-Matric (Class 1-10)</option>
                                            <option value="Post-Matric">Post-Matric (After Class 10)</option>
                                            <option value="UG">Undergraduate (UG)</option>
                                            <option value="PG">Postgraduate (PG)</option>
                                        </select>
                                    </div>

                                    {/* Annual Family Income */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                            Annual family income (₹) *
                                        </label>
                                        <select
                                            name="income"
                                            value={formData.income}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-hidden font-medium"
                                        >
                                            <option value="">Select income range</option>
                                            <option value="100000">Below ₹1 lakh</option>
                                            <option value="250000">₹1-2.5 lakhs</option>
                                            <option value="350000">₹2.5-3.5 lakhs</option>
                                            <option value="500000">₹3.5-5 lakhs</option>
                                            <option value="800000">₹5-8 lakhs</option>
                                            <option value="1000000">Above ₹8 lakhs</option>
                                        </select>
                                    </div>

                                    {/* Marks */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                            Marks in last qualifying exam (%) *
                                        </label>
                                        <input
                                            type="number"
                                            name="marks"
                                            value={formData.marks}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            max="100"
                                            placeholder="e.g., 75"
                                            className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-hidden font-medium"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {loading ? 'Finding Scholarships...' : 'Find My Scholarships →'}
                                    </button>
                                </form>

                                {/* Trust Indicators */}
                                <div className="mt-6 pt-6 border-t border-gray-150">
                                    <div className="flex items-center justify-center gap-8 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>100% Free</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>No Registration</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>Instant Results</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Results */}
                            <div className="mb-8">
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="text-blue-700 hover:text-blue-800 font-bold mb-6 flex items-center gap-1.5 text-sm cursor-pointer"
                                >
                                    ← Back to form
                                </button>

                                {results.length > 0 ? (
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-3xl p-8 mb-8">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 mb-2">
                                            Great News! You're Eligible for {results.length} Scholarship{results.length !== 1 ? 's' : ''}
                                        </h2>
                                        <p className="text-base text-gray-700 mb-6">
                                            Total potential value: ₹{results.reduce((sum, s) => sum + (s.amount_annual || 0), 0).toLocaleString('en-IN')}+
                                        </p>
                                        <div className="bg-white/50 p-4 rounded-xl">
                                            <ShareButtons
                                                title={`I found ${results.length} scholarships worth ₹${results.reduce((sum, s) => sum + (s.amount_annual || 0), 0).toLocaleString('en-IN')}! Check your eligibility now.`}
                                                url="https://www.indiascholarships.in/tools/eligibility-checker"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-3xl p-8 mb-8">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 mb-2">
                                            No Exact Matches Found
                                        </h2>
                                        <p className="text-base text-gray-700">
                                            Don't worry! Try adjusting your filters or browse all scholarships below.
                                        </p>
                                    </div>
                                )}

                                {results.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {results.map((scholarship: any) => (
                                            <ScholarshipCard
                                                key={scholarship.id}
                                                scholarship={scholarship}
                                                viewMode="grid"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white border rounded-2xl">
                                        <p className="text-gray-500 font-semibold mb-2">No scholarships match your exact criteria.</p>
                                        <a href="/tools" className="inline-block mt-4 text-blue-700 hover:text-blue-800 font-bold text-sm">
                                            Browse Other Tools →
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}
