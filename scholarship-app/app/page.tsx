import { getAllScholarships } from '@/lib/db';
import HomeClient from './HomeClient';

export default function Home() {
  const scholarships = getAllScholarships();

  return <HomeClient scholarships={scholarships} />;
}
