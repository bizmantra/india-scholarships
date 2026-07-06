'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    Download,
    RotateCw,
    AlertCircle,
    Eye,
    Globe,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';

interface PageItem {
    path: string;
    absoluteUrl: string;
    pageClass: string;
    templateFile: string;
    title: string;
    variable: string;
    dbId: string;
    itemCount: string | number;
    priority: string;
    verifiedStatus: string;
    completeness: string;
}

export default function SeoAudit() {
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const fetchAuditData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/seo-audit');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch SEO audit list.');
            }
            const data = await res.json();
            setPages(data.pages);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditData();
    }, []);

    // Filter and search logic
    const filteredPages = pages.filter(p => {
        // Search filter
        const matchesSearch = 
            p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.variable.toLowerCase().includes(searchQuery.toLowerCase());
            
        // Class filter
        const matchesClass = 
            classFilter === 'All' || 
            (classFilter === 'Static' && p.pageClass === 'Static Route') ||
            (classFilter === 'Hubs' && p.pageClass.includes('Hub')) ||
            (classFilter === 'Details' && (p.pageClass === 'Scholarship Detail' || p.pageClass.includes('Legacy'))) ||
            (classFilter === 'Clusters' && p.pageClass.includes('Subpage'));

        // Status Filter
        const matchesStatus =
            statusFilter === 'All' ||
            (statusFilter === 'Verified' && (p.verifiedStatus === 'Verified' || p.verifiedStatus === 'System')) ||
            (statusFilter === 'Draft' && (p.verifiedStatus === 'Pending Verification' || p.verifiedStatus === 'Dynamic'));

        return matchesSearch && matchesClass && matchesStatus;
    });

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, classFilter, statusFilter]);

    // Paginate calculations
    const totalItems = filteredPages.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredPages.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Get unique classes for filter stats
    const totalStatic = pages.filter(p => p.pageClass === 'Static Route').length;
    const totalHubs = pages.filter(p => p.pageClass.includes('Hub')).length;
    const totalDetails = pages.filter(p => p.pageClass === 'Scholarship Detail').length;
    const totalClusters = pages.filter(p => p.pageClass.includes('Subpage')).length;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
                <RotateCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-xs font-bold tracking-wider uppercase">Compiling URL Sitemap Inventory...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto text-gray-400">
                <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Crawl Catalog Sync Failed</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">{error}</p>
                <button 
                    onClick={fetchAuditData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    Retry Loading URL List
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Sitemap URL Audit</h1>
                    <p className="text-sm text-gray-400 mt-1">Explore, filter, and audit every active indexable URL path generated on the site.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a 
                        href="/api/admin/seo-audit?download=true"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95"
                    >
                        <Download className="h-4 w-4" />
                        Download Master CSV
                    </a>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#0e1629] border border-gray-800/80 p-4 rounded-xl text-center">
                    <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-black">All Catalog URLs</span>
                    <span className="block text-xl font-bold mt-1 text-white">{pages.length.toLocaleString()}</span>
                </div>
                <div className="bg-[#0e1629] border border-gray-800/80 p-4 rounded-xl text-center">
                    <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-black">Static Pages</span>
                    <span className="block text-xl font-bold mt-1 text-gray-300">{totalStatic}</span>
                </div>
                <div className="bg-[#0e1629] border border-gray-800/80 p-4 rounded-xl text-center">
                    <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-black">Directory Hubs</span>
                    <span className="block text-xl font-bold mt-1 text-gray-300">{totalHubs}</span>
                </div>
                <div className="bg-[#0e1629] border border-gray-800/80 p-4 rounded-xl text-center">
                    <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-black">Leaf Details</span>
                    <span className="block text-xl font-bold mt-1 text-gray-300">{totalDetails}</span>
                </div>
                <div className="bg-[#0e1629] border border-gray-800/80 p-4 rounded-xl text-center col-span-2 md:col-span-1">
                    <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-black">Subpage Clusters</span>
                    <span className="block text-xl font-bold mt-1 text-gray-300">{totalClusters}</span>
                </div>
            </div>

            {/* Filters panel */}
            <div className="bg-[#0e1629] border border-gray-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search paths or title tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#121a2e] border border-gray-800 hover:border-gray-700 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-200 outline-none transition-all"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-400">Class:</span>
                        <select 
                            value={classFilter} 
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="bg-[#121a2e] border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-1.5 outline-none hover:border-gray-700 transition-colors"
                        >
                            <option value="All">All Categories</option>
                            <option value="Static">Static Pages</option>
                            <option value="Hubs">Hub Directory listings</option>
                            <option value="Details">Scholarship leaf details</option>
                            <option value="Clusters">Subpage dynamic clusters</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Status:</span>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#121a2e] border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-1.5 outline-none hover:border-gray-700 transition-colors"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Verified">Verified / Static</option>
                            <option value="Draft">Draft / Pending</option>
                        </select>
                    </div>
                </div>

            </div>

            {/* URL Audit Table */}
            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-[#0c1220]/40">
                                <th className="p-4 pl-6">Clean Page Path</th>
                                <th className="p-4">Page Class</th>
                                <th className="p-4">Title Tag</th>
                                <th className="p-4 text-center">Priority</th>
                                <th className="p-4">Verification</th>
                                <th className="p-4">Content Quality Status</th>
                                <th className="p-4 pr-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-xs text-gray-300">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500 italic">No URL paths match your filter selections.</td>
                                </tr>
                            ) : (
                                paginatedItems.map((page, idx) => (
                                    <tr key={idx} className="hover:bg-[#121a2e]/30 transition-colors">
                                        <td className="p-4 pl-6 font-mono text-[11px] max-w-xs truncate text-blue-400" title={page.path}>
                                            {page.path}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 bg-gray-800 border border-gray-750 text-gray-400 text-[9px] font-bold rounded">
                                                {page.pageClass}
                                            </span>
                                        </td>
                                        <td className="p-4 max-w-xs truncate font-medium text-gray-200" title={page.title}>
                                            {page.title}
                                        </td>
                                        <td className="p-4 text-center font-bold text-gray-400">
                                            {page.priority}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest ${
                                                page.verifiedStatus === 'Verified' || page.verifiedStatus === 'System'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {page.verifiedStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[11px] ${
                                                page.completeness.includes('Verified') || page.completeness.includes('Complete') || page.completeness.includes('Active')
                                                    ? 'text-gray-400 font-medium'
                                                    : 'text-amber-500'
                                            }`}>
                                                {page.completeness}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            <Link 
                                                href={page.path}
                                                target="_blank"
                                                className="inline-flex p-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                title="Open Page"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-gray-800 bg-[#0c1220]/20 flex items-center justify-between text-xs text-gray-400">
                    <div>
                        Showing <strong className="text-gray-200">{startIndex + 1}</strong> to <strong className="text-gray-200">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong className="text-gray-200">{totalItems.toLocaleString()}</strong> URLs
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white rounded-lg disabled:opacity-40 disabled:hover:bg-gray-800 disabled:text-gray-600 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span>Page <strong className="text-gray-200">{currentPage}</strong> of <strong className="text-gray-200">{totalPages}</strong></span>
                        <button 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="p-1.5 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white rounded-lg disabled:opacity-40 disabled:hover:bg-gray-800 disabled:text-gray-600 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
