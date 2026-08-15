import React from 'react';

interface WikiInfoboxProps {
  title: string;
  amount: string;
  deadline: string;
  eligibility: string;
  provider: string;
  applyUrl: string;
}

export function WikiInfobox({
  title,
  amount,
  deadline,
  eligibility,
  provider,
  applyUrl,
}: WikiInfoboxProps) {
  return (
    <div className="wiki-infobox bg-slate-50 border border-slate-300 rounded-md p-4 mb-6 text-slate-900 shadow-sm">
      <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Annual Award
          </span>
          <span className="text-xl font-bold text-slate-900">{amount}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Deadline
          </span>
          <span className="inline-block text-xs font-semibold text-red-700 bg-red-100/80 border border-red-200 px-2 py-0.5 rounded mt-0.5">
            {deadline}
          </span>
        </div>
      </div>

      <table className="wiki-table text-sm mb-2">
        <tbody>
          <tr>
            <td>Scheme Name</td>
            <td className="font-semibold text-slate-900">{title}</td>
          </tr>
          <tr>
            <td>Provided By</td>
            <td>{provider}</td>
          </tr>
          <tr>
            <td>Eligibility Summary</td>
            <td>{eligibility}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

