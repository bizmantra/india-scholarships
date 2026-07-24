"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Link2, Printer, ChevronDown, CheckCircle2, ListChecks, HelpCircle } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Stat {
  label: string;
  value: string;
}

interface Faq {
  q: string;
  a: string;
}

interface InteractiveArticleBodyProps {
  slug: string;
  title: string;
  contentHtml: string;
  headings: Heading[];
  featuredStats: Stat[];
  faqs: Faq[];
  checklist: string[];
}

export default function InteractiveArticleBody({
  slug,
  title,
  contentHtml,
  headings,
  featuredStats,
  faqs,
  checklist
}: InteractiveArticleBodyProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const toggleFaq = (idx: number) => {
    if (openFaqs.includes(idx)) {
      setOpenFaqs(openFaqs.filter(i => i !== idx));
    } else {
      setOpenFaqs([...openFaqs, idx]);
    }
  };

  const copyStat = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyRefText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Scroll spy to highlight current active heading in TOC sidebar
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      let currentActive = '';

      for (const el of headingElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            currentActive = el.id;
          }
        }
      }

      if (currentActive) {
        setActiveHeading(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative my-6">
      
      {/* Dynamic styling override for printing paper PDFs */}
      <style jsx global>{`
        @media print {
          header, footer, nav, aside, button, .print\\:hidden, #toc-sidebar {
            display: none !important;
          }
          main, #article-main-content {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          table {
            page-break-inside: avoid !important;
          }
          h2, h3 {
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* Sticky TOC Sidebar (Hidden on print & mobile screens) */}
      {headings.length > 0 && (
        <aside id="toc-sidebar" className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[80vh] overflow-y-auto scrollbar-thin pr-4 border-r border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">On This Page</span>
          <nav className="space-y-2">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block text-xs font-semibold leading-relaxed transition-all pl-2.5 border-l-2 hover:text-google-blue ${
                  activeHeading === h.id
                    ? 'text-google-blue border-google-blue font-bold'
                    : 'text-slate-500 border-transparent hover:border-slate-300'
                } ${h.level === 3 ? 'ml-3' : ''}`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content Pane */}
      <div id="article-main-content" className="w-full flex-1 min-w-0">
        
        {/* PDF Print Download Row */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 print:hidden">
          <span className="text-xs text-slate-500">Official Database Statistics Guide</span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-google-blue hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save Report as PDF</span>
          </button>
        </div>

        {/* Branded Header ONLY visible on print outputs */}
        <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-black tracking-tight text-slate-900">IndiaScholarships.in</span>
            <span className="text-xs text-slate-500">Official Stat Report (FY 2025-2026)</span>
          </div>
        </div>

        {/* Featured Topline Metrics Cards Row */}
        {featuredStats.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8 print:grid-cols-3">
            {featuredStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative group hover:border-google-blue transition-all print:border-slate-300"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {stat.value}
                </span>
                
                <button
                  onClick={() => copyStat(`According to IndiaScholarships.in, ${stat.label} is ${stat.value}.`, idx)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-google-blue opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-slate-200/50 print:hidden"
                  title="Copy Citation"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedIndex === idx && (
                  <span className="absolute top-3 right-9 text-[10px] font-bold text-google-green bg-green-50 px-1.5 py-0.5 rounded border border-green-200 animate-pulse print:hidden">
                    Copied!
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Parsed Markdown Body HTML */}
        <div
          className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-google-blue prose-a:font-semibold"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Document Readiness Checklist Component */}
        {checklist.length > 0 && (
          <div className="my-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 print:page-break-inside-avoid">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-google-blue" />
              <span>Reference Document Readiness Checklist</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Check off items as you gather documents to verify these statistics:</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {checklist.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-google-blue transition-colors cursor-pointer print:border-slate-300"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-google-blue focus:ring-google-blue print:hidden"
                  />
                  <span className="text-xs font-semibold text-slate-800 leading-normal">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Interactive FAQ Collapsible Accordions */}
        {faqs.length > 0 && (
          <div className="my-10 border-t border-slate-150 pt-8 print:page-break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-google-blue" />
              <span>Frequently Asked Questions (FAQ)</span>
            </h3>
            <div className="space-y-3.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 print:border-slate-300">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex items-center justify-between w-full px-5 py-3.5 text-left font-bold text-xs text-slate-800 hover:bg-slate-100/50 transition-colors print:pointer-events-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform print:hidden ${
                        openFaqs.includes(idx) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`${
                      openFaqs.includes(idx) ? 'block' : 'hidden'
                    } print:block px-5 py-3.5 border-t border-slate-200 bg-white text-xs text-slate-650 leading-relaxed`}
                  >
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference & Citation Box Footer */}
        <div className="my-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 print:hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
            <Link2 className="w-4.5 h-4.5 text-google-blue" />
            <span>Reference This Article</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Copy the pre-formatted links and citation details below to reference these statistics in your website, news article, or blog post:
          </p>
          <div className="space-y-4">
            
            {/* Plain Link Copy */}
            <div>
              <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Copy Link URL</span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`https://www.indiascholarships.in/articles/${slug}`}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono w-full text-slate-700 select-all focus:outline-none"
                />
                <button
                  onClick={() => copyRefText(`https://www.indiascholarships.in/articles/${slug}`, 'link')}
                  className="bg-white border border-slate-200 hover:border-google-blue px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'link' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Standard Text Citation Copy */}
            <div>
              <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Standard Citation Reference</span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`IndiaScholarships Editorial Team. "${title} (2025-2026)". IndiaScholarships.in, July 2026. Available at: https://www.indiascholarships.in/articles/${slug}`}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs w-full text-slate-700 select-all focus:outline-none"
                />
                <button
                  onClick={() => copyRefText(`IndiaScholarships Editorial Team. "${title} (2025-2026)". IndiaScholarships.in, July 2026. Available at: https://www.indiascholarships.in/articles/${slug}`, 'citation')}
                  className="bg-white border border-slate-200 hover:border-google-blue px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'citation' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
