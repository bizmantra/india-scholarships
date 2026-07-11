import { 
  getRecentlyAddedScholarships, 
  getClosingSoonScholarships, 
  getTrendingScholarships,
  getScholarshipStats
} from '@/lib/db';
import HomeClient from '../HomeClient';

// Pre-render static params for localized landing pages
export async function generateStaticParams() {
    return [
        { locale: 'hi' },
        { locale: 'bn' },
        { locale: 'ta' },
        { locale: 'te' },
        { locale: 'or' },
        { locale: 'kn' }
    ];
}

export default async function LocalizedHome() {
  const [recentlyAdded, closingSoon, trending, stats] = await Promise.all([
    getRecentlyAddedScholarships(6),
    getClosingSoonScholarships(6),
    getTrendingScholarships(6),
    getScholarshipStats()
  ]);

  return (
    <HomeClient 
      recentlyAdded={recentlyAdded} 
      closingSoon={closingSoon} 
      trending={trending}
      totalStates={stats.stateCount}
      totalScholarships={stats.total}
    />
  );
}
