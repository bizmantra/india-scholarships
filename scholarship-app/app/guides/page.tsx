import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, Search, ArrowRight, CheckCircle2, FileText, Bell, MapPin, Globe, Sparkles, ShieldCheck } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
    title: 'Scholarship Guides & State Portal Directory 2026 | IndiaScholarships',
    description: 'Comprehensive scholarship portal guides for NSP, e-Kalyan Jharkhand, Digital Gujarat, SSP Karnataka, Aikyashree WB, MPTAAS, and E-Grantz Kerala. Login, status, and application help.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/guides',
    }
};

export default function GuidesPage() {
    const portalGuides = [
        {
            title: 'e-Kalyan Jharkhand Portal',
            description: 'Post-Matric student login, application status check, income affidavit format, and PFMS tracking.',
            link: '/guides/e-kalyan-jharkhand',
            tag: 'Jharkhand',
            activeCount: '213k Monthly Searches'
        },
        {
            title: 'Digital Gujarat & MYSY Portal',
            description: 'Digital Gujarat citizen registration, MYSY 80 percentile rules, document upload, and status.',
            link: '/guides/digital-gujarat-mysy',
            tag: 'Gujarat',
            activeCount: '163k Monthly Searches'
        },
        {
            title: 'National Scholarship Portal (NSP)',
            description: 'Aadhaar Face-RD OTR registration, central scheme matching, and institute verification guide.',
            link: '/guides/nsp',
            tag: 'Central India',
            activeCount: '121k Monthly Searches'
        },
        {
            title: 'Aikyashree & WB Portals',
            description: 'WBMDFC Aikyashree, Oasis SC/ST, and SVMCM merit scholarship status tracking and IFMS Lot numbers.',
            link: '/guides/aikyashree-west-bengal',
            tag: 'West Bengal',
            activeCount: '144k Monthly Searches'
        },
        {
            title: 'SSP Karnataka Portal',
            description: 'Kutumba Family ID integration, e-Attestation requirements, and Social Welfare post-matric login.',
            link: '/guides/ssp-karnataka',
            tag: 'Karnataka',
            activeCount: '67k Monthly Searches'
        },
        {
            title: 'Talliki Vandanam & AP Schemes',
            description: 'Andhra Pradesh ₹15,000 mother account credit status, NWC Secretariat verification, and rules.',
            link: '/guides/talliki-vandanam-ap',
            tag: 'Andhra Pradesh',
            activeCount: '64k Monthly Searches'
        },
        {
            title: 'MPTAAS & MMVY Portal',
            description: 'MP Tribal Affairs Profile ID creation, Samagra ID verification, and MMVY 70%+ merit waiver.',
            link: '/guides/mptaas-mmvy-mp',
            tag: 'Madhya Pradesh',
            activeCount: '61k Monthly Searches'
        },
        {
            title: 'E-Grantz 3.0 Kerala Portal',
            description: 'Kerala post-matric educational grant registration, Village Officer income proof, and Akshaya status.',
            link: '/guides/e-grantz-kerala',
            tag: 'Kerala',
            activeCount: '59k Monthly Searches'
        }
    ];

    const generalGuides = [
        {
            title: 'Application Status Tracking',
            description: 'Learn what different portal statuses mean and how to track payment via PFMS.',
            icon: <Search className="h-6 w-6 text-google-blue" />,
            link: '/guides/tracking',
            tag: 'Utility'
        },
        {
            title: 'Document Checklist & Formats',
            description: 'Every certificate, income affidavit, and marksheet format required before applying.',
            icon: <FileText className="h-6 w-6 text-google-blue" />,
            link: '/guides/documents',
            tag: 'Essential'
        }
    ];

    return (
        <div className="min-h-screen bg-surface-gray flex flex-col font-sans text-gray-900 antialiased">
            <Header />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1">
                
                {/* Header Title */}
                <div className="max-w-3xl mb-12">
                    <span className="px-3.5 py-1 bg-blue-50 text-google-blue text-xs font-black uppercase tracking-wider rounded-full inline-flex items-center gap-1.5 mb-3 border border-blue-100">
                        <BookOpen className="h-3.5 w-3.5" /> Official Resource Hub
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                        Scholarship Portal & Troubleshooting Guides
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                        Authoritative, step-by-step guides to state and central scholarship portals. Learn how to log in, track application status, fix biometric errors, and prepare document checklists.
                    </p>
                </div>

                {/* State Portals Grid */}
                <div className="mb-14">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                            <Globe className="h-6 w-6 text-google-blue" /> State & Central Government Portal Guides
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {portalGuides.map((guide, i) => (
                            <Link 
                                key={i} 
                                href={guide.link} 
                                className="group flex flex-col justify-between p-6 bg-white rounded-3xl border border-gray-200 hover:border-google-blue hover:shadow-xl transition-all relative overflow-hidden"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-blue-50 text-google-blue rounded-full border border-blue-100">
                                            {guide.tag}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {guide.activeCount}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-extrabold text-gray-900 mb-2 group-hover:text-google-blue transition-colors">
                                        {guide.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs leading-relaxed mb-4">
                                        {guide.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-google-blue font-bold text-xs pt-3 border-t border-gray-100">
                                    Read Portal Guide <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* General Utility Guides */}
                <div className="mb-14">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-google-blue" /> Universal Application Tools
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {generalGuides.map((guide, i) => (
                            <Link key={i} href={guide.link} className="flex gap-5 p-6 bg-white rounded-3xl border border-gray-200 hover:border-google-blue hover:shadow-lg transition-all">
                                <div className="p-3.5 bg-blue-50 text-google-blue rounded-2xl shrink-0 h-fit">
                                    {guide.icon}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded mb-2 inline-block">
                                        {guide.tag}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{guide.title}</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3">{guide.description}</p>
                                    <span className="text-google-blue font-bold text-xs inline-flex items-center gap-1">
                                        View Details <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Eligibility Matcher Banner */}
                <div className="bg-gradient-to-r from-google-blue to-blue-700 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <span className="px-3.5 py-1 bg-white/20 text-white text-xs font-black uppercase tracking-wider rounded-full inline-block mb-3 backdrop-blur-sm">
                            Instant Match Engine
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black mb-2">Not sure which portal or scheme fits you?</h2>
                        <p className="text-blue-100 text-sm max-w-xl">
                            Enter your income, category, and state to instantly match 100% eligible central, state, and corporate scholarships.
                        </p>
                    </div>
                    <Link 
                        href="/eligibility-checker" 
                        className="px-8 py-4 bg-white text-google-blue rounded-full font-bold text-sm hover:bg-blue-50 transition-all shrink-0 shadow-md flex items-center gap-2"
                    >
                        Check Eligibility Now <Sparkles className="h-4 w-4 text-google-blue" />
                    </Link>
                </div>

            </main>

            <Footer />
        </div>
    );
}
