"use client";

import React, { useState } from "react";
import { Calculator, Info, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RbiLrsTcsCalculator() {
  const [transferAmountInr, setTransferAmountInr] = useState<number>(1500000); // Default ₹15 Lakhs
  const [fundingSource, setFundingSource] = useState<"education_loan" | "self_education" | "general_lrs">("self_education");
  const [lrsThresholdUsed, setLrsThresholdUsed] = useState<boolean>(false);

  const LRS_THRESHOLD = 700000; // ₹7 Lakhs

  // Determine TCS rate under Section 206C(1G)
  const getTcsRate = () => {
    if (fundingSource === "education_loan") return 0.005; // 0.5%
    if (fundingSource === "self_education") return 0.05; // 5.0%
    return 0.20; // 20.0% for general LRS
  };

  const tcsRate = getTcsRate();

  // Calculate taxable amount above ₹7 Lakhs threshold
  const taxableAmount = lrsThresholdUsed
    ? transferAmountInr
    : Math.max(0, transferAmountInr - LRS_THRESHOLD);

  const tcsAmount = Math.round(taxableAmount * tcsRate);

  // Bank Forex Markup (~2% avg) vs Direct Fintech (~0.5%)
  const bankMarkupEst = Math.round(transferAmountInr * 0.02);
  const fintechMarkupEst = Math.round(transferAmountInr * 0.005);
  const potentialForexSavings = Math.max(0, bankMarkupEst - fintechMarkupEst);

  const totalBankOutflow = transferAmountInr + tcsAmount + bankMarkupEst;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold text-[#006c49] bg-[#E6F4EA] px-2.5 py-0.5 rounded-full uppercase">
            Section 206C(1G) Tax Rule Engine
          </span>
          <h3 className="text-xl font-bold text-[#0F172A] font-heading mt-1 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#006c49]" />
            <span>RBI LRS Outward Remittance & TCS Calculator</span>
          </h3>
        </div>
        <span className="text-xs text-[#64748B] flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> FY 2025-26 Tax Brackets
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT CONTROLS */}
        <div className="lg:col-span-7 space-y-5">
          {/* Transfer Amount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-[#0F172A]">
              <label>Remittance Amount (INR):</label>
              <span className="text-base font-extrabold text-[#006c49] font-heading">
                ₹{(transferAmountInr / 100000).toFixed(2)} Lakhs (₹{transferAmountInr.toLocaleString("en-IN")})
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={5000000}
              step={50000}
              value={transferAmountInr}
              onChange={(e) => setTransferAmountInr(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#006c49]"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹1 Lakh</span>
              <span>₹25 Lakhs</span>
              <span>₹50 Lakhs</span>
            </div>
          </div>

          {/* Funding Source Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
              Source of Funds & Purpose
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFundingSource("education_loan")}
                className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                  fundingSource === "education_loan"
                    ? "border-[#006c49] bg-[#E6F4EA] text-[#006c49] shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm font-extrabold">0.5% TCS</span>
                <span>Education Loan (Bank / NBFC)</span>
              </button>

              <button
                type="button"
                onClick={() => setFundingSource("self_education")}
                className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                  fundingSource === "self_education"
                    ? "border-[#006c49] bg-[#E6F4EA] text-[#006c49] shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm font-extrabold">5% TCS</span>
                <span>Self / Parent Savings (Tuition)</span>
              </button>

              <button
                type="button"
                onClick={() => setFundingSource("general_lrs")}
                className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                  fundingSource === "general_lrs"
                    ? "border-[#006c49] bg-[#E6F4EA] text-[#006c49] shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm font-extrabold">20% TCS</span>
                <span>General LRS / Unverified Living</span>
              </button>
            </div>
          </div>

          {/* LRS Threshold Toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#0F172A] block">Already used ₹7 Lakh LRS exemption this FY?</span>
              <span className="text-slate-500">If yes, TCS applies to 100% of this remittance amount.</span>
            </div>
            <input
              type="checkbox"
              checked={lrsThresholdUsed}
              onChange={(e) => setLrsThresholdUsed(e.target.checked)}
              className="w-5 h-5 accent-[#006c49] rounded cursor-pointer shrink-0"
            />
          </div>
        </div>

        {/* OUTPUT BREAKDOWN CARD */}
        <div className="lg:col-span-5 bg-[#0F172A] text-white p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-xs text-[#94A3B8]">Tax Collected at Source (TCS)</span>
              <span className="text-xs font-bold bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded-full uppercase">
                {(tcsRate * 100).toFixed(1)}% TCS Bracket
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#CBD5E1]">
                <span>Base Remittance:</span>
                <span className="font-medium">₹{transferAmountInr.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-xs text-[#CBD5E1]">
                <span>Exempt Amount:</span>
                <span className="font-medium">₹{(transferAmountInr - taxableAmount).toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-xs text-[#CBD5E1]">
                <span>Taxable Portion:</span>
                <span className="font-medium">₹{taxableAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-[#10B981] pt-2 border-t border-white/10">
                <span>TCS Payable at Counter:</span>
                <span className="font-heading text-base">₹{tcsAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Is TCS a Permanent Tax Loss?</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                No! TCS is an advance tax credit. Parents can claim 100% of this ₹{tcsAmount.toLocaleString("en-IN")} refund or set it off against income tax returns (ITR) under Form 26AS.
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex justify-between items-center text-xs text-[#CBD5E1]">
              <span>Estimated Bank Outflow:</span>
              <span className="font-bold text-white text-sm">~₹{totalBankOutflow.toLocaleString("en-IN")}</span>
            </div>

            <Link
              href="/study-abroad/loans/prodigy-vs-mpower-vs-sbi-loan-usa"
              className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#006c49] hover:bg-[#005237] py-2.5 px-4 rounded-xl transition-colors shadow-sm"
            >
              <span>Save up to ₹{potentialForexSavings.toLocaleString("en-IN")} on Forex Markups</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
