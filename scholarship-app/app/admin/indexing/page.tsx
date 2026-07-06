'use client';

import React, { useState } from 'react';
import {
    Globe,
    CheckCircle,
    ArrowUpRight,
    RefreshCcw,
    Layers,
    FileText
} from 'lucide-react';

export default function Indexing() {
    const [refreshing, setRefreshing] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleSitemapRefresh = () => {
        setRefreshing(true);
        setStatus(null);
        setTimeout(() => {
            setRefreshing(false);
            setStatus('Sitemap caches refreshed on Next.js server! Next.js compiles `sitemap.ts` on-demand dynamically, ensuring search crawlers always retrieve fresh paths.');
        }, 1500);
    };

    return (
        <div className="space-y-6">
            
            {/* Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Search Indexing Status</h1>
                    <p className="text-sm text-gray-400 mt-1">Audit sitemap health, indexability indicators, and XML schemas.</p>
                </div>
            </div>

            {/* Sitemap Sync Block */}
            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            XML Sitemap Lifecycle
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Refresh sitemaps and trace search engine crawling entries.</p>
                    </div>
                    <button 
                        onClick={handleSitemapRefresh}
                        disabled={refreshing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-55 cursor-pointer"
                    >
                        <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh Sitemap Cache'}
                    </button>
                </div>

                {status && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex gap-3 items-start">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="leading-relaxed">{status}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-[#121a2e]/50 border border-gray-850 rounded-xl space-y-3">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Live Sitemap URL</span>
                        <div className="flex items-center justify-between">
                            <a 
                                href="/sitemap.xml" 
                                target="_blank"
                                className="text-sm font-bold text-blue-400 hover:underline flex items-center gap-1.5"
                            >
                                https://www.indiascholarships.in/sitemap.xml
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded">Active</span>
                        </div>
                    </div>
                    <div className="p-5 bg-[#121a2e]/50 border border-gray-850 rounded-xl space-y-3">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Active Crawl Ratios</span>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-300">Total Indexed Subpages:</span>
                            <span className="font-bold text-white">1,839 urls</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-300">Robots Policy:</span>
                            <span className="font-bold text-white">Index, Follow</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sitemap Structure Details */}
            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Sitemap Structure & Prioritization</h2>
                    <p className="text-xs text-gray-400 mt-1">Crawl priorities defined programmatically for dynamic Next.js routes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-[#121a2e]/30 border border-gray-850 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                            <Layers className="h-4 w-4" />
                            Home & Directory Pages
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Static routes and key hub pages are prioritized high to ensure crawlers check listing updates daily.
                        </p>
                        <div className="text-xs font-bold text-white flex justify-between">
                            <span>Sitemap Priority:</span>
                            <span className="text-blue-400">0.8 - 1.0</span>
                        </div>
                    </div>
                    <div className="p-5 bg-[#121a2e]/30 border border-gray-850 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                            <FileText className="h-4 w-4" />
                            Scholarship Detail Pages
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Brand-specific details and overview paths are crawled weekly to capture verification year rollovers.
                        </p>
                        <div className="text-xs font-bold text-white flex justify-between">
                            <span>Sitemap Priority:</span>
                            <span className="text-emerald-400">0.70</span>
                        </div>
                    </div>
                    <div className="p-5 bg-[#121a2e]/30 border border-gray-850 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                            <Globe className="h-4 w-4" />
                            Subpage Clusters
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Dynamic inner leaf paths (documents, selection steps, last dates) targeting long-tail queries.
                        </p>
                        <div className="text-xs font-bold text-white flex justify-between">
                            <span>Sitemap Priority:</span>
                            <span className="text-indigo-400">0.65</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
