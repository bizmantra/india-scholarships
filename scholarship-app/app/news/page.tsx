import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllNews } from '@/lib/news';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Bell, ArrowRight, CheckCircle2, ShieldCheck, Tag, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Scholarship News & Portal Updates | IndiaScholarships.in',
  description: 'Stay updated with live news, portal registration status, deadline extensions, and notification releases for Indian scholarships.',
  alternates: {
    canonical: 'https://www.indiascholarships.in/news'
  }
};

export default function NewsIndexPage() {
  const newsList = getAllNews();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <div>
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-gray-50 border-b border-gray-100">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900 font-medium">Scholarship News & Updates</span>
          </nav>
        </div>

        {/* Hero Banner Header */}
        <section className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-150">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-3 border border-red-100 animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              <span>Live Updates & Announcements</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Scholarship News & Portal Updates
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Real-time updates on deadline extensions, server status alerts, new scheme launches, and disbursement updates across central (NSP) and state portals.
            </p>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* News Cards Grid */}
          {newsList.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
              <p className="text-gray-500 font-medium text-sm">No news updates published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {newsList.map((news) => (
                <article
                  key={news.slug}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-google-blue transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                        <Tag className="w-3 h-3" />
                        {news.tag}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{news.date}</span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 leading-snug mb-3 hover:text-google-blue transition-colors">
                      <Link href={`/news/${news.slug}`}>
                        {news.title}
                      </Link>
                    </h2>

                    {news.takeaways.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-2">
                        <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-google-green" />
                          Key Takeaway
                        </p>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                          {news.takeaways[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-google-blue">
                    <Link href={`/news/${news.slug}`} className="flex items-center gap-1 hover:underline">
                      <span>View Updates</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
              <h3 className="text-sm font-bold text-gray-900">Verified by IndiaScholarships Curation Engine</h3>
              <p className="text-xs text-gray-600 mt-0.5">All news alerts are parsed from Google News, cross-referenced with official state and central ministry notices, and curated by AI models under human supervision.</p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
