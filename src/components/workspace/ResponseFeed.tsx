'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ChatMessage, CodeSnippet, MathFormulaBlock, HealthMeta, NewsMeta, WikiMeta, DeadlineInfo } from '@/types';
import {
  Calendar,
  Check,
  Copy,
  Clock,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Share2,
  FileText,
  Flame,
  ArrowRight,
  Globe,
  Newspaper,
  HeartPulse,
  BookOpen,
  Laptop,
  CalendarCheck,
  FileDown,
  FolderPlus,
  Volume2,
  Square,
  CheckCircle2,
  Bell,
  BellRing,
  Download,
} from 'lucide-react';
import { speakText, stopSpeech } from '@/lib/audioSpeech';
import { exportResponseToPdf } from '@/lib/exportPdf';
import { syncEventWithGoogle, playAlarmChime } from '@/lib/notifications';

export default function ResponseFeed() {
  const {
    currentMessages,
    isGenerating,
    panicLevel,
    updateDeadlineDate,
    sendMessage,
    editAndResubmitMessage,
    user,
    activeModel,
    saveAiResponseToDrive,
    setIsDriveOpen,
    setIsCalendarOpen,
    openShareModal,
    isLiveAudio,
    addCalendarEvent,
  } = useApp();

  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: string; message: string; fileName: string } | null>(null);

  // Auto-speak latest assistant message when isLiveAudio is active and generation finishes
  const lastSpokenMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isLiveAudio || isGenerating) return;
    const lastMsg = currentMessages[currentMessages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id !== lastSpokenMsgIdRef.current) {
      lastSpokenMsgIdRef.current = lastMsg.id;
      setSpeakingMessageId(lastMsg.id);
      speakText(lastMsg.content, {
        onEnd: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null),
      });
    }
  }, [isLiveAudio, isGenerating, currentMessages]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggleListen = (message: ChatMessage) => {
    if (speakingMessageId === message.id) {
      stopSpeech();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(message.id);
      speakText(message.content, {
        onEnd: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null),
      });
    }
  };

  const handleExportPdf = (message: ChatMessage) => {
    const titleSnippet = message.content.slice(0, 45).replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'LMLS Response';
    exportResponseToPdf(message.content, {
      title: titleSnippet,
      modelName: activeModel,
      timestamp: message.timestamp,
      domain: message.domain,
    });
  };

  const handleSaveToDrive = (message: ChatMessage) => {
    const titleSnippet = message.content.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'LMLS Synthesis Report';
    const savedFile = saveAiResponseToDrive(titleSnippet, message.content);
    setToast({
      id: savedFile.id,
      message: 'Saved to Cloud Drive',
      fileName: savedFile.name,
    });
    setTimeout(() => {
      setToast((prev) => (prev?.id === savedFile.id ? null : prev));
    }, 6000);
  };

  const handleCopy = (message: ChatMessage) => {
    navigator.clipboard.writeText(message.content);
    setCopiedMsgId(message.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleShare = (message: ChatMessage) => {
    const titleSnippet = message.content.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'LMLS Synthesis Response';
    openShareModal({
      title: titleSnippet,
      transcript: `### [ASSISTANT RESPONSE] ${message.timestamp}\n\n${message.content}`,
      messages: [message],
    });
  };

  const handleScheduleAlarm = (message: ChatMessage) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const title =
      message.deadline?.subject ||
      `Study Task: ${message.content.slice(0, 36).replace(/[*#\n]/g, '').trim()}...`;
    const date = message.deadline?.parsedDate || tomorrow;
    const time = '10:00 AM';

    addCalendarEvent({
      title,
      date,
      time,
      reminderDate: date,
      reminderTime: time,
      priority: message.deadline?.priority || 'medium',
      category: 'study',
      notes: `Scheduled reminder for AI investigation response.\nTimestamp: ${message.timestamp}`,
      completed: false,
      alarmScheduled: true,
      googleTasksSynced: true,
      googleCalendarSynced: true,
    });

    playAlarmChime();
    setToast({
      id: `alarm-${Date.now()}`,
      message: '🔔 Device Alarm & Google Tasks Scheduled!',
      fileName: `${title} (${date} at ${time})`,
    });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
      {/* 1. Emerald Glass Hero Screen (Empty Chat) */}
      {currentMessages.length === 0 && (
        <div className="flex-1 flex flex-col justify-center min-h-[65vh] py-8 select-none">
          {/* Centered Emerald-to-Cyan Greeting */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Hello, {firstName}
            </h1>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-400 mt-2">
              How can I help you today?
            </h2>
          </div>

          {/* 4 Frosted Glass Interactive Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* 1. Exams */}
            <div
              role="button"
              tabIndex={0}
              id="hero-card-exams"
              onClick={() =>
                sendMessage(
                  'Could you help me prepare for my upcoming exams with key concept breakdowns, revision notes, practice questions, and high-yield study guides?'
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(
                    'Could you help me prepare for my upcoming exams with key concept breakdowns, revision notes, practice questions, and high-yield study guides?'
                  );
                }
              }}
              className="bg-[#0b1320]/65 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 hover:bg-slate-800/70 hover:shadow-xl hover:shadow-emerald-500/15 rounded-2xl p-5 flex flex-col justify-between min-h-[155px] cursor-pointer transition-all duration-300 group select-none"
            >
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-emerald-300 transition-colors">
                  Exams
                </span>
                <span className="text-xs text-slate-400 mt-2 block leading-relaxed">
                  Preparation & revision guides
                </span>
              </div>
              <div className="self-end mt-4 w-10 h-10 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-center text-blue-400 group-hover:border-emerald-500/40 group-hover:scale-110 transition-transform shadow-md">
                <Laptop className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Health & Clinical Triage */}
            <div
              role="button"
              tabIndex={0}
              id="hero-card-health"
              onClick={() =>
                sendMessage(
                  'What are the evidence-backed symptom triage, circadian sleep recovery, and clinical wellness protocols for fatigue and stress?'
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(
                    'What are the evidence-backed symptom triage, circadian sleep recovery, and clinical wellness protocols for fatigue and stress?'
                  );
                }
              }}
              className="bg-[#0b1320]/65 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 hover:bg-slate-800/70 hover:shadow-xl hover:shadow-emerald-500/15 rounded-2xl p-5 flex flex-col justify-between min-h-[155px] cursor-pointer transition-all duration-300 group select-none"
            >
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-emerald-300 transition-colors">
                  Health & Clinical Triage
                </span>
                <span className="text-xs text-slate-400 mt-2 block leading-relaxed">
                  Evidence-backed symptom & recovery protocols
                </span>
              </div>
              <div className="self-end mt-4 w-10 h-10 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-center text-rose-400 group-hover:border-emerald-500/40 group-hover:scale-110 transition-transform shadow-md">
                <HeartPulse className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Smart Deadlines & Planner */}
            <div
              role="button"
              tabIndex={0}
              id="hero-card-deadlines"
              onClick={() =>
                sendMessage(
                  'Help me schedule my upcoming project deliverables, calculate urgency countdowns, and build a milestone execution plan.'
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(
                    'Help me schedule my upcoming project deliverables, calculate urgency countdowns, and build a milestone execution plan.'
                  );
                }
              }}
              className="bg-[#0b1320]/65 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 hover:bg-slate-800/70 hover:shadow-xl hover:shadow-emerald-500/15 rounded-2xl p-5 flex flex-col justify-between min-h-[155px] cursor-pointer transition-all duration-300 group select-none"
            >
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-emerald-300 transition-colors">
                  Smart Deadlines & Planner
                </span>
                <span className="text-xs text-slate-400 mt-2 block leading-relaxed">
                  Automated countdowns & task scheduling
                </span>
              </div>
              <div className="self-end mt-4 w-10 h-10 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-center text-amber-400 group-hover:border-emerald-500/40 group-hover:scale-110 transition-transform shadow-md">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>

            {/* 4. Live World Intelligence */}
            <div
              role="button"
              tabIndex={0}
              id="hero-card-world-intel"
              onClick={() =>
                sendMessage(
                  'Synthesize live world intelligence, real-time Google search updates, and Wikipedia citations on breaking scientific breakthroughs and energy policy.'
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(
                    'Synthesize live world intelligence, real-time Google search updates, and Wikipedia citations on breaking scientific breakthroughs and energy policy.'
                  );
                }
              }}
              className="bg-[#0b1320]/65 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 hover:bg-slate-800/70 hover:shadow-xl hover:shadow-emerald-500/15 rounded-2xl p-5 flex flex-col justify-between min-h-[155px] cursor-pointer transition-all duration-300 group select-none"
            >
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-emerald-300 transition-colors">
                  Live World Intelligence
                </span>
                <span className="text-xs text-slate-400 mt-2 block leading-relaxed">
                  Real-time Google Search & Wikipedia synthesis
                </span>
              </div>
              <div className="self-end mt-4 w-10 h-10 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 group-hover:scale-110 transition-transform shadow-md">
                <Globe className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Chat Feed Messages */}
      {currentMessages.map((msg) => (
        <MessageCard
          key={msg.id}
          message={msg}
          panicLevel={panicLevel}
          onUpdateDeadline={(newDate) => updateDeadlineDate(msg.id, newDate)}
          onExportPdf={() => handleExportPdf(msg)}
          onSaveToDrive={() => handleSaveToDrive(msg)}
          onToggleListen={() => handleToggleListen(msg)}
          onShare={() => handleShare(msg)}
          onCopy={() => handleCopy(msg)}
          onScheduleAlarm={() => handleScheduleAlarm(msg)}
          onEditAndResubmit={(newContent) => editAndResubmitMessage(msg.id, newContent)}
          isSpeaking={speakingMessageId === msg.id}
          isCopied={copiedMsgId === msg.id}
          isGenerating={isGenerating}
        />
      ))}

      {/* Loading Skeleton when generating */}
      {isGenerating && <LoadingSkeleton panicLevel={panicLevel} />}

      {/* Floating Save-to-Drive Confirmation Toast */}
      {toast && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-3 p-3.5 rounded-2xl bg-[#0b1320]/95 backdrop-blur-2xl border border-emerald-500/40 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-white">{toast.message}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
              {toast.fileName}
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2.5">
            <button
              type="button"
              onClick={() => {
                setToast(null);
                setIsDriveOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
            >
              Open Docs
            </button>
            <button
              type="button"
              onClick={() => {
                setToast(null);
                setIsCalendarOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Individual Message Card (Glassmorphic)
// -------------------------------------------------------------
function MessageCard({
  message,
  panicLevel,
  onUpdateDeadline,
  onExportPdf,
  onSaveToDrive,
  onToggleListen,
  onShare,
  onCopy,
  onScheduleAlarm,
  onEditAndResubmit,
  isSpeaking,
  isCopied,
  isGenerating,
}: {
  message: ChatMessage;
  panicLevel: string;
  onUpdateDeadline: (newDate: string) => void;
  onExportPdf: () => void;
  onSaveToDrive: () => void;
  onToggleListen: () => void;
  onShare: () => void;
  onCopy: () => void;
  onScheduleAlarm?: () => void;
  onEditAndResubmit?: (newContent: string) => void;
  isSpeaking: boolean;
  isCopied: boolean;
  isGenerating?: boolean;
}) {
  const isUser = message.role === 'user';
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [userCopied, setUserCopied] = useState(false);

  useEffect(() => {
    setEditText(message.content);
  }, [message.content]);

  const handleUserCopy = () => {
    navigator.clipboard.writeText(message.content);
    setUserCopied(true);
    setTimeout(() => setUserCopied(false), 2000);
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  const handleSaveAndSubmit = () => {
    if (!editText.trim() || isGenerating) return;
    setIsEditing(false);
    if (onEditAndResubmit) {
      onEditAndResubmit(editText.trim());
    }
  };

  if (isUser) {
    if (isEditing) {
      return (
        <div className="flex justify-end mb-6 w-full animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0e171b]/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl rounded-tr-sm p-4 sm:p-5 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/30">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-emerald-500/20 text-xs text-emerald-400 font-medium">
              <span className="flex items-center gap-1.5 font-semibold tracking-wide">
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Edit Prompt
              </span>
              <span className="text-[11px] text-slate-400">Esc to cancel • Ctrl+Enter to save</span>
            </div>

            <textarea
              id={`edit-textarea-${message.id}`}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancelEdit();
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveAndSubmit();
                }
              }}
              rows={Math.max(3, Math.min(10, editText.split('\n').length + 1))}
              className="w-full bg-[#0a0f12]/90 text-slate-100 text-sm sm:text-base p-3.5 rounded-2xl border border-emerald-500/30 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-y leading-relaxed font-sans placeholder-slate-500 transition-all shadow-inner"
              placeholder="Edit your message..."
              autoFocus
            />

            <div className="flex items-center justify-end gap-2.5 mt-3 pt-2 border-t border-emerald-500/15">
              <button
                type="button"
                id={`cancel-edit-${message.id}`}
                onClick={handleCancelEdit}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer select-none"
              >
                Cancel
              </button>

              <button
                type="button"
                id={`submit-edit-${message.id}`}
                onClick={handleSaveAndSubmit}
                disabled={!editText.trim() || isGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/25 transition-all cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Save &amp; Submit</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end mb-6 animate-in fade-in duration-200 group">
        <div className="max-w-2xl bg-emerald-500/15 backdrop-blur-md border border-emerald-500/30 text-slate-100 rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-lg shadow-emerald-950/20 text-sm sm:text-base leading-relaxed relative">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {/* User Attached media chips */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap gap-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-emerald-500/20 text-xs text-emerald-200"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-[11px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Message Action Buttons (Copy & Edit) */}
        <div className="flex items-center gap-1.5 mt-1.5 mr-1 text-slate-400 opacity-90 transition-opacity">
          {/* Copy Button */}
          <button
            type="button"
            id={`copy-user-msg-${message.id}`}
            onClick={handleUserCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/70 hover:bg-emerald-950/50 text-slate-400 hover:text-emerald-300 border border-emerald-500/15 hover:border-emerald-500/40 backdrop-blur-md transition-all shadow-sm cursor-pointer select-none"
            title="Copy message"
          >
            {userCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          {/* Edit Button */}
          <button
            type="button"
            id={`edit-user-msg-${message.id}`}
            onClick={() => {
              setEditText(message.content);
              setIsEditing(true);
            }}
            disabled={isGenerating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/70 hover:bg-emerald-950/50 text-slate-400 hover:text-emerald-300 border border-emerald-500/15 hover:border-emerald-500/40 backdrop-blur-md transition-all shadow-sm cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
            title="Edit and resubmit message"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Edit</span>
          </button>
        </div>
      </div>
    );
  }

  // Assistant Response: Clean open-canvas layout with Glowing Emerald LMLS Sparkle icon
  return (
    <div className="flex items-start gap-4 mb-8 text-slate-100 animate-in fade-in duration-300">
      {/* Glowing Emerald LMLS Sparkle Icon on the left */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/30 mt-1 select-none">
        <Sparkles className="w-4 h-4 text-slate-950" />
      </div>

      {/* Open-Canvas Content */}
      <div className="flex-1 min-w-0 space-y-4 text-sm sm:text-base leading-relaxed">
        {/* 1. AUTO-DETECTED DEADLINE BANNER */}
        {message.deadline && (
          <DeadlineAlertBanner
            deadline={message.deadline}
            currentPanicLevel={panicLevel}
            onUpdateDeadline={onUpdateDeadline}
          />
        )}

        {/* Formatted Text Content */}
        <FormattedMessageContent content={message.content} />

        {/* 2. ACADEMIC VIEW: Code Snippets (if not already included inline in content) */}
        {message.codeSnippets && message.codeSnippets.length > 0 && (
          <div className="space-y-4 pt-1">
            {message.codeSnippets
              .filter((snippet) => !message.content.includes(snippet.code.slice(0, 30)))
              .map((snippet, idx) => (
                <CodeSnippetCard key={idx} snippet={snippet} />
              ))}
          </div>
        )}

        {message.mathBlocks && message.mathBlocks.length > 0 && (
          <div className="space-y-3 pt-1">
            {message.mathBlocks.map((math, idx) => (
              <MathFormulaCard key={idx} block={math} />
            ))}
          </div>
        )}

        {/* 3. HEALTH & CLINICAL TRIAGE VIEW */}
        {message.healthMeta && <HealthDomainSection meta={message.healthMeta} />}

        {/* 4. WORLD NEWS & GLOBAL INTELLIGENCE VIEW */}
        {message.newsMeta && <NewsDomainSection meta={message.newsMeta} />}

        {/* 5. WIKIPEDIA VIEW */}
        {message.wikiMeta && <WikipediaCard wiki={message.wikiMeta} />}

        {/* LMLS Cognitive Multi-Action Toolbar */}
        <div className="pt-3 flex flex-wrap items-center gap-2 text-slate-400 border-t border-white/5">
          {/* 1. 📄 Export PDF Button */}
          <button
            type="button"
            id={`export-pdf-btn-${message.id}`}
            onClick={onExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all hover:border-emerald-500/60 shadow-sm cursor-pointer select-none"
            title="Export clean, formatted printable PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export PDF</span>
          </button>

          {/* 2. 📁 Save to Cloud Drive / Google Docs Button */}
          <button
            type="button"
            id={`save-drive-btn-${message.id}`}
            onClick={onSaveToDrive}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all hover:border-teal-500/60 shadow-sm cursor-pointer select-none"
            title="Save as structured document to Cloud Drive"
          >
            <FolderPlus className="w-3.5 h-3.5 text-teal-400" />
            <span>Save to Drive / Docs</span>
          </button>

          {/* 3. 🔊 Listen / ⏹️ Stop Button */}
          <button
            type="button"
            id={`listen-audio-btn-${message.id}`}
            onClick={onToggleListen}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shadow-sm cursor-pointer select-none ${
              isSpeaking
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 ring-2 ring-rose-500/30 animate-pulse'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10 hover:border-emerald-500/30'
            }`}
            title={isSpeaking ? 'Stop reading aloud' : 'Listen aloud (natural speech synthesis)'}
          >
            {isSpeaking ? (
              <>
                <Square className="w-3.5 h-3.5 text-rose-300 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Listen</span>
              </>
            )}
          </button>

          {/* 4. 🔔 Schedule Alarm & Sync to Google */}
          {onScheduleAlarm && (
            <button
              type="button"
              id={`schedule-alarm-btn-${message.id}`}
              onClick={onScheduleAlarm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all hover:border-amber-500/60 shadow-sm cursor-pointer select-none"
              title="Schedule deadline & trigger device alarm reminder"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Set Alarm</span>
            </button>
          )}

          {/* 4. Copy Response Button */}
          <button
            type="button"
            onClick={onCopy}
            className={`p-2 rounded-full transition-colors cursor-pointer select-none ${
              isCopied
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
            title={isCopied ? 'Copied!' : 'Copy response'}
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* 5. Share Button */}
          <button
            type="button"
            id={`share-response-btn-${message.id}`}
            onClick={onShare}
            className="p-2 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer select-none"
            title="Share response & session link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Feedback buttons */}
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer select-none"
            title="Helpful response"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer select-none"
            title="Needs improvement"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Interactive Diagram & Code Block Renderers
// -------------------------------------------------------------
let mermaidInitialized = false;

function MermaidRenderer({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const renderIdRef = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let isMounted = true;
    async function renderChart() {
      if (typeof window === 'undefined') return;
      setLoading(true);
      setError(null);
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default || mermaidModule;
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
              darkMode: true,
              background: '#131415',
              primaryColor: '#059669',
              primaryTextColor: '#f8fafc',
              primaryBorderColor: '#10b981',
              lineColor: '#34d399',
              secondaryColor: '#1e293b',
              tertiaryColor: '#0f172a',
            },
            securityLevel: 'loose',
            fontFamily: 'ui-monospace, monospace, sans-serif',
          });
          mermaidInitialized = true;
        }

        const cleanCode = code
          .trim()
          .replace(/^```(?:mermaid)?\r?\n?/, '')
          .replace(/\r?\n?```$/, '')
          .trim();

        const { svg: renderedSvg } = await mermaid.render(renderIdRef.current, cleanCode);
        if (isMounted) {
          setSvg(renderedSvg);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Mermaid rendering error:', err);
          setError(err?.message || 'Invalid or unsupported Mermaid diagram syntax.');
          setLoading(false);
        }
      }
    }

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [code]);

  if (loading && !svg && !error) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400 font-mono bg-[#131415]">
        <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
        <span>Rendering diagram...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 text-xs font-mono text-amber-300 bg-amber-950/20 border-t border-amber-900/40">
        <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
          <AlertCircle className="w-3.5 h-3.5" /> Diagram Syntax Notice
        </div>
        <p className="text-slate-400 text-[11px] mb-2">{error}</p>
        <pre className="p-2.5 rounded bg-slate-900 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  const handleDownloadMermaidSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lmls-mermaid-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#171819] border-b border-[#282a2c] text-xs">
        <span className="font-mono text-[#8e918f] text-[11px] uppercase tracking-wider">
          Mermaid Flowchart / Diagram
        </span>
        <button
          type="button"
          onClick={handleDownloadMermaidSvg}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors cursor-pointer select-none"
          title="Download Diagram as Vector SVG"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Download Diagram</span>
        </button>
      </div>
      <div
        className="p-4 flex items-center justify-center overflow-x-auto bg-[#131415] min-h-[140px] [&>svg]:max-w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Live Visual SVG Diagram Card (NEVER shows raw SVG code as text)
// -------------------------------------------------------------
function VisualSvgCard({ code, title }: { code: string; title?: string }) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract clean svg string
  let cleanSvg = code.trim();
  const svgMatch = cleanSvg.match(/<svg[\s\S]*<\/svg>/i);
  if (svgMatch) {
    cleanSvg = svgMatch[0];
  }

  // Ensure high contrast and viewBox if missing
  if (!cleanSvg.includes('viewBox') && cleanSvg.includes('width=') && cleanSvg.includes('height=')) {
    const widthMatch = cleanSvg.match(/width="?(\d+)/i);
    const heightMatch = cleanSvg.match(/height="?(\d+)/i);
    if (widthMatch && heightMatch) {
      cleanSvg = cleanSvg.replace('<svg', `<svg viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`);
    }
  }

  const extractedTitle =
    title ||
    cleanSvg.match(/<title>([^<]+)<\/title>/i)?.[1] ||
    cleanSvg.match(/id="([^"]+)"/i)?.[1]?.replace(/[-_]/g, ' ') ||
    'Visual Diagram / Schematic';

  const handleDownloadSvg = () => {
    let exportSvg = cleanSvg;
    if (!exportSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
      exportSvg = exportSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lmls-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleDownloadPng = () => {
    let exportSvg = cleanSvg;
    if (!exportSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
      exportSvg = exportSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // High-DPI 2x scale
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 400;
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0a1210';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `lmls-diagram-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    };
    img.src = url;
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(cleanSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#07100e]/95 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/20">
      {/* Glassmorphic Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-950/70 via-[#0a1612]/80 to-slate-900/70 border-b border-emerald-500/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
          <span className="font-semibold text-emerald-300 capitalize tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {extractedTitle}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            Live Vector
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Diagram Button */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-sm cursor-pointer select-none"
            title="Download Diagram as Vector SVG"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Diagram</span>
              </>
            )}
          </button>

          {/* PNG Option */}
          <button
            type="button"
            onClick={handleDownloadPng}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer select-none"
            title="Export high-resolution PNG image"
          >
            <span>PNG</span>
          </button>

          {/* Copy SVG */}
          <button
            type="button"
            onClick={handleCopySvg}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60 transition-colors cursor-pointer select-none"
            title="Copy SVG markup"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Canvas (Dark Background with Neon Green/Cyan/White Strokes) */}
      <div className="p-4 sm:p-6 flex items-center justify-center overflow-x-auto bg-[#0a1210] min-h-[160px]">
        <div
          className="max-w-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto [&>svg]:drop-shadow-lg"
          dangerouslySetInnerHTML={{ __html: cleanSvg }}
        />
      </div>
    </div>
  );
}

// Inline Fenced Code Block Renderer with Copy Button, SVG & Mermaid rendering
function InlineCodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const lang = (language || '').toLowerCase().trim();
  const isSvg = lang === 'svg' || (code.trim().startsWith('<svg') && code.includes('</svg>'));
  const isMermaid = lang === 'mermaid';

  // If SVG: directly render visual SVG card! NEVER show raw SVG code as text!
  if (isSvg) {
    return <VisualSvgCard code={code} />;
  }

  // Detect ASCII/Unicode circuit diagrams & schematics
  const isCircuitOrAscii =
    lang === 'circuit' ||
    lang === 'schematic' ||
    lang === 'ascii' ||
    lang === 'diagram' ||
    lang === 'logic' ||
    /[─│┌┐└┘├┤┬┴┼▶►═║╱╲]/.test(code) ||
    /(\+---+|\+===+|\|[ ]+[A-Z0-9]+[ ]+\||---\[|\)---|o---|---\|>o)/.test(code);

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>(
    isMermaid ? 'preview' : 'code'
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#333538] bg-[#1e1f20] shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#282a2c] text-xs">
        <div className="flex items-center gap-2">
          {isCircuitOrAscii && !isMermaid ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ⚡ Circuit Diagram / Schematic
            </span>
          ) : (
            <span className="font-mono text-[#8e918f] font-medium uppercase text-[11px] tracking-wider">
              {isMermaid ? 'Mermaid Diagram' : language || 'code'}
            </span>
          )}

          {isMermaid && (
            <div className="flex items-center ml-2 bg-[#1a1b1d] rounded-lg p-0.5 border border-slate-700/60 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Diagram
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Code
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-[#c4c7c5] hover:text-white hover:bg-[#333538] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#34d399]" />
              <span className="text-[#34d399]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#8e918f]" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {isMermaid && activeTab === 'preview' ? (
        <MermaidRenderer code={code} />
      ) : (
        <pre
          className={`p-4 text-xs sm:text-sm font-mono overflow-x-auto ${
            isCircuitOrAscii
              ? 'bg-[#101214] text-emerald-300 leading-snug whitespace-pre tracking-wide selection:bg-emerald-800/40'
              : 'text-[#e3e3e3] leading-relaxed bg-[#1e1f20]'
          }`}
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Formatted Markdown Content Renderer (Full Multiline Block Support)
// -------------------------------------------------------------
type ContentBlock =
  | { type: 'code'; language: string; code: string }
  | { type: 'svg'; code: string; title?: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'quote'; lines: string[] }
  | { type: 'heading'; level: number; text: string }
  | { type: 'hr' }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; num: string; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'spacer' };

function FormattedMessageContent({ content }: { content: string }) {
  if (!content) return null;

  // Inline token parser for bold, italic, links, and inline code
  const renderInline = (text: string): React.ReactNode => {
    const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Link: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 inline-flex items-center gap-0.5 font-medium transition-colors"
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0 ml-0.5" />
          </a>
        );
      }

      // Bold: **text**
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return (
          <strong key={index} className="font-semibold text-white">
            {boldMatch[1]}
          </strong>
        );
      }

      // Italic: *text*
      const italicMatch = part.match(/^\*([^*]+)\*$/);
      if (italicMatch) {
        return (
          <em key={index} className="italic text-slate-300">
            {italicMatch[1]}
          </em>
        );
      }

      // Inline code: `code`
      const codeMatch = part.match(/^`([^`]+)`$/);
      if (codeMatch) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-slate-800/90 text-emerald-300 font-mono text-[12px] border border-slate-700/60"
          >
            {codeMatch[1]}
          </code>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  // Block parser for multiline markdown elements
  const parseBlocks = (raw: string): ContentBlock[] => {
    const lines = raw.split('\n');
    const blocks: ContentBlock[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Fenced Code Block: ```lang ... ```
      if (trimmed.startsWith('```')) {
        const language = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // skip closing ```
        const fullCode = codeLines.join('\n');
        const cleanLang = language.toLowerCase();
        if (cleanLang === 'svg' || (fullCode.trim().startsWith('<svg') && fullCode.includes('</svg>'))) {
          blocks.push({ type: 'svg', code: fullCode });
        } else {
          blocks.push({ type: 'code', language, code: fullCode });
        }
        continue;
      }

      // 1.5 Raw / Inline SVG Block: <svg ... </svg> (un-fenced in markdown text)
      if (trimmed.startsWith('<svg') || (trimmed.includes('<svg') && !trimmed.startsWith('```'))) {
        const svgLines: string[] = [];
        while (i < lines.length) {
          svgLines.push(lines[i]);
          if (lines[i].includes('</svg>')) {
            i++;
            break;
          }
          i++;
        }
        blocks.push({ type: 'svg', code: svgLines.join('\n') });
        continue;
      }

      // 2. Table Block: | col1 | col2 |
      if (trimmed.startsWith('|') && trimmed.includes('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        if (tableLines.length >= 2) {
          const parseRow = (rowStr: string) => {
            const stripped = rowStr.replace(/^\|/, '').replace(/\|$/, '');
            return stripped.split('|').map((c) => c.trim());
          };
          const headers = parseRow(tableLines[0]);
          const hasSeparator = /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(tableLines[1]);
          const dataRows = (hasSeparator ? tableLines.slice(2) : tableLines.slice(1)).map(parseRow);
          blocks.push({ type: 'table', headers, rows: dataRows });
          continue;
        } else {
          blocks.push({ type: 'paragraph', text: tableLines[0] });
          continue;
        }
      }

      // 3. Blockquote: > quote
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        blocks.push({ type: 'quote', lines: quoteLines });
        continue;
      }

      // 4. Horizontal Rule: ---, ***
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        blocks.push({ type: 'hr' });
        i++;
        continue;
      }

      // 5. Headings: #, ##, ###, ####
      if (trimmed.startsWith('#')) {
        const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
        if (headingMatch) {
          blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
          i++;
          continue;
        }
      }

      // 6. Bullet lists: * item, - item
      if (/^[\*\-]\s+/.test(trimmed)) {
        blocks.push({ type: 'bullet', text: trimmed.replace(/^[\*\-]\s+/, '') });
        i++;
        continue;
      }

      // 7. Numbered lists: 1. item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        blocks.push({ type: 'numbered', num: numMatch[1], text: numMatch[2] });
        i++;
        continue;
      }

      // 8. Spacer
      if (!trimmed) {
        blocks.push({ type: 'spacer' });
        i++;
        continue;
      }

      // 9. Standard paragraph
      blocks.push({ type: 'paragraph', text: line });
      i++;
    }

    return blocks;
  };

  const blocks = parseBlocks(content);

  // Check if a parsed table is a digital logic truth table
  const checkIsTruthTable = (headers: string[], rows: string[][]): boolean => {
    const headerStr = headers.join(' ').toLowerCase();
    const hasGateKeywords = /gate|truth|input|output|\b[abcyqf]\b/.test(headerStr);

    let booleanCount = 0;
    let totalCells = 0;
    for (const row of rows) {
      for (const cell of row) {
        totalCells++;
        const val = cell.trim().toLowerCase();
        if (['0', '1', 'true', 'false', 'high', 'low', 't', 'f'].includes(val)) {
          booleanCount++;
        }
      }
    }
    return hasGateKeywords || (totalCells > 0 && booleanCount / totalCells >= 0.35);
  };

  const renderTableCell = (cell: string, isTruth: boolean) => {
    const trimmed = cell.trim();
    if (isTruth) {
      const lower = trimmed.toLowerCase();
      if (lower === '1' || lower === 'true' || lower === 'high') {
        return (
          <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {trimmed}
          </span>
        );
      }
      if (lower === '0' || lower === 'false' || lower === 'low') {
        return (
          <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded font-mono text-xs bg-slate-800/60 text-slate-400 border border-slate-700/50">
            {trimmed}
          </span>
        );
      }
    }
    return renderInline(cell);
  };

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-200">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'svg':
            return <VisualSvgCard key={idx} code={block.code} title={block.title} />;

          case 'code':
            return <InlineCodeBlock key={idx} language={block.language} code={block.code} />;

          case 'table': {
            const isTruth = checkIsTruthTable(block.headers, block.rows);
            return (
              <div key={idx} className="overflow-x-auto my-3 rounded-xl border border-slate-800 bg-slate-950/60 shadow-sm">
                {isTruth && (
                  <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Truth Table
                    </span>
                    <span className="text-[10px] text-slate-400">Digital Logic Verification</span>
                  </div>
                )}
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className={`px-3.5 py-2.5 font-semibold text-emerald-400 ${
                            isTruth ? 'text-center font-mono' : ''
                          }`}
                        >
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-3.5 py-2 text-slate-300 ${
                              isTruth ? 'text-center' : ''
                            }`}
                          >
                            {renderTableCell(cell, isTruth)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case 'quote':
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-emerald-500/80 bg-emerald-950/10 pl-3.5 py-1.5 my-2 rounded-r-lg italic text-slate-300"
              >
                {block.lines.map((l, lIdx) => (
                  <p key={lIdx}>{renderInline(l)}</p>
                ))}
              </blockquote>
            );

          case 'hr':
            return <hr key={idx} className="border-slate-800 my-3" />;

          case 'heading':
            if (block.level === 1) {
              return (
                <h1 key={idx} className="text-xl font-bold text-white pt-3 pb-1 border-b border-slate-700/80">
                  {renderInline(block.text)}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2 key={idx} className="text-lg font-bold text-white pt-2.5 pb-1 border-b border-slate-700/80">
                  {renderInline(block.text)}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3
                  key={idx}
                  className="text-base font-bold text-white flex items-center gap-2 pt-2 pb-1 border-b border-slate-800/80"
                >
                  {renderInline(block.text)}
                </h3>
              );
            }
            return (
              <h4 key={idx} className="text-sm font-semibold text-emerald-400 pt-1.5">
                {renderInline(block.text)}
              </h4>
            );

          case 'bullet':
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-1 my-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-sm" />
                <div className="flex-1 text-slate-200 leading-relaxed">{renderInline(block.text)}</div>
              </div>
            );

          case 'numbered':
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-1 my-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono font-semibold text-emerald-300 shrink-0 mt-0.5">
                  {block.num}
                </span>
                <div className="flex-1 text-slate-200 leading-relaxed">{renderInline(block.text)}</div>
              </div>
            );

          case 'spacer':
            return <div key={idx} className="h-1.5" />;

          case 'paragraph':
          default:
            return (
              <p key={idx} className="leading-relaxed text-slate-200">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

// -------------------------------------------------------------
// Auto-Detected Deadline Banner (Connected dynamically to Panic Level)
// -------------------------------------------------------------
function DeadlineAlertBanner({
  deadline,
  currentPanicLevel,
  onUpdateDeadline,
}: {
  deadline: DeadlineInfo;
  currentPanicLevel: string;
  onUpdateDeadline: (newDate: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(deadline.parsedDate);

  const isHighPanic = currentPanicLevel === 'high' || deadline.priority === 'high';
  const isMediumPanic = currentPanicLevel === 'medium';

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdateDeadline(editValue.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="User-scheduled deadline"
      className={`relative rounded-xl p-3.5 transition-all duration-200 border ${
        isHighPanic
          ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/40'
          : isMediumPanic
          ? 'bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/30 shadow-md shadow-amber-950/30'
          : 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/20'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              isHighPanic
                ? 'bg-rose-500/20 text-rose-400'
                : isMediumPanic
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isHighPanic ? <Flame className="w-5 h-5 animate-pulse" /> : <Calendar className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isHighPanic ? 'text-rose-400' : isMediumPanic ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                Scheduled: {deadline.parsedDate}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                  isHighPanic
                    ? 'bg-rose-500/25 text-rose-300'
                    : isMediumPanic
                    ? 'bg-amber-500/25 text-amber-300'
                    : 'bg-emerald-500/25 text-emerald-300'
                }`}
              >
                {isHighPanic ? '⚡ High Priority' : isMediumPanic ? '⏳ Scheduled' : '✔ Confirmed'}
              </span>
            </div>
            {deadline.subject && (
              <p className="text-xs text-slate-300 font-medium mt-0.5">{deadline.subject}</p>
            )}
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              <span>User specified date: &quot;{deadline.rawText}&quot;</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Google Calendar Sync, Chime Test & Edit Date */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
          {(() => {
            const googleSync = syncEventWithGoogle({
              id: `deadline-${Date.now()}`,
              title: deadline.subject || `Deadline: ${deadline.rawText}`,
              date: deadline.parsedDate,
              time: '09:00 AM',
              priority: deadline.priority || 'high',
              category: 'exam',
              notes: `User specified deadline: ${deadline.rawText}`,
              completed: false,
            });
            return (
              <a
                href={googleSync.googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-sm transition-colors"
                title="Add to Google Tasks & Google Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Sync</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>
            );
          })()}

          <button
            type="button"
            onClick={() => playAlarmChime()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            title="Preview alarm chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Chime</span>
          </button>

          {!isEditing ? (
            <button
              type="button"
              id="edit-deadline-date-btn"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 shadow-sm transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Date</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSave}
                className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
                title="Save Date"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Academic Code Snippet Card
// -------------------------------------------------------------
function CodeSnippetCard({ snippet }: { snippet: CodeSnippet }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#333538] bg-[#1e1f20] shadow-md my-3">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#282a2c] border-b border-[#333538] text-xs text-[#c4c7c5]">
        <div className="flex items-center gap-2 font-mono">
          <FileCode className="w-4 h-4 text-[#4285f4]" />
          <span>{snippet.title || `${snippet.language} snippet`}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1e1f20] text-[#8e918f] border border-[#333538]">
            {snippet.language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#c4c7c5] hover:text-white bg-[#333538] hover:bg-[#444746] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#34d399]" />
                <span className="text-[#34d399]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <pre className="p-4 text-xs sm:text-sm font-mono text-[#e3e3e3] overflow-x-auto leading-relaxed bg-[#1e1f20]">
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}

// -------------------------------------------------------------
// Academic Math & Formula Block
// -------------------------------------------------------------
function MathFormulaCard({ block }: { block: MathFormulaBlock }) {
  return (
    <div className="rounded-xl p-4 bg-[#1e1f20] border border-[#333538] shadow-sm my-3">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-[#8e918f]">
        <Sparkles className="w-3.5 h-3.5 text-[#4285f4]" />
        <span>{block.title}</span>
      </div>
      <div className="my-2 p-3 rounded-lg bg-[#131314] border border-[#333538] text-center font-mono text-sm sm:text-base text-cyan-300 overflow-x-auto">
        {block.formula}
      </div>
      <p className="text-xs text-[#8e918f] leading-relaxed mt-2">{block.explanation}</p>
    </div>
  );
}

// -------------------------------------------------------------
// Health Domain Section (JEV Decision Matrix, Metrics, Badges, Takeaways, Disclaimer)
// -------------------------------------------------------------
function HealthDomainSection({ meta }: { meta: HealthMeta }) {
  return (
    <div className="space-y-4 pt-2">
      {/* 1. JEV Decision Matrix Card (When generated by JEV Decision Engine) */}
      {meta.jevDecision && (
        <div className="rounded-xl p-4 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-purple-950/30 border border-indigo-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-500/20 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  JEV Decision Engine v3.2
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Decision Ref: {meta.jevDecision.decisionId} • Security: AES-256 Vault
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Triage Score:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  meta.jevDecision.triageScore >= 80
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : meta.jevDecision.triageScore >= 50
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {meta.jevDecision.triageScore}/100
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                {meta.jevDecision.decisionConfidence} Confidence
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                JEV Action Pathway:
              </span>
              <p className="text-xs text-white font-medium mt-0.5 leading-relaxed bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/20">
                {meta.jevDecision.actionPathway}
              </p>
            </div>

            {meta.jevDecision.riskFactors.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Key Risk Factors Evaluated:
                </span>
                <ul className="mt-1 space-y-1">
                  {meta.jevDecision.riskFactors.map((rf, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Health Biometric Data Metrics Grid */}
      {meta.metrics && meta.metrics.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Target Health & Physiological Data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {meta.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-xs text-slate-300 font-medium block truncate">
                    {metric.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Target: {metric.targetRange}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-semibold text-white block">
                    {metric.value}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      metric.status === 'optimal'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : metric.status === 'warning'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {metric.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Verified Medical Source Badges */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Verified Evidence Sources:
        </p>
        <div className="flex flex-wrap gap-2">
          {meta.sources.map((src, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 border border-teal-500/30 text-teal-300"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{src}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 4. Key Takeaways Callout Box */}
      <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 shadow-md">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Key Protocol Solutions & Action Steps</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-200">
          {meta.takeaways.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Automatic Clinical Disclaimer Footer */}
      <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200/90">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">{meta.disclaimer}</p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// World News & Global Intelligence Section
// -------------------------------------------------------------
function NewsDomainSection({ meta }: { meta: NewsMeta }) {
  return (
    <div className="space-y-4 pt-2">
      {/* 1. Global Wire Header & Badges */}
      <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-teal-950/20 border border-emerald-500/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-500/20 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                LMLS Global Intelligence Wire
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {meta.category || 'World Affairs'} • {meta.region || 'Global'}
              </span>
            </div>
          </div>
          {meta.publishedDate && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
              {meta.publishedDate}
            </span>
          )}
        </div>

        {/* Global Impact Summary */}
        <div className="mt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Strategic Global Impact Assessment:
          </span>
          <p className="text-xs text-white font-medium mt-1 leading-relaxed bg-emerald-950/25 p-2.5 rounded-lg border border-emerald-500/20">
            {meta.globalImpact}
          </p>
        </div>

        {/* Key Developments */}
        {meta.keyDevelopments && meta.keyDevelopments.length > 0 && (
          <div className="mt-3 space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Key Global Developments:
            </span>
            <ul className="space-y-1.5">
              {meta.keyDevelopments.map((dev, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span>{dev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timeline if present */}
        {meta.timeline && meta.timeline.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Diplomatic & Scientific Timeline:
            </span>
            <div className="space-y-2">
              {meta.timeline.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 shrink-0">
                    {item.date}
                  </span>
                  <span className="text-slate-300">{item.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verified Global Sources */}
      {meta.sources && meta.sources.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Verified Global News Agencies & Scientific Wire:
          </p>
          <div className="flex flex-wrap gap-2">
            {meta.sources.map((src, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{src}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Wikipedia Knowledge Card
// -------------------------------------------------------------
function WikipediaCard({ wiki }: { wiki: WikiMeta }) {
  return (
    <div className="rounded-xl p-4 bg-[#1e1f20] border border-[#333538] shadow-md space-y-2.5 my-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#333538]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white text-[#131314] font-serif font-black flex items-center justify-center text-xs shadow">
            W
          </div>
          <div>
            <span className="text-xs font-bold text-[#e3e3e3]">{wiki.title}</span>
            {wiki.description && (
              <span className="text-[11px] text-[#8e918f] block sm:inline sm:ml-2">
                • {wiki.description}
              </span>
            )}
          </div>
        </div>
        <a
          href={wiki.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#4285f4] hover:text-[#8ab4f8] font-semibold transition-colors"
        >
          <span>Wikipedia</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <p className="text-xs text-[#e3e3e3] leading-relaxed">{wiki.extract}</p>
    </div>
  );
}

// -------------------------------------------------------------
// Loading Shimmer Skeleton
// -------------------------------------------------------------
function LoadingSkeleton({ panicLevel }: { panicLevel: string }) {
  return (
    <div className="flex items-start gap-4 mb-8 text-[#e3e3e3] animate-in fade-in duration-200">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 select-none">
        <Sparkles className="w-5 h-5 text-[#4285f4] animate-spin" />
      </div>

      <div className="flex-1 min-w-0 space-y-3 pt-1">
        <div className="h-4 w-40 rounded-full shimmer-bg" />
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-full shimmer-bg" />
          <div className="h-3.5 w-5/6 rounded-full shimmer-bg" />
          <div className="h-3.5 w-3/4 rounded-full shimmer-bg" />
        </div>
      </div>
    </div>
  );
}
