import { 
  getRecentlyAddedScholarships, 
  getClosingSoonScholarships, 
  getTrendingScholarships,
  getScholarshipStats
} from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
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

