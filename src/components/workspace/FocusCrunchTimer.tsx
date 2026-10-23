'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Check,
  Zap,
} from 'lucide-react';

export default function FocusCrunchTimer() {
  const {
    panicLevel,
    focusMinutes,
    setFocusMinutes,
    focusSecondsRemaining,
    isFocusTimerRunning,
    setIsFocusTimerRunning,
    resetFocusTimer,
    calendarEvents,
    setIsCalendarOpen,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState(String(focusMinutes));
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomInput(String(focusMinutes));
  }, [focusMinutes]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const minutes = Math.floor(focusSecondsRemaining / 60);
  const seconds = focusSecondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const nearestHighEvent = calendarEvents.find((e) => e.priority === 'high' && !e.completed);

  const getTimerTheme = () => {
    switch (panicLevel) {
      case 'high':
        return {
          pill: 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:border-rose-500/60 shadow-rose-500/10',
          dot: 'bg-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          label: 'Exam Crunch Sprint',
        };
      case 'medium':
        return {
          pill: 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:border-amber-500/60 shadow-amber-500/10',
          dot: 'bg-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'Deep Study Block',
        };
      case 'low':
      default:
        return {
          pill: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:border-emerald-500/60 shadow-emerald-500/10',
          dot: 'bg-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'Pomodoro Focus',
        };
    }
  };

  const theme = getTimerTheme();

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0 && val <= 180) {
      setFocusMinutes(val);
      resetFocusTimer(val);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Header Pill Button */}
      <button
        type="button"
        id="focus-timer-pill"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all shadow-md cursor-pointer select-none ${theme.pill}`}
        title={`Focus Timer (${theme.label}) - Click to configure`}
      >
        <span
          className={`w-2 h-2 rounded-full ${theme.dot} ${
            isFocusTimerRunning ? 'animate-ping' : ''
          }`}
        />
        <Timer className="w-3.5 h-3.5 shrink-0" />
        <span className="font-mono font-bold text-xs tracking-tight">
          {formattedTime}
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 hidden md:inline">
          {panicLevel === 'high' ? 'CRUNCH' : panicLevel === 'medium' ? 'STUDY' : 'FOCUS'}
        </span>
        <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Controls */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0b1320]/95 backdrop-blur-2xl p-4 shadow-2xl border border-emerald-500/30 z-50 text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Smart Focus & Crunch Timer</span>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${theme.badge}`}>
              {panicLevel.toUpperCase()}
            </span>
          </div>

          {/* Time Display and Big Controls */}
          <div className="text-center py-2 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
            <div className="font-mono text-3xl font-extrabold tracking-tight text-white">
              {formattedTime}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {theme.label}
            </div>
          </div>

          {/* Start / Pause / Reset Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsFocusTimerRunning((prev) => !prev)}
              className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                isFocusTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {isFocusTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => resetFocusTimer()}
              className="py-2 px-3 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
              Urgency Presets (Syncs with Panic Level)
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFocusMinutes(25);
                  resetFocusTimer(25);
                }}
                className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                  focusMinutes === 25
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                25m Pomodoro
              </button>
              <button
                type="button"
                onClick={() => {
                  setFocusMinutes(45);
                  resetFocusTimer(45);
                }}
                className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                  focusMinutes === 45
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                45m Deep
              </button>
              <button
                type="button"
                onClick={() => {
                  setFocusMinutes(60);
                  resetFocusTimer(60);
                }}
                className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                  focusMinutes === 60
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                60m Crunch
              </button>
            </div>
          </div>

          {/* Custom Duration Input */}
          <form onSubmit={handleApplyCustomMinutes} className="flex items-center gap-2 pt-1 border-t border-white/5">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">Custom:</span>
            <input
              type="number"
              min={1}
              max={180}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white text-center font-mono focus:outline-none focus:border-emerald-500/50"
            />
            <span className="text-[11px] text-slate-400">min</span>
            <button
              type="submit"
              className="ml-auto px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
            >
              Set
            </button>
          </form>

          {/* Nearest Calendar Deadline alert indicator */}
          {nearestHighEvent && (
            <div
              onClick={() => {
                setIsOpen(false);
                setIsCalendarOpen(true);
              }}
              className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-xs cursor-pointer hover:bg-rose-500/15 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-rose-300 block truncate">
                  {nearestHighEvent.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Due: {nearestHighEvent.date} • Click to open Calendar
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
