import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getNewsBySlug, getAllNews } from '@/lib/news';
import { getScholarshipBySlug } from '@/lib/db';
import { getPillarForScholarship } from '@/lib/pillars';
import { newsToEditorial } from '@/lib/editorial';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import EditorialTemplate from '@/app/components/EditorialTemplate';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface NewsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const newsList = getAllNews();
  return newsList.map((news) => ({
    slug: news.slug,
  }));
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = getNewsBySlug(slug);

  if (!news) {
    return {
      title: 'News Not Found | IndiaScholarships.in',
    };
  }

  return {
    title: `${news.title} | IndiaScholarships.in`,
    description: news.takeaways[0] || `Official update regarding ${news.title}.`,
    alternates: {
      canonical: `https://www.indiascholarships.in/news/${news.slug}`,
    },
  };
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const news = getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  // Fetch live related scholarship cards from SQLite DB
  const relatedScholarshipsData = (await Promise.all(
    news.relatedScholarships.map((sSlug) => getScholarshipBySlug(sSlug))
  )).filter(Boolean) as any[];

  // Generate relevant category/hub links dynamically
  const uniqueStates = Array.from(new Set(
    relatedScholarshipsData
      .map((sc: any) => sc.state)
      .filter((state: any) => state && state !== 'All India' && state !== 'Multiple States')
  ));

  const categoryHubs: { label: string; href: string }[] = [];

  uniqueStates.forEach((state: any) => {
    categoryHubs.push({ label: `${state} Hub`, href: `/scholarships-in/${slugify(state)}` });
  });

  const hasGov = relatedScholarshipsData.some((sc: any) => sc.scholarship_type === 'Government' || sc.provider_type === 'Government');
  const hasPrivate = relatedScholarshipsData.some((sc: any) => sc.scholarship_type === 'Private' || sc.provider_type === 'Private');
  const hasIntl = relatedScholarshipsData.some((sc: any) => sc.scholarship_type === 'Study Abroad' || sc.scholarship_scope === 'International');

  if (hasGov) categoryHubs.push({ label: 'Government Scholarships', href: '/government-scholarships' });
  if (hasPrivate) categoryHubs.push({ label: 'Private Scholarships', href: '/private-scholarships' });
  if (hasIntl) categoryHubs.push({ label: 'Study Abroad / International', href: '/scholarships/international' });

  // Broader-context pillar, resolved from the same scholarships the news update
  // is already about — only shown when the change is state/scheme-wide.
  const bestFitPillar = relatedScholarshipsData.length > 0
    ? getPillarForScholarship(relatedScholarshipsData[0] as any)
    : null;

  const editorialContent = newsToEditorial(news);
  editorialContent.hubLinks = categoryHubs.length > 0 ? categoryHubs : undefined;
  editorialContent.featuredScholarships = relatedScholarshipsData.length > 0
    ? relatedScholarshipsData.map((sc) => ({
        title: sc.title,
        href: `/scholarships/${sc.slug}`,
        amount: sc.amount_annual ? `₹${sc.amount_annual.toLocaleString('en-IN')}/yr` : undefined,
        meta: sc.state || 'All India',
      }))
    : undefined;
  editorialContent.relatedGuides = bestFitPillar
    ? [{ title: bestFitPillar.title, href: `/guides/${bestFitPillar.slug}`, meta: 'Full guide' }]
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    datePublished: news.date,
    dateModified: news.date,
    author: { '@type': 'Organization', name: news.author },
    publisher: { '@type': 'Organization', name: 'IndiaScholarships', url: 'https://www.indiascholarships.in' },
    description: news.takeaways[0] || news.title,
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />

      <EditorialTemplate
        content={editorialContent}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'News', href: '/news' },
          { label: news.title },
        ]}
      />

      {/* Feedback widget — special-cased, not a schema field (no backend to persist it yet) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-10">
        <div className="border border-gray-200 rounded-md p-5 text-center">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Is this information up to date?</p>
          <div className="flex items-center justify-center gap-3">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border border-gray-200 text-gray-700 font-bold text-xs hover:border-google-blue hover:text-google-blue transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span>Yes, verified</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border border-gray-200 text-gray-700 font-bold text-xs hover:border-google-blue hover:text-google-blue transition-colors">
              <ThumbsDown className="w-4 h-4" />
              <span>Report error</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
