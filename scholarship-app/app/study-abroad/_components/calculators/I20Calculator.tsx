'use client';

import React, { useState, useEffect } from 'react';

interface I20CalculatorProps {
  defaultTuitionUsd?: number;
  defaultLivingUsd?: number;
  universityName?: string;
}

interface CustomWindow extends Window {
  gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
}

export default function I20Calculator({
  defaultTuitionUsd = 35000,
  defaultLivingUsd = 15000,
  universityName = "this university",
  usdToInr: defaultUsdToInr = 83.8,
}: I20CalculatorProps & { usdToInr?: number }) {
  const [tuitionUsd, setTuitionUsd] = useState(defaultTuitionUsd);
  const [livingUsd, setLivingUsd] = useState(defaultLivingUsd);
  const [scholarshipUsd, setScholarshipUsd] = useState(0);
  const [usdToInr, setUsdToInr] = useState(defaultUsdToInr);
  const [safetyMargin, setSafetyMargin] = useState(1.5); // Default to 1.5x for visa safety

  const baseAnnualCostUsd = Math.max(0, tuitionUsd + livingUsd - scholarshipUsd);
  const totalRequiredUsd = baseAnnualCostUsd * safetyMargin;

  const totalRequiredInr = totalRequiredUsd * usdToInr;
  const baseAnnualCostInr = baseAnnualCostUsd * usdToInr;

  useEffect(() => {
    const timer = setTimeout(() => {
      const customWindow = typeof window !== 'undefined' ? (window as unknown as CustomWindow) : null;
      if (customWindow && customWindow.gtag) {
        customWindow.gtag('event', 'use_i20_calculator', {
          university_name: universityName,
          tuition_usd: tuitionUsd,
          living_usd: livingUsd,
          scholarship_usd: scholarshipUsd,
          usd_to_inr: usdToInr,
          safety_margin: safetyMargin,
          total_required_inr: totalRequiredInr
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [tuitionUsd, livingUsd, scholarshipUsd, usdToInr, safetyMargin, universityName, totalRequiredInr]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-wrap gap-[clamp(24px,4vw,44px)] items-start pt-4">
      {/* INPUT PANEL (Handoff Rule: 2px top rule, flex 1 1 280px, flush inputs) */}
      <div className="flex-1 min-w-[280px] border-t-2 border-[var(--color-divider)] pt-4 space-y-4">
        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-muted mb-1.5">
            Yearly tuition and fees (USD)
          </label>
          <input
            type="number"
            value={tuitionUsd}
            onChange={(e) => setTuitionUsd(Math.max(0, parseInt(e.target.value) || 0))}
            className="input w-full font-semibold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-muted mb-1.5">
            Yearly living costs (USD)
          </label>
          <input
            type="number"
            value={livingUsd}
            onChange={(e) => setLivingUsd(Math.max(0, parseInt(e.target.value) || 0))}
            className="input w-full font-semibold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-muted mb-1.5">
            Scholarship or assistantship (USD)
          </label>
          <input
            type="number"
            value={scholarshipUsd}
            onChange={(e) => setScholarshipUsd(Math.max(0, parseInt(e.target.value) || 0))}
            className="input w-full font-semibold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-muted mb-1.5">
            Exchange rate (1 USD to INR)
          </label>
          <input
            type="number"
            step="0.1"
            value={usdToInr}
            onChange={(e) => setUsdToInr(parseFloat(e.target.value) || 83.8)}
            className="input w-full font-semibold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-muted mb-1.5">
            How much to show for visa
          </label>
          <div className="flex gap-0.5 border border-[var(--color-divider)] p-0.5">
            <button
              type="button"
              onClick={() => setSafetyMargin(1.0)}
              className={`flex-1 py-2 text-xs font-bold ${
                safetyMargin === 1.0
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]"
              }`}
            >
              1.0× minimum
            </button>
            <button
              type="button"
              onClick={() => setSafetyMargin(1.5)}
              className={`flex-1 py-2 text-xs font-bold ${
                safetyMargin === 1.5
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]"
              }`}
            >
              1.5× safer
            </button>
          </div>
        </div>
      </div>

      {/* OUTPUT PANEL (Handoff Rule: 2px top rule, flex 1 1 280px) */}
      <div className="flex-1 min-w-[280px] border-t-2 border-[var(--color-divider)] pt-4 space-y-6">
        <div>
          <div className="text-[11px] font-bold tracking-[0.09em] uppercase text-muted mb-1">
            One year of study costs
          </div>
          <div className="font-['Archivo'] font-extrabold text-[clamp(22px,3.2vw,30px)] leading-[1.1]">
            {formatUSD(baseAnnualCostUsd)}
          </div>
          <div className="text-muted text-[13px]">{formatINR(baseAnnualCostInr)}</div>
        </div>

        <div>
          <div className="text-[11px] font-bold tracking-[0.09em] uppercase text-muted mb-1">
            Bank balance to show
          </div>
          <div className="font-['Archivo'] font-extrabold text-[clamp(28px,4.4vw,44px)] leading-[1.05] text-[var(--color-accent-700)]">
            {formatINR(totalRequiredInr)}
          </div>
          <div className="text-muted text-[13px]">{formatUSD(totalRequiredUsd)}</div>
        </div>

        <div>
          <div className="text-[11px] font-bold tracking-[0.09em] uppercase text-muted mb-3">
            Where that money usually comes from
          </div>
          <div className="space-y-3 text-[13px]">
            <div>
              <div className="flex justify-between mb-1">
                <span>70% Education Loan</span>
                <span className="font-semibold">{formatINR(totalRequiredInr * 0.7)}</span>
              </div>
              <div className="h-[6px] bg-[var(--color-neutral-300)]">
                <div className="h-full bg-[var(--color-accent)] w-[70%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>20% Family Savings / FDs</span>
                <span className="font-semibold">{formatINR(totalRequiredInr * 0.2)}</span>
              </div>
              <div className="h-[6px] bg-[var(--color-neutral-300)]">
                <div className="h-full bg-[var(--color-accent)] w-[20%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>10% Provident Fund / Gold</span>
                <span className="font-semibold">{formatINR(totalRequiredInr * 0.1)}</span>
              </div>
              <div className="h-[6px] bg-[var(--color-neutral-300)]">
                <div className="h-full bg-[var(--color-accent)] w-[10%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
