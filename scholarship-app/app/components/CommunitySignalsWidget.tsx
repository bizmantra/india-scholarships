'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    Users, 
    Calendar, 
    CheckCircle2, 
    Award, 
    IndianRupee, 
    AlertCircle, 
    X, 
    Clock, 
    ThumbsUp,
    ShieldAlert
} from 'lucide-react';

interface CommunitySignalsWidgetProps {
    scholarshipId: string;
    scholarshipTitle: string;
    initialAggregate?: {
        scholarship_id: string;
        total_events: number;
        application_count: number;
        verification_count: number;
        selected_count: number;
        payment_count: number;
        average_payment: number;
        last_activity: string | null;
        common_issues_json: string;
    };
}

// Client-side relative time formatter
function formatRelativeTime(dateStr: string | null) {
    if (!dateStr) return 'No updates';
    const formattedStr = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
    const date = new Date(formattedStr);
    if (isNaN(date.getTime())) return 'Recently';
    
    if (!formattedStr.endsWith('Z')) {
        const utcDate = new Date(formattedStr + 'Z');
        if (!isNaN(utcDate.getTime())) {
            const diffMs = Date.now() - utcDate.getTime();
            return getRelativeDiff(diffMs, utcDate);
        }
    }
    
    const diffMs = Date.now() - date.getTime();
    return getRelativeDiff(diffMs, date);
}

function getRelativeDiff(diffMs: number, date: Date) {
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Just now';
    if (diffDays === 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs <= 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            if (diffMins <= 0) return 'Just now';
            return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        }
        return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CommunitySignalsWidget({
    scholarshipId,
    scholarshipTitle,
    initialAggregate
}: CommunitySignalsWidgetProps) {
    const [aggregate, setAggregate] = useState(initialAggregate || {
        scholarship_id: scholarshipId,
        total_events: 0,
        application_count: 0,
        verification_count: 0,
        selected_count: 0,
        payment_count: 0,
        average_payment: 0,
        last_activity: null,
        common_issues_json: '{}'
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [analyticsLogged, setAnalyticsLogged] = useState<Record<string, boolean>>({});

    // Form inputs
    const [status, setStatus] = useState<'Applied' | 'Verification' | 'Selected' | 'Paid' | null>(null);
    const [dateValue, setDateValue] = useState('');
    const [verificationStage, setVerificationStage] = useState<'Institute' | 'District' | 'State' | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [amountWarning, setAmountWarning] = useState<string | null>(null);
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [otherIssueText, setOtherIssueText] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const turnstileContainerRef = useRef<HTMLDivElement>(null);

    // Track analytics events
    const logAnalytics = async (eventName: 'widget_view' | 'cta_click' | 'submission_started' | 'submission_completed') => {
        if (analyticsLogged[eventName]) return;
        setAnalyticsLogged(prev => ({ ...prev, [eventName]: true }));

        try {
            await fetch('/api/community-events/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventName, scholarshipId })
            });

            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', eventName, {
                    scholarship_id: scholarshipId,
                    scholarship_title: scholarshipTitle
                });
            }
        } catch (e) {
            console.error('Failed to log analytics:', e);
        }
    };

    useEffect(() => {
        logAnalytics('widget_view');
        const fetchAggregates = async () => {
            try {
                const res = await fetch(`/api/community-events/${scholarshipId}`);
                if (res.ok) {
                    const data = await res.json();
                    setAggregate(data);
                }
            } catch (e) {
                console.error('Failed to fetch aggregates:', e);
            }
        };
        fetchAggregates();
    }, [scholarshipId]);

    useEffect(() => {
        if (step === 3 && isModalOpen && turnstileContainerRef.current) {
            const container = turnstileContainerRef.current;
            container.innerHTML = '';
            
            const renderWidget = () => {
                if ((window as any).turnstile) {
                    (window as any).turnstile.render(container, {
                        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
                        callback: (token: string) => {
                            setTurnstileToken(token);
                        },
                        'error-callback': () => {
                            setError('Cloudflare Turnstile failed to load. Please try reloading the form.');
                        }
                    });
                }
            };

            if (!(window as any).turnstile) {
                const script = document.createElement('script');
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
                script.onload = renderWidget;
            } else {
                renderWidget();
            }
        }
    }, [step, isModalOpen]);

function getLocalTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getOneYearAgoString() {
    const d = new Date();
    const year = d.getFullYear() - 1;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setStep(1);
        setStatus(null);
        setDateValue(getLocalTodayString());
        setVerificationStage(null);
        setPaymentAmount('');
        setAmountWarning(null);
        setSelectedIssues([]);
        setOtherIssueText('');
        setTurnstileToken('');
        setError(null);
        setSuccessMessage(null);
        logAnalytics('cta_click');
    };

    const handleSelectStatus = (selectedStatus: 'Applied' | 'Verification' | 'Selected' | 'Paid') => {
        setStatus(selectedStatus);
        logAnalytics('submission_started');
        setStep(2);
    };

    const handleAmountChange = (val: string) => {
        setPaymentAmount(val);
        const num = Number(val);
        if (num > 200000) {
            setAmountWarning('Warning: This amount is unusually high for a single payment. Please double-check.');
        } else {
            setAmountWarning(null);
        }
    };

    const handleNextStep2 = () => {
        setError(null);
        if (!dateValue) {
            setError('Please select a date.');
            return;
        }
        
        const todayStr = getLocalTodayString();
        const oneYearAgoStr = getOneYearAgoString();

        if (dateValue > todayStr) {
            setError('Date cannot be in the future.');
            return;
        }

        if (dateValue < oneYearAgoStr) {
            setError('Date cannot be older than one year.');
            return;
        }

        if (status === 'Verification' && !verificationStage) {
            setError('Please select a verification stage.');
            return;
        }

        if (status === 'Paid') {
            const num = Number(paymentAmount);
            if (!paymentAmount || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
                setError('Please enter a valid positive integer amount.');
                return;
            }
        }

        setStep(3);
    };

    const handleToggleIssue = (issueName: string) => {
        if (selectedIssues.includes(issueName)) {
            setSelectedIssues(selectedIssues.filter(i => i !== issueName));
        } else {
            setSelectedIssues([...selectedIssues, issueName]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!turnstileToken) {
            setError('Please solve the Turnstile captcha to verify you are human.');
            return;
        }

        setLoading(true);
        setError(null);

        let eventType = '';
        let mappedStage = '';
        if (status === 'Applied') {
            eventType = 'application_submitted';
        } else if (status === 'Verification') {
            eventType = 'application_stage_changed';
            mappedStage = `${verificationStage} Verification`;
        } else if (status === 'Selected') {
            eventType = 'application_stage_changed';
            mappedStage = 'Selected';
        } else if (status === 'Paid') {
            eventType = 'payment_received';
        }

        const payload = {
            scholarshipId,
            eventType,
            date: dateValue,
            stage: mappedStage || undefined,
            amount: status === 'Paid' ? Number(paymentAmount) : undefined,
            issues: selectedIssues,
            otherText: selectedIssues.includes('Other') ? otherIssueText : undefined,
            turnstileToken
        };

        try {
            const res = await fetch('/api/community-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data.details ? `${data.error} Details: ${data.details}` : (data.error || 'Failed to submit update.');
                throw new Error(errorMsg);
            }

            logAnalytics('submission_completed');
            setSuccessMessage(data.message);
            setStep(4);

            const freshRes = await fetch(`/api/community-events/${scholarshipId}`);
            if (freshRes.ok) {
                const freshData = await freshRes.json();
                setAggregate(freshData);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate issues statistics
    const issuesCounts = JSON.parse(aggregate.common_issues_json || '{}');
    const totalIssuesReported = Object.values(issuesCounts).reduce((a: any, b: any) => a + b, 0) as number;
    const topIssues = Object.entries(issuesCounts)
        .map(([name, count]) => ({
            name,
            percentage: totalIssuesReported > 0 ? Math.round(((count as number) / totalIssuesReported) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

    const totalProgressCount = aggregate.application_count + aggregate.verification_count + aggregate.selected_count + aggregate.payment_count;

    return (
        <section id="community-signals" className="mb-12 border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm bg-gradient-to-b from-white to-gray-50/50 scroll-mt-24">
            {/* Header section with description and CTA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                        <Users className="h-6 w-6 text-blue-600" />
                        Live Student Application Status
                    </h2>
                    <p className="text-xs text-gray-500 mt-2 font-bold leading-relaxed">
                        Live application status & updates submitted by fellow students.
                    </p>
                </div>
                <div className="flex flex-col items-stretch sm:items-end gap-2.5">
                    <button
                        onClick={handleOpenModal}
                        className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/10 active:scale-98 transition-all"
                    >
                        Share Status
                    </button>
                    {/* Header trust indicators */}
                    <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                        <span>✓ Anonymous</span>
                        <span className="text-gray-300">•</span>
                        <span>✓ &lt; 15 seconds</span>
                        <span className="text-gray-300">•</span>
                        <span>✓ No login</span>
                    </div>
                </div>
            </div>

            {/* Empty state Option B: Compact Prompt Card for Tier-2/3 */}
            {aggregate.total_events === 0 ? (
                <div className="p-6 bg-blue-50/35 border border-blue-100/60 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-gray-900 text-sm">Be the first student to update status for this scholarship</h4>
                            <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                                Help future applicants by sharing if your form is submitted, verified, or paid. Takes under 15 seconds.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                        <button
                            onClick={handleOpenModal}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                        >
                            Share Status
                        </button>
                        <div className="flex items-center gap-2 text-[9px] text-gray-400 font-black uppercase tracking-wider">
                            <span>✓ Anonymous</span>
                            <span className="text-gray-300">•</span>
                            <span>✓ &lt; 15 seconds</span>
                            <span className="text-gray-300">•</span>
                            <span>✓ No login</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* Populated 4-Card statistics display */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Community Updates */}
                    <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Community Updates</span>
                            <span className="text-3xl font-black text-gray-900 block leading-tight">
                                {aggregate.total_events}
                            </span>
                            <span className="text-xs text-gray-500 font-bold mt-1.5 block">
                                {aggregate.total_events === 1 ? 'student has shared updates' : 'students have shared updates'}
                            </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <span className="block text-[9px] text-gray-400 font-black uppercase tracking-widest">Last community update</span>
                            <span className="text-xs font-bold text-gray-700 mt-1 block">
                                {formatRelativeTime(aggregate.last_activity)}
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Community Progress */}
                    <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all sm:col-span-2 flex flex-col justify-between">
                        <div>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Community Progress</span>
                            <div className="space-y-3.5">
                                {[
                                    { label: 'Applied (Form Submitted)', count: aggregate.application_count, color: 'bg-blue-500' },
                                    { label: 'Verification Pending (School/College/District)', count: aggregate.verification_count, color: 'bg-purple-500' },
                                    { label: 'Selected (Merit List)', count: aggregate.selected_count, color: 'bg-amber-500' },
                                    { label: 'Payment Received (Money Credited)', count: aggregate.payment_count, color: 'bg-emerald-500' }
                                ].map((item, idx) => {
                                    const pct = totalProgressCount > 0 ? (item.count / totalProgressCount) * 100 : 0;
                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                                                <span>{item.label}</span>
                                                <span className="text-gray-900">{item.count}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${item.color} rounded-full transition-all duration-500`} 
                                                    style={{ width: `${pct}%` }} 
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Common Issues */}
                    <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Common Issues</span>
                            {topIssues.length === 0 ? (
                                <p className="text-xs text-gray-400 italic mt-2 font-medium">No issues reported yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {topIssues.map((issue, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-700 truncate mr-2">{issue.name}</span>
                                            <span className="px-2 py-0.5 bg-red-50 text-red-650 font-black rounded-lg text-[10px]">
                                                {issue.percentage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase">
                            <ShieldAlert className="w-3.5 h-3.5 text-gray-450" />
                            <span>Community Sourced</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col max-h-[90vh]">
                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 overflow-y-auto flex-1">
                            {/* Modal Header */}
                            <div className="mb-6">
                                <span className="text-[10px] text-blue-700 font-black uppercase tracking-widest">Community Verification</span>
                                <h3 className="text-xl font-black text-gray-900 mt-1 leading-tight">{scholarshipTitle}</h3>
                            </div>

                            {/* Progress pill bar & labeled steps */}
                            {step < 4 && (
                                <div className="mb-8">
                                    <div className="flex justify-between items-end mb-2.5">
                                        <div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                                Step {step} of 3
                                            </span>
                                            <span className="text-sm font-extrabold text-gray-900 block mt-0.5">
                                                {step === 1 && 'Application Status'}
                                                {step === 2 && 'Application Details'}
                                                {step === 3 && 'Issues (Optional)'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3].map((s) => (
                                            <div 
                                                key={s} 
                                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                                    step >= s ? 'bg-blue-600' : 'bg-gray-100'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl flex gap-2 items-start">
                                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                                    <span className="whitespace-pre-line leading-relaxed">{error}</span>
                                </div>
                            )}

                            {/* Step 1: Status selection */}
                            {step === 1 && (
                                <div>
                                    <h4 className="font-extrabold text-gray-900 text-base mb-4">
                                        What is your application status for this scholarship?
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { status: 'Applied', icon: <Calendar className="w-5 h-5 text-blue-600" />, label: 'Applied', desc: 'Form Submitted' },
                                            { status: 'Verification', icon: <CheckCircle2 className="w-5 h-5 text-purple-600" />, label: 'Verification Pending', desc: 'School / College / District level' },
                                            { status: 'Selected', icon: <Award className="w-5 h-5 text-amber-600" />, label: 'Selected', desc: 'Name in Merit List' },
                                            { status: 'Paid', icon: <IndianRupee className="w-5 h-5 text-emerald-600" />, label: 'Payment Received', desc: 'Money Credited in Bank' }
                                        ].map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSelectStatus(item.status as any)}
                                                className="flex items-start gap-4 p-5 bg-white border border-gray-150 rounded-2xl text-left hover:border-blue-600 hover:bg-blue-50/10 active:scale-99 transition-all group"
                                            >
                                                <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">{item.icon}</div>
                                                <div>
                                                    <span className="block font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                                                        {item.label}
                                                    </span>
                                                    <span className="block text-xs text-gray-500 font-medium mt-0.5">{item.desc}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Conditional Details */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    {status === 'Applied' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">When did you apply?</label>
                                            <input
                                                type="date"
                                                value={dateValue}
                                                onChange={(e) => setDateValue(e.target.value)}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-150 text-gray-900 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-bold shadow-sm"
                                            />
                                        </div>
                                    )}

                                    {status === 'Verification' && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Which verification stage?</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {(['Institute', 'District', 'State'] as const).map((stg) => (
                                                        <button
                                                            key={stg}
                                                            type="button"
                                                            onClick={() => setVerificationStage(stg)}
                                                            className={`py-3.5 px-4 rounded-xl text-xs font-bold text-center border transition-all ${
                                                                verificationStage === stg
                                                                    ? 'bg-purple-50 border-purple-500 text-purple-700 font-black'
                                                                    : 'bg-white border-gray-150 text-gray-600 hover:border-gray-300'
                                                            }`}
                                                            style={verificationStage === stg ? { backgroundColor: 'rgba(147, 51, 234, 0.08)' } : {}}
                                                        >
                                                            {stg}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Verification Date (Optional)</label>
                                                <input
                                                    type="date"
                                                    value={dateValue}
                                                    onChange={(e) => setDateValue(e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-150 text-gray-900 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-bold shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {status === 'Selected' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Selection Date</label>
                                            <input
                                                type="date"
                                                value={dateValue}
                                                onChange={(e) => setDateValue(e.target.value)}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-150 text-gray-900 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-bold shadow-sm"
                                            />
                                        </div>
                                    )}

                                    {status === 'Paid' && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Date</label>
                                                <input
                                                    type="date"
                                                    value={dateValue}
                                                    onChange={(e) => setDateValue(e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-150 text-gray-900 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-bold shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount Received (₹)</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 15000"
                                                    value={paymentAmount}
                                                    onChange={(e) => handleAmountChange(e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-150 text-gray-900 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-bold shadow-sm"
                                                />
                                                {amountWarning && (
                                                    <p className="text-[10px] text-amber-600 font-bold mt-1.5 flex gap-1 items-center">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {amountWarning}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextStep2}
                                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/15 transition-all"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Issues (Optional) */}
                            {step === 3 && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base mb-1">
                                            Did you face any problems during form filling or verification?
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-4 font-semibold">Optional – Select all that apply.</p>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                'Income Certificate',
                                                'Aadhaar',
                                                'Bank Verification',
                                                'Portal Error',
                                                'Document Verification',
                                                'Other'
                                            ].map((issue) => {
                                                const isSelected = selectedIssues.includes(issue);
                                                return (
                                                    <button
                                                        key={issue}
                                                        type="button"
                                                        onClick={() => handleToggleIssue(issue)}
                                                        className={`p-3.5 rounded-xl text-left border text-xs font-bold transition-all ${
                                                            isSelected
                                                                ? 'bg-red-50 border-red-300 text-red-705 font-black'
                                                                : 'bg-white border-gray-150 text-gray-600 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        {issue}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {selectedIssues.includes('Other') && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Describe your issue (max 150 chars)</label>
                                            <textarea
                                                maxLength={150}
                                                rows={3}
                                                placeholder="Describe the portal error or document verification issue you faced..."
                                                value={otherIssueText}
                                                onChange={(e) => setOtherIssueText(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-150 text-gray-900 text-xs rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none font-medium shadow-sm resize-none"
                                            />
                                            <p className="text-right text-[10px] text-gray-400 font-medium mt-1">
                                                {otherIssueText.length} / 150 characters
                                            </p>
                                        </div>
                                    )}

                                    {/* Turnstile Container */}
                                    <div className="flex justify-center my-4">
                                        <div ref={turnstileContainerRef} />
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-50 transition-colors"
                                            disabled={loading}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/15 disabled:bg-gray-300 disabled:shadow-none active:scale-98 transition-all flex items-center justify-center"
                                        >
                                            {loading ? 'Submitting...' : 'Submit Update'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 4: Success Message */}
                            {step === 4 && (
                                <div className="text-center py-6">
                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                        <ThumbsUp className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-extrabold text-gray-900 text-lg mb-2">Thank you for helping other students!</h4>
                                    <p className="text-sm text-gray-650 font-medium max-w-sm mx-auto leading-relaxed">
                                        Your update has been recorded and will appear after moderation.
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2 font-medium max-w-xs mx-auto leading-relaxed">
                                        Every contribution helps future applicants understand the scholarship process.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/10 active:scale-98 transition-all"
                                    >
                                        Close Window
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
