'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
    Calculator, 
    CheckCircle2, 
    ArrowRight, 
    Coins, 
    Sparkles, 
    BookOpen, 
    GraduationCap, 
    ArrowLeftRight, 
    ShieldCheck,
    Search
} from 'lucide-react';

interface Props {
    totalScholarships: number;
    totalValue: number;
}

interface ToolItem {
    id: string;
    title: string;
    description: string;
    icon: any;
    href: string;
    badge?: string;
    category: 'academic' | 'financial' | 'matching';
    gradient: string;
}

const TOOLS: ToolItem[] = [
    {
        id: 'eligibility-checker',
        title: 'Scholarship Eligibility Checker',
        description: 'Verify your eligibility instantly with the IndiaScholarships Scholarship Eligibility Checker to scan government & private schemes.',
        icon: ShieldCheck,
        href: '/eligibility-checker',
        badge: 'Popular',
        category: 'matching',
        gradient: 'from-blue-600 to-indigo-600'
    },
    {
        id: 'finder-wizard',
        title: 'Scholarship Finder Wizard',
        description: 'Guided multi-step diagnostic profile builder to find, narrow down, and recommend matching scholarships.',
        icon: Sparkles,
        href: '/tools/finder-wizard',
        badge: 'Recommended',
        category: 'matching',
        gradient: 'from-purple-600 to-pink-600'
    },
    {
        id: 'cgpa-calculator',
        title: 'CGPA to Percentage Converter',
        description: 'Convert your academic grades using the IndiaScholarships CGPA to Percentage Converter to check criteria cutoffs.',
        icon: Calculator,
        href: '/tools/cgpa-percentage-converter',
        category: 'academic',
        gradient: 'from-emerald-600 to-teal-600'
    },
    {
        id: 'income-calculator',
        title: 'Family Income Calculator',
        description: 'Check your eligibility rules using the IndiaScholarships Family Income Calculator to verify household income caps.',
        icon: Coins,
        href: '/tools/family-income-calculator',
        category: 'financial',
        gradient: 'from-amber-500 to-orange-600'
    },
    {
        id: 'amount-calculator',
        title: 'Scholarship Amount Calculator',
        description: 'Estimate your benefits using the IndiaScholarships Scholarship Amount Calculator based on level, course stream, and caste.',
        icon: GraduationCap,
        href: '/tools/scholarship-amount-calculator',
        category: 'financial',
        gradient: 'from-violet-600 to-fuchsia-600'
    },
    {
        id: 'study-cost-calculator',
        title: 'Study Cost Calculator',
        description: 'Plan educational budgets with the IndiaScholarships Study Cost Calculator to estimate tuition fees and living expenses.',
        icon: BookOpen,
        href: '/tools/study-cost-calculator',
        category: 'financial',
        gradient: 'from-cyan-600 to-blue-600'
    },
    {
        id: 'loan-emi-calculator',
        title: 'Education Loan EMI Calculator',
        description: 'Determine your student loan repayment metrics with the IndiaScholarships Education Loan EMI Calculator.',
        icon: Calculator,
        href: '/tools/education-loan-emi-calculator',
        category: 'financial',
        gradient: 'from-rose-600 to-red-600'
    },
    {
        id: 'compare',
        title: 'Scholarship Compare Tool',
        description: 'Review different schemes side-by-side using the IndiaScholarships Scholarship Compare Tool.',
        icon: ArrowLeftRight,
        href: '/tools/scholarship-compare-tool',
        badge: 'New',
        category: 'matching',
        gradient: 'from-sky-600 to-indigo-600'
    }
];

export default function ToolsClient({ totalScholarships, totalValue }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'financial' | 'matching'>('all');

    const filteredTools = TOOLS.filter(tool => {
        const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                <Header />
                
                {/* Hero Panel */}
                <section className="relative overflow-hidden bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>100% Free Scholarship Utilities</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
                            Smart Calculators & Tools for Indian Students
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Discover eligibility requirements, convert grading scales, model budgets, and compare top scholarship plans in seconds.
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl mx-auto pt-6 border-t border-slate-800">
                            <div className="text-center">
                                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">{totalScholarships}+</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Active Schemes</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">₹{(totalValue / 10000000).toFixed(1)} Cr+</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Total Value</p>
                            </div>
                            <div className="text-center col-span-2 md:col-span-1">
                                <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">Instant</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Eligibility Engine</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Directory Controls */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {(['all', 'matching', 'academic', 'financial'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                        selectedCategory === cat
                                            ? 'bg-blue-700 text-white shadow-md shadow-blue-500/20'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {cat === 'all' ? 'All Tools' : `${cat} tools`}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Tools Grid */}
                    {filteredTools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTools.map((tool) => {
                                const Icon = tool.icon;
                                return (
                                    <Link 
                                        key={tool.id} 
                                        href={tool.href}
                                        className="group bg-white border border-gray-150 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                                                    {tool.title}
                                                </h3>
                                                {tool.badge && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-100 text-blue-800 rounded-full">
                                                        {tool.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                                {tool.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 group-hover:text-blue-800 transition-colors">
                                            <span>Launch Tool</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-semibold mb-2">No tools match your criteria.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                className="text-sm font-bold text-blue-700 hover:text-blue-800"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
}
