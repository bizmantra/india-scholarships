"use client";

import { useState } from "react";
import { Calculator, Info } from "lucide-react";

export default function BavarianGradeCalculator() {
  const [maxGrade, setMaxGrade] = useState<number>(10);
  const [passGrade, setPassGrade] = useState<number>(4);
  const [achievedGrade, setAchievedGrade] = useState<number>(8.2);

  // Bavarian Formula: V = 1 + 3 * (Nmax - Nd) / (Nmax - Nmin)
  const calculateGermanGpa = (): number => {
    if (achievedGrade > maxGrade || achievedGrade < passGrade) {
      return 0;
    }
    const result = 1 + 3 * ((maxGrade - achievedGrade) / (maxGrade - passGrade));
    return parseFloat(result.toFixed(2));
  };

  const germanGpa = calculateGermanGpa();

  const getGpaInterpretation = (gpa: number) => {
    if (gpa <= 0) return { label: "Invalid Input", color: "text-red-700", desc: "Achieved grade must be between passing grade and maximum grade." };
    if (gpa <= 1.5) return { label: "Very Good (Sehr Gut)", color: "text-green-700", desc: "Excellent chances for elite German public universities (TUM, RWTH, LMU)." };
    if (gpa <= 2.5) return { label: "Good (Gut)", color: "text-blue-700", desc: "Strong qualification for most public university Master's programs." };
    if (gpa <= 3.5) return { label: "Satisfactory (Befriedigend)", color: "text-amber-700", desc: "Meets minimum eligibility; apply to non-restricted (zulassungsfrei) programs." };
    return { label: "Sufficient / Pass (Ausreichend)", color: "text-orange-700", desc: "High competition risk; consider additional credit modules or GATE scores." };
  };

  const status = getGpaInterpretation(germanGpa);

  return (
    <div className="bg-white border border-gray-200 rounded-md p-6 text-gray-900 max-w-xl mx-auto">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-2.5 rounded-lg bg-gray-100 text-gray-700">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg font-heading text-gray-900">German Grade Converter (Bavarian Formula)</h3>
          <p className="text-xs text-gray-500">Convert Indian CGPA or percentage into official German GPA scale (1.0 - 4.0)</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Input: Grading System Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Grading Scale Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setMaxGrade(10); setPassGrade(4); setAchievedGrade(8.0); }}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                maxGrade === 10
                  ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                  : "bg-gray-50 text-gray-500 border-gray-300 hover:text-gray-900"
              }`}
            >
              10-Point CGPA (India)
            </button>
            <button
              type="button"
              onClick={() => { setMaxGrade(100); setPassGrade(40); setAchievedGrade(75); }}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                maxGrade === 100
                  ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                  : "bg-gray-50 text-gray-500 border-gray-300 hover:text-gray-900"
              }`}
            >
              Percentage % (India)
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Best possible grade</label>
            <input
              type="number"
              value={maxGrade}
              onChange={(e) => setMaxGrade(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Minimum passing grade</label>
            <input
              type="number"
              value={passGrade}
              onChange={(e) => setPassGrade(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Your grade</label>
            <input
              type="number"
              step="0.01"
              value={achievedGrade}
              onChange={(e) => setAchievedGrade(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Output Result Display */}
        <div className="mt-6 p-4 rounded-xl bg-gray-50/80 border border-gray-300 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Official German Grade</span>
          <div className="text-4xl font-extrabold text-gray-900 my-1 font-mono">
            {germanGpa > 0 ? germanGpa : "—"}
          </div>
          <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
          <p className="text-[11px] text-gray-500 mt-2 max-w-sm">{status.desc}</p>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50/40 text-[11px] text-gray-500 border border-gray-300/50">
          <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <span>
            Formula used (the Bavarian formula): German grade = 1 + 3 × (best possible grade − your grade) ÷ (best possible grade − minimum passing grade). The German scale runs the other way: 1.0 is the best grade and 4.0 is a pass.
          </span>
        </div>
      </div>
    </div>
  );
}
