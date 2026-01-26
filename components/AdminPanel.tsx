/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Printer, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sakit' | 'sehat'>('sakit');
  const [formData, setFormData] = useState({
    nama: '',
    umur: '',
    hari: '3',
    keterangan: 'Pemeriksaan Klinis'
  });
  const [errors, setErrors] = useState<{ nama?: string; umur?: string; hari?: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Patient name is required';
    } else if (formData.nama.length < 3) {
      newErrors.nama = 'Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.nama)) {
      newErrors.nama = 'Name can only contain letters and spaces';
    }

    if (!formData.umur) {
      newErrors.umur = 'Age is required';
    } else {
      const age = parseInt(formData.umur);
      if (isNaN(age) || age < 1 || age > 120) {
        newErrors.umur = 'Age must be between 1 and 120 years';
      }
    }

    if (activeTab === 'sakit') {
      if (!formData.hari) {
        newErrors.hari = 'Rest period is required';
      } else {
        const days = parseInt(formData.hari);
        if (isNaN(days) || days < 1 || days > 90) {
          newErrors.hari = 'Rest period must be between 1 and 90 days';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePrint = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
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
    } catch (error) {
      console.error('PDF generation error:', error);
      setErrors({ nama: 'Failed to generate PDF. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="neu-flat p-6 overflow-hidden flex flex-col h-full bg-[#E0E5EC]">
       {/* Neumorphic Toggle */}
       <div className="flex p-1.5 gap-2 bg-[#D1D9E6] rounded-2xl mb-6 shadow-inner">
          <button
            onClick={() => setActiveTab('sakit')}
            className={`
              flex-1 py-3 rounded-xl
              text-[11px] font-black uppercase tracking-[0.2em]
              font-display cursor-pointer
              transition-all duration-200 ease-in-out
              ${activeTab === 'sakit'
                ? 'bg-[#E0E5EC] text-rose-600 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/30 active:scale-[0.98]'
              }
              focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2
            `}
            aria-pressed={activeTab === 'sakit'}
            aria-label="Generate sick leave certificate"
          >
             Sakit
          </button>
          <button
            onClick={() => setActiveTab('sehat')}
            className={`
              flex-1 py-3 rounded-xl
              text-[11px] font-black uppercase tracking-[0.2em]
              font-display cursor-pointer
              transition-all duration-200 ease-in-out
              ${activeTab === 'sehat'
                ? 'bg-[#E0E5EC] text-emerald-600 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/30 active:scale-[0.98]'
              }
              focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
            `}
            aria-pressed={activeTab === 'sehat'}
            aria-label="Generate health certificate"
          >
             Sehat
          </button>
       </div>

       {/* Form */}
       <div className="flex-1 space-y-5">
          {/* Patient Name Field */}
          <div className="space-y-2">
             <label htmlFor="nama-input" className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 font-display">
               Patient Name
             </label>
             <div className={`
               neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl transition-all
               ${errors.nama
                 ? 'border-2 border-red-500 bg-red-50/30'
                 : 'border border-white/20'
               }
             `}>
                <User size={16} className="text-slate-400" aria-hidden="true" />
                <input
                  id="nama-input"
                  value={formData.nama}
                  onChange={(e) => {
                    setFormData({...formData, nama: e.target.value});
                    if (errors.nama) setErrors({...errors, nama: undefined});
                  }}
                  className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none placeholder:text-slate-300 font-display"
                  placeholder="Full Name"
                  aria-invalid={!!errors.nama}
                  aria-describedby={errors.nama ? "nama-error" : undefined}
                />
             </div>
             {errors.nama && (
               <div id="nama-error" className="flex items-center gap-2 text-red-600 text-[12px] font-bold" role="alert">
                 <AlertCircle size={14} aria-hidden="true" />
                 {errors.nama}
               </div>
             )}
          </div>

          {/* Age Field */}
          <div className="space-y-2">
             <label htmlFor="umur-input" className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 font-display">
               Age (Years)
             </label>
             <div className={`
               neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl transition-all
               ${errors.umur
                 ? 'border-2 border-red-500 bg-red-50/30'
                 : 'border border-white/20'
               }
             `}>
                <Calendar size={16} className="text-slate-400" aria-hidden="true" />
                <input
                  id="umur-input"
                  type="number"
                  value={formData.umur}
                  onChange={(e) => {
                    setFormData({...formData, umur: e.target.value});
                    if (errors.umur) setErrors({...errors, umur: undefined});
                  }}
                  className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none placeholder:text-slate-300 font-display"
                  placeholder="25"
                  aria-invalid={!!errors.umur}
                  aria-describedby={errors.umur ? "umur-error" : undefined}
                />
             </div>
             {errors.umur && (
               <div id="umur-error" className="flex items-center gap-2 text-red-600 text-[12px] font-bold" role="alert">
                 <AlertCircle size={14} aria-hidden="true" />
                 {errors.umur}
               </div>
             )}
          </div>

          {/* Rest Period Field (Sakit only) */}
          {activeTab === 'sakit' && (
             <div className="space-y-2">
                <label htmlFor="hari-input" className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 font-display">
                  Rest Period (Days)
                </label>
                <div className={`
                  neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl transition-all
                  ${errors.hari
                    ? 'border-2 border-red-500 bg-red-50/30'
                    : 'border border-white/20'
                  }
                `}>
                   <Clock size={16} className="text-slate-400" aria-hidden="true" />
                   <input
                     id="hari-input"
                     type="number"
                     value={formData.hari}
                     onChange={(e) => {
                       setFormData({...formData, hari: e.target.value});
                       if (errors.hari) setErrors({...errors, hari: undefined});
                     }}
                     className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none font-display"
                     aria-invalid={!!errors.hari}
                     aria-describedby={errors.hari ? "hari-error" : undefined}
                   />
                </div>
                {errors.hari && (
                  <div id="hari-error" className="flex items-center gap-2 text-red-600 text-[12px] font-bold" role="alert">
                    <AlertCircle size={14} aria-hidden="true" />
                    {errors.hari}
                  </div>
                )}
             </div>
          )}
       </div>

       {/* Action */}
       <div className="mt-8 space-y-3">
          <button
            onClick={handlePrint}
            disabled={isGenerating || !formData.nama || !formData.umur}
            className="neu-flat w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-oxford flex items-center justify-center gap-3 hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-white/60 font-display"
          >
             {isGenerating ? (
               <>
                 <div className="w-4 h-4 border-2 border-oxford border-t-transparent animate-spin rounded-full" aria-hidden="true"></div>
                 <span>Generating...</span>
               </>
             ) : (
               <>
                 <Printer size={20} aria-hidden="true" />
                 <span>Generate PDF</span>
               </>
             )}
          </button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Processing...</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-pulse"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          )}
       </div>
    </div>
  );
};
