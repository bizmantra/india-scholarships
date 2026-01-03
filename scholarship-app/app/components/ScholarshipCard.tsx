import Link from 'next/link';
import { CheckCircle2, Calendar, Laptop, Users, IndianRupee } from 'lucide-react';

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
}

interface ScholarshipCardProps {
    scholarship: Scholarship;
    viewMode?: 'grid' | 'list';
}

export default function ScholarshipCard({ scholarship, viewMode = 'grid' }: ScholarshipCardProps) {
    // Calculate status badges
    const getStatusBadge = () => {
        if (!scholarship.deadline) return null;

        const deadlineDate = new Date(scholarship.deadline);
        const today = new Date();
        const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Closing Soon - within 7 days
        if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
            return { text: 'Closing Soon', color: 'bg-red-50 text-red-700 border-red-200' };
        }

        // New - created within last 14 days (using created_at field)
        if (scholarship.created_at) {
            const createdDate = new Date(scholarship.created_at);
            const daysSinceCreated = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceCreated <= 14) {
                return { text: 'New', color: 'bg-blue-50 text-blue-700 border-blue-200' };
            }
        }

        return null;
    };

    const statusBadge = getStatusBadge();

    // Format deadline
    const formatDeadline = (deadline?: string) => {
        if (!deadline) return 'Check Portal';
        return new Date(deadline).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format amount
    const formatAmount = () => {
        if (!scholarship.amount_annual) {
            return 'Amount varies';
        }
        if (scholarship.amount_min && scholarship.amount_annual) {
            return `₹${scholarship.amount_min.toLocaleString('en-IN')} - ₹${scholarship.amount_annual.toLocaleString('en-IN')}`;
        }
        return `₹${scholarship.amount_annual.toLocaleString('en-IN')}`;
    };

    // Quick eligibility hints (top 3 criteria)
    const getEligibilityHints = () => {
        const hints = [];

        if (scholarship.income_limit) {
            hints.push(`Income < ₹${(scholarship.income_limit / 100000).toFixed(1)}L`);
        }
        if (scholarship.caste.length > 0) {
            hints.push(scholarship.caste.join(', '));
        }
        if (scholarship.state) {
            hints.push(scholarship.state);
        }

        return hints.slice(0, 3);
    };

    const eligibilityHints = getEligibilityHints();

    if (viewMode === 'list') {
        return (
            <Link
                href={`/scholarships/${scholarship.slug}`}
                className="block border border-gray-100 rounded-3xl p-8 hover:border-blue-700 hover:shadow-2xl hover:-translate-y-1 transition-all bg-white group"
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        {/* Status Badge & Verified */}
                        <div className="flex items-center gap-2 mb-3">
                            {statusBadge && (
                                <span className={`text-xs px-2 py-1 rounded-md font-semibold border ${statusBadge.color}`}>
                                    {statusBadge.text}
                                </span>
                            )}
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-gray-600">Verified</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors mb-2 font-serif tracking-tight">
                            {scholarship.title}
                        </h3>

                        {/* Provider */}
                        <p className="text-sm text-gray-600 mb-4">
                            {scholarship.provider}
                        </p>

                        {/* Info Pills */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-1.5 text-sm">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                    <IndianRupee className="h-4 w-4 text-green-700" />
                                </div>
                                <span className="font-semibold text-gray-900">{formatAmount()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-orange-700" />
                                </div>
                                <span className="text-gray-700">{formatDeadline(scholarship.deadline)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Laptop className="h-4 w-4 text-blue-700" />
                                </div>
                                <span className="text-gray-700">{scholarship.application_mode}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Users className="h-4 w-4 text-purple-700" />
                                </div>
                                <span className="text-gray-700">{scholarship.level}</span>
                            </div>
                        </div>

                        {/* Quick Eligibility */}
                        {eligibilityHints.length > 0 && (
                            <div className="text-sm">
                                <span className="text-gray-600 font-medium">Quick Eligibility: </span>
                                <span className="text-gray-700">{eligibilityHints.join(' • ')}</span>
                            </div>
                        )}
                    </div>

                    {/* View Details Button */}
                    <button className="px-8 py-3 bg-blue-700 text-white rounded-full text-sm font-black hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-200 whitespace-nowrap">
                        View Details →
                    </button>
                </div>
            </Link>
        );
    }

    // Grid view (default)
    return (
        <Link
            href={`/scholarships/${scholarship.slug}`}
            className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-blue-700 hover:-translate-y-1 transition-all flex flex-col"
        >
            <div className="p-6 flex-1 flex flex-col">
                {/* Status Badge & Verified */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        {statusBadge && (
                            <span className={`text-xs px-2 py-1 rounded-md font-semibold border ${statusBadge.color}`}>
                                {statusBadge.text}
                            </span>
                        )}
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-black mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors flex-1 font-serif tracking-tight leading-tight">
                    {scholarship.title}
                </h3>

                {/* Provider */}
                <p className="text-sm text-gray-600 mb-4">
                    {scholarship.provider}
                </p>

                {/* Info Pills - Compact Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs">
                        <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IndianRupee className="h-3.5 w-3.5 text-green-700" />
                        </div>
                        <span className="font-semibold text-gray-900 truncate">{formatAmount()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-orange-700" />
                        </div>
                        <span className="text-gray-700 truncate">{formatDeadline(scholarship.deadline)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Laptop className="h-3.5 w-3.5 text-blue-700" />
                        </div>
                        <span className="text-gray-700 truncate">{scholarship.application_mode}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="h-3.5 w-3.5 text-purple-700" />
                        </div>
                        <span className="text-gray-700 truncate">{scholarship.level}</span>
                    </div>
                </div>

                {/* Quick Eligibility */}
                {eligibilityHints.length > 0 && (
                    <div className="text-xs text-gray-600 mb-4 border-t pt-3">
                        <div className="font-medium mb-1">Quick Eligibility:</div>
                        <div className="text-gray-700">{eligibilityHints.join(' • ')}</div>
                    </div>
                )}

                {/* View Details Button */}
                <button className="w-full py-3.5 bg-blue-700 text-white rounded-2xl text-sm font-black hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-200 mt-auto">
                    View Details →
                </button>
            </div>

            {/* Bottom accent bar */}
            <div className="h-1 w-full bg-blue-50 group-hover:bg-blue-700 transition-all scale-x-0 group-hover:scale-x-100 origin-left" />
        </Link>
    );
}
