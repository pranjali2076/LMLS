'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import PanicControl from '@/components/workspace/PanicControl';
import FocusCrunchTimer from '@/components/workspace/FocusCrunchTimer';
import { Menu, Sparkles, Share2 } from 'lucide-react';

export default function AppHeader() {
  const { setIsSidebarCollapsed, openShareModal } = useApp();

  return (
    <header className="relative z-20 w-full bg-[#0b1320]/60 backdrop-blur-xl border-b border-white/10 px-3 py-2 md:px-6 select-none shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left Section: Mobile Toggle & Original Glowing Emerald LMLS Branding */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile menu toggle button (hidden on desktop to avoid duplicate icons) */}
          <button
            type="button"
            id="mobile-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 md:hidden transition-colors"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Original Glowing Emerald LMLS Logo & Branding */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5 leading-none">
                LMLS <span className="text-emerald-400">Cognitive</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono leading-none mt-1">v2.4 Enterprise</span>
            </div>
          </div>
        </div>

        {/* Far Top-Right Section: Focus Crunch Timer + Panic Selector + Share Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap">
          {/* Interactive Focus & Crunch Timer Widget */}
          <FocusCrunchTimer />

          {/* Horizontal PANIC LEVEL Selector with Frosted Glass Pill */}
          <PanicControl />

          {/* Top Header Share Session Button */}
          <button
            type="button"
            id="header-share-session-btn"
            onClick={() => openShareModal()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-slate-200 text-xs font-semibold transition-all shadow-sm cursor-pointer select-none"
            title="Share current workspace session"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </header>
  );
}
