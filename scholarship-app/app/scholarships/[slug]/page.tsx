import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllScholarships, getScholarshipBySlug, getRelatedScholarships, getCleanSteps } from '@/lib/db';
import { getCanonicalSlugForLevel, getCanonicalSlugForIncome, getCanonicalSlugForCategory, slugify, getScholarshipTypeRoute, sanitizeApplyUrl, formatDeadlineDate } from '@/lib/utils';
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
import ShareButtons from '@/app/components/ShareButtons';
import LanguageDetector from '@/app/components/LanguageDetector';




// Generate static params for all scholarships
export async function generateStaticParams() {
    const scholarships = await getAllScholarships();
    return scholarships.map((scholarship: any) => ({
        slug: scholarship.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const scholarship = await getScholarshipBySlug(slug);

    if (!scholarship) {
        return {
            title: 'Scholarship Not Found',
        };
    }

    const title = scholarship.title;
    const lowerTitle = title.toLowerCase();
    const isGov = scholarship.scholarship_type === 'Government' || 
                  lowerTitle.includes('yojana') || 
                  lowerTitle.includes('scheme') || 
                  lowerTitle.includes('portal') || 
                  lowerTitle.includes('post matric') || 
                  lowerTitle.includes('post-matric') || 
                  lowerTitle.includes('pre matric') || 
                  lowerTitle.includes('pre-matric');

    const year = scholarship.verification_year || new Date().getFullYear();
    // Helper to sanitize title from duplicate year strings (e.g. "2026", "2025-26", "2026-27")
    const cleanTitle = title.replace(/\s*(?:20\d{2}(?:-\d{2,4})?)\s*$/, '').trim();
    let seoTitle = '';

    // Specific brand overrides for June & July high-opportunity keywords
    if (slug === 'pm-yashasvi-scholarship') {
        seoTitle = `PM Yashasvi Scholarship Scheme ${year}: Apply Online, Last Date & Eligibility`;
    } else if (slug === 'sitaram-jindal-foundation-scholarship') {
        seoTitle = `Sitaram Jindal Foundation Scholarship ${year}: Apply Online & Last Date`;
    } else if (slug === 'tata-capital-pankh-scholarship') {
        seoTitle = `Tata Capital Pankh Scholarship ${year}: Up to ₹1 Lakh | Eligibility & Apply Online`;
    } else if (slug === 'mukhyamantri-medhavi-vidyarthi-yojana-mmvy') {
        seoTitle = `MMVY Scholarship ${year}: Apply Online, Eligibility, Last Date & Amount`;
    } else if (slug === 'jharkhand-e-kalyan-post-matric-scholarship') {
        seoTitle = `e-Kalyan Jharkhand Scholarship ${year}: Apply Online, Last Date & Amount`;
    } else if (slug === 'swami-vivekananda-merit-cum-means-scholarship-svmcm') {
        seoTitle = `SVMCM Scholarship ${year}: Apply Online, Eligibility, Last Date & Amount`;
    } else if (slug === 'e-grantz-kerala-scstoecoobc-support') {
        seoTitle = `e-Grantz Kerala Scholarship ${year}: Apply Online, Last Date & Amount`;
    } else if (slug === 'bitsat-scholarship') {
        seoTitle = `BITSAT Scholarship ${year}: Apply Online, Eligibility & Fee Waiver Details`;
    } else if (slug === 'hdfc-bank-parivartan-ecss-scholarship') {
        seoTitle = `HDFC Parivartan Scholarship ${year}: Up to ₹75,000 | Eligibility & Apply Online`;
    } else if (slug === 'reliance-foundation-undergraduate-scholarship') {
        seoTitle = `Reliance Foundation Scholarship ${year}: UG Apply Online, Eligibility & Selection`;
    } else if (slug === 'azim-premji-scholarship') {
        seoTitle = `Azim Premji Scholarship ${year}: For Govt School Students | Eligibility & Apply`;
    } else if (slug === 'lic-golden-jubilee-scholarship') {
        seoTitle = `LIC Golden Jubilee Scholarship ${year}: Apply Online, Eligibility & Last Date`;
    } else if (lowerTitle.includes('nabanna')) {
        seoTitle = `Nabanna Scholarship ${year}: Application Form, Eligibility & Submission Guide`;
    } else if (slug === 'krishi-vidya-nidhi-yojana-odisha') {
        seoTitle = `Krishi Vidya Nidhi Yojana Odisha ${year}: Benefit Amount & Eligibility Check`;
    } else if (slug === 'post-matric-scholarship-for-obcsebc-students-odisha') {
        seoTitle = `Odisha Post Matric OBC/SEBC Scholarship ${year}: Apply Online & Deadlines`;
    } else if (slug === 'post-matric-scholarship-for-st-students-odisha') {
        seoTitle = `Odisha Post Matric ST Scholarship ${year}: Eligibility, Last Date & Apply`;
    } else if (slug === 'boc-scholarship-nirman-shramik-kalyan-yojana-odisha') {
        seoTitle = `Odisha BOC Scholarship ${year}: Nirman Shramik Kalyan Yojana Apply Online`;
    } else if (slug === 'chief-minister-higher-education-scholarship-rajasthan') {
        seoTitle = `Rajasthan Chief Minister Higher Education Scholarship ${year}: Apply Online & Status`;
    } else if (slug === 'e-medhabruti-ug-merit-scholarship-odisha') {
        seoTitle = `e-Medhabruti UG Merit Scholarship Odisha ${year}: Apply Online, Last Date & Renewal`;
    } else if (slug === 'mukhyamantri-yuva-swavalamban-yojana-mysy') {
        seoTitle = `MYSY Scholarship Gujarat ${year}: Apply Online, Last Date, Document List & Status`;
    } else if (slug === 'jagananna-vidya-deevena-fees-reimbursement') {
        seoTitle = `Jagananna Vidya Deevena (JVD) ${year}: Fees Reimbursement Status & Apply Online`;
    } else if (slug === 'sbi-platinum-jubilee-asha-scholarship') {
        seoTitle = `SBI Asha Scholarship ${year}: ₹15,000 | Eligibility, Last Date & Apply Online`;
    } else if (slug === 'merit-cum-means-mcm-scholarship-for-minorities-professional-and-technical-courses-karnataka') {
        seoTitle = `Karnataka Minorities MCM Scholarship ${year}: Professional & Technical Apply Online`;
    } else if (slug === 'post-matric-scholarship-for-minorities-karnataka') {
        seoTitle = `Karnataka Post Matric Scholarship for Minorities ${year}: Login & Apply Online`;
    } else if (slug === 'vidyasiri-food-and-accommodation-scholarship-for-obc-students-karnataka') {
        seoTitle = `Vidyasiri Scholarship Karnataka ${year}: Food & Accommodation Apply Online & Status`;
    } else if (slug === 'post-matric-scholarship-for-st-students-karnataka') {
        seoTitle = `Karnataka Post Matric ST Scholarship ${year}: Registration Portal, Login & Apply`;
    } else if (slug === 'prime-ministers-research-fellowship-pmrf') {
        seoTitle = `PMRF Scholarship ${year}: Prime Minister's Research Fellowship Portal & Direct Apply`;
    } else if (slug === 'bihar-post-matric-scholarship-bcebc') {
        seoTitle = `Bihar Post Matric BC/EBC Scholarship ${year}: PMS Online Portal Login & Last Date`;
    } else if (slug === 'central-sector-scheme-of-scholarship-for-college-and-university-students') {
        seoTitle = `CSSS Scholarship ${year}: Central Sector Scheme for College/University Apply Online`;
    } else if (slug === 'up-post-matric-scholarship-dashmottar') {
        seoTitle = `UP Scholarship Dashmottar ${year}: Post Matric Apply Online, Login & Status Check`;
    } else if (isGov) {
        // Dynamic rule for government scholarships
        seoTitle = `${cleanTitle} ${year}: Apply Online, Portal Login & Status Check`;
    } else {
        // Dynamic rule for private/corporate/trust scholarships
        seoTitle = `${cleanTitle} ${year}: Application Form, Eligibility & Selection List`;
    }

    return {
        title: seoTitle,
        description: scholarship.intro_seo?.substring(0, 160) || `${scholarship.title} details including eligibility, benefits, income limit, application process, and official source.`,
        openGraph: {
            title: `${scholarship.title} – Application Open (${year})`,
            description: `Apply for ${scholarship.title}. Amount: ₹${scholarship.amount_annual > 0 ? scholarship.amount_annual : 'Variable'}/year. ${scholarship.level} students in ${scholarship.state || 'India'}.`,
            url: `https://www.indiascholarships.in/scholarships/${scholarship.slug}`,
            type: 'article',
            siteName: 'IndiaScholarships',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${scholarship.title}`,
            description: `Check eligibility and apply for ${scholarship.title}.`,
        }
    };
}

export default async function ScholarshipDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const scholarship = await getScholarshipBySlug(slug);

    if (!scholarship) {
        notFound();
    }

    const cleanApplyUrl = sanitizeApplyUrl(scholarship.apply_url || scholarship.official_source);

    const relatedScholarships = await getRelatedScholarships(scholarship.id, 3);

    // Dynamic deadline check (relative to India's current date boundary: June 25, 2026)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = scholarship.deadline && !isNaN(new Date(scholarship.deadline).getTime()) ? new Date(scholarship.deadline) : null;
    const isAlwaysOpen = scholarship.always_open === 1;
    const isDeadlinePassed = isAlwaysOpen ? false : (deadlineDate ? deadlineDate < today : false);

    // Helper to display value or "Not specified"
    const displayValue = (value: any) => {
        if (value === null || value === undefined || value === '') return 'Not specified';
        return value;
    };

    const year = scholarship.verification_year || new Date().getFullYear();

    // FAQPage schema
    let faqSchema = null;
    try {
        const faqs = scholarship.faq_json;
        if (Array.isArray(faqs) && faqs.length > 0) {
            const mainEntity = faqs.map((faq: any) => ({
                '@type': 'Question',
                name: faq.question || faq.q || '',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer || faq.a || ''
                }
            })).filter((item: any) => item.name && item.acceptedAnswer.text);

            if (mainEntity.length > 0) {
                faqSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: mainEntity
                };
            }
        }
    } catch (e) {}

    // GovernmentService schema
    let govServiceSchema = null;
    if (scholarship.scholarship_type === 'Government' || scholarship.provider_type === 'Government') {
        govServiceSchema = {
            '@context': 'https://schema.org',
            '@type': 'GovernmentService',
            name: scholarship.title,
            serviceType: 'Scholarship',
            provider: {
                '@type': 'GovernmentOrganization',
                name: scholarship.provider || 'Government Agency'
            },
            areaServed: {
                '@type': 'AdministrativeArea',
                name: scholarship.state || 'India'
            },
            serviceOperator: {
                '@type': 'GovernmentOrganization',
                name: scholarship.provider || 'Government Agency'
            },
            eligibilityNote: scholarship.residency_requirement || scholarship.level || 'Refer to eligibility guidelines'
        };
    }

    // Format amount
    const formatAmount = (amount: number | null, description: string = '') => {
        if (!amount || amount === 0) {
            return description || 'Check official notification';
        }

        let foreignAmountStr = '';
        const scope = scholarship.scholarship_scope || '';
        const isInternational = scope.toLowerCase() === 'international' || scope.toLowerCase() === 'study-abroad' || (scholarship.country_of_study && scholarship.country_of_study.toLowerCase() !== 'india');
        
        if (isInternational && description) {
            // Find patterns like: S$3,000, $4,800, £10,000, €15,000, SGD 3,000, USD 5,000
            const match = description.match(/(?:S\$|SGD|USD|\$|£|€|EUR|GBP|CAD|C\$|AUD|A\$)\s*[\d,]+(?:\s*(?:to|-)\s*(?:S\$|SGD|USD|\$|£|€|EUR|GBP|CAD|C\$|AUD|A\$)?\s*[\d,]+)?/i);
            if (match) {
                foreignAmountStr = match[0].trim();
                // If it's a monthly amount, append /mo for clarity
                const lowerDesc = description.toLowerCase();
                if (lowerDesc.includes('/month') || lowerDesc.includes('monthly') || lowerDesc.includes('per month')) {
                    if (!foreignAmountStr.includes('/mo') && !foreignAmountStr.includes('month')) {
                        foreignAmountStr += '/mo';
                    }
                }
            }
        }

        const inrFormatted = amount >= 100000 
            ? `₹${(amount / 100000).toFixed(1)} Lakh+` 
            : (amount >= 1000 ? `₹${(amount / 1000).toFixed(0)}k+` : `₹${amount}`);

        if (foreignAmountStr) {
            return `${foreignAmountStr} (approx. ${inrFormatted})`;
        }
        return inrFormatted;
    };

    const FormattedText = ({ text, type = 'list' }: { text: string | null, type?: 'list' | 'steps' }) => {
        if (!text) return <p className="text-gray-400 italic">Not specified</p>;

        const renderMarkdown = (txt: string) => {
            const parts = txt.split(/\*\*([\s\S]*?)\*\*/g);
            return parts.map((part, index) => {
                if (index % 2 === 1) {
                    return <strong key={index} className="font-bold text-gray-900">{part}</strong>;
                }
                return part;
            });
        };

        const renderListItem = (rawItem: string, isStepIndex?: number) => {
            // Strip leading bullet point followed by space (e.g. "- ", "* ", "1. ", "• ")
            let cleaned = rawItem.replace(/^([-•–\*]|\d+\.)\s+/, '').trim();
            
            // Resolve bold boundaries (e.g. **Key:** Value or **Key**: Value)
            const colonIndex = cleaned.indexOf(':');
            if (colonIndex > -1 && colonIndex < 45) {
                let key = cleaned.substring(0, colonIndex).trim();
                let value = cleaned.substring(colonIndex + 1).trim();

                // If key starts with ** and value starts with ** (e.g. **Key:** **Value)
                if (key.startsWith('**') && value.startsWith('**')) {
                    key = key.replace(/^\*\*/, '');
                    value = value.replace(/^\*\*/, '');
                } else if (key.startsWith('**') && key.endsWith('**')) {
                    key = key.substring(2, key.length - 2);
                } else {
                    key = key.replace(/\*\*/g, '');
                    value = value.replace(/^\*\*/, '');
                }

                // Final cleanup of residual asterisks or colons in key
                key = key.replace(/\*\*$/, '').replace(/:$/, '').trim();
                value = value.trim();

                if (isStepIndex !== undefined) {
                    key = key.replace(/^\b\d+[\.\)]\s*/, '').replace(/^Step\s+\d+:\s*/i, '').trim();
                    return (
                        <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                                {isStepIndex + 1}
                            </span>
                            <div className="flex-1 pt-1">
                                <span className="font-bold text-blue-900 border-b border-blue-100 mr-2">
                                    {key}
                                </span>
                                <p className="mt-1 text-gray-600">{renderMarkdown(value)}</p>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="flex items-start gap-3">
                        <div className="mt-2 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                        <p className="text-gray-700">
                            <span className="font-bold text-blue-900 mr-1.5">{key}:</span>
                            {renderMarkdown(value)}
                        </p>
                    </div>
                );
            }
            
            // Standard formatting with no colon-based key
            if (isStepIndex !== undefined) {
                cleaned = cleaned.replace(/^\b\d+[\.\)]\s*/, '').replace(/^Step\s+\d+:\s*/i, '').trim();
                return (
                    <div className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                            {isStepIndex + 1}
                        </span>
                        <div className="flex-1 pt-1">
                            <p className="text-gray-700">{renderMarkdown(cleaned)}</p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex items-start gap-3">
                    <div className="mt-2 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                    <p className="text-gray-700">{renderMarkdown(cleaned)}</p>
                </div>
            );
        };

        let items: string[] = [];
        let isSteps = type === 'steps';

        if (isSteps) {
            items = getCleanSteps(text);
        } else {
            const trimmedText = text.trim();
            if (trimmedText.includes('\n')) {
                items = trimmedText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
            } else {
                items = trimmedText
                    .split(/(?<!\b[A-Z])\.\s+(?=[A-Z])|(?=[A-Z][A-Za-z\s]+:)|(?=\(\w\))|(?=•)|(?=–)|;/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.match(/^(Selection based on|Renewal conditions):$/i));
            }
        }

        if (items.length <= 1) {
            const cleanedText = text.replace(/^([-•–\*]|\d+\.)\s+/, '').trim();
            return <p className="text-gray-700 leading-relaxed">{renderMarkdown(cleanedText)}</p>;
        }

        return (
            <ul className="space-y-3 list-none">
                {items.map((item, i) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                        {renderListItem(item, isSteps ? i : undefined)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="bg-gray-50 border-b border-gray-100">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/scholarships" className="hover:text-blue-700 transition-colors">Scholarships</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 font-medium truncate">{scholarship.title}</span>
                </nav>
            </div>

            <LanguageDetector slug={scholarship.slug} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: scholarship.title,
                        description: scholarship.intro_seo,
                        image: 'https://www.indiascholarships.in/icon.png',
                        datePublished: new Date().toISOString(),
                        dateModified: new Date().toISOString(),
                        author: {
                            '@type': 'Organization',
                            name: 'IndiaScholarships'
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'IndiaScholarships',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://www.indiascholarships.in/icon.png'
                            }
                        },
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': `https://www.indiascholarships.in/scholarships/${scholarship.slug}`
                        }
                    })
                }}
            />

            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(faqSchema)
                    }}
                />
            )}

            {govServiceSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(govServiceSchema)
                    }}
                />
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2">
                        {/* Page Header / Hero Area */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-100">
                                    {scholarship.provider_type} Scholarship
                                </span>
                                {isDeadlinePassed ? (
                                    <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <Clock className="h-4 w-4" />
                                        Previous Cycle (Closed)
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                        <ShieldCheck className="h-4 w-4" />
                                        Verified for {year}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]">
                                {scholarship.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-gray-600 border-b border-gray-100 pb-8 text-sm md:text-base">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                    <span className="font-medium">{scholarship.provider}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <span className="font-medium">{scholarship.state || 'All India'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span className="font-medium">
                                        Deadline: <span className={`${isAlwaysOpen ? 'text-emerald-700 font-bold' : isDeadlinePassed ? 'text-gray-500 font-medium' : 'text-red-600 font-bold'}`}>{isAlwaysOpen ? 'Open Year-Round (Continuous)' : formatDeadlineDate(scholarship.deadline, { day: 'numeric', month: 'short', year: 'numeric' }, 'Open Now')} {isDeadlinePassed && '(Closed)'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isDeadlinePassed && (
                            <div className="mb-10 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex gap-4">
                                <Info className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-900 mb-1">Status Check</p>
                                    <p className="text-amber-800 text-sm leading-relaxed">
                                        The previous application cycle (2025–26) closed on {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. The upcoming 2026–27 cycle is expected to open soon. We will update the links here as soon as the official notification is released.
                                    </p>
                                    <a href="#similar-opportunities" className="mt-2 inline-block text-xs font-bold text-blue-700 hover:underline">
                                        👉 View active scholarships you can apply for today
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* PM-YASASVI Cross-linking Callout Box */}
                        {['pm-yashasvi-scholarship', 'pm-yasasvi-top-class-education', 'pm-yasasvi-jk-obc'].includes(slug) && (
                            <div className="mb-10 p-6 bg-blue-50 border border-blue-200 rounded-3xl flex gap-4">
                                <Info className="h-6 w-6 text-blue-700 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-blue-900 mb-1">Important: PM-YASASVI Program Variations</p>
                                    {slug === 'pm-yashasvi-scholarship' && (
                                        <div className="text-blue-800 text-sm leading-relaxed">
                                            This is the general national program. If you belong to specialized categories or regions, please see the specific branches:
                                            <span className="block mt-2">
                                                • Studying at an elite empanelled national college (like an IIT, NIT, or top-tier boarding school)? See the <Link href="/scholarships/pm-yasasvi-top-class-education" className="font-bold underline text-blue-900 hover:text-blue-700">PM-YASASVI Top Class Education Scheme</Link>.
                                            </span>
                                            <span className="block mt-1">
                                                • Resident of Jammu & Kashmir? See the <Link href="/scholarships/pm-yasasvi-jk-obc" className="font-bold underline text-blue-900 hover:text-blue-700">PM-YASASVI J&K OBC/EBC/DNT Scheme</Link>.
                                            </span>
                                        </div>
                                    )}
                                    {slug === 'pm-yasasvi-top-class-education' && (
                                        <p className="text-blue-800 text-sm leading-relaxed">
                                            This is a specialized branch for students enrolled in notified empanelled institutions of excellence. If you are not studying in a notified top-class school/college, please refer to the general <Link href="/scholarships/pm-yashasvi-scholarship" className="font-bold underline text-blue-900 hover:text-blue-700">PM-YASASVI Scholarship</Link> or the <Link href="/scholarships/pm-yasasvi-jk-obc" className="font-bold underline text-blue-900 hover:text-blue-700">J&K resident-specific scheme</Link>.
                                        </p>
                                    )}
                                    {slug === 'pm-yasasvi-jk-obc' && (
                                        <p className="text-blue-800 text-sm leading-relaxed">
                                            This is the UT-administered branch specifically for residents of Jammu & Kashmir. If you reside outside J&K, please refer to the general <Link href="/scholarships/pm-yashasvi-scholarship" className="font-bold underline text-blue-900 hover:text-blue-700">PM-YASASVI Scholarship</Link> or the <Link href="/scholarships/pm-yasasvi-top-class-education" className="font-bold underline text-blue-900 hover:text-blue-700">Top Class Education Scheme</Link>.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* About Section */}
                        {scholarship.intro_seo && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                    About the Program
                                </h2>
                                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-lg">
                                    <p className="whitespace-pre-line">{scholarship.intro_seo}</p>
                                </div>
                            </section>
                        )}

                        {/* Financial Benefits - Highlight Box */}
                        <section className="mb-12 bg-amber-50 rounded-[2.5rem] p-8 md:p-10 border border-amber-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <IndianRupee className="w-32 h-32 text-amber-900" />
                            </div>
                            <h2 className="text-2xl font-bold text-amber-900 mb-8 relative z-10 flex items-center gap-3 font-typography">
                                <Award className="w-6 h-6" />
                                Benefits & Financial Support
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1 block">Total scholarship amount</span>
                                    <div className="text-5xl font-black text-gray-900 mb-2">
                                        {formatAmount(scholarship.amount_annual, scholarship.amount_description)}
                                    </div>
                                    <p className="text-amber-800 font-medium leading-relaxed">
                                        {scholarship.amount_description && scholarship.amount_annual > 0
                                            ? scholarship.amount_description
                                                .replace(/['"]?amount_annual_inr['"]?/g, 'annual amount')
                                                .replace(/['"]?amount_min_inr['"]?/g, 'minimum stipend')
                                            : (scholarship.amount_annual > 0 ? 'Direct financial assistance for tuition and living expenses.' : '')}
                                    </p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-amber-200/50">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 italic">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        Inclusions
                                    </h3>
                                    <div className="text-gray-700 space-y-1">
                                        <FormattedText text={scholarship.benefits} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Eligibility Criteria */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-purple-600 rounded-full" />
                                Eligibility Criteria
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Educational Qualification</h3>
                                    <p className="text-gray-900 font-bold text-lg mb-2">{scholarship.level}</p>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        Must be enrolled in {scholarship.course_stream.join(', ') || 'relevant courses'}.
                                        {scholarship.min_marks ? ` Minimum ${scholarship.min_marks}% marks required in previous exam.` : ''}
                                    </p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Financial & Category</h3>
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Income Limit</span>
                                            <span className="text-gray-900 font-bold">
                                                {scholarship.income_limit ? `Up to ₹${(scholarship.income_limit / 100000).toFixed(1)} Lakh/year` : 'No Income Bar'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Applicable Category</span>
                                            <span className="text-gray-900 font-bold">{scholarship.caste.join(', ') || 'Open to All'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {scholarship.special_conditions && (
                                <div className="mt-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
                                    <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-blue-900 mb-1">Important Note</p>
                                        <p className="text-blue-800 text-sm leading-relaxed">{scholarship.special_conditions}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Selection & Renewal */}
                        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-green-50/50 rounded-[2.5rem] border border-green-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Award className="w-5 h-5 text-green-600" />
                                    Selection Process
                                </h3>
                                <div className="text-gray-700 leading-relaxed text-sm">
                                    <FormattedText text={scholarship.selection} />
                                </div>
                            </div>
                            <div className="p-8 bg-purple-50/50 rounded-[2.5rem] border border-purple-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <RefreshCcw className="w-5 h-5 text-purple-600" />
                                    Renewal Policy
                                </h3>
                                <div className="text-gray-700 leading-relaxed text-sm">
                                    <FormattedText text={scholarship.renewal} />
                                </div>
                            </div>
                        </section>

                        {/* Application Step-by-Step */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-emerald-600 rounded-full" />
                                Application Process
                            </h2>
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                                <FormattedText text={scholarship.step_guide} type="steps" />
                            </div>
                        </section>

                        {/* Required Documents */}
                        <section className="mb-12 bg-gray-50 rounded-[2.5rem] p-8 md:p-10 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                Documents Required
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {scholarship.docs_needed.map((doc: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-200/50 last:border-0 hover:border-gray-300 transition-colors">
                                        <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                                        <span className="text-gray-700 font-medium text-sm">{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Important Dates (Detailed) */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-red-600 rounded-full" />
                                Important Dates
                            </h2>
                            <div className="bg-red-50/30 rounded-[2.5rem] p-8 border border-red-100">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <Calendar className="h-6 w-6 text-red-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Application Deadline</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {isAlwaysOpen ? 'Open Year-Round (Continuous Enrollment)' : formatDeadlineDate(scholarship.deadline, { day: 'numeric', month: 'long', year: 'numeric' }, 'Continuous Enrollment / Check Official Portal')}
                                            </p>
                                            {scholarship.deadline_description && <p className="text-sm text-gray-600 mt-1 italic">{scholarship.deadline_description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 pt-4 border-t border-red-100/50">
                                        <Clock className="h-6 w-6 text-gray-400 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                            Dates are subject to change as per the provider's official notification. Applicants are encouraged to apply well before the closing date.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Facts Grid */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                Scholarship Quick Facts
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Provider Type</span>
                                    <span className="text-gray-900 font-bold">{scholarship.provider_type}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Education Level</span>
                                    <span className="text-gray-900 font-bold">{scholarship.level}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Application Mode</span>
                                    <span className="text-gray-900 font-bold uppercase">{scholarship.application_mode}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">State/Region</span>
                                    <span className="text-gray-900 font-bold">{scholarship.state || 'All India'}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Income Limit</span>
                                    <span className="text-gray-900 font-bold">{scholarship.income_limit ? `₹${(scholarship.income_limit / 100000).toFixed(1)}L/yr` : 'No Limit'}</span>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Last Verified</span>
                                    <span className="text-gray-900 font-bold">{scholarship.verification_year || '2026'}</span>
                                </div>
                            </div>
                        </section>

                        {/* FAQs */}
                        {scholarship.faq_json && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-8 bg-purple-600 rounded-full" />
                                    Common Questions (FAQs)
                                </h2>
                                <div className="space-y-4">
                                    {(() => {
                                        try {
                                            let faqs = scholarship.faq_json;

                                            // Handle case where it might be a stringified JSON in some imports
                                            if (typeof faqs === 'string') {
                                                try { faqs = JSON.parse(faqs); } catch (e) { }
                                            }

                                            if (!faqs || (Array.isArray(faqs) && faqs.length === 0)) return (
                                                <p className="p-6 bg-gray-50 rounded-2xl text-gray-400 italic">Detailed FAQs are being compiled for this scheme.</p>
                                            );

                                            return Array.isArray(faqs) ? faqs.map((faq: any, i: number) => (
                                                <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-blue-200 transition-colors">
                                                    <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight flex gap-3">
                                                        <span className="text-blue-600 font-black">Q.</span>
                                                        {faq.question || faq.q || 'Common Question'}
                                                    </h3>
                                                    <p className="text-gray-600 leading-relaxed pl-8">{faq.answer || faq.a || 'Refer to the official portal for details.'}</p>
                                                </div>
                                            )) : (
                                                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                                    <p className="text-gray-600 leading-relaxed">{String(faqs)}</p>
                                                </div>
                                            );
                                        } catch (e) { return null; }
                                    })()}
                                </div>
                            </section>
                        )}

                        {/* Help & Contact Support */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                Help & Contact Support
                            </h2>
                            <div className="bg-blue-50/30 rounded-[2.5rem] p-8 md:p-10 border border-blue-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-4">Official Support</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Globe className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Website</span>
                                                    <a href={scholarship.official_source} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold text-sm truncate block hover:underline">
                                                        Visit Official Portal
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Helpline</span>
                                                    <span className="text-gray-900 font-bold text-sm">{scholarship.helpline || 'Refer Official Site'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-blue-100/50">
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-blue-600" />
                                            Need Application Help?
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                            If you have trouble applying, you can check your eligibility or browse our step-by-step application guides.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Link
                                                href="/guides"
                                                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors text-center shadow-sm font-bold"
                                            >
                                                Browse Application Guides
                                            </Link>
                                            <Link
                                                href={`/eligibility-checker?level=${encodeURIComponent(scholarship.level || '')}&state=${encodeURIComponent(scholarship.state || '')}&caste=${encodeURIComponent(scholarship.caste?.join(',') || '')}&income=${scholarship.income_limit || ''}`}
                                                className="flex-1 px-4 py-3 bg-white text-blue-700 border border-blue-200 font-bold text-xs rounded-xl hover:bg-blue-50 transition-colors text-center shadow-sm font-bold"
                                            >
                                                Check Your Eligibility
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Disclaimer */}
                        <section className="mt-12 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="h-5 w-5 text-gray-400" />
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Legal Disclaimer</h2>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed italic">
                                IndiaScholarships.in attempts to provide accurate information manually curated from official sources.
                                However, scholarship details, timelines, and eligibility can change without notice as per the provider's discretion.
                                Applying for a scholarship does not guarantee selection. Always verify all information on the official {scholarship.provider} website before final submission.
                            </p>
                        </section>

                        {/* Related Scholarships (3-Column Grid) */}
                        {relatedScholarships.length > 0 && (
                            <section id="similar-opportunities" className="mt-12 pt-8 border-t border-gray-150 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <Award className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-bold text-gray-900">Similar Opportunities You Can Apply For Today</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {relatedScholarships.map((rel: any) => (
                                        <Link 
                                            key={rel.id} 
                                            href={`/scholarships/${rel.slug}`} 
                                            className="flex flex-col p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-lg transition-all group h-full justify-between"
                                        >
                                            <div>
                                                <div className="w-12 h-12 bg-blue-50/50 rounded-2xl flex items-center justify-center border border-blue-50 mb-4 group-hover:bg-blue-50 transition-colors">
                                                    <Award className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug mb-2">
                                                    {rel.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-50">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                                                    {rel.amount_annual && rel.amount_annual > 0 
                                                        ? `Up to ₹${(rel.amount_annual / 1000).toFixed(0)}k` 
                                                        : (rel.amount_min && rel.amount_min > 0 
                                                            ? `Min. ₹${(rel.amount_min / 1000).toFixed(0)}k` 
                                                            : 'Amount Varies')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">

                            {/* CTA Card */}
                            {isDeadlinePassed ? (
                                <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-100 border-b-8 border-slate-950 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Users className="w-24 h-24" />
                                    </div>
                                    <h3 className="text-xl font-extrabold mb-4 relative z-10">Applications Closed</h3>
                                    <p className="text-slate-300 text-sm mb-6 leading-relaxed relative z-10">
                                        The application window has closed. You can still visit the official portal to check results, merit lists, or selection status.
                                    </p>
                                    {cleanApplyUrl ? (
                                        <a
                                            href={cleanApplyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-4 bg-slate-700 text-white text-center font-black rounded-2xl hover:bg-slate-600 transition-all shadow-lg active:scale-95 relative z-10 mb-6"
                                        >
                                            Visit Official Portal (Check Results)
                                        </a>
                                    ) : (
                                        <div className="block w-full py-4 bg-slate-700 text-slate-400 text-center font-black rounded-2xl cursor-not-allowed text-sm relative z-10 mb-6">
                                            Official Link Not Available
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verified Secure Source
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 border-b-8 border-blue-900 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Users className="w-24 h-24" />
                                    </div>
                                    <h3 className="text-xl font-extrabold mb-4 relative z-10">Ready to Apply?</h3>
                                    <p className="text-blue-100 text-sm mb-8 leading-relaxed relative z-10">
                                        Submit your application through the official portal. Ensure all documents are scanned and ready for upload.
                                    </p>
                                    {cleanApplyUrl ? (
                                        <a
                                            href={cleanApplyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-4 bg-white text-blue-700 text-center font-black rounded-2xl hover:bg-blue-50 transition-all shadow-lg active:scale-95 relative z-10 mb-6"
                                        >
                                            Visit Official Portal
                                        </a>
                                    ) : (
                                        <div className="block w-full py-4 bg-blue-800 text-blue-200 text-center font-black rounded-2xl cursor-not-allowed text-sm relative z-10 mb-6">
                                            Official Link Not Available
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-300">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verified Secure Source
                                    </div>
                                </div>
                            )}

                            <ShareButtons
                                title={scholarship.title}
                                url={`https://www.indiascholarships.in/scholarships/${scholarship.slug}`}
                            />

                            {/* Telegram Alert Box */}
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[2rem] relative overflow-hidden shadow-sm">
                                <div className="absolute right-0 top-0 -mr-8 -mt-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100">
                                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.47-1.08 6.16-.13.72-.4 1.15-.65 1.17-.56.05-1.03-.45-1.52-.77-.77-.5-1.21-.81-1.95-1.3-.86-.56-.3-.87.19-1.38.13-.13 2.33-2.14 2.37-2.33.01-.02.01-.11-.04-.16-.05-.05-.12-.03-.18-.02-.07.01-1.25.79-3.53 2.33-.33.23-.64.34-.91.33-.3-.01-.88-.17-1.31-.31-.53-.17-.95-.26-.91-.56.02-.15.22-.31.62-.48 2.43-1.06 4.05-1.76 4.86-2.1 2.31-.97 2.79-1.14 3.1-.14.07.03.22.18.23.28.01.12.01.25 0 .39z"/>
                                        </svg>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-gray-900 leading-tight">Instant Telegram Alerts</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Deadlines change quickly. Join our Telegram channel to receive instant alerts when this scholarship opens or updates.
                                        </p>
                                        <a 
                                            href="https://t.me/IndiaScholarships1"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors pt-1"
                                        >
                                            Join Channel
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Supporting Guides Quick Links Card */}
                            <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8">

                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-150 pb-4">Supporting Guides</h3>
                                <nav className="space-y-2">
                                    <Link href={`/scholarships/${scholarship.slug}/eligibility`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                        <span>Eligibility Criteria</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/income-limit`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                        <span>Income Limit</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/documents-required`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                        <span>Documents Required</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/last-date`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                        <span>Last Date & Timelines</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/selection-process`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                        <span>Selection Process</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/apply-online`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                        <span>How to Apply Online</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                    <Link href={`/scholarships/${scholarship.slug}/renewal-process`} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100/50 text-gray-700 hover:text-blue-700 font-bold text-sm shadow-sm transition-all hover:border-blue-100">
                                        <span>Renewal Process</span>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                </nav>
                            </div>

                            {/* Verification Stats Card (At a Glance) */}
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">At a Glance</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${isDeadlinePassed ? 'bg-slate-100' : 'bg-emerald-50'}`}>
                                            {isDeadlinePassed ? (
                                                <Clock className="h-6 w-6 text-slate-500" />
                                            ) : (
                                                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</span>
                                            <span className={`font-bold text-sm ${isDeadlinePassed ? 'text-slate-600' : 'text-emerald-700'}`}>
                                                {isDeadlinePassed ? 'Closed (Expired)' : `Active - ${scholarship.verification_year || new Date().getFullYear()}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 rounded-2xl">
                                            <Clock className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Last Verified</span>
                                            <span className="font-bold text-gray-900 text-sm">{scholarship.last_verified ? new Date(scholarship.last_verified).toLocaleDateString('en-IN') : 'Recently'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 rounded-2xl">
                                            <Info className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Apply Mode</span>
                                            <span className="font-bold text-gray-900 text-sm uppercase">{scholarship.application_mode}</span>
                                        </div>
                                    </div>
                                    {scholarship.total_awards > 0 && (
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-50 rounded-2xl">
                                                <Award className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Awards</span>
                                                <span className="font-bold text-gray-900 text-sm">{scholarship.total_awards.toLocaleString('en-IN')} Students</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Official Help</h4>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <span className="block text-[10px] text-gray-400 uppercase font-black mb-1">Helpline</span>
                                        <span className="text-xs font-bold text-gray-900 break-words">{scholarship.helpline || 'Refer Official Site'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Related Discovery Links (Dynamic) */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-4">Discover More</h3>
                                <div className="flex flex-col gap-2">
                                    <Link href={`/scholarships-level/${getCanonicalSlugForLevel(scholarship.level)}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        For {Array.isArray(scholarship.level) ? scholarship.level[0] : (String(scholarship.level || '').split(',')[0] || 'Students')}
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={`/scholarships-in/${scholarship.state ? slugify(scholarship.state) : 'all-india'}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        In {scholarship.state || 'All India'}
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={`/scholarships-for/${getCanonicalSlugForCategory(scholarship.caste[0])}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        For {scholarship.caste[0] || 'All Categories'}
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={`/scholarships-income/${getCanonicalSlugForIncome(scholarship.income_limit)}`} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        Income Coverage
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href={getScholarshipTypeRoute(scholarship.scholarship_type)} className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group text-sm">
                                        {scholarship.scholarship_type} Listings
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
