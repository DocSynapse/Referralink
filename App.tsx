import React, { useState, useEffect } from 'react';
import { ArrowDown, Search, Terminal, BookOpen, Zap, ShieldAlert, HeartPulse, Stethoscope, Siren, Plus, Minus, X, ChevronDown, LayoutGrid, ArrowRight, Activity, MessageCircle, Phone, ShieldCheck, MapPin, Sun, AlertCircle, Rocket } from 'lucide-react';
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
import { GridDotsBackground } from './components/ui/background-patterns';
import { WaitlistPage } from './components/WaitlistPage';

type PageView = 'main' | 'referralink';

// Hash-based routing utilities
const getRouteFromHash = (): PageView => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash === 'referralink') return 'referralink';
  return 'main';
};

const setRouteHash = (route: PageView) => {
  window.location.hash = route === 'main' ? '/' : `/${route}`;
};

const RS_KEDIRI = [
  "RSUD Gambiran", "RS Baptis Kediri", "RS Bhayangkara Kediri", "RS Daha Husada", 
  "RS Lirboyo", "RSIA Melinda Kediri", "RS Ratih", "RSIA Citra Keluarga", 
  "RSIA Muhammadiyah Kediri", "RSIA Nirmala Kediri", "RS Kilisuci", "RS TK. IV 05.07.02 DKT Kediri"
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>(getRouteFromHash);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [history, setHistory] = useState<MedicalQuery[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ProcessedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showSplash, setShowSplash] = useState(false); // Disabled splash
  const [searchError, setSearchError] = useState<string | null>(null);
  const [heroAnimationReady, setHeroAnimationReady] = useState(true); // Start ready
  const [typedSubtitle, setTypedSubtitle] = useState("");
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authUsername, setAuthUsername] = useState("doc");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const authPanelRef = React.useRef<HTMLDivElement>(null);
  const authTriggerRef = React.useRef<HTMLDivElement>(null);

  // Listen to hash changes for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = getRouteFromHash();
      if (newRoute !== currentPage) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentPage(newRoute);
          setTimeout(() => setIsTransitioning(false), 50);
        }, 200);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPage]);

  // Smooth page transition with URL update
  const navigateTo = (page: PageView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setRouteHash(page);
      setCurrentPage(page);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 400);
  };
  const openAuthPanel = () => {
    if (showAuthPanel) return;
    setAuthError(null);
    setShowAuthPanel(true);
    setAuthUsername("doc");
    setAuthPassword("");
  };

  const allowedUsers = React.useMemo(() => new Set(['doc', 'dan', 'cus']), []);

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();
    if (isAuthSubmitting) return;

    setAuthError(null);
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError("Username dan password wajib diisi.");
      return;
    }

    setIsAuthSubmitting(true);
    // Simple local gate; replace with backend auth when available
    const normalizedUser = authUsername.trim().toLowerCase();
    const isValid =
      allowedUsers.has(normalizedUser) &&
      authPassword.trim() === "123456";
    setTimeout(() => {
      setIsAuthSubmitting(false);
      if (!isValid) {
        setAuthError("Kredensial salah.");
        return;
      }
      setShowAuthPanel(false);
      navigateTo('referralink');
    }, 450); // brief delay for animation continuity
  };
  useEffect(() => {
    if (!showAuthPanel) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowAuthPanel(false);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        authPanelRef.current?.contains(target) ||
        authTriggerRef.current?.contains(target)
      ) {
        return;
      }
      setShowAuthPanel(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAuthPanel]);
  const heroSectionRef = React.useRef<HTMLDivElement>(null);
  const referralinkRef = React.useRef<HTMLHeadingElement>(null);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const currentMonth = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const todayDate = now.getDate();
  const heroSubtitle = "Intelligence That Knows When to Speak, and When to Defer to Humanity";

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
  }, [heroAnimationReady, heroSubtitle]);

  // Gentle typing effect for the subtitle
  useEffect(() => {
    if (!heroAnimationReady) return;

    setTypedSubtitle("");
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedSubtitle(heroSubtitle.slice(0, index));
      if (index >= heroSubtitle.length) {
        clearInterval(interval);
      }
    }, 60); // slower cadence for a calm type-on

    return () => clearInterval(interval);
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

  // Render Referralink page if route matches
  if (currentPage === 'referralink') {
    return (
      <div
        className={`transition-opacity ease-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ transitionDuration: '400ms' }}
      >
        <WaitlistPage onBack={() => navigateTo('main')} />
      </div>
    );
  }

  return (
    <div
      className={`font-sans selection:bg-slate-300 bg-[#E0E5EC] text-[#4A5568] transition-opacity ease-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      style={{ transitionDuration: '400ms' }}
    >
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
      <section ref={heroSectionRef} className="min-h-screen flex flex-col items-center justify-center relative px-6 z-20 overflow-hidden bg-[#E0E5EC]">
          <GridDotsBackground className="opacity-50" />
          <div className="max-w-5xl w-full flex flex-col gap-0 z-10">

            {/* Top Row: Title + Enter Dashboard */}
            <div className="flex items-end justify-between mb-10">
              {/* Left: Sentra Referralink */}
              <div className="flex flex-col items-start gap-0">
                  <TextBlockAnimation blockColor="#002147" animateOnScroll={false} delay={0.1} duration={0.6} isEnabled={heroAnimationReady}>
                      <p className="hero-subtitle-label">
                          Sentra
                      </p>
                  </TextBlockAnimation>
                  <h1 ref={referralinkRef} className="font-saans-title -mt-2">
                      <span style={{ color: '#002147' }}>Artificial</span><span style={{ color: '#FF4500' }}> Intelligence</span>
                  </h1>
              </div>

              {/* Right: Enter Dashboard */}
              <div
                ref={authTriggerRef}
                onClick={openAuthPanel}
                className="relative flex items-center gap-3 text-slate-600 hover:text-[#E03D00] font-technical transition-colors cursor-pointer group"
              >
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                <span className="text-[18px] font-bold uppercase tracking-[0.25em]">Enter Referralink</span>

                {showAuthPanel && (
                  <div
                    ref={authPanelRef}
                    className="auth-pop absolute right-0 top-12 w-[320px] bg-white/75 shadow-lg rounded-2xl border border-slate-200/60 p-4 backdrop-blur-lg animate-auth-pop z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-[11px] font-technical uppercase tracking-[0.3em] text-slate-500 mb-2">Access Gate</p>
                    <form className="space-y-3" onSubmit={handleAuthSubmit}>
                      <div className="space-y-1">
                        <label className="text-[12px] font-mono text-slate-600">Username</label>
                        <input
                          type="text"
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E03D00]/70 focus:border-transparent transition-all animate-input-slide"
                          placeholder="doc"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[12px] font-mono text-slate-600">Password</label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E03D00]/70 focus:border-transparent transition-all animate-input-slide"
                          placeholder="123456"
                          autoComplete="current-password"
                        />
                      </div>
                      {authError && (
                        <p className="text-[12px] text-[#E03D00] font-mono">{authError}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setShowAuthPanel(false); }}
                          className="text-[11px] font-technical uppercase tracking-[0.15em] text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isAuthSubmitting}
                          className="px-3 py-2 text-[12px] font-bold uppercase tracking-[0.2em] text-white bg-[#E03D00] hover:bg-[#c73600] rounded-md transition-colors disabled:opacity-60"
                        >
                          {isAuthSubmitting ? "Checking..." : "Enter"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Subtitle text */}
            <div className="mb-2 max-w-2xl">
                <TextBlockAnimation blockColor="#002147" animateOnScroll={false} delay={0.5} duration={0.7} isEnabled={heroAnimationReady}>
                    <p className="hero-subtitle-text">
                        {typedSubtitle || heroSubtitle}
                        <span className="typing-caret inline-block w-2 ml-1 align-baseline text-[#002147]">|</span>
                    </p>
                </TextBlockAnimation>
            </div>

            {/* Signature */}
            <div className="pl-0">
                <TextBlockAnimation blockColor="#002147" delay={0.8} duration={0.8} isEnabled={heroAnimationReady}>
                    <p className="font-signature !text-[26px] !leading-tight text-[#002147] tracking-tight">
                        dr Ferdi Iskandar
                    </p>
                </TextBlockAnimation>
            </div>
          </div>

          {/* Bottom: Animated scrolling text */}
          <div className="absolute bottom-12 w-full max-w-5xl px-6">
            <div className="overflow-hidden max-w-full">
              <div className="animate-marquee whitespace-nowrap font-technical text-[10px] uppercase tracking-[0.2em] text-slate-400">
                <span className="mx-4">Smart Referral Intelligence</span>
                <span className="mx-4">•</span>
                <span className="mx-4">AI-Powered Diagnosis</span>
                <span className="mx-4">•</span>
                <span className="mx-4">Clinical Decision Support</span>
                <span className="mx-4">•</span>
                <span className="mx-4">ICD-10 Automation</span>
                <span className="mx-4">•</span>
                <span className="mx-4">Smart Referral Intelligence</span>
                <span className="mx-4">•</span>
                <span className="mx-4">AI-Powered Diagnosis</span>
                <span className="mx-4">•</span>
              </div>
            </div>
          </div>
      </section>

      {/* --- PAGE 2: DASHBOARD --- */}
      <section id="dashboard-section" className="min-h-screen w-full bg-[#E0E5EC] relative z-10">
        <header className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between sticky top-0 bg-[#E0E5EC]/95 backdrop-blur-sm z-50 border-b border-slate-200">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#002147] flex items-center justify-center">
                <Activity size={16} className="text-white" aria-hidden="true" />
              </div>
              <div>
                 <span className="block text-[18px] font-bold text-[#002147] tracking-tight leading-none font-display">Sentra Referralink</span>
                 <span className="text-[11px] font-technical text-slate-500 tracking-wide">Smart Referral Intelligence</span>
              </div>
           </div>
           <div className="flex items-center gap-4 font-technical">
              <button
                onClick={() => navigateTo('referralink')}
                className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white bg-[#E03D00] hover:bg-[#c73600] rounded-md transition-colors cursor-pointer"
              >
                <Rocket size={12} />
                Referralink
              </button>
              <span className="text-[11px] text-slate-500">{formattedDate}</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500" role="status" aria-label="Online" />
           </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

           {/* LEFT: Clinical Triage */}
           <div className="bg-white/50 border border-slate-200 rounded-lg p-6">
              <div className="mb-5">
                 <h2 className="text-[18px] font-bold text-[#002147] tracking-tight font-display">Clinical Triage</h2>
                 <p className="text-[13px] text-slate-500 font-display mt-1">Input gejala pasien untuk analisis diagnosis</p>
              </div>

              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 mb-4">
                 <Search size={18} className="text-slate-400 shrink-0" />
                 <input
                   id="clinical-search"
                   className="flex-1 bg-transparent text-[14px] font-medium text-[#002147] outline-none placeholder:text-slate-300 font-display"
                   placeholder="Describe symptoms..."
                   value={searchInput}
                   onChange={(e) => setSearchInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                 />
                 <button
                   onClick={handleSearch}
                   disabled={isProcessing}
                   className="w-9 h-9 rounded-md bg-[#002147] flex items-center justify-center text-white hover:bg-[#003366] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                 >
                   {isProcessing ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <ArrowRight size={16} />}
                 </button>
              </div>

              {searchError && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md mb-4">
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-red-600 text-[13px]">{searchError}</p>
                  <button onClick={() => setSearchError(null)} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer"><X size={14} /></button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-5">
                 {["Batuk & Pilek", "Tensi Tinggi", "Luka Gula", "Nyeri Ulu Hati", "Demam Typoid", "Gatal & Ruam", "Nyeri Sendi", "Sakit Kepala"].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(undefined, q)}
                      className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 bg-white border border-slate-200 rounded hover:border-[#002147] hover:text-[#002147] font-technical cursor-pointer transition-colors"
                    >
                      {q}
                    </button>
                 ))}
              </div>

              {/* Result Card */}
              <div className="border-t border-slate-200 pt-5">
                 {latestResult ? (
                    <div className="animate-fade-in-up-smooth">
                       <DataCard data={latestResult.output} loading={latestResult.status === 'processing'} />
                    </div>
                 ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg h-20 flex items-center justify-center text-slate-400">
                       <HeartPulse size={20} className="mr-2" />
                       <p className="font-technical text-[11px] uppercase tracking-wide">Awaiting Input</p>
                    </div>
                 )}
              </div>
           </div>

           {/* RIGHT: Opsi Diagnosa Rujukan */}
           <div className="bg-white/50 border border-slate-200 rounded-lg p-6">
              <div className="mb-5">
                 <h2 className="text-[18px] font-bold text-[#002147] tracking-tight font-display">Opsi Diagnosa Rujukan</h2>
                 <p className="text-[13px] text-slate-500 font-display mt-1">Rekomendasi ICD-10 dan alasan klinis</p>
              </div>

              <ReferralDeck
                 options={latestResult?.output?.proposed_referrals || [
                    { code: "A01.0", description: "Typhoid Fever", clinical_reasoning: "Demam >5 hari + Lidah kotor. Rujuk jika intake sulit." },
                    { code: "A91", description: "Dengue Hemorrhagic Fever", clinical_reasoning: "Trombositopenia <100.000 atau tanda syok." },
                    { code: "I11.9", description: "Hypertensive Heart Disease", clinical_reasoning: "Tensi >180/110 + Nyeri dada/Sesak." }
                 ]}
                 isVisible={true}
              />
           </div>
        </main>

        <footer className="bg-[#E0E5EC] border-t border-slate-200 py-12 px-6 relative z-20">
           <div className="max-w-[1400px] mx-auto space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
                 <div>
                    <p className="text-[18px] font-bold text-[#002147] font-display">Sentra Healthcare Solutions</p>
                    <p className="text-[11px] font-bold text-[#E03D00] uppercase tracking-wide mt-1 font-technical">Beta Version · Build SR-V12-2026</p>
                 </div>
                 <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 py-2 px-4 rounded border border-emerald-200 font-technical">
                    <ShieldCheck size={14} /><span className="text-[10px] font-bold uppercase tracking-wide">Compliant</span>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                 <div className="md:col-span-8 space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 font-technical">Legal Disclaimer</p>
                    <p className="text-[13px] leading-relaxed text-slate-600 text-justify font-display">
                       Sentra Referralink adalah Clinical Decision Support System (CDSS) berbasis AI untuk mendukung dokter dalam proses diagnostik. Sistem mengintegrasikan LLM dan multi-agent orchestration untuk rekomendasi diagnosis diferensial dengan kode ICD-10.
                    </p>
                 </div>
                 <div className="md:col-span-4 space-y-3 border-l border-slate-200 pl-8">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 font-technical">Regulatory</p>
                    <p className="text-[13px] text-[#002147] font-display">PMK 24/2022 - RME Compliance</p>
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
   <div className="bg-white/60 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">{icon}</div>
         <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 font-technical">{title}</p>
            <p className="text-[14px] font-bold text-[#002147] font-display">{value}</p>
         </div>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
   </div>
);

export default App;
