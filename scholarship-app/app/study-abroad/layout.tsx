import type { ReactNode } from 'react';
import ProviderClickTracker from './_components/ProviderClickTracker';

export default function StudyAbroadLayout({ children }: { children: ReactNode }) {
    return <><ProviderClickTracker />{children}</>;
}
