/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ICD10Result } from '../types';
import { SentraLogo } from './SentraLogo';
import { CheckCircle2, AlertCircle, Info, Hash, ExternalLink, ArrowUpCircle } from 'lucide-react';

interface DataCardProps {
  data: ICD10Result | null;
  loading: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="w-full bg-[#F5EFE6] rounded-[64px] p-16 border-2 border-[#CBDCEB] flex flex-col items-center justify-center min-h-[400px] gap-8 shadow-xl">
        <div className="relative w-24 h-24">
           <div className="absolute inset-0 rounded-full border-[8px] border-[#E8DFCA]"></div>
           <div className="absolute inset-0 rounded-full border-[8px] border-[#6D94C5] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-[#6D94C5] text-2xl font-black tracking-[0.3em] animate-pulse">PROSES ANALISA RUJUKAN...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full bg-[#F5EFE6] rounded-[64px] overflow-hidden border-2 border-[#CBDCEB] shadow-[0_40px_100px_rgba(109,148,197,0.1)] transition-all duration-700">
      
      {/* Header Result */}
      <div className="bg-[#6D94C5] px-12 py-8 flex justify-between items-center border-b-4 border-white">
        <div className="flex items-center gap-6">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
                <Hash size={28} strokeWidth={4} className="text-[#6D94C5]" />
            </div>
            <span className="text-white font-black tracking-[0.1em] text-4xl">{data.code}</span>
        </div>
        <div className="bg-white px-6 py-3 rounded-3xl border-2 border-[#CBDCEB]">
            <span className="text-[#6D94C5] font-black text-sm tracking-[0.2em] uppercase">Status: {data.category}</span>
        </div>
      </div>

      <div className="p-12 space-y-12">
        {/* Usulan Diagnosa Rujukan Section */}
        <div className="space-y-8">
            <div className="flex items-center gap-4 border-l-8 border-[#6D94C5] pl-6">
                <ArrowUpCircle size={32} strokeWidth={3} className="text-[#6D94C5]" />
                <label className="text-xl uppercase tracking-[0.4em] text-[#6D94C5] font-black">USULAN RUJUKAN (PROPOSED)</label>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {data.proposed_referrals.map((ref, idx) => (
                    <div key={idx} className="bg-white rounded-[40px] border-2 border-[#E8DFCA] p-8 hover:border-[#6D94C5] transition-all group shadow-md hover:shadow-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <h4 className="text-2xl font-black text-[#1A1F21] tracking-tight">{ref.description}</h4>
                            <span className="px-5 py-2 rounded-2xl bg-[#CBDCEB] text-[#6D94C5] font-black text-lg border-2 border-white">{ref.code}</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <AlertCircle size={24} className="text-[#6D94C5] mt-1 shrink-0" strokeWidth={3} />
                            <p className="text-[16px] text-[#5A5A5A] font-bold leading-relaxed italic">
                                "{ref.clinical_reasoning}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Clinical Note */}
        <div className="bg-[#E8DFCA] p-8 rounded-[40px] border-2 border-white shadow-inner">
            <div className="flex items-center gap-3 mb-4">
                <Info size={24} strokeWidth={3} className="text-[#6D94C5]" />
                <label className="text-[12px] uppercase tracking-[0.3em] text-[#6D94C5] font-black">Tindakan Awal Medis</label>
            </div>
            <p className="text-[17px] text-[#1A1F21] font-bold leading-relaxed">
                {data.clinical_notes}
            </p>
        </div>

        {/* Footer info */}
        <div className="pt-10 border-t-4 border-[#E8DFCA] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-[12px] text-[#6D94C5] font-black uppercase tracking-[0.2em]">
                <SentraLogo size={20} color="#6D94C5" strokeWidth={100} />
                <span>DIAGNOSTIC AUGMENTATION SYSTEM v2.5</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-2 rounded-full border-2 border-[#CBDCEB] shadow-md">
                <ExternalLink size={18} strokeWidth={4} className="text-[#6D94C5]" />
                <span className="text-[11px] text-[#6D94C5] font-black uppercase tracking-[0.2em]">Validated by Sentra Grounding</span>
            </div>
        </div>

      </div>
    </div>
  );
};