'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Users, 
    Calendar, 
    Award, 
    IndianRupee, 
    CheckCircle, 
    XCircle, 
    Trash2, 
    Clock, 
    RotateCw,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

interface EventItem {
    id: number;
    scholarship_id: string;
    scholarship_title: string;
    scholarship_slug: string;
    event_type: string;
    metadata_json: string;
    moderation_status: string;
    created_at: string;
    metadata: {
        submission_date?: string;
        stage?: string;
        date?: string;
        payment_date?: string;
        amount?: number;
        issues?: string[];
        otherText?: string;
    };
}

interface DashboardMetrics {
    totalUpdates: number;
    updatesLast7Days: number;
    distinctScholarships: number;
    completionRate: number;
    analyticsFunnel: {
        started: number;
        completed: number;
    };
}

export default function AdminModeration() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [triggerAggLoading, setTriggerAggLoading] = useState(false);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/moderation');
            if (!res.ok) {
                throw new Error('Failed to load moderation data.');
            }
            const data = await res.json();
            setEvents(data.events || []);
            setMetrics(data.metrics || null);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (eventId: number, status: 'approved' | 'rejected') => {
        setActionLoading(eventId);
        setError(null);
        setInfoMessage(null);
        try {
            const res = await fetch(`/api/admin/moderation/${eventId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update event.');
            }
            // Update local state
            setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, moderation_status: status } : ev));
            setInfoMessage(`Event #${eventId} successfully ${status}.`);
            // Refresh metrics and aggregates
            const freshRes = await fetch('/api/admin/moderation');
            if (freshRes.ok) {
                const freshData = await freshRes.json();
                setMetrics(freshData.metrics);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update event.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (!confirm('Are you sure you want to permanently delete this event? This cannot be undone.')) {
            return;
        }

        setActionLoading(eventId);
        setError(null);
        setInfoMessage(null);
        try {
            const res = await fetch(`/api/admin/moderation/${eventId}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete event.');
            }
            setEvents(prev => prev.filter(ev => ev.id !== eventId));
            setInfoMessage(`Event #${eventId} successfully deleted.`);
            
            // Refresh metrics and aggregates
            const freshRes = await fetch('/api/admin/moderation');
            if (freshRes.ok) {
                const freshData = await freshRes.json();
                setMetrics(freshData.metrics);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete event.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleTriggerAggregation = async () => {
        setTriggerAggLoading(true);
        setError(null);
        setInfoMessage(null);
        try {
            const res = await fetch('/api/admin/moderation', {
                method: 'POST'
            });
            if (!res.ok) {
                throw new Error('Failed to run aggregation.');
            }
            setInfoMessage('Hourly aggregation recalculations triggered successfully.');
        } catch (err: any) {
            setError(err.message || 'Aggregation failed.');
        } finally {
            setTriggerAggLoading(false);
        }
    };

    const formatEventDescription = (ev: EventItem) => {
        const dateStr = ev.metadata.submission_date || ev.metadata.date || ev.metadata.payment_date || '';
        const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        
        switch (ev.event_type) {
            case 'application_submitted':
                return (
                    <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-xs text-blue-400 font-bold">
                            <Calendar className="w-3.5 h-3.5" />
                            Applied
                        </span>
                        <p className="text-gray-300 text-xs font-semibold">Applied on {formattedDate || 'NA'}</p>
                    </div>
                );
            case 'application_stage_changed':
                const isSelected = ev.metadata.stage === 'Selected';
                return (
                    <div className="space-y-1">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-purple-400'}`}>
                            {isSelected ? <Award className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {ev.metadata.stage || 'Stage Changed'}
                        </span>
                        <p className="text-gray-300 text-xs font-semibold">Reached stage on {formattedDate || 'NA'}</p>
                    </div>
                );
            case 'payment_received':
                return (
                    <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                            <IndianRupee className="w-3.5 h-3.5" />
                            Payment Received
                        </span>
                        <p className="text-gray-300 text-xs font-semibold">
                            Received <span className="text-white font-extrabold">₹{(ev.metadata.amount || 0).toLocaleString('en-IN')}</span> on {formattedDate || 'NA'}
                        </p>
                    </div>
                );
            default:
                return <span className="text-gray-400 text-xs">{ev.event_type}</span>;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                        <Users className="h-7 w-7 text-blue-500" />
                        Community Signals Moderation
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        Moderate student updates, review issues, and view dashboard analytics.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleTriggerAggregation}
                        disabled={triggerAggLoading || loading}
                        className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 border border-gray-700 text-xs font-bold text-gray-200 rounded-xl transition-all flex items-center gap-2"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${triggerAggLoading ? 'animate-spin' : ''}`} />
                        Recalculate Aggregates
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-xs font-bold text-white rounded-xl transition-all"
                    >
                        Refresh List
                    </button>
                </div>
            </div>

            {/* Error and Info banners */}
            {error && (
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-2xl flex gap-2 items-start text-red-400 text-sm font-bold">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
            {infoMessage && (
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl flex gap-2 items-start text-emerald-400 text-sm font-bold">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{infoMessage}</span>
                </div>
            )}

            {/* Metrics cards (Hidden Dashboard) */}
            {metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-[#0d1324] border border-gray-800/80 rounded-3xl flex flex-col justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Updates</span>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{metrics.totalUpdates}</span>
                            <span className="text-xs text-gray-400">submissions</span>
                        </div>
                    </div>
                    <div className="p-6 bg-[#0d1324] border border-gray-800/80 rounded-3xl flex flex-col justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Updates (Last 7 Days)</span>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{metrics.updatesLast7Days}</span>
                            <span className="text-xs text-gray-400">submissions</span>
                        </div>
                    </div>
                    <div className="p-6 bg-[#0d1324] border border-gray-800/80 rounded-3xl flex flex-col justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Scholarships</span>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{metrics.distinctScholarships}</span>
                            <span className="text-xs text-gray-400">with updates</span>
                        </div>
                    </div>
                    <div className="p-6 bg-[#0d1324] border border-gray-800/80 rounded-3xl flex flex-col justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Completion Rate</span>
                        <div className="mt-3">
                            <span className="text-3xl font-black text-white">{metrics.completionRate}%</span>
                            <span className="text-[10px] text-gray-500 font-bold block mt-1">
                                {metrics.analyticsFunnel.completed} / {metrics.analyticsFunnel.started} funnel flows
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Moderation Table */}
            <div className="bg-[#0d1324] border border-gray-800/80 rounded-[2rem] overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-850 bg-[#0d1324]/50 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-300">Submissions Queue</span>
                    <span className="px-2.5 py-1 bg-gray-800 text-gray-400 text-[10px] font-black rounded-lg uppercase tracking-wider">
                        {events.length} records
                    </span>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-400 font-semibold flex flex-col items-center justify-center gap-3">
                        <RotateCw className="w-8 h-8 animate-spin text-blue-500" />
                        <span>Loading community updates...</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 font-bold italic">
                        No community updates found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-850 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-900/10">
                                    <th className="p-5 pl-8">Scholarship</th>
                                    <th className="p-5">Event</th>
                                    <th className="p-5">Date</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 pr-8 text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-850">
                                {events.map((ev) => {
                                    const isPending = ev.moderation_status === 'pending';
                                    const isApproved = ev.moderation_status === 'approved';
                                    const isRejected = ev.moderation_status === 'rejected';

                                    return (
                                        <tr key={ev.id} className="hover:bg-gray-800/20 transition-colors">
                                            {/* Scholarship Title */}
                                            <td className="p-5 pl-8 max-w-xs">
                                                <div className="space-y-1">
                                                    <span className="text-white font-bold text-sm block">
                                                        {ev.scholarship_title || 'Unknown Scholarship'}
                                                    </span>
                                                    {ev.scholarship_slug && (
                                                        <Link 
                                                            href={`/scholarships/${ev.scholarship_slug}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-1 text-[10px] font-black text-blue-400 uppercase tracking-wider hover:underline"
                                                        >
                                                            View Page
                                                            <ExternalLink className="w-2.5 h-2.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Event details and metadata */}
                                            <td className="p-5">
                                                <div className="space-y-3">
                                                    {formatEventDescription(ev)}
                                                    
                                                    {/* Display issues if present */}
                                                    {ev.metadata.issues && ev.metadata.issues.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {ev.metadata.issues.map((issue, i) => (
                                                                <span 
                                                                    key={i} 
                                                                    className="px-2 py-0.5 bg-red-950/30 border border-red-900/40 text-red-400 font-bold text-[9px] rounded-md"
                                                                >
                                                                    {issue}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Display custom comment text */}
                                                    {ev.metadata.otherText && (
                                                        <div className="p-3 bg-gray-900/30 border border-gray-800 text-gray-300 text-xs rounded-xl italic font-medium max-w-md">
                                                            "{ev.metadata.otherText}"
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Date created */}
                                            <td className="p-5 text-xs text-gray-400 font-bold">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {new Date(ev.created_at.replace(' ', 'T')).toLocaleDateString('en-IN')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                                        {new Date(ev.created_at.replace(' ', 'T')).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Moderation Status Badge */}
                                            <td className="p-5">
                                                {isPending && (
                                                    <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5 w-fit">
                                                        <Clock className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}
                                                {isApproved && (
                                                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5 w-fit">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Approved
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5 w-fit">
                                                        <XCircle className="w-3 h-3" />
                                                        Rejected
                                                    </span>
                                                )}
                                            </td>

                                            {/* Moderation Action Buttons */}
                                            <td className="p-5 pr-8 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!isApproved && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ev.id, 'approved')}
                                                            disabled={actionLoading === ev.id}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-800 text-[10px] font-bold text-white rounded-lg transition-all active:scale-95"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {!isRejected && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ev.id, 'rejected')}
                                                            disabled={actionLoading === ev.id}
                                                            className="px-3 py-1.5 bg-rose-955 hover:bg-rose-900 border border-rose-900/40 text-[10px] font-bold text-rose-400 rounded-lg transition-all active:scale-95"
                                                            style={!isRejected ? { backgroundColor: 'rgba(225, 29, 72, 0.1)' } : {}}
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteEvent(ev.id)}
                                                        disabled={actionLoading === ev.id}
                                                        className="p-1.5 bg-gray-850 hover:bg-gray-800 hover:text-red-400 border border-gray-800 text-gray-400 rounded-lg transition-all active:scale-95"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
