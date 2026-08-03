'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Calendar, Laptop, Users, IndianRupee, Clock, ArrowRight } from 'lucide-react';

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
    const [thumbnailFailed, setThumbnailFailed] = useState(false);

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
            return { text: 'Closed', color: 'text-[#56547A] bg-[#F8F9FE] border-[#E2E2E8]' };
        }

        const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Closing Soon
        if (daysUntilDeadline <= 7) {
            return { text: 'Closing Soon', color: 'text-[#EF4444] bg-[#FEF2F2] border-transparent' };
        }

        // New
        if (scholarship.created_at) {
            const createdDate = new Date(scholarship.created_at);
            const daysSinceCreated = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceCreated <= 14) {
                return { text: 'New Opportunity', color: 'text-[#4A47FF] bg-[#F5F6FF] border-transparent' };
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

    // Provider circular badge generator
    const getProviderBadge = () => {
        const firstLetter = scholarship.provider ? scholarship.provider.charAt(0).toUpperCase() : 'S';
        const colors = [
            'bg-[#F5F6FF] text-[#4A47FF]',
            'bg-[#ECFDF5] text-[#10B981]',
            'bg-[#FEF2F2] text-[#EF4444]',
            'bg-[#FEF3C7] text-[#F59E0B]'
        ];
        const index = firstLetter.charCodeAt(0) % colors.length;
        const colorClass = colors[index];

        if (scholarship.thumbnail_url && !thumbnailFailed) {
            return (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#E2E2E8] shrink-0 bg-white flex items-center justify-center shadow-xs">
                    <img
                        src={scholarship.thumbnail_url}
                        alt={scholarship.provider}
                        className="object-contain w-full h-full p-1"
                        onError={() => setThumbnailFailed(true)}
                    />
                </div>
            );
        }

        return (
            <div className={`w-12 h-12 rounded-full border border-[#E2E2E8] flex items-center justify-center font-bold text-lg shrink-0 shadow-xs font-heading ${colorClass}`}>
                {firstLetter}
            </div>
        );
    };

    if (viewMode === 'list') {
        const deadlineIsUrgent = statusBadge?.text === 'Closing Soon';
        const deadlineIsClosed = statusBadge?.text === 'Closed';
        return (
            <Link
                href={`/scholarships/${scholarship.slug}`}
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-x-6 gap-y-2 py-4 px-4 rounded-xl border-b border-[#E2E2E8] hover:bg-[#F8F9FE] transition-all group"
            >
                <div>
                    <p className="text-base font-extrabold text-[#2E2C57] font-heading group-hover:text-[#4A47FF] transition-colors leading-snug">
                        {scholarship.title}
                    </p>
                    <p className="text-xs text-[#56547A] font-medium mt-0.5">
                        {scholarship.provider} {scholarship.state ? `· ${scholarship.state}` : ''}
                    </p>
                </div>
                <div className="text-left sm:text-right">
                    <span className="text-base font-extrabold text-[#4A47FF] font-heading">{formatAmount()}</span>
                    <span className="block text-[11px] text-[#56547A]">per year</span>
                </div>
                <div className={`text-xs font-bold text-left sm:text-right whitespace-nowrap px-3 py-1.5 rounded-full ${deadlineIsUrgent ? 'text-[#EF4444] bg-[#FEF2F2]' : deadlineIsClosed ? 'text-[#56547A] bg-[#F8F9FE]' : 'text-[#10B981] bg-[#ECFDF5]'}`}>
                    {formatDeadline(scholarship.deadline)}
                </div>
            </Link>
        );
    }

    // LeapScholar Grid View Card
    return (
        <Link
            href={`/scholarships/${scholarship.slug}`}
            className="group bg-white border border-[#E2E2E8] rounded-3xl overflow-hidden hover:shadow-xl hover:border-[#4A47FF]/60 hover:-translate-y-1 transition-all flex flex-col p-6 h-full min-h-[350px] shadow-xs"
        >
            {/* Top row: Verification and Status pill */}
            <div className="flex justify-between items-center mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[11px] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                    Verified Scheme
                </span>
                {statusBadge && (
                    <span className={`px-3 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusBadge.color}`}>
                        {statusBadge.text}
                    </span>
                )}
            </div>

            {/* Provider Circle & Details */}
            <div className="flex items-center gap-3 mb-4">
                {getProviderBadge()}
                <div className="overflow-hidden">
                    <p className="text-xs text-[#2E2C57] font-bold truncate font-heading">
                        {scholarship.provider}
                    </p>
                    <p className="text-[11px] text-[#56547A] truncate font-medium">
                        {scholarship.state || 'Pan-India'}
                    </p>
                </div>
            </div>

            {/* Scholarship Title */}
            <h3 className="text-base font-extrabold text-[#2E2C57] font-heading group-hover:text-[#4A47FF] transition-colors line-clamp-2 leading-snug mb-4 flex-1">
                {scholarship.title}
            </h3>

            {/* Price Tag Highlight */}
            <div className="mb-4 p-3 bg-[#F8F9FE] rounded-2xl border border-[#E2E2E8]">
                <span className="text-[10px] text-[#56547A] block font-bold uppercase tracking-wider">Annual Scholarship Grant</span>
                <span className="text-xl font-extrabold text-[#4A47FF] block mt-0.5 font-heading">
                    {formatAmount()}
                </span>
            </div>

            {/* Micro details */}
            <div className="flex items-center justify-between text-xs text-[#56547A] mb-5 border-t border-[#E2E2E8] pt-3 font-medium">
                <span className="flex items-center gap-1 truncate">
                    <Clock className="h-3.5 w-3.5 text-[#4A47FF]" />
                    {formatDeadline(scholarship.deadline)}
                </span>
                <span className="flex items-center gap-1 truncate">
                    <Laptop className="h-3.5 w-3.5 text-[#4A47FF]" />
                    {scholarship.application_mode || 'Online'}
                </span>
            </div>

            {/* Rounded Pill CTA Button */}
            <button className="w-full py-3 bg-[#4A47FF] group-hover:bg-[#3834E0] text-white rounded-full text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm">
                <span>View Scheme & Apply</span>
                <ArrowRight className="h-3.5 w-3.5" />
            </button>
        </Link>
    );
}
