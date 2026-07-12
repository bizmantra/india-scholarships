'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Info, X } from 'lucide-react';

const LOCALE_PROMPTS: Record<string, { label: string, btnText: string, pathPrefix: string }> = {
    'hi': { label: 'यह पेज हिंदी में भी उपलब्ध है।', btnText: 'हिंदी में पढ़ें', pathPrefix: 'hi' },
    'bn': { label: 'এই পেজটি বাংলাতেও উপলব্ধ রয়েছে।', btnText: 'বাংলায় পড়ুন', pathPrefix: 'bn' },
    'ta': { label: 'இந்தப் பக்கம் தமிழிலும் கிடைக்கிறது।', btnText: 'தமிழில் படிக்க', pathPrefix: 'ta' },
    'te': { label: 'ఈ పేజీ తెలుగులో కూడా అందుబాటులో ఉంది।', btnText: 'తెలుగులో చదవండి', pathPrefix: 'te' },
    'or': { label: 'ଏହି ପୃଷ୍ଠା ଓଡ଼ିଆରେ ମଧ୍ୟ ଉପଲବ୍ଧ ଅଛି।', btnText: 'ଓଡ଼ିଆରେ ପଢ଼ନ୍ତು', pathPrefix: 'or' },
    'kn': { label: 'ಈ ಪುಟವು ಕನ್ನಡದಲ್ಲೂ ಲಭ್ಯವಿದೆ।', btnText: 'ಕನ್ನಡದಲ್ಲಿ ಓದಿ', pathPrefix: 'kn' }
};

export default function LanguageDetector({ slug }: { slug: string }) {
    return null;
    const [prompt, setPrompt] = useState<{ label: string, btnText: string, pathPrefix: string } | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check local storage to see if user dismissed it already
        const isDismissed = localStorage.getItem(`lang_detect_dismissed_${slug}`);
        if (isDismissed) {
            setDismissed(true);
            return;
        }

        // Get browser language (e.g. "hi-IN", "bn-IN")
        const browserLang = navigator.language || '';
        const langCode = browserLang.split('-')[0].toLowerCase();

        if (LOCALE_PROMPTS[langCode]) {
            setPrompt(LOCALE_PROMPTS[langCode]);
        }
    }, [slug]);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(`lang_detect_dismissed_${slug}`, 'true');
    };

    if (dismissed || !prompt) return null;

    return (
        <div className="bg-blue-50 border-b border-blue-100 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-sm text-blue-800">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">
                        {prompt.label}
                    </span>
                    <Link
                        href={`/${prompt.pathPrefix}/scholarships/${slug}`}
                        className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                        {prompt.btnText}
                    </Link>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-blue-100 rounded-lg text-blue-500 hover:text-blue-700 transition-colors"
                    aria-label="Dismiss language notice"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
