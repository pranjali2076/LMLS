'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AppSidebar from '@/components/layout/AppSidebar';
import AppHeader from '@/components/layout/AppHeader';
import ResponseFeed from '@/components/workspace/ResponseFeed';
import UniversalInput from '@/components/workspace/UniversalInput';
import WorldKnowledgeModal from '@/components/knowledge/WorldKnowledgeModal';
import SettingsModal from '@/components/workspace/SettingsModal';
import SmartCalendarModal from '@/components/workspace/SmartCalendarModal';
import CloudDriveModal from '@/components/workspace/CloudDriveModal';
import ShareSessionModal from '@/components/workspace/ShareSessionModal';

export default function AppPage() {
  const {
    isAuthenticated,
    isAuthLoading,
    isViewingSharedSession,
    sharedSessionTitle,
    forkSharedSession,
  } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // While verifying stored Google session or if unauthenticated, block access to the workspace
  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center bg-[#070b12] text-slate-300 select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10">
            <svg className="animate-spin h-6 w-6 text-slate-950" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-sm font-semibold text-white">Verifying Google Account Session...</span>
            <span className="text-xs text-slate-500 mt-0.5">Please sign in to access the workspace</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#070b12] text-slate-100">
      {/* Ambient background glows */}
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Left Collapsible Glass Sidebar */}
      <AppSidebar />

      {/* 2. Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60">
        {/* Core Controls Header (Frosted Glass & Borderless) */}
        <AppHeader />

        {/* Read-Only Shared Session Banner */}
        {isViewingSharedSession && (
          <div className="w-full bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 backdrop-blur-xl border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 shadow-lg z-20">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-base">👁️</span>
              <span>
                Viewing Shared Read-Only Session: <strong className="text-white font-semibold">{sharedSessionTitle}</strong>
              </span>
            </div>
            <button
              type="button"
              id="fork-shared-session-btn"
              onClick={forkSharedSession}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/25 cursor-pointer select-none"
            >
              Fork into Your Workspace
            </button>
          </div>
        )}

        {/* Multi-Domain Response Feed Area */}
        <main className="flex-1 overflow-y-auto relative flex flex-col min-h-0">
          <ResponseFeed />
        </main>

        {/* Multimodal Universal Input Bar (Floating Glass Pill at Bottom with safe area padding) */}
        <footer className="w-full shrink-0 z-20 pb-[env(safe-area-inset-bottom)]">
          <UniversalInput />
        </footer>
      </div>

      {/* World Knowledge & Intelligence Hub Modal */}
      <WorldKnowledgeModal />

      {/* Settings Modal */}
      <SettingsModal />

      {/* Smart Calendar & Scheduler Modal */}
      <SmartCalendarModal />

      {/* Cloud Drive (Google Drive Sync) Modal */}
      <CloudDriveModal />

      {/* Share Session Modal */}
      <ShareSessionModal />
    </div>
  );
}
