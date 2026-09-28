'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

const KIT_FORM_UID = process.env.NEXT_PUBLIC_KIT_FORM_UID;
const KIT_FORM_SRC = process.env.NEXT_PUBLIC_KIT_FORM_SRC;
const HIDDEN_PREFIXES = ['/admin', '/api', '/assistant'];

// Loads the Kit email popup. Design and when-to-show rules are set in Kit.
export default function KitPopup() {
    const pathname = usePathname() || '';

    if (!KIT_FORM_UID || !KIT_FORM_SRC) return null;
    if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

    return <Script id="kit-popup" strategy="lazyOnload" src={KIT_FORM_SRC} data-uid={KIT_FORM_UID} />;
}
