/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { generateMockQuery } from './constants';
import { MedicalQuery, ProcessedResult } from './types';
import { searchICD10Code } from './services/geminiService';
import { DataCard } from './components/DataCard';
import { LogTerminal } from './components/LogTerminal';
import { SentraLogo } from './components/SentraLogo';
import { Send, RotateCw, ArrowRight, FileText, Terminal } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F5EFE6] welcome-overlay overflow-hidden">
      <div className="text-center animate-slide-up">
        <div className="flex justify-center mb-8">
          <SentraLogo size={120} color="#6D94C5" strokeWidth={50} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#1A1F21] mb-2 tracking-tighter">
          Halo pak Wildan, selamat bekerja
        </h1>
        <p className="text-[#6D94C5] text-xl font-bold tracking-widest uppercase">
          Sentra Solutions
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [history, setHistory] = useState<MedicalQuery[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ProcessedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [processedCount, setProcessedCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollY, innerHeight } = window;
      const { scrollHeight } = document.documentElement;
      const isAtBottom = scrollHeight - (scrollY + innerHeight) < 150;
      isAtBottomRef.current = isAtBottom;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current) {
      setTimeout(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      }, 200);
    }
  }, [resolutionHistory]);

  useEffect(() => {
    setHistory(generateMockQuery(5));
  }, []);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryText = customQuery || searchInput;
    if (!queryText.trim() || isProcessing) return;

    setIsProcessing(true);
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
        logs: ["Menginisialisasi sistem analisa rujukan...", `Menganalisis: ${queryText}`],
        durationMs: 0,
        status: 'processing',
    };

    setResolutionHistory(prev => [...prev, tempResult]);

    const start = performance.now();
    const result = await searchICD10Code(newQuery);
    const duration = performance.now() - start;

    setResolutionHistory(prev => prev.map(r => {
      if (r.id === newQuery.id) {
        return {
          ...r,
          output: result.json,
          logs: result.logs,
          durationMs: duration,
          status: 'completed'
        };
      }
      return r;
    }));

    setProcessedCount(prev => prev + 1);
    setIsProcessing(false);
  };

  const latestResult = resolutionHistory.length > 0 ? resolutionHistory[resolutionHistory.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#1A1F21] p-6 font-sans selection:bg-[#6D94C5]/30">
      {showWelcome && <WelcomeScreen />}
      
      <header className="max-w-[1600px] mx-auto mb-16 flex flex-col md:flex-row justify-between items-center pb-10 border-b-2 border-[#E8DFCA]">
        <div className="flex items-center gap-8">
          <div className="bg-[#E8DFCA] p-6 rounded-3xl shadow-[0_10px_30px_rgba(109,148,197,0.1)] border-2 border-white">
            <SentraLogo size={42} color="#6D94C5" strokeWidth={110} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-black text-[#1A1F21] tracking-tighter leading-none">
              Sentra Solutions
            </h1>
            <p className="font-handwriting text-[#6D94C5] text-2xl mt-1 leading-none">
              Architected by dr Ferdi Iskandar
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-10 md:mt-0">
          <form onSubmit={handleSearch} className="relative flex items-center group">
            <input 
               type="text"
               value={searchInput}
               onChange={(e) => setSearchInput(e.target.value)}
               placeholder="Input diagnosa (misal: faringitis)..."
               className="bg-white border-2 border-[#CBDCEB] rounded-2xl py-6 px-10 pr-20 text-xl font-black w-[350px] lg:w-[600px] focus:outline-none focus:border-[#6D94C5] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.05)] placeholder:text-[#A0A0A0]"
            />
            <button 
              type="submit"
              disabled={isProcessing || !searchInput.trim()}
              className="absolute right-4 p-5 rounded-xl bg-[#6D94C5] text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-2xl shadow-[#6D94C5]/20"
            >
              <Send size={28} strokeWidth={5} />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
        <section className="lg:col-span-3 flex flex-col gap-10 lg:sticky lg:top-10 lg:h-[calc(100vh-6rem)]">
           <div className="flex flex-col gap-6 flex-1 min-h-0">
               <h2 className="text-[13px] font-black text-[#6D94C5] uppercase tracking-[0.4em] px-4">RIWAYAT</h2>
               <div className="bg-[#E8DFCA] rounded-[48px] p-4 flex-1 shadow-xl border-2 border-white overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-y-auto space-y-4 p-3 custom-scrollbar">
                   {history.map((item) => (
                     <button 
                        key={item.id} 
                        onClick={() => handleSearch(undefined, item.query)}
                        className="w-full text-left bg-[#F5EFE6] p-6 rounded-3xl border-2 border-transparent hover:border-[#6D94C5] hover:bg-white transition-all group overflow-hidden"
                     >
                       <div className="text-[11px] text-[#6D94C5] mb-2 font-black uppercase">{new Date(item.timestamp).toLocaleTimeString('id-ID')}</div>
                       <div className="text-[15px] text-[#1A1F21] font-black leading-tight line-clamp-1">{item.query}</div>
                     </button>
                   ))}
                 </div>
               </div>
           </div>

           <div className="h-[320px] shrink-0 flex flex-col gap-4">
               <h2 className="text-[13px] font-black text-[#6D94C5] px-4 uppercase tracking-[0.4em]">ALUR PROSES AI</h2>
               <div className="flex-1 bg-white rounded-[40px] border-2 border-[#CBDCEB] overflow-hidden shadow-xl">
                  <LogTerminal logs={latestResult ? latestResult.logs : []} type="flash" />
               </div>
           </div>
        </section>

        <section className="lg:col-span-9">
          <div className="bg-white rounded-[80px] border-2 border-[#CBDCEB] shadow-[0_60px_100px_rgba(0,0,0,0.05)] relative flex flex-col min-h-[950px] overflow-hidden">
             <div className="absolute inset-0 opacity-[0.2] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#CBDCEB 2.5px, transparent 2.5px)', backgroundSize: '40px 40px' }}>
             </div>

             <div className="relative z-10 p-16 pb-60">
                {resolutionHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[650px] opacity-[0.2]">
                        <SentraLogo size={180} color="#6D94C5" strokeWidth={35} className="mb-14" />
                        <p className="text-6xl font-black tracking-tighter uppercase italic text-[#6D94C5]">Referal Assistant</p>
                        <p className="text-2xl font-black mt-6 tracking-widest text-[#1A1F21]">Masukkan diagnosa awal untuk asisten rujukan</p>
                    </div>
                ) : (
                    <div className="space-y-40">
                        {resolutionHistory.map((result, index) => {
                          const isLatest = index === resolutionHistory.length - 1;
                          return (
                            <div key={result.id} className={`transition-all duration-1000 ${isLatest ? 'opacity-100' : 'opacity-40 scale-[0.96] hover:opacity-100 hover:scale-100'}`}>
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-14 items-start">
                                    <div className="xl:col-span-4 space-y-8">
                                        <div className="text-[#6D94C5] text-[13px] font-black uppercase tracking-[0.4em] px-4">DIAGNOSA AWAL</div>
                                        <div className="bg-[#E8DFCA] p-10 rounded-[48px] border-2 border-white shadow-xl relative group">
                                            <div className="flex items-start gap-6">
                                                <div className="bg-white p-4 rounded-2xl border-2 border-[#CBDCEB]">
                                                    <FileText size={28} color="#6D94C5" strokeWidth={3} />
                                                </div>
                                                <p className="text-2xl text-[#1A1F21] font-black leading-tight tracking-tight">
                                                    "{result.input.query}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="xl:col-span-1 flex justify-center pt-24">
                                        <div className={`rounded-full p-5 border-2 border-[#CBDCEB] shadow-lg ${result.status === 'processing' ? 'animate-bounce bg-[#CBDCEB]' : 'bg-[#F5EFE6]'}`}>
                                            <ArrowRight size={32} strokeWidth={6} className={`${result.status === 'processing' ? 'text-[#6D94C5]' : 'text-[#CBDCEB]'} xl:rotate-0 rotate-90`} />
                                        </div>
                                    </div>

                                    <div className="xl:col-span-7">
                                        <DataCard 
                                            data={result.output} 
                                            loading={result.status === 'processing'} 
                                        />
                                    </div>
                                </div>
                                <div className="mt-32 border-b-8 border-[#CBDCEB] w-1/3 mx-auto rounded-full"></div>
                            </div>
                          );
                        })}
                    </div>
                )}
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;