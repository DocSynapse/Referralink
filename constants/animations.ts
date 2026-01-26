/**
 * Animation Constants - Standardized durations and easing
 * Single source of truth for all animations
 */

export const ANIMATION_DURATIONS = {
  // Micro-interactions (immediate feedback)
  MICRO: 150,              // 150ms: hover, focus

  // Standard transitions
  STANDARD: 300,           // 300ms: state changes, fade

  // Page/component entrance
  ENTER: 600,              // 600ms: page load, modal

  // GSAP Hero animations (in seconds for GSAP)
  GSAP_TITLE: 0.8,         // 0.8s: hero title block reveal
  GSAP_SUBTITLE: 0.6,      // 0.6s: subtitle animation
} as const;

export const ANIMATION_EASING = {
  // Standard easing functions (CSS cubic-bezier)
  EASE_OUT: 'cubic-bezier(0.33, 1, 0.68, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.42, 0, 0.58, 1)',
  EASE_IN: 'cubic-bezier(0.42, 0, 1, 1)',

  // Spring-like easing (approximated)
  SPRING: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
} as const;

export const ANIMATION_CLASSES = {
  // Fade animations
  FADE_IN: 'animate-fade-in',
  FADE_IN_UP: 'animate-fade-in-up',

  // Scale animations
  SCALE_IN: 'animate-scale-in',
  SCALE_IN_UP: 'animate-scale-in-up',

  // Status animations
  PULSE: 'animate-pulse',
  BOUNCE: 'animate-bounce',
  SPIN: 'animate-spin',
  PING: 'animate-ping',
} as const;

/**
 * Usage:
 *
 * TypeScript:
 * const duration = ANIMATION_DURATIONS.STANDARD; // 300
 *
 * CSS/Tailwind:
 * className={`transition-all duration-[${ANIMATION_DURATIONS.STANDARD}ms]`}
 *
 * Inline style:
 * style={{ transition: `all ${ANIMATION_DURATIONS.STANDARD}ms ${ANIMATION_EASING.EASE_IN_OUT}` }}
 */
