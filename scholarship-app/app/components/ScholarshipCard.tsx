'use client';

import { useState } from 'react';
import Link from 'next/link';

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

    // Calculate status badges — rounded-full pills, soft bg + solid text (matches
    // the "Applications Open" badge in the Figma mockup)
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
            return { text: 'Closed', color: 'text-slate-600 bg-slate-100' };
        }

        const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Closing Soon
        if (daysUntilDeadline <= 7) {
            return { text: 'Closing Soon', color: 'text-red-700 bg-red-50' };
        }

        // New
        if (scholarship.created_at) {
            const createdDate = new Date(scholarship.created_at);
            const daysSinceCreated = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceCreated <= 14) {
                return { text: 'New Opportunity', color: 'text-brand bg-brand-soft' };
            }
        }

        return { text: 'Applications Open', color: 'text-emerald-700 bg-emerald-50' };
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

    if (viewMode === 'list') {
        return (
            <Link
                href={`/scholarships/${scholarship.slug}`}
                className="flex flex-col gap-2 py-3 px-4 border-b border-slate-200 hover:bg-slate-50 transition-all group min-h-[72px] justify-center"
            >
                <div className="flex justify-between items-start gap-3">
                    <p className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors leading-snug">
                        {scholarship.title}
                    </p>
                    {statusBadge && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusBadge.color}`}>
                            {statusBadge.text}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-600">
                    {scholarship.provider} {scholarship.state ? `· ${scholarship.state}` : ''}
                </p>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                    <span className="font-extrabold text-google-green text-sm">{formatAmount()}</span>
                    <span className="text-slate-600 font-medium">
                        Deadline: <strong className="text-slate-900">{formatDeadline(scholarship.deadline)}</strong>
                    </span>
                </div>
            </Link>
        );
    }

    // Card — matches the Featured Scholarship card in the Figma mockup:
    // white surface, soft shadow, rounded-xl, green amount, filled blue CTA.
    return (
        <Link
            href={`/scholarships/${scholarship.slug}`}
            className="group flex flex-col bg-white border border-slate-200 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 p-6 transition-all duration-300 h-full justify-between"
        >
            <div className="flex justify-between items-start gap-3 mb-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors leading-snug">
                    {scholarship.title}
                </h3>
                {statusBadge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusBadge.color}`}>
                        {statusBadge.text}
                    </span>
                )}
            </div>

            <p className="text-xs text-slate-500 mb-3">{scholarship.provider}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-3">
                <span className="font-extrabold text-google-green text-sm">{formatAmount()}</span>
                <span className="text-slate-600">
                    Deadline: <strong className="text-slate-900">{formatDeadline(scholarship.deadline)}</strong>
                </span>
            </div>

            <div className="bg-surface-gray border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-600 mb-3">
                <strong className="text-slate-700">Eligibility:</strong> {scholarship.state || 'All India'} · {scholarship.application_mode || 'Online'}
            </div>

            <span className="mt-auto inline-flex items-center justify-center gap-1 bg-brand group-hover:bg-brand-dark text-white text-xs font-bold rounded-xl px-4 py-2.5 transition-colors">
                View Details →
            </span>
        </Link>
    );
}
