'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, Play, Pause, RotateCcw, ChevronDown, Check, AlertTriangle } from 'lucide-react';

export default function CountdownWidget() {
  const {
    remainingSeconds,
    setRemainingSeconds,
    isTimerRunning,
    setIsTimerRunning,
    panicLevel,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [inputHours, setInputHours] = useState('3');
  const [inputMinutes, setInputMinutes] = useState('45');
  const [inputDays, setInputDays] = useState('0');

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
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

  // Format seconds to readable timer
  const formatTime = (totalSecs: number) => {
    if (totalSecs <= 0) return 'Time Expired';
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handleApplyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseInt(inputDays, 10) || 0;
    const h = parseInt(inputHours, 10) || 0;
    const m = parseInt(inputMinutes, 10) || 0;
    const total = d * 86400 + h * 3600 + m * 60;
    if (total > 0) {
      setRemainingSeconds(total);
      setIsTimerRunning(true);
      setIsOpen(false);
    }
  };

  const setPreset = (seconds: number) => {
    setRemainingSeconds(seconds);
    setIsTimerRunning(true);
    setIsOpen(false);
  };

  // Color dynamic based on panic level or time urgency
  const getBadgeStyle = () => {
    if (panicLevel === 'high' || remainingSeconds < 3600) {
      return 'bg-rose-500/15 border-rose-500/40 text-rose-300 ring-rose-500/20 shadow-rose-950/30';
    }
    if (panicLevel === 'medium' || remainingSeconds < 14400) {
      return 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-amber-500/20 shadow-amber-950/30';
    }
    return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-emerald-500/20 shadow-emerald-950/30';
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Ticking Interactive Badge Trigger */}
      <button
        type="button"
        id="countdown-timer-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium shadow-sm transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 select-none ${getBadgeStyle()}`}
        title="Click to adjust remaining time or countdown presets"
      >
        <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'animate-pulse' : ''}`} />
        <span className="font-semibold">{formatTime(remainingSeconds)}</span>
        <span className="text-[10px] uppercase font-sans font-normal opacity-70 hidden sm:inline">
          left
        </span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Popover Settings Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Time Left Countdown Configuration"
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl glass-panel p-4 shadow-2xl border border-slate-700/80 backdrop-blur-xl z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                How much time do you have left?
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isTimerRunning ? 'Pause Ticker' : 'Resume Ticker'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="my-3">
            <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Quick Presets:</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setPreset(45 * 60)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <span>45m Speedrun</span>
                <span className="text-[10px] text-rose-400 font-mono">Rush</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(2 * 3600)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <span>2 Hours Cram</span>
                <span className="text-[10px] text-amber-400 font-mono">High</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(6 * 3600)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <span>6 Hours Sprint</span>
                <span className="text-[10px] text-blue-400 font-mono">Work</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(24 * 3600)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <span>24 Hours Final</span>
                <span className="text-[10px] text-emerald-400 font-mono">Calm</span>
              </button>
            </div>
          </div>

          {/* Custom Time Form */}
          <form onSubmit={handleApplyCustomTime} className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-[11px] text-slate-400 font-medium">Custom Remaining Time:</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 mb-1">Days</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={inputDays}
                  onChange={(e) => setInputDays(e.target.value)}
                  className="w-full text-center py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={inputHours}
                  onChange={(e) => setInputHours(e.target.value)}
                  className="w-full text-center py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  className="w-full text-center py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5" /> Set Countdown
              </button>
              <button
                type="button"
                onClick={() => setRemainingSeconds(13500)}
                className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                title="Reset to default 3h 45m"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {remainingSeconds < 1800 && (
            <div className="mt-3 p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Critical urgency: Less than 30 minutes remaining!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
