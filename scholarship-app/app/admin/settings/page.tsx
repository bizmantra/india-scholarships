'use client';

import React from 'react';
import {
    Settings as SettingsIcon,
    Database,
    Cpu,
    Lock,
    Key,
    Server
} from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-6">
            
            {/* Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">System Settings</h1>
                    <p className="text-sm text-gray-400 mt-1">Configure environment variables, verify directory paths, and audit API integrations.</p>
                </div>
            </div>

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
                            <span className="font-mono text-gray-300 font-bold">better-sqlite3</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-gray-550" />
                                Security Access
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded uppercase">Localhost Only</span>
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
                            <span className="px-2 py-0.5 bg-gray-800 border border-gray-750 text-gray-400 text-[9px] font-bold rounded">Local CSV Mode</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 font-bold">GA4 Analytics Data API</span>
                            <span className="px-2 py-0.5 bg-gray-800 border border-gray-750 text-gray-400 text-[9px] font-bold rounded">Pending Setup</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-[#121a2e]/50 border border-gray-850 rounded-xl">
                            <span className="text-gray-450 font-bold">AdSense Management API</span>
                            <span className="px-2 py-0.5 bg-gray-800 border border-gray-750 text-gray-400 text-[9px] font-bold rounded">Pending Setup</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
