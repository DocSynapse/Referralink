import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ArrowDown, Search, Terminal, BookOpen, Zap, ShieldAlert, HeartPulse, Stethoscope, Siren, Plus, Minus, X, ChevronDown, LayoutGrid, ArrowRight, Activity, Phone, ShieldCheck, MapPin, Sun, AlertCircle, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import TextBlockAnimation from './components/ui/text-block-animation';
import { TextScramble } from './components/ui/text-scramble';

import { generateMockQuery, NON_REFERRAL_DIAGNOSES, EXAMPLE_QUERIES } from './constants';
import { MedicalQuery, ProcessedResult } from './types';
import { searchICD10Code, chatFriendly, setCurrentModel } from './services/geminiService';
import { DataCard } from './components/DataCard';
import { LogTerminal } from './components/LogTerminal';
import { ReferralDeck } from './components/ReferralDeck';
import { AdminPanelExtended } from './components/AdminPanelExtended';
import { AuthPanel } from './components/AuthPanel';
import { SplashScreen } from './components/SplashScreen';
import { GridDotsBackground } from './components/ui/background-patterns';
import { WaitlistPage } from './components/WaitlistPage';
import { TypingHeroSubtitle } from './components/ui/typing-hero-subtitle';
import FloatingCallButton from './components/FloatingCallButton';

type PageView = 'main' | 'referralink' | 'augmented';

// Hash-based routing utilities
const getRouteFromHash = (): PageView => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash === 'augmented') return 'augmented';
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
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authUsername, setAuthUsername] = useState("doc");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [ctaScrambleTrigger, setCtaScrambleTrigger] = useState(false);
  const authPanelRef = React.useRef<HTMLDivElement>(null);
  const authTriggerRef = React.useRef<HTMLDivElement>(null);
  const telemetry = (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );

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
      authPassword.trim() === (import.meta.env.VITE_AUTH_PASSWORD || "123456");
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
  // Periodic CTA scramble every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setCtaScrambleTrigger((prev) => !prev);
    }, 3000);
    return () => clearInterval(id);
  }, []);
const heroSectionRef = React.useRef<HTMLDivElement>(null);
const referralinkRef = React.useRef<HTMLHeadingElement>(null);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const currentMonth = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const todayDate = now.getDate();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hai, saya Audrey dari Sentra. Ada yang bisa Audrey bantu seputar Sentra Solutions atau Referralink?' }
  ]);
  useEffect(() => {
    // gunakan deepseek via OpenRouter (lebih CORS-friendly)
    setCurrentModel('DEEPSEEK_V3');
  }, []);
  const pickAudreyReply = (text: string) => {
    const t = text.toLowerCase();
    const rules: { match: RegExp; reply: string }[] = [
      { match: /(referral|rujuk|referralink)/, reply: 'Referralink = rujukan cepat + audit trail. Mau dijadwalkan demo 15 menit?' },
      { match: /(mitra|partner|kerja sama)/, reply: 'Kemitraan dibuka untuk RS/klinik/payor. Saya bisa kirim deck & SLA ringkas.' },
      { match: /(harga|biaya|pricing|lisensi)/, reply: 'Model lisensi fleksibel: pilot, enterprise, atau per-site. Sebutkan skala fasilitas, saya cocokkan opsi.' },
      { match: /(onboard|implement|deploy|pasang)/, reply: 'Onboarding tipikal 14–21 hari: audit data, set API, uji A/B, training klinis.' },
      { match: /(kontak|call|hubungi|cs|sales)/, reply: 'Saya bisa atur call dengan tim Sentra (CS/sales/clinical). Cantumkan slot waktu yang nyaman.' },
      { match: /(support|error|issue|bug|kendala)/, reply: 'Untuk kendala teknis, saya log tiket ke engineering shift-ops. Tolong sebutkan URL/step yang error.' },
      { match: /(dokter|klinis|safety|gate|governance)/, reply: 'Sentra pakai 6 safety gates + audit trail 10 tahun. Perlu ringkasan governance untuk komite medis?' },
      { match: /(data|pdp|privasi|keamanan|security)/, reply: 'Data reside ID region, enkripsi penuh, WORM audit. Saya bisa share satu-pager security.' }
    ];
    const found = rules.find(r => r.match.test(t));
    const fallback = [
      'Saya catat. Ada detail fasilitas (tipe RS/klinik, jumlah bed) supaya saya rute ke tim yang tepat?',
      'Siap. Mau saya kirim materi singkat (PDF) atau jadwalkan panggilan 15 menit?',
      'Noted. Kalau ada target go-live, tulis tanggalnya agar prioritas.',
      'Terima kasih. Audrey bisa hubungkan ke tim Sentra untuk tindak lanjut cepat.'
    ];
    return found ? found.reply : fallback[(Date.now() % fallback.length)];
  };

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || chatSending) return;
    setChatSending(true);
    setChatMessages((m) => [...m, { role: 'user', content: text }]);
    setChatInput('');
    try {
      // race AI call with 6s timeout; fallback to rules
      const aiCall = chatFriendly(text);
      const timeout = new Promise<{ reply: string; model: string }>((resolve) =>
        setTimeout(() => resolve({ reply: '', model: 'timeout' }), 6000)
      );
      const res = await Promise.race([aiCall, timeout]);

      const rawReply = (res.reply || '').trim();
      const lower = rawReply.toLowerCase();
      const needsFallback =
        !rawReply ||
        res.model === 'unavailable' ||
        res.model === 'timeout' ||
        lower.includes('maaf') ||
        lower.includes('tidak bisa') ||
        lower.includes('kanal ai') ||
        lower === chatMessages[chatMessages.length - 1]?.content?.toLowerCase();

      const reply = needsFallback ? pickAudreyReply(text) : rawReply;
      setChatMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setChatMessages((m) => [...m, { role: 'assistant', content: pickAudreyReply(text) }]);
    } finally {
      setChatSending(false);
    }
  };
  const heroSubtitle = "Where Intelligence Becomes Responsibility.";

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


  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
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
          return { ...r, status: 'failed', logs: [...r.logs, `ERROR: ${errorMessage}`] };
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
      <>
        {telemetry}
        <div
          className={`transition-opacity ease-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          style={{ transitionDuration: '400ms' }}
        >
          <WaitlistPage onBack={() => navigateTo('main')} />
        </div>
      </>
    );
  }

  // Render Augmented page placeholder
  if (currentPage === 'augmented') {
    return (
      <>
        {telemetry}
        <div
          className={`transition-opacity ease-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          style={{ transitionDuration: '400ms' }}
        >
          <section className="min-h-screen flex flex-col items-center justify-center bg-[#E0E5EC] px-6 text-slate-700">
            <div className="max-w-3xl text-center space-y-4">
              <p className="text-[12px] font-technical uppercase tracking-[0.3em] text-slate-500">
                Augmented Artificial Intelligence Diagnostic
              </p>
              <h1 className="font-saans-title text-[42px] leading-tight text-[#002147]">
                Augmented Diagnostic Suite
              </h1>
              <p className="text-[16px] text-slate-600">
                Coming soon: layer analitik lanjutan untuk penilaian risiko, explainability, dan kontrol human-in-loop.
              </p>
              <button
                onClick={() => navigateTo('main')}
                className="mt-4 px-5 py-3 rounded-xl text-[14px] font-semibold text-white bg-[#E03D00] hover:bg-[#c73600] transition-colors"
              >
                Kembali ke beranda
              </button>
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      {telemetry}
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
          <div className="max-w-5xl w-full flex flex-col gap-0 z-10 -mt-24 md:-mt-28 lg:-mt-32">

            {/* Top Row: Title + Enter Dashboard */}
            <div className="flex items-end justify-between mb-10">
              {/* Left: Sentra Referralink */}
              <div className="flex flex-col items-start gap-0">
                  {/* SEO-optimized H1 (hidden visually, visible to search engines and screen readers) */}
                  <h1 className="sr-only">
                    Sentra ReferraLink - AI-Powered Clinical Referral System for Healthcare Professionals in Indonesia
                  </h1>

                  <TextBlockAnimation blockColor="#002147" animateOnScroll={false} delay={0.1} duration={0.6} isEnabled={heroAnimationReady}>
                      <p className="hero-subtitle-label" style={{ fontSize: '42px', lineHeight: '44px' }}>
                          Sentra
                      </p>
                  </TextBlockAnimation>
                  <p className="text-[11px] font-technical uppercase tracking-[0.3em] text-slate-500 mt-1">
                    Powered by RSIA Melinda Dhia
                  </p>
                  {/* Visual title for users (decorative, not H1) */}
                  <div ref={referralinkRef} className="font-saans-title -mt-2" aria-hidden="true">
                      <span style={{ color: '#002147' }}>Artificial</span><span style={{ color: '#FF4500' }}> Intelligence</span>
                  </div>
              </div>

              {/* Right: Enter Dashboard */}
              <div
                ref={authTriggerRef}
                onClick={openAuthPanel}
                className="relative flex items-center gap-3 text-slate-600 hover:text-[#E03D00] font-technical transition-colors cursor-pointer group"
              >
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                <TextScramble
                  as="span"
                  trigger={ctaScrambleTrigger}
                  speed={0.02}
                  duration={0.7}
                  className="text-[18px] font-bold uppercase tracking-[0.25em]"
                >
                  Enter Referralink
                </TextScramble>
                <TextScramble
                  as="span"
                  trigger={ctaScrambleTrigger}
                  speed={0.02}
                  duration={0.7}
                  className="text-[12px] text-slate-500 absolute -bottom-6 left-6"
                >
                  Alpha (Internal Testing)
                </TextScramble>

                  {showAuthPanel && (
                    <AuthPanel
                      onClose={() => setShowAuthPanel(false)}
                      onSuccess={() => {
                        setShowAuthPanel(false);
                        navigateTo('referralink');
                      }}
                    />
                  )}
              </div>
            </div>

            {/* Subtitle text */}
            <div className="mb-2 max-w-2xl">
                <TextBlockAnimation blockColor="#002147" animateOnScroll={false} delay={0.5} duration={0.7} isEnabled={heroAnimationReady}>
                    <TypingHeroSubtitle heroSubtitle={heroSubtitle} heroAnimationReady={heroAnimationReady} />
                </TextBlockAnimation>
            </div>

            {/* Signature */}
            <div className="pl-0 flex items-start gap-4 flex-wrap">
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

          {/* Minimal chat box triggered by call bubble */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                key="audrey-chat-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9998] pointer-events-none"
              >
                <div
                  className="absolute inset-0 pointer-events-auto"
                  onClick={() => setChatOpen(false)}
                />
                <motion.div
                  key="audrey-chat"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="pointer-events-auto fixed right-6 bottom-44 md:right-14 md:bottom-48 w-[320px] max-w-[90vw] rounded-2xl border border-white/30 bg-white/60 backdrop-blur-2xl shadow-[0_18px_36px_rgba(0,31,58,0.14)] z-[9999]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/70">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-200">
                      <img src="/audrey.png" alt="Audrey AI - Sentra Healthcare Clinical Support Chatbot Assistant" className="w-full h-full object-cover" width="40" height="40" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-[#0b1f3a]">Audrey • Sentra</p>
                  <p className="text-[13px] text-emerald-600">Online</p>
                    </div>
                    <button
                      onClick={() => setChatOpen(false)}
                      className="text-slate-500 hover:text-slate-800 text-sm"
                      aria-label="Tutup chat"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-2">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                        className={`px-3 py-2 rounded-[14px] text-[13px] leading-snug shadow-sm ${
                          m.role === 'user' ? 'bg-[#fff4ec] text-[#7a3a10] rounded-br-[6px]' : 'bg-[#e9f4ff] text-[#0b1f3a] rounded-bl-[6px]'
                        }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleChatSend();
                      }
                    }}
                    className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                    placeholder="Ketik pesan..."
                  />
                  <button
                    onClick={handleChatSend}
                    className="px-3 py-2 rounded-full bg-emerald-500 text-white text-[13px] font-semibold shadow-md hover:brightness-110"
                  >
                    Kirim
                  </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <FloatingCallButton onClick={() => setChatOpen(true)} />
      </section>
      </div>
    </>
  );
};

export default App;
