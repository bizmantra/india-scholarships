'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { calculateUkFunds, type UkFundsRates } from '@/lib/study-abroad/uk-funds';

export interface UkFundsCalculatorProps {
  rates: UkFundsRates;
  checkedAt?: string | null;
}

interface CustomWindow extends Window {
  gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
}

const formatGBP = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function UkFundsCalculator({ rates, checkedAt }: UkFundsCalculatorProps) {
  const [annualTuitionGbp, setAnnualTuitionGbp] = useState(34600);
  const [depositPaidGbp, setDepositPaidGbp] = useState(2000);
  const [courseMonths, setCourseMonths] = useState(12);
  const [isLondon, setIsLondon] = useState(false);
  const [gbpToInr, setGbpToInr] = useState(rates.gbpToInr);

  const result = calculateUkFunds({
    annualTuitionGbp,
    depositPaidGbp,
    courseMonths,
    isLondon,
    rates: { ...rates, gbpToInr },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const customWindow = typeof window !== 'undefined' ? (window as unknown as CustomWindow) : null;
      if (customWindow && customWindow.gtag) {
        customWindow.gtag('event', 'use_uk_funds_calculator', {
          annual_tuition_gbp: annualTuitionGbp,
          deposit_paid_gbp: depositPaidGbp,
          course_months: courseMonths,
          is_london: isLondon,
          gbp_to_inr: gbpToInr,
          total_funds_gbp: result.totalFundsGbp,
          total_funds_inr: result.totalFundsInr,
          ihs_gbp: result.ihsGbp,
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [annualTuitionGbp, depositPaidGbp, courseMonths, isLondon, gbpToInr, result.totalFundsGbp, result.totalFundsInr, result.ihsGbp]);

  return (
    <div>
      <h3 className="text-xl font-bold text-[#0F172A] font-heading mb-1">
        UK Student Visa Proof of Funds Calculator
      </h3>
      <p className="text-sm text-[#64748B] mb-5">
        Calculate the tuition and living funds you must hold for {result.holdDays} consecutive days before applying, plus your separate health surcharge.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-5 border-b border-[#E2E8F0] mb-5">
        <div>
          <label htmlFor="uk-tuition" className="block text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1.5">
            First-year tuition (GBP)
          </label>
          <input
            id="uk-tuition"
            type="number"
            min={0}
            value={annualTuitionGbp}
            onChange={(e) => setAnnualTuitionGbp(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#006c49] font-medium text-sm"
          />
        </div>

        <div>
          <label htmlFor="uk-deposit" className="block text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1.5">
            Deposit already paid (GBP)
          </label>
          <input
            id="uk-deposit"
            type="number"
            min={0}
            value={depositPaidGbp}
            onChange={(e) => setDepositPaidGbp(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#006c49] font-medium text-sm"
          />
        </div>

        <div>
          <label htmlFor="uk-months" className="block text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1.5">
            Course length (months)
          </label>
          <input
            id="uk-months"
            type="number"
            min={1}
            step="0.5"
            value={courseMonths}
            onChange={(e) => setCourseMonths(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#006c49] font-medium text-sm"
          />
        </div>

        <div>
          <span className="block text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1.5">
            Study location
          </span>
          <div className="flex gap-1 border border-[#CBD5E1] rounded-md p-0.5 bg-white">
            <button
              type="button"
              onClick={() => setIsLondon(false)}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded ${
                !isLondon ? 'bg-[#006c49] text-white' : 'text-[#334155] hover:bg-slate-50'
              }`}
            >
              Outside London ({formatGBP(rates.monthlyOutsideLondonGbp)}/mo)
            </button>
            <button
              type="button"
              onClick={() => setIsLondon(true)}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded ${
                isLondon ? 'bg-[#006c49] text-white' : 'text-[#334155] hover:bg-slate-50'
              }`}
            >
              London ({formatGBP(rates.monthlyLondonGbp)}/mo)
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="uk-fx" className="block text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1.5">
            Exchange rate (1 GBP → INR)
          </label>
          <input
            id="uk-fx"
            type="number"
            min={1}
            step="0.1"
            value={gbpToInr}
            onChange={(e) => setGbpToInr(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#006c49] font-medium text-sm"
          />
        </div>
      </div>

      {/* Primary Result */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 border-b border-[#E2E8F0] mb-5">
        <div>
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide block">
            Proof of funds to show
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
            {formatGBP(result.totalFundsGbp)}
          </span>
          <span className="text-xs text-[#64748B] block mt-1">
            {formatGBP(result.feesToShowGbp)} unpaid fees + {formatGBP(result.livingMoneyGbp)} living ({result.livingMonths} mo × {formatGBP(result.monthlyLivingGbp)})
          </span>
        </div>
        <div className="sm:text-right">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide block">
            Estimated rupee amount
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#006c49] font-heading">
            {formatINR(result.totalFundsInr)}
          </span>
          <span className="text-xs text-[#64748B] block mt-1">
            Hold for {result.holdDays} consecutive days (end date within {result.holdWindowDays} days of applying)
          </span>
        </div>
      </div>

      {/* Separate IHS line */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wide block">
            Immigration Health Surcharge (paid separately)
          </span>
          <p className="text-xs text-[#64748B] mt-0.5">
            Not part of the {result.holdDays}-day bank balance. Paid online with your visa application at {formatGBP(rates.ihsAnnualGbp)}/year (minimum 1 year; billed on total visa length including extra months granted).
          </p>
        </div>
        <div className="sm:text-right shrink-0">
          <span className="text-lg font-extrabold text-[#0F172A] font-heading block">{formatGBP(result.ihsGbp)}</span>
          <span className="text-xs text-[#64748B]">{formatINR(result.ihsInr)}</span>
        </div>
      </div>

      {/* Your result explained */}
      <div className="mb-6 space-y-2 text-sm text-[#334155] leading-relaxed">
        <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Your result explained</h4>
        <p>
          You must show <strong>{formatGBP(result.totalFundsGbp)}</strong> ({formatINR(result.totalFundsInr)}) in an eligible bank account or approved education loan letter. The balance cannot dip below this total on any day during the <strong>{result.holdDays}-day</strong> holding period, and the statement&apos;s closing date must be within <strong>{result.holdWindowDays} days</strong> of your online visa submission.
        </p>
        <p>
          Dependants are not included in version 1 of this calculator. Under current UK rules, most master&apos;s students cannot bring dependants unless enrolled in a PhD or research-based postgraduate programme.
        </p>
      </div>

      {/* How it's calculated */}
      <div className="mb-6 space-y-2 text-sm text-[#334155] leading-relaxed">
        <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">How it&apos;s calculated</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Course fees:</strong> First-year tuition (or total course fee if shorter) minus any deposit already paid and shown on your CAS.
          </li>
          <li>
            <strong>Living money:</strong> {formatGBP(rates.monthlyLondonGbp)}/month in London or {formatGBP(rates.monthlyOutsideLondonGbp)}/month outside London, capped at {rates.maxMonths} months. Courses under {rates.maxMonths} months use actual months rounded up. <em>Note: Per UK Home Office Statement of Changes HC 584, applications submitted on or after 30 November 2026 require £1,570/month (London) and £1,203/month (outside London).</em>
          </li>
          <li>
            <strong>Health surcharge (IHS):</strong> {formatGBP(rates.ihsAnnualGbp)}/year, billed in 6-month blocks (minimum 1 year for Student visas).
          </li>
        </ul>
        <p className="text-xs text-[#64748B]">
          {checkedAt ? `Rules checked ${checkedAt} against ` : 'Sources: '}
          <a href="https://www.gov.uk/student-visa/money" target="_blank" rel="noopener noreferrer" className="text-[#0645ad] hover:underline">GOV.UK Student visa money</a>
          {' · '}
          <a href="https://www.gov.uk/healthcare-immigration-application/how-much-pay" target="_blank" rel="noopener noreferrer" className="text-[#0645ad] hover:underline">GOV.UK Immigration Health Surcharge</a>
        </p>
      </div>

      {/* Next step */}
      <div className="mb-6 p-4 border border-[#E2E8F0] rounded-lg bg-white">
        <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide mb-1">Next step</h4>
        <p className="text-sm text-[#334155]">
          Sending your tuition deposit or living funds from India? Check the 5% / 0.5% tax collected at source with our{' '}
          <Link href="/study-abroad/tools/rbi-lrs-tcs-calculator" className="text-[#0645ad] font-semibold hover:underline">
            TCS on foreign remittance calculator →
          </Link>
        </p>
      </div>

      {/* FAQs */}
      <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide mb-2">UK proof of funds FAQs</h4>
      <div>
        <div className="py-3 border-b border-[#F1F5F9]">
          <h5 className="font-bold text-[#0F172A] text-sm">How does the 28-day rule work?</h5>
          <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
            Your bank balance must stay at or above the required GBP total for at least {result.holdDays} consecutive days without dipping below even once. The end date of those {result.holdDays} days must be no more than {result.holdWindowDays} days before you submit your online visa application.
          </p>
        </div>
        <div className="py-3 border-b border-[#F1F5F9]">
          <h5 className="font-bold text-[#0F172A] text-sm">Does a tuition deposit reduce the funds I need to show?</h5>
          <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
            Yes, provided your university records the paid deposit on your Confirmation of Acceptance for Studies (CAS). Only the unpaid balance of your first-year tuition needs to be shown in your bank account.
          </p>
        </div>
        <div className="py-3 border-b border-[#F1F5F9]">
          <h5 className="font-bold text-[#0F172A] text-sm">Is the Immigration Health Surcharge part of the 28-day bank balance?</h5>
          <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
            No. You pay the Immigration Health Surcharge ({formatGBP(rates.ihsAnnualGbp)}/year) online as part of your visa application fee checkout, separately from the maintenance funds held in your account.
          </p>
        </div>
        <div className="py-3">
          <h5 className="font-bold text-[#0F172A] text-sm">Why is living money capped at 9 months for a 12-month master&apos;s?</h5>
          <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
            UKVI requires proof of living costs for each month of your course up to a maximum of {rates.maxMonths} months. Courses shorter than {rates.maxMonths} months use the actual course length rounded up to the next whole month.
          </p>
        </div>
      </div>

      <p className="text-xs text-[#94A3B8] mt-5 italic">
        Estimates only — not legal or immigration advice. Always check gov.uk/student-visa/money before you apply.
      </p>
    </div>
  );
}
