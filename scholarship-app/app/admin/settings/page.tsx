'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Database,
    Cpu,
    Lock,
    Key,
    Server,
    RefreshCcw,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

interface DiagnosticItem {
    connected: boolean;
    error: string | null;
}

interface Diagnostics {
    gsc: DiagnosticItem;
    ga4: DiagnosticItem;
    adsense: DiagnosticItem;
}

export default function Settings() {
    const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const runDiagnostics = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await fetch('/api/admin/settings/diagnostics');
            if (!res.ok) throw new Error('Diagnostics query failed.');
            const data = await res.json();
            setDiagnostics(data.diagnostics);
        } catch (e: any) {
            setErrorMsg(e.message || 'Failed to fetch credentials status.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    const renderStatusBadge = (key: keyof Diagnostics) => {
        if (loading) {
            return (
                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider animate-pulse">
                    <RefreshCcw className="h-3 w-3 animate-spin" />
                    Testing...
                </span>
            );
        }

        if (!diagnostics) {
            return (
                <span className="px-2 py-0.5 bg-gray-800 border border-gray-750 text-gray-400 text-[9px] font-bold rounded uppercase">
                    Unchecked
                </span>
            );
        }

        const item = diagnostics[key];
        if (item.connected) {
            return (
                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                </span>
            );
        }

        // If credentials are not connected, distinguish between "Failed" and "Local Fallback"
        if (item.error && item.error.includes('credentials missing')) {
            return (
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Local Fallback
                </span>
            );
        }

        return (
            <span className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1" title={item.error || 'Connection error'}>
                <XCircle className="h-3 w-3" />
                Auth Failed
            </span>
        );
    };

    return (
        <div className="space-y-6">
            
            {/* Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">System Settings</h1>
                    <p className="text-sm text-gray-400 mt-1">Configure environment variables, verify directory paths, and audit API integrations.</p>
                </div>
                <button
                    onClick={runDiagnostics}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Test API Connections
                </button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                    {errorMsg}
                </div>
            )}

            {/* Config & Directory Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* System Parameters */}
                <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-blue-500" />
                            System Environments
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Next.js node process environment paths.</p>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 flex items-center gap-2">
                                <Server className="h-4 w-4 text-gray-550" />
                                Node Environment
                            </span>
                            <span className="font-mono text-gray-300 font-bold">development</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 flex items-center gap-2">
                                <Database className="h-4 w-4 text-gray-550" />
                                Database Provider
                            </span>
                            <span className="font-mono text-gray-300 font-bold">better-sqlite3 / libsql client</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-gray-550" />
                                Security Access
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded uppercase">Google OAuth Protected</span>
                        </div>
                    </div>
                </div>

                {/* API Integrations Status */}
                <div className="bg-[#0e1629] border border-gray-800/80 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Key className="h-5 w-5 text-blue-500" />
                            Google APIs Status
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Configure service account keys to enable real-time tracking.</p>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 font-bold">GSC Integration API</span>
                            {renderStatusBadge('gsc')}
                        </div>
                        {diagnostics?.gsc?.error && !diagnostics.gsc.error.includes('credentials missing') && (
                            <p className="text-[10px] text-rose-450 bg-rose-500/5 p-2 rounded-lg leading-relaxed font-mono">
                                Error: {diagnostics.gsc.error}
                            </p>
                        )}

                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 font-bold">GA4 Analytics Data API</span>
                            {renderStatusBadge('ga4')}
                        </div>
                        {diagnostics?.ga4?.error && !diagnostics.ga4.error.includes('credentials missing') && (
                            <p className="text-[10px] text-rose-450 bg-rose-500/5 p-2 rounded-lg leading-relaxed font-mono">
                                Error: {diagnostics.ga4.error}
                            </p>
                        )}

                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 font-bold">AdSense Management API</span>
                            {renderStatusBadge('adsense')}
                        </div>
                        {diagnostics?.adsense?.error && !diagnostics.adsense.error.includes('credentials missing') && (
                            <p className="text-[10px] text-rose-450 bg-rose-500/5 p-2 rounded-lg leading-relaxed font-mono">
                                Error: {diagnostics.adsense.error}
                            </p>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
