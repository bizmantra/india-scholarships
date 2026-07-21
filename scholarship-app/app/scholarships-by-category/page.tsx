import Link from 'next/link';
import { getAllCategories, getCategoryScholarshipCounts, getScholarshipsByCategory } from '@/lib/db';
import { slugify } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Sparkles, Users, FileCheck, ShieldCheck, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

export const metadata = {
    title: 'Scholarships by Category 2026 - SC, ST, OBC, EWS, Minority | IndiaScholarships',
    description: 'Find caste & category scholarships in India. Browse verified SC, ST, OBC, General EWS, PWD, and Minority welfare schemes with eligibility rules.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/scholarships-by-category',
    }
};

interface CategoryMeta {
    name: string;
    slug: string;
    countKey: string;
    description: string;
    stipend: string;
    icon: string;
    docs: string[];
    bg: string;
    badgeColor: string;
}

const CATEGORY_DEFINITIONS: CategoryMeta[] = [
    {
        name: 'Scheduled Caste (SC)',
        slug: 'sc',
        countKey: 'SC',
        description: 'Post-matric maintenance allowances, free coaching, and tuition fee reimbursements for SC students.',
        stipend: 'Up to ₹2.5 Lakh / Year',
        icon: '👥',
        docs: ['Caste Certificate (Sub-Divisional Officer)', 'Income Cert (< ₹2.5L)', 'Aadhaar Seeded Bank Account'],
        bg: 'bg-blue-50/40 border-blue-100',
        badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
        name: 'Scheduled Tribe (ST)',
        slug: 'st',
        countKey: 'ST',
        description: 'Pre-matric and post-matric tribal welfare schemes, national fellowship, and overseas study grants.',
        stipend: 'Up to ₹2.5 Lakh / Year',
        icon: '🏔️',
        docs: ['ST Tribe Certificate', 'Family Income Certificate', 'College Fee Receipt'],
        bg: 'bg-green-50/40 border-green-100',
        badgeColor: 'bg-green-100 text-green-800'
    },
    {
        name: 'Other Backward Classes (OBC)',
        slug: 'obc',
        countKey: 'OBC',
        description: 'Non-creamy layer OBC scholarships, hostel subsidies, and central sector merit schemes.',
        stipend: 'Up to ₹1.5 Lakh / Year',
        icon: '📚',
        docs: ['OBC Non-Creamy Layer Certificate', 'Annual Income Proof', 'Marksheets'],
        bg: 'bg-amber-50/40 border-amber-100',
        badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
        name: 'General (EWS)',
        slug: 'general',
        countKey: 'General',
        description: 'Economically Weaker Section (EWS) schemes, defense personnel wards, and open merit corporate CSR funds.',
        stipend: 'Up to ₹1.0 Lakh / Year',
        icon: '🌟',
        docs: ['EWS Certificate (Competent Authority)', 'Class 10/12 Marksheet', 'Identity Card'],
        bg: 'bg-indigo-50/40 border-indigo-100',
        badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
        name: 'Minority Communities',
        slug: 'minority',
        countKey: 'Minority',
        description: 'Begum Hazrat Mahal, Maulana Azad, and Ministry of Minority Affairs merit-cum-means scholarships for Muslim, Christian, Sikh, Buddhist, Jain, Parsi students.',
        stipend: 'Up to ₹75,000 / Year',
        icon: '🕌',
        docs: ['Self-Declaration Minority Cert', 'Income Cert (< ₹2.0L)', 'Aadhaar Card'],
        bg: 'bg-purple-50/40 border-purple-100',
        badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
        name: 'Students with Disability (PWD)',
        slug: 'pwd',
        countKey: 'PWD',
        description: 'Divyangjan scholarships, device allowances, reader assistance, and accessible higher education stipends.',
        stipend: 'Up to ₹2.0 Lakh / Year',
        icon: '♿',
        docs: ['Valid UDID Card (min 40% disability)', 'Income Proof', 'Institution Verification Form'],
        bg: 'bg-teal-50/40 border-teal-100',
        badgeColor: 'bg-teal-100 text-teal-800'
    },
];

export default async function ScholarshipsByCategoryPage() {
    const countsMap = await getCategoryScholarshipCounts();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Header */}
            <section className="bg-gradient-to-b from-blue-50/50 via-white to-white py-12 px-4 border-b border-gray-150 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/60 text-blue-800 text-xs font-bold mb-4 border border-blue-200/50">
                        <Sparkles className="h-3.5 w-3.5 text-blue-700 animate-pulse" />
                        Categorized Aid • Social & Financial Welfare Hub
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 font-serif leading-[1.1]">
                        Scholarships by Category 2026 <br className="hidden sm:inline" />
                        <span className="text-google-blue">Social & Welfare Schemes</span>
                    </h1>

                    <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                        Find verified scholarships reserved for SC, ST, OBC, EWS, PWD, and Minority community students in India.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-12">
                
                {/* Category Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {CATEGORY_DEFINITIONS.map(cat => {
                        const count = countsMap[cat.countKey] || 0;
                        return (
                            <div
                                key={cat.slug}
                                className={`group p-6 rounded-3xl border transition-all hover:shadow-md flex flex-col justify-between ${cat.bg}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-4xl">{cat.icon}</span>
                                        <span className={`px-3 py-1 text-xs font-black rounded-full border border-gray-200/60 ${cat.badgeColor}`}>
                                            {count > 0 ? `${count} Active Schemes` : 'Verified Schemes'}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-black text-gray-900 group-hover:text-google-blue transition-colors mb-2 font-serif">
                                        {cat.name}
                                    </h2>

                                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                        {cat.description}
                                    </p>

                                    {/* Benefits & Documents checklist */}
                                    <div className="bg-white/80 p-3.5 rounded-2xl border border-gray-150 mb-5 text-xs">
                                        <span className="font-bold text-gray-900 block mb-1">Top Financial Tier: <span className="text-google-green font-extrabold">{cat.stipend}</span></span>
                                        <span className="text-[11px] text-gray-500 font-bold block mb-1 uppercase tracking-wider">Required Certificates:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {cat.docs.map((doc, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-semibold">
                                                    ✓ {doc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/scholarships-for/${cat.slug}`}
                                    className="w-full py-2.5 bg-white hover:bg-google-blue hover:text-white border border-gray-200 text-google-blue rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                    <span>Browse {cat.name} Grants</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Reservation Guidelines Info Box */}
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 mb-14">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-serif">Category Reservation Rules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600 leading-relaxed">
                        <div className="p-4 bg-white rounded-2xl border border-gray-150">
                            <span className="font-bold text-gray-900 block mb-1">📜 Competent Issuing Authority</span>
                            Caste certificates must be issued by a Revenue Officer (Tehsildar / SDO / District Magistrate) of your home domicile state.
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-150">
                            <span className="font-bold text-gray-900 block mb-1">💳 Non-Creamy Layer Validity</span>
                            OBC (Non-Creamy Layer) and EWS financial certificates must be issued for the current financial year.
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-150">
                            <span className="font-bold text-gray-900 block mb-1">🏦 Direct Benefit Transfer (DBT)</span>
                            Sanctioned scholarship amounts are credited directly into Aadhaar-seeded bank accounts via NPCI mapping.
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
