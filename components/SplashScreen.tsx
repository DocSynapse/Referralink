import React, { useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface SplashScreenProps {
  onComplete?: (portal: 'referralink') => void;
  onPortalSelect?: (portal: 'referralink' | 'puskesmas') => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onPortalSelect,
  duration = 5000
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const logoRef = React.useRef<SVGSVGElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);
  const subtitleRef = React.useRef<HTMLDivElement>(null);
  const authorRef = React.useRef<HTMLDivElement>(null);
  const buttonsRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !logoRef.current) return;

    const tl = gsap.timeline();

    // Phase 1: Title staggered text reveal (0ms)
    const titleChars = titleRef.current?.querySelectorAll('.char');
    if (titleChars && titleChars.length > 0) {
      tl.fromTo(
        titleChars,
        { opacity: 0, scale: 0.5, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'back.out',
          stagger: { amount: 0.4 }
        },
        0
      );
    }

    // Phase 2: Subtitle fade (600ms after start, 600ms duration)
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0.6
    );

    // Phase 3: Author text fade (1200ms after start, 400ms duration)
    tl.fromTo(
      authorRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      1.2
    );

    // Phase 4: Portal options fade in (1600ms after start, 500ms duration)
    if (buttonsRef.current) {
      gsap.fromTo(
        buttonsRef.current?.querySelectorAll('.portal-btn') as any,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: 1.6
        }
      );
    }
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      {/* Title - Staggered Character Reveal */}
      <div ref={titleRef} className="text-center mb-6 flex justify-center">
        <h1 className="splash-title-thin inline-flex gap-0">
          <span className="char">S</span>
          <span className="char">e</span>
          <span className="char">n</span>
          <span className="char">t</span>
          <span className="char">r</span>
          <span className="char">a</span>
        </h1>
      </div>

      {/* Subtitle - Strategic Framework */}
      <div ref={subtitleRef} className="text-center mb-8 max-w-2xl px-6">
        <p className="text-base text-white/80 leading-relaxed font-display">
          A unified intelligence entity dedicated to securing Indonesia's healthcare legacy through augmented architecture and strategic human-AI collaboration.
        </p>
      </div>

      {/* Author */}
      <div ref={authorRef} className="text-center mb-16">
        <p className="text-sm text-white/60 font-technical tracking-wide">
          Architected & built by dr Ferdi Iskandar
        </p>
      </div>

      {/* Portal Selection - Horizontal Layout */}
      <div ref={buttonsRef} className="mt-12 pt-12 border-t border-white/30 w-full max-w-2xl flex flex-col items-center">
        <div className="flex items-center justify-center gap-12 px-6 w-full">
          {/* Referralink Option */}
          <button
            onClick={() => onPortalSelect?.('referralink')}
            className="portal-btn flex-1 text-center group cursor-pointer"
          >
            <p className="text-3xl font-bold text-white uppercase tracking-wider font-technical group-hover:text-[#FF4500] transition-colors">
              Sentra Referralink
            </p>
            <p className="text-sm text-white/60 mt-3 font-display group-hover:text-white/80 transition-colors">
              Smart Referral Intelligence
            </p>
          </button>

          {/* Vertical Separator */}
          <div className="h-16 w-px bg-white/20"></div>

          {/* AI Option - Coming Soon */}
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold text-white/50 uppercase tracking-wider font-technical">
              Sentra AI
            </p>
            <p className="text-sm text-white/30 mt-3 font-display">
              Coming Soon
            </p>
          </div>
        </div>

        {/* Puskesmas Balowerti Override Node */}
        <div className="mt-10 portal-btn opacity-0">
            <button
                onClick={() => onPortalSelect?.('puskesmas')}
                className="group relative px-8 py-3 bg-[#00A86B]/10 hover:bg-[#00A86B]/20 border border-[#00A86B]/30 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,168,107,0.3)]"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse relative z-10"></div>
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#00A86B] animate-ping opacity-50"></div>
                    </div>
                    <span className="text-xs font-technical uppercase tracking-[0.2em] text-[#00A86B] group-hover:text-[#4ADE80] transition-colors">
                        Puskesmas Balowerti Node • 144 DX Active
                    </span>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};
