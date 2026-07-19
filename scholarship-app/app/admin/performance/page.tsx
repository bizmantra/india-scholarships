'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    RotateCw,
    AlertCircle,
    TrendingUp,
    BarChart3,
    Percent,
    Award,
    Users,
    Eye,
    Clock,
    DollarSign,
    Share2,
    Layers,
    Activity
} from 'lucide-react';

interface ChartRow {
    date: string;
    clicks: number;
    impressions: number;
    ctr: string;
    position: number;
}

interface QueryRow {
    query: string;
    clicks: number;
    impressions: number;
    ctr: string;
    position: number;
}

export default function Performance() {
    const [activeTab, setActiveTab] = useState<'gsc' | 'ga4' | 'adsense'>('gsc');

    // GSC State
    const [chartData, setChartData] = useState<ChartRow[]>([]);
    const [queries, setQueries] = useState<QueryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // GA4 State
    const [gaData, setGaData] = useState<any>(null);
    const [gaLoading, setGaLoading] = useState(false);
    const [gaError, setGaError] = useState<string | null>(null);

    // AdSense State
    const [adsenseData, setAdsenseData] = useState<any>(null);
    const [adsenseLoading, setAdsenseLoading] = useState(false);
    const [adsenseError, setAdsenseError] = useState<string | null>(null);

    // Fetch Search Console Data
    const fetchPerformanceData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/performance');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch GSC performance metrics.');
            }
            const data = await res.json();
            
            // Format chart data (skip header at index 0)
            const formattedChart: ChartRow[] = [];
            const rawChart = data.chart || [];
            for (let i = 1; i < rawChart.length; i++) {
                const [date, clicks, impressions, ctr, position] = rawChart[i];
                formattedChart.push({
                    date,
                    clicks: parseInt(clicks) || 0,
                    impressions: parseInt(impressions) || 0,
                    ctr: ctr || '0%',
                    position: parseFloat(position) || 0
                });
            }

            // Format queries data (skip header at index 0)
            const formattedQueries: QueryRow[] = [];
            const rawQueries = data.queries || [];
            for (let i = 1; i < rawQueries.length; i++) {
                const [query, clicks, impressions, ctr, position] = rawQueries[i];
                formattedQueries.push({
                    query,
                    clicks: parseInt(clicks) || 0,
                    impressions: parseInt(impressions) || 0,
                    ctr: ctr || '0%',
                    position: parseFloat(position) || 0
                });
            }

            setChartData(formattedChart);
            setQueries(formattedQueries);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Fetch GA4 Analytics Data
    const fetchAnalyticsData = async () => {
        setGaLoading(true);
        setGaError(null);
        try {
            const res = await fetch('/api/admin/analytics');
            if (!res.ok) throw new Error('Failed to load Google Analytics data.');
            const data = await res.json();
            setGaData(data);
        } catch (err: any) {
            setGaError(err.message || 'An error occurred.');
        } finally {
            setGaLoading(false);
        }
    };

    // Fetch AdSense Data
    const fetchAdSenseData = async () => {
        setAdsenseLoading(true);
        setAdsenseError(null);
        try {
            const res = await fetch('/api/admin/adsense');
            if (!res.ok) throw new Error('Failed to load Google AdSense reports.');
            const data = await res.json();
            setAdsenseData(data);
        } catch (err: any) {
            setAdsenseError(err.message || 'An error occurred.');
        } finally {
            setAdsenseLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformanceData();
    }, []);

    // Fetch respective tab data when active tab changes
    useEffect(() => {
        if (activeTab === 'ga4' && !gaData) {
            fetchAnalyticsData();
        } else if (activeTab === 'adsense' && !adsenseData) {
            fetchAdSenseData();
        }
    }, [activeTab]);

    // Filter queries table
    const filteredQueries = queries.filter(q => 
        q.query.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Compute totals (latest 30 days)
    const latestDays = chartData.slice(-30);
    const totalClicks = latestDays.reduce((acc, row) => acc + row.clicks, 0);
    const totalImpressions = latestDays.reduce((acc, row) => acc + row.impressions, 0);
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    const avgPosition = latestDays.length > 0 
        ? (latestDays.reduce((acc, row) => acc + row.position, 0) / latestDays.length).toFixed(1) 
        : '0.0';

    // SVG Line chart generator (Clicks & Impressions trends)
    const renderSvgChart = () => {
        if (latestDays.length === 0) return null;

        const width = 800;
        const height = 220;
        const padding = 40;

        const maxClicks = Math.max(...latestDays.map(d => d.clicks)) || 100;
        const maxImps = Math.max(...latestDays.map(d => d.impressions)) || 1000;

        const clicksPoints = latestDays.map((d, index) => {
            const x = padding + (index / (latestDays.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.clicks / maxClicks) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');

        const impsPoints = latestDays.map((d, index) => {
            const x = padding + (index / (latestDays.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.impressions / maxImps) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-gray-800">
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="1" />

                {/* Impressions (Indigo) */}
                <polyline fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" points={impsPoints} />
                {/* Clicks (Blue) */}
                <polyline fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={clicksPoints} />

                {/* Y Axis Labels */}
                <text x={padding - 10} y={padding} fill="#3b82f6" fontSize="10" fontWeight="bold" textAnchor="end">{maxClicks.toLocaleString()}</text>
                <text x={padding - 10} y={height - padding} fill="#3b82f6" fontSize="10" fontWeight="bold" textAnchor="end">0</text>
                <text x={width - padding + 10} y={padding} fill="#4f46e5" fontSize="10" fontWeight="bold" textAnchor="start">{maxImps.toLocaleString()}</text>
                <text x={width - padding + 10} y={height - padding} fill="#4f46e5" fontSize="10" fontWeight="bold" textAnchor="start">0</text>

                {/* X Axis Dates */}
                <text x={padding} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{latestDays[0]?.date}</text>
                <text x={width / 2} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{latestDays[Math.floor(latestDays.length / 2)]?.date}</text>
                <text x={width - padding} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{latestDays[latestDays.length - 1]?.date}</text>
            </svg>
        );
    };

    // Render GA4 Line Chart (Users & Pageviews)
    const renderAnalyticsChart = () => {
        if (!gaData || !gaData.trend || gaData.trend.length === 0) return null;
        const trend = gaData.trend;

        const width = 800;
        const height = 220;
        const padding = 40;

        const maxUsers = Math.max(...trend.map((d: any) => d.users)) || 100;
        const maxViews = Math.max(...trend.map((d: any) => d.pageviews)) || 1000;

        const usersPoints = trend.map((d: any, index: number) => {
            const x = padding + (index / (trend.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.users / maxUsers) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');

        const viewsPoints = trend.map((d: any, index: number) => {
            const x = padding + (index / (trend.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.pageviews / maxViews) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-gray-800">
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="1" />

                {/* Pageviews (Purple) */}
                <polyline fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" points={viewsPoints} />
                {/* Active Users (Emerald) */}
                <polyline fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={usersPoints} />

                {/* Y Axis Labels */}
                <text x={padding - 10} y={padding} fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="end">{maxUsers.toLocaleString()}</text>
                <text x={padding - 10} y={height - padding} fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="end">0</text>
                <text x={width - padding + 10} y={padding} fill="#a855f7" fontSize="10" fontWeight="bold" textAnchor="start">{maxViews.toLocaleString()}</text>
                <text x={width - padding + 10} y={height - padding} fill="#a855f7" fontSize="10" fontWeight="bold" textAnchor="start">0</text>

                {/* X Axis Dates */}
                <text x={padding} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{trend[0]?.date}</text>
                <text x={width / 2} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{trend[Math.floor(trend.length / 2)]?.date}</text>
                <text x={width - padding} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{trend[trend.length - 1]?.date}</text>
            </svg>
        );
    };

    // Render AdSense Daily Revenue Chart
    const renderAdSenseChart = () => {
        if (!adsenseData || !adsenseData.daily || adsenseData.daily.length === 0) return null;
        const daily = adsenseData.daily;

        const width = 800;
        const height = 220;
        const padding = 40;

        const maxEarnings = Math.max(...daily.map((d: any) => d.earnings)) || 100;

        const earningsPoints = daily.map((d: any, index: number) => {
            const x = padding + (index / (daily.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.earnings / maxEarnings) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-gray-800">
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="1" />

                {/* Earnings (Amber/Gold) */}
                <polyline fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={earningsPoints} />

                {/* Y Axis Labels */}
                <text x={padding - 10} y={padding} fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="end">₹{maxEarnings.toLocaleString()}</text>
                <text x={padding - 10} y={height - padding} fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="end">₹0</text>

                {/* X Axis Dates */}
                <text x={padding} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{daily[0]?.date}</text>
                <text x={width / 2} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{daily[Math.floor(daily.length / 2)]?.date}</text>
                <text x={width - padding} y={height - 15} fill="#6b7280" fontSize="9" textAnchor="middle">{daily[daily.length - 1]?.date}</text>
            </svg>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
                <RotateCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-xs font-bold tracking-wider uppercase">Loading Search Analytics data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto text-gray-400">
                <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Performance Loading Failed</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">{error}</p>
                <button 
                    onClick={fetchPerformanceData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    Retry Loading Reports
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Performance Analytics</h1>
                    <p className="text-sm text-gray-400 mt-1">Unified reporting for Google Search Console, GA4 Traffic, and AdSense Earnings.</p>
                </div>

                {/* Sub-tab Pill controls */}
                <div className="flex bg-[#0e1629] p-1 border border-gray-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('gsc')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'gsc' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Search Console
                    </button>
                    <button
                        onClick={() => setActiveTab('ga4')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'ga4' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Google Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('adsense')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'adsense' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        AdSense Revenue
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: SEARCH CONSOLE */}
            {activeTab === 'gsc' && (
                <div className="space-y-6">
                    {/* Performance Overview Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Total Clicks (30d)</span>
                                <span className="block text-2xl font-bold text-white mt-1">{totalClicks.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Impressions (30d)</span>
                                <span className="block text-2xl font-bold text-white mt-1">{totalImpressions.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">
                                <Percent className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Average CTR</span>
                                <span className="block text-2xl font-bold text-white mt-1">{avgCtr}%</span>
                            </div>
                        </div>
                        <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Average Position</span>
                                <span className="block text-2xl font-bold text-white mt-1">{avgPosition}</span>
                            </div>
                        </div>
                    </div>

                    {/* SVG Trend Line Chart */}
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-white">Organic Search Performance Trends</h2>
                                <p className="text-xs text-gray-400 mt-1">Showing daily CTR growth index. Indigo = Impressions, Blue = Clicks.</p>
                            </div>
                        </div>
                        <div className="w-full bg-[#0d1222] p-4 rounded-xl border border-gray-850">
                            {renderSvgChart()}
                        </div>
                    </div>

                    {/* Keyword Queries Table */}
                    <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-white">Top 100 Search Keywords</h2>
                                <p className="text-xs text-gray-400 mt-1">Queries driving the highest clicks and impressions to your domain.</p>
                            </div>
                            
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Filter queries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#121a2e] border border-gray-800 hover:border-gray-700 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-gray-800 rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-[#0c1220]/40">
                                        <th className="p-4 pl-6">Search Query</th>
                                        <th className="p-4 text-center">Clicks</th>
                                        <th className="p-4 text-center">Impressions</th>
                                        <th className="p-4 text-center">Average CTR</th>
                                        <th className="p-4 text-center">Average Position</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-xs text-gray-300">
                                    {filteredQueries.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500 italic">No search queries match.</td>
                                        </tr>
                                    ) : (
                                        filteredQueries.map((q, idx) => (
                                            <tr key={idx} className="hover:bg-[#121a2e]/30 transition-colors">
                                                <td className="p-4 pl-6 font-bold text-gray-200">{q.query}</td>
                                                <td className="p-4 text-center font-semibold text-emerald-400">{q.clicks.toLocaleString()}</td>
                                                <td className="p-4 text-center text-gray-400">{q.impressions.toLocaleString()}</td>
                                                <td className="p-4 text-center font-medium text-gray-400">{q.ctr}</td>
                                                <td className="p-4 text-center font-bold text-blue-400">{q.position.toFixed(1)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: GOOGLE ANALYTICS 4 */}
            {activeTab === 'ga4' && (
                <div className="space-y-6">
                    {gaLoading && (
                        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-gray-400">
                            <RotateCw className="h-6 w-6 text-emerald-500 animate-spin" />
                            <p className="text-[10px] uppercase font-bold tracking-wider">Loading GA4 Data...</p>
                        </div>
                    )}

                    {gaError && (
                        <div className="p-6 text-center border border-gray-800 rounded-2xl bg-[#0e1629] text-gray-400">
                            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
                            <h3 className="font-bold text-white mb-1">Analytics Failed</h3>
                            <p className="text-xs">{gaError}</p>
                        </div>
                    )}

                    {gaData && !gaLoading && (
                        <div className="space-y-6">
                            {/* GA4 Macro Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
                                    <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl relative z-10">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="relative z-10">
                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Active Users (Realtime)</span>
                                        <span className="block text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
                                            {gaData.realtime}
                                            <span className="flex h-2.5 w-2.5 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl">
                                        <Eye className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Total Visitors (30d)</span>
                                        <span className="block text-2xl font-bold text-white mt-1">
                                            {gaData.trend.reduce((acc: number, d: any) => acc + d.users, 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl">
                                        <Eye className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Page Views (30d)</span>
                                        <span className="block text-2xl font-bold text-white mt-1">
                                            {gaData.trend.reduce((acc: number, d: any) => acc + d.pageviews, 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Avg Duration (Seconds)</span>
                                        <span className="block text-2xl font-bold text-white mt-1">
                                            {Math.round(gaData.trend.reduce((acc: number, d: any) => acc + d.avgDuration, 0) / gaData.trend.length)}s
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Visitor & Pageview Traffic Trends</h2>
                                        <p className="text-xs text-gray-400 mt-1">Active users vs Pageviews. Emerald = Visitors, Purple = Views.</p>
                                    </div>
                                </div>
                                <div className="w-full bg-[#0d1222] p-4 rounded-xl border border-gray-850">
                                    {renderAnalyticsChart()}
                                </div>
                            </div>

                            {/* Double grid list split */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Traffic Sources */}
                                <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-4">
                                    <div>
                                        <h3 className="font-bold text-white text-base">Top Traffic Channels</h3>
                                        <p className="text-[11px] text-gray-500">Source / Medium referrers driving traffic to the site.</p>
                                    </div>
                                    <div className="space-y-3">
                                        {gaData.sources.map((src: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-[#121a2e]/50 border border-gray-850 rounded-xl text-xs">
                                                <span className="font-mono text-gray-300">{src.source}</span>
                                                <span className="font-bold text-white">{src.users.toLocaleString()} users</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Popular Pages */}
                                <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-4">
                                    <div>
                                        <h3 className="font-bold text-white text-base">Top Viewed Pages</h3>
                                        <p className="text-[11px] text-gray-500">Specific path URLs receiving the highest hit counts.</p>
                                    </div>
                                    <div className="space-y-3">
                                        {gaData.pages.map((pg: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-[#121a2e]/50 border border-gray-850 rounded-xl text-xs">
                                                <span className="font-mono text-blue-400 truncate max-w-xs">{pg.path}</span>
                                                <span className="font-bold text-white">{pg.views.toLocaleString()} views</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: ADSENSE MONETIZATION */}
            {activeTab === 'adsense' && (
                <div className="space-y-6">
                    {adsenseLoading && (
                        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-gray-400">
                            <RotateCw className="h-6 w-6 text-amber-500 animate-spin" />
                            <p className="text-[10px] uppercase font-bold tracking-wider">Loading AdSense metrics...</p>
                        </div>
                    )}

                    {adsenseError && (
                        <div className="p-6 text-center border border-gray-800 rounded-2xl bg-[#0e1629] text-gray-400">
                            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
                            <h3 className="font-bold text-white mb-1">AdSense Query Failed</h3>
                            <p className="text-xs">{adsenseError}</p>
                        </div>
                    )}

                    {adsenseData && !adsenseLoading && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
                                    <div className="p-3 bg-amber-600/10 text-amber-500 rounded-xl">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Estimated Earnings (30d)</span>
                                        <span className="block text-2xl font-bold text-amber-400 mt-1">₹{adsenseData.summary.last30Days.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Ad Impressions</span>
                                        <span className="block text-2xl font-bold text-white mt-1">{adsenseData.summary.impressions.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl">
                                        <Share2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Ad Clicks</span>
                                        <span className="block text-2xl font-bold text-white mt-1">{adsenseData.summary.clicks.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="bg-[#0e1629] border border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl">
                                        <Percent className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Page RPM / CTR</span>
                                        <span className="block text-xl font-bold text-white mt-1.5">₹{adsenseData.summary.rpm} / {adsenseData.summary.ctr}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Daily Ad Revenue Growth Trend</h2>
                                        <p className="text-xs text-gray-400 mt-1">Earnings tracking index over the last 30 days.</p>
                                    </div>
                                </div>
                                <div className="w-full bg-[#0d1222] p-4 rounded-xl border border-gray-850">
                                    {renderAdSenseChart()}
                                </div>
                            </div>

                            {/* Ad units breakdown */}
                            <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-4">
                                <div>
                                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-amber-500" />
                                        Earnings by Ad Unit Placement
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-medium">Breakdown of earnings generated by specific layout elements.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {adsenseData.units.map((unit: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-[#121a2e]/40 border border-gray-850 rounded-xl flex items-center justify-between text-xs hover:border-gray-700 transition-colors">
                                            <div className="space-y-1">
                                                <span className="font-bold text-gray-250 block">{unit.name}</span>
                                                <span className="text-[10px] text-gray-500 block">Imps: {unit.impressions.toLocaleString()} · Clicks: {unit.clicks.toLocaleString()}</span>
                                            </div>
                                            <span className="font-black text-amber-400 text-sm">₹{unit.earnings.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
