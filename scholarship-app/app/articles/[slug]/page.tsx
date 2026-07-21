import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { getScholarshipBySlug } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
  BookOpen, Calendar, Clock, ChevronRight, CheckCircle2, 
  ThumbsUp, ThumbsDown, ShieldCheck, ExternalLink, ListChecks 
} from 'lucide-react';

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
    title: `${article.title} | IndiaScholarships.in`,
    description: article.takeaways[0] || `Step-by-step guide on ${article.title} for Indian students.`,
    alternates: {
      canonical: `https://www.indiascholarships.in/articles/${article.slug}`,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Fetch live scholarship cards from SQLite DB
  const relatedScholarshipsData = article.relatedScholarships
    .map((sSlug) => getScholarshipBySlug(sSlug))
    .filter(Boolean);

  const jsonLd = {
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
            <Link href="/articles" className="hover:text-google-blue transition-colors">Articles & Guides</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">{article.title}</span>
          </nav>
        </div>

        {/* Article Main Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-8 border-b border-gray-150 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-50 text-google-blue text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                {article.tag}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Updated {article.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {article.readTime}
              </span>
              <span>By {article.author}</span>
            </div>
          </header>

          {/* Key Takeaways Box */}
          {article.takeaways.length > 0 && (
            <div className="bg-blue-50/60 border-l-4 border-google-blue rounded-r-2xl p-6 mb-8 border border-blue-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-google-blue mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-google-blue" />
                <span>Key Takeaways (Quick Summary)</span>
              </h2>
              <ul className="space-y-2.5">
                {article.takeaways.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2 leading-relaxed">
                    <span className="font-bold text-google-blue shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Article Body */}
          <div 
            className="prose prose-slate max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-google-blue prose-a:font-semibold"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Interactive Document Checklist (if present) */}
          {article.checklist && article.checklist.length > 0 && (
            <div className="my-10 bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-google-blue" />
                <span>Document Readiness Checklist</span>
              </h3>
              <p className="text-xs text-gray-500 mb-4">Check off items as you gather them for your application:</p>
              <div className="space-y-2.5">
                {article.checklist.map((item, idx) => (
                  <label key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-google-blue transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-google-blue focus:ring-google-blue" />
                    <span className="text-sm font-medium text-gray-800">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Related Live Scholarships Cards */}
          {relatedScholarshipsData.length > 0 && (
            <div className="my-10 bg-gray-900 text-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-google-blue" />
                <span>Featured Scholarships Mentioned in This Guide</span>
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

          {/* 1-Click Pulse Poll */}
          <div className="my-8 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Was this guide helpful to you?</p>
            <div className="flex items-center justify-center gap-3">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-google-green border border-gray-200 font-bold text-xs hover:border-google-green transition-colors shadow-sm">
                <ThumbsUp className="w-4 h-4" />
                <span>Yes, clear!</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-600 border border-gray-200 font-bold text-xs hover:bg-gray-100 transition-colors shadow-sm">
                <ThumbsDown className="w-4 h-4" />
                <span>Need more details</span>
              </button>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="mt-8 pt-6 border-t border-gray-150 flex items-center gap-3 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-google-blue shrink-0" />
            <span>Official Government Portal Source Reference. Information cross-checked with state guidelines.</span>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
