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
    Bot
} from 'lucide-react';
import { THEME_BOOT_SCRIPT, ThemeToggle, useAdminTheme } from './ThemeToggle';

// Set automatically by Vercel; preview deployments use the staging database
const ENV_BADGE: Record<string, { label: string; className: string }> = {
    production: { label: 'Live site', className: 'bg-emerald-500/10 border-emerald-500/25 text-cc-good' },
    preview: { label: 'Staging', className: 'bg-amber-500/10 border-amber-500/30 text-cc-warn' },
    development: { label: 'Local dev', className: 'bg-gray-500/10 border-gray-500/25 text-cc-muted' },
};

// Screens already built on the light/dark colours. Others stay dark until they are reworked.
const THEMED_PAGES = ['/admin/agents'];

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
            className={`flex shrink-0 items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-cc-muted hover:text-cc-text hover:bg-cc-raised'
            }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { theme, toggle } = useAdminTheme();
    const envBadge = ENV_BADGE[process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'] || ENV_BADGE.development;
    const themedPage = THEMED_PAGES.some(p => pathname === p || pathname.startsWith(`${p}/`));

    const menuItems = [
        { href: '/admin/agents', label: 'Agent Center', icon: <Bot className="h-5 w-5" /> },
        { href: '/admin/dashboard', label: 'Dashboard', icon: <Activity className="h-5 w-5" /> },
        { href: '/admin/backlog', label: 'Backlog Manager', icon: <CheckSquare className="h-5 w-5" /> },
        { href: '/admin/seo-audit', label: 'SEO Audit', icon: <FileText className="h-5 w-5" /> },
        { href: '/admin/content-manager', label: 'Content Manager', icon: <Layers className="h-5 w-5" /> },
        { href: '/admin/performance', label: 'Performance', icon: <TrendingUp className="h-5 w-5" /> },
        { href: '/admin/indexing', label: 'Indexing', icon: <Globe className="h-5 w-5" /> },
        { href: '/admin/settings', label: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
    ];

    return (
        <div data-theme={theme} suppressHydrationWarning className="admin-theme min-h-screen bg-cc-bg text-cc-text flex flex-col md:flex-row">
            <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />

            {/* Sidebar Navigation */}
            {/* On phones the menu is a compact scrolling strip so the page starts on the first screen */}
            <aside className="w-full md:w-64 bg-cc-panel border-b md:border-b-0 md:border-r border-cc-border flex flex-col justify-between p-3 md:p-6 flex-shrink-0 z-40">
                <div className="space-y-3 md:space-y-8">
                    {/* Header Logo */}
                    <div className="flex items-center justify-between">
                        <Link href="/admin/agents" className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="text-base font-black tracking-tight text-cc-text">
                                Command Center
                            </span>
                        </Link>
                        {/* The header (with the toggle) is hidden on phones, so the toggle also sits here */}
                        <span className="md:hidden"><ThemeToggle theme={theme} onToggle={toggle} /></span>
                    </div>

                    {/* Menu items */}
                    <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                            />
                        ))}
                    </nav>
                </div>

                {/* Footer Controls / Dev Info */}
                <div className="hidden md:block mt-8 pt-6 border-t border-cc-border space-y-4">
                    <div className="flex items-center justify-between text-xs text-cc-faint">
                        <span>Status:</span>
                        <span className="flex items-center gap-1.5 text-cc-good font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Connected
                        </span>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2.5 bg-cc-raised border border-cc-border hover:border-cc-border-strong text-xs text-cc-text-2 hover:text-cc-text rounded-xl transition-all font-bold w-full"
                    >
                        <Home className="h-4 w-4" />
                        Return to Website
                    </Link>
                    {/* A plain link on purpose: Next.js pre-loads <Link>s, and pre-loading this one would sign the user out */}
                    <a
                        href="/api/admin/auth/logout"
                        className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs text-cc-bad rounded-xl transition-all font-bold w-full justify-center"
                    >
                        Log Out Session
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top header bar */}
                <header className="hidden md:flex h-16 border-b border-cc-border bg-cc-panel/50 backdrop-blur items-center justify-between px-6 sm:px-8 z-30">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-cc-muted uppercase tracking-widest">
                            India Scholarships
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 border text-[10px] font-bold rounded-full uppercase tracking-widest ${envBadge.className}`}>
                            {envBadge.label}
                        </span>
                        <ThemeToggle theme={theme} onToggle={toggle} />
                    </div>
                </header>

                {/* Page children slot. Screens not converted to the light/dark colours yet stay dark. */}
                <main
                    data-theme={themedPage ? undefined : 'dark'}
                    className={`flex-1 p-3 sm:p-8 overflow-y-auto ${themedPage ? '' : 'bg-cc-bg text-gray-100'}`}
                >
                    {children}
                </main>

            </div>
        </div>
    );
}
