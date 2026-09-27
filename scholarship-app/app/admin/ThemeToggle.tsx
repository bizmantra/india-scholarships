'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export type AdminTheme = 'light' | 'dark';
const STORAGE_KEY = 'admin-theme';

// Runs before React paints, so a light-mode user never sees a dark flash
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.currentScript.parentElement.setAttribute('data-theme',t)}catch(e){}})();`;

function readTheme(): AdminTheme {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* storage blocked: fall back to the system setting */ }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Your choice is remembered on this device; until you choose, the admin follows the system setting
export function useAdminTheme() {
    const [theme, setTheme] = useState<AdminTheme>('dark');
    useEffect(() => { setTheme(readTheme()); }, []);
    const toggle = () => setTheme(t => {
        const next = t === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(STORAGE_KEY, next); } catch { /* not saved; still switches */ }
        return next;
    });
    return { theme, toggle };
}

export function ThemeToggle({ theme, onToggle }: { theme: AdminTheme; onToggle: () => void }) {
    const next = theme === 'dark' ? 'light' : 'dark';
    return (
        <button
            onClick={onToggle}
            aria-label={`Switch to ${next} mode`}
            title={`Switch to ${next} mode`}
            className="rounded-lg border border-cc-border p-2 text-cc-muted transition-colors hover:border-cc-border-strong hover:text-cc-text"
        >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
