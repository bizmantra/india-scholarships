'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Search,
    TrendingUp,
    FileText,
    ArrowLeft,
    RotateCw,
    AlertCircle,
    Eye,
    Globe,
    Layers,
    ShieldAlert,
    Users,
    DollarSign
} from 'lucide-react';

interface Stats {
    totalUrls: number;
    totalScholarships: number;
    verifiedScholarships: number;
    inactiveScholarships: number;
    qualityWarnings: number;
    gscClicks: number;
    gscImpressions: number;
    auditCoverage: number;
    activeUsers: number;
    todayEarnings: number;
}

interface TemplateHealth {
    stateHubs: number;
    scholarshipDetails: number;
    subpageClusters: number;
}

interface CriticalTask {
    id: string;
    title: string;
    slug: string;
    verified: boolean;
    completeness: number;
    issues: string[];
    clicks: number;
    impressions: number;
    priorityScore: number;
}

interface MissingMetrics {
    missingAmountAnnual: number;
    missingDeadline: number;
    missingDocs: number;
    missingHelpline: number;
    missingFaqs: number;
    missingSelection: number;
    missingStepGuide: number;
    missingRenewal: number;
}

interface LogItem {
    id: number;
    scholarship_id: string;
    scholarship_title: string;
    action_type: string;
    details: string;
    timestamp: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [templateHealth, setTemplateHealth] = useState<TemplateHealth | null>(null);
    const [predictiveWarnings, setPredictiveWarnings] = useState<string[]>([]);
    const [criticalTasks, setCriticalTasks] = useState<CriticalTask[]>([]);
    const [missingMetrics, setMissingMetrics] = useState<MissingMetrics | null>(null);
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<CriticalTask[]>([]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/dashboard');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch dashboard data');
            }
            const data = await res.json();
            setStats(data.stats);
            setTemplateHealth(data.templateHealth);
            setPredictiveWarnings(data.predictiveWarnings);
            setCriticalTasks(data.criticalTasks);
            setMissingMetrics(data.missingMetrics);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const res = await fetch('/api/admin/changelog');
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (e) {
            console.error('Failed to fetch changelogs', e);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchLogs();
    }, []);

    // Filter tasks based on URL search query
    useEffect(() => {
        if (!searchQuery) {
            setSearchResult([]);
            return;
        }
        const filtered = criticalTasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResult(filtered);
    }, [searchQuery, criticalTasks]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center gap-4">
                <RotateCw className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-sm font-semibold tracking-wide text-gray-400">Loading Command Center Stats...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                <AlertCircle className="h-14 w-14 text-rose-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-100 mb-2">Access Restriced or Failed</h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{error}</p>
                <button 
                    onClick={fetchDashboardData}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const fieldLabels: Record<string, string> = {
        amount_annual: 'Annual Amount',
        deadline: 'Deadline Date',
        docs_needed: 'Required Documents',
        helpline: 'Official Helpline',
        faq_json: 'Faq Blocks',
        selection: 'Selection Criteria',
        step_guide: 'Step-by-step Guide',
        renewal: 'Renewal Terms'
    };

    return (
        <div className="space-y-8">
            
            {/* Dashboard Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
                    <p className="text-sm text-gray-400 mt-1">Proactive health tracking, quality check warnings, and search indexing predictions.</p>
                </div>
            </div>

            {/* Macro Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Globe className="h-16 w-16 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Crawlable URLs</span>
                        <span className="text-2xl font-black text-white block mt-1">{stats.totalUrls.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500 block mt-1.5 truncate">Static, hubs, details & clusters</span>
                    </div>
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <AlertTriangle className="h-16 w-16 text-amber-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Quality Warnings</span>
                        <span className="text-2xl font-black text-amber-500 block mt-1">{stats.qualityWarnings.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500 block mt-1.5 truncate">Audit issues flagged in database</span>
                    </div>
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp className="h-16 w-16 text-indigo-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Organic Clicks</span>
                        <span className="text-2xl font-black text-emerald-400 block mt-1">{stats.gscClicks.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500 block mt-1.5 truncate">30-day Google clicks total</span>
                    </div>
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <CheckCircle className="h-16 w-16 text-purple-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Audit Coverage</span>
                        <span className="text-2xl font-black text-purple-400 block mt-1">{stats.auditCoverage}%</span>
                        <span className="text-[10px] text-gray-500 block mt-1.5 truncate">{stats.verifiedScholarships} of {stats.totalScholarships} verified</span>
                    </div>
                    
                    {/* Live Concurrent Active Users */}
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users className="h-16 w-16 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Live Active Users</span>
                        <span className="text-2xl font-black text-emerald-400 block mt-1 flex items-center gap-1.5">
                            {stats.activeUsers}
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-1.5 truncate">Live GA4 active visitors now</span>
                    </div>

                    {/* AdSense Revenue */}
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <DollarSign className="h-16 w-16 text-amber-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Today Estimated</span>
                        <span className="text-2xl font-black text-amber-400 block mt-1">₹{stats.todayEarnings.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500 block mt-1.5 truncate">Estimated daily AdSense revenue</span>
                    </div>
                </div>
            )}

            {/* Predictive Warnings Banner Panel */}
            {predictiveWarnings.length > 0 && (
                <div className="bg-[#12131e] border border-rose-500/20 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-xs">
                        <ShieldAlert className="h-4 w-4" />
                        Proactive SEO Engine Warnings
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {predictiveWarnings.map((warning, i) => (
                            <div key={i} className="flex gap-3 items-start p-4 bg-[#1b1c2b] border border-gray-800/80 rounded-xl">
                                <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg mt-0.5 flex-shrink-0">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{warning}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Dashboard Section Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left & Center: Critical Tasks Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-blue-500" />
                                    Critical Verification Queue
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">High-traffic pages with fallback alerts sorted by priority index.</p>
                            </div>
                            <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                Impression-Weighted
                            </span>
                        </div>

                        {/* Tasks Queue List */}
                        <div className="space-y-4">
                            {criticalTasks.slice(0, 5).map((task) => (
                                <div key={task.id} className="p-5 bg-[#121a2e] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-bold text-white text-sm leading-tight">{task.title}</h3>
                                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${task.verified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                {task.verified ? 'Verified' : 'Draft'}
                                            </span>
                                        </div>
                                        
                                        {/* Issues badges */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {task.issues.map(issue => (
                                                <span key={issue} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[9px] font-medium rounded">
                                                    Missing {fieldLabels[issue] || issue}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Micro GSC stats */}
                                        <div className="flex gap-4 text-[11px] text-gray-500">
                                            <span>Clicks: <strong className="text-gray-300">{task.clicks.toLocaleString()}</strong></span>
                                            <span>Impressions: <strong className="text-gray-300">{task.impressions.toLocaleString()}</strong></span>
                                            <span>Completeness: <strong className={task.completeness > 70 ? 'text-emerald-400' : task.completeness > 40 ? 'text-amber-400' : 'text-rose-400'}>{task.completeness}%</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right">
                                            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Priority Weight</span>
                                            <span className="text-lg font-black text-blue-400">{task.priorityScore.toLocaleString()}</span>
                                        </div>
                                        <div className="h-8 w-[1px] bg-gray-800" />
                                        <Link 
                                            href={`/scholarships/${task.slug}`}
                                            target="_blank"
                                            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-colors border border-gray-700 flex items-center justify-center"
                                            title="View Page"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Template Health & Audit Metrics */}
                <div className="space-y-6">
                    
                    {/* Template Health Meter */}
                    {templateHealth && (
                        <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-white">Template Health</h2>
                                <p className="text-xs text-gray-400 mt-1">Crawl indexability safety ratios per route.</p>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-gray-300">State Hubs</span>
                                        <span className="text-emerald-400">{templateHealth.stateHubs}% Healthy</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${templateHealth.stateHubs}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-gray-300">Scholarship Details</span>
                                        <span className="text-amber-400">{templateHealth.scholarshipDetails}% Healthy</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${templateHealth.scholarshipDetails}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-gray-300">Subpage Clusters</span>
                                        <span className="text-emerald-400">{templateHealth.subpageClusters}% Healthy</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${templateHealth.subpageClusters}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Database Missing Fields Metrics */}
                    {missingMetrics && (
                        <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-white">Database Missing Fields</h2>
                                <p className="text-xs text-gray-400 mt-1">Counts of active schemes lacking key fields.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3.5 bg-[#121a2e]/50 border border-gray-800/80 rounded-xl text-center">
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Annual Amount</span>
                                    <span className="block mt-1.5 text-lg font-extrabold text-rose-400">{missingMetrics.missingAmountAnnual}</span>
                                </div>
                                <div className="p-3.5 bg-[#121a2e]/50 border border-gray-800/80 rounded-xl text-center">
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Deadlines</span>
                                    <span className="block mt-1.5 text-lg font-extrabold text-rose-400">{missingMetrics.missingDeadline}</span>
                                </div>
                                <div className="p-3.5 bg-[#121a2e]/50 border border-gray-800/80 rounded-xl text-center">
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Documents</span>
                                    <span className="block mt-1.5 text-lg font-extrabold text-rose-400">{missingMetrics.missingDocs}</span>
                                </div>
                                <div className="p-3.5 bg-[#121a2e]/50 border border-gray-800/80 rounded-xl text-center">
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Helpline</span>
                                    <span className="block mt-1.5 text-lg font-extrabold text-rose-400">{missingMetrics.missingHelpline}</span>
                                </div>
                                <div className="p-3.5 bg-[#121a2e]/50 border border-gray-800/80 rounded-xl text-center">
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">FAQs</span>
                                    <span className="block mt-1.5 text-lg font-extrabold text-rose-400">{missingMetrics.missingFaqs}</span>
                                </div>
                                <div className="p-3.5 bg-[#121a2e]/50 border border-gray-800/80 rounded-xl text-center">
                                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Step Guide</span>
                                    <span className="block mt-1.5 text-lg font-extrabold text-rose-400">{missingMetrics.missingStepGuide}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* System Activity Audit Log (Changelog) */}
            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            System Activity Audit Log
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Real-time changelog of edits, verification events, and database actions.</p>
                    </div>
                    <button 
                        onClick={fetchLogs}
                        disabled={logsLoading}
                        className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Refresh activity logs"
                    >
                        <RotateCw className={`h-4 w-4 ${logsLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {logsLoading ? (
                    <div className="py-6 text-center text-xs text-gray-500 italic">Syncing changelog feed...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500 italic border border-dashed border-gray-850 rounded-xl">
                        No actions logged yet. Start editing database records in Content Manager to record history.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-800 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-[#0c1220]/40">
                                    <th className="p-3 pl-4">Timestamp</th>
                                    <th className="p-3">Scholarship Title</th>
                                    <th className="p-3 text-center">Action</th>
                                    <th className="p-3">Changes Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-805 text-xs text-gray-300">
                                {logs.map((log) => {
                                    let badgeColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                                    if (log.action_type === 'VERIFY') {
                                        badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                                    } else if (log.action_type === 'DRAFT') {
                                        badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                                    }
                                    
                                    // Parse SQLite timestamp nicely
                                    let displayTime = log.timestamp;
                                    try {
                                        const date = new Date(log.timestamp.replace(' ', 'T') + 'Z');
                                        displayTime = date.toLocaleString('en-IN', {
                                            hour12: true,
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                    } catch {}

                                    return (
                                        <tr key={log.id} className="hover:bg-[#121a2e]/20 transition-colors">
                                            <td className="p-3 pl-4 font-mono text-[10px] text-gray-400 whitespace-nowrap">{displayTime}</td>
                                            <td className="p-3 font-semibold text-gray-200 max-w-[200px] truncate" title={log.scholarship_title}>
                                                {log.scholarship_title}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider ${badgeColor}`}>
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-400 max-w-xs truncate" title={log.details}>
                                                {log.details || 'General update'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* URL Search & Explorer Section */}
            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-500" />
                        URL Catalog & Sitemap Explorer
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Search any active page or cluster and trace its dynamic URL patterns.</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Type scholarship name, slug, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#121a2e] border border-gray-800 hover:border-gray-700 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all"
                    />
                </div>

                {searchQuery && (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {searchResult.length === 0 ? (
                            <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed border-gray-800 rounded-xl">No matching page URLs found.</p>
                        ) : (
                            searchResult.map(task => (
                                <div key={task.id} className="p-4 bg-[#121a2e] border border-gray-800 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-white text-xs">{task.title}</h4>
                                        <span className="text-[10px] text-gray-500 font-mono">ID: {task.id}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#0b0f19] p-3 rounded-lg text-[11px] font-mono">
                                        <div>
                                            <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-bold">Main Overview</span>
                                            <Link href={`/scholarships/${task.slug}`} target="_blank" className="text-blue-400 hover:underline block truncate mt-1">
                                                /scholarships/{task.slug}
                                            </Link>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-bold">Eligibility</span>
                                            <Link href={`/scholarships/${task.slug}/eligibility`} target="_blank" className="text-blue-400 hover:underline block truncate mt-1">
                                                .../eligibility
                                            </Link>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-bold">Required Documents</span>
                                            <Link href={`/scholarships/${task.slug}/documents-required`} target="_blank" className="text-blue-400 hover:underline block truncate mt-1">
                                                .../documents-required
                                            </Link>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-bold">How to Apply</span>
                                            <Link href={`/scholarships/${task.slug}/apply-online`} target="_blank" className="text-blue-400 hover:underline block truncate mt-1">
                                                .../apply-online
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
