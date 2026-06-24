'use client';

import { useState, useEffect } from 'react';
import { Bell, ExternalLink } from 'lucide-react';

interface MobileStickyCTAProps {
    title: string;
    amount: string;
    applyUrl: string;
    isClosed: boolean;
    slug: string;
}

export default function MobileStickyCTA({ title, amount, applyUrl, isClosed, slug }: MobileStickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show when scrolled past 250px
            if (window.scrollY > 250) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAction = (e: React.MouseEvent) => {
        if (isClosed) {
            e.preventDefault();
            // Scroll to similar opportunities / subscription card
            const element = document.getElementById('similar-opportunities');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out lg:hidden ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
            }`}
        >
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate leading-tight">{title}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs font-black text-emerald-600">{amount}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">• {isClosed ? 'Closed' : 'Active'}</span>
                    </div>
                </div>

                {isClosed ? (
                    <button
                        onClick={handleAction}
                        className="flex-shrink-0 px-5 py-3 bg-slate-800 text-white font-extrabold text-xs rounded-xl hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                        <Bell className="h-3.5 w-3.5" />
                        Get Alerted
                    </button>
                ) : (
                    applyUrl ? (
                        <a
                            href={applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 px-5 py-3 bg-blue-600 text-white font-extrabold text-xs rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                        >
                            Apply Now
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    ) : (
                        <button
                            disabled
                            className="flex-shrink-0 px-5 py-3 bg-gray-200 text-gray-400 font-extrabold text-xs rounded-xl cursor-not-allowed"
                        >
                            Closed
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
