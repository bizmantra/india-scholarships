'use client';

import BacklogPageClient from './BacklogPageClient';

export default function BacklogPage({ searchParams }: { searchParams: any }) {
  // Reference searchParams to opt-out of static prerendering
  const forceDynamic = searchParams?.type;
  return <BacklogPageClient />;
}
