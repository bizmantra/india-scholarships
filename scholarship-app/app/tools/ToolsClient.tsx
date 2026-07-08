'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import {
    Calculator,
    ArrowRight,
    Coins,
    Sparkles,
    BookOpen,
    GraduationCap,
    ArrowLeftRight,
    ShieldCheck,
    Clock,
    ChevronDown
} from 'lucide-react';

interface Props {
    totalScholarships: number;
    totalValue: number;
}

type Category = 'all' | 'eligibility' | 'calculators' | 'grades';

interface ToolItem {
    id: string;
    title: string;
    query: string;          // short user-intent line
    description: string;    // simple, one-sentence description
    icon: any;
    href: string;
    badge?: string;
    comingSoon?: boolean;
    gradient: string;
    category: Category;
}

interface ToolGroup {
    id: Category;
    label: string;
    subtitle: string;
    tools: ToolItem[];
}

const TOOL_GROUPS: ToolGroup[] = [
    {
        id: 'eligibility',
        label: 'Eligibility Checkers',
        subtitle: 'Find out if you qualify for a scholarship',
        tools: [
            {
                id: 'eligibility-checker',
                title: 'Scholarship Eligibility Checker',
                query: 'Am I eligible for a scholarship?',
                description: 'Enter your details and instantly see which government and private scholarships you qualify for.',
                icon: ShieldCheck,
                href: '/eligibility-checker',
                badge: 'Most Used',
                gradient: 'from-blue-600 to-indigo-600',
                category: 'eligibility',
            },
            {
                id: 'finder-wizard',
                title: 'Scholarship Finder Wizard',
                query: 'Which scholarship is best for me?',
                description: 'Answer a few questions and get a personalised list of scholarships that match your profile.',
                icon: Sparkles,
                href: '/tools/scholarship-finder-wizard',
                comingSoon: true,
                gradient: 'from-purple-600 to-pink-600',
                category: 'eligibility',
            },
            {
                id: 'compare',
                title: 'Scholarship Compare Tool',
                query: 'Which scholarship gives more money?',
                description: 'Compare two scholarships side-by-side — amount, deadline, eligibility, and how to apply.',
                icon: ArrowLeftRight,
                href: '/tools/scholarship-compare-tool',
                comingSoon: true,
                gradient: 'from-sky-600 to-indigo-600',
                category: 'eligibility',
            },
        ],
    },
    {
        id: 'calculators',
        label: 'Scholarship Calculators',
        subtitle: 'Calculate money, loans, and education costs',
        tools: [
            {
                id: 'income-calculator',
                title: 'Family Income Calculator',
                query: 'Is my family income within the scholarship limit?',
                description: 'Add up all income sources and check if your household falls under the scholarship income cap.',
                icon: Coins,
                href: '/tools/family-income-calculator',
                gradient: 'from-amber-500 to-orange-600',
                category: 'calculators',
            },
            {
                id: 'amount-calculator',
                title: 'Scholarship Amount Calculator',
                query: 'How much scholarship money will I get?',
                description: 'Estimate your scholarship amount based on your course, level, category, and state.',
                icon: GraduationCap,
                href: '/tools/scholarship-amount-calculator',
                gradient: 'from-violet-600 to-fuchsia-600',
                category: 'calculators',
            },
            {
                id: 'study-cost-calculator',
                title: 'Study Cost Calculator',
                query: 'How much will my education cost in total?',
                description: 'Calculate total education costs — tuition, hostel, books, and travel — and see your funding gap.',
                icon: BookOpen,
                href: '/tools/study-cost-calculator',
                gradient: 'from-cyan-600 to-blue-600',
                category: 'calculators',
            },
            {
                id: 'loan-emi-calculator',
                title: 'Education Loan EMI Calculator',
                query: 'How much will I repay each month on my student loan?',
                description: 'Calculate your monthly EMI with moratorium period and government interest subsidy included.',
                icon: Calculator,
                href: '/tools/education-loan-emi-calculator',
                gradient: 'from-rose-600 to-red-600',
                category: 'calculators',
            },
        ],
    },
    {
        id: 'grades',
        label: 'Grade & Marks Tools',
        subtitle: 'Convert and verify your academic scores',
        tools: [
            {
                id: 'cgpa-calculator',
                title: 'CGPA to Percentage Converter',
                query: 'What is my CGPA in percentage?',
                description: 'Convert your CGPA to percentage to check if you meet the minimum marks required for a scholarship.',
                icon: Calculator,
                href: '/tools/cgpa-percentage-converter',
                gradient: 'from-emerald-600 to-teal-600',
                category: 'grades',
            },
        ],
    },
];

const ALL_TOOLS = TOOL_GROUPS.flatMap(g => g.tools);

const CATEGORY_TABS: { id: Category; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'calculators', label: 'Calculators' },
    { id: 'grades', label: 'Grades' },
];

const FAQ_ITEMS = [
    {
        q: 'Are these tools free?',
        a: 'Yes, all tools on IndiaScholarships are 100% free. No sign-up required.',
    },
    {
        q: 'Which tool should I use first?',
        a: 'Start with the Scholarship Eligibility Checker. It takes under 2 minutes and shows you which scholarships you qualify for right now.',
    },
    {
        q: 'How do I convert CGPA to percentage for a scholarship form?',
        a: 'Use the CGPA to Percentage Converter. Enter your CGPA and it instantly shows the equivalent percentage so you can check if you meet the minimum marks cutoff.',
    },
    {
        q: 'What is the family income limit for scholarships in India?',
        a: 'It varies by scheme — most central government scholarships have a limit of ₹2.5 lakh per year, while others go up to ₹6–8 lakh. Use the Family Income Calculator to check your household total.',
    },
    {
        q: 'Do these tools work on mobile?',
        a: 'Yes. All tools are designed for mobile and work on any device, even on slow internet connections.',
    },
];

export default function ToolsClient({ totalScholarships, totalValue }: Props) {
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const isFiltered = activeCategory !== 'all';
    const filteredTools = isFiltered ? ALL_TOOLS.filter(t => t.category === activeCategory) : [];
    const liveCount = ALL_TOOLS.filter(t => !t.comingSoon).length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.18),transparent_60%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-4 tracking-wider uppercase">
                        <Sparkles className="w-3 h-3" />
                        <span>{liveCount} Free Tools — No Sign-Up Needed</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
                        Free Scholarship Tools<br />
                        <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                            for Indian Students
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto mb-8">
                        Check eligibility, calculate scholarship amounts, convert CGPA, and plan your education budget — all in one place.
                    </p>
                    <div className="inline-grid grid-cols-3 gap-px bg-slate-700/50 rounded-2xl overflow-hidden border border-slate-700/50 max-w-sm mx-auto w-full">
                        <div className="bg-slate-800/60 px-4 py-3 text-center">
                            <p className="text-xl font-extrabold text-blue-400">{totalScholarships}+</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Scholarships</p>
                        </div>
                        <div className="bg-slate-800/60 px-4 py-3 text-center">
                            <p className="text-xl font-extrabold text-teal-400">₹{(totalValue / 10000000).toFixed(0)}Cr+</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Value</p>
                        </div>
                        <div className="bg-slate-800/60 px-4 py-3 text-center">
                            <p className="text-xl font-extrabold text-purple-400">{liveCount}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Free Tools</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Filter Tabs ── */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 py-3 overflow-x-auto scrollbar-hide">
                        {CATEGORY_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveCategory(tab.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                                    activeCategory === tab.id
                                        ? 'bg-blue-700 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tools Grid ── */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                {isFiltered ? (
                    /* Flat filtered grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                    </div>
                ) : (
                    /* Grouped "All" view */
                    <div className="space-y-12">
                        {TOOL_GROUPS.map(group => (
                            <div key={group.id}>
                                <div className="mb-6">
                                    <h2 className="text-xl font-black text-gray-900">{group.label}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">{group.subtitle}</p>
                                </div>
                                <div className={`grid grid-cols-1 md:grid-cols-2 ${group.tools.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-5`}>
                                    {group.tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── FAQ ── */}
            <section className="bg-white border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-black text-gray-900 mb-1 text-center">Common Questions</h2>
                    <p className="text-gray-500 text-sm mb-7 text-center">Questions students ask most about IndiaScholarships tools.</p>
                    <div className="space-y-2">
                        {FAQ_ITEMS.map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

/* ── Shared Tool Card ── */
function ToolCard({ tool }: { tool: ToolItem }) {
    const Icon = tool.icon;

    if (tool.comingSoon) {
        return (
            <div className="relative bg-white border border-gray-200 rounded-2xl p-5 flex flex-col opacity-60 select-none">
                <div className="absolute top-3.5 right-3.5">
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                        <Clock className="w-2.5 h-2.5" />
                        Coming Soon
                    </span>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center mb-4 opacity-40`}>
                    <Icon className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{tool.query}</p>
                <h3 className="font-bold text-base text-gray-400 mb-2">{tool.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{tool.description}</p>
            </div>
        );
    }

    return (
        <Link
            href={tool.href}
            className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col"
        >
            {tool.badge && (
                <div className="absolute top-3.5 right-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">
                        {tool.badge}
                    </span>
                </div>
            )}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 group-hover:text-blue-500 transition-colors">{tool.query}</p>
            <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-700 transition-colors mb-2">{tool.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">{tool.description}</p>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:text-blue-800 transition-colors mt-4">
                <span>Open Tool</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
        </Link>
    );
}
