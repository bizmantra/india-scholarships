'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Activity,
    FileText,
    Settings as SettingsIcon,
    Globe,
    Layers,
    TrendingUp,
    CheckSquare,
    Home,
    Users
} from 'lucide-react';

interface SidebarItemProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
}

function SidebarItem({ href, label, icon, active }: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: <Activity className="h-5 w-5" /> },
        { href: '/admin/moderation', label: 'Community Signals', icon: <Users className="h-5 w-5" /> },
        { href: '/admin/backlog', label: 'Backlog Manager', icon: <CheckSquare className="h-5 w-5" /> },
        { href: '/admin/seo-audit', label: 'SEO Audit', icon: <FileText className="h-5 w-5" /> },
        { href: '/admin/content-manager', label: 'Content Manager', icon: <Layers className="h-5 w-5" /> },
        { href: '/admin/performance', label: 'Performance', icon: <TrendingUp className="h-5 w-5" /> },
        { href: '/admin/indexing', label: 'Indexing', icon: <Globe className="h-5 w-5" /> },
        { href: '/admin/settings', label: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
    ];

    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col md:flex-row">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-[#0d1324] border-b md:border-b-0 md:border-r border-gray-800/80 flex flex-col justify-between p-6 flex-shrink-0 z-40">
                <div className="space-y-8">
                    {/* Header Logo */}
                    <div className="flex items-center justify-between">
                        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="text-base font-black tracking-tight text-white">
                                Command Center
                            </span>
                        </Link>
                    </div>

                    {/* Menu items */}
                    <nav className="flex flex-col gap-1.5">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                active={pathname === item.href}
                            />
                        ))}
                    </nav>
                </div>

                {/* Footer Controls / Dev Info */}
                <div className="mt-8 pt-6 border-t border-gray-800/60 space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Status:</span>
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Connected
                        </span>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-850 hover:bg-gray-800 border border-gray-850 hover:border-gray-700 text-xs text-gray-300 hover:text-white rounded-xl transition-all font-bold w-full"
                    >
                        <Home className="h-4 w-4" />
                        Return to Website
                    </Link>
                    <Link
                        href="/api/admin/auth/logout"
                        className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/25 hover:bg-rose-900/40 border border-rose-900/30 hover:border-rose-800/50 text-xs text-rose-400 hover:text-rose-300 rounded-xl transition-all font-bold w-full justify-center"
                    >
                        Log Out Session
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Top header bar */}
                <header className="h-16 border-b border-gray-800 bg-[#0d1324]/50 backdrop-blur flex items-center justify-between px-6 sm:px-8 z-30">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            India Scholarships
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                            Localhost Dev Mode
                        </span>
                    </div>
                </header>

                {/* Page children slot */}
                <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                    {children}
                </main>

            </div>
        </div>
    );
}
