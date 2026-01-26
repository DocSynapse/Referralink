/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Printer, Calendar, User, Clock } from 'lucide-react';
import jsPDF from 'jspdf';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sakit' | 'sehat'>('sakit');
  const [formData, setFormData] = useState({
    nama: '',
    umur: '',
    hari: '3',
    keterangan: 'Pemeriksaan Klinis'
  });

  const handlePrint = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    doc.setFontSize(18);
    doc.setTextColor(255, 69, 0); // Accent Red-Orange
    doc.text("SENTRA HEALTHCARE SOLUTIONS", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text("Jl. Protokol Medis No. 7, Kediri | Telp: (0354) 123456", 105, 26, { align: 'center' });
    doc.line(20, 30, 190, 30);

    doc.setFontSize(16);
    doc.text(activeTab === 'sakit' ? "SURAT KETERANGAN SAKIT" : "SURAT KETERANGAN SEHAT", 105, 45, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const contentStartY = 60;
    
    doc.text("Yang bertanda tangan di bawah ini menerangkan bahwa:", 20, contentStartY);
    doc.text(`Nama   : ${formData.nama}`, 30, contentStartY + 15);
    doc.text(`Umur   : ${formData.umur} Tahun`, 30, contentStartY + 25);
    doc.text(`Tgl    : ${date}`, 30, contentStartY + 35);

    if (activeTab === 'sakit') {
        doc.text("Berdasarkan pemeriksaan medis, pasien tersebut PERLU ISTIRAHAT", 20, contentStartY + 55);
        doc.text(`selama ${formData.hari} hari karena kondisi kesehatan.`, 20, contentStartY + 65);
        doc.text(`Keterangan: ${formData.keterangan}`, 20, contentStartY + 75);
    } else {
        doc.text("Telah diperiksa kesehatan badannya dan dinyatakan:", 20, contentStartY + 55);
        doc.setFont("helvetica", "bold");
        doc.text("SEHAT UNTUK BEKERJA / BERAKTIVITAS", 105, contentStartY + 70, { align: 'center' });
        doc.setFont("helvetica", "normal");
    }

    doc.setTextColor(255, 69, 0); // Accent Red-Orange
    doc.text(`Kediri, ${date}`, 140, contentStartY + 100);
    doc.text("Dokter Pemeriksa,", 140, contentStartY + 110);
    doc.setFont("helvetica", "bold");
    doc.text("dr. Ferdi Iskandar", 140, contentStartY + 135);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("SIP: 123/SIP/2026", 140, contentStartY + 140);

    doc.save(`Surat_${activeTab}_${formData.nama}.pdf`);
  };

  return (
    <div className="neu-flat p-6 overflow-hidden flex flex-col h-full bg-[#E0E5EC]">
       {/* Neumorphic Toggle */}
       <div className="flex p-1.5 gap-2 bg-[#D1D9E6] rounded-2xl mb-6 shadow-inner">
          <button 
            onClick={() => setActiveTab('sakit')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all font-display ${activeTab === 'sakit' ? 'bg-[#E0E5EC] text-rose-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
             Sakit
          </button>
          <button 
            onClick={() => setActiveTab('sehat')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all font-display ${activeTab === 'sehat' ? 'bg-[#E0E5EC] text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
             Sehat
          </button>
       </div>

       {/* Form */}
       <div className="flex-1 space-y-5">
          <div className="space-y-2">
             <label className="text-[11px] font-black text-oxford/40 uppercase tracking-[0.3em] ml-1 font-display">Patient Name</label>
             <div className="neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl border border-white/20">
                <User size={16} className="text-slate-400" />
                <input value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none placeholder:text-slate-300 font-display" placeholder="Full Name" />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-black text-oxford/40 uppercase tracking-[0.3em] ml-1 font-display">Age (Years)</label>
             <div className="neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl border border-white/20">
                <Calendar size={16} className="text-slate-400" />
                <input type="number" value={formData.umur} onChange={(e) => setFormData({...formData, umur: e.target.value})} className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none placeholder:text-slate-300 font-display" placeholder="25" />
             </div>
          </div>

          {activeTab === 'sakit' && (
             <div className="space-y-2">
                <label className="text-[11px] font-black text-oxford/40 uppercase tracking-[0.3em] ml-1 font-display">Rest Period (Days)</label>
                <div className="neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl border border-white/20">
                   <Clock size={16} className="text-slate-400" />
                   <input type="number" value={formData.hari} onChange={(e) => setFormData({...formData, hari: e.target.value})} className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none font-display" />
                </div>
             </div>
          )}
       </div>

       {/* Action */}
       <div className="mt-8">
          <button 
            onClick={handlePrint}
            disabled={!formData.nama || !formData.umur}
            className="neu-flat w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-oxford flex items-center justify-center gap-3 hover:text-accent transition-all disabled:opacity-50 border border-white/60 font-display"
          >
             <Printer size={20} />
             Generate PDF
          </button>
       </div>
    </div>
  );
};
