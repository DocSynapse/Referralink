/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Extended AdminPanel - Medical Certificates + User Management
 */

import React, { useState, useEffect } from 'react';
import { Printer, Calendar, User, Clock, AlertCircle, Users, CheckCircle, XCircle, Shield, Mail, Phone, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';

type AdminTab = 'sakit' | 'sehat' | 'users';

interface MedicalProfessional {
  id: string;
  email: string;
  fullName: string;
  licenseType: string;
  licenseNumber: string;
  institutionName: string;
  phoneNumber: string;
  role: string;
  emailVerified: boolean;
  licenseVerified: boolean;
  onboardingCompleted: boolean;
  registrationStatus: string;
  createdAt: string;
}

export const AdminPanelExtended: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('sakit');
  const [formData, setFormData] = useState({
    nama: '',
    umur: '',
    hari: '3',
    keterangan: 'Pemeriksaan Klinis'
  });
  const [errors, setErrors] = useState<{ nama?: string; umur?: string; hari?: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // User management state
  const [users, setUsers] = useState<MedicalProfessional[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'verified' | 'active'>('all');

  // Load users when switching to users tab or changing filter
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, userFilter]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const sessionToken = localStorage.getItem('sessionToken');

      if (!sessionToken) {
        console.warn('No session token found');
        return;
      }

      const statusParam = userFilter !== 'all' ? `?status=${userFilter}` : '';
      const response = await fetch(`/api/admin/users${statusParam}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.users) {
        setUsers(data.data.users);
      } else {
        console.error('Invalid API response:', data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback to empty array on error
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
    doc.setTextColor(255, 69, 0);
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

    doc.setTextColor(255, 69, 0);
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

  // Users are already filtered on server-side based on userFilter
  const filteredUsers = users;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin_user': return 'bg-purple-100 text-purple-700';
      case 'clinical_user': return 'bg-blue-100 text-blue-700';
      case 'specialist_user': return 'bg-green-100 text-green-700';
      case 'nurse_user': return 'bg-pink-100 text-pink-700';
      case 'maternal_care_user': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="neu-flat p-6 overflow-hidden flex flex-col h-full bg-[#E0E5EC]">
       {/* Neumorphic Toggle - 3 tabs */}
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
            `}
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
            `}
          >
             Sehat
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`
              flex-1 py-3 rounded-xl
              text-[11px] font-black uppercase tracking-[0.2em]
              font-display cursor-pointer
              transition-all duration-200 ease-in-out
              ${activeTab === 'users'
                ? 'bg-[#E0E5EC] text-blue-600 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/30 active:scale-[0.98]'
              }
            `}
          >
             <Users size={14} className="inline mr-1" />
             Users
          </button>
       </div>

       {/* Certificate Forms (Sakit/Sehat) */}
       {(activeTab === 'sakit' || activeTab === 'sehat') && (
         <>
           <div className="flex-1 space-y-5">
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 font-display">
                   Patient Name
                 </label>
                 <div className={`neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl transition-all ${errors.nama ? 'border-2 border-red-500' : 'border border-white/20'}`}>
                    <User size={16} className="text-slate-400" />
                    <input
                      value={formData.nama}
                      onChange={(e) => {
                        setFormData({...formData, nama: e.target.value});
                        if (errors.nama) setErrors({...errors, nama: undefined});
                      }}
                      className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none placeholder:text-slate-300 font-display"
                      placeholder="Full Name"
                    />
                 </div>
                 {errors.nama && (
                   <div className="flex items-center gap-2 text-red-600 text-[12px] font-bold">
                     <AlertCircle size={14} />
                     {errors.nama}
                   </div>
                 )}
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 font-display">
                   Age (Years)
                 </label>
                 <div className={`neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl transition-all ${errors.umur ? 'border-2 border-red-500' : 'border border-white/20'}`}>
                    <Calendar size={16} className="text-slate-400" />
                    <input
                      type="number"
                      value={formData.umur}
                      onChange={(e) => {
                        setFormData({...formData, umur: e.target.value});
                        if (errors.umur) setErrors({...errors, umur: undefined});
                      }}
                      className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none placeholder:text-slate-300 font-display"
                      placeholder="25"
                    />
                 </div>
                 {errors.umur && (
                   <div className="flex items-center gap-2 text-red-600 text-[12px] font-bold">
                     <AlertCircle size={14} />
                     {errors.umur}
                   </div>
                 )}
              </div>

              {activeTab === 'sakit' && (
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1 font-display">
                      Rest Period (Days)
                    </label>
                    <div className={`neu-pressed px-4 py-3 flex items-center gap-3 rounded-xl transition-all ${errors.hari ? 'border-2 border-red-500' : 'border border-white/20'}`}>
                       <Clock size={16} className="text-slate-400" />
                       <input
                         type="number"
                         value={formData.hari}
                         onChange={(e) => {
                           setFormData({...formData, hari: e.target.value});
                           if (errors.hari) setErrors({...errors, hari: undefined});
                         }}
                         className="w-full bg-transparent text-[15px] font-bold text-oxford outline-none font-display"
                       />
                    </div>
                    {errors.hari && (
                      <div className="flex items-center gap-2 text-red-600 text-[12px] font-bold">
                        <AlertCircle size={14} />
                        {errors.hari}
                      </div>
                    )}
                 </div>
              )}
           </div>

           <div className="mt-8">
              <button
                onClick={handlePrint}
                disabled={isGenerating || !formData.nama || !formData.umur}
                className="neu-flat w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-oxford flex items-center justify-center gap-3 hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-white/60 font-display"
              >
                 {isGenerating ? (
                   <>
                     <div className="w-4 h-4 border-2 border-oxford border-t-transparent animate-spin rounded-full"></div>
                     <span>Generating...</span>
                   </>
                 ) : (
                   <>
                     <Printer size={20} />
                     <span>Generate PDF</span>
                   </>
                 )}
              </button>
           </div>
         </>
       )}

       {/* User Management Tab */}
       {activeTab === 'users' && (
         <div className="flex-1 flex flex-col overflow-hidden">
           {/* Filter */}
           <div className="flex gap-2 mb-4">
             {(['all', 'pending', 'verified', 'active'] as const).map((filter) => (
               <button
                 key={filter}
                 onClick={() => setUserFilter(filter)}
                 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                   userFilter === filter
                     ? 'bg-oxford text-white'
                     : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                 }`}
               >
                 {filter}
               </button>
             ))}
           </div>

           {/* User List */}
           <div className="flex-1 overflow-y-auto space-y-3 pr-2">
             {isLoadingUsers ? (
               <div className="flex items-center justify-center h-full">
                 <div className="w-8 h-8 border-2 border-oxford border-t-transparent animate-spin rounded-full"></div>
               </div>
             ) : filteredUsers.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400">
                 <Users size={48} className="mb-2" />
                 <p className="text-[12px] font-bold">No users found</p>
               </div>
             ) : (
               filteredUsers.map((user) => (
                 <div key={user.id} className="neu-flat p-4 rounded-xl space-y-2">
                   {/* Name & Role */}
                   <div className="flex items-start justify-between">
                     <div>
                       <h4 className="text-[13px] font-black text-oxford">{user.fullName}</h4>
                       <p className="text-[11px] text-slate-500">{user.email}</p>
                     </div>
                     <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${getRoleBadgeColor(user.role)}`}>
                       {user.role.replace('_', ' ')}
                     </span>
                   </div>

                   {/* License Info */}
                   <div className="flex items-center gap-2 text-[11px] text-slate-600">
                     <Shield size={12} />
                     <span>{user.licenseType.toUpperCase()}: {user.licenseNumber}</span>
                   </div>

                   <div className="flex items-center gap-2 text-[11px] text-slate-600">
                     <Building2 size={12} />
                     <span>{user.institutionName}</span>
                   </div>

                   {/* Status Badges */}
                   <div className="flex gap-2 flex-wrap">
                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                       {user.emailVerified ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                       Email
                     </div>
                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${user.licenseVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                       {user.licenseVerified ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                       License
                     </div>
                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${user.onboardingCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                       {user.onboardingCompleted ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                       Onboarded
                     </div>
                   </div>

                   {/* Registered Date */}
                   <p className="text-[10px] text-slate-400">
                     Registered: {new Date(user.createdAt).toLocaleDateString('id-ID')}
                   </p>
                 </div>
               ))
             )}
           </div>

           {/* User Stats */}
           <div className="mt-4 grid grid-cols-4 gap-2">
             <div className="neu-pressed p-2 rounded-lg text-center">
               <p className="text-[10px] text-slate-500 font-bold">TOTAL</p>
               <p className="text-[18px] font-black text-oxford">{users.length}</p>
             </div>
             <div className="neu-pressed p-2 rounded-lg text-center">
               <p className="text-[10px] text-yellow-600 font-bold">PENDING</p>
               <p className="text-[18px] font-black text-yellow-600">
                 {users.filter(u => !u.emailVerified || !u.licenseVerified).length}
               </p>
             </div>
             <div className="neu-pressed p-2 rounded-lg text-center">
               <p className="text-[10px] text-blue-600 font-bold">VERIFIED</p>
               <p className="text-[18px] font-black text-blue-600">
                 {users.filter(u => u.emailVerified && u.licenseVerified && !u.onboardingCompleted).length}
               </p>
             </div>
             <div className="neu-pressed p-2 rounded-lg text-center">
               <p className="text-[10px] text-green-600 font-bold">ACTIVE</p>
               <p className="text-[18px] font-black text-green-600">
                 {users.filter(u => u.onboardingCompleted).length}
               </p>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};
