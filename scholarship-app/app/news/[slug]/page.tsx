import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getNewsBySlug, getAllNews } from '@/lib/news';
import { getScholarshipBySlug } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
  Bell, Calendar, ChevronRight, CheckCircle2, 
  ShieldCheck, ExternalLink, ThumbsUp, ThumbsDown
} from 'lucide-react';
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
  )).filter(Boolean);

  // Generate relevant category/hub links dynamically
  const uniqueStates = Array.from(new Set(
    relatedScholarshipsData
      .map((sc: any) => sc.state)
      .filter((state: any) => state && state !== 'All India' && state !== 'Multiple States')
  ));

  const categoryHubs: { label: string; href: string }[] = [];
  
  uniqueStates.forEach((state: any) => {
    categoryHubs.push({
      label: `${state} Hub`,
      href: `/scholarships-in/${slugify(state)}`
    });
  });

  const hasGov = relatedScholarshipsData.some((sc: any) => sc.scholarship_type === 'Government' || sc.provider_type === 'Government');
  const hasPrivate = relatedScholarshipsData.some((sc: any) => sc.scholarship_type === 'Private' || sc.provider_type === 'Private');
  const hasIntl = relatedScholarshipsData.some((sc: any) => sc.scholarship_type === 'Study Abroad' || sc.scholarship_scope === 'International');

  if (hasGov) {
    categoryHubs.push({ label: 'Government Scholarships', href: '/government-scholarships' });
  }
  if (hasPrivate) {
    categoryHubs.push({ label: 'Private Scholarships', href: '/private-scholarships' });
  }
  if (hasIntl) {
    categoryHubs.push({ label: 'Study Abroad / International', href: '/scholarships/international' });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    datePublished: news.date,
    dateModified: news.date,
    author: {
      '@type': 'Organization',
      name: news.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'IndiaScholarships',
      url: 'https://www.indiascholarships.in',
    },
    description: news.takeaways[0] || news.title,
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Header />

        {/* Breadcrumb Header */}
        <div className="bg-gray-50 border-b border-gray-100">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <Link href="/news" className="hover:text-google-blue transition-colors">Scholarship News</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">{news.title}</span>
          </nav>
        </div>

        {/* News Detail Main Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-8 border-b border-gray-150 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100 uppercase tracking-wider">
                {news.tag}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
              {news.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Updated {news.date}
              </span>
              <span>By {news.author}</span>
            </div>
          </header>

          {/* Key Takeaways Box */}
          {news.takeaways.length > 0 && (
            <div className="bg-red-50/60 border-l-4 border-red-500 rounded-r-2xl p-6 mb-8 border border-red-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-red-500" />
                <span>Quick Update Summary</span>
              </h2>
              <ul className="space-y-2.5">
                {news.takeaways.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2 leading-relaxed">
                    <span className="font-bold text-red-500 shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main News Content Body */}
          <div 
            className="prose prose-slate max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-google-blue prose-a:font-semibold"
            dangerouslySetInnerHTML={{ __html: news.contentHtml }}
          />

          {/* Related Live Scholarships Cards */}
          {relatedScholarshipsData.length > 0 && (
            <div className="my-10 bg-gray-900 text-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-google-blue" />
                <span>Featured Scholarships Mentioned in This Update</span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedScholarshipsData.map((sc: any) => (
                  <div key={sc.slug} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {sc.state || 'All India'}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2 mb-1 line-clamp-2 leading-snug">
                        {sc.title}
                      </h4>
                      <p className="text-xs text-google-green font-semibold mb-3">
                        ₹{sc.amount_annual ? sc.amount_annual.toLocaleString('en-IN') : 'Amount Varies'}/year
                      </p>
                    </div>
                    <Link
                      href={`/scholarships/${sc.slug}`}
                      className="inline-flex items-center justify-between text-xs font-bold text-blue-300 hover:text-white pt-2.5 border-t border-gray-700/60"
                    >
                      <span>View Scholarship Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Category & State Hubs */}
          {categoryHubs.length > 0 && (
            <div className="my-6 bg-blue-50/40 border border-blue-100/55 rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-google-blue mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-google-blue" />
                <span>Explore Related Scholarship Hubs</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {categoryHubs.map((hub) => (
                  <Link
                    key={hub.href}
                    href={hub.href}
                    className="px-3.5 py-1.5 bg-white hover:bg-blue-50 text-google-blue border border-blue-100 rounded-full text-xs font-semibold transition-colors shadow-sm"
                  >
                    {hub.label} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Help Desk */}
          <div className="my-8 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Is this information up to date?</p>
            <div className="flex items-center justify-center gap-3">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-google-green border border-gray-200 font-bold text-xs hover:border-google-green transition-colors shadow-sm">
                <ThumbsUp className="w-4 h-4" />
                <span>Yes, verified!</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-600 border border-gray-200 font-bold text-xs hover:bg-gray-100 transition-colors shadow-sm">
                <ThumbsDown className="w-4 h-4" />
                <span>Report error</span>
              </button>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="mt-8 pt-6 border-t border-gray-150 flex items-center gap-3 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-google-blue shrink-0" />
            <span>Official Government Portal Source Reference. Verified via search grounding.</span>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
