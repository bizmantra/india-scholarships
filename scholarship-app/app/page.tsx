import { getAllScholarships } from '@/lib/db';
import HomeClient from './HomeClient';

export default async function Home() {
  const scholarships = await getAllScholarships();

  return <HomeClient scholarships={scholarships} />;
}
