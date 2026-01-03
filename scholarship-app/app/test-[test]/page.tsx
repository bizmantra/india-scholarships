import { notFound } from 'next/navigation';

export function generateStaticParams() {
    return [
        { test: 'hello' },
        { test: 'world' },
    ];
}

export default async function TestPage({ params }: { params: Promise<{ test: string }> }) {
    const { test } = await params;

    return (
        <div>
            <h1>Test Page: {test}</h1>
            <p>If you see this, dynamic routes are working!</p>
        </div>
    );
}
