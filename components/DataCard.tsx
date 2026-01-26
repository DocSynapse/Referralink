/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ICD10Result } from '../types';
import {
  AlertCircle, Clock, ShieldAlert,
  HeartPulse, Stethoscope, Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DataCardProps {
  data: ICD10Result | null;
  loading: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({ data, loading }) => {

  const handlePrint = () => {
    if (!data) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(0, 33, 71);
    doc.text("SENTRA REFERRALINK", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Smart Referral Intelligence", 105, 26, { align: 'center' });
    doc.line(20, 30, 190, 30);

    doc.setFontSize(14);
    doc.setTextColor(0, 33, 71);
    doc.text("REKOMENDASI RUJUKAN", 105, 42, { align: 'center' });

    autoTable(doc, {
      startY: 50,
      head: [['Kategori', 'Detail']],
      body: [
        ['Diagnosa', `${data.description} (${data.code})`],
        ['Triage Score', `${data.triage_score}/10 - ${data.urgency}`],
        ['Waktu Rujukan', data.recommended_timeframe],
        ['Alasan Klinis', data.evidence?.clinical_reasoning || data.clinical_notes],
        ['Red Flags', data.evidence?.red_flags?.join(', ') || 'None']
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 33, 71] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("dr. Ferdi Iskandar", 150, finalY);
    doc.text("Sentra AI Engine", 150, finalY + 5);

    doc.save(`Rujukan_${data.code}.pdf`);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="h-6 bg-slate-200 rounded w-48"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-slate-200"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getTriageColor = (score: number) => {
    if (score >= 9) return '#ba1a1a';
    if (score >= 7) return '#E03D00';
    if (score >= 4) return '#f59e0b';
    return '#00695C';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 font-technical">Clinical Result</span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500 bg-slate-50 border border-slate-200 rounded hover:border-[#002147] hover:text-[#002147] font-technical cursor-pointer transition-colors"
            >
              <Printer size={10} /> PDF
            </button>
          </div>
          <h3 className="text-[16px] font-bold text-[#002147] font-display leading-tight">
            {data.description}
          </h3>
          <p className="text-[13px] font-bold font-technical text-[#E03D00]">{data.code}</p>
        </div>

        {/* Triage Circle */}
        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
          <span className="text-[18px] font-bold font-display" style={{ color: getTriageColor(data.triage_score || 0) }}>
            {data.triage_score || 0}
          </span>
          <span className="text-[8px] font-bold uppercase text-slate-400 font-technical">Triage</span>
        </div>
      </div>

      {/* Assessment Grid */}
      <div className="grid grid-cols-3 gap-3">
        <AssessmentBox
          label="Urgency"
          value={data.urgency || "Routine"}
          icon={<AlertCircle size={12} />}
        />
        <AssessmentBox
          label="Timeframe"
          value={data.recommended_timeframe}
          icon={<Clock size={12} />}
        />
        <AssessmentBox
          label="Severity"
          value={data.assessment?.severity_distress || "-"}
          icon={<HeartPulse size={12} />}
        />
      </div>

      {/* Clinical Reasoning */}
      {data.evidence?.clinical_reasoning && (
        <div className="bg-[#0b1220] rounded-md px-3 py-2 border border-slate-700">
          <p className="text-[11px] font-technical text-[#c7f284] leading-relaxed">
            {data.evidence.clinical_reasoning}
          </p>
        </div>
      )}

      {/* Red Flags */}
      {data.evidence?.red_flags && data.evidence.red_flags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.evidence.red_flags.map((flag, i) => (
            <span key={i} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded font-technical">
              <ShieldAlert size={10} />
              {flag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const AssessmentBox = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
    <div className="flex items-center gap-1 text-slate-400 mb-1">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wide font-technical">{label}</span>
    </div>
    <p className="text-[12px] font-bold text-[#002147] font-display leading-tight">
      {value || "-"}
    </p>
  </div>
);
