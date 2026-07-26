import {
  getRecentlyAddedScholarships,
  getClosingSoonScholarships,
  getTrendingScholarships,
  getScholarshipStats
} from '@/lib/db';
import { getFeaturedPillars } from '@/lib/pillars';
import HomeClient from './HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.indiascholarships.in',
    languages: {
      'x-default': 'https://www.indiascholarships.in',
      'en': 'https://www.indiascholarships.in',
      'hi': 'https://www.indiascholarships.in/hi',
      'bn': 'https://www.indiascholarships.in/bn',
      'ta': 'https://www.indiascholarships.in/ta',
      'te': 'https://www.indiascholarships.in/te',
      'or': 'https://www.indiascholarships.in/or',
      'kn': 'https://www.indiascholarships.in/kn',
    }
  }
};


export default async function Home() {
  const [recentlyAdded, closingSoon, trending, stats] = await Promise.all([
    getRecentlyAddedScholarships(6),
    getClosingSoonScholarships(6),
    getTrendingScholarships(6),
    getScholarshipStats()
  ]);
  const featuredPillars = getFeaturedPillars(6);

  return (
    <HomeClient
      recentlyAdded={recentlyAdded}
      closingSoon={closingSoon}
      trending={trending}
      totalStates={stats.stateCount}
      totalScholarships={stats.total}
      featuredPillars={featuredPillars.map((p) => ({ title: p.title, slug: p.slug }))}
    />
  );
}

