import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllArticles } from '@/lib/articles';
import { BookOpen, Search, ArrowRight, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Scholarship Guides & Articles | IndiaScholarships.in',
  description: 'Simple, step-by-step scholarship application guides, eligibility rules, and document checklists for Indian students.',
  alternates: {
    canonical: 'https://www.indiascholarships.in/articles'
  }
};

export default function ArticlesIndexPage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Header */}
      <section className="bg-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-indigo-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-700">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Editorial Help Guides</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Simple Scholarship Guides for Indian Students
          </h1>
          <p className="text-base sm:text-lg text-indigo-200 max-w-2xl mx-auto font-normal">
            No complicated jargon. Clear step-by-step instructions, document checklists, and eligibility decoders written in simple English.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Topic Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-slate-200 mb-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Topics:</span>
          {['All Guides', 'State Guides', 'Category & Income', 'Course & Degree', 'Corporate & CSR', 'Procedural & Docs'].map((tag, idx) => (
            <button
              key={tag}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                idx === 0
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      <Tag className="w-3 h-3" />
                      {article.tag}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{article.readTime}</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 leading-snug mb-3 hover:text-indigo-600 transition-colors">
                    <Link href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  {article.takeaways.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Key Takeaway
                      </p>
                      <p className="text-xs text-slate-700 line-clamp-2">
                        {article.takeaways[0]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-800">
                  <Link href={`/articles/${article.slug}`} className="flex items-center gap-1">
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-slate-400 font-normal">{article.date}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* E-E-A-T Trust Footer Banner */}
        <div className="mt-12 bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950">Verified Official Information</h3>
              <p className="text-xs text-indigo-700">All guides are cross-checked against official government state portals and NSP guidelines.</p>
            </div>
          </div>
          <Link
            href="/tools/eligibility-checker"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shrink-0 transition-colors shadow-sm"
          >
            Check Your Eligibility
          </Link>
        </div>
      </main>
    </div>
  );
}
