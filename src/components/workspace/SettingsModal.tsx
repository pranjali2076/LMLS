'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  X,
  Sparkles,
  Shield,
  Cpu,
  Flame,
  Volume2,
  Trash2,
  LogOut,
  Check,
  Zap,
  Code2,
  Compass,
  BookOpen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LMLS_COGNITIVE_MODELS, getModelConfig } from '@/data/models';

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    panicLevel,
    setPanicLevel,
    user,
    logout,
    createNewSession,
    activeModel,
    setActiveModel,
  } = useApp();
  const router = useRouter();

  if (!isSettingsOpen) return null;

  const currentConfig = getModelConfig(activeModel);

  const handleLogout = () => {
    setIsSettingsOpen(false);
    logout();
    router.replace('/login');
  };

  const handleResetWorkspace = () => {
    createNewSession('academic');
    setIsSettingsOpen(false);
  };

  const getModelIcon = (id: string) => {
    switch (id) {
      case 'lmls-4':
        return Sparkles;
      case 'lmls-2.8':
        return Zap;
      case 'lmls-5.1':
        return BookOpen;
      case 'snif-5.8':
        return Code2;
      case 'hals-5.5':
        return Cpu;
      case 'optic-5.5':
        return Compass;
      default:
        return Sparkles;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Frosted Glassmorphism Modal Box */}
      <div className="relative w-full max-w-xl rounded-2xl glass-panel-emerald p-6 sm:p-8 shadow-2xl border border-emerald-500/30 backdrop-blur-2xl text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20">
              <Settings className="w-5 h-5 text-slate-950 animate-spin-slow" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                LMLS Workspace Settings
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  v2.4
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cognitive models, glass styling & urgency presets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
          {/* 1. Cognitive AI Engine */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                Active Cognitive Model
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Active: <span className="text-emerald-400 font-semibold">{currentConfig.name}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LMLS_COGNITIVE_MODELS.map((m) => {
                const isSelected = activeModel === m.id;
                const IconComponent = getModelIcon(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveModel(m.id)}
                    className={`w-full p-3 rounded-xl text-left flex items-start justify-between cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/40 border-white/5 opacity-75 hover:opacity-100 hover:bg-slate-800/50 hover:border-white/15'
                    }`}
                  >
                    <div className="flex-1 pr-2 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-semibold text-xs flex items-center gap-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                          {m.name}
                        </span>
                        <span
                          className={`text-[8.5px] font-mono px-1 py-0.2 rounded font-semibold ${
                            isSelected
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800/80 text-slate-400 border border-white/5'
                          }`}
                        >
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                        {m.subtitle}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5 ml-1">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20 bg-slate-900/60" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Default Panic Level */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              Urgency & Panic Level Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((lvl) => {
                const isActive = panicLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPanicLevel(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium capitalize transition-all border ${
                      isActive
                        ? lvl === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10'
                          : lvl === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/40 text-slate-400 border-white/5 hover:bg-slate-800/40'
                    }`}
                  >
                    {lvl} Mode
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Visual Glassmorphism Settings */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">Glassmorphism Frosted Blur</span>
              <span className="text-[11px] text-emerald-400 font-mono">Active (20px)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">Emerald Ambient Glow Effect</span>
              <span className="text-[11px] text-emerald-400 font-mono">Active</span>
            </div>
          </div>

          {/* 4. User Account Info */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md">
                {(user?.name || user?.email || 'G').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">{user?.name || 'Google User'}</span>
                <span className="text-[11px] text-slate-400 font-mono">{user?.email || 'user@gmail.com'}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetWorkspace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
