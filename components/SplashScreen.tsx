import React, { useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 5000
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const logoRef = React.useRef<SVGSVGElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);
  const subtitleRef = React.useRef<HTMLDivElement>(null);
  const authorRef = React.useRef<HTMLDivElement>(null);
  const dotsRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !logoRef.current) return;

    const tl = gsap.timeline();

    // Phase 1: Logo scale + fade in (0-600ms)
    tl.fromTo(
      logoRef.current,
      { scale: 0.3, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out' },
      0
    );

    // Phase 2: Title reveal (200ms after logo starts, 500ms duration)
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      0.2
    );

    // Phase 3: Subtitle fade (400ms after title starts, 600ms duration)
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0.6
    );

    // Phase 4: Author text fade (1200ms after start, 400ms duration)
    tl.fromTo(
      authorRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      1.2
    );

    // Phase 5: Loading dots pulse (1700ms after start, continuous)
    tl.fromTo(
      dotsRef.current?.querySelectorAll('.dot'),
      { opacity: 0.3 },
      {
        opacity: 1,
        duration: 0.6,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: { amount: 0.3 }
      },
      1.7
    );

    // Phase 6: Fade out & complete (auto at duration - 300ms)
    const fadeOutTime = (duration - 300) / 1000;

    // Trigger hero animation at start of fade-out (smooth blend)
    tl.call(() => {
      if (onComplete) onComplete();
    }, [], fadeOutTime);

    tl.to(
      containerRef.current,
      { opacity: 0, duration: 0.3, ease: 'power1.in' },
      fadeOutTime
    );

  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      {/* Logo - Double Chevron (Forward Momentum + Infrastructure) */}
      <div className="mb-8 flex justify-center">
        <svg
          ref={logoRef}
          width="130"
          height="130"
          viewBox="0 0 130 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          {/* Upper Chevron - Strategic Architecture */}
          <path
            d="M 35 45 L 65 70 L 95 45"
            stroke="white"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Lower Chevron - Forward Momentum */}
          <path
            d="M 35 75 L 65 100 L 95 75"
            stroke="white"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Center vertical line - Integrity/Foundation */}
          <line
            x1="65"
            y1="70"
            x2="65"
            y2="75"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Title */}
      <div ref={titleRef} className="text-center mb-6">
        <h1 className="splash-title-thin">
          Sentra
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

      {/* Loading Indicator */}
      <div
        ref={dotsRef}
        className="flex gap-2 items-center justify-center"
      >
        <span className="dot w-2.5 h-2.5 rounded-full bg-white/50" />
        <span className="dot w-2.5 h-2.5 rounded-full bg-white/50" />
        <span className="dot w-2.5 h-2.5 rounded-full bg-white/50" />
      </div>

      {/* Loading text */}
      <p className="text-xs text-white/40 mt-8 tracking-[0.2em] uppercase font-technical">
        Initializing System
      </p>
    </div>
  );
};
