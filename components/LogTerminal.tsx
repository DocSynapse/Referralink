/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

interface LogTerminalProps {
  logs: string[];
  type: 'flash' | 'thinking';
  streamText?: string;
  isStreaming?: boolean;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs, type, streamText, isStreaming }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  
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
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)] font-mono text-xs">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto space-y-2 custom-scrollbar"
      >
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-3 opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-[var(--md-sys-color-primary)] shrink-0 select-none">
              {new Date().toLocaleTimeString('id-ID', { hour12: false })}
            </span>
            <span className="text-[var(--md-sys-color-on-surface)] break-words">
              {log}
            </span>
          </div>
        ))}

        {/* Streaming Reasoning Display */}
        {streamText && (
          <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center gap-2 mb-2">
              {isStreaming && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--md-sys-color-primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--md-sys-color-primary)]"></span>
                </span>
              )}
              <span className="text-[var(--md-sys-color-primary)] text-[10px] uppercase tracking-wider font-semibold">
                {isStreaming ? 'AI Reasoning...' : 'Reasoning Complete'}
              </span>
            </div>
            <div className="text-[var(--md-sys-color-on-surface-variant)] whitespace-pre-wrap leading-relaxed">
              {streamText}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-[var(--md-sys-color-primary)] ml-0.5 animate-pulse" />
              )}
            </div>
          </div>
        )}

        {logs.length === 0 && !streamText && (
          <div className="h-full flex items-center justify-center text-[var(--md-sys-color-outline)] italic">
             Menunggu input diagnosa...
          </div>
        )}
      </div>
    </div>
  );
};
