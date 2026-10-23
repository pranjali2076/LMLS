'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { WORLD_KNOWLEDGE_BASE } from '@/data/worldKnowledge';
import {
  Globe,
  Newspaper,
  HeartPulse,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function LiveKnowledgeTicker() {
  const { openKnowledgeModal, askAboutKnowledgeTopic } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const featuredItems = WORLD_KNOWLEDGE_BASE.filter((k) => k.featured || k.category === 'news' || k.category === 'health');

  useEffect(() => {
    if (isPaused || featuredItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, featuredItems.length]);

  if (!isVisible || featuredItems.length === 0) return null;

  const currentItem = featuredItems[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-10 w-full bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-blue-950/40 border-b border-slate-800/80 px-4 py-2 text-xs flex items-center justify-between gap-3 backdrop-blur-md transition-all"
    >
      <div className="flex items-center gap-3 overflow-hidden min-w-0">
        {/* Pulsing Live Badge */}
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="uppercase tracking-wider">
            {currentItem.category === 'news' ? 'World News' : 'Health Tip'}
          </span>
        </div>

        {/* Ticker Content */}
        <div
          onClick={() => openKnowledgeModal(currentItem.category)}
          className="flex items-center gap-2 truncate cursor-pointer group hover:text-emerald-300 transition-colors"
          title="Click to view full knowledge brief"
        >
          {currentItem.category === 'news' ? (
            <Newspaper className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span className="font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
            {currentItem.title}
          </span>
          <span className="hidden md:inline text-slate-400 truncate max-w-sm">
            — {currentItem.summary}
          </span>
          <span className="text-[10px] text-emerald-400 hidden lg:inline-flex items-center gap-0.5 ml-1">
            Read brief <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => askAboutKnowledgeTopic(currentItem.title)}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>Ask AI</span>
        </button>

        <button
          type="button"
          onClick={() => openKnowledgeModal('all')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors"
        >
          <Globe className="w-3 h-3 text-teal-400" />
          <span className="hidden xs:inline">Hub</span>
        </button>

        <div className="flex items-center gap-0.5 border-l border-slate-800 pl-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Previous item"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Next item"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors ml-1"
            title="Dismiss ticker"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
