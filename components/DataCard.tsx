/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ICD10Result } from '../types';
import { SentraLogo } from './SentraLogo';
import { 
  AlertCircle, Info, Hash, Activity, Clock, ShieldAlert, 
  HeartPulse, FileText, Briefcase, Stethoscope, Wallet, Users, CheckCircle2, Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DataCardProps {
  data: ICD10Result | null;
  loading: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({ data, loading }) => {
  
  // --- PDF GENERATOR ---
  const handlePrint = () => {
    if (!data) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(255, 69, 0); // Accent Red-Orange
    doc.text("SENTRA HEALTHCARE SOLUTIONS", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text("Artificial Intelligence Technology - CDSS Referral System", 105, 26, { align: 'center' });
    doc.line(20, 30, 190, 30);

    doc.setFontSize(16);
    doc.text("SURAT REKOMENDASI RUJUKAN", 105, 45, { align: 'center' });

    autoTable(doc, {
      startY: 55,
      head: [['Kategori', 'Detail Informasi']],
      body: [
        ['Diagnosa Utama', `${data.description} (${data.code})`],
        ['Triage Score', `${data.triage_score}/10 - ${data.urgency}`],
        ['Waktu Rujukan', data.recommended_timeframe],
        ['Alasan Klinis', data.evidence?.clinical_reasoning || data.clinical_notes],
        ['Red Flags', data.evidence?.red_flags?.join(', ') || 'None']
      ],
      theme: 'striped',
      headStyles: { fillColor: [255, 69, 0] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    doc.setTextColor(255, 69, 0); // Accent Red-Orange
    doc.text("System Architect & MD,", 150, finalY);
    doc.setFont("helvetica", "bold");
    doc.text("dr. Ferdi Iskandar", 150, finalY + 20);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // Reset to slate
    doc.text("Sentra AI Engine v3.5", 150, finalY + 25);

    doc.save(`Rujukan_Sentra_${data.code}.pdf`);
  };

  if (loading) {
    return (
      <div className="neu-flat p-16 flex flex-col items-center justify-center min-h-[400px] gap-8">
        <div className="w-24 h-24 rounded-full neu-pressed flex items-center justify-center relative">
           <div className="w-20 h-20 rounded-full border-4 border-t-blue-600 border-transparent animate-spin"></div>
        </div>
        <p className="text-oxford text-2xl font-black animate-pulse font-display uppercase tracking-widest">Protocol 7 Analysis Active</p>
      </div>
    );
  }

  if (!data) return null;

  const getTriageColor = (score: number) => {
    if (score >= 9) return '#ba1a1a';
    if (score >= 7) return '#FF4500';
    if (score >= 4) return '#f59e0b';
    return '#00695C';
  };

  return (
    <div className="neu-flat p-10 overflow-hidden transition-all">
      
      {/* 1. HEADER & TRIAGE */}
      <div className="flex flex-col md:flex-row gap-10 justify-between items-start mb-10 border-b border-slate-300/50 pb-10">
        <div className="space-y-6 flex-1">
          <div className="flex flex-wrap items-center gap-4">
             <span className="px-5 py-2.5 rounded-full neu-pressed text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] font-display">Clinical Dossier</span>
             <button 
               onClick={handlePrint}
               className="neu-flat px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:text-accent transition-colors shadow-sm text-oxford font-display"
             >
                <Printer size={16} /> Generate PDF
             </button>
             {data.category === "RUJUKAN_TAKTIK" && (
                <span className="px-5 py-2.5 rounded-full neu-pressed text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 font-display">
                   <ShieldAlert size={16} /> Strategic Upgrade
                </span>
             )}
          </div>
          <h2 className="text-5xl font-black text-oxford leading-tight font-display tracking-tight">
            {data.description}
            <span className="text-slate-400 ml-4 font-mono text-3xl font-bold opacity-60">({data.code})</span>
          </h2>
        </div>

        <div className="neu-pressed w-40 h-40 rounded-full flex flex-col items-center justify-center relative border border-white/20">
           <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 font-display">Triage</span>
           <span className="text-5xl font-black font-display" style={{ color: getTriageColor(data.triage_score || 0) }}>
              {data.triage_score || 0}
           </span>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 font-display">
              {data.urgency || "ROUTINE"}
           </p>
           <div className="absolute inset-0 rounded-full border-8 border-slate-200 opacity-10"></div>
        </div>
      </div>

      <div className="space-y-12">
        
        {/* 2. ASSESSMENT GRID */}
        <div className="space-y-8">
           <h3 className="text-[12px] font-black text-oxford uppercase tracking-[0.4em] ml-2 font-display opacity-40">Diagnostic Assessments</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AssessmentBox 
                label="Primary Diagnosis" 
                value={`${data.description} (${data.code})`} 
                icon={<Stethoscope size={20} className="text-blue-600"/>} 
                highlight 
              />
              <AssessmentBox label="Severity / Distress" value={data.assessment?.severity_distress} icon={<AlertCircle size={20}/>} />
              <AssessmentBox label="Risk / Complications" value={data.assessment?.risk_assessment} icon={<ShieldAlert size={20}/>} />
              <AssessmentBox label="Functional Impact" value={data.assessment?.functional_impact} icon={<Activity size={20}/>} />
              <AssessmentBox label="Comorbidities" value={data.assessment?.comorbidities?.join(', ')} icon={<HeartPulse size={20}/>} />
              <AssessmentBox label="Recommended Time" value={data.recommended_timeframe} icon={<Clock size={20}/>} />
           </div>
        </div>

        {/* 3. REASONING */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-[12px] font-black text-oxford uppercase tracking-[0.4em] ml-2 font-display opacity-40">Clinical Justification</h3>
              <div className="neu-pressed p-8 text-slate-700 text-[15px] leading-relaxed font-bold italic font-display border-l-4 border-slate-300">
                 "{data.evidence?.clinical_reasoning || data.clinical_notes}"
              </div>
           </div>
           
           <div className="space-y-6">
              <h3 className="text-[12px] font-black text-oxford uppercase tracking-[0.4em] ml-2 font-display opacity-40">Critical Red Flags</h3>
              <div className="neu-pressed p-6 space-y-4">
                 {(data.evidence?.red_flags?.length ? data.evidence.red_flags : ["No critical flags reported"]).map((flag, i) => (
                    <div key={i} className="flex items-start gap-4 text-[13px] text-red-600 font-black font-display uppercase tracking-tight">
                       <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                       {flag}
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const AssessmentBox = ({ label, value, icon, highlight }: any) => (
  <div className={`neu-pressed p-6 flex flex-col justify-between h-full border-l-4 transition-all ${highlight ? 'border-blue-600 bg-blue-50/5' : 'border-transparent'}`}>
     <div className="flex items-center gap-4 text-slate-400 mb-4">
        {icon}
        <span className="text-[11px] font-black uppercase tracking-[0.2em] font-display">{label}</span>
     </div>
     <p className={`text-[15px] font-bold leading-relaxed font-display ${highlight ? 'text-oxford' : 'text-slate-700'}`}>
        {value || "-"}
     </p>
  </div>
);
