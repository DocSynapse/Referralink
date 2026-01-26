import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface PortalSelectionProps {
  onSelect: (portal: 'referralink') => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();

    // Title fade in
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0
    );

    // Subtitle fade in
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      0.2
    );

    // Options fade in with stagger
    tl.fromTo(
      optionsRef.current?.querySelectorAll('.portal-option'),
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: { amount: 0.3 }
      },
      0.5
    );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
    >
      {/* Title */}
      <div ref={titleRef} className="text-center mb-4 opacity-0">
        <h2 className="text-5xl font-black text-white tracking-tight font-display">
          Choose Your Portal
        </h2>
      </div>

      {/* Subtitle */}
      <div ref={subtitleRef} className="text-center mb-12 opacity-0">
        <p className="text-base text-white/70 font-display">
          Select a Sentra platform to begin
        </p>
      </div>

      {/* Portal Options */}
      <div ref={optionsRef} className="flex flex-col gap-6 max-w-2xl w-full">
        {/* Referralink Option */}
        <button
          onClick={() => onSelect('referralink')}
          className="portal-option opacity-0 group p-8 bg-white/5 backdrop-blur border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
        >
          <div className="text-left">
            <h3 className="text-2xl font-black text-white mb-2 font-display group-hover:text-[#FF4500] transition-colors">
              Sentra Referralink
            </h3>
            <p className="text-white/60 font-display group-hover:text-white/80 transition-colors">
              Clinical Diagnosis Intelligence Platform
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-white/50 group-hover:text-white/70 font-technical">
              Enter Platform →
            </span>
          </div>
        </button>

        {/* Artificial Intelligence Option - Coming Soon */}
        <button
          disabled
          className="portal-option opacity-0 group p-8 bg-white/3 backdrop-blur border border-white/5 rounded-2xl cursor-not-allowed opacity-50"
        >
          <div className="text-left">
            <h3 className="text-2xl font-black text-white/40 mb-2 font-display">
              Sentra Artificial Intelligence
            </h3>
            <p className="text-white/40 font-display">
              Advanced AI Architecture & Strategy Platform
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-white/30 font-technical">
              Coming Soon ⏳
            </span>
          </div>
        </button>
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-white/30 font-technical tracking-widest uppercase">
          Sentra Operating Architectural Intelligence Hub
        </p>
      </div>
    </div>
  );
};
