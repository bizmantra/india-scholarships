'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ScholarshipCard from './ScholarshipCard';
import ResultsHeader from './ResultsHeader';

// Static-friendly hook listener wrapper to prevent Next.js build bails
function SearchParamsHandler({ onChange }: { onChange: (q: string) => void }) {
    const searchParams = useSearchParams();
    const q = searchParams ? searchParams.get('q') || '' : '';
    useEffect(() => {
        onChange(q);
    }, [q, onChange]);
    return null;
}

interface ScholarshipsListProps {
    scholarships: any[];
    showCategoryFilters?: boolean;
    initialTab?: string;
}

const CATEGORIES = [
    { value: 'All', label: 'All Schemes' },
    { value: 'General', label: 'General / EWS' },
    { value: 'OBC', label: 'OBC' },
    { value: 'SC', label: 'SC' },
    { value: 'ST', label: 'ST' },
    { value: 'Minority', label: 'Minority' },
    { value: 'PWD', label: 'PWD (Disability)' }
];

export default function ScholarshipsList({
    scholarships,
    showCategoryFilters = true,
    initialTab = 'All'
}: ScholarshipsListProps) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const initialStatus = initialTab === 'ClosingSoon' ? 'Closing Soon' : initialTab;
    const [selectedDeadlineStatus, setSelectedDeadlineStatus] = useState(initialStatus);
    const [sortBy, setSortBy] = useState('deadline');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // 1. Filter by category, deadline status, and text search query
    const filteredScholarships = useMemo(() => {
        return scholarships.filter(s => {
            // Category Filter
            let matchesCategory = true;
            if (selectedCategory !== 'All') {
                const lowerCategory = selectedCategory.toLowerCase();
                const casteArray = s.caste || [];
                
                // Universal schemes open to everyone
                const isOpenToAll = casteArray.length === 0 || casteArray.some((c: string) => {
                    const cl = c.toLowerCase();
                    return cl === 'all' || cl.includes('open to all') || cl.includes('all categories');
                });
                
                if (!isOpenToAll) {
                    matchesCategory = casteArray.some((c: string) => {
                        const cLower = c.toLowerCase();
                        if (lowerCategory === 'pwd') {
                            return cLower.includes('pwd') || cLower.includes('disabilit');
                        }
                        if (lowerCategory === 'general') {
                            return cLower.includes('general') || cLower.includes('ews') || cLower.includes('ebc');
                        }
                        return cLower.includes(lowerCategory);
                    });
                }
            }

            // Deadline Status Filter
            let matchesDeadline = true;
            const isRollingOrOpen = s.deadline && (s.deadline.toLowerCase() === 'open now' || s.deadline.toLowerCase() === 'rolling');
            const dateObj = s.deadline && s.deadline !== 'NA' && s.deadline !== 'Not specified' && !isRollingOrOpen ? new Date(s.deadline) : null;
            const isValidDate = !!(dateObj && !isNaN(dateObj.getTime()));
            const isExpired = !!(isValidDate && dateObj! < today);
            const daysLeft = isValidDate ? Math.ceil((dateObj!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

            if (selectedDeadlineStatus === 'Closing Soon' || selectedDeadlineStatus === 'ClosingSoon') {
                matchesDeadline = isValidDate && daysLeft !== null && daysLeft >= 0 && daysLeft <= 15;
            } else if (selectedDeadlineStatus === 'Expired') {
                matchesDeadline = isExpired;
            } else {
                // For 'All', 'Open', 'Trending', 'RecentlyAdded', exclude expired items by default
                matchesDeadline = !isExpired;
            }

            // Text Search Filter
            let matchesSearch = true;
            if (searchQuery.trim()) {
                const searchLower = searchQuery.toLowerCase().trim();
                const titleMatch = s.title && s.title.toLowerCase().includes(searchLower);
                const providerMatch = s.provider && s.provider.toLowerCase().includes(searchLower);
                const stateMatch = s.state && s.state.toLowerCase().includes(searchLower);
                const descMatch = s.description && s.description.toLowerCase().includes(searchLower);
                
                matchesSearch = !!(titleMatch || providerMatch || stateMatch || descMatch);
            }

            return matchesCategory && matchesDeadline && matchesSearch;
        });
    }, [scholarships, selectedCategory, selectedDeadlineStatus, searchQuery, today]);

    // 2. Sort results
    const sortedScholarships = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (sortBy === 'deadline') {
            return [...filteredScholarships].sort((a, b) => {
                const dateA = a.deadline && a.deadline !== 'NA' && a.deadline !== 'Not specified' && a.deadline !== 'Open Now' && a.deadline !== 'Rolling' ? new Date(a.deadline) : null;
                const dateB = b.deadline && b.deadline !== 'NA' && b.deadline !== 'Not specified' && b.deadline !== 'Open Now' && b.deadline !== 'Rolling' ? new Date(b.deadline) : null;

                const isValidA = dateA && !isNaN(dateA.getTime());
                const isValidB = dateB && !isNaN(dateB.getTime());

                const isExpiredA = isValidA && dateA! < today;
                const isExpiredB = isValidB && dateB! < today;

                // Tier 1: Active with valid date
                // Tier 2: No deadline / Unknown
                // Tier 3: Expired
                const tierA = isValidA ? (isExpiredA ? 3 : 1) : 2;
                const tierB = isValidB ? (isExpiredB ? 3 : 1) : 2;

                if (tierA !== tierB) {
                    return tierA - tierB;
                }

                if (tierA === 1) {
                    const diff = dateA!.getTime() - dateB!.getTime();
                    if (diff !== 0) return diff;
                }

                // Secondary sort: highest amount
                const amtA = a.amount_annual || a.amount_min || 0;
                const amtB = b.amount_annual || b.amount_min || 0;
                return amtB - amtA;
            });
        }

        if (sortBy === 'amount') {
            return [...filteredScholarships].sort((a, b) => {
                const amtA = a.amount_annual || a.amount_min || 0;
                const amtB = b.amount_annual || b.amount_min || 0;
                return amtB - amtA;
            });
        }

        if (sortBy === 'newest') {
            return [...filteredScholarships].sort((a, b) => {
                const dateA = a.last_verified ? new Date(a.last_verified) : null;
                const dateB = b.last_verified ? new Date(b.last_verified) : null;
                const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
                const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
                if (timeB !== timeA) return timeB - timeA;

                const amtA = a.amount_annual || a.amount_min || 0;
                const amtB = b.amount_annual || b.amount_min || 0;
                return amtB - amtA;
            });
        }

        return filteredScholarships;
    }, [filteredScholarships, sortBy]);

    // Progressive Disclosure: Don't show filters/sorting if items count is very low.
    const showSortingControl = scholarships.length >= 3;
    const renderCategoryFilters = showCategoryFilters && scholarships.length >= 4;

    return (
        <div>
            {/* Static-safe search parameter listener */}
            <Suspense fallback={null}>
                <SearchParamsHandler onChange={setSearchQuery} />
            </Suspense>

            {/* Desktop Filters (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Category Filter Chips */}
                {renderCategoryFilters && (
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                            Filter by Category
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                                        selectedCategory === cat.value
                                            ? 'bg-google-blue text-white shadow-md shadow-blue-100'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Curated Collections & Deadline Status Filter Chips */}
                {scholarships.length >= 3 && (
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                            Curated Collections
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'All', label: 'All Schemes', href: '/scholarships' },
                                { value: 'Trending', label: '🔥 Trending', href: '/scholarships/trending' },
                                { value: 'RecentlyAdded', label: '🕒 Recently Added', href: '/scholarships/recently-added' },
                                { value: 'ClosingSoon', label: '⏰ Closing Soon', href: '/scholarships/deadlines' },
                                { value: 'Expired', label: 'Closed Archive', href: '#' }
                            ].map(tab => (
                                tab.href !== '#' ? (
                                    <Link
                                        key={tab.value}
                                        href={tab.href}
                                        className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer inline-block ${
                                            selectedDeadlineStatus === tab.value || (tab.value === 'ClosingSoon' && selectedDeadlineStatus === 'Closing Soon')
                                                ? 'bg-google-blue text-white shadow-md shadow-blue-100'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </Link>
                                ) : (
                                    <button
                                        key={tab.value}
                                        onClick={() => setSelectedDeadlineStatus(tab.value)}
                                        className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                                            selectedDeadlineStatus === tab.value
                                                ? 'bg-google-blue text-white shadow-md shadow-blue-100'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Filter Trigger Button (AdSense Safe, Top Sticky / Inline Row) */}
            <div className="flex items-center justify-between md:hidden mb-6 bg-white p-4 border border-gray-200 rounded-2xl shadow-xs">
                <div className="text-sm">
                    <span className="font-black text-gray-900">{sortedScholarships.length}</span>
                    <span className="text-gray-500"> schemes found</span>
                </div>
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-google-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-blue-100"
                >
                    <span>🎛️</span> Filters
                </button>
            </div>

            {/* Desktop Results Header (Hidden on Mobile) */}
            <div className="hidden md:block">
                {showSortingControl ? (
                    <ResultsHeader
                        count={sortedScholarships.length}
                        sortBy={sortBy}
                        viewMode={viewMode}
                        onSortChange={setSortBy}
                        onViewChange={setViewMode}
                        showViewToggle={true}
                    />
                ) : (
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900">{sortedScholarships.length}</span>
                            <span className="text-gray-600"> scholarship{sortedScholarships.length !== 1 ? 's' : ''} found</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Full-Screen Filter Overlay Modal (Avoids bottom sheet AdSense collision) */}
            {showMobileFilters && (
                <div className="fixed inset-0 bg-white z-[999] overflow-y-auto p-6 flex flex-col md:hidden animate-in fade-in slide-in-from-bottom duration-200">
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                        <span className="text-lg font-bold text-gray-900">Filters & Sorting</span>
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close filters"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 space-y-6">
                        {/* 1. Category Filters */}
                        {showCategoryFilters && (
                            <div>
                                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
                                    Filter by Category
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setSelectedCategory(cat.value)}
                                            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                                selectedCategory === cat.value
                                                    ? 'bg-google-blue text-white shadow-md shadow-blue-100'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Deadline Filters */}
                        <div>
                            <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
                                Deadline Status
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'All', label: 'All Opportunities' },
                                    { value: 'Open', label: 'Open & Ongoing' },
                                    { value: 'Closing Soon', label: '🔥 Closing Soon' },
                                    { value: 'Expired', label: 'Closed' }
                                ].map(status => (
                                    <button
                                        key={status.value}
                                        onClick={() => setSelectedDeadlineStatus(status.value)}
                                        className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                            selectedDeadlineStatus === status.value
                                                ? 'bg-google-blue text-white shadow-md shadow-blue-100'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Sorting Options */}
                        <div>
                            <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
                                Sort Opportunities
                            </span>
                            <div className="flex flex-col gap-2">
                                {[
                                    { value: 'deadline', label: 'Deadline (Soonest)' },
                                    { value: 'amount', label: 'Reward Value (Highest)' },
                                    { value: 'newest', label: 'Recently Added' }
                                ].map(sortOpt => (
                                    <button
                                        key={sortOpt.value}
                                        onClick={() => setSortBy(sortOpt.value)}
                                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                                            sortBy === sortOpt.value
                                                ? 'bg-blue-50 text-google-blue border border-blue-100'
                                                : 'bg-gray-50 text-gray-700 border border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        {sortOpt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-6">
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full py-4 bg-google-blue hover:bg-blue-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-blue-100"
                        >
                            Apply Filters ({filteredScholarships.length} Results)
                        </button>
                    </div>
                </div>
            )}

            {/* Scholarships List */}
            {sortedScholarships.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                    {sortedScholarships.map(s => (
                        <ScholarshipCard
                            key={s.id}
                            scholarship={s}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-500 font-medium">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="mb-4">No scholarships found matching this filter.</p>
                    <button
                        onClick={() => {
                            setSelectedCategory('All');
                            setSelectedDeadlineStatus('All');
                            setSearchQuery('');
                        }}
                        className="px-6 py-2.5 bg-google-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors cursor-pointer text-sm"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
}
