'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Activity, ShieldAlert, Key } from 'lucide-react';

function LoginContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="w-full max-w-md p-8 bg-[#0d1324]/80 backdrop-blur-md border border-gray-800/80 rounded-2xl shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden group">
            {/* Background Radial Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Header / Brand */}
            <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-600/15 border border-blue-500/30 text-blue-400 rounded-xl">
                    <Activity className="h-8 w-8" />
                </div>
                <h1 className="text-xl font-black text-white mt-2">India Scholarships</h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Command Center Admin</p>
            </div>

            <div className="w-full h-[1px] bg-gray-800/60" />

            {/* Error Message Box */}
            {error && (
                <div className="w-full p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex gap-3 items-start animate-shake">
                    <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed font-medium">{error}</p>
                </div>
            )}

            {/* Instruction */}
            <div className="text-center space-y-1.5 px-2">
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    This admin console is restricted. Please sign in with a whitelisted Google Account to gain administrative credentials.
                </p>
            </div>

            {/* CTA Button */}
            <a
                href="/api/admin/auth/google"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2.5 border border-blue-500/20 cursor-pointer"
            >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Sign in with Google
            </a>

            {/* Verification Key indicator */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-2">
                <Key className="h-3 w-3" />
                Session Encrypted
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen w-full bg-[#0b0f19] flex items-center justify-center p-6 text-gray-100 font-sans">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs uppercase tracking-widest font-black">Loading Auth Page...</p>
                </div>
            }>
                <LoginContent />
            </Suspense>
        </div>
    );
}
