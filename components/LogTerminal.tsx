/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

interface LogTerminalProps {
  logs: string[];
  type: 'flash' | 'thinking';
  streamText?: string; 
}

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs, type, streamText }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  
  const typeColor = type === 'flash' ? 'text-[#6D94C5]' : 'text-[#A0A0A0]';

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 50;
    isAtBottomRef.current = isAtBottom;
  };

  useEffect(() => {
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, streamText]);

  return (
    <div className="flex flex-col h-full bg-[#F5EFE6] rounded-3xl border-2 border-[#CBDCEB] overflow-hidden font-sans text-[11px]">
      
      {/* Console Header */}
      <div className="bg-[#CBDCEB] px-5 py-3 border-b-2 border-white flex justify-between items-center shadow-sm">
        <span className={`font-black ${typeColor} text-[10px] uppercase tracking-[0.25em]`}>
            {type === 'flash' ? '>>> LOG_PROSES' : '>>> ALUR_PIKIR'}
        </span>
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8DFCA]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#6D94C5]"></div>
        </div>
      </div>

      {/* Console Body */}
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 p-5 overflow-y-auto space-y-2.5 custom-scrollbar"
      >
        {logs.map((log, i) => (
          <div key={i} className="flex items-start group">
            <span className="text-[#6D94C5] mr-4 select-none shrink-0 font-black text-[10px] group-hover:scale-110 transition-transform">
              [{new Date().toLocaleTimeString('id-ID').split(' ')[0]}]
            </span>
            <span className="text-[#1A1F21] font-bold leading-relaxed tracking-tight" style={{ opacity: Math.max(0.6, 1 - (logs.length - i) * 0.05) }}>
              {log}
            </span>
          </div>
        ))}
        
        {logs.length === 0 && (
          <div className="text-[#CBDCEB] font-black uppercase tracking-[0.2em] flex items-center gap-3 h-full justify-center">
             <div className="w-2 h-2 rounded-full bg-[#6D94C5] animate-ping"></div>
             STANDBY_MODE
          </div>
        )}
      </div>
    </div>
  );
};