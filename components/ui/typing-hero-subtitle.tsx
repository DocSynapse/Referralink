import React, { useState, useEffect } from 'react';

interface TypingHeroSubtitleProps {
  heroSubtitle: string;
  heroAnimationReady: boolean;
}

/**
 * Self-contained component for the hero subtitle typing effect.
 * Prevents re-rendering the entire App component on every character typed.
 */
export const TypingHeroSubtitle: React.FC<TypingHeroSubtitleProps> = ({
  heroSubtitle,
  heroAnimationReady,
}) => {
  const [typedSubtitle, setTypedSubtitle] = useState("");

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
    }, 60);

    return () => clearInterval(interval);
  }, [heroAnimationReady, heroSubtitle]);

  return (
    <p className="hero-subtitle-text">
      {typedSubtitle || heroSubtitle}
      <span className="typing-caret inline-block w-2 ml-1 align-baseline text-[#002147]">|</span>
    </p>
  );
};
