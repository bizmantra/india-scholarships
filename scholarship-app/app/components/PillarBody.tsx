"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ListChecks, HelpCircle } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Faq {
  q: string;
  a: string;
}

interface PillarBodyProps {
  contentHtml: string;
  headings: Heading[];
  faqs: Faq[];
  checklist: string[];
}

// A trimmed sibling of InteractiveArticleBody, for pillar/authority guides
// rather than blog-style how-to articles. Keeps the TOC, checklist and FAQ
// mechanics (still useful here) but drops the stats-report framing that
// doesn't fit a topic guide: no "Save Report as PDF", no citation-copy box
// hardcoded to /articles/ URLs, no "verify these statistics" copy.
export default function PillarBody({ contentHtml, headings, faqs, checklist }: PillarBodyProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
      let currentActive = '';
      for (const el of headingElements) {
        if (el && el.getBoundingClientRect().top <= 120) {
          currentActive = el.id;
        }
      }
      if (currentActive) setActiveHeading(currentActive);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative my-6">
      <style jsx global>{`
        @media print {
          header, footer, nav, aside, button, .print\\:hidden, #pillar-toc-sidebar {
            display: none !important;
          }
          main {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Sticky TOC Sidebar */}
      {headings.length > 0 && (
        <aside id="pillar-toc-sidebar" className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[80vh] overflow-y-auto scrollbar-thin pr-4 border-r border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">In This Guide</span>
          <nav className="space-y-2">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block text-xs font-semibold leading-relaxed transition-all pl-2.5 border-l-2 hover:text-indigo-600 ${
                  activeHeading === h.id
                    ? 'text-indigo-600 border-indigo-600 font-bold'
                    : 'text-slate-500 border-transparent hover:border-slate-300'
                } ${h.level === 3 ? 'ml-3' : ''}`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
      )}

      <div className="w-full flex-1 min-w-0">
        <div
          className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-indigo-600 prose-a:font-semibold"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {checklist.length > 0 && (
          <div className="my-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 print:page-break-inside-avoid">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-indigo-600" />
              <span>Documents Checklist</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Check off items as you gather them:</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {checklist.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-colors cursor-pointer print:border-slate-300"
                >
                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 print:hidden" />
                  <span className="text-xs font-semibold text-slate-800 leading-normal">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {faqs.length > 0 && (
          <div id="faq-section" className="my-10 scroll-mt-24 border-t border-slate-150 pt-8 print:page-break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-indigo-600" />
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
                      className={`w-4 h-4 text-slate-400 transition-transform print:hidden ${openFaqs.includes(idx) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`${openFaqs.includes(idx) ? 'block' : 'hidden'} print:block px-5 py-3.5 border-t border-slate-200 bg-white text-xs text-slate-650 leading-relaxed`}
                  >
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
