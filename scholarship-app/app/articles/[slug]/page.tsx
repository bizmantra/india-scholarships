import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { getScholarshipBySlug } from '@/lib/db';
import { 
  BookOpen, Calendar, Clock, ArrowLeft, CheckCircle2, 
  AlertCircle, ThumbsUp, ThumbsDown, Share2, ShieldCheck, ExternalLink, ListChecks 
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumb Header */}
      <nav className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <Link href="/articles" className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
          <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100 uppercase text-[10px]">
            {article.tag}
          </span>
        </div>
      </nav>

      {/* Article Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium pb-4 border-b border-slate-200">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Updated {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {article.readTime}
            </span>
            <span>By {article.author}</span>
          </div>
        </header>

        {/* Key Takeaways Box */}
        {article.takeaways.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border-l-4 border-indigo-600 rounded-r-xl p-5 mb-8 shadow-sm">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Key Takeaways (Quick Summary)</span>
            </h2>
            <ul className="space-y-2">
              {article.takeaways.map((point, idx) => (
                <li key={idx} className="text-sm text-slate-800 flex items-start gap-2 leading-snug">
                  <span className="font-bold text-indigo-600 shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Article Content */}
        <div 
          className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-headings:text-slate-900"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {/* Interactive Document Checklist (if present) */}
        {article.checklist && article.checklist.length > 0 && (
          <div className="my-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-indigo-600" />
              <span>Document Readiness Checklist</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Check off items as you gather them for your application:</p>
            <div className="space-y-2.5">
              {article.checklist.map((item, idx) => (
                <label key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Related Live Scholarships Cards */}
        {relatedScholarshipsData.length > 0 && (
          <div className="my-10 bg-slate-900 text-white rounded-xl p-6 shadow-md">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Featured Scholarships Mentioned in This Article</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedScholarshipsData.map((sc: any) => (
                <div key={sc.slug} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {sc.state || 'All India'}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2 mb-1 line-clamp-2">
                      {sc.title}
                    </h4>
                    <p className="text-xs text-emerald-400 font-semibold mb-3">
                      ₹{sc.amount_annual ? sc.amount_annual.toLocaleString('en-IN') : 'Amount Varies'}/year
                    </p>
                  </div>
                  <Link
                    href={`/scholarships/${sc.slug}`}
                    className="inline-flex items-center justify-between text-xs font-bold text-indigo-300 hover:text-white pt-2 border-t border-slate-700/60"
                  >
                    <span>View Details & Apply</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1-Click Pulse Poll */}
        <div className="my-8 bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Was this article helpful to you?</p>
          <div className="flex items-center justify-center gap-3">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span>Yes, clear!</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 font-bold text-xs hover:bg-slate-100 transition-colors">
              <ThumbsDown className="w-4 h-4" />
              <span>Need more help</span>
            </button>
          </div>
        </div>

        {/* Bottom Core CTA */}
        <div className="bg-indigo-600 text-white rounded-xl p-6 text-center shadow-md">
          <h3 className="text-lg font-bold mb-2">Find All Scholarships You Qualify For</h3>
          <p className="text-xs text-indigo-100 max-w-md mx-auto mb-4">
            Use our 30-second Eligibility Checker to instantly see matching government and private scholarships based on your income and state.
          </p>
          <Link
            href="/tools/eligibility-checker"
            className="inline-block bg-white text-indigo-900 font-extrabold text-xs px-6 py-3 rounded-lg shadow hover:bg-indigo-50 transition-colors"
          >
            Check Your Eligibility Now
          </Link>
        </div>
      </main>
    </div>
  );
}
