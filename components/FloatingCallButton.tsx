import React from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

interface FloatingCallButtonProps {
  onClick?: () => void;
}

export const FloatingCallButton: React.FC<FloatingCallButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-20 right-6 md:right-24 z-[9999] flex flex-col items-end gap-3 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-white text-[12px] font-light tracking-wide shadow-2xl"
      >
        Ada pertanyaan, Chief?
      </motion.div>

      <motion.button
        type="button"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          boxShadow: [
            '0px 0px 0px rgba(34,197,94,0)',
            '0px 0px 16px rgba(34,197,94,0.35)',
            '0px 0px 0px rgba(34,197,94,0)'
          ]
        }}
        transition={{
          scale: { type: 'spring', stiffness: 260, damping: 20 },
          boxShadow: { duration: 2, repeat: Infinity }
        }}
        whileHover={{ scale: 1.08, rotate: 4 }}
        whileTap={{ scale: 0.93 }}
        className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-emerald-500 rounded-full text-white shadow-lg cursor-pointer group"
        aria-label="Buka chat Audrey"
        onClick={onClick}
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20 group-hover:hidden" />
        <Phone className="w-6 h-6 md:w-7 md:h-7" />
      </motion.button>
    </div>
  );
};

export default FloatingCallButton;
