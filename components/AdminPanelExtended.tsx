/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Extended AdminPanel - Medical Certificates + User Management
 */

import React, { useState, useEffect } from 'react';
import { Printer, Calendar, User, Clock, AlertCircle, Users, CheckCircle, XCircle, Shield, Mail, Phone, Building2, TrendingUp, UserCheck, UserPlus, Activity } from 'lucide-react';
import jsPDF from 'jspdf';

type AdminTab = 'sakit' | 'sehat' | 'users' | 'stats';

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

interface DashboardStats {
  totalUsers: number;
  activeThisMonth: number;
  pendingVerification: number;
  registrationTrend: number; // percentage change
  newUsersToday: number;
  byRole: {
    clinical_user: number;
    specialist_user: number;
    nurse_user: number;
    maternal_care_user: number;
    admin_user: number;
  };
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

  // Statistics state
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeThisMonth: 0,
    pendingVerification: 0,
    registrationTrend: 0,
    newUsersToday: 0,
    byRole: {
      clinical_user: 0,
      specialist_user: 0,
      nurse_user: 0,
      maternal_care_user: 0,
      admin_user: 0
    }
  });

  // Load users when switching to users or stats tab or changing filter
  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'stats') {
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
        calculateStats(data.data.users);
      } else {
        console.error('Invalid API response:', data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback to empty array on error
      setUsers([]);
      calculateStats([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const calculateStats = (userList: MedicalProfessional[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalUsers = userList.length;
    const activeThisMonth = userList.filter(u =>
      u.onboardingCompleted && new Date(u.createdAt) >= startOfMonth
    ).length;
    const pendingVerification = userList.filter(u =>
      !u.emailVerified || !u.licenseVerified
    ).length;
    const newUsersToday = userList.filter(u =>
      new Date(u.createdAt) >= startOfToday
    ).length;

    // Calculate role distribution
    const byRole = {
      clinical_user: userList.filter(u => u.role === 'clinical_user').length,
      specialist_user: userList.filter(u => u.role === 'specialist_user').length,
      nurse_user: userList.filter(u => u.role === 'nurse_user').length,
      maternal_care_user: userList.filter(u => u.role === 'maternal_care_user').length,
      admin_user: userList.filter(u => u.role === 'admin_user').length
    };

    // Calculate trend (comparing this month vs last month)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthUsers = userList.filter(u => {
      const created = new Date(u.createdAt);
      return created >= lastMonth && created < startOfMonth;
    }).length;

    const registrationTrend = lastMonthUsers > 0
      ? Math.round(((activeThisMonth - lastMonthUsers) / lastMonthUsers) * 100)
      : 0;

    setStats({
      totalUsers,
      activeThisMonth,
      pendingVerification,
      registrationTrend,
      newUsersToday,
      byRole
    });
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
       {/* Neumorphic Toggle - 4 tabs */}
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
            onClick={() => setActiveTab('stats')}
            className={`
              flex-1 py-3 rounded-xl
              text-[11px] font-black uppercase tracking-[0.2em]
              font-display cursor-pointer
              transition-all duration-200 ease-in-out
              ${activeTab === 'stats'
                ? 'bg-[#E0E5EC] text-purple-600 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/30 active:scale-[0.98]'
              }
            `}
          >
             <TrendingUp size={14} className="inline mr-1" />
             Stats
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

       {/* Statistics Dashboard Tab */}
       {activeTab === 'stats' && (
         <div className="flex-1 overflow-y-auto space-y-6 pr-2">
           {/* Overview Cards */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="neu-flat p-4 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                 <Users size={20} className="text-oxford" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
               </div>
               <p className="text-[32px] font-black text-oxford">{stats.totalUsers}</p>
               <p className="text-[10px] text-slate-500 mt-1">All registered</p>
             </div>

             <div className="neu-flat p-4 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                 <UserCheck size={20} className="text-green-600" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Month</p>
               </div>
               <p className="text-[32px] font-black text-green-600">{stats.activeThisMonth}</p>
               <p className="text-[10px] text-slate-500 mt-1">This month</p>
             </div>

             <div className="neu-flat p-4 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                 <AlertCircle size={20} className="text-yellow-600" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
               </div>
               <p className="text-[32px] font-black text-yellow-600">{stats.pendingVerification}</p>
               <p className="text-[10px] text-slate-500 mt-1">Need verification</p>
             </div>

             <div className="neu-flat p-4 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                 <UserPlus size={20} className="text-blue-600" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Today</p>
               </div>
               <p className="text-[32px] font-black text-blue-600">{stats.newUsersToday}</p>
               <p className="text-[10px] text-slate-500 mt-1">Today's sign-ups</p>
             </div>
           </div>

           {/* Trend Card */}
           <div className="neu-flat p-5 rounded-xl">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-[12px] font-black text-oxford uppercase tracking-wider">Registration Trend</h3>
               <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                 stats.registrationTrend > 0 ? 'bg-green-100 text-green-700' : stats.registrationTrend < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
               }`}>
                 <TrendingUp size={12} />
                 {stats.registrationTrend > 0 ? '+' : ''}{stats.registrationTrend}%
               </div>
             </div>
             <p className="text-[13px] text-slate-600">
               {stats.registrationTrend > 0
                 ? `Registration increased by ${stats.registrationTrend}% compared to last month`
                 : stats.registrationTrend < 0
                 ? `Registration decreased by ${Math.abs(stats.registrationTrend)}% compared to last month`
                 : 'No change compared to last month'}
             </p>
           </div>

           {/* Role Distribution */}
           <div className="neu-flat p-5 rounded-xl">
             <h3 className="text-[12px] font-black text-oxford uppercase tracking-wider mb-4">Users by Role</h3>
             <div className="space-y-3">
               <div>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-[11px] font-bold text-slate-600">Clinical User (Doctor)</span>
                   <span className="text-[13px] font-black text-oxford">{stats.byRole.clinical_user}</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div
                     className="h-full bg-blue-500 rounded-full transition-all"
                     style={{ width: `${stats.totalUsers > 0 ? (stats.byRole.clinical_user / stats.totalUsers) * 100 : 0}%` }}
                   />
                 </div>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-[11px] font-bold text-slate-600">Specialist User</span>
                   <span className="text-[13px] font-black text-oxford">{stats.byRole.specialist_user}</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div
                     className="h-full bg-green-500 rounded-full transition-all"
                     style={{ width: `${stats.totalUsers > 0 ? (stats.byRole.specialist_user / stats.totalUsers) * 100 : 0}%` }}
                   />
                 </div>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-[11px] font-bold text-slate-600">Nurse User</span>
                   <span className="text-[13px] font-black text-oxford">{stats.byRole.nurse_user}</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div
                     className="h-full bg-pink-500 rounded-full transition-all"
                     style={{ width: `${stats.totalUsers > 0 ? (stats.byRole.nurse_user / stats.totalUsers) * 100 : 0}%` }}
                   />
                 </div>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-[11px] font-bold text-slate-600">Maternal Care (Midwife)</span>
                   <span className="text-[13px] font-black text-oxford">{stats.byRole.maternal_care_user}</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div
                     className="h-full bg-orange-500 rounded-full transition-all"
                     style={{ width: `${stats.totalUsers > 0 ? (stats.byRole.maternal_care_user / stats.totalUsers) * 100 : 0}%` }}
                   />
                 </div>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-[11px] font-bold text-slate-600">Administrator</span>
                   <span className="text-[13px] font-black text-oxford">{stats.byRole.admin_user}</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div
                     className="h-full bg-purple-500 rounded-full transition-all"
                     style={{ width: `${stats.totalUsers > 0 ? (stats.byRole.admin_user / stats.totalUsers) * 100 : 0}%` }}
                   />
                 </div>
               </div>
             </div>
           </div>

           {/* Quick Actions */}
           <div className="neu-flat p-5 rounded-xl">
             <h3 className="text-[12px] font-black text-oxford uppercase tracking-wider mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-3">
               <button
                 onClick={() => setActiveTab('users')}
                 className="neu-flat p-4 rounded-xl text-left hover:shadow-inner transition-all group"
               >
                 <Users size={20} className="text-blue-600 mb-2" />
                 <p className="text-[11px] font-bold text-oxford">View All Users</p>
                 <p className="text-[10px] text-slate-500 mt-1">Manage registrations</p>
               </button>

               <button
                 onClick={() => {
                   setUserFilter('pending');
                   setActiveTab('users');
                 }}
                 className="neu-flat p-4 rounded-xl text-left hover:shadow-inner transition-all group"
               >
                 <AlertCircle size={20} className="text-yellow-600 mb-2" />
                 <p className="text-[11px] font-bold text-oxford">Pending Reviews</p>
                 <p className="text-[10px] text-slate-500 mt-1">{stats.pendingVerification} need attention</p>
               </button>
             </div>
           </div>
         </div>
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
