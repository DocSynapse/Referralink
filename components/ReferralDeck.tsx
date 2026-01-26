/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, Stethoscope, Copy } from 'lucide-react';
import TextBlockAnimation from './ui/text-block-animation';

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
    <section className="w-full py-12">
      
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header - Nurse Friendly */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-300/50 pb-8">
           <div className="space-y-3">
               <h2 className="title-primary font-black text-oxford tracking-tight font-display">
                  Opsi Diagnosa Rujukan.
               </h2>
               <p className="subtitle font-display text-slate-600">
                  Pilih kode diagnosa paling spesifik untuk validasi rujukan FKTL.
               </p>
            </div>
           <div className="neu-flat px-5 py-2.5 flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] font-display">
              <Stethoscope size={18} />
              <span>Asisten Dokter</span>
           </div>
        </div>

        {/* TABLE HEADER */}
        <div className="hidden md:grid grid-cols-12 gap-6 px-8 text-[15px] font-black tracking-[0.15em] text-oxford/60 font-display">
           <div className="col-span-1">Rank</div>
           <div className="col-span-4">ICD-10 & Diagnosis</div>
           <div className="col-span-5">Clinical Justification</div>
           <div className="col-span-2 text-center">Smart Tool</div>
        </div>

        {/* TABLE ROWS */}
        <div className="space-y-6">
           {options.map((option, idx) => (
              <div 
                key={idx} 
                className="neu-flat p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center group transition-all duration-200 border border-transparent hover:border-white/60"
              >
                 {/* Badge */}
                 <div className="col-span-1">
                    <span className={`px-4 py-2.5 text-[12px] font-black uppercase tracking-widest rounded-xl flex justify-center w-fit neu-pressed font-display ${idx === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                       #{idx + 1}
                    </span>
                 </div>

                 {/* Diagnosis */}
                 <div className="col-span-4 space-y-2">
                    <h3 className="text-[20px] font-black text-oxford leading-tight font-display tracking-tight">
                       {option.description}
                    </h3>
                    <div className="flex items-center gap-3">
                       <span className="text-2xl font-mono font-bold text-[#FF4500] bg-slate-200/50 px-3 py-1 rounded-lg border border-[#FF4500]/30">{option.code}</span>
                       <div className="flex flex-col leading-tight">
                          <span className="text-[11px] font-display text-slate-500">ICD10 Confirmed</span>
                       </div>
                       {idx === 0 && <ShieldCheck size={22} className="text-emerald-500" />}
                    </div>
                 </div>

                 {/* Reasoning */}
                 <div className="col-span-5">
                    <div className="p-5 rounded-2xl border border-slate-800 bg-[#0b1220]">
                       <p className="text-[12px] font-technical font-normal text-[#c7f284] leading-relaxed">
                          {`> ${option.clinical_reasoning}`}
                       </p>
                    </div>
                 </div>

                 {/* Action */}
                 <div className="col-span-2 flex justify-center">
                    <button 
                      onClick={() => {
                        const text = `Diagnosa Utama: ${option.description} (${option.code}). Alasan Rujukan: ${option.clinical_reasoning}`;
                        navigator.clipboard.writeText(text);
                        alert('Narasi Medis Berhasil Disalin!');
                      }}
                      className="neu-icon-btn hover:text-emerald-600 active:scale-95 group-hover:bg-white flex flex-col gap-2 h-auto py-4 px-6 rounded-2xl border border-white/40 shadow-lg"
                    >
                       <Copy size={22} />
                       <span className="text-[10px] font-black uppercase tracking-[0.1em] font-display">Smart Copy</span>
                    </button>
                 </div>
              </div>
           ))}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-black text-oxford uppercase tracking-[0.4em] mt-12 opacity-30 font-display">
           <AlertTriangle size={16} />
           Verification with Lead Doctor (DPJP) Required
        </div>

      </div>
    </section>
  );
};
