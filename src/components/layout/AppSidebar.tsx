'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  Plus,
  Search,
  Trash2,
  Archive,
  MessageSquare,
  Settings,
  LogOut,
  Calendar,
  Cloud,
} from 'lucide-react';
import { getModelConfig } from '@/data/models';

export default function AppSidebar() {
  const router = useRouter();
  const {
    historySessions,
    activeSessionId,
    setActiveSessionId,
    deleteSession,
    archiveSession,
    createNewSession,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsSettingsOpen,
    activeModel,
    setIsCalendarOpen,
    setIsDriveOpen,
    user,
    logout,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const userDisplayName = user?.name || 'Alex Rivera';
  const userInitial = userDisplayName.charAt(0).toUpperCase();
  const userSubtitle = user?.role || user?.email || 'Senior Research Architect';
  const currentModelName = getModelConfig(activeModel).name;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Filter history sessions
  const filteredSessions = historySessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`relative z-30 flex flex-col h-full bg-[#0b1320]/75 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 select-none shadow-2xl ${
        isSidebarCollapsed ? 'w-20' : 'w-72 sm:w-80'
      }`}
    >
      {/* 1. Header: Glowing Emerald LMLS Sparkle Logo Toggle (Clicking opens/closes sidebar) */}
      {isSidebarCollapsed ? (
        <div className="flex flex-col items-center py-4 px-2 border-b border-white/10">
          <button
            type="button"
            id="sidebar-logo-toggle-collapsed"
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="LMLS Cognitive AI • Click to expand sidebar"
            aria-label="Expand sidebar"
          >
            <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="p-4 pb-3 border-b border-white/10">
          <div
            role="button"
            tabIndex={0}
            id="sidebar-logo-toggle-expanded"
            onClick={() => setIsSidebarCollapsed(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsSidebarCollapsed(true);
            }}
            className="flex items-center gap-3 cursor-pointer group select-none transition-transform hover:opacity-95"
            title="LMLS Cognitive v2.4 Enterprise"
            aria-label="LMLS Cognitive"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 leading-none">
                LMLS <span className="text-emerald-400">Cognitive</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono leading-none mt-1.5">
                v2.4 Enterprise
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bright Emerald-Green "+ New Session" Button */}
      <div className="p-3 border-b border-white/10">
        <button
          type="button"
          id="new-query-btn"
          onClick={() => createNewSession('academic')}
          className={`flex items-center justify-center gap-2 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 transition-all ${
            isSidebarCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full py-2.5 px-3'
          }`}
          title="New Session"
        >
          <Plus className="w-4 h-4" />
          {!isSidebarCollapsed && <span>New Session</span>}
        </button>
      </div>

      {/* 3. Navigation Triggers: Smart Calendar & Cloud Drive Sync (below New Session button) */}
      {isSidebarCollapsed ? (
        <div className="py-2.5 px-2 border-b border-white/10 flex flex-col items-center gap-2">
          <button
            type="button"
            id="sidebar-calendar-nav-btn-collapsed"
            onClick={() => setIsCalendarOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/70 transition-all flex items-center justify-center group"
            title="Smart Calendar & Scheduler"
            aria-label="Smart Calendar"
          >
            <Calendar className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </button>

          <button
            type="button"
            id="sidebar-drive-nav-btn-collapsed"
            onClick={() => setIsDriveOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 transition-all flex items-center justify-center group"
            title="Cloud Drive (Google Drive Sync)"
            aria-label="Cloud Drive"
          >
            <Cloud className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="px-3 py-2.5 border-b border-white/10 grid grid-cols-2 gap-2">
          <button
            type="button"
            id="sidebar-calendar-nav-btn"
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-emerald-500/30 transition-all shadow-sm group"
            title="Smart Calendar & Scheduler"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Calendar</span>
          </button>

          <button
            type="button"
            id="sidebar-drive-nav-btn"
            onClick={() => setIsDriveOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all shadow-sm group"
            title="Cloud Drive (Google Drive Sync)"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Drive Sync</span>
          </button>
        </div>
      )}

      {/* 4. Search Filter Input (When expanded) */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search past chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* 4. Categorized History Section */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {!isSidebarCollapsed && (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
            Recent Sessions
          </div>
        )}

        {isSidebarCollapsed ? (
          /* When collapsed, keep body clean (no vertical column of history icons) */
          null
        ) : filteredSessions.length === 0 ? (
          <div className="px-3 py-6 text-xs text-slate-500 text-center">
            {searchQuery ? 'No sessions match your search.' : 'No recent sessions'}
          </div>
        ) : (
          filteredSessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all duration-150 cursor-pointer border ${
                  isActive
                    ? 'bg-slate-800/80 text-white font-medium border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-transparent hover:border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate block font-medium">{sess.title}</span>
                </div>

                {/* Delete and Archive buttons on hover */}
                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => archiveSession(sess.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700/60 transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSession(sess.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Fixed Bottom-Left Corner: Settings Directly Above User Login Avatar */}
      {isSidebarCollapsed ? (
        <div className="mt-auto border-t border-white/10 p-2.5 flex flex-col items-center gap-2.5">
          {/* Settings (⚙️) Button directly above user avatar */}
          <button
            type="button"
            id="sidebar-settings-btn-collapsed"
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/70 transition-all flex items-center justify-center group cursor-pointer"
            title="Workspace Settings"
            aria-label="Workspace Settings"
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:rotate-45 transition-all" />
          </button>

          {/* User Avatar (A / Alex Rivera) */}
          <button
            type="button"
            id="sidebar-collapsed-profile-avatar"
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={`${userDisplayName} • Click for profile & settings`}
            aria-label="User Profile and Settings"
          >
            {userInitial}
          </button>
        </div>
      ) : (
        <div className="mt-auto border-t border-white/10 bg-[#0b1320]/60 backdrop-blur-xl p-3 flex flex-col gap-2">
          {/* Settings (⚙️) Button directly above user login avatar */}
          <button
            type="button"
            id="sidebar-settings-btn-expanded"
            onClick={() => setIsSettingsOpen(true)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center justify-between text-xs group cursor-pointer"
            title="Workspace Settings"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:rotate-45 transition-all" />
              <span className="font-medium text-slate-300 group-hover:text-white">Workspace Settings</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {currentModelName}
            </span>
          </button>

          {/* Full Frosted-Glass User Profile Footer (Alex Rivera) */}
          <div className="flex items-center justify-between gap-2.5 pt-1 border-t border-white/5">
            <div
              role="button"
              tabIndex={0}
              id="sidebar-user-profile-btn"
              onClick={() => setIsSettingsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsSettingsOpen(true);
              }}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer p-1 -m-1 rounded-xl hover:bg-slate-800/40 transition-colors group select-none"
              title="Open Settings & Profile"
            >
              {/* Green A avatar circle */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30">
                {userInitial}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-semibold text-xs text-white truncate group-hover:text-emerald-300 transition-colors">
                    {userDisplayName}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate mt-1">
                  {userSubtitle}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              id="sidebar-logout-btn"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all shrink-0 cursor-pointer"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
