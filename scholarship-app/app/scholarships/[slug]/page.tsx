import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllScholarships, getScholarshipBySlug } from '@/lib/db';
import {
    Calendar,
    MapPin,
    Users,
    IndianRupee,
    Globe,
    CheckCircle2,
    ExternalLink,
    ChevronRight,
    Info,
    ShieldCheck,
    Clock,
    Award,
    MousePointer2,
    RefreshCcw,
    CreditCard,
    ArrowLeft
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Generate static params for all scholarships
export async function generateStaticParams() {
    const scholarships = getAllScholarships();
    return scholarships.map((scholarship: any) => ({
        slug: scholarship.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const scholarship = getScholarshipBySlug(slug);

    if (!scholarship) {
        return {
            title: 'Scholarship Not Found',
        };
    }

    return {
        title: `${scholarship.title} – Eligibility, Amount & How to Apply`,
        description: scholarship.intro_seo?.substring(0, 160) || `${scholarship.title} details including eligibility, benefits, income limit, application process, and official source.`,
    };
}

export default async function ScholarshipDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const scholarship = getScholarshipBySlug(slug);

    if (!scholarship) {
        notFound();
    }

    // Helper to display value or "Not specified"
    const displayValue = (value: any) => {
        if (value === null || value === undefined || value === '') return 'Not specified';
        return value;
    };

    // Format amount
    const formatAmount = (amount: number | null) => {
        if (!amount) return 'Not specified';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh+`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k+`;
        return `₹${amount}`;
    };

    const FormattedText = ({ text, type = 'list' }: { text: string | null, type?: 'list' | 'steps' }) => {
        if (!text) return <p className="text-gray-400 italic">Not specified</p>;

        let items: string[] = [];

        if (type === 'steps' || /Step \d+:/i.test(text)) {
            // Handle "Step 1: ... Step 2: ..." format
            items = text.split(/Step \d+:/i).filter(s => s.trim());
        } else {
            // Split by sentences or common list pattern
            // We split by dots followed by space and capital, or by labels like "Verification:", or by ";"
            items = text
                .split(/\.\s+(?=[A-Z])|(?=[A-Z][A-Za-z\s]+:)|(?=\(\w\))|(?=•)|(?=–)|;/)
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.match(/^(Selection based on|Renewal conditions):$/i));
        }

        if (items.length <= 1) {
            return <p className="text-gray-700 leading-relaxed">{text}</p>;
        }

        return (
            <ul className={`space-y-3 ${type === 'steps' ? 'list-none' : 'list-none'}`}>
                {items.map((item, i) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                        {type === 'steps' ? (
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                                    {i + 1}
                                </span>
                                <div className="flex-1 pt-1">
                                    {item.includes(':') ? (
                                        <>
                                            <span className="font-bold text-blue-900 border-b border-blue-100 mr-2">
                                                {item.split(':')[0]}
                                            </span>
                                            <p className="mt-1 text-gray-600">{item.split(':').slice(1).join(':').trim()}</p>
                                        </>
                                    ) : (
                                        <p>{item.trim()}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                                <p>{item.trim()}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <Header />

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-6">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <ChevronRight className="h-2 w-2" />
                    <Link href="/" className="hover:text-blue-700">Scholarships</Link>
                    <ChevronRight className="h-2 w-2" />
                    <span className="text-gray-900 truncate max-w-[200px]">{scholarship.title}</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                        {scholarship.title}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-bold">{scholarship.provider}</span>
                        <span className="text-gray-300">|</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded uppercase">
                            {scholarship.provider_type}
                        </span>
                    </div>
                </div>

                {/* Visual Stat Badges */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Scholarship Amount</span>
                        <span className="text-xl font-black text-blue-700 block truncate">
                            {scholarship.amount_min && scholarship.amount_annual
                                ? `₹${(scholarship.amount_annual / 1000).toFixed(0)}k+`
                                : formatAmount(scholarship.amount_annual)
                            }
                        </span>
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Application Deadline</span>
                        <span className="text-xl font-black text-red-600 block truncate">
                            {scholarship.deadline
                                ? new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                : 'Open Now'
                            }
                        </span>
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm col-span-2 md:col-span-1">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Target Community</span>
                        <span className="text-xl font-black text-gray-900 block truncate">
                            {scholarship.caste && scholarship.caste.length > 0 ? scholarship.caste[0] : 'All Categories'}
                        </span>
                    </div>
                </div>

                {/* About the Program */}
                {scholarship.intro_seo && (
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-gray-900">About the Program</h2>
                        </div>
                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                            <p>{scholarship.intro_seo}</p>
                        </div>
                    </section>
                )}

                <hr className="my-8 border-gray-200" />

                {/* Quick Facts */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Quick Facts</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Provider</span>
                            <span className="font-bold text-gray-900">{scholarship.provider}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Provider Type</span>
                            <span className="font-bold text-gray-900">{scholarship.provider_type}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Education Level</span>
                            <span className="font-bold text-gray-900">{displayValue(scholarship.level)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Category</span>
                            <span className="font-bold text-gray-900">{scholarship.caste.join(', ') || 'All'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Gender</span>
                            <span className="font-bold text-gray-900">{displayValue(scholarship.gender)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Applicable State</span>
                            <span className="font-bold text-gray-900">{scholarship.state || 'Across India'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Income Limit</span>
                            <span className="font-bold text-gray-900">
                                {scholarship.income_limit ? `₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/year` : 'No Limit'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Scholarship Amount</span>
                            <span className="font-bold text-blue-700">{formatAmount(scholarship.amount_annual)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Application Mode</span>
                            <span className="font-bold text-gray-900">{scholarship.application_mode}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Last Verified</span>
                            <span className="font-bold text-gray-600">
                                {scholarship.last_verified ? new Date(scholarship.last_verified).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
                            </span>
                        </div>
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Trust & Verification */}
                <section className="mb-8">
                    <div className="p-6 bg-green-50 border border-green-100 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <ShieldCheck className="h-6 w-6 text-green-600" />
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Verified Listing</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    Updated {scholarship.verification_year || new Date().getFullYear()} Cycle
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                            Our editors manually verified this scholarship details from {scholarship.provider}'s official notification.
                            Last checked on {scholarship.last_verified ? new Date(scholarship.last_verified).toLocaleDateString('en-IN') : 'recently'}.
                        </p>
                        {scholarship.helpline && (
                            <div className="pt-3 border-t border-green-200">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Official Helpline</h4>
                                <p className="text-sm font-bold text-gray-900">{scholarship.helpline}</p>
                            </div>
                        )}
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Apply Now CTA */}
                <div className="mb-8">
                    <a
                        href={scholarship.apply_url || scholarship.official_source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 bg-blue-700 text-white text-center font-bold rounded-lg hover:bg-blue-800 transition-colors"
                    >
                        Apply Now on Official Portal
                    </a>
                </div>

                <hr className="my-8 border-gray-200" />

                {/* Eligibility Criteria */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Eligibility Criteria</h2>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Category & Residency</h3>
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Eligible Category:</span>
                            <span className="flex-1">{scholarship.caste.join(', ')}</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Domicile Requirement:</span>
                            <span className="flex-1">{displayValue(scholarship.residency_requirement)}</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Education</h3>
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Minimum Qualification:</span>
                            <span className="flex-1">{scholarship.level} with {scholarship.min_marks || 'passing'}% marks</span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Applicable Courses:</span>
                            <span className="flex-1">{scholarship.course_stream.join(', ') || 'All standard courses'}</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Income</h3>
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Annual Family Income Limit:</span>
                            <span className="flex-1">
                                {scholarship.income_limit ? `₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/year` : 'Not specified'}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-2">Other Conditions</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Age Limit:</span>
                            <span className="flex-1">{displayValue(scholarship.age_limit)}</span>
                        </div>
                        {scholarship.special_conditions && (
                            <div className="flex">
                                <span className="w-40 text-gray-600">Special Conditions:</span>
                                <span className="flex-1">{scholarship.special_conditions}</span>
                            </div>
                        )}
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Benefits & Financial Support */}
                <section className="mb-8 p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <IndianRupee className="w-6 h-6 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Benefits & Financial Support</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-tight">Scholarship Amount</h3>
                                <p className="text-3xl font-black text-orange-600">
                                    {scholarship.amount_min && scholarship.amount_annual
                                        ? `₹${scholarship.amount_min.toLocaleString('en-IN')} - ₹${scholarship.amount_annual.toLocaleString('en-IN')}`
                                        : formatAmount(scholarship.amount_annual)
                                    }
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{displayValue(scholarship.amount_description)}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-semibold text-gray-900">{displayValue(scholarship.renewal)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Payment:</span>
                                    <span className="font-semibold text-gray-900">Direct Benefit Transfer (DBT)</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                What You'll Receive
                            </h3>
                            <div className="text-sm">
                                <FormattedText text={scholarship.benefits} />
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-6 italic bg-white/50 p-2 rounded border border-orange-50 inline-block">
                        * Actual scholarship amount and disbursement are subject to government notifications and budget availability.
                    </p>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Application Process */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MousePointer2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Application Process</h2>
                    </div>
                    <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                        <FormattedText text={scholarship.step_guide} type="steps" />
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Required Documents */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Required Documents</h2>
                    </div>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                        {scholarship.docs_needed.map((doc: string, i: number) => (
                            <li key={i}>{doc}</li>
                        ))}
                    </ul>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Selection & Renewal */}
                <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Award className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Selection Criteria</h2>
                        </div>
                        <div className="text-sm">
                            <FormattedText text={scholarship.selection} />
                        </div>

                        {scholarship.total_awards && (
                            <div className="mt-8 pt-6 border-t border-green-100">
                                <h3 className="text-sm font-black text-gray-900 mb-1 uppercase tracking-wider">Total Awards</h3>
                                <p className="text-2xl font-black text-green-700">{scholarship.total_awards.toLocaleString('en-IN')} scholarships</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <RefreshCcw className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Renewal Info</h2>
                        </div>
                        <div className="text-sm">
                            <FormattedText text={scholarship.renewal} />
                        </div>
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Important Dates */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Important Dates</h2>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Application Deadline:</span>
                            <span className="flex-1">
                                {scholarship.deadline
                                    ? new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : 'Varies yearly'
                                }
                            </span>
                        </div>
                        {scholarship.deadline_description && (
                            <div className="flex">
                                <span className="w-40 text-gray-600">Note:</span>
                                <span className="flex-1">{scholarship.deadline_description}</span>
                            </div>
                        )}
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Help & Official Contact */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Help & Official Contact</h2>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex">
                            <span className="w-40 text-gray-600">Official Website:</span>
                            <span className="flex-1">
                                <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-1">
                                    {scholarship.official_source} <ExternalLink className="h-3 w-3" />
                                </a>
                            </span>
                        </div>
                        <div className="flex">
                            <span className="w-40 text-gray-600">Helpline:</span>
                            <span className="flex-1">{displayValue(scholarship.helpline)}</span>
                        </div>
                    </div>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* FAQs */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    {(() => {
                        try {
                            if (scholarship.faq_json) {
                                const faqs = JSON.parse(scholarship.faq_json);
                                return (
                                    <div className="space-y-4">
                                        {faqs.map((faq: any, i: number) => (
                                            <div key={i} className="border-b border-gray-100 pb-4">
                                                <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                                                <p className="text-sm text-gray-600">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                        } catch (e) {
                            console.error('Error parsing FAQ JSON:', e);
                        }
                        return <p className="text-sm text-gray-500 italic">No FAQs available for this scholarship yet.</p>;
                    })()}
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Disclaimer */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Disclaimer</h2>
                    <p className="text-sm text-gray-700">
                        Scholarship details are based on publicly available information. Eligibility, benefits, and timelines may change as per official notifications. Applicants are advised to verify details on the official website before applying.
                    </p>
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Related Scholarships */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Related Scholarships</h2>
                    </div>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href={`/${scholarship.provider_type.toLowerCase()}-scholarships`} className="text-blue-700 hover:underline">
                                Other scholarships by {scholarship.provider_type}
                            </Link>
                        </li>
                        <li>
                            <Link href={`/scholarships-level/${scholarship.level.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-700 hover:underline">
                                Scholarships for {scholarship.level} students
                            </Link>
                        </li>
                        <li>
                            <Link href={`/scholarships-for/${scholarship.caste[0].toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-700 hover:underline">
                                Scholarships for {scholarship.caste[0]} category
                            </Link>
                        </li>
                        <li>
                            <Link href={`/scholarships-in/${scholarship.state.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-700 hover:underline">
                                Scholarships in {scholarship.state}
                            </Link>
                        </li>
                    </ul>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
