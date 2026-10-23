import React from 'react';
import type { Metadata } from 'next';
import AuthCard from '@/components/auth/AuthCard';
import { Sparkles, Brain, Cpu, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In | LMLS Cognitive Workspace',
  description: 'Secure enterprise authentication for LMLS AI multi-domain workspace.',
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#070b12] text-slate-100 overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/10 via-teal-500/15 to-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Navbar Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-semibold text-sm text-white">LMLS Cognitive AI</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            System Status: 100% Operational
          </span>
          <span className="text-slate-500 font-mono">v2.4-turbocore</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <AuthCard />
      </main>

      {/* Subtle Footer Feature Highlights */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 border-t border-slate-800/60">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left text-xs text-slate-400">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <Brain className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Multi-Domain Reasoning: Academic, Health & Deadlines</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Realtime Adaptive Urgency & Countdown Controls</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Zero-Retention Private Vault Encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
