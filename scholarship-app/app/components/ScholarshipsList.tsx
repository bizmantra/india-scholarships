'use client';

import { useState, useMemo } from 'react';
import ScholarshipCard from './ScholarshipCard';
import ResultsHeader from './ResultsHeader';

interface ScholarshipsListProps {
    scholarships: any[];
    showCategoryFilters?: boolean;
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
    showCategoryFilters = true
}: ScholarshipsListProps) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDeadlineStatus, setSelectedDeadlineStatus] = useState('All');
    const [sortBy, setSortBy] = useState('deadline');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // 1. Filter by category & deadline status
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
            if (selectedDeadlineStatus !== 'All') {
                const isRollingOrOpen = s.deadline && (s.deadline.toLowerCase() === 'open now' || s.deadline.toLowerCase() === 'rolling');
                const dateObj = s.deadline && s.deadline !== 'NA' && s.deadline !== 'Not specified' && !isRollingOrOpen ? new Date(s.deadline) : null;
                const isValidDate = !!(dateObj && !isNaN(dateObj.getTime()));
                const isExpired = !!(isValidDate && dateObj! < today);
                const daysLeft = isValidDate ? Math.ceil((dateObj!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

                if (selectedDeadlineStatus === 'Open') {
                    // Exclude only explicitly expired ones
                    matchesDeadline = !isExpired;
                } else if (selectedDeadlineStatus === 'Closing Soon') {
                    // Must have valid date, in the future/today, and <= 15 days remaining
                    matchesDeadline = isValidDate && daysLeft !== null && daysLeft >= 0 && daysLeft <= 15;
                } else if (selectedDeadlineStatus === 'Expired') {
                    matchesDeadline = isExpired;
                }
            }

            return matchesCategory && matchesDeadline;
        });
    }, [scholarships, selectedCategory, selectedDeadlineStatus, today]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                                            ? 'bg-blue-700 text-white shadow-md shadow-blue-100'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Deadline Status Filter Chips */}
                {scholarships.length >= 3 && (
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
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
                                    className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                                        selectedDeadlineStatus === status.value
                                            ? 'bg-blue-700 text-white shadow-md shadow-blue-100'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Header (Sort & View Toggles) */}
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
                        }}
                        className="px-6 py-2.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors cursor-pointer text-sm"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
}
