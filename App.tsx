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
    </div>
  );
};

export default App;
