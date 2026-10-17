'use client';

import { useEffect } from 'react';

interface AnalyticsWindow extends Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
}

export default function ProviderClickTracker() {
    useEffect(() => {
        const trackClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return;
            const link = event.target.closest<HTMLAnchorElement>('a[href]');
            if (!link) return;
            const destination = new URL(link.href, window.location.href);
            if (destination.origin !== window.location.origin) return;
            const provider = destination.pathname.match(/^\/study-abroad\/out\/([a-z0-9-]+)\/?$/);
            if (!provider) return;
            (window as AnalyticsWindow).gtag?.('event', 'provider_click', {
                provider_id: provider[1],
                source_page: window.location.pathname,
            });
        };
        document.addEventListener('click', trackClick);
        return () => document.removeEventListener('click', trackClick);
    }, []);

    return null;
}
