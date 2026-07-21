import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllArticles } from '@/lib/articles';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { BookOpen, ArrowRight, CheckCircle2, ShieldCheck, Tag, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <div>
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-gray-50 border-b border-gray-100">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900 font-medium">Articles & Guides</span>
          </nav>
        </div>

        {/* Hero Banner Header */}
        <section className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-150">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-google-blue text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Student Help & Application Guides</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Scholarship Application Guides
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Step-by-step instructions, document checklists, and eligibility decoders written in simple, clear English for Tier-2 & Tier-3 students across India.
            </p>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Topic Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-gray-100 mb-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 shrink-0">Topics:</span>
            {['All Guides', 'State Guides', 'Category & Income', 'Course & Degree', 'Corporate & CSR', 'Procedural & Docs'].map((tag, idx) => (
              <button
                key={tag}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  idx === 0
                    ? 'bg-google-blue text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {articles.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
              <p className="text-gray-500 font-medium text-sm">No articles published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <article
                  key={article.slug}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-google-blue transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-google-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        <Tag className="w-3 h-3" />
                        {article.tag}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{article.readTime}</span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 leading-snug mb-3 hover:text-google-blue transition-colors">
                      <Link href={`/articles/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>

                    {article.takeaways.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-2">
                        <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-google-green" />
                          Key Takeaway
                        </p>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                          {article.takeaways[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-google-blue">
                    <Link href={`/articles/${article.slug}`} className="flex items-center gap-1 hover:underline">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-gray-400 font-normal">{article.date}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Verification Badge */}
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-google-blue flex items-center justify-center shrink-0 border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Verified & Fact-Checked Information</h3>
              <p className="text-xs text-gray-600 mt-0.5">All guides are cross-checked against official state scholarship portals, NSP guidelines, and government notifications.</p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
