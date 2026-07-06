'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Search, MapPin, Award, Clock, ArrowRight, RotateCcw, ShieldCheck, Flame, Infinity } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { formatDeadlineDate } from '@/lib/utils';

interface DeadlinesClientProps {
    scholarships: any[];
}

export default function DeadlinesClient({ scholarships }: DeadlinesClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closing Soon' | 'Expired'>('All');

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // Process all scholarships to add countdown/dates metadata
    const processedScholarships = useMemo(() => {
        return scholarships.map(s => {
            const isRollingOrOpen = s.deadline && (s.deadline.toLowerCase() === 'open now' || s.deadline.toLowerCase() === 'rolling');
            const dateObj = s.deadline && s.deadline !== 'NA' && s.deadline !== 'Not specified' && !isRollingOrOpen ? new Date(s.deadline) : null;
            const isValidDate = dateObj && !isNaN(dateObj.getTime());
            const isExpired = isValidDate && dateObj! < today;
            const daysLeft = isValidDate ? Math.ceil((dateObj!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

            // Resolve amount
            const amount = s.amount_annual || s.amount_min || 0;

            return {
                ...s,
                isRollingOrOpen,
                isValidDate,
                isExpired,
                daysLeft,
                amount
            };
        });
    }, [scholarships, today]);

    // Unique states list for dropdown
    const uniqueStates = useMemo(() => {
        const states = new Set<string>();
        scholarships.forEach(s => {
            if (s.state && s.state !== 'All India' && s.state !== 'Multiple States') {
                states.add(s.state);
            }
        });
        return ['All', 'All India', ...Array.from(states).sort()];
    }, [scholarships]);

    // Categories list
    const categories = ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'PWD'];

    // Filtered & Sorted list
    const filteredScholarships = useMemo(() => {
        let list = processedScholarships;

        // Search Query filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            list = list.filter(s => 
                s.title.toLowerCase().includes(query) || 
                (s.provider && s.provider.toLowerCase().includes(query))
            );
        }

        // State filter
        if (selectedState !== 'All') {
            if (selectedState === 'All India') {
                list = list.filter(s => !s.state || s.state === 'All India');
            } else {
                list = list.filter(s => s.state === selectedState);
            }
        }

        // Category filter
        if (selectedCategory !== 'All') {
            const lowerCategory = selectedCategory.toLowerCase();
            list = list.filter(s => {
                const casteArray = s.caste || [];
                const isOpenToAll = casteArray.length === 0 || casteArray.some((c: string) => {
                    const cl = c.toLowerCase();
                    return cl === 'all' || cl.includes('open to all') || cl.includes('all categories');
                });
                if (isOpenToAll) return true;

                return casteArray.some((c: string) => {
                    const cLower = c.toLowerCase();
                    if (lowerCategory === 'pwd') {
                        return cLower.includes('pwd') || cLower.includes('disabilit');
                    }
                    if (lowerCategory === 'general') {
                        return cLower.includes('general') || cLower.includes('ews') || cLower.includes('ebc');
                    }
                    return cLower.includes(lowerCategory);
                });
            });
        }

        // Type filter
        if (selectedType !== 'All') {
            list = list.filter(s => s.scholarship_type === selectedType);
        }

        // Status Filter
        if (statusFilter !== 'All') {
            if (statusFilter === 'Open') {
                list = list.filter(s => !s.isExpired);
            } else if (statusFilter === 'Closing Soon') {
                list = list.filter(s => s.isValidDate && s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 15);
            } else if (statusFilter === 'Expired') {
                list = list.filter(s => s.isExpired);
            }
        }

        // Sort: Chronological active first, rolling next, expired last
        return list.sort((a, b) => {
            const tierA = a.isValidDate ? (a.isExpired ? 3 : 1) : 2;
            const tierB = b.isValidDate ? (b.isExpired ? 3 : 1) : 2;

            if (tierA !== tierB) {
                return tierA - tierB;
            }

            if (tierA === 1) {
                const diff = a.daysLeft! - b.daysLeft!;
                if (diff !== 0) return diff;
            }

            // Secondary: highest amount
            return b.amount - a.amount;
        });
    }, [processedScholarships, searchQuery, selectedState, selectedCategory, selectedType, statusFilter]);

    // Metrics calculations
    const metrics = useMemo(() => {
        const open = processedScholarships.filter(s => !s.isExpired);
        const closingSoon = processedScholarships.filter(s => s.isValidDate && s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 15);
        const rolling = processedScholarships.filter(s => s.isRollingOrOpen);
        const maxReward = Math.max(...processedScholarships.map(s => s.amount), 0);

        return {
            totalOpen: open.length,
            closingSoon: closingSoon.length,
            rolling: rolling.length,
            maxReward
        };
    }, [processedScholarships]);

    // Format currency helper
    const formatAmount = (amt: number) => {
        if (!amt) return 'Amount Varies';
        if (amt >= 100000) {
            return `₹${(amt / 100000).toFixed(1)} Lakh`;
        }
        return `₹${amt.toLocaleString('en-IN')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-grow py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    
                    {/* Hero Section */}
                    <div className="text-center mb-10">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-extrabold rounded-full tracking-wider uppercase inline-block mb-3">
                            Live updates
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tight mb-4">
                            Scholarship Deadline Tracker 2026
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Never miss an application closing date. We track government portal deadlines and private trust submission periods daily.
                        </p>
                    </div>

                    {/* Dashboard metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Closing Soon Card */}
                        <div className="bg-gradient-to-br from-amber-500 to-red-600 text-white p-6 rounded-3xl shadow-xl shadow-red-100 flex flex-col justify-between">
                            <div>
                                <span className="text-sm font-bold uppercase tracking-widest text-red-100 block mb-1">Closing Soon</span>
                                <span className="text-4xl font-black block mb-2">{metrics.closingSoon} Opportunities</span>
                            </div>
                            <p className="text-xs text-red-100 font-medium">Closing in the next 15 days. Apply immediately.</p>
                        </div>

                        {/* Total Open Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-xl shadow-blue-100 flex flex-col justify-between">
                            <div>
                                <span className="text-sm font-bold uppercase tracking-widest text-blue-100 block mb-1">Open & Active</span>
                                <span className="text-4xl font-black block mb-2">{metrics.totalOpen} Schemes</span>
                            </div>
                            <p className="text-xs text-blue-100 font-medium">Includes {metrics.rolling} rolling/open now applications.</p>
                        </div>

                        {/* Max Value Card */}
                        <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 rounded-3xl shadow-xl shadow-purple-100 flex flex-col justify-between">
                            <div>
                                <span className="text-sm font-bold uppercase tracking-widest text-purple-100 block mb-1">Max Reward Value</span>
                                <span className="text-4xl font-black block mb-2">{formatAmount(metrics.maxReward)}</span>
                            </div>
                            <p className="text-xs text-purple-100 font-medium">Highest annual grant currently accepting entries.</p>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Search */}
                            <div className="relative md:col-span-4">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title, provider..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                />
                            </div>

                            {/* State Selector */}
                            <div className="md:col-span-3">
                                <select
                                    value={selectedState}
                                    onChange={e => setSelectedState(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                >
                                    <option value="All">All States</option>
                                    {uniqueStates.filter(s => s !== 'All').map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Selector */}
                            <div className="md:col-span-3">
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                >
                                    <option value="All">All Categories</option>
                                    {categories.filter(c => c !== 'All').map(cat => (
                                        <option key={cat} value={cat}>{cat} Schemes</option>
                                    ))}
                                </select>
                            </div>

                            {/* Provider Type Selector */}
                            <div className="md:col-span-2">
                                <select
                                    value={selectedType}
                                    onChange={e => setSelectedType(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                >
                                    <option value="All">All Types</option>
                                    <option value="Government">Government</option>
                                    <option value="Private">Private</option>
                                    <option value="Corporate">Corporate</option>
                                </select>
                            </div>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="border-t border-gray-100 mt-5 pt-5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-1.5">
                                {(['All', 'Open', 'Closing Soon', 'Expired'] as const).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            statusFilter === status
                                                ? 'bg-blue-700 text-white shadow-md shadow-blue-100'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {status === 'Closing Soon' ? '🔥 Closing Soon' : status}
                                    </button>
                                ))}
                            </div>

                            {/* Clear option */}
                            {(searchQuery || selectedState !== 'All' || selectedCategory !== 'All' || selectedType !== 'All' || statusFilter !== 'All') && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedState('All');
                                        setSelectedCategory('All');
                                        setSelectedType('All');
                                        setStatusFilter('All');
                                    }}
                                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 hover:underline cursor-pointer"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Result count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm font-semibold text-gray-600">
                            Showing <span className="text-gray-900 font-bold">{filteredScholarships.length}</span> scheme{filteredScholarships.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Timeline Tracker List */}
                    {filteredScholarships.length > 0 ? (
                        <div className="space-y-4">
                            {filteredScholarships.map(s => {
                                return (
                                    <div
                                        key={s.id}
                                        className={`bg-white p-5 md:p-6 rounded-3xl border transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                                            s.isExpired 
                                                ? 'opacity-75 border-gray-200 bg-gray-50/50' 
                                                : s.daysLeft !== null && s.daysLeft <= 15
                                                    ? 'border-orange-200 hover:border-orange-300 shadow-sm shadow-orange-50/50'
                                                    : 'border-gray-100 hover:border-blue-100'
                                        }`}
                                    >
                                        {/* Left Side: Deadline & Information */}
                                        <div className="flex-grow flex items-start gap-4">
                                            {/* Calendar Icon Badge */}
                                            <div className={`p-3.5 rounded-2xl hidden sm:flex shrink-0 ${
                                                s.isExpired 
                                                    ? 'bg-gray-100 text-gray-400' 
                                                    : s.daysLeft !== null && s.daysLeft <= 15
                                                        ? 'bg-orange-50 text-orange-600 animate-pulse'
                                                        : 'bg-blue-50 text-blue-700'
                                            }`}>
                                                <Calendar className="h-6 w-6" />
                                            </div>

                                            <div>
                                                {/* Header Status Badges */}
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    {s.isExpired ? (
                                                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-2xs font-extrabold uppercase tracking-wider">
                                                            Closed
                                                        </span>
                                                    ) : s.isRollingOrOpen ? (
                                                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-2xs font-extrabold uppercase tracking-wider flex items-center gap-1">
                                                            <Infinity className="h-3 w-3" /> Rolling / Open
                                                        </span>
                                                    ) : s.daysLeft !== null && s.daysLeft <= 15 ? (
                                                        <span className="px-2.5 py-0.5 bg-red-50 text-red-600 rounded-full text-2xs font-extrabold uppercase tracking-wider flex items-center gap-1">
                                                            <Flame className="h-3 w-3 fill-red-600" /> {s.daysLeft} Days Left
                                                        </span>
                                                    ) : s.daysLeft !== null ? (
                                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-2xs font-extrabold uppercase tracking-wider flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {s.daysLeft} Days Left
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-2xs font-extrabold uppercase tracking-wider">
                                                            Check Portal
                                                        </span>
                                                    )}

                                                    <span className="text-2xs font-bold text-gray-400">
                                                        {s.scholarship_type} Scheme
                                                    </span>
                                                </div>

                                                <Link href={`/scholarships/${s.slug}`} className="block">
                                                    <h3 className="text-base md:text-lg font-bold text-gray-900 hover:text-blue-700 transition-colors line-clamp-1">
                                                        {s.title}
                                                    </h3>
                                                </Link>

                                                <p className="text-xs text-gray-500 font-medium mb-2.5">
                                                    {s.provider}
                                                </p>

                                                {/* Meta details */}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5 text-gray-400" /> {s.state || 'All India'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Award className="h-3.5 w-3.5 text-gray-400" /> {formatAmount(s.amount)}
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-gray-400">
                                                        Closing Date: <strong className="text-gray-600">{formatDeadlineDate(s.deadline)}</strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: CTA Action */}
                                        <div className="flex sm:justify-end shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                            <Link
                                                href={`/scholarships/${s.slug}`}
                                                className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 w-full md:w-auto cursor-pointer ${
                                                    s.isExpired
                                                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        : s.daysLeft !== null && s.daysLeft <= 15
                                                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md shadow-orange-100 hover:shadow-lg'
                                                            : 'bg-blue-700 text-white hover:bg-blue-800'
                                                }`}
                                            >
                                                Apply & Verify <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm text-gray-500 font-medium">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Deadlines Found</h3>
                            <p className="max-w-md mx-auto text-sm text-gray-500 mb-6">
                                We couldn't find any scholarships matching your search criteria. Try relaxing your filters or using different keywords.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedState('All');
                                    setSelectedCategory('All');
                                    setSelectedType('All');
                                    setStatusFilter('All');
                                }}
                                className="px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all cursor-pointer text-sm"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
