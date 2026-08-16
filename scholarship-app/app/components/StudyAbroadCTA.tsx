import React from 'react';
import { ArrowRight, Globe } from 'lucide-react';

export default function StudyAbroadCTA() {
  return (
    <div className="my-10 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-6 md:p-8 text-white shadow-lg relative group">
      {/* Decorative glowing background gradients */}
      <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
      <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 animate-spin-slow shrink-0" />
            Study Abroad Opportunity
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight font-heading text-white">
            Planning to study abroad instead?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
            Calculate your costs, compare non-collateral loans, and get step-by-step visa checklists with our zero-gating <span className="text-blue-300 font-bold">Study Abroad Decision Engine</span>.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <a
            href="/study-abroad"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-[var(--color-brand)] to-blue-600 hover:from-[var(--color-brand-dark)] hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer group"
          >
            <span>Explore Study Abroad Options</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
