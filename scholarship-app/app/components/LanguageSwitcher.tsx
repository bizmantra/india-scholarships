'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' }
];

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Detect current locale from path (e.g. /bn/scholarships/... -> bn)
    const segments = pathname.split('/');
    const firstSegment = segments[1];
    const currentLocale = LANGUAGES.some(lang => lang.code === firstSegment) ? firstSegment : 'en';
    const currentLanguageName = LANGUAGES.find(lang => lang.code === currentLocale)?.name || 'English';

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (localeCode: string) => {
        setIsOpen(false);
        if (localeCode === currentLocale) return;

        let newPath = '';
        const currentLocaleIsDefault = currentLocale === 'en';
        const targetLocaleIsDefault = localeCode === 'en';
        const pathSegments = segments.filter(seg => seg !== '');

        if (currentLocaleIsDefault) {
            if (targetLocaleIsDefault) {
                newPath = pathname;
            } else {
                newPath = `/${localeCode}/${pathSegments.join('/')}`;
            }
        } else {
            if (targetLocaleIsDefault) {
                newPath = `/${pathSegments.slice(1).join('/')}`;
            } else {
                newPath = `/${localeCode}/${pathSegments.slice(1).join('/')}`;
            }
        }

        router.push(newPath);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all select-none cursor-pointer"
            >
                <Globe className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden sm:inline">{currentLanguageName.split(' ')[0]}</span>
                <span className="sm:hidden uppercase">{currentLocale}</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                currentLocale === lang.code ? 'font-bold text-blue-700 bg-blue-50/30' : 'text-gray-700'
                            }`}
                        >
                            <span>{lang.name}</span>
                            {currentLocale === lang.code && (
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
