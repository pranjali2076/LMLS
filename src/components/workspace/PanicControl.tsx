'use client';

import React from 'react';
import { PanicLevel } from '@/types';
import { useApp } from '@/context/AppContext';
import { Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface PanicControlProps {
  compact?: boolean;
}

export default function PanicControl({ compact = false }: PanicControlProps) {
  const { panicLevel, setPanicLevel } = useApp();

  const options: Array<{
    id: PanicLevel;
    label: string;
    description: string;
    activeClass: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'low',
      label: 'Low',
      description: 'Low Urgency • Deep Dive & Comprehensive Mode',
      activeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-500/15',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      id: 'medium',
      label: 'Medium',
      description: 'Medium Urgency • Balanced Output & Standard Pace',
      activeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/15',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'high',
      label: 'High',
      description: 'High Urgency • Rapid Exam & Deadline Rush Mode',
      activeClass: 'bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-md shadow-rose-500/25 high-panic-pulse',
      icon: <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden xl:inline">
          Panic Level:
        </span>
      )}

      {/* Frosted Glass Segmented Pill Container */}
      <div
        role="radiogroup"
        aria-label="Select Panic and Urgency Level"
        className="flex items-center p-1 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-inner"
      >
        {options.map((opt) => {
          const isSelected = panicLevel === opt.id;
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isSelected}
              id={`panic-level-${opt.id}`}
              type="button"
              title={opt.description}
              onClick={() => setPanicLevel(opt.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 select-none ${
                isSelected
                  ? opt.activeClass
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {opt.id === 'high' && isSelected && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
