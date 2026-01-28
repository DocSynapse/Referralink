/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WaitlistPage - Exact replica from Framer HTML
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Zap, Building2, FileText, User, Loader2, X, Printer, CloudSun, Network, Hexagon, Twitter, Github, Linkedin, TrendingUp, Activity, Upload, ArrowRight, ChevronLeft, ChevronRight, MessageSquare, ChevronDown, Sun, Cloud, CloudRain, CloudLightning, CloudFog, Thermometer, Wind, Droplets, Eye, MessageCircle } from 'lucide-react';

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <MessageCircle size={size} style={style} />
);
import * as XLSX from 'xlsx';
import { searchICD10Code, searchICD10CodeStreaming, clearDiagnosisCache } from '../services/geminiService';
import { ICD10Result } from '../types';
import { GeneticGrowthMapLeaflet, getNetworkStats } from './GeneticGrowthMapLeaflet';
import { CEO_BROADCASTS } from '../constants/ceo-broadcast';
import { TextScramble } from './ui/text-scramble';
import { DockDemo } from './ui/demo';
// import { Footer } from './ui/footer';
import { isAdmin, getUserRole } from '../services/authService';
import { Users, CheckCircle, XCircle, Shield, Mail, Phone, UserCheck, UserPlus } from 'lucide-react';

// --- WEATHER ENGINE COMPONENTS ---
// Removed WeatherWidget

// Sick Leave Letter Data Interface
interface SickLeaveData {
  nama: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  umur: string;
  nomorHp: string;
  alamat: string;
  kelurahan: string;
  kota: string;
  pekerjaan: string;
  catatan: string;
  hariIstirahat: string;
  mulaiTanggal: string;
  sampaiTanggal: string;
}

const defaultSickLeaveData: SickLeaveData = {
  nama: '',
  jenisKelamin: 'Laki-laki',
  umur: '',
  nomorHp: '',
  alamat: '',
  kelurahan: '',
  kota: 'Kediri',
  pekerjaan: '',
  catatan: '',
  hariIstirahat: '3',
  mulaiTanggal: new Date().toISOString().split('T')[0],
  sampaiTanggal: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

// Health Certificate Data Interface
interface HealthCertificateData {
  nama: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  nomorHp: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  kelurahan: string;
  kota: string;
  pekerjaan: string;
  tinggiBadan: string;
  beratBadan: string;
  tekananDarah: string;
  butaWarna: 'Tidak' | 'Ya';
  catatan: string;
  keperluan: string;
}

const defaultHealthCertificateData: HealthCertificateData = {
  nama: '',
  jenisKelamin: 'Laki-laki',
  nomorHp: '',
  tempatLahir: '',
  tanggalLahir: '',
  alamat: '',
  kelurahan: '',
  kota: 'Kediri',
  pekerjaan: '',
  tinggiBadan: '',
  beratBadan: '',
  tekananDarah: '120/80',
  butaWarna: 'Tidak',
  catatan: '-',
  keperluan: 'Melamar Pekerjaan',
};

// Doctor/Institution Config (could be from settings)
const institutionConfig = {
  namaInstansi: 'UPT PUSKESMAS BALOWERTI',
  alamatInstansi: 'Jl. Balowerti No. 1, Kediri',
  kotaInstansi: 'Kediri',
  namaDokter: 'dr. Ferdi Iskandar',
  nip: '198501012010011001',
  sip: '446.4/123/SIP/2024',
};

// Hospital List for Kediri
const hospitalList = [
  {
    nama: 'RSUD Gambiran',
    igd: '(0354) 2810009',
    callCenter: '0811 3771 008 / 0812 1608 7000',
    alamat: 'Jl. Kapten Tendean No. 16, Pakunden',
    type: 'RS Umum'
  },
  {
    nama: 'RS Bhayangkara Kediri',
    igd: '0821 4108 6666',
    telepon: '(0354) 671100',
    alamat: 'Jl. Kombes Pol Duryat No. 17, Dandangan',
    type: 'RS Umum'
  },
  {
    nama: 'RS Baptis Kediri',
    telepon: '(0354) 684172',
    alamat: 'Jl. Brigjend Pol. IBH Pranoto No. 1, Pesantren',
    type: 'RS Umum'
  },
  {
    nama: 'RS Muhammadiyah Ahmad Dahlan',
    igd: '0812 3432 7784',
    alamat: 'Jl. Gatot Subroto No. 84, Mrican',
    type: 'RS Umum'
  },
  {
    nama: 'RS Tk. IV DKT Kediri',
    telepon: '(0354) 687801',
    alamat: 'Jl. Mayjend Sungkono No. 44, Semampir',
    type: 'RS Umum'
  },
  {
    nama: 'RSIA Melinda',
    telepon: '(0354) 691016',
    alamat: 'Kediri',
    type: 'RS Ibu & Anak'
  },
  {
    nama: 'RSIA Nirmala',
    telepon: '0853 3170 8008',
    alamat: 'Kediri',
    type: 'RS Ibu & Anak'
  }
];

// Referral Request Data Interface (SOAP Format)
interface ReferralRequestData {
  // Patient Info
  jenisKelamin: 'Tn.' | 'Ny.' | 'An.';
  namaPasien: string;
  umur: string;

  // Subjective
  keluhan: string;
  riwayat: string;

  // Objective - Vital Signs
  keadaanUmum: string;
  gcs: string;
  td: string;
  nadi: string;
  suhu: string;
  rr: string;
  spo2: string;

  // Objective - Lab/Penunjang
  labPenunjang: string;

  // Objective - Pemeriksaan Fisik
  pemeriksaanFisik: string;

  // Assessment & Plan
  diagnosaKerja: string;
  tindakanAwal: string;

  selectedHospital: string;
}

const defaultReferralRequestData: ReferralRequestData = {
  jenisKelamin: 'Tn.',
  namaPasien: '',
  umur: '',
  keluhan: '',
  riwayat: '',
  keadaanUmum: 'Composmentis',
  gcs: 'E4V5M6',
  td: '120/80',
  nadi: '88',
  suhu: '36.5',
  rr: '18',
  spo2: '98',
  labPenunjang: '',
  pemeriksaanFisik: '',
  diagnosaKerja: '',
  tindakanAwal: '',
  selectedHospital: hospitalList[0].nama
};

interface WaitlistPageProps {
  onBack?: () => void;
}

// Framer design tokens
const tokens = {
  dark: 'rgb(28, 28, 28)',
  gray: 'rgb(84, 84, 84)',
  border: 'rgba(0, 0, 0, 0.04)',
  bgLight: '#E0E5EC', // match main page background
  cardBg: '#E1E6EB',  // even closer to background for subtle contrast
  green: 'rgb(0, 194, 32)',
  badgeBg: '#E1E6EB',
  coral: 'rgb(255, 83, 73)',
};

// Typewriter Effect Component for the word "Link"
const TypewriterLink: React.FC = () => {
  const [text, setText] = useState('');
  const fullText = 'Link';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-signature ml-2" style={{ color: tokens.coral }}>
      {text}
      {text !== fullText && <span className="animate-pulse">|</span>}
    </span>
  );
};

const iconOnDark = '#F4F6FA';
const cardBorder = '1px solid rgba(0, 0, 0, 0.06)';

const shadowBtn = 'rgba(255,255,255,0.15) 0px 0px 20px 1.64px inset, rgba(0,0,0,0.13) 0px 1px 1px -0.3px, rgba(0,0,0,0.13) 0px 2px 1px -0.6px, rgba(0,0,0,0.13) 0px 4px 2px -1px, rgba(0,0,0,0.13) 0px 6px 4px -1.25px, rgba(0,0,0,0.13) 0px 10px 6px -1.5px, rgba(0,0,0,0.13) 0px 16px 10px -1.9px, rgba(0,0,0,0.13) 0px 27px 16px -2.2px, rgba(0,0,0,0.13) 0px 50px 30px -2.5px';

export const WaitlistPage: React.FC<WaitlistPageProps> = ({ onBack }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ICD10Result | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Streaming State
  const [streamingText, setStreamingText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  // Sick Leave Letter State
  const [showSickLeaveModal, setShowSickLeaveModal] = useState(false);
  const [sickLeaveData, setSickLeaveData] = useState<SickLeaveData>(defaultSickLeaveData);
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  // Health Certificate State
  const [showHealthCertModal, setShowHealthCertModal] = useState(false);
  const [healthCertData, setHealthCertData] = useState<HealthCertificateData>(defaultHealthCertificateData);
  const [showHealthCertPreview, setShowHealthCertPreview] = useState(false);
  const healthCertRef = useRef<HTMLDivElement>(null);

  // Smart Hospital / Referral Request State
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralData, setReferralData] = useState<ReferralRequestData>(defaultReferralRequestData);

  const [showGeneticMap, setShowGeneticMap] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(true);
  const [scrambleTrigger, setScrambleTrigger] = useState(false);

  // Admin Panel State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'verified' | 'active'>('all');
  const [stats, setStats] = useState({
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
  const userIsAdmin = isAdmin();

  // Periodic Scramble Trigger
  useEffect(() => {
    const id = setInterval(() => {
      setScrambleTrigger(prev => !prev);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Refs for click outside handling
  const newsPanelRef = useRef<HTMLDivElement>(null);
  const ceoPanelRef = useRef<HTMLDivElement>(null);

  // Handle click outside and scroll to close panels
  useEffect(() => {
    const handleInteraction = (e: MouseEvent | Event) => {
      // Close News Panel if clicked outside
      if (isNewsOpen && newsPanelRef.current && !newsPanelRef.current.contains(e.target as Node)) {
        // Check if the click was on the toggle button (which is outside the ref) - simplified logic: just close
        // But we need to be careful not to close immediately if clicking the toggle button itself
        // Actually, let's just close it. The toggle button has its own handler.
        // Wait, the toggle button is *outside* the main panel div.
        // Let's refine: if click is NOT on panel AND NOT on toggle button. 
        // For simplicity first: close if click is outside panel.
        
        // Actually, user requested "klik area lain".
        setIsNewsOpen(false);
      }

      // Close CEO Roadmap if clicked outside
      if (showRoadmap && ceoPanelRef.current && !ceoPanelRef.current.contains(e.target as Node)) {
         setShowRoadmap(false);
      }
    };

    const handleScroll = () => {
      if (isNewsOpen) setIsNewsOpen(false);
      if (showRoadmap) setShowRoadmap(false);
    };

    // Add listeners
    document.addEventListener('mousedown', handleInteraction);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isNewsOpen, showRoadmap]);

  // Chart Data State
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([
    { label: 'ISPA', value: 35 },
    { label: 'Hipertensi', value: 55 },
    { label: 'Diabetes', value: 45 },
    { label: 'Dispepsia', value: 80 },
    { label: 'Dermatitis', value: 60 },
    { label: 'Cephalgia', value: 90 },
    { label: 'Myalgia', value: 75 },
  ]);

  const [referralChartData, setReferralChartData] = useState<{ label: string; value: number }[]>([
    { label: 'RSUD Gambiran', value: 120 },
    { label: 'RS Bhayangkara', value: 95 },
    { label: 'RS Baptis', value: 80 },
    { label: 'RSIA Melinda', value: 65 },
    { label: 'RS DKT', value: 40 },
  ]);

  // Health Intel State
  const [lastUpdated, setLastUpdated] = useState<string>('JUST NOW');
  
  // CEO Broadcast Logic
  const [activeMsgId, setActiveMsgId] = useState<string | null>(CEO_BROADCASTS[0].id);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);

  useEffect(() => {
    const lastReadId = localStorage.getItem('sentra_ceo_read_id');
    // If any message in the array is newer than lastReadId, show red dot
    if (lastReadId !== CEO_BROADCASTS[0].id) {
      setHasUnreadMessage(true);
    }
  }, []);

  const handleOpenRoadmap = () => {
    setShowRoadmap(true);
    setHasUnreadMessage(false);
    localStorage.setItem('sentra_ceo_read_id', CEO_BROADCASTS[0].id);
  };

  const [healthIntel, setHealthIntel] = useState<any[]>([
    {
      time: '10:42 AM',
      type: 'ALERT',
      color: 'red',
      content: 'Lonjakan signifikan kasus ISPA (1.802 penderita) di Kota Kediri, didominasi anak-anak (60%) akibat cuaca ekstrem.'
    },
    {
      time: '09:15 AM',
      type: 'INFO',
      color: 'emerald',
      content: 'Kediri sukses melampaui target Sub PIN Polio dengan capaian 104.2% dan laporan nol kasus polio.'
    },
    {
      time: 'YESTERDAY',
      type: 'DATA',
      color: 'blue',
      content: 'Tren DBD menurun di awal 2025 (150 kasus) dibanding 2024, kewaspadaan di Mojoroto tetap tinggi.'
    }
  ]);

  // Hybrid Intel Engine: Fetch Global Health News while keeping Kediri pinned
  useEffect(() => {
    const fetchNationalNews = async () => {
      try {
        const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.antaranews.com/rss/kesehatan');
        const data = await res.json();
        
        if (data.items && data.items.length > 0) {
          const newsItems = data.items.slice(0, 2).map((item: any) => ({
            time: new Date(item.pubDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            type: 'GLOBAL',
            color: 'slate',
            content: item.title,
            link: item.link
          }));

          // Pinned Local Facts + Fresh National News
          setHealthIntel(prev => {
            const localFacts = prev.slice(0, 3); // Keep the 3 Kediri facts
            return [...localFacts, ...newsItems];
          });
          
          setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (e) {
        console.warn("Sentinel Connection Delay - Using Pinned Intel Only.");
      }
    };
    
    fetchNationalNews();
    // Auto-refresh news every 3 days
    const interval = setInterval(fetchNationalNews, 3 * 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Assume data is in format: [["Penyakit", "Jumlah"], ["Flu", 50], ...]
      // Transform to chart format
      const transformedData = (data as any[]).slice(1).map((row: any) => ({
        label: row[0] as string,
        value: parseInt(row[1] as string) || 0
      })).filter(item => item.label && item.value > 0).slice(0, 7); // Take top 7

      if (transformedData.length > 0) {
        setChartData(transformedData);
      }
    };
    reader.readAsBinaryString(file);
  };

  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleGenerate = async () => {
    if (!diagnosis.trim() || isLoading) return;

    const startTime = Date.now();
    const MIN_LOADING_DISPLAY = 1200; // Ensure diagram is visible for at least 1.2s

    setIsLoading(true);
    setShowResult(false);
    setResult(null);
    setStreamingText('');
    setIsStreaming(false);
    setFromCache(false);

    try {
      const response = await searchICD10Code({
        id: Date.now().toString(),
        query: diagnosis,
        timestamp: Date.now()
      }); // Cache enabled

      if (response.json) {
        setResult(response.json);
        setFromCache(response.fromCache || false);

        // Calculate time elapsed and ensure minimum display duration
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_DISPLAY - elapsed);

        // Delay hiding loading and showing result
        setTimeout(() => {
          setIsLoading(false);
          setTimeout(() => setShowResult(true), 100);
        }, remainingTime);
      }
    } catch (error) {
      console.error('Generate error:', error);
      setIsLoading(false);
    }
  };


  // Clear cache for current query
  const handleClearCache = async () => {
    if (diagnosis.trim()) {
      await clearDiagnosisCache(diagnosis);
      setFromCache(false);
    }
  };

  // Admin: Load users from API
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const sessionToken = localStorage.getItem('sessionToken');

      if (!sessionToken) {
        console.warn('No session token found');
        setUsers([]);
        calculateStats([]);
        setIsLoadingUsers(false);
        return;
      }

      // TEMPORARY: Use simplified endpoint for debugging
      const endpoint = '/api/admin/users-simple';
      console.log('Fetching from:', endpoint);
      console.log('Session token:', sessionToken);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);

        // Get raw response body FIRST
        const rawBody = await response.text();
        console.error('RAW RESPONSE BODY (first 500 chars):', rawBody.substring(0, 500));

        // Try to parse as JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(rawBody);
            console.error('Parsed error details:', errorData);
          } catch (e) {
            console.error('Failed to parse as JSON:', e);
          }
        }

        setUsers([]);
        calculateStats([]);
        setIsLoadingUsers(false);
        return;
      }

      // Get raw response body
      const rawBody = await response.text();
      console.log('SUCCESS - RAW RESPONSE (first 500 chars):', rawBody.substring(0, 500));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON. Content-Type:', contentType);
        console.error('Full response:', rawBody);
        setUsers([]);
        calculateStats([]);
        setIsLoadingUsers(false);
        return;
      }

      // Parse JSON
      let data;
      try {
        data = JSON.parse(rawBody);
        console.log('Parsed JSON successfully:', data);
      } catch (e) {
        console.error('JSON PARSE ERROR:', e);
        console.error('Attempted to parse:', rawBody);
        setUsers([]);
        calculateStats([]);
        setIsLoadingUsers(false);
        return;
      }
      if (data.success && data.data?.users) {
        setUsers(data.data.users);
        calculateStats(data.data.users);
      } else {
        console.error('Invalid API response:', data);
        setUsers([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
      calculateStats([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Admin: Calculate dashboard statistics
  const calculateStats = (userList: any[]) => {
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

    const byRole = {
      clinical_user: userList.filter(u => u.role === 'clinical_user').length,
      specialist_user: userList.filter(u => u.role === 'specialist_user').length,
      nurse_user: userList.filter(u => u.role === 'nurse_user').length,
      maternal_care_user: userList.filter(u => u.role === 'maternal_care_user').length,
      admin_user: userList.filter(u => u.role === 'admin_user').length
    };

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthUsers = userList.filter(u => {
      const created = new Date(u.createdAt);
      return created >= lastMonth && created < startOfMonth;
    }).length;

    const registrationTrend = lastMonthUsers > 0
      ? ((activeThisMonth - lastMonthUsers) / lastMonthUsers) * 100
      : activeThisMonth > 0 ? 100 : 0;

    setStats({
      totalUsers,
      activeThisMonth,
      pendingVerification,
      registrationTrend,
      newUsersToday,
      byRole
    });
  };

  // Admin: Load initial stats on mount
  useEffect(() => {
    if (userIsAdmin) {
      loadUsers(); // Load with current filter (default: 'all')
    }
  }, [userIsAdmin]);

  // Admin: Reload when filter changes
  useEffect(() => {
    if (userIsAdmin && userFilter !== 'all') {
      loadUsers();
    }
  }, [userFilter]);

  const faqs = [
    {
      q: "Apa saja yang saya dapat di versi uji coba?",
      a: "Anda mendapat akses penuh semua fitur: Generate kode ICD-10 otomatis dari gejala pasien, rekomendasi rujukan rumah sakit yang sesuai, buat surat rujukan/keterangan sakit/sehat otomatis, dan dukungan teknis prioritas. Semua dokumen bisa diexport PDF."
    },
    {
      q: "Apakah butuh keahlian teknis?",
      a: "Tidak sama sekali. Anda hanya perlu input keluhan dan gejala pasien seperti biasa. Sistem akan otomatis memberikan kode ICD-10, rekomendasi rujukan, dan generate surat lengkap. Tidak perlu tahu coding atau IT."
    },
    {
      q: "Kapan rencana peluncuran umum?",
      a: "Target peluncuran resmi Q1 2026. Saat ini fase beta testing untuk faskes di Kediri. Semua feedback dari pengguna akan digunakan untuk menyempurnakan sistem sebelum peluncuran umum."
    },
    {
      q: "Apakah saya bisa berhenti kapan saja?",
      a: "Ya, 100% bebas. Tidak ada kontrak, tidak ada biaya penalty. Anda bisa nonaktifkan akun kapan saja dari dashboard. Data Anda masih bisa diexport selama 30 hari setelah nonaktif."
    },
    {
      q: "Bagaimana keamanan data pasien?",
      a: "Data pasien dienkripsi penuh saat disimpan dan saat dikirim. Kami tidak pernah share data ke pihak ketiga. Setiap akses data tercatat untuk audit. Sistem kami dirancang sesuai standar keamanan data kesehatan Indonesia."
    },
    {
      q: "Bagaimana jika ada ketidaksesuaian ICD atau rujukan?",
      a: "Ada tombol 'Laporkan' di setiap hasil untuk kirim feedback. Tim klinis kami akan review dalam 24 jam untuk kasus urgent. Setiap feedback digunakan untuk meningkatkan akurasi AI. Anda akan dapat notifikasi saat issue sudah diperbaiki."
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden z-0" style={{ backgroundColor: tokens.bgLight, fontFamily: "'Geist', sans-serif" }}>
      <div
        className="absolute inset-0 z-0 h-full w-full bg-[#E0E5EC] bg-[radial-gradient(rgba(140,150,170,0.6)_1.5px,transparent_1.5px)] [background-size:14px_14px]"
      />
      {/* Vignette Shadow Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.05) 100%)'
        }}
      />
      
      {/* iOS Weather Widget - Removed */}

      <div className="relative z-10">

      {/* Roadmap Widget (toggle) */}
      {!showRoadmap && (
        <motion.button
          onClick={handleOpenRoadmap}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed top-6 right-6 z-40 group"
        >
          {/* Pulsing Ring - Only if unread */}
          {hasUnreadMessage && (
            <>
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1.5s]" />
            </>
          )}
          
          {/* Glass Capsule */}
          <div 
            className="relative flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300"
            style={{ backgroundColor: '#002147' }}
          >
            {/* Status Dot */}
            <div className="relative">
              <MessageSquare size={16} style={{ color: '#FFFFFF' }} />
              {hasUnreadMessage && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#002147] animate-pulse" />
              )}
            </div>

            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{hasUnreadMessage ? 'INCOMING' : 'MESSAGE'}</span>
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>FROM CEO</span>
            </div>
          </div>
        </motion.button>
      )}
      {showRoadmap && (
        <motion.div
          ref={ceoPanelRef}
          initial={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-6 right-6 z-40 w-[320px] max-w-[85vw] rounded-2xl border backdrop-blur-xl flex flex-col"
          style={{
            backgroundColor: 'rgba(225, 230, 235, 0.98)',
            borderColor: tokens.border,
            boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '80vh'
          }}
        >
          {/* Panel Header */}
          <div className="p-3 border-b border-black/5 flex items-center justify-between bg-[#002147] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>CEO Transmissions</span>
            </div>
            <button onClick={() => setShowRoadmap(false)} className="text-white/60 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {CEO_BROADCASTS.map((msg) => (
              <div 
                key={msg.id}
                className="rounded-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header / Trigger */}
                <button 
                  onClick={() => setActiveMsgId(activeMsgId === msg.id ? null : msg.id)}
                  className={`w-full p-3 flex items-start justify-between text-left rounded-xl transition-all duration-200 ${activeMsgId === msg.id ? 'bg-[#002147]/5' : 'hover:bg-black/5'}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 font-mono">{msg.date}</span>
                      {msg.priority === 'HIGH' && (
                        <span className="text-[8px] font-black text-red-600 bg-red-50 px-1 rounded">URGENT</span>
                      )}
                    </div>
                    <h4 className="text-[12px] font-bold text-[#002147] leading-tight">{msg.content.heading}</h4>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${activeMsgId === msg.id ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded Content with Neumorphism Inset */}
                <motion.div 
                  initial={false}
                  animate={{ height: activeMsgId === msg.id ? 'auto' : 0, opacity: activeMsgId === msg.id ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1">
                    <div className="p-3 rounded-xl space-y-3" style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-black/5">
                          <img src="/chief.svg" alt="CEO" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{msg.title}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{msg.role}</p>
                        </div>
                        <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#E1E6EB] text-slate-500 border border-black/5">
                          {msg.status}
                        </span>
                      </div>

                      <div className="space-y-2 pl-1">
                        <ol className="list-decimal list-inside space-y-1.5">
                          {msg.content.items.map((item, i) => (
                            <li key={i} className="text-[13px] text-slate-600 leading-relaxed font-mono" dangerouslySetInnerHTML={{ __html: item }} />
                          ))}
                        </ol>
                      </div>

                      <div className="bg-[#002147]/5 p-2 rounded-lg border-l-2 border-[#002147]">
                        <p className="text-[12px] italic text-slate-500 font-mono">{msg.footer}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Panel Footer */}
          <div className="p-3 bg-black/5 text-center rounded-b-2xl">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>End of Transmission</span>
          </div>
        </motion.div>
      )}

      {/* Back Button removed */}

      {/* Main Content */}
      <main className="relative z-10 max-w-[900px] mx-auto px-8">

                                {/* Left Side: Health Intel / News Widget (Collapsible) */}

                                <div 

                                  ref={newsPanelRef}

                                  className="fixed top-1/2 -translate-y-1/2 z-40 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex"

                                  style={{ 

                                    left: 0,

                                    transform: isNewsOpen ? 'translateX(0)' : 'translateX(-100%)' 

                                  }}

                                >

                                   <div className="flex flex-col gap-0">
                     {/* Kediri Radar Widget (Moved to Top) */}
                     <div 
                       className="w-56 p-3 rounded-tr-lg border-t border-r border-black/10 shadow-lg transition-all duration-300"
                       style={{ 
                         backgroundColor: tokens.cardBg,
                       }}
                     >
                        <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-black/5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse miniature-ping"/>
                          <span className="text-[13px] font-bold uppercase tracking-[0.05em]" style={{ color: tokens.dark, fontFamily: "'JetBrains Mono', monospace" }}>KEDIRI RADAR</span>
                        </div>
                        
                        <div className="space-y-2 p-2 rounded-xl" style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-medium" style={{ color: tokens.gray, fontFamily: "'JetBrains Mono', monospace" }}>DBD</span>
                              <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">WASPADA (98%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-medium" style={{ color: tokens.gray, fontFamily: "'JetBrains Mono', monospace" }}>TBC</span>
                              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">AMAN (92%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-medium" style={{ color: tokens.gray, fontFamily: "'JetBrains Mono', monospace" }}>HIV</span>
                              <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">STABIL (100%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-medium" style={{ color: tokens.gray, fontFamily: "'JetBrains Mono', monospace" }}>GIZI</span>
                              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">TURUN (0.1%)</span>
                            </div>
                        </div>
                     </div>
        
                     {/* SENTRA NEWS Widget */}
                     <div 
                       className="w-56 p-3 rounded-br-lg border-b border-r border-black/10 shadow-lg relative"
                       style={{ 
                         backgroundColor: tokens.cardBg,
                       }}
                     >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-black/5">
                                           <div className="flex items-center gap-2">
                                              <div className="w-1.5 h-1.5 bg-[#E03D00] rounded-full animate-pulse"/>
                                              <span className="text-[13px] font-bold uppercase tracking-[0.05em]" style={{ color: tokens.dark, fontFamily: "'JetBrains Mono', monospace" }}>SENTRA NEWS</span>
                                           </div>
                                           <button onClick={() => setIsNewsOpen(false)} className="hover:bg-black/5 p-1 rounded">
                                              <ChevronLeft size={14} className="animate-pulse" style={{ color: '#E03D00' }} />
                                           </button>
                                        </div>        
                        {/* News Feed */}
                        <div className="space-y-4 p-2.5 rounded-xl" style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                           {healthIntel.map((item, idx) => (
                             <div key={idx} className="group cursor-pointer" onClick={() => item.link && window.open(item.link, '_blank')}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[7px] font-mono opacity-50">{item.time}</span>
                                  <span className={`text-[6px] font-bold px-1 py-0.5 rounded bg-${item.color}-100 text-${item.color}-600`}>
                                    {item.type}
                                  </span>
                                </div>
                                <p className="text-[10px] font-medium leading-relaxed group-hover:text-[#E03D00] transition-colors line-clamp-3" style={{ color: tokens.dark, fontFamily: "'JetBrains Mono', monospace" }}>
                                   {item.content}
                                </p>
                             </div>
                           ))}
                        </div>
        
                        {/* Footer */}
                        <div className="mt-4 pt-3 border-t border-black/5 text-center">
                          <div className="flex flex-col items-center gap-1 opacity-50">
                            <span className="text-[7px] font-black uppercase tracking-widest">Sentinel Last Sync</span>
                            <span className="text-[9px] font-bold">{lastUpdated}</span>
                          </div>
                        </div>
                     </div>
                   </div>
        
                   {/* Toggle Button (Visible when closed) */}
        
                   {/* Toggle Button (Visible when closed) */}
                   <button 
                     onClick={() => setIsNewsOpen(!isNewsOpen)}
                     className={`absolute left-full top-12 bg-[#002147] text-white p-2 rounded-r-lg shadow-md hover:bg-[#E03D00] transition-colors ${isNewsOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                     title="Open News"
                   >
                     <ChevronRight size={16} />
                   </button>
                </div>
        {/* Hero Section */}
        <section className="pt-[60px] pb-10 flex flex-col items-center gap-10">

          {/* Heading */}
          <div className="flex flex-col items-center gap-8 w-full">

            {/* Content */}
            <div className="flex flex-col items-center gap-10 w-full">

              {/* Text Block */}
              <div className="flex flex-col items-center gap-4 w-full">

                {/* Title */}
                <h1
                  className="text-center leading-[1.1] space-y-1 mb-0"
                  style={{ 
                    color: tokens.dark, 
                    letterSpacing: '-0.06em', 
                    maxWidth: 560, 
                    fontFamily: "'Geist', sans-serif",
                    textShadow: '2px 2px 3px rgba(0,0,0,0.07), -2px -2px 3px rgba(255,255,255,0.8)'
                  }}
                >
                  <span className="block text-[64px] font-semibold tracking-tighter">
                    REFERRA
                    <TypewriterLink />
                  </span>
                </h1>

                {/* Dock Demo */}
                <div className="mb-4 scale-75 -mt-4">
                  <DockDemo />
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-4">
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2">
                    {[
                      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
                      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
                      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&h=80&fit=crop&crop=face'
                    ].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Healthcare professional ${i + 1}`}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      />
                    ))}
                  </div>
                  {/* Text with neumorphic background pill (Inset) */}
                  <div 
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-white/10"
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)'
                    }}
                  >
                    <TextScramble 
                      as="span" 
                      trigger={scrambleTrigger} 
                      className="text-[18px]" 
                      style={{ color: tokens.dark }}
                    >
                      Join
                    </TextScramble>
                    <TextScramble 
                      as="span" 
                      trigger={scrambleTrigger} 
                      className="text-[18px] font-medium" 
                      style={{ color: tokens.dark }}
                    >
                      8,258
                    </TextScramble>
                    <Plus size={16} style={{ color: tokens.dark }} />
                    <TextScramble 
                      as="span" 
                      trigger={scrambleTrigger} 
                      className="text-[18px]" 
                      style={{ color: tokens.dark }}
                    >
                      Sentra Healthcare Solutions Group
                    </TextScramble>
                  </div>
                </div>
            </div>

              {/* Input Form */}
              <div className="w-full max-w-[520px]">
                <div
                  className="flex items-center gap-3 p-2.5 rounded-full border"
                  style={{ backgroundColor: tokens.cardBg, borderColor: tokens.border }}
                >
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Diagnosis/ Gejala"
                    className="flex-1 px-5 py-3.5 bg-transparent text-[16px] outline-none"
                    style={{ color: tokens.dark }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !diagnosis.trim()}
                    className="px-7 py-3.5 rounded-full text-[14px] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      backgroundColor: isLoading ? tokens.gray : tokens.dark,
                      color: iconOnDark,
                      boxShadow: shadowBtn,
                      transition: 'background-color 300ms ease-out'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Menganalisis...</span>
                      </>
                    ) : (
                      'Generate'
                    )}
                  </button>
                </div>
              </div>

              {/* Results Card - Animated */}
              {(result || isLoading || isStreaming) && (
                <DiagnosisResultCard
                  result={result}
                  isVisible={showResult}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  streamingText={streamingText}
                  fromCache={fromCache}
                  onClearCache={handleClearCache}
                />
              )}
            </div>
          </div>

          {/* Admin Panel - Only visible to admins */}
          {userIsAdmin && (
            <div className="w-full pt-10">
              <div className="grid grid-cols-4 gap-5 w-full">
                <FeatureCard
                  icon={<Users size={18} />}
                  tag="Admin Panel"
                  title="All Users"
                  subtitle={`${stats.totalUsers} Total`}
                  onClick={() => {
                    setUserFilter('all');
                    setShowAdminModal(true);
                  }}
                />
                <FeatureCard
                  icon={<UserPlus size={18} />}
                  tag="Admin Panel"
                  title="Pending"
                  subtitle={`${stats.pendingVerification} Waiting`}
                  onClick={() => {
                    setUserFilter('pending');
                    setShowAdminModal(true);
                  }}
                />
                <FeatureCard
                  icon={<UserCheck size={18} />}
                  tag="Admin Panel"
                  title="Verified"
                  subtitle="Email & License ✓"
                  onClick={() => {
                    setUserFilter('verified');
                    setShowAdminModal(true);
                  }}
                />
                <FeatureCard
                  icon={<CheckCircle size={18} />}
                  tag="Admin Panel"
                  title="Active"
                  subtitle={`${stats.activeThisMonth} This Month`}
                  onClick={() => {
                    setUserFilter('active');
                    setShowAdminModal(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-5 w-full pt-10">
            <FeatureCard
              icon={<FileText size={18} />}
              tag="Smart Automation"
              title="Surat Keterangan Sakit"
              subtitle="Pemeriksaan Dokter"
              onClick={() => setShowSickLeaveModal(true)}
            />
            <FeatureCard
              icon={<FileText size={18} />}
              tag="Smart Automation"
              title="Surat Keterangan Sehat"
              subtitle="Pemeriksaan Tenaga Medis"
              onClick={() => setShowHealthCertModal(true)}
            />
            <FeatureCard
              icon={<Building2 size={18} />}
              tag="Smart Hospital"
              title="Permohonan Rujukan"
              subtitle="12 RS Rujukan"
              onClick={() => {
                // Pre-fill with current diagnosis result if available
                if (result) {
                  setReferralData({
                    ...referralData,
                    diagnosaKerja: result.proposed_referrals?.[0]?.description || result.description || diagnosis,
                    keluhan: result.evidence?.red_flags?.join(', ') || result.clinical_notes || ''
                  });
                } else if (diagnosis) {
                  setReferralData({
                    ...referralData,
                    diagnosaKerja: diagnosis,
                    keluhan: ''
                  });
                }
                setShowReferralModal(true);
              }}
            />
          </div>

          {/* New Graph Row (1.5 : 1.5 Split) */}
          <div className="grid grid-cols-2 gap-5 w-full pt-5">
            
            {/* Left: Statistic Graph */}
            <div
              className="p-6 rounded-3xl relative overflow-hidden group cursor-pointer transition-all duration-300"
              style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 0.5px ${tokens.coral}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h6 className="text-[16px] font-semibold" style={{ color: tokens.dark, fontFamily: "'Geist', sans-serif" }}>Tren Diagnosis</h6>
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: tokens.gray }}>Sentra Network Live Data</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-white/50 border border-black/5 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp size={12} />
                    +12.5%
                  </div>
               </div>

               {/* Dynamic Bars with Inset Container */}
               <div className="h-32 w-full p-4 rounded-2xl mb-2" style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                 <div className="h-full w-full flex items-end justify-between gap-3 px-1">
                    {chartData.map((d, i) => {
                      const maxVal = Math.max(...chartData.map(c => c.value));
                      const height = (d.value / maxVal) * 100;
                      return (
                        <div key={i} className="w-full relative group/bar flex flex-col justify-end items-center gap-1 h-full">
                           <span className="text-[11px] font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-5 whitespace-nowrap" style={{ color: tokens.dark }}>{d.value}</span>
                           <div 
                            className="w-full rounded-t-sm transition-all duration-500 ease-out group-hover/bar:bg-opacity-80"
                            style={{ 
                              height: `${height}%`, 
                              backgroundColor: height === 100 ? tokens.dark : '#cbd5e1' // Darkest for peak
                            }} 
                           />
                           <span className="text-[10px] font-bold truncate w-full text-center opacity-0 group-hover/bar:opacity-100 absolute bottom-1 text-white mix-blend-difference">{d.label.substring(0, 3)}</span>
                        </div>
                      );
                    })}
                 </div>
               </div>

               {/* Legend below chart */}
               <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 justify-center">
                 {chartData.map((d, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.value === Math.max(...chartData.map(c => c.value)) ? tokens.dark : '#cbd5e1' }}></div>
                     <span className="text-[12px] font-medium" style={{ color: tokens.gray }}>
                       {d.label}: <span className="font-bold" style={{ color: tokens.dark }}>{d.value}</span>
                     </span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Right: Referral Graph */}
            <div
              className="p-6 rounded-3xl relative overflow-hidden group cursor-pointer transition-all duration-300"
              style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 0.5px ${tokens.coral}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h6 className="text-[16px] font-semibold" style={{ color: tokens.dark, fontFamily: "'Geist', sans-serif" }}>Rujukan Eksternal</h6>
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: tokens.gray }}>Real-time Referral Flow</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-white/50 border border-black/5 flex flex-col items-end leading-tight">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Last Update</span>
                    <span className="text-[10px] font-black text-emerald-600">JUST NOW</span>
                  </div>
               </div>

               {/* Dynamic Bars for Referrals with Inset Container */}
               <div className="p-4 rounded-2xl" style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                 <div className="space-y-3">
                    {referralChartData.map((d, i) => {
                      const maxVal = Math.max(...referralChartData.map(c => c.value));
                      const width = (d.value / maxVal) * 100;
                      return (
                        <div key={i} className="w-full flex items-center gap-3 group/bar">
                           <div className="w-24 text-right">
                              <span className="text-[10px] font-medium truncate block" style={{ color: tokens.gray }} title={d.label}>{d.label}</span>
                           </div>
                           <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden relative">
                              <div 
                                className="h-full rounded-full transition-all duration-500 ease-out group-hover/bar:bg-opacity-80"
                                style={{ 
                                  width: `${width}%`, 
                                  backgroundColor: i === 0 ? tokens.coral : '#fca5a5' // Darkest for peak
                                }} 
                              />
                           </div>
                           <span className="text-[10px] font-bold w-8" style={{ color: tokens.dark }}>{d.value}</span>
                        </div>
                      );
                    })}
                 </div>
               </div>
            </div>

          </div>
        </section>

        {/* Sick Leave Modal */}
        {showSickLeaveModal && (
          <SickLeaveModal
            data={sickLeaveData}
            onChange={setSickLeaveData}
            onClose={() => setShowSickLeaveModal(false)}
            onGenerate={() => {
              setShowSickLeaveModal(false);
              setShowLetterPreview(true);
            }}
            currentDiagnosis={diagnosis}
          />
        )}

        {/* Letter Preview Modal */}
        {showLetterPreview && (
          <LetterPreviewModal
            data={sickLeaveData}
            config={institutionConfig}
            onClose={() => setShowLetterPreview(false)}
            letterRef={letterRef as React.RefObject<HTMLDivElement>}
          />
        )}

        {/* Health Certificate Modal */}
        {showHealthCertModal && (
          <HealthCertificateModal
            data={healthCertData}
            onChange={setHealthCertData}
            onClose={() => setShowHealthCertModal(false)}
            onGenerate={() => {
              setShowHealthCertModal(false);
              setShowHealthCertPreview(true);
            }}
          />
        )}

        {/* Health Certificate Preview Modal */}
        {showHealthCertPreview && (
          <HealthCertificatePreviewModal
            data={healthCertData}
            config={institutionConfig}
            onClose={() => setShowHealthCertPreview(false)}
            letterRef={healthCertRef as React.RefObject<HTMLDivElement>}
          />
        )}

        {/* Smart Hospital / Referral Request Modal */}
        {showReferralModal && (
          <ReferralRequestModal
            data={referralData}
            onChange={setReferralData}
            onClose={() => setShowReferralModal(false)}
            config={institutionConfig}
          />
        )}

        {/* Admin Panel Modal */}
        {showAdminModal && userIsAdmin && (
          <AdminPanelModal
            users={users}
            isLoading={isLoadingUsers}
            userFilter={userFilter}
            stats={stats}
            onFilterChange={setUserFilter}
            onClose={() => setShowAdminModal(false)}
          />
        )}

        {/* Mission Section */}
        <section className="pt-2 pb-2">
          <div
            className="rounded-3xl p-3"
            style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
          >
            <div
              className="rounded-2xl p-12"
              style={{ backgroundColor: tokens.bgLight, border: cardBorder }}
            >
              {/* Badge */}
              <div
                className="inline-block px-5 py-2.5 rounded-full text-[14px] mb-6"
                style={{ backgroundColor: tokens.badgeBg, color: tokens.dark }}
              >
                Introduction
              </div>

              {/* Content */}
              <div className="space-y-7">
                <h3
                  className="text-[32px] font-semibold leading-tight -mt-2"
                  style={{ color: tokens.dark, letterSpacing: '-0.04em' }}
                >
                  New Era of Human-AI Healthcare
                </h3>

                <div 
                  className="p-6 rounded-2xl"
                  style={{ 
                    boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.8)', 
                    backgroundColor: 'rgba(0,0,0,0.01)' 
                  }}
                >
                  <p className="text-[16px] leading-relaxed" style={{ color: tokens.gray }}>
                    The future of healthcare isn't about replacing the human touch; it is about securing it.
                    At Sentra, we are architecting a new era of Augmented Humanity—where ethical intelligence
                    handles the complexity of data, so healthcare professionals can focus entirely on the complexity of care.
                  </p>
                </div>

                {/* Info Items */}
                <div className="space-y-2">
                  <InfoItem label="Launch Date:" value="January 2026" />
                  <InfoItem label="Key Benefit:" value="Less Administrative More Productivity" />
                  <InfoItem label="Built For:" value="Sentra Healthcare Solutions" />
                </div>

                {/* Founder */}
                <div className="flex items-center gap-4 pt-5">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: tokens.dark, boxShadow: shadowBtn }}
                  >
                    <User size={18} style={{ color: iconOnDark }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[16px] font-medium" style={{ color: tokens.dark }}>
                      dr Ferdi Iskandar
                    </p>
                    <p className="text-[14px] italic" style={{ color: tokens.gray }}>
                      Founder, Sentra Solution · Architecting the Future of Clinical Integrity.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pt-0 pb-20">
          {/* Heading */}
          <div className="flex flex-col items-center gap-5 mb-10">
            <div
              className="px-5 py-2.5 rounded-full text-[14px]"
              style={{ backgroundColor: tokens.badgeBg, color: tokens.dark }}
            >
              FAQ
            </div>
            <h2
              className="text-[48px] font-semibold text-center leading-tight"
              style={{
                color: tokens.dark,
                letterSpacing: '-0.06em',
                maxWidth: 520
              }}
            >
              Frequently Asked{' '}
              <span
                className="italic font-light"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Questions
              </span>
            </h2>
          </div>

          {/* Questions Grid */}
          <div
            className="rounded-3xl p-3"
            style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
          >
            <div className="grid md:grid-cols-2 gap-5">
              {/* Left Column */}
              <div className="space-y-5">
                {faqs.slice(0, 3).map((faq, idx) => (
                  <FaqItem
                    key={idx}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openFaq === idx}
                    onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                  />
                ))}
              </div>
              {/* Right Column */}
              <div className="space-y-5">
                {faqs.slice(3).map((faq, idx) => (
                  <FaqItem
                    key={idx + 3}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openFaq === idx + 3}
                    onToggle={() => setOpenFaq(openFaq === idx + 3 ? null : idx + 3)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <p className="text-center text-[14px] mt-8" style={{ color: tokens.gray }}>
            Contact us: drferdiiskandar@sentraai.id
          </p>
        </section>

        {/* Footer - Removed */}

      </main>
    </div>
    </div>
  );
};

// Sub-components
const FeatureCard = ({ icon, tag, title, subtitle, onClick }: { icon: React.ReactNode; tag: string; title: string; subtitle?: string; onClick?: () => void }) => (
  <div
    className="relative pt-8 cursor-pointer"
    onClick={onClick}
  >
    {/* Icon Circle */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center z-10"
        style={{ backgroundColor: tokens.dark, boxShadow: shadowBtn }}
      >
      <span style={{ color: iconOnDark }}>{icon}</span>
    </div>
    {/* Card */}
    <div
      className="pt-12 pb-8 px-5 rounded-3xl text-center transition-all duration-300"
      style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 0.5px ${tokens.coral}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <h6 className="text-[18px] font-semibold mb-2" style={{ color: tokens.dark, fontFamily: "'Geist', sans-serif" }}>
        {tag}
      </h6>
      <p className="text-[16px]" style={{ color: tokens.gray, fontFamily: "'Geist', sans-serif" }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-[10px] mt-1 font-semibold uppercase tracking-wider" style={{ color: '#10b981', fontFamily: "'Geist', sans-serif" }}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[14px] font-semibold" style={{ color: tokens.dark }}>{label}</span>
    <span className="text-[16px]" style={{ color: tokens.gray }}>{value}</span>
  </div>
);

const FaqItem = ({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div
    className="rounded-3xl overflow-hidden"
    style={{ backgroundColor: tokens.bgLight, border: cardBorder }}
  >
    <button
      onClick={onToggle}
      className="w-full p-6 flex items-center justify-between text-left cursor-pointer"
    >
      <span className="text-[16px] font-medium pr-4" style={{ color: tokens.dark }}>
        {question}
      </span>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: tokens.dark, boxShadow: shadowBtn }}
      >
        {isOpen ? (
          <Minus size={16} style={{ color: iconOnDark }} />
        ) : (
          <Plus size={16} style={{ color: iconOnDark }} />
        )}
      </div>
    </button>
    {isOpen && (
      <div className="px-6 pb-6">
        <p className="text-[16px] leading-relaxed" style={{ color: tokens.gray }}>
          {answer}
        </p>
      </div>
    )}
  </div>
);

// Simple Typing Text Component - Self-contained with own state
const SimpleTypingText = () => {
  const fullText = "Async : Request accepted and processing";
  const [displayText, setDisplayText] = React.useState('');
  const charIndexRef = React.useRef(0);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    if (doneRef.current) return;

    if (charIndexRef.current < fullText.length) {
      const timeout = setTimeout(() => {
        charIndexRef.current += 1;
        setDisplayText(fullText.substring(0, charIndexRef.current));
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      doneRef.current = true;
    }
  }, [displayText]);

  return (
    <div
      className="text-center mt-6"
      style={{
        opacity: 0,
        animation: 'fadeInUpSmooth 500ms ease-out 600ms forwards'
      }}
    >
      <p className="font-mono text-base h-6 flex items-center justify-center">
        <span style={{ color: '#ec4899' }}>{displayText.substring(0, 5)}</span>
        <span style={{ color: tokens.gray }}>{displayText.substring(5)}</span>
        <span
          className="inline-block w-1.5 h-4 ml-0.5"
          style={{
            backgroundColor: '#ec4899',
            animation: 'caretBlink 0.8s step-end infinite'
          }}
        />
      </p>
    </div>
  );
};

// Diagnosis Result Cards - EXACT COPY of FeatureCard design
const DiagnosisResultCard = ({
  result,
  isVisible,
  isLoading,
  isStreaming,
  streamingText,
  fromCache,
  onClearCache
}: {
  result: ICD10Result | null;
  isVisible: boolean;
  isLoading: boolean;
  isStreaming?: boolean;
  streamingText?: string;
  fromCache?: boolean;
  onClearCache?: () => void;
}) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Streaming display - show AI reasoning progressively
  if (isStreaming && streamingText) {
    return (
      <div className="w-full pt-10">
        <div
          className="rounded-3xl p-6"
          style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
        >
          {/* Streaming Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: tokens.coral }}></span>
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: tokens.coral }}></span>
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: tokens.coral }}>
              Penalaran Klinis AI...
            </span>
          </div>

          {/* Streaming Text */}
          <div
            className="font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar"
            style={{ color: tokens.gray }}
          >
            {streamingText}
            <span
              className="inline-block w-2 h-4 ml-0.5 animate-pulse"
              style={{ backgroundColor: tokens.coral }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Loading animation with AI flow lines - Sekam Modern Style
  if (isLoading && !isStreaming) {
    const aiProviders = [
      { name: 'DeepSeek', icon: '/deepseek.svg' },
      { name: 'GLM', icon: '/glm.svg' },
      { name: 'R1', icon: '/deepseek.svg' }
    ];

    // Sekam shadow style
    const sekamShadow = `
      inset 0px -3px 0px 2px rgba(141, 194, 235, 0.25),
      0px 0.7px 0.7px -0.58px rgba(16, 49, 77, 0.21),
      0px 1.8px 1.8px -1.17px rgba(16, 49, 77, 0.2),
      0px 3.6px 3.6px -1.75px rgba(16, 49, 77, 0.2),
      0px 6.9px 6.9px -2.33px rgba(16, 49, 77, 0.18),
      0px 13.6px 13.6px -2.92px rgba(16, 49, 77, 0.16),
      0px 30px 30px -3.5px rgba(16, 49, 77, 0.09)
    `;

    return (
      <div
        className="w-full pt-8"
        style={{
          opacity: 0,
          animation: 'fadeInSmooth 400ms ease-out forwards'
        }}
      >
        {/* Diagram Container */}
        <div
          className="relative flex items-center justify-center mx-auto"
          style={{
            minHeight: '280px',
            maxWidth: '800px',
            width: '100%'
          }}
        >

          {/* SVG Connection Lines - Dashed Sekam Style */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 800 280"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Left Top to Center */}
            <path
              d="M 70 50 Q 180 50 300 120 L 370 140"
              fill="none"
              stroke="rgb(45, 106, 119)"
              strokeWidth="1"
              strokeDasharray="6, 6"
              style={{
                animation: 'flowingDashReverse 2s linear infinite'
              }}
            />

            {/* Left Middle to Center */}
            <path
              d="M 70 140 L 370 140"
              fill="none"
              stroke="rgb(45, 106, 119)"
              strokeWidth="1"
              strokeDasharray="6, 6"
              style={{
                animation: 'flowingDashReverse 2s linear infinite'
              }}
            />

            {/* Left Bottom to Center */}
            <path
              d="M 70 230 Q 180 230 300 160 L 370 140"
              fill="none"
              stroke="rgb(45, 106, 119)"
              strokeWidth="1"
              strokeDasharray="6, 6"
              style={{
                animation: 'flowingDashReverse 2s linear infinite'
              }}
            />

            {/* Right Top from Center */}
            <path
              d="M 430 140 L 500 120 Q 620 50 730 50"
              fill="none"
              stroke="rgb(45, 106, 119)"
              strokeWidth="1"
              strokeDasharray="6, 6"
              style={{
                animation: 'flowingDash 2s linear infinite'
              }}
            />

            {/* Right Middle from Center */}
            <path
              d="M 430 140 L 730 140"
              fill="none"
              stroke="rgb(45, 106, 119)"
              strokeWidth="1"
              strokeDasharray="6, 6"
              style={{
                animation: 'flowingDash 2s linear infinite'
              }}
            />

            {/* Right Bottom from Center */}
            <path
              d="M 430 140 L 500 160 Q 620 230 730 230"
              fill="none"
              stroke="rgb(45, 106, 119)"
              strokeWidth="1"
              strokeDasharray="6, 6"
              style={{
                animation: 'flowingDash 2s linear infinite'
              }}
            />

            {/* Animated flowing dots */}
            {[0, 1, 2].map((i) => (
              <circle
                key={`dot-${i}`}
                r="4"
                fill={tokens.coral}
              >
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  begin={`${0.6 + i * 0.15}s`}
                  path={
                    i === 0 ? "M 70 50 Q 180 50 300 120 L 370 140" :
                    i === 1 ? "M 70 140 L 370 140" :
                    "M 70 230 Q 180 230 300 160 L 370 140"
                  }
                />
              </circle>
            ))}
          </svg>

          {/* Left Side - AI Provider Icons with Labels */}
          <div className="absolute flex flex-col gap-10" style={{ transform: 'translateY(-50%)', top: '50%', left: '-150px' }}>
            {aiProviders.map((provider, idx) => {
              const agentParts = [
                ['The', 'Intake', 'Agent'],
                ['The', 'Reasoning', 'Agent'],
                ['The', 'Output', 'Agent']
              ];
              return (
                <div
                  key={provider.name}
                  className="flex items-center gap-3"
                  style={{
                    opacity: 0,
                    animation: `iconPop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 150}ms forwards`
                  }}
                >
                  <div className="text-right" style={{ minWidth: '100px' }}>
                    {agentParts[idx].map((line, lineIdx) => (
                      <div
                        key={lineIdx}
                        className="text-xs font-semibold uppercase tracking-wider hidden md:block"
                        style={{ color: tokens.gray, lineHeight: '1.2' }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: '#f6fbff',
                      boxShadow: sekamShadow
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: tokens.dark }}
                    >
                      <img
                        src={provider.icon}
                        alt={provider.name}
                        className="w-5 h-5"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Logo - Sentra Brain */}
          <div
            className="absolute left-1/2 top-1/2 z-10 flex flex-col items-center gap-2"
            style={{
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              animation: 'iconPop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) 400ms forwards'
            }}
          >
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center relative"
              style={{
                backgroundColor: '#f6fbff',
                boxShadow: sekamShadow
              }}
            >
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: tokens.dark,
                  animation: 'centerLogoPulse 2s ease-in-out infinite'
                }}
              >
                {/* Sentra S Logo - Single clean S */}
                <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M72 28C72 28 62 18 48 18C32 18 22 30 22 42C22 54 34 60 50 65C66 70 78 78 78 90C78 90 68 95 52 95C36 95 22 85 22 85"
                    stroke={iconOnDark}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
            {/* Sentra Brain text */}
            <span
              className="text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
              style={{ color: tokens.gray }}
            >
              Sentra Brain
            </span>
          </div>

          {/* Right Side - Output Icons */}
          <div className="absolute flex flex-col gap-10" style={{ transform: 'translateY(-50%)', top: '50%', left: 'calc(100% - 56px)' }}>
            {['ICD-10 Semantic Mapping', 'Clinical Path Intelligence', 'Resource-Aware Diagnostics'].map((label, idx) => (
              <div
                key={label}
                className="flex items-center gap-3"
                style={{
                  opacity: 0,
                  animation: `iconPop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${800 + idx * 150}ms forwards`
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: '#f6fbff',
                    boxShadow: sekamShadow
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tokens.dark }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconOnDark} strokeWidth="2">
                      {/* ICD-10 Semantic Mapping: Network/Graph */}
                      {idx === 0 && <><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></>}
                      {/* Clinical Path Intelligence: Brain/AI */}
                      {idx === 1 && <><path d="M12 2a8 8 0 0 0-8 8c0 3.5 2.2 6.5 5.3 7.6L12 22l2.7-4.4C17.8 16.5 20 13.5 20 10a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></>}
                      {/* Resource-Aware Diagnostics: Gauge/Meter */}
                      {idx === 2 && <><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M12 12l3-3"/><circle cx="12" cy="12" r="3"/></>}
                    </svg>
                  </div>
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider hidden md:block"
                  style={{ color: tokens.gray }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Text - Simple Typing */}
        <SimpleTypingText />
      </div>
    );
  }


  if (!result) return null;

  const referrals = result.proposed_referrals || [];
  // Only show what AI returns, don't pad with potentially wrong data
  const displayReferrals = referrals.slice(0, 3);

  // Generate medical interventions for clinicians
  const getMedicalInterventions = (idx: number) => {
    if (!result) return [];

    const clinicalNotes = result.clinical_notes || '';
    const reasoning = displayReferrals[idx]?.clinical_reasoning || '';
    const assessment = result.assessment;

    const interventions: { action: string; detail?: string }[] = [];

    // Parse clinical notes for medical interventions (medications, procedures)
    if (clinicalNotes) {
      // Split by comma or period, filter for medical actions
      const parts = clinicalNotes.split(/[.,]/).map(s => s.trim()).filter(s => s.length > 5);
      parts.forEach(part => {
        interventions.push({ action: part });
      });
    }

    // Add from clinical reasoning if available
    if (reasoning && interventions.length < 4) {
      interventions.push({ action: reasoning });
    }

    // Fallback medical interventions based on urgency
    if (interventions.length === 0) {
      if (result.urgency === 'EMERGENCY') {
        interventions.push(
          { action: 'Stabilisasi ABC (Airway, Breathing, Circulation)' },
          { action: 'Pasang IV line, NaCl 0.9% loading' },
          { action: 'Monitor EKG dan Pulse Oximetry' },
          { action: 'Persiapan rujuk IGD RS tipe B/A' }
        );
      } else if (result.urgency === 'URGENT') {
        interventions.push(
          { action: 'Pemeriksaan TTV lengkap' },
          { action: 'Anamnesis dan pemeriksaan fisik terfokus' },
          { action: 'Pemeriksaan penunjang sesuai indikasi' },
          { action: 'Konsultasi Sp. terkait dalam 24 jam' }
        );
      } else {
        interventions.push(
          { action: 'Edukasi pasien dan keluarga' },
          { action: 'Resep sesuai formularium FKTP' },
          { action: 'Jadwalkan kontrol 3-7 hari' }
        );
      }
    }

    return interventions.slice(0, 5);
  };

  return (
    <div
      className="w-full pt-10"
      style={{
        opacity: 0,
        animation: 'springIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}
    >
      {/* Cache indicator and refresh button */}
      {fromCache && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: tokens.badgeBg, color: tokens.gray }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
            Hasil Tersimpan
          </span>
          <button
            onClick={onClearCache}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:bg-slate-100"
            style={{ color: tokens.coral }}
            title="Hapus cache dan analisis ulang"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Perbarui
          </button>
        </div>
      )}


      <div className={`grid gap-5 ${displayReferrals.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : displayReferrals.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-3'}`}>
      {displayReferrals.map((ref, idx) => (
        <div
          key={idx}
          className="relative pt-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.85)',
            transition: `all 700ms cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 180}ms`
          }}
        >
          {/* Icon Circle - ICD-10 Code inside (Click to Copy) */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(ref.code);
              const el = document.getElementById(`copy-toast-${idx}`);
              if (el) {
                el.style.opacity = '1';
                setTimeout(() => { el.style.opacity = '0'; }, 1200);
              }
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 px-8 py-2.5 rounded-xl text-[13px] font-semibold uppercase tracking-wider cursor-pointer flex items-center justify-center z-10"
            style={{
              backgroundColor: tokens.dark,
              color: iconOnDark,
              boxShadow: shadowBtn,
              transform: 'scale(1)',
              transition: 'transform 200ms ease-out, background-color 300ms ease-out, box-shadow 300ms ease-out'
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            title="Klik untuk copy kode ICD-10"
          >
            {ref.code}
            {/* Copy Toast */}
            <span
              id={`copy-toast-${idx}`}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap transition-opacity duration-300"
              style={{ backgroundColor: tokens.coral, color: 'white', opacity: 0 }}
            >
              Tersalin!
            </span>
          </button>
          {/* Card */}
          <div
            className="relative pt-12 pb-6 px-5 rounded-3xl text-center transition-all duration-300"
            style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 0.5px ${tokens.coral}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Certified Label */}
            <span
              className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: '#10b981' }}
            >
              Certified
            </span>
            <p
              className="text-[18px] font-semibold leading-relaxed mb-0 line-clamp-3 h-[5.4rem]"
              style={{ color: tokens.dark, fontFamily: "'Geist', sans-serif" }}
              title={ref.description}
            >
              {ref.description}
            </p>
            {/* Confidence Percentage */}
            <p
              className="text-[14px] font-bold mb-3 flex items-center justify-center gap-1"
              style={{ color: idx === 0 ? '#10b981' : '#f59e0b' }}
            >
              {idx === 0 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              )}
              {(ref as any).confidence || (95 - idx * 3)}%
            </p>
            {/* Kompetensi Badge */}
            <div
              className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
              style={{
                backgroundColor: tokens.bgLight,
                color: tokens.gray,
                fontFamily: "'Geist', sans-serif"
              }}
            >
              Kompetensi {(ref as any).kompetensi || '3B'}
            </div>
            {/* Medical Intervention Button */}
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="w-full py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: expandedIdx === idx ? tokens.dark : 'transparent',
                color: expandedIdx === idx ? iconOnDark : tokens.dark,
                border: expandedIdx === idx ? `1px solid ${tokens.dark}` : `1px solid ${tokens.border}`,
                boxShadow: '1px 1px 3px rgba(0,0,0,0.08), -1px -1px 3px rgba(255,255,255,0.9)',
                fontFamily: "'Geist', sans-serif",
                animation: expandedIdx === idx ? 'none' : 'pulseOrange 1.5s ease-in-out infinite'
              }}
            >
              {expandedIdx === idx ? 'Tutup' : 'Tindakan'}
            </button>

            {/* Expanded Medical Interventions */}
            {expandedIdx === idx && (
              <div
                className="mt-4 text-left"
                style={{
                  animation: 'fadeInUpSmooth 300ms ease-out forwards'
                }}
              >
                <div
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: tokens.bgLight }}
                >
                  <p className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: tokens.gray, fontFamily: "'Geist', sans-serif" }}>
                    Tindakan Medis
                  </p>
                  <ul className="space-y-2.5">
                    {getMedicalInterventions(idx).map((item, stepIdx) => (
                      <li
                        key={stepIdx}
                        className="flex items-start gap-2.5 text-[12px]"
                        style={{
                          color: tokens.dark,
                          fontFamily: "'Geist', sans-serif",
                          opacity: 0,
                          animation: `staggerFadeIn 300ms ease-out ${stepIdx * 80}ms forwards`
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5"
                          style={{ backgroundColor: tokens.dark, color: 'white' }}
                        >
                          {stepIdx + 1}
                        </span>
                        <span className="leading-relaxed">{item.action}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tanda Bahaya */}
                  {result?.evidence?.red_flags && result.evidence.red_flags.length > 0 && (
                    <div className="mt-4 pt-3 border-t" style={{ borderColor: tokens.border }}>
                      <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.coral, fontFamily: "'Geist', sans-serif" }}>
                        Tanda Bahaya
                      </p>
                      <ul className="space-y-1">
                        {result.evidence.red_flags.slice(0, 3).map((flag, flagIdx) => (
                          <li
                            key={flagIdx}
                            className="text-[12px]"
                            style={{ color: tokens.gray, fontFamily: "'Geist', sans-serif" }}
                          >
                            • {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Literatur / Guidelines */}
                  {result?.evidence?.guidelines && result.evidence.guidelines.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: tokens.border }}>
                      <p className="text-[11px] font-medium italic" style={{ color: tokens.gray, fontFamily: "'Geist', sans-serif" }}>
                        Berdasarkan: {result.evidence.guidelines.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

// Sick Leave Form Modal
const SickLeaveModal = ({
  data,
  onChange,
  onClose,
  onGenerate,
  currentDiagnosis
}: {
  data: SickLeaveData;
  onChange: (data: SickLeaveData) => void;
  onClose: () => void;
  onGenerate: () => void;
  currentDiagnosis?: string;
}) => {
  const updateField = (field: keyof SickLeaveData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Auto-calculate end date when start date or days change
  const updateDates = (hariIstirahat: string, mulaiTanggal: string) => {
    const days = parseInt(hariIstirahat) || 1;
    const start = new Date(mulaiTanggal);
    const end = new Date(start.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
    onChange({
      ...data,
      hariIstirahat,
      mulaiTanggal,
      sampaiTanggal: end.toISOString().split('T')[0]
    });
  };

  // Auto Sentra - Fill all fields except nama and umur
  const handleAutoSentra = () => {
    const today = new Date().toISOString().split('T')[0];
    onChange({
      ...data,
      jenisKelamin: 'Laki-laki',
      nomorHp: '08123456789',
      alamat: 'Jl. Dhoho',
      kelurahan: 'Balowerti',
      kota: 'Kediri',
      pekerjaan: 'Karyawan Swasta',
      catatan: currentDiagnosis || data.catatan || 'ISPA',
      hariIstirahat: '1',
      mulaiTanggal: today,
      sampaiTanggal: today
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: tokens.cardBg, border: cardBorder, fontFamily: "'Geist', sans-serif", animation: 'fadeInUpSmooth 300ms ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-[20px] font-semibold" style={{ color: tokens.dark }}>Surat Keterangan Sakit</h3>
              <p className="text-[13px]" style={{ color: tokens.gray }}>Isi data pasien untuk generate surat</p>
            </div>
            <button
              onClick={handleAutoSentra}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: tokens.coral,
                color: 'white',
                boxShadow: '0 2px 8px rgba(255, 83, 73, 0.3)'
              }}
            >
              Auto Sentra
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X size={20} style={{ color: tokens.gray }} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              value={data.nama}
              onChange={(e) => updateField('nama', e.target.value)}
              placeholder="Nama pasien"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none focus:ring-2 focus:ring-coral/20"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Jenis Kelamin & Umur */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Jenis Kelamin
              </label>
              <select
                value={data.jenisKelamin}
                onChange={(e) => updateField('jenisKelamin', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark, backgroundColor: 'white' }}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Umur
              </label>
              <input
                type="text"
                value={data.umur}
                onChange={(e) => updateField('umur', e.target.value)}
                placeholder="25 tahun"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
          </div>

          {/* Nomor HP */}
          <div>
            <label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              <WhatsAppIcon size={14} style={{ color: '#25D366' }} />
              Nomor HP / WhatsApp
            </label>
            <input
              type="tel"
              value={data.nomorHp}
              onChange={(e) => updateField('nomorHp', e.target.value)}
              placeholder="08123456789"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Alamat
            </label>
            <input
              type="text"
              value={data.alamat}
              onChange={(e) => updateField('alamat', e.target.value)}
              placeholder="Jl. Contoh No. 123"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Kelurahan & Kota */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Kelurahan
              </label>
              <input
                type="text"
                value={data.kelurahan}
                onChange={(e) => updateField('kelurahan', e.target.value)}
                placeholder="Balowerti"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Kota
              </label>
              <input
                type="text"
                value={data.kota}
                onChange={(e) => updateField('kota', e.target.value)}
                placeholder="Kediri"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
          </div>

          {/* Pekerjaan */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Pekerjaan
            </label>
            <input
              type="text"
              value={data.pekerjaan}
              onChange={(e) => updateField('pekerjaan', e.target.value)}
              placeholder="Karyawan Swasta"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Catatan/Diagnosa */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Catatan / Diagnosa
            </label>
            <input
              type="text"
              value={data.catatan}
              onChange={(e) => updateField('catatan', e.target.value)}
              placeholder="ISPA, Demam"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Hari Istirahat & Tanggal */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Hari Istirahat
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={data.hariIstirahat}
                onChange={(e) => updateDates(e.target.value, data.mulaiTanggal)}
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Mulai
              </label>
              <input
                type="date"
                value={data.mulaiTanggal}
                onChange={(e) => updateDates(data.hariIstirahat, e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Sampai
              </label>
              <input
                type="date"
                value={data.sampaiTanggal}
                readOnly
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none bg-slate-50"
                style={{ borderColor: tokens.border, color: tokens.gray }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-[13px] font-semibold border transition-colors hover:bg-slate-50"
            style={{ borderColor: tokens.border, color: tokens.gray }}
          >
            Batal
          </button>
          <button
            onClick={onGenerate}
            disabled={!data.nama.trim()}
            className="flex-1 py-3 rounded-full text-[13px] font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: tokens.dark, boxShadow: shadowBtn }}
          >
            Generate Surat
          </button>
        </div>
      </div>
    </div>
  );
};

// Letter Preview Modal
const LetterPreviewModal = ({
  data,
  config,
  onClose,
  letterRef
}: {
  data: SickLeaveData;
  config: typeof institutionConfig;
  onClose: () => void;
  letterRef: React.RefObject<HTMLDivElement>;
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const noSurat = `SKS/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-3xl rounded-3xl p-6 max-h-[95vh] overflow-y-auto"
        style={{ backgroundColor: 'white', fontFamily: "'Geist', sans-serif", animation: 'fadeInUpSmooth 300ms ease-out' }}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h3 className="text-[18px] font-semibold" style={{ color: tokens.dark }}>Preview Surat</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ backgroundColor: tokens.coral }}
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <X size={20} style={{ color: tokens.gray }} />
            </button>
          </div>
        </div>

        {/* Letter Content */}
        <div
          ref={letterRef}
          className="bg-white p-8 border rounded-xl print:border-0 print:p-0"
          style={{ borderColor: tokens.border, fontFamily: 'Geist, sans-serif', fontSize: '12pt', lineHeight: '1.6' }}
        >
          {/* Kop Surat */}
          <div className="flex items-start gap-4 pb-3 border-b-2 border-black mb-6">
            <img
              src="/logo-kediri.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex-1 text-center">
              <h1 className="text-[16pt] font-bold">{config.namaInstansi}</h1>
              <p className="text-[11pt]">{config.alamatInstansi}</p>
            </div>
            <div className="w-16" />
          </div>

          {/* Judul Surat */}
          <div className="text-center mb-6">
            <h2 className="text-[14pt] font-bold underline">SURAT KETERANGAN SAKIT</h2>
            <p className="text-[11pt]">No: {noSurat}</p>
          </div>

          {/* Isi Surat */}
          <div className="space-y-4 text-[12pt]">
            <p>Yang bertanda tangan dibawah ini :</p>

            <table className="ml-4">
              <tbody>
                <tr>
                  <td className="pr-4">Dokter</td>
                  <td className="pr-2">:</td>
                  <td>{config.namaDokter}</td>
                </tr>
              </tbody>
            </table>

            <p>Menerangkan Bahwa :</p>

            <table className="ml-4">
              <tbody>
                <tr>
                  <td className="pr-4 align-top" style={{ width: '120px' }}>Nama</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.nama || '-'}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Jenis Kelamin</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.jenisKelamin}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Umur</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.umur || '-'}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Alamat</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.alamat} KEL {data.kelurahan} {data.kota}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Pekerjaan</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.pekerjaan || '-'}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Catatan</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.catatan || '-'}</td>
                </tr>
              </tbody>
            </table>

            <p className="text-justify">
              Bahwa pada pemeriksaan kesehatan pada saat ini ternyata dalam keadaan <strong>Sakit</strong>,
              sehingga perlu istirahat selama <strong>{data.hariIstirahat} hari</strong>,
              mulai tanggal <strong>{formatDate(data.mulaiTanggal)}</strong> s/d <strong>{formatDate(data.sampaiTanggal)}</strong>.
            </p>

            <p>Demikian surat keterangan ini dibuat agar digunakan sebagaimana mestinya.</p>
          </div>

          {/* Tanda Tangan */}
          <div className="mt-12 text-right">
            <p>{config.kotaInstansi}, {today}</p>
            <p>Dokter/Tenaga Medis</p>
            <div className="h-20" />
            <p className="font-bold">{config.namaDokter}</p>
            <p>NIP/SIP : {config.nip}/{config.sip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Health Certificate Form Modal
const HealthCertificateModal = ({
  data,
  onChange,
  onClose,
  onGenerate
}: {
  data: HealthCertificateData;
  onChange: (data: HealthCertificateData) => void;
  onClose: () => void;
  onGenerate: () => void;
}) => {
  const updateField = (field: keyof HealthCertificateData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Auto Sentra - Fill all fields except nama
  const handleAutoSentra = () => {
    onChange({
      ...data,
      jenisKelamin: 'Laki-laki',
      nomorHp: '08123456789',
      tempatLahir: 'Kediri',
      tanggalLahir: '1990-01-01',
      alamat: 'Jl. Dhoho',
      kelurahan: 'Balowerti',
      kota: 'Kediri',
      pekerjaan: 'Karyawan Swasta',
      tinggiBadan: '170',
      beratBadan: '65',
      tekananDarah: '120/80',
      butaWarna: 'Tidak',
      catatan: '-',
      keperluan: 'Melamar Pekerjaan',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: tokens.cardBg, border: cardBorder, fontFamily: "'Geist', sans-serif", animation: 'fadeInUpSmooth 300ms ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-[20px] font-semibold" style={{ color: tokens.dark }}>Surat Keterangan Sehat</h3>
              <p className="text-[13px]" style={{ color: tokens.gray }}>Isi data pasien untuk generate surat</p>
            </div>
            <button
              onClick={handleAutoSentra}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: tokens.coral,
                color: 'white',
                boxShadow: '0 2px 8px rgba(255, 83, 73, 0.3)'
              }}
            >
              Auto Sentra
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X size={20} style={{ color: tokens.gray }} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              value={data.nama}
              onChange={(e) => updateField('nama', e.target.value)}
              placeholder="Nama pasien"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Jenis Kelamin & Tempat Lahir */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Jenis Kelamin
              </label>
              <select
                value={data.jenisKelamin}
                onChange={(e) => updateField('jenisKelamin', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark, backgroundColor: 'white' }}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Tempat Lahir
              </label>
              <input
                type="text"
                value={data.tempatLahir}
                onChange={(e) => updateField('tempatLahir', e.target.value)}
                placeholder="Kediri"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={data.tanggalLahir}
              onChange={(e) => updateField('tanggalLahir', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Nomor HP */}
          <div>
            <label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              <WhatsAppIcon size={14} style={{ color: '#25D366' }} />
              Nomor HP / WhatsApp
            </label>
            <input
              type="tel"
              value={data.nomorHp}
              onChange={(e) => updateField('nomorHp', e.target.value)}
              placeholder="08123456789"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Alamat
            </label>
            <input
              type="text"
              value={data.alamat}
              onChange={(e) => updateField('alamat', e.target.value)}
              placeholder="Jl. Contoh No. 123"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Kelurahan & Kota */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Kelurahan
              </label>
              <input
                type="text"
                value={data.kelurahan}
                onChange={(e) => updateField('kelurahan', e.target.value)}
                placeholder="Balowerti"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Kota
              </label>
              <input
                type="text"
                value={data.kota}
                onChange={(e) => updateField('kota', e.target.value)}
                placeholder="Kediri"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
          </div>

          {/* Pekerjaan */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Pekerjaan
            </label>
            <input
              type="text"
              value={data.pekerjaan}
              onChange={(e) => updateField('pekerjaan', e.target.value)}
              placeholder="Karyawan Swasta"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* TB/BB */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Tinggi Badan (cm)
              </label>
              <input
                type="text"
                value={data.tinggiBadan}
                onChange={(e) => updateField('tinggiBadan', e.target.value)}
                placeholder="170"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Berat Badan (kg)
              </label>
              <input
                type="text"
                value={data.beratBadan}
                onChange={(e) => updateField('beratBadan', e.target.value)}
                placeholder="65"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
          </div>

          {/* Tekanan Darah & Buta Warna */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Tekanan Darah
              </label>
              <input
                type="text"
                value={data.tekananDarah}
                onChange={(e) => updateField('tekananDarah', e.target.value)}
                placeholder="120/80"
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
                Buta Warna
              </label>
              <select
                value={data.butaWarna}
                onChange={(e) => updateField('butaWarna', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                style={{ borderColor: tokens.border, color: tokens.dark, backgroundColor: 'white' }}
              >
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
              </select>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Catatan
            </label>
            <input
              type="text"
              value={data.catatan}
              onChange={(e) => updateField('catatan', e.target.value)}
              placeholder="-"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>

          {/* Keperluan */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.gray }}>
              Keperluan
            </label>
            <input
              type="text"
              value={data.keperluan}
              onChange={(e) => updateField('keperluan', e.target.value)}
              placeholder="Melamar Pekerjaan"
              className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
              style={{ borderColor: tokens.border, color: tokens.dark }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-[13px] font-semibold border transition-colors hover:bg-slate-50"
            style={{ borderColor: tokens.border, color: tokens.gray }}
          >
            Batal
          </button>
          <button
            onClick={onGenerate}
            disabled={!data.nama.trim()}
            className="flex-1 py-3 rounded-full text-[13px] font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: tokens.dark, boxShadow: shadowBtn }}
          >
            Generate Surat
          </button>
        </div>
      </div>
    </div>
  );
};

// Health Certificate Preview Modal
const HealthCertificatePreviewModal = ({
  data,
  config,
  onClose,
  letterRef
}: {
  data: HealthCertificateData;
  config: typeof institutionConfig;
  onClose: () => void;
  letterRef: React.RefObject<HTMLDivElement>;
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const noSurat = `SKK/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-3xl rounded-3xl p-6 max-h-[95vh] overflow-y-auto"
        style={{ backgroundColor: 'white', fontFamily: "'Geist', sans-serif", animation: 'fadeInUpSmooth 300ms ease-out' }}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h3 className="text-[18px] font-semibold" style={{ color: tokens.dark }}>Preview Surat</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ backgroundColor: tokens.coral }}
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <X size={20} style={{ color: tokens.gray }} />
            </button>
          </div>
        </div>

        {/* Letter Content */}
        <div
          ref={letterRef}
          className="bg-white p-8 border rounded-xl print:border-0 print:p-0"
          style={{ borderColor: tokens.border, fontFamily: 'Geist, sans-serif', fontSize: '12pt', lineHeight: '1.6' }}
        >
          {/* Kop Surat */}
          <div className="flex items-start gap-4 pb-3 border-b-2 border-black mb-6">
            <img
              src="/logo-kediri.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex-1 text-center">
              <h1 className="text-[16pt] font-bold">{config.namaInstansi}</h1>
              <p className="text-[11pt]">{config.alamatInstansi}</p>
            </div>
            <div className="w-16" />
          </div>

          {/* Judul Surat */}
          <div className="text-center mb-6">
            <h2 className="text-[14pt] font-bold underline">SURAT KETERANGAN SEHAT</h2>
            <p className="text-[11pt]">No: {noSurat}</p>
          </div>

          {/* Isi Surat */}
          <div className="space-y-4 text-[12pt]">
            <p>Yang bertanda tangan dibawah ini :</p>

            <table className="ml-4">
              <tbody>
                <tr>
                  <td className="pr-4">Dokter</td>
                  <td className="pr-2">:</td>
                  <td>{config.namaDokter}</td>
                </tr>
              </tbody>
            </table>

            <p>Menerangkan Bahwa :</p>

            <table className="ml-4">
              <tbody>
                <tr>
                  <td className="pr-4 align-top" style={{ width: '150px' }}>Nama</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.nama || '-'}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Jenis Kelamin</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.jenisKelamin}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Tempat/Tanggal Lahir</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.tempatLahir || '-'}, {formatDate(data.tanggalLahir)}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Alamat</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.alamat} KEL {data.kelurahan} {data.kota}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Pekerjaan</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.pekerjaan || '-'}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">TB/BB</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.tinggiBadan || '-'}/{data.beratBadan || '-'}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Tekanan Darah</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.tekananDarah || '-'} MmHg</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Buta Warna</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.butaWarna}</td>
                </tr>
                <tr>
                  <td className="pr-4 align-top">Catatan</td>
                  <td className="pr-2 align-top">:</td>
                  <td>{data.catatan || '-'}</td>
                </tr>
              </tbody>
            </table>

            <p className="text-justify">
              Bahwa pada pemeriksaan dalam keadaan "<strong>Sehat</strong>", surat keterangan ini dipergunakan untuk keperluan <strong>{data.keperluan || '-'}</strong>.
            </p>

            <p>Demikian surat keterangan ini dibuat agar digunakan sebagaimana mestinya.</p>
          </div>

          {/* Tanda Tangan - Two columns */}
          <div className="mt-12 flex justify-between">
            {/* Yang Diperiksa */}
            <div className="text-center">
              <p>Yang Diperiksa</p>
              <div className="h-20" />
              <p className="font-bold">{data.nama || '-'}</p>
            </div>

            {/* Dokter/Tenaga Medis */}
            <div className="text-right">
              <p>{config.kotaInstansi}, {today}</p>
              <p>Dokter/Tenaga Medis</p>
              <div className="h-20" />
              <p className="font-bold">{config.namaDokter}</p>
              <p>NIP/SIP : {config.nip}/{config.sip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Smart Hospital / Referral Request Modal (SOAP Format)
const ReferralRequestModal = ({
  data,
  onChange,
  onClose,
  config
}: {
  data: ReferralRequestData;
  onChange: (data: ReferralRequestData) => void;
  onClose: () => void;
  config: typeof institutionConfig;
}) => {
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const updateField = (field: keyof ReferralRequestData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const selectedHospital = hospitalList.find(h => h.nama === data.selectedHospital) || hospitalList[0];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  // Default normal physical examination
  const defaultPemeriksaanFisik = `K/L: a/i/c/d -/-/-/-, pembesaran KGB (-)
Thorax: simetris, retraksi (-)
Cor: S1S2 reguler, murmur (-), gallop (-)
Pulmo: vesikuler +/+, rhonki -/-, wheezing -/-
Abdomen: supel, BU (+) normal, nyeri tekan (-), hepar/lien ttb
Ekstremitas: akral hangat, CRT <2 detik, edema -/-`;

  const generateWhatsAppMessage = () => {
    // Use default normal values if pemeriksaanFisik is empty
    const pemFisik = data.pemeriksaanFisik?.trim() || defaultPemeriksaanFisik;

    const message = `${getGreeting()} Dok, mohon izin mengganggu waktunya.

Perkenalkan saya dari *IGD ${config.namaInstansi}*, hendak mengkonsultasikan pasien:

━━━━━━━━━━━━━━━━━━━━
*${data.jenisKelamin} ${data.namaPasien}, ${data.umur}*
━━━━━━━━━━━━━━━━━━━━

*S (Subjective):*
${data.keluhan}${data.riwayat ? `\n_RPD: ${data.riwayat}_` : ''}

*O (Objective):*
• KU: ${data.keadaanUmum || 'Composmentis'} | GCS: ${data.gcs || 'E4V5M6'}
• TD: ${data.td || '-'} mmHg | Nadi: ${data.nadi || '-'} x/mnt
• Suhu: ${data.suhu || '-'}°C | RR: ${data.rr || '-'} x/mnt | SpO₂: ${data.spo2 || '-'}%
${data.labPenunjang ? `\n*Lab/Penunjang:*\n${data.labPenunjang}` : ''}

*Pemeriksaan Fisik:*
${pemFisik}

*A (Assessment):*
${data.diagnosaKerja}

*P (Planning):*
${data.tindakanAwal}

━━━━━━━━━━━━━━━━━━━━
Mohon advis dan tatalaksana lebih lanjut Dok.
Terima kasih atas waktunya 🙏`;

    setGeneratedMessage(message);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const phoneNumber = selectedHospital.igd?.replace(/[^0-9]/g, '') ||
                       selectedHospital.telepon?.replace(/[^0-9]/g, '') || '';
    const formattedPhone = phoneNumber.startsWith('0') ? '62' + phoneNumber.slice(1) : phoneNumber;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(generatedMessage)}`;
    window.open(url, '_blank');
  };

  // Auto Sentra - Demo case HHS
  const handleAutoSentra = () => {
    onChange({
      ...data,
      jenisKelamin: 'Ny.',
      namaPasien: 'Ani Ruliah',
      umur: '60th',
      keluhan: 'Semakin lemas karena 2 hari tidak mau makan, mual muntah selama 2 hari, keluarga pasien mengaku pasien gelisah',
      riwayat: 'Riwayat ranap di RSUD Gambiran bulan September 2024 karena Gula darah tinggi >600',
      keadaanUmum: 'Gelisah',
      gcs: 'E3V4M4',
      td: '141/73',
      nadi: '133',
      suhu: '37',
      rr: '18',
      spo2: '96',
      labPenunjang: `GDS stik: 590
GDS darah vena: 577
Leukosit: 12.820`,
      pemeriksaanFisik: `K/L: a/i/c/d -/-/-/-
Kepala: anemis -, ikterik -, JVP tdk meningkat
Cor: S1S2 tunggal, m-, g-
Pulmo: ves +/+ rh-/- wh-/-
Eks atas: Akral dingin -/-, CRT<2dtk, pitting edem -
Eks bawah: Akral dingin -/-, CRT<2dtk, pitting edem -
Abd: Nyeri tekan -, dbn`,
      diagnosaKerja: 'Susp. HHS (Hyperosmolar Hyperglycemic State)',
      tindakanAwal: 'IV RL 8tpm, Oksigen masker',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-4xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: tokens.cardBg, border: cardBorder, fontFamily: "'Geist', sans-serif", animation: 'fadeInUpSmooth 300ms ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-[20px] font-semibold" style={{ color: tokens.dark }}>Konsultasi Rujukan RS</h3>
              <p className="text-[13px]" style={{ color: tokens.gray }}>Format SOAP untuk konsul via WhatsApp</p>
            </div>
            <button
              onClick={handleAutoSentra}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: tokens.coral,
                color: 'white',
                boxShadow: '0 2px 8px rgba(255, 83, 73, 0.3)'
              }}
            >
              Demo HHS
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X size={20} style={{ color: tokens.gray }} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Left Column - Form (3 cols) */}
          <div className="col-span-3 space-y-4">
            {/* Patient Info Row */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.gray }}>
                  Title
                </label>
                <select
                  value={data.jenisKelamin}
                  onChange={(e) => updateField('jenisKelamin', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor: tokens.border, color: tokens.dark, backgroundColor: 'white' }}
                >
                  <option value="Tn.">Tn.</option>
                  <option value="Ny.">Ny.</option>
                  <option value="An.">An.</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.gray }}>
                  Nama Pasien
                </label>
                <input
                  type="text"
                  value={data.namaPasien}
                  onChange={(e) => updateField('namaPasien', e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor: tokens.border, color: tokens.dark }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: tokens.gray }}>
                  Umur
                </label>
                <input
                  type="text"
                  value={data.umur}
                  onChange={(e) => updateField('umur', e.target.value)}
                  placeholder="60th"
                  className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor: tokens.border, color: tokens.dark }}
                />
              </div>
            </div>

            {/* Subjective */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: tokens.bgLight }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: tokens.coral }}>
                S (Subjective)
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: tokens.gray }}>Keluhan Utama</label>
                  <textarea
                    value={data.keluhan}
                    onChange={(e) => updateField('keluhan', e.target.value)}
                    placeholder="Lemas, mual muntah, sesak nafas..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none resize-none"
                    style={{ borderColor: tokens.border, color: tokens.dark }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: tokens.gray }}>Riwayat Penyakit</label>
                  <input
                    type="text"
                    value={data.riwayat}
                    onChange={(e) => updateField('riwayat', e.target.value)}
                    placeholder="DM, HT, CHF, riwayat rawat inap..."
                    className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none"
                    style={{ borderColor: tokens.border, color: tokens.dark }}
                  />
                </div>
              </div>
            </div>

            {/* Objective */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: tokens.bgLight }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: tokens.coral }}>
                O (Objective)
              </p>
              <div className="space-y-3">
                {/* Vital Signs Row */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>KU</label>
                    <input
                      type="text"
                      value={data.keadaanUmum}
                      onChange={(e) => updateField('keadaanUmum', e.target.value)}
                      placeholder="Composmentis"
                      className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: tokens.border, color: tokens.dark }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>GCS</label>
                    <input
                      type="text"
                      value={data.gcs}
                      onChange={(e) => updateField('gcs', e.target.value)}
                      placeholder="E4V5M6"
                      className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: tokens.border, color: tokens.dark }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>TD (mmHg)</label>
                    <input
                      type="text"
                      value={data.td}
                      onChange={(e) => updateField('td', e.target.value)}
                      placeholder="120/80"
                      className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: tokens.border, color: tokens.dark }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>Nadi</label>
                    <input
                      type="text"
                      value={data.nadi}
                      onChange={(e) => updateField('nadi', e.target.value)}
                      placeholder="88"
                      className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: tokens.border, color: tokens.dark }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>Suhu (°C)</label>
                    <input
                      type="text"
                      value={data.suhu}
                      onChange={(e) => updateField('suhu', e.target.value)}
                      placeholder="36.5"
                      className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: tokens.border, color: tokens.dark }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>RR</label>
                    <input
                      type="text"
                      value={data.rr}
                      onChange={(e) => updateField('rr', e.target.value)}
                      placeholder="18"
                      className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: tokens.border, color: tokens.dark }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>SpO2 (%)</label>
                    <input
                      type="text"
                      value={data.spo2}
                      onChange={(e) => updateField('spo2', e.target.value)}
                      placeholder="98"
                      className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: tokens.border, color: tokens.dark }}
                    />
                  </div>
                </div>
                {/* Lab */}
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>Lab / Penunjang</label>
                  <textarea
                    value={data.labPenunjang}
                    onChange={(e) => updateField('labPenunjang', e.target.value)}
                    placeholder="GDS, Leukosit, Hb, EKG..."
                    rows={2}
                    className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none resize-none"
                    style={{ borderColor: tokens.border, color: tokens.dark }}
                  />
                </div>
                {/* Pemeriksaan Fisik */}
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: tokens.gray }}>Pemeriksaan Fisik</label>
                  <textarea
                    value={data.pemeriksaanFisik}
                    onChange={(e) => updateField('pemeriksaanFisik', e.target.value)}
                    placeholder="K/L, Thorax, Abdomen, Ekstremitas..."
                    rows={3}
                    className="w-full px-2 py-1.5 rounded-lg border text-[12px] outline-none resize-none"
                    style={{ borderColor: tokens.border, color: tokens.dark }}
                  />
                </div>
              </div>
            </div>

            {/* Assessment & Plan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: tokens.bgLight }}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: tokens.coral }}>
                  A (Assessment)
                </p>
                <input
                  type="text"
                  value={data.diagnosaKerja}
                  onChange={(e) => updateField('diagnosaKerja', e.target.value)}
                  placeholder="Diagnosa kerja"
                  className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor: tokens.border, color: tokens.dark }}
                />
              </div>
              <div className="p-4 rounded-2xl" style={{ backgroundColor: tokens.bgLight }}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: tokens.coral }}>
                  P (Plan)
                </p>
                <input
                  type="text"
                  value={data.tindakanAwal}
                  onChange={(e) => updateField('tindakanAwal', e.target.value)}
                  placeholder="IV RL, O2, dll"
                  className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor: tokens.border, color: tokens.dark }}
                />
              </div>
            </div>

            {/* RS Tujuan & Generate */}
            <div className="flex gap-3">
              <div className="flex-1">
                <select
                  value={data.selectedHospital}
                  onChange={(e) => updateField('selectedHospital', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor: tokens.border, color: tokens.dark, backgroundColor: 'white' }}
                >
                  {hospitalList.map((h) => (
                    <option key={h.nama} value={h.nama}>
                      {h.nama}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={generateWhatsAppMessage}
                disabled={!data.namaPasien.trim() || !data.diagnosaKerja.trim()}
                className="px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: tokens.dark, boxShadow: shadowBtn }}
              >
                Generate
              </button>
            </div>
          </div>

          {/* Right Column - Preview (2 cols) */}
          <div className="col-span-2 space-y-4">
            {/* Hospital Info Card */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: tokens.bgLight }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.gray }}>
                RS Tujuan
              </p>
              <p className="text-[14px] font-semibold" style={{ color: tokens.dark }}>{selectedHospital.nama}</p>
              <p className="text-[12px]" style={{ color: tokens.gray }}>{selectedHospital.alamat}</p>
              {selectedHospital.igd && (
                <p className="text-[12px] mt-1 font-semibold" style={{ color: tokens.coral }}>
                  🚨 IGD: {selectedHospital.igd}
                </p>
              )}
              {selectedHospital.telepon && (
                <p className="text-[12px]" style={{ color: tokens.gray }}>📞 {selectedHospital.telepon}</p>
              )}
            </div>

            {/* Generated Message Preview */}
            {generatedMessage ? (
              <div className="p-4 rounded-2xl" style={{ backgroundColor: '#DCF8C6' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.dark }}>
                  Preview WhatsApp
                </p>
                <pre className="text-[11px] whitespace-pre-wrap leading-relaxed" style={{ color: tokens.dark, fontFamily: "'Geist', sans-serif" }}>
                  {generatedMessage}
                </pre>
              </div>
            ) : (
              <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: tokens.bgLight }}>
                <p className="text-[12px]" style={{ color: tokens.gray }}>
                  Isi form lalu klik Generate untuk preview pesan
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {generatedMessage && (
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 rounded-full text-[13px] font-semibold border transition-all hover:bg-slate-50 flex items-center justify-center gap-2"
                  style={{ borderColor: tokens.border, color: copied ? tokens.coral : tokens.gray }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <button
                  onClick={openWhatsApp}
                  className="flex-1 py-3 rounded-full text-[13px] font-semibold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <WhatsAppIcon size={16} />
                  Kirim WA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Panel Modal - Full Screen
const AdminPanelModal = ({
  users,
  isLoading,
  userFilter,
  stats,
  onFilterChange,
  onClose
}: {
  users: any[];
  isLoading: boolean;
  userFilter: 'all' | 'pending' | 'verified' | 'active';
  stats: any;
  onFilterChange: (filter: 'all' | 'pending' | 'verified' | 'active') => void;
  onClose: () => void;
}) => {
  const filterTitles = {
    all: 'All Users',
    pending: 'Pending Verification',
    verified: 'Verified Users',
    active: 'Active Users'
  };

  const filterDescriptions = {
    all: 'All registered medical professionals',
    pending: 'Users waiting for email or license verification',
    verified: 'Users with email and license verified',
    active: 'Users who completed onboarding this month'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ backgroundColor: tokens.bgLight }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 p-6 border-b flex items-center justify-between"
          style={{ backgroundColor: tokens.cardBg, borderColor: tokens.border }}
        >
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: tokens.dark }}>
              {filterTitles[userFilter]}
            </h2>
            <p className="text-sm mt-1" style={{ color: tokens.gray }}>
              {filterDescriptions[userFilter]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={24} style={{ color: tokens.dark }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin" style={{ color: tokens.gray }} />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: tokens.gray }}>
                No users found for "{userFilter}" filter
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-6 rounded-3xl"
                  style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold" style={{ color: tokens.dark }}>
                          {user.fullName}
                        </h4>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                          style={{
                            backgroundColor: tokens.badgeBg,
                            color: tokens.dark
                          }}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4" style={{ color: tokens.gray }}>
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield size={14} />
                          <span>{user.licenseType}: {user.licenseNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 size={14} />
                          <span>{user.institutionName}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} />
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          {user.emailVerified ? (
                            <CheckCircle size={16} style={{ color: '#10b981' }} />
                          ) : (
                            <XCircle size={16} style={{ color: '#ef4444' }} />
                          )}
                          <span className="text-sm font-medium" style={{ color: tokens.gray }}>
                            Email {user.emailVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.licenseVerified ? (
                            <CheckCircle size={16} style={{ color: '#10b981' }} />
                          ) : (
                            <XCircle size={16} style={{ color: '#ef4444' }} />
                          )}
                          <span className="text-sm font-medium" style={{ color: tokens.gray }}>
                            License {user.licenseVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.onboardingCompleted ? (
                            <CheckCircle size={16} style={{ color: '#10b981' }} />
                          ) : (
                            <XCircle size={16} style={{ color: '#ef4444' }} />
                          )}
                          <span className="text-sm font-medium" style={{ color: tokens.gray }}>
                            {user.onboardingCompleted ? 'Active' : 'Onboarding'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium mb-1" style={{ color: tokens.gray }}>
                        Registered
                      </div>
                      <div className="text-sm font-semibold" style={{ color: tokens.dark }}>
                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
