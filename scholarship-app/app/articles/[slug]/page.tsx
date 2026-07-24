import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { getScholarshipBySlug } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
  BookOpen, Calendar, Clock, ChevronRight, CheckCircle2 
} from 'lucide-react';
import UpStatusDecoder from '@/app/components/UpStatusDecoder';
import InteractiveArticleBody from '@/app/components/InteractiveArticleBody';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | IndiaScholarships.in',
    };
  }

  return {
    title: article.seoTitle ? `${article.seoTitle} | IndiaScholarships.in` : `${article.title} | IndiaScholarships.in`,
    description: article.seoDescription || article.takeaways[0] || `Step-by-step guide on ${article.title} for Indian students.`,
    alternates: {
      canonical: `https://www.indiascholarships.in/articles/${article.slug}`,
    },
    openGraph: {
      images: [
        {
          url: slug === 'india-scholarships-statistics-2025-2026' 
            ? 'https://www.indiascholarships.in/images/stats-report-featured.svg'
            : 'https://www.indiascholarships.in/images/logo-is.png',
          width: 1200,
          height: 630,
          alt: article.title
        }
      ]
    }
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Fetch live scholarship cards from SQLite DB
  const relatedScholarshipsData = (await Promise.all(
    article.relatedScholarships.map((sSlug) => getScholarshipBySlug(sSlug))
  )).filter(Boolean);

  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      datePublished: article.date,
      dateModified: article.date,
      author: {
        '@type': 'Organization',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'IndiaScholarships',
        url: 'https://www.indiascholarships.in',
      },
      description: article.takeaways[0] || article.title,
    }
  ];

  if (article.faqs && article.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a
        }
      }))
    });
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <div>
        <Header />

        {/* Breadcrumb Header */}
        <div className="bg-gray-50 border-b border-gray-100 print:hidden">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <Link href="/articles" className="hover:text-google-blue transition-colors">Articles & Guides</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">{article.title}</span>
          </nav>
        </div>

        {/* Article Main Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-0">
          <header className="mb-8 border-b border-gray-150 pb-6 print:pb-2 print:mb-4">
            <div className="flex items-center gap-2 mb-3 print:hidden">
              <span className="px-3 py-1 bg-blue-50 text-google-blue text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                {article.tag}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight print:text-2xl print:mb-2">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400 print:hidden" />
                Updated {article.date}
              </span>
              <span className="flex items-center gap-1.5 print:hidden">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {article.readTime}
              </span>
              <span>By {article.author}</span>
            </div>
          </header>

          {/* Featured Image Cover Banner */}
          {slug === 'india-scholarships-statistics-2025-2026' && (
            <div className="relative w-full aspect-[1200/630] rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-8 print:hidden">
              <img 
                src="/images/stats-report-featured.svg" 
                alt={article.title} 
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Key Takeaways Box (Frontmatter summary callout) */}
          {article.takeaways.length > 0 && (
            <div className="bg-blue-50/60 border-l-4 border-google-blue rounded-r-2xl p-6 mb-8 border border-blue-100 print:border-l-4 print:border-blue-500 print:bg-white print:p-4 print:mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-google-blue mb-3 flex items-center gap-1.5 print:text-blue-600 print:mb-2">
                <CheckCircle2 className="w-4 h-4 text-google-blue print:hidden" />
                <span>Key Takeaways (Quick Summary)</span>
              </h2>
              <ul className="space-y-2.5">
                {article.takeaways.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2 leading-relaxed print:text-xs">
                    <span className="font-bold text-google-blue shrink-0 print:text-blue-500">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Responsive Layout wrapper (Sidebar TOC, Interactive Tables/Stats/Print) */}
          <InteractiveArticleBody
            slug={article.slug}
            title={article.title}
            contentHtml={article.contentHtml}
            headings={article.headings}
            featuredStats={article.featuredStats || []}
            faqs={article.faqs || []}
            checklist={article.checklist || []}
          />

          {/* UP Status Decoder (Specific widget) */}
          {slug === 'up-scholarship-status-check-2026' && (
            <div className="my-8 print:hidden">
              <UpStatusDecoder />
            </div>
          )}

          {/* Related Live Scholarships Cards */}
          {relatedScholarshipsData.length > 0 && (
            <div className="my-10 bg-gray-900 text-white rounded-2xl p-6 shadow-sm print:page-break-inside-avoid print:bg-white print:text-black print:border print:border-gray-300 print:p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-4 flex items-center gap-2 print:text-slate-800 print:border-b print:pb-2">
                <BookOpen className="w-4 h-4 text-google-blue print:hidden" />
                <span>Featured Scholarships Mentioned in This Guide</span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
                {relatedScholarshipsData.map((sc: any) => (
                  <div key={sc.slug} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col justify-between print:bg-white print:border-gray-300">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 print:border-gray-400 print:text-slate-700 print:bg-slate-100">
                        {sc.state || 'All India'}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2 mb-1 line-clamp-2 leading-snug print:text-slate-900">
                        {sc.title}
                      </h4>
                      <p className="text-xs text-google-green font-semibold mb-3 print:text-green-700">
                        ₹{sc.amount_annual ? sc.amount_annual.toLocaleString('en-IN') : 'Amount Varies'}/year
                      </p>
                    </div>
                    <Link
                      href={`/scholarships/${sc.slug}`}
                      className="inline-flex items-center justify-between text-xs font-bold text-blue-300 hover:text-white pt-2.5 border-t border-gray-700/60 print:hidden"
                    >
                      <span>View Scholarship Details</span>
                      <span className="shrink-0">→</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1-Click Pulse Poll */}
          <div className="my-8 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center print:hidden">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Was this guide helpful to you?</p>
            <div className="flex items-center justify-center gap-3">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-google-green border border-gray-200 font-bold text-xs hover:border-google-green transition-colors shadow-sm">
                <span>Yes, clear!</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-600 border border-gray-200 font-bold text-xs hover:bg-gray-100 transition-colors shadow-sm">
                <span>Need more details</span>
              </button>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="mt-8 pt-6 border-t border-gray-150 flex items-center gap-3 text-xs text-gray-500 print:mt-4 print:pt-2">
            <span>Official Government Portal Source Reference. Information cross-checked with state guidelines.</span>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
