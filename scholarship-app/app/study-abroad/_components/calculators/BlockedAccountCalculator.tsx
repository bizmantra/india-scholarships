'use client';

import React, { useState, useEffect } from 'react';
export interface BlockedAccountProvider { id: string; name: string; feeEur: number; monthlyEur: number; freeInsurance: boolean }
export interface BlockedAccountInputs { monthlyWithdrawalEur: number; bufferEur: number; eurToInr: number; providers: BlockedAccountProvider[] }

interface CustomWindow extends Window {
  gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
}

/**
 * v2: same calculator, restyled to match the site's clean-header pages —
 * plain labels instead of badge pills, a plain result line instead of a
 * dark card, and a real comparison table instead of three heavy cards
 * (consistent with how DossierBody renders its own tables).
 */
export default function BlockedAccountCalculator({ monthlyWithdrawalEur, bufferEur, eurToInr: defaultEurToInr, providers }: BlockedAccountInputs) {
  const [eurToInr, setEurToInr] = useState(defaultEurToInr);
  const [customBuffer, setCustomBuffer] = useState(bufferEur);
  const [months, setMonths] = useState(12);

  const blockedBaseEur = monthlyWithdrawalEur * months;
  const totalBlockedEur = blockedBaseEur + customBuffer;

  useEffect(() => {
    const timer = setTimeout(() => {
      const customWindow = typeof window !== 'undefined' ? (window as unknown as CustomWindow) : null;
      if (customWindow && customWindow.gtag) {
        customWindow.gtag('event', 'use_blocked_account_calculator', {
          months, eur_to_inr: eurToInr, buffer_eur: customBuffer,
          total_blocked_eur: totalBlockedEur, total_blocked_inr: totalBlockedEur * eurToInr,
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [months, eurToInr, customBuffer, totalBlockedEur]);

  const trackProviderClick = (providerName: string, grandTotalInr: number) => {
    const customWindow = typeof window !== 'undefined' ? (window as unknown as CustomWindow) : null;
    if (customWindow && customWindow.gtag) {
      customWindow.gtag('event', 'click_provider_website', {
        provider_name: providerName, estimated_total_inr: grandTotalInr, destination_country: 'germany',
      });
    }
  };

  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatEUR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(amount);

  return (
    <div>
      <h3 className="text-xl font-bold text-[#0F172A] font-heading mb-1">
        German Blocked Account Cost Calculator
      </h3>
      <p className="text-sm text-[#64748B] mb-5">
        Calculate the exact Indian Rupee outflow needed to open and fund your German blocked account.
      </p>

      {/* Inputs — plain, no card wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-5 border-b border-[#E2E8F0] mb-5">
        <div>
          <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1.5">
            Exchange rate (1 EUR → INR)
          </label>
          <input
            type="number" step="0.1" value={eurToInr}
            onChange={(e) => setEurToInr(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#006c49] font-medium text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1.5">
            Bank transfer buffer (EUR)
          </label>
          <input
            type="number" value={customBuffer}
            onChange={(e) => setCustomBuffer(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#006c49] font-medium text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1.5">
            Duration (months)
          </label>
          <select
            value={months} onChange={(e) => setMonths(parseInt(e.target.value) || 12)}
            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#006c49] font-medium text-sm bg-white"
          >
            <option value={6}>6 (exchange semester)</option>
            <option value={12}>12 (standard visa requirement)</option>
            <option value={24}>24 (2-year Master&apos;s deposit)</option>
          </select>
        </div>
      </div>

      {/* Result — plain text, not a dark card */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 border-b border-[#E2E8F0] mb-6">
        <div>
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide block">Required deposit</span>
          <span className="text-2xl font-extrabold text-[#0F172A] font-heading">{formatEUR(totalBlockedEur)}</span>
          <span className="text-xs text-[#94A3B8] block">{formatEUR(blockedBaseEur)} deposit + {formatEUR(customBuffer)} buffer</span>
        </div>
        <div className="sm:text-right">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide block">Estimated rupee outflow</span>
          <span className="text-2xl font-extrabold text-[#006c49] font-heading">{formatINR(totalBlockedEur * eurToInr)}</span>
        </div>
      </div>

      {/* Provider comparison — a table, matching the rest of the site */}
      <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide mb-3">Provider comparison</h4>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="py-2.5 px-3 font-bold text-[#0F172A]">Provider</th>
              <th className="py-2.5 px-3 font-bold text-[#0F172A]">Setup fee</th>
              <th className="py-2.5 px-3 font-bold text-[#0F172A]">Monthly fee</th>
              <th className="py-2.5 px-3 font-bold text-[#0F172A]">Health insurance</th>
              <th className="py-2.5 px-3 font-bold text-[#0F172A]">Est. total (INR)</th>
              <th className="py-2.5 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {providers.map((provider) => {
              const monthlyFeeTotalEur = provider.monthlyEur * months;
              const grandTotalInr = (totalBlockedEur + provider.feeEur + monthlyFeeTotalEur) * eurToInr;
              return (
                <tr key={provider.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                    {provider.name}
                  </td>
                  <td className="py-2.5 px-3 text-[#334155]">{formatEUR(provider.feeEur)}</td>
                  <td className="py-2.5 px-3 text-[#334155]">{provider.monthlyEur > 0 ? `${formatEUR(provider.monthlyEur)}/mo` : 'Free'}</td>
                  <td className="py-2.5 px-3 text-[#334155]">{provider.freeInsurance ? 'Included' : 'Not included'}</td>
                  <td className="py-2.5 px-3 font-bold text-[#0F172A]">{formatINR(grandTotalInr)}</td>
                  <td className="py-2.5 px-3">
                    <a
                      href={`/study-abroad/out/${provider.id}`} target="_blank" rel="sponsored nofollow noopener"
                      onClick={() => trackProviderClick(provider.name, grandTotalInr)}
                      className="text-[#0645ad] hover:underline text-xs font-semibold"
                    >
                      Explore →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FAQ — plain, matching DossierBody's FAQ style */}
      <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide mb-2">Blocked account FAQs</h4>
      <div>
        <div className="py-3 border-b border-[#F1F5F9]">
          <h5 className="font-bold text-[#0F172A] text-sm">Does the amount need to be refilled every year?</h5>
          <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
            You only need to show the account for the first 12 months of your study visa. For subsequent years, you can prove financial capability through savings, side-jobs, parents&apos; income, or loans — a full refill is rarely required unless your local Ausländerbehörde specifically asks for one during a visa extension.
          </p>
        </div>
        <div className="py-3 border-b border-[#F1F5F9]">
          <h5 className="font-bold text-[#0F172A] text-sm">Do I still need one if I hold a DAAD scholarship or a loan?</h5>
          <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
            No. An official award letter for a recognized scholarship (e.g. DAAD) covering at least €992/month exempts you. An Indian education loan sanction letter also works as valid financial proof — you don&apos;t have to deposit the money upfront.
          </p>
        </div>
        <div className="py-3">
          <h5 className="font-bold text-[#0F172A] text-sm">Who controls the funds — can the provider withdraw them?</h5>
          <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
            The funds are entirely yours; the account is locked under German federal law and releases €992/month to your local bank account. If your visa is rejected, the full amount is returned to your Indian source account.
          </p>
        </div>
      </div>

      <p className="text-xs text-[#94A3B8] mt-5 italic">
        Estimates for academic year planning — confirm current figures with the provider and the German Embassy before wiring funds.
      </p>
    </div>
  );
}
