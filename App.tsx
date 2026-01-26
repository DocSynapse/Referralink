import React, { useState, useEffect } from 'react';
import { ArrowDown, Search, Terminal, BookOpen, Zap, ShieldAlert, HeartPulse, Stethoscope, Siren, Plus, Minus, X, ChevronDown, LayoutGrid, ArrowRight, Activity, MessageCircle, Phone, ShieldCheck, MapPin, Sun, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import TextBlockAnimation from './components/ui/text-block-animation';

import { generateMockQuery, NON_REFERRAL_DIAGNOSES, EXAMPLE_QUERIES } from './constants';
import { MedicalQuery, ProcessedResult } from './types';
import { searchICD10Code } from './services/geminiService';
import { DataCard } from './components/DataCard';
import { LogTerminal } from './components/LogTerminal';
import { ReferralDeck } from './components/ReferralDeck';
import { AdminPanel } from './components/AdminPanel';
import { SplashScreen } from './components/SplashScreen';

const RS_KEDIRI = [
  "RSUD Gambiran", "RS Baptis Kediri", "RS Bhayangkara Kediri", "RS Daha Husada", 
  "RS Lirboyo", "RSIA Melinda Kediri", "RS Ratih", "RSIA Citra Keluarga", 
  "RSIA Muhammadiyah Kediri", "RSIA Nirmala Kediri", "RS Kilisuci", "RS TK. IV 05.07.02 DKT Kediri"
];

const App: React.FC = () => {
  const [history, setHistory] = useState<MedicalQuery[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ProcessedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [heroAnimationReady, setHeroAnimationReady] = useState(false);
  const heroSectionRef = React.useRef<HTMLDivElement>(null);
  const referralinkRef = React.useRef<HTMLHeadingElement>(null);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const currentMonth = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const todayDate = now.getDate();

  useEffect(() => {
    setHistory(generateMockQuery(5));
  }, []);

  useEffect(() => {
    if (!heroAnimationReady) return;

    if (heroSectionRef.current) {
      gsap.to(heroSectionRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power1.out'
      });
    }

    // Animate Referralink separately (delay 300ms from splash complete)
    if (referralinkRef.current) {
      gsap.fromTo(
        referralinkRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
      );
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [heroAnimationReady]);

  const handleSearch = async (e?: any, customQuery?: string) => {
    if (e?.preventDefault) e.preventDefault();
    const queryText = customQuery || searchInput;
    if (!queryText.trim() || isProcessing) return;

    setIsProcessing(true);
    setSearchError(null);
    if (!customQuery) setSearchInput("");

    const newQuery: MedicalQuery = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      query: queryText,
      timestamp: Date.now(),
    };

    setHistory(prev => [newQuery, ...prev].slice(0, 10));

    const tempResult: ProcessedResult = {
        id: newQuery.id,
        input: newQuery,
        output: null,
        logs: ["System Init...", `Analyzing: ${queryText}`],
        durationMs: 0,
        status: 'processing',
    };

    setResolutionHistory(prev => [...prev, tempResult]);

    try {
      const start = performance.now();
      const result = await searchICD10Code(newQuery);

      setResolutionHistory(prev => prev.map(r => {
        if (r.id === newQuery.id) {
          return { ...r, output: result.json, logs: result.logs, durationMs: performance.now() - start, status: 'completed' };
        }
        return r;
      }));
    } catch (error: any) {
      const errorMessage = error?.message || 'Query analysis failed. Please try different symptoms.';
      setSearchError(errorMessage);
      setResolutionHistory(prev => prev.map(r => {
        if (r.id === newQuery.id) {
          return { ...r, status: 'error', logs: [...r.logs, `ERROR: ${errorMessage}`] };
        }
        return r;
      }));
    }

    setIsProcessing(false);
  };

  const latestResult = resolutionHistory.length > 0 ? resolutionHistory[resolutionHistory.length - 1] : null;

  return (
    <div className="font-sans selection:bg-slate-300 bg-[#E0E5EC] text-[#4A5568]">
      {showSplash && (
        <SplashScreen
          onPortalSelect={(portal) => {
            setShowSplash(false);
            setHeroAnimationReady(true);
          }}
          duration={5000}
        />
      )}

      {/* --- PAGE 1: HERO --- */}
      <section ref={heroSectionRef} className="min-h-screen flex flex-col items-center justify-center relative px-6 z-20 overflow-hidden bg-[#E0E5EC] opacity-0">
          <div className="m3-grid-bg opacity-40"></div>
          <div className="max-w-5xl w-full flex flex-col gap-0 z-10">
            {/* Subtitle label: Sentra */}
            <div className="mb-1">
                <TextBlockAnimation blockColor="#002147" animateOnScroll={false} delay={0.1} duration={0.6} isEnabled={heroAnimationReady}>
                    <p className="hero-subtitle-label">
                        Sentra
                    </p>
                </TextBlockAnimation>
            </div>

            {/* Main title: Referralink (split color) */}
            <div className="mb-6 flex justify-center">
                <h1 ref={referralinkRef} className="font-saans-title opacity-0">
                    <span style={{ color: '#002147' }}>Referra</span><span style={{ color: '#FF4500' }}>link</span>
                </h1>
            </div>

            {/* Subtitle text */}
            <div className="mb-2 max-w-2xl">
                <TextBlockAnimation blockColor="#002147" animateOnScroll={false} delay={0.5} duration={0.7} isEnabled={heroAnimationReady}>
                    <p className="hero-subtitle-text">
                        Optimizing clinical pathways through intelligent multi-agent systems. Built for Indonesia's healthcare legacy.
                    </p>
                </TextBlockAnimation>
            </div>

            {/* Signature */}
            <div className="pl-0">
                <TextBlockAnimation blockColor="#002147" delay={0.8} duration={0.8} isEnabled={heroAnimationReady}>
                    <p className="font-technical !text-[20px] !leading-tight text-[#002147] tracking-tight">
                        dr Ferdi Iskandar
                    </p>
                </TextBlockAnimation>
            </div>
          </div>
          <div className="absolute bottom-12 flex flex-col items-center gap-2 text-slate-600 font-technical">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Enter Dashboard</span>
            <ArrowDown className="w-5 h-5 animate-bounce" aria-hidden="true" />
          </div>
      </section>

      {/* --- PAGE 2: DASHBOARD --- */}
      <section className="min-h-screen w-full bg-[#E0E5EC] relative z-10 border-t border-slate-300">
        <header className="px-8 py-6 flex items-center justify-between sticky top-0 bg-[#E0E5EC]/90 backdrop-blur-sm z-50">
           <div className="flex items-center gap-4">
              <button className="neu-icon-btn" aria-label="View dashboard activity metrics">
                <Activity size={24} aria-hidden="true" />
              </button>
              <div>
                 <span className="block text-2xl font-black text-oxford tracking-tight leading-none font-display uppercase">Sentra Healthcare</span>
                 <span className="subtitle font-display text-accent mt-1 block">AI Referral Intelligence</span>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-4 font-technical">
              <div
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#34d399] animate-pulse"
                role="status"
                aria-label="System operational and online"
              />
              <span className="sr-only">System is online and operational</span>
           </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* LEFT SIDEBAR */}
           <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                 <Widget title="Protocol 7" value="Active" icon={<Zap size={18} className="text-blue-600"/>} />
                 <Widget title="Risk Engine" value="Strict" icon={<ShieldAlert size={18} className="text-red-600"/>} />
                 <Widget title="Database" value="144 DX" icon={<BookOpen size={18} className="text-teal-600"/>} />
              </div>
              <div className="neu-flat p-6 min-h-[300px]">
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-slate-600 font-technical">System Log</h3>
                 <div className="h-full overflow-hidden rounded-xl bg-[#0b1220] p-4 font-technical text-[11px] text-[#c7f284] shadow-inner border border-slate-800">
                    <LogTerminal logs={latestResult ? latestResult.logs : []} type="thinking" />
                 </div>
              </div>
              <div className="sticky top-24 mt-10"><AdminPanel /></div>
           </div>

           {/* CENTER WORKSPACE */}
           <div className="lg:col-span-7 space-y-8 px-8">

              <div className="space-y-6 neu-flat p-6 rounded-3xl border border-white/50 bg-gradient-to-r from-white/60 via-[#E0E5EC] to-white/40">
                 <div className="space-y-2">
                    <h2 data-role="triage-title" className="title-primary font-black text-oxford tracking-tight font-display">Clinical Triage.</h2>
                    <p className="subtitle font-display text-slate-600">
                       Intake, scoring, dan rekomendasi FKTL dalam satu panel.
                    </p>
                 </div>
                 <div className="flex flex-wrap items-center gap-3 text-[11px] font-technical uppercase tracking-[0.25em] text-slate-600">
                    <span className="neu-pressed px-4 py-2 rounded-full text-oxford border border-white/30 bg-white/70">Triage Desk</span>
                    <span className="px-4 py-2 rounded-full bg-white/60 text-oxford border border-white/40">Protocol 7</span>
                    <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">Status: Online</span>
                    <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/30">SLA: 15m</span>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px] font-technical text-slate-600 uppercase tracking-[0.15em]">
                    <div className="px-3 py-3 rounded-2xl border border-slate-800 bg-[#0b1220]">
                       <p className="text-[10px] text-[#94a3b8] font-technical">Queue</p>
                       <p className="text-xs font-technical text-[#c7f284]">03 Active</p>
                    </div>
                    <div className="px-3 py-3 rounded-2xl border border-slate-800 bg-[#0b1220]">
                       <p className="text-[10px] text-[#94a3b8] font-technical">Risk</p>
                       <p className="text-xs font-technical text-[#c7f284]">PKM Balowerti</p>
                    </div>
                    <div className="px-3 py-3 rounded-2xl border border-slate-800 bg-[#0b1220]">
                       <p className="text-[10px] text-[#94a3b8] font-technical">Uptime</p>
                       <p className="text-xs font-technical text-[#c7f284]">99.9%</p>
                    </div>
                    <div className="px-3 py-3 rounded-2xl border border-slate-800 bg-[#0b1220]">
                       <p className="text-[10px] text-[#94a3b8] font-technical">Network</p>
                       <p className="text-xs font-technical text-[#c7f284]">Kediri</p>
                    </div>
                 </div>
                 <div className="neu-pressed p-2 pl-6 flex items-center h-24 transition-all focus-within:ring-2 ring-blue-400/20">
                    <Search size={32} className="text-slate-400" aria-hidden="true" />
                    <label htmlFor="clinical-search" className="sr-only">
                      Describe patient symptoms for clinical triage
                    </label>
                    <input
                      id="clinical-search"
                      className="flex-1 bg-transparent h-full px-5 text-2xl font-bold text-oxford outline-none placeholder:text-slate-300 font-display"
                      placeholder="Describe symptoms..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      aria-describedby="search-hint"
                    />
                    <span id="search-hint" className="sr-only">
                      Enter symptoms to get AI-powered diagnosis recommendations
                    </span>
                    <button
                      onClick={handleSearch}
                      disabled={isProcessing}
                      className="neu-flat w-20 h-20 rounded-2xl flex items-center justify-center text-oxford hover:text-blue-600 active:scale-95 transition-all mr-1 cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Submit clinical query"
                    >
                      {isProcessing ? <div className="animate-spin w-8 h-8 border-2 border-slate-400 border-t-blue-600 rounded-full" aria-hidden="true"></div> : <ArrowRight size={32} aria-hidden="true" />}
                    </button>
                 </div>

                 {searchError && (
                   <div
                     className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-500 rounded-xl animate-in fade-in"
                     role="alert"
                     aria-live="polite"
                   >
                     <AlertCircle size={20} className="text-red-600 shrink-0" aria-hidden="true" />
                     <div>
                       <p className="text-red-700 font-bold text-[13px]">Query Failed</p>
                       <p className="text-red-600 text-[12px]">{searchError}</p>
                     </div>
                     <button
                       onClick={() => setSearchError(null)}
                       className="ml-auto text-red-500 hover:text-red-700 cursor-pointer"
                       aria-label="Dismiss error"
                     >
                       <X size={18} aria-hidden="true" />
                     </button>
                   </div>
                 )}

                 <div className="flex flex-wrap gap-3">
                    {["Batuk & Pilek", "Tensi Tinggi", "Luka Gula", "Nyeri Ulu Hati", "Demam Typoid", "Gatal & Ruam", "Nyeri Otot", "Nyeri Sendi", "Sakit Kepala", "Mata Kabur"].map((q, i) => (
                       <button
                         key={i}
                         onClick={() => handleSearch(undefined, q)}
                         className="neu-flat px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-accent font-technical cursor-pointer transition-colors"
                         aria-label={`Search for ${q}`}
                       >
                         {q}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="min-h-[240px] space-y-6">
                 {latestResult ? (
                    <div className="animate-fade-in-up-smooth">
                       <DataCard data={latestResult.output} loading={latestResult.status === 'processing'} />
                    </div>
                 ) : (
                    <div className="neu-flat h-40 flex flex-col items-center justify-center text-slate-500 font-technical" role="status" aria-live="polite">
                       <HeartPulse size={64} className="mb-6" aria-hidden="true" />
                       <p className="font-bold tracking-[0.4em] text-[12px] uppercase">Awaiting Clinical Input</p>
                    </div>
                 )}
                  <div className="pt-0 border-t border-slate-300/50 animate-fade-smooth">
                    <ReferralDeck
                        options={latestResult?.output?.proposed_referrals || [
                            { code: "A01.0", description: "Typhoid Fever", clinical_reasoning: "Demam >5 hari (Step-ladder) + Lidah kotor. Rujuk jika intake sulit." },
                            { code: "A91", description: "Dengue Hemorrhagic Fever", clinical_reasoning: "Trombositopenia <100.000 atau tanda syok/perdarahan." },
                            { code: "I11.9", description: "Hypertensive Heart Disease", clinical_reasoning: "Tensi >180/110 mmHg + Nyeri dada/Sesak (Target Organ Damage)." }
                        ]} 
                        isVisible={true} 
                    />
                 </div>
              </div>
           </div>

           {/* RIGHT SIDEBAR */}
           <div className="lg:col-span-2 space-y-6 border-l border-slate-300 pl-8 h-full min-h-[600px] mt-0">
              <div className="neu-flat p-5 rounded-2xl border border-white/50 bg-[#E6EBF3] text-left shadow-inner sticky top-8">
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                       <div className="neu-pressed w-10 h-10 rounded-xl flex items-center justify-center">
                          <Sun size={20} className="text-[#FF4500]" />
                       </div>
                       <div>
                          <p className="text-[11px] font-display text-slate-500">Kediri</p>
                          <p className="text-sm font-bold font-display text-[#FF4500] leading-tight">Cerah · 28°C</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-display text-slate-500">Live</span>
                 </div>
                 <div className="text-[12px] font-display text-slate-600 flex justify-between">
                    <span>{formattedDate}</span>
                    <span>{formattedTime}</span>
                 </div>
              </div>

               <div className="space-y-5 pt-6">
                  <div className="flex items-center gap-3 mb-4 text-slate-600 font-technical">
                     <MapPin size={20} className="text-red-500" aria-hidden="true" />
                     <h3 className="text-[12px] font-bold uppercase tracking-[0.3em]">Network Kediri</h3>
                  </div>
                  {RS_KEDIRI.map((rs, i) => (
                     <div key={i} className="flex items-start gap-4 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-accent mt-2 transition-colors shrink-0"></div>
                        <span className="text-[15px] font-medium text-slate-600 leading-tight group-hover:text-oxford transition-colors cursor-default font-display">{rs}</span>
                     </div>
                  ))}
                  <div className="mt-12 pt-8 border-t border-slate-200 text-left text-slate-500 font-technical">
                     <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Total {RS_KEDIRI.length} Mitra FKTL</p>
                  </div>
               </div>
           </div>
        </main>

        <footer className="bg-[#E0E5EC] border-t border-slate-300 py-24 px-8 relative z-20">
           <div className="w-full space-y-12">
              <div className="flex flex-col md:flex-row justify-start items-start gap-8 border-b border-slate-300/50 pb-12">
                 <div>
                    <p className="text-[28px] font-black text-oxford font-display leading-tight uppercase">2026 Sentra Healthcare Solutions</p>
                    <p className="text-[16px] font-bold text-accent uppercase tracking-[0.3em] mt-3 font-technical">VERSI BETA - UJI COBA MODUL</p>
                 </div>
                 <div className="neu-flat px-8 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em] border border-white/40 font-technical">Build ID: SR-V12-2026-KF</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                 <div className="md:col-span-8 space-y-6">
                    <p className="text-[14px] font-bold uppercase tracking-[0.4em] text-slate-600 font-technical">Legal Disclaimer</p>
                    <p className="text-[15px] leading-relaxed text-slate-700 font-bold text-justify font-display">
                       Sentra Referralink System adalah platform perangkat lunak kesehatan yang dirancang untuk mendukung dokter dan tenaga kesehatan dalam proses diagnostik pasien melalui mekanisme orkestrasi agent cerdas (agentic AI orchestration). Sistem ini mengintegrasikan kemampuan analisis klinis berbasis kecerdasan buatan dengan kerangka kerja multi-agent yang terkoordinasi untuk menghasilkan rekomendasi diagnosis diferensial yang komprehensif, lengkap dengan kode ICD-10 yang akurat dan relevan secara klinis.
                    </p>
                    <p className="text-[15px] leading-relaxed text-slate-700 font-bold text-justify font-display">
                       Platform ini berfungsi sebagai Clinical Decision Support System (CDSS) generasi terbaru yang memanfaatkan teknologi Large Language Model (LLM) dan koordinasi agent otomatis untuk meningkatkan akurasi diagnostik, mempercepat proses rujukan pasien, dan mendukung dokumentasi klinis yang lebih terstruktur.
                    </p>
                 </div>
                 <div className="md:col-span-4 space-y-6 border-l border-slate-300/50 pl-12">
                    <p className="text-[14px] font-black uppercase tracking-[0.4em] text-slate-600 font-display">Regulatory Status</p>
                    <p className="text-[15px] font-black text-oxford leading-relaxed font-display">Dalam proses evaluasi sesuai PMK 24/2022 tentang Rekam Medis Elektronik (RME).</p>
                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-500/5 py-4 px-6 rounded-2xl border border-emerald-500/20 font-technical">
                       <ShieldCheck size={20} /><span className="text-[12px] font-bold uppercase tracking-[0.1em]">Standard Compliance Active</span>
                    </div>
                 </div>
              </div>
              <div className="pt-16 flex flex-col items-start gap-6 font-technical">
                 <div className="w-16 h-1.5 bg-slate-300 rounded-full"></div>
                 <p className="text-[12px] font-bold uppercase tracking-[0.8em] text-slate-500">Sentra Intelligence • Kediri • Indonesia</p>
              </div>
           </div>
        </footer>
      </section>

      {/* --- FLOATING WIDGETS --- */}
      <a
        href="tel:0354123456"
        className="fixed bottom-12 left-12 z-[100] neu-icon-btn w-20 h-20 rounded-full flex items-center justify-center border border-white/50 shadow-2xl cursor-pointer"
        aria-label="Call hospital emergency line: 0354-123456"
      >
        <Phone size={32} className="text-oxford" aria-hidden="true" />
      </a>
      {latestResult && latestResult.status === 'completed' && (
        <button
          onClick={() => {
            const msg = `Halo Dok, Izin melaporkan hasil CDSS:\n\n*Diagnosa:* ${latestResult.output?.description} (${latestResult.output?.code})\n*Urgency:* ${latestResult.output?.urgency}\n*Alasan:* ${latestResult.output?.evidence?.clinical_reasoning}\n\nMohon petunjuk rujukan selanjutnya.`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
          }}
          className="fixed bottom-12 right-12 z-[100] w-20 h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer animate-scale-in-up hover:scale-110 active:scale-90 transition-transform duration-200"
          aria-label="Share diagnosis via WhatsApp"
        >
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" aria-hidden="true"></div>
          <MessageCircle size={36} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

const Widget = ({ title, value, icon }: any) => (
   <div className="neu-flat p-5 flex items-center justify-between cursor-default">
      <div className="flex items-center gap-5">
         <div className="neu-pressed w-12 h-12 rounded-2xl flex items-center justify-center">{icon}</div>
         <div className="font-display">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">{title}</p>
            <p
              className={`text-xl font-bold leading-tight ${
                title === 'Protocol 7' || title === 'Risk Engine' || title === 'Database'
                  ? 'text-[#FF4500]'
                  : 'text-oxford'
              }`}
            >
              {value}
            </p>
            {title === 'Protocol 7' && (
               <p className="text-[11px] text-slate-500 font-display">Routing rules v7 · Live</p>
            )}
            {title === 'Risk Engine' && (
               <p className="text-[11px] text-slate-500 font-display">Strict · Escalate on red flags</p>
            )}
            {title === 'Database' && (
               <p className="text-[11px] text-slate-500 font-display">ICD-10 library · Synced today</p>
            )}
         </div>
      </div>
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
   </div>
);

export default App;
