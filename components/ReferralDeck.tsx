/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Copy, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ReferralOption {
  code: string;
  description: string;
  clinical_reasoning: string;
}

interface ReferralDeckProps {
  options: ReferralOption[];
  isVisible: boolean;
}

export const ReferralDeck: React.FC<ReferralDeckProps> = ({ options, isVisible }) => {
  if (!isVisible || !options || options.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[11px] font-bold uppercase tracking-wide text-slate-400 font-technical">
        <div className="col-span-1">#</div>
        <div className="col-span-4">Diagnosis</div>
        <div className="col-span-5">Clinical Reasoning</div>
        <div className="col-span-2 text-center">Action</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {options.map((option, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:border-slate-300 transition-colors"
          >
            {/* Rank */}
            <div className="col-span-1">
              <span className={`text-[12px] font-bold font-technical ${idx === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                #{idx + 1}
              </span>
            </div>

            {/* Diagnosis */}
            <div className="col-span-4 space-y-1">
              <p className="text-[14px] font-bold text-[#002147] font-display leading-tight">
                {option.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold font-technical text-[#E03D00]">{option.code}</span>
                {idx === 0 && <ShieldCheck size={14} className="text-emerald-500" />}
              </div>
            </div>

            {/* Reasoning */}
            <div className="col-span-5">
              <div className="bg-[#0b1220] rounded-md px-3 py-2 border border-slate-700">
                <p className="text-[11px] font-technical text-[#c7f284] leading-relaxed">
                  {option.clinical_reasoning}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="col-span-2 flex justify-center">
              <button
                onClick={() => {
                  const text = `${option.description} (${option.code}): ${option.clinical_reasoning}`;
                  navigator.clipboard.writeText(text);
                }}
                className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-50 border border-slate-200 rounded hover:border-[#002147] hover:text-[#002147] font-technical cursor-pointer transition-colors"
              >
                <Copy size={12} />
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Alert */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-wide mt-4 font-technical bg-red-50 border border-red-200 py-2 px-4 rounded">
        <AlertTriangle size={12} />
        <span>Verifikasi DPJP Diperlukan</span>
      </div>
    </div>
  );
};
