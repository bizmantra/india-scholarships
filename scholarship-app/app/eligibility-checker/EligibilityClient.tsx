'use client';

import { useState } from 'react';
import { getDatabase } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { Search, Filter, CheckCircle2 } from 'lucide-react';

interface FormData {
    state: string;
    category: string;
    level: string;
    income: string;
    marks: string;
}

export default function EligibilityCheckerClient() {
    const [formData, setFormData] = useState<FormData>({
        state: '',
        category: '',
        level: '',
        income: '',
        marks: ''
    });

    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/check-eligibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            setResults(data.scholarships);
            setShowResults(true);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="text-2xl font-bold text-blue-700">
                            IndiaScholarships
                        </a>
                        <nav className="hidden md:flex gap-6">
                            <a href="/" className="text-gray-700 hover:text-blue-700">Home</a>
                            <a href="/eligibility-checker" className="text-blue-700 font-semibold">Eligibility Checker</a>
                            <a href="/private-scholarships" className="text-gray-700 hover:text-blue-700">Private</a>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!showResults ? (
                    <>
                        {/* Hero Section */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Search className="w-8 h-8 text-blue-700" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Find Scholarships You're Eligible For
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Answer a few questions and discover scholarships worth lakhs that match your profile
                            </p>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* State */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Which state are you from? *
                                    </label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        What is your category? *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        What is your education level? *
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Annual family income (₹) *
                                    </label>
                                    <select
                                        name="income"
                                        value={formData.income}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Finding Scholarships...' : 'Find My Scholarships →'}
                                </button>
                            </form>

                            {/* Trust Indicators */}
                            <div className="mt-6 pt-6 border-t">
                                <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span>100% Free</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span>No Registration</span>
                                    </div>
                                    <div className="flex items-center gap-2">
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
                                className="text-blue-700 hover:text-blue-800 mb-4 flex items-center gap-2"
                            >
                                ← Back to form
                            </button>

                            {results.length > 0 ? (
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        Great News! You're Eligible for {results.length} Scholarship{results.length !== 1 ? 's' : ''}
                                    </h2>
                                    <p className="text-lg text-gray-700">
                                        Total potential value: ₹{results.reduce((sum, s) => sum + (s.amount_annual || 0), 0).toLocaleString('en-IN')}+
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        No Exact Matches Found
                                    </h2>
                                    <p className="text-lg text-gray-700">
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
                                <div className="text-center py-12 bg-white rounded-xl">
                                    <p className="text-gray-600 mb-4">No scholarships match your exact criteria.</p>
                                    <p className="text-sm text-gray-500">Try adjusting your filters or browse all scholarships.</p>
                                    <a href="/" className="inline-block mt-4 text-blue-700 hover:text-blue-800 font-semibold">
                                        Browse All Scholarships →
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600 text-sm">
                        © 2025 IndiaScholarships.in - Helping students find scholarships across India
                    </p>
                </div>
            </footer>
        </div>
    );
}
