'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DriveFile } from '@/types';
import {
  Cloud,
  X,
  Search,
  FileText,
  FileCode,
  Table,
  Image as ImageIcon,
  Paperclip,
  Calendar,
  Download,
  Plus,
  Check,
  HardDrive,
  Upload,
  ExternalLink,
  Folder,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function CloudDriveModal() {
  const {
    isDriveOpen,
    setIsDriveOpen,
    driveFiles,
    attachDriveFileToChat,
    saveCurrentSessionToDrive,
    addCalendarEvent,
    setIsCalendarOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pdf' | 'doc' | 'code' | 'sheet'>('all');
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isDriveOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAttach = (file: DriveFile) => {
    attachDriveFileToChat(file);
    showToast(`Attached "${file.name}" to chat input`);
  };

  const handleScheduleFromDrive = (file: DriveFile) => {
    const todayPlus3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    addCalendarEvent({
      title: `Review ${file.name.replace(/_/g, ' ')}`,
      date: todayPlus3,
      time: '10:00 AM',
      category: file.type === 'code' ? 'assignment' : 'study',
      priority: 'medium',
      notes: `Google Drive file: ${file.name} (${file.size}) in folder "${file.folder || 'Drive'}".`,
      completed: false,
    });
    showToast(`Scheduled review for "${file.name}" in Calendar!`);
  };

  const handleExportSession = () => {
    saveCurrentSessionToDrive();
    showToast('Current chat session exported to Google Drive as transcript PDF!');
  };

  const filteredFiles = driveFiles.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.folder && f.folder.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.contentPreview && f.contentPreview.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedFilter === 'all') return true;
    return f.type === selectedFilter;
  });

  const getFileIcon = (type: DriveFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'code':
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case 'sheet':
        return <Table className="w-5 h-5 text-emerald-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-cyan-400" />;
      case 'doc':
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Modal Box */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl glass-panel-emerald shadow-2xl border border-cyan-500/30 backdrop-blur-2xl text-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 shrink-0 bg-[#0b1320]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-500/30">
              <Cloud className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 id="drive-modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Google Drive Workspace Cloud
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  CONNECTED
                </span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>alex.rivera@gmail.com</span>
                <span>•</span>
                <span className="text-cyan-400 font-mono">14.8 GB of 100 GB used</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
              title="Save active conversation to Drive as PDF"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Save Chat to Drive</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDriveOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close Drive"
              aria-label="Close Drive"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="mx-6 mt-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:px-6 pb-2 border-b border-white/5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Google Drive docs, code, spreadsheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'pdf', label: 'PDFs' },
              { id: 'doc', label: 'Documents' },
              { id: 'code', label: 'Code & Scripts' },
              { id: 'sheet', label: 'Sheets & Data' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Files Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredFiles.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/30 border border-dashed border-white/10 text-center space-y-2">
              <Cloud className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">
                {searchQuery ? 'No Google Drive files match your query.' : 'No files in this folder.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top row: Icon + Name + Star */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {file.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Folder className="w-3 h-3 text-slate-500" />
                              {file.folder || 'My Drive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {file.starred && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 mt-1" />
                      )}
                    </div>

                    {/* Preview Snippet */}
                    {file.contentPreview && (
                      <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 leading-relaxed bg-slate-950/40 p-2 rounded-xl border border-white/5">
                        {file.contentPreview}
                      </p>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 gap-2">
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {file.updatedAt}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* 1. Attach directly into chat */}
                      <button
                        type="button"
                        onClick={() => handleAttach(file)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer"
                        title="Attach this file into workspace chat input"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>Attach</span>
                      </button>

                      {/* 2. Schedule in Calendar */}
                      <button
                        type="button"
                        onClick={() => handleScheduleFromDrive(file)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-white/5 transition-all cursor-pointer"
                        title="Schedule task for this document in Smart Calendar"
                      >
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>Schedule</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#0b1320]/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Google Drive API v3 • Real-time cloud synchronization active</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDriveOpen(false)}
            className="px-4 py-1.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
