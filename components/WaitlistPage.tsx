/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WaitlistPage - Exact replica from Framer HTML
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Zap, Building2, FileText, User, Loader2, X, Printer, CloudSun, Network } from 'lucide-react';
import { searchICD10Code, searchICD10CodeStreaming, clearDiagnosisCache } from '../services/geminiService';
import { ICD10Result } from '../types';
import { GeneticGrowthMapEmbed } from './GeneticGrowthMapEmbed';

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
  const [alphaCollapsed, setAlphaCollapsed] = useState(false);

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

  // Genetic Growth Map State
  const [showGeneticMap, setShowGeneticMap] = useState(false);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleGenerate = async () => {
    if (!diagnosis.trim() || isLoading) return;

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
        setTimeout(() => setShowResult(true), 100);
      }
    } catch (error) {
      console.error('Generate error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-collapse Alpha Tester card after 30s or on first scroll
  useEffect(() => {
    const timer = setTimeout(() => setAlphaCollapsed(true), 30000);
    const onScroll = () => setAlphaCollapsed(true);
    window.addEventListener('scroll', onScroll, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Clear cache for current query
  const handleClearCache = async () => {
    if (diagnosis.trim()) {
      await clearDiagnosisCache(diagnosis);
      setFromCache(false);
    }
  };

  const faqs = [
    { q: "Apa saja yang saya dapat di versi uji coba?", a: "Akses penuh ke fitur rujukan otomatis, validasi ICD, dan prioritas dukungan selama fase beta." },
    { q: "Apakah butuh keahlian teknis?", a: "Tidak. Alur dirancang sederhana untuk tim klinis; cukup masukkan keluhan/diagnosa lalu sistem memberi saran rujukan." },
    { q: "Kapan rencana peluncuran umum?", a: "Target go-live Q1 2026; pengguna awal akan mendapat notifikasi lebih dulu." },
    { q: "Apakah saya bisa berhenti kapan saja?", a: "Bisa. Anda dapat keluar dari program beta atau berhenti menerima pembaruan kapan saja." },
    { q: "Bagaimana keamanan data pasien?", a: "Data terenkripsi, disimpan aman, dan hanya digunakan untuk mendukung keputusan klinis internal." },
    { q: "Bagaimana jika ada ketidaksesuaian ICD atau rujukan?", a: "Laporkan lewat kanal QA; tim kami melakukan koreksi model dan memperbaiki rekomendasi." },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden z-0" style={{ backgroundColor: tokens.bgLight, fontFamily: "'Geist', sans-serif" }}>
      <div
        className="absolute inset-0 z-0 h-full w-full bg-[#E0E5EC] bg-[radial-gradient(rgba(200,205,215,0.7)_1px,transparent_1px)] [background-size:14px_14px]"
      />
      <div className="relative z-10">

      {/* Weather Widget */}
      <div
        className="fixed top-24 left-20 z-40 w-[240px] max-w-[80vw] rounded-2xl border"
        style={{
          backgroundColor: tokens.bgLight,
          borderColor: 'rgba(255,255,255,0.6)',
          boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.9)',
          padding: 12
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: tokens.bgLight,
              boxShadow: '4px 4px 8px rgba(0,0,0,0.08), -4px -4px 8px rgba(255,255,255,0.9)'
            }}
          >
            <CloudSun size={20} style={{ color: tokens.coral }} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold" style={{ color: tokens.dark }}>Kediri</p>
            <p className="text-[11px]" style={{ color: tokens.gray }}>{formattedDate}</p>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-semibold" style={{ color: tokens.dark }}>29°C</p>
            <p className="text-[11px]" style={{ color: tokens.gray }}>Berawan</p>
          </div>
        </div>
      </div>

      {/* Roadmap Widget (toggle) */}
      {!showRoadmap && (
        <button
          onClick={() => setShowRoadmap(true)}
          className="fixed top-6 right-6 z-40 px-4 py-2 rounded-full border text-[12px] font-semibold uppercase tracking-[0.14em] shadow-sm hover:shadow-md transition"
          style={{ backgroundColor: tokens.cardBg, borderColor: tokens.border, color: tokens.dark }}
        >
          From CEO
        </button>
      )}
      {showRoadmap && (
        <div
          className="fixed top-6 right-6 z-40 w-[340px] max-w-[80vw] rounded-2xl border"
          style={{
            backgroundColor: tokens.cardBg,
            borderColor: tokens.border,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: 14
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: tokens.dark }}>
              From CEO
            </p>
            <span className="ml-auto text-[11px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: tokens.badgeBg, color: tokens.coral }}>
              IN_PROGRESS
            </span>
            <button
              onClick={() => setShowRoadmap(false)}
              className="ml-2 p-1 rounded-md hover:bg-black/5"
              aria-label="Close roadmap"
            >
              <X size={14} style={{ color: tokens.gray }} />
            </button>
          </div>
          <div className="border-t" style={{ borderColor: tokens.border }} />
          <div className="flex items-start gap-3 mt-3">
            <div
              className="w-11 h-11 rounded-lg overflow-hidden"
              style={{ backgroundColor: tokens.badgeBg, border: cardBorder, boxShadow: '0 6px 14px rgba(0,0,0,0.12)' }}
            >
              <img
                src="/chief.svg"
                alt="Principal Architect"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2 text-[13px]" style={{ color: tokens.dark }}>
              <p className="font-semibold">drferdiskandar // Lead Architect</p>
              <div className="space-y-2 leading-relaxed text-[13px]" style={{ color: tokens.gray }}>
                <p className="font-semibold">Upcoming Strategic Updates:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    <strong>Dynamic Dashboard Integration</strong>: Integrasi ReferraLink ke pusat kendali Thee Abys dengan visualisasi garis berjalan real-time.
                  </li>
                  <li>
                    <strong>Automated Conversion Logic</strong>: Optimasi klasifikasi rujukan berdasar spesialisasi dan <em>Trust Score</em>.
                  </li>
                  <li>
                    <strong>Enhanced Asset Security</strong>: Enkripsi tambahan untuk setiap data diagnosa lintas jaringan Sentra.
                  </li>
                </ol>
              </div>
              <p className="font-semibold">Next Milestone:</p>
              <p>Deploy <em>Smart Automation</em> untuk rujukan otomatis ke fasilitas tingkat lanjut.</p>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-5 py-2.5 bg-white border rounded-full text-[14px] font-medium transition-all cursor-pointer hover:border-[#1c1c1c]"
          style={{ borderColor: tokens.border, color: tokens.gray }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      {/* Alpha Tester Widget (top-left, unobtrusive) */}
      <div
        className="fixed top-56 left-6 z-30 w-[300px] max-w-[80vw] rounded-2xl border transition-transform duration-300 ease-out"
        style={{
          backgroundColor: tokens.cardBg,
          borderColor: tokens.border,
          boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
          padding: 14,
          transform: alphaCollapsed ? 'translateX(-75%)' : 'translateX(0)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: tokens.dark }}>
            Alpha Tester
          </p>
          <span className="ml-auto text-[11px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: tokens.badgeBg, color: tokens.coral }}>
            NEW
          </span>
        </div>
        <div className="border-t" style={{ borderColor: tokens.border }} />
        <div className="space-y-2 mt-3 text-[13px]" style={{ color: tokens.gray }}>
          <p className="text-[12px]" style={{ color: tokens.dark, fontWeight: 600 }}>
            Welcome Alpha Tester 🎉
          </p>
          <p>
            Akses awal untuk tim klinis terpilih. Uji alur rujukan otomatis, validasi ICD, dan kirim temuan lewat kanal QA.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Fokus: turnaround &lt; 60 detik</li>
            <li>Laporkan mismatch ICD via form QA</li>
            <li>Handover WA dipantau 24/7</li>
          </ul>
        </div>
        <button
          className="absolute top-1/2 -right-5 -translate-y-1/2 bg-[var(--bg-color)] border rounded-full w-8 h-8 flex items-center justify-center text-[11px] shadow-sm hover:shadow-md transition"
          style={{ borderColor: tokens.border, color: tokens.dark }}
          onClick={() => setAlphaCollapsed((v) => !v)}
          aria-label="Toggle Alpha Tester"
        >
          {alphaCollapsed ? '>' : '<'}
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-[900px] mx-auto px-8">

        {/* Hero Section */}
        <section className="pt-[100px] pb-20 flex flex-col items-center gap-16">

          {/* Heading */}
          <div className="flex flex-col items-center gap-10 w-full">

            {/* Content */}
            <div className="flex flex-col items-center gap-10 w-full">

              {/* Text Block */}
              <div className="flex flex-col items-center gap-4 w-full">

                {/* Status Badge */}
                <div
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
                  style={{ backgroundColor: tokens.badgeBg }}
                >
                  <div className="relative">
                    <div
                      className="w-2.5 h-2.5 rounded-full animate-ping absolute"
                      style={{ backgroundColor: tokens.green, opacity: 0.3 }}
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full relative"
                      style={{ backgroundColor: tokens.green }}
                    />
                  </div>
                  <span className="text-[14px] font-medium" style={{ color: tokens.dark }}>
                    Beta goes live soon
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="text-center leading-[1.1] space-y-1"
                  style={{ color: tokens.dark, letterSpacing: '-0.06em', maxWidth: 560, fontFamily: "'Geist', sans-serif" }}
                >
                  <span className="block text-[32px] font-medium tracking-[0.01em]" style={{ color: tokens.gray }}>
                    Sentra Solutions
                  </span>
                  <span className="block text-[64px] font-semibold">
                    Referra
                    <span
                      className="italic font-light"
                      style={{
                        color: tokens.coral
                      }}
                    >
                      Link
                    </span>
                  </span>
                </h1>

              {/* Subtitle */}
              <p
                className="text-[18px] text-center leading-relaxed"
                style={{ color: tokens.gray, maxWidth: 540, fontFamily: "'Geist', sans-serif" }}
              >
                You don't have to ask again <span style={{ color: tokens.coral, fontStyle: 'italic' }}>"Diagnosa rujukan apa, Dok?"</span> — All you need is here.
              </p>
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
                    className="px-7 py-3.5 rounded-full text-[14px] font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      backgroundColor: isLoading ? tokens.gray : tokens.dark,
                      color: iconOnDark,
                      boxShadow: shadowBtn,
                      transform: isLoading ? 'scale(0.97)' : 'scale(1)',
                      transition: 'transform 200ms ease-out, background-color 300ms ease-out, box-shadow 300ms ease-out',
                      animation: isLoading ? 'pulseGlow 1.5s ease-in-out infinite' : 'none'
                    }}
                    onMouseDown={(e) => {
                      if (!isLoading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)';
                    }}
                    onMouseUp={(e) => {
                      if (!isLoading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span style={{
                          opacity: 0,
                          animation: 'fadeInSmooth 400ms ease-out 100ms forwards'
                        }}>Menganalisis...</span>
                      </>
                    ) : (
                      'Proses'
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
                {/* Text */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[18px]" style={{ color: tokens.dark }}>Join</span>
                  <span className="text-[18px] font-medium" style={{ color: tokens.dark }}>8,258</span>
                  <Plus size={16} style={{ color: tokens.dark }} />
                  <span className="text-[18px]" style={{ color: tokens.dark }}>Sentra Healthcare Solutions Group</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-5 w-full pt-10">
            <FeatureCard
              icon={<FileText size={18} />}
              tag="Smart Automation"
              title="Surat Keterangan Sakit"
              onClick={() => setShowSickLeaveModal(true)}
            />
            <FeatureCard
              icon={<FileText size={18} />}
              tag="Smart Automation"
              title="Surat Keterangan Sehat"
              onClick={() => setShowHealthCertModal(true)}
            />
            <FeatureCard
              icon={<Building2 size={18} />}
              tag="Smart Hospital"
              title="Permohonan Rujukan"
              onClick={() => {
                // Pre-fill with current diagnosis result if available
                if (result) {
                  setReferralData({
                    ...referralData,
                    diagnosa: result.proposed_referrals?.[0]?.description || result.description || diagnosis,
                    gejala: result.evidence?.red_flags?.join(', ') || result.clinical_notes || ''
                  });
                } else if (diagnosis) {
                  setReferralData({
                    ...referralData,
                    diagnosa: diagnosis,
                    gejala: ''
                  });
                }
                setShowReferralModal(true);
              }}
            />
          </div>

          {/* Second Row - Genetic Growth Map */}
          <div className="w-full pt-5">
            <div
              className="relative pt-8 cursor-pointer transition-all"
              onClick={() => setShowGeneticMap(!showGeneticMap)}
            >
              {/* Icon Circle */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center z-10"
                style={{ backgroundColor: tokens.dark, boxShadow: shadowBtn }}
              >
                <span style={{ color: iconOnDark }}>
                  <Network size={18} />
                </span>
              </div>
              {/* Header Card */}
              <div
                className="pt-12 pb-6 px-5 rounded-3xl text-center transition-all"
                style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
              >
                <h6 className="text-[18px] font-semibold mb-2" style={{ color: tokens.dark, fontFamily: "'Geist', sans-serif" }}>
                  Smart Automation
                </h6>
                <p className="text-[18px]" style={{ color: tokens.gray, fontFamily: "'Geist', sans-serif" }}>
                  Genetic Growth Map
                </p>
                <p className="text-[14px] mt-1 opacity-70" style={{ color: tokens.gray, fontFamily: "'Geist', sans-serif" }}>
                  Visualisasi Jaringan Rujukan
                </p>
                <div className="mt-3 text-xs text-slate-500">
                  {showGeneticMap ? '▲ Sembunyikan Peta' : '▼ Tampilkan Peta'}
                </div>
              </div>
            </div>

            {/* Embedded Map - Expands when clicked */}
            {showGeneticMap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="mt-5 overflow-hidden"
              >
                <GeneticGrowthMapEmbed />
              </motion.div>
            )}
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
            letterRef={letterRef}
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
            letterRef={healthCertRef}
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

        {/* Mission Section */}
        <section className="py-20">
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

                <p className="text-[18px] leading-relaxed" style={{ color: tokens.gray }}>
                  The future of healthcare isn't about replacing the human touch; it is about securing it.
                  At Sentra, we are architecting a new era of Augmented Humanity—where ethical intelligence
                  handles the complexity of data, so healthcare professionals can focus entirely on the complexity of care.
                </p>

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
        <section className="py-20">
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

        {/* Footer */}
        <footer
          className="py-10 border-t flex flex-col md:flex-row justify-between items-center gap-5"
          style={{ borderColor: tokens.border }}
        >
          <p className="text-[14px]" style={{ color: tokens.gray }}>
            2026 - Sentra Healthcare Solution
          </p>
          <p className="text-[14px] text-center md:text-right" style={{ color: tokens.gray }}>
            A decision support tool; professional medical judgment is required for all patient care decisions.
          </p>
        </footer>

      </main>
    </div>
    </div>
  );
};

// Sub-components
const FeatureCard = ({ icon, tag, title, subtitle, onClick }: { icon: React.ReactNode; tag: string; title: string; subtitle?: string; onClick?: () => void }) => (
  <div
    className="relative pt-8 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
      className="pt-12 pb-8 px-5 rounded-3xl text-center"
      style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
    >
      <h6 className="text-[18px] font-semibold mb-2" style={{ color: tokens.dark, fontFamily: "'Geist', sans-serif" }}>
        {tag}
      </h6>
      <p className="text-[18px]" style={{ color: tokens.gray, fontFamily: "'Geist', sans-serif" }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-[14px] mt-1 opacity-70" style={{ color: tokens.gray, fontFamily: "'Geist', sans-serif" }}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[14px] font-semibold" style={{ color: tokens.dark }}>{label}</span>
    <span className="text-[18px]" style={{ color: tokens.gray }}>{value}</span>
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

          {/* Left Side - AI Provider Icons */}
          <div className="absolute left-0 flex flex-col gap-10" style={{ transform: 'translateY(-50%)', top: '50%' }}>
            {aiProviders.map((provider, idx) => (
              <div
                key={provider.name}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: '#f6fbff',
                  boxShadow: sekamShadow,
                  opacity: 0,
                  animation: `iconPop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 150}ms forwards`
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: tokens.dark }}
                >
                  <img
                    src={provider.icon}
                    alt={provider.name}
                    className="w-6 h-6"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
              </div>
            ))}
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
            className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center z-10 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: tokens.dark, boxShadow: shadowBtn }}
            title="Klik untuk copy kode ICD-10"
          >
            <span style={{ color: iconOnDark, fontFamily: "'Geist', sans-serif" }} className="text-[12px] font-semibold">
              {ref.code}
            </span>
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
            className="relative pt-12 pb-6 px-5 rounded-3xl text-center"
            style={{ backgroundColor: tokens.cardBg, border: cardBorder }}
          >
            {/* Certified Label */}
            <span
              className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: '#E03D00' }}
            >
              Certified
            </span>
            <p
              className="text-[18px] font-semibold leading-relaxed mb-1 line-clamp-3 h-[5.4rem]"
              style={{ color: tokens.dark, fontFamily: "'Geist', sans-serif" }}
              title={ref.description}
            >
              {ref.description}
            </p>
            {/* Confidence Percentage */}
            <p
              className="text-[14px] font-bold mb-2 flex items-center justify-center gap-1"
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
                  {result.evidence?.red_flags && result.evidence.red_flags.length > 0 && (
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
                  {result.evidence?.guidelines && result.evidence.guidelines.length > 0 && (
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
          style={{ borderColor: tokens.border, fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.6' }}
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
          style={{ borderColor: tokens.border, fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.6' }}
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

export default WaitlistPage;
