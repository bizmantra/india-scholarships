'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, GraduationCap, MapPin, IndianRupee, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface ScholarshipSearchItem {
    id: string;
    title: string;
    slug: string;
    provider: string;
    state: string;
    level: string;
    caste: string[];
    amount_annual: number;
    amount_min?: number;
    deadline?: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [scholarships, setScholarships] = useState<ScholarshipSearchItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch the index once when the modal is opened
    useEffect(() => {
        if (!isOpen) return;

        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';

        const fetchSearchIndex = async () => {
            if (scholarships.length > 0) return;
            setIsLoading(true);
            try {
                const res = await fetch('/api/search');
                if (res.ok) {
                    const data = await res.json();
                    setScholarships(data);
                }
            } catch (err) {
                console.error('Failed to load search index:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchIndex();
        
        // Auto-focus input on mount
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);

        return () => {
            document.body.style.overflow = 'unset';
            clearTimeout(timer);
        };
    }, [isOpen, scholarships.length]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Filter logic
    const results = useMemo(() => {
        if (!query.trim()) return { scholarships: [], states: [], categories: [] };
        
        const cleanQuery = query.toLowerCase().trim();
        
        // Filter scholarships
        const matchedScholarships = scholarships.filter(s => 
            s.title.toLowerCase().includes(cleanQuery) ||
            (s.provider && s.provider.toLowerCase().includes(cleanQuery)) ||
            (s.state && s.state.toLowerCase().includes(cleanQuery)) ||
            (s.level && s.level.toLowerCase().includes(cleanQuery))
        );

        // Filter states (unique states found in matched query)
        const uniqueStates = Array.from(
            new Set(
                scholarships
                    .map(s => s.state)
                    .filter(state => state && state.toLowerCase().includes(cleanQuery))
            )
        ).slice(0, 3);

        // Filter categories (caste tags)
        const allCategories = ['Minority', 'SC', 'ST', 'OBC', 'General (EWS)', 'Students with Disabilities'];
        const matchedCategories = allCategories.filter(cat => 
            cat.toLowerCase().includes(cleanQuery)
        ).slice(0, 3);

        return {
            scholarships: matchedScholarships.slice(0, 8), // limit to top 8
            states: uniqueStates,
            categories: matchedCategories
        };
    }, [query, scholarships]);

    // Calculate total items to navigate with arrow keys
    const totalNavigableItems = useMemo(() => {
        return results.states.length + results.categories.length + results.scholarships.length;
    }, [results]);

    // Reset selection index when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Handle Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (totalNavigableItems === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % totalNavigableItems);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + totalNavigableItems) % totalNavigableItems);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            
            // Determine which item is selected and navigate to it
            let currentIndex = 0;
            
            // Check states
            for (const state of results.states) {
                if (currentIndex === selectedIndex) {
                    router.push(`/scholarships-in/${slugify(state)}`);
                    onClose();
                    return;
                }
                currentIndex++;
            }
            
            // Check categories
            for (const cat of results.categories) {
                if (currentIndex === selectedIndex) {
                    router.push(`/scholarships-for/${slugify(cat)}`);
                    onClose();
                    return;
                }
                currentIndex++;
            }
            
            // Check scholarships
            for (const s of results.scholarships) {
                if (currentIndex === selectedIndex) {
                    router.push(`/scholarships/${s.slug}`);
                    onClose();
                    return;
                }
                currentIndex++;
            }
        }
    };

    if (!isOpen) return null;

    // Helper to format annual amounts cleanly
    const formatAmount = (amount: number, minAmount?: number) => {
        if (!amount && !minAmount) return 'Amount Varies';
        const target = amount || minAmount || 0;
        if (target >= 100000) {
            return `₹${(target / 100000).toFixed(1)} Lakhs`;
        }
        return `₹${(target / 1000).toFixed(0)}k`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] md:pt-[15vh]">
            {/* Backdrop with premium glassmorphism blur */}
            <div 
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Search Card Container */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mx-4 flex flex-col max-h-[75vh] transition-all animate-in fade-in zoom-in-95 duration-200">
                {/* Search Bar Input */}
                <div className="flex items-center px-5 py-4 border-b border-gray-100 gap-3">
                    <Search className="h-5 w-5 text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search by title, state, level or category..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full text-base bg-transparent border-0 outline-hidden placeholder-gray-400 text-gray-900 pr-4"
                    />
                    {query && (
                        <button 
                            onClick={() => setQuery('')}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-400 shadow-xs shrink-0 select-none">
                        ESC
                    </kbd>
                </div>

                {/* Content / Results */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading && (
                        <div className="py-12 text-center text-gray-500 font-medium animate-pulse">
                            Loading search index...
                        </div>
                    )}

                    {!isLoading && !query.trim() && (
                        <div className="py-8 px-4 text-center">
                            <Sparkles className="h-8 w-8 text-blue-500 mx-auto mb-3 opacity-80" />
                            <h3 className="font-bold text-gray-900 mb-1">Search Verified Scholarships</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                Type a state name (e.g. "Karnataka"), a scheme provider ("Tata"), or academic levels to filter instantly.
                            </p>
                            
                            {/* Suggestions */}
                            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                                {['Karnataka', 'Tata', 'Minority', 'SC', '12th'].map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setQuery(suggestion)}
                                        className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-sm font-semibold rounded-xl text-gray-600 border border-gray-100 transition-colors cursor-pointer"
                                    >
                                        "{suggestion}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isLoading && query.trim() && totalNavigableItems === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-gray-500 font-medium">No results found for "{query}"</p>
                            <p className="text-xs text-gray-400 mt-1">Check spelling or search for wider keywords like "Government" or "National".</p>
                        </div>
                    )}

                    {!isLoading && query.trim() && totalNavigableItems > 0 && (
                        <div className="space-y-4">
                            {/* Quick filters (States) */}
                            {results.states.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">States</h4>
                                    <div className="space-y-1">
                                        {results.states.map((state, i) => {
                                            const itemIndex = i;
                                            const isSelected = itemIndex === selectedIndex;
                                            return (
                                                <Link
                                                    key={state}
                                                    href={`/scholarships-in/${slugify(state)}`}
                                                    onClick={onClose}
                                                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                                        isSelected 
                                                            ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-700 pl-3' 
                                                            : 'hover:bg-gray-50 text-gray-700 font-medium border-l-4 border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className={`h-4 w-4 ${isSelected ? 'text-blue-700' : 'text-gray-400'}`} />
                                                        <span>Scholarships in {state}</span>
                                                    </div>
                                                    <span className="text-xs opacity-60 flex items-center gap-1">
                                                        Go to hub {isSelected && <CornerDownLeft className="h-3 w-3" />}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quick filters (Categories) */}
                            {results.categories.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Categories</h4>
                                    <div className="space-y-1">
                                        {results.categories.map((cat, i) => {
                                            const itemIndex = results.states.length + i;
                                            const isSelected = itemIndex === selectedIndex;
                                            return (
                                                <Link
                                                    key={cat}
                                                    href={`/scholarships-for/${slugify(cat)}`}
                                                    onClick={onClose}
                                                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                                        isSelected 
                                                            ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-700 pl-3' 
                                                            : 'hover:bg-gray-50 text-gray-700 font-medium border-l-4 border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <GraduationCap className={`h-4 w-4 ${isSelected ? 'text-blue-700' : 'text-gray-400'}`} />
                                                        <span>Scholarships for {cat}</span>
                                                    </div>
                                                    <span className="text-xs opacity-60 flex items-center gap-1">
                                                        Go to hub {isSelected && <CornerDownLeft className="h-3 w-3" />}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Scholarships Results */}
                            {results.scholarships.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Scholarships</h4>
                                    <div className="space-y-1">
                                        {results.scholarships.map((s, i) => {
                                            const itemIndex = results.states.length + results.categories.length + i;
                                            const isSelected = itemIndex === selectedIndex;
                                            return (
                                                <Link
                                                    key={s.id}
                                                    href={`/scholarships/${s.slug}`}
                                                    onClick={onClose}
                                                    className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-2xl transition-all gap-1 md:gap-4 ${
                                                        isSelected 
                                                            ? 'bg-blue-50 border-l-4 border-blue-700 pl-3' 
                                                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-sm md:text-base font-bold truncate ${
                                                            isSelected ? 'text-blue-900' : 'text-gray-900'
                                                        }`}>
                                                            {s.title}
                                                        </span>
                                                        <span className="text-xs text-gray-400 truncate mt-0.5">
                                                            {s.provider} • {s.level}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 mt-1 md:mt-0 border-t border-gray-50 md:border-0 pt-1 md:pt-0">
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                                                            <IndianRupee className="h-3 w-3" />
                                                            {formatAmount(s.amount_annual, s.amount_min)}
                                                        </span>
                                                        {s.state && s.state !== 'All India' && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50/50 px-2.5 py-1 rounded-xl">
                                                                {s.state}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Shortcuts */}
                <div className="hidden md:flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-md shadow-xs font-bold">↑↓</kbd> to navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-md shadow-xs font-bold">Enter</kbd> to select
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-md shadow-xs font-bold">Esc</kbd> to close
                    </span>
                </div>
            </div>
        </div>
    );
}
