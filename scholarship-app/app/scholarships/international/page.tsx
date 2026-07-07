import Link from 'next/link';
import { Metadata } from 'next';
import { getInternationalScholarships } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import {
    Globe,
    Calendar,
    Clock,
    ExternalLink,
    ArrowRight,
    ChevronRight,
    Award,
    MapPin,
    IndianRupee,
    ShieldCheck,
    Info,
    Zap,
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'International Scholarships for Indian Students 2026-27 — Tracker & Guide | IndiaScholarships',
    description: 'Track which international scholarships are open now for Indian students in 2026-27. Live status, deadlines, and eligibility for Fulbright-Nehru, Chevening, DAAD, MEXT, Erasmus Mundus, Rhodes, Gates Cambridge, Inlaks & more.',
    openGraph: {
        title: 'International Scholarships for Indian Students 2026-27 — Live Tracker',
        description: 'See which fully funded international scholarships are open right now for Indian students. Verified deadlines, eligibility, and application guides.',
        url: 'https://www.indiascholarships.in/scholarships/international',
    },
};

// Country flag emojis for display
const COUNTRY_FLAGS: Record<string, string> = {
    'United Kingdom': '🇬🇧',
    'United States': '🇺🇸',
    'Japan': '🇯🇵',
    'Germany': '🇩🇪',
    'European Union (Multiple Countries)': '🇪🇺',
    'United States, United Kingdom, Europe': '🌍',
    'Any Country': '🌐',
};

// Country short labels for badges
const COUNTRY_SHORT: Record<string, string> = {
    'United Kingdom': 'UK',
    'United States': 'USA',
    'Japan': 'Japan',
    'Germany': 'Germany',
    'European Union (Multiple Countries)': 'Europe (EU)',
    'United States, United Kingdom, Europe': 'USA / UK / EU',
    'Any Country': 'Worldwide',
};

function getStatusInfo(deadline: string | null): {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
    daysLeft: number | null;
    isOpenSoon: boolean;
} {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!deadline || deadline === 'Not specified' || deadline === 'NA') {
        return {
            label: 'Check Portal',
            color: 'text-gray-600',
            bgColor: 'bg-gray-55',
            borderColor: 'border-gray-200',
            dotColor: 'bg-gray-400',
            daysLeft: null,
            isOpenSoon: false,
        };
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
        return {
            label: 'Check Portal',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            dotColor: 'bg-gray-400',
            daysLeft: null,
            isOpenSoon: false,
        };
    }

    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
        // Past deadline
        return {
            label: 'Closed',
            color: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            dotColor: 'bg-red-500',
            daysLeft,
            isOpenSoon: false,
        };
    } else if (daysLeft === 0) {
        return {
            label: 'Closes Today',
            color: 'text-orange-700',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            dotColor: 'bg-orange-500',
            daysLeft: 0,
            isOpenSoon: false,
        };
    } else if (daysLeft <= 14) {
        return {
            label: `Closing Soon — ${daysLeft}d left`,
            color: 'text-orange-700',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            dotColor: 'bg-orange-500',
            daysLeft,
            isOpenSoon: false,
        };
    } else if (daysLeft <= 90) {
        return {
            label: `Open — ${daysLeft} days left`,
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            dotColor: 'bg-emerald-500',
            daysLeft,
            isOpenSoon: false,
        };
    } else {
        return {
            label: `Open — ${daysLeft} days left`,
            color: 'text-blue-700',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            dotColor: 'bg-blue-500',
            daysLeft,
            isOpenSoon: false,
        };
    }
}

function formatAmount(amount: number | null, description: string | null, countryOfStudy: string): string {
    if (!amount) return description ? description.split('.')[0] : 'Fully Funded';
    // Format in lakhs for Indian context
    const inLakhs = amount / 100000;
    if (inLakhs >= 10) {
        return `Up to ₹${(inLakhs / 10).toFixed(0)} Cr/course`;
    }
    return `Up to ₹${inLakhs.toFixed(0)}L/year`;
}

function formatDeadlineDisplay(deadline: string | null): string {
    if (!deadline || deadline === 'Not specified' || deadline === 'NA') return 'TBA';
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return deadline;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function InternationalScholarshipsPage() {
    const scholarships = await getInternationalScholarships();

    // Compute status for each
    const enriched = scholarships.map((s: any) => ({
        ...s,
        statusInfo: getStatusInfo(s.deadline),
        flag: COUNTRY_FLAGS[s.country_of_study] || '🌍',
        countryShort: COUNTRY_SHORT[s.country_of_study] || s.country_of_study,
        amountDisplay: formatAmount(s.amount_annual, s.amount_description, s.country_of_study),
        deadlineDisplay: formatDeadlineDisplay(s.deadline),
    }));

    const openNow = enriched.filter((s: any) => s.statusInfo.daysLeft !== null && s.statusInfo.daysLeft >= 0);
    const closedOrTBA = enriched.filter((s: any) => s.statusInfo.daysLeft === null || s.statusInfo.daysLeft < 0);

    const year = new Date().getFullYear();

    // JSON-LD FAQ Schema
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Which international scholarships are open for Indian students right now?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: openNow.length > 0
                        ? `Currently open: ${openNow.map((s: any) => s.title).join(', ')}. Check individual pages for exact deadlines.`
                        : 'Most major international scholarships open between August and November each year. Check back soon for the next cycle.',
                },
            },
            {
                '@type': 'Question',
                name: 'What is the best fully funded scholarship for Indian students abroad?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The best fully funded scholarships for Indian students include Fulbright-Nehru (USA), Chevening (UK), DAAD (Germany), MEXT (Japan), Erasmus Mundus (EU), Gates Cambridge (UK), and Rhodes Scholarship (Oxford). Each targets different academic levels and subject areas.',
                },
            },
            {
                '@type': 'Question',
                name: 'Which international scholarship has the lowest competition for Indian students?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The Inlaks Shivdasani Scholarship (SEO difficulty: low), MEXT Japan (less saturated than UK/US options), and Erasmus Mundus (200+ individual programmes, many with less competition) tend to have lower effective competition from Indian applicants compared to Chevening or Rhodes.',
                },
            },
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <main>
                {/* ── Hero ── */}
                <section className="bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-700 py-16 md:py-24 text-white relative overflow-hidden">
                    {/* Subtle decorative globe pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-end pr-8">
                        <Globe className="h-[400px] w-[400px] text-white" />
                    </div>

                    <div className="container mx-auto px-4 max-w-5xl relative z-10">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6" aria-label="Breadcrumb">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <Link href="/scholarships" className="hover:text-white transition-colors">Scholarships</Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="text-white font-medium">International</span>
                        </nav>

                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-100">
                                <Zap className="h-3.5 w-3.5" />
                                Live Status Tracker
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
                            International Scholarships
                            <span className="block text-blue-200 mt-1">for Indian Students {year}–{(year + 1).toString().slice(2)}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed">
                            Verified deadlines and live open/closed status for the top fully funded study-abroad scholarships — updated as each cycle opens.
                        </p>

                        {/* Stats bar */}
                        <div className="grid grid-cols-3 gap-4 max-w-lg">
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center">
                                <span className="text-3xl font-extrabold block">{enriched.length}</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Scholarships</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center">
                                <span className="text-3xl font-extrabold block text-emerald-300">{openNow.length}</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Open Now</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center">
                                <span className="text-3xl font-extrabold block">5+</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Countries</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Important Notice ── */}
                <section className="bg-amber-50 border-b border-amber-200">
                    <div className="container mx-auto px-4 max-w-5xl py-4">
                        <div className="flex items-start gap-3 text-sm text-amber-800">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                            <p>
                                <strong>About RPM & these scholarships:</strong> These are study-abroad scholarships for Indian students going overseas. RPM on these pages is driven by your readers' location (India), not the scholarship country — so we connect these pages to high-CPC adjacent content like education loans, IELTS prep, and forex guidance.
                                {' '}<Link href="/scholarships" className="underline font-medium hover:text-amber-900">Browse all domestic scholarships →</Link>
                            </p>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 max-w-5xl py-12 md:py-16">

                    {/* ── Open Now Section ── */}
                    {openNow.length > 0 && (
                        <section className="mb-14">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <h2 className="text-2xl font-extrabold text-gray-900">Open Now</h2>
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">{openNow.length} active</span>
                            </div>

                            <div className="grid gap-5">
                                {openNow.map((s: any) => (
                                    <ScholarshipCard key={s.id} scholarship={s} highlighted />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── All Scholarships ── */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                {openNow.length > 0 ? 'Upcoming & Closed Cycles' : 'All International Scholarships'}
                            </h2>
                        </div>

                        <div className="grid gap-5">
                            {closedOrTBA.map((s: any) => (
                                <ScholarshipCard key={s.id} scholarship={s} highlighted={false} />
                            ))}
                        </div>
                    </section>

                    {/* ── Context / Strategy Note ── */}
                    <section className="mt-16 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-8 md:p-10">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-100 rounded-2xl flex-shrink-0">
                                <ShieldCheck className="h-6 w-6 text-indigo-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">How to use this tracker</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We verify deadlines directly from official embassy and trust websites. Status badges update as each cycle opens. Most major international scholarships run on annual cycles — the busiest application window is <strong>August to November</strong> each year.
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        <span><strong>Open</strong> — applications are currently being accepted at the official portal</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="inline-block h-2 w-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                                        <span><strong>Closing Soon</strong> — deadline within 14 days; apply immediately</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="inline-block h-2 w-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                        <span><strong>Closed</strong> — this cycle has ended; deadline shown is for next year's cycle</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* ── Bridge to domestic ── */}
                    <section className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-gray-900 mb-1">Also planning to study within India?</p>
                            <p className="text-sm text-gray-500">We've verified 250+ domestic scholarships across all states, castes, and education levels.</p>
                        </div>
                        <Link
                            href="/scholarships"
                            className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors"
                        >
                            Browse Domestic Scholarships
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </section>

                    {/* ── FAQ Section ── */}
                    <section className="mt-16">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-5">
                            {[
                                {
                                    q: 'Which international scholarships are currently open for Indian students?',
                                    a: openNow.length > 0
                                        ? `Currently open: ${openNow.map((s: any) => s.title).join(', ')}. See the "Open Now" section above for exact deadlines.`
                                        : `Most major scholarships (Chevening, Gates Cambridge, Erasmus Mundus) open applications in August–October each year. Check back soon as the new cycle begins.`,
                                },
                                {
                                    q: 'Can Indian students with engineering or CS background apply for all these scholarships?',
                                    a: 'Most scholarships are open to all disciplines. The key exception is the Inlaks Shivdasani Scholarship, which explicitly excludes Engineering, CS, MBA, and Medicine. All other scholarships listed here — Fulbright-Nehru, Chevening, MEXT, DAAD, Erasmus Mundus, Gates Cambridge, and Rhodes — are open to engineers and tech graduates.',
                                },
                                {
                                    q: 'What is the easiest international scholarship to get for Indian students?',
                                    a: 'No fully funded international scholarship is "easy" — all are highly competitive. However, MEXT (Japan) and Erasmus Mundus are relatively less saturated for Indian applicants compared to Chevening or Fulbright-Nehru. Erasmus Mundus has 200+ individual programmes, many of which have lower Indian applicant volumes.',
                                },
                                {
                                    q: 'Do these international scholarships need IELTS or TOEFL?',
                                    a: 'Most do. Chevening, Commonwealth, Gates Cambridge, Rhodes, and Inlaks all require IELTS 6.5+ or equivalent. MEXT (Japan) does not require Japanese language at application time. Some Erasmus Mundus programmes waive IELTS if your undergraduate medium of instruction was English.',
                                },
                            ].map((faq, i) => (
                                <div key={i} className="border border-gray-100 rounded-2xl p-6 bg-gray-50">
                                    <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// ── Scholarship Card Component ──────────────────────────────────────
function ScholarshipCard({ scholarship: s, highlighted }: { scholarship: any; highlighted: boolean }) {
    const si = s.statusInfo;

    return (
        <Link
            href={`/scholarships/${s.slug}`}
            className={`group block rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                highlighted
                    ? 'bg-white border-emerald-200 shadow-sm hover:border-emerald-300'
                    : 'bg-white border-gray-100 hover:border-blue-200'
            }`}
        >
            <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                        {/* Status + Country badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {/* Live status badge */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${si.bgColor} ${si.color} ${si.borderColor}`}>
                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${si.dotColor} ${highlighted && si.daysLeft !== null && si.daysLeft >= 0 && si.daysLeft <= 90 ? 'animate-pulse' : ''}`} />
                                {si.label}
                            </span>
                            {/* Country badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200">
                                <span>{s.flag}</span>
                                {s.countryShort}
                            </span>
                            {/* Level badge */}
                            {s.level && (
                                <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                                    {s.level}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base md:text-lg font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug mb-1.5">
                            {s.title}
                        </h3>

                        {/* Provider */}
                        {s.provider && (
                            <p className="text-xs text-gray-500 mb-3 font-medium">{s.provider}</p>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span>
                                    {si.daysLeft !== null && si.daysLeft < 0
                                        ? <span className="text-gray-400">Next cycle: {s.deadlineDisplay}</span>
                                        : <span>Deadline: <strong className="text-gray-700">{s.deadlineDisplay}</strong></span>
                                    }
                                </span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-semibold text-gray-700">{s.amountDisplay}</span>
                            </span>
                        </div>
                    </div>

                    {/* Right: arrow */}
                    <div className="flex-shrink-0 flex items-center self-center">
                        <div className={`p-2.5 rounded-xl transition-colors ${
                            highlighted
                                ? 'bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600'
                                : 'bg-gray-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600'
                        }`}>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Deadline description strip (shown for open scholarships) */}
                {si.daysLeft !== null && si.daysLeft >= 0 && s.deadline_description && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{s.deadline_description}</p>
                    </div>
                )}
            </div>
        </Link>
    );
}
