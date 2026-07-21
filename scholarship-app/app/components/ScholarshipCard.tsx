import Link from 'next/link';
import { CheckCircle2, Calendar, Laptop, Users, IndianRupee, Clock } from 'lucide-react';

interface Scholarship {
    id: number;
    slug: string;
    title: string;
    provider: string;
    state: string;
    caste: string[];
    amount_annual: number;
    amount_min?: number;
    deadline?: string;
    application_mode: string;
    level: string;
    last_verified: string;
    income_limit?: number;
    created_at?: string;
    thumbnail_url?: string;
}

interface ScholarshipCardProps {
    scholarship: Scholarship;
    viewMode?: 'grid' | 'list';
}

export default function ScholarshipCard({ scholarship, viewMode = 'grid' }: ScholarshipCardProps) {
    // Calculate status badges
    const getStatusBadge = () => {
        if (!scholarship.deadline) return null;

        const deadlineDate = !isNaN(new Date(scholarship.deadline).getTime())
            ? new Date(scholarship.deadline)
            : null;
        if (!deadlineDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Closed
        if (deadlineDate < today) {
            return { text: 'Closed', color: 'text-gray-500 bg-gray-50 border-gray-200' };
        }

        const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Closing Soon
        if (daysUntilDeadline <= 7) {
            return { text: 'Closing Soon', color: 'text-google-red bg-red-50/50 border-red-100' };
        }

        // New
        if (scholarship.created_at) {
            const createdDate = new Date(scholarship.created_at);
            const daysSinceCreated = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceCreated <= 14) {
                return { text: 'New Opportunity', color: 'text-google-blue bg-blue-50/50 border-blue-100' };
            }
        }

        return null;
    };

    const statusBadge = getStatusBadge();

    // Format deadline
    const formatDeadline = (deadline?: string) => {
        if (!deadline) return 'Check Portal';
        const trimmed = deadline.trim();

        if (trimmed === '' || trimmed.toLowerCase() === 'not specified' || trimmed.toLowerCase() === 'na') {
            return 'Check Portal';
        }

        const researchNotePattern = /VERIFY|tentative|some sources|verify on/i;
        if (researchNotePattern.test(trimmed)) {
            return 'Check Portal';
        }

        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }

        return trimmed;
    };

    // Format amount
    const formatAmount = () => {
        if (!scholarship.amount_annual) {
            return 'Amount Varies';
        }
        if (scholarship.amount_min && scholarship.amount_annual && scholarship.amount_min !== scholarship.amount_annual) {
            return `₹${scholarship.amount_min.toLocaleString('en-IN')} - ₹${scholarship.amount_annual.toLocaleString('en-IN')}`;
        }
        return `₹${scholarship.amount_annual.toLocaleString('en-IN')}`;
    };

    // Quick eligibility hints
    const getEligibilityHints = () => {
        const hints = [];
        if (scholarship.income_limit) {
            hints.push(`Income < ₹${(scholarship.income_limit / 100000).toFixed(1)}L`);
        }
        if (scholarship.caste && scholarship.caste.length > 0) {
            hints.push(scholarship.caste.join(', '));
        }
        if (scholarship.state) {
            hints.push(scholarship.state);
        }
        return hints.slice(0, 3);
    };

    const eligibilityHints = getEligibilityHints();

    // Provider circular badge generator
    const getProviderBadge = () => {
        const firstLetter = scholarship.provider ? scholarship.provider.charAt(0).toUpperCase() : 'S';
        const colors = [
            'bg-blue-50 text-google-blue border-blue-100',
            'bg-green-50 text-google-green border-green-100',
            'bg-red-50 text-google-red border-red-100',
            'bg-yellow-50 text-google-yellow border-yellow-100'
        ];
        const index = firstLetter.charCodeAt(0) % colors.length;
        const colorClass = colors[index];

        if (scholarship.thumbnail_url) {
            return (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border-gray shrink-0 bg-white flex items-center justify-center">
                    <img
                        src={scholarship.thumbnail_url}
                        alt={scholarship.provider}
                        className="object-contain w-full h-full p-1"
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            );
        }

        return (
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-lg shrink-0 ${colorClass}`}>
                {firstLetter}
            </div>
        );
    };

    if (viewMode === 'list') {
        return (
            <Link
                href={`/scholarships/${scholarship.slug}`}
                className="block border border-border-gray rounded-3xl p-6 md:p-8 hover:border-google-blue hover:shadow-lg transition-all bg-white group"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Left & Middle Column */}
                    <div className="flex items-start gap-4 flex-1">
                        {getProviderBadge()}

                        <div className="space-y-1">
                            {/* Verification & Urgency Row */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="flex items-center gap-1 text-google-green font-semibold">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-google-green" />
                                    Verified
                                </span>
                                {statusBadge && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${statusBadge.color}`}>
                                            {statusBadge.text}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-google-blue transition-colors leading-snug">
                                {scholarship.title}
                            </h3>

                            {/* Provider */}
                            <p className="text-xs text-gray-500 font-medium">
                                {scholarship.provider}
                            </p>

                            {/* Eligibility Summary */}
                            {eligibilityHints.length > 0 && (
                                <p className="text-xs text-gray-500 font-medium">
                                    <span className="text-gray-400">Eligibility:</span> {eligibilityHints.join(' • ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Reward and CTA (Desktop aligned right, Mobile stacked) */}
                    <div className="flex md:flex-col items-between md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 gap-3 shrink-0">
                        <div className="text-left md:text-right">
                            <span className="text-xs text-gray-400 block font-medium">Reward Value</span>
                            <span className="text-lg md:text-xl font-black text-google-blue">
                                {formatAmount()}
                            </span>
                        </div>

                        <button className="h-[48px] px-6 bg-google-blue hover:bg-blue-600 text-white rounded-full text-sm font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors w-auto">
                            View Details
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid view (default)
    return (
        <Link
            href={`/scholarships/${scholarship.slug}`}
            className="group bg-white border border-border-gray rounded-3xl overflow-hidden hover:shadow-lg hover:border-google-blue transition-all flex flex-col p-6 h-full min-h-[340px]"
        >
            {/* Top row: Urgency and verification */}
            <div className="flex justify-between items-center mb-4">
                <span className="flex items-center gap-1 text-xs text-google-green font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-google-green" />
                    Verified
                </span>
                {statusBadge && (
                    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${statusBadge.color}`}>
                        {statusBadge.text}
                    </span>
                )}
            </div>

            {/* Provider Circle & Brand Details */}
            <div className="flex items-center gap-3 mb-4">
                {getProviderBadge()}
                <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 font-semibold truncate">
                        {scholarship.provider}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                        {scholarship.state}
                    </p>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-gray-900 group-hover:text-google-blue transition-colors line-clamp-2 leading-tight mb-4 flex-1">
                {scholarship.title}
            </h3>

            {/* Key Spec: Price Tag (Award amount) */}
            <div className="mb-4">
                <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Reward</span>
                <span className="text-lg font-black text-google-blue block mt-0.5">
                    {formatAmount()}
                </span>
            </div>

            {/* Micro spec items */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-5 border-t border-border-gray pt-3">
                <span className="flex items-center gap-1 truncate font-medium">
                    <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    {formatDeadline(scholarship.deadline)}
                </span>
                <span className="flex items-center gap-1 truncate font-medium">
                    <Laptop className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    {scholarship.application_mode}
                </span>
            </div>

            {/* CTA Button */}
            <button className="w-full h-[48px] bg-google-blue hover:bg-blue-600 text-white rounded-full text-sm font-bold flex items-center justify-center cursor-pointer transition-colors mt-auto">
                View Details
            </button>
        </Link>
    );
}
