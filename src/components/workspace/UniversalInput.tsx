'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Attachment } from '@/types';
import {
  Paperclip,
  ArrowUp,
  Image as ImageIcon,
  FileText,
  Globe,
  X,
  Link as LinkIcon,
  Cloud,
  Check,
  Sparkles,
  Mic,
  MicOff,
  ChevronDown,
  Headphones,
  UploadCloud,
} from 'lucide-react';
import { LMLS_COGNITIVE_MODELS, getModelConfig } from '@/data/models';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UniversalInput() {
  const {
    sendMessage,
    isGenerating,
    activeModel,
    setActiveModel,
    setIsSettingsOpen,
    setIsDriveOpen,
    pendingAttachment,
    clearPendingAttachment,
    isLiveAudio,
    setIsLiveAudio,
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const recognitionRef = useRef<any>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const isLiveAudioRef = useRef(isLiveAudio);
  const attachmentsRef = useRef(attachments);
  const promptRef = useRef(prompt);
  const speechPauseTimeoutRef = useRef<any>(null);

  useEffect(() => {
    isLiveAudioRef.current = isLiveAudio;
  }, [isLiveAudio]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [prompt]);

  // Pick up any pending Drive attachment from CloudDriveModal
  useEffect(() => {
    if (pendingAttachment) {
      setAttachments((prev) => [...prev, pendingAttachment]);
      clearPendingAttachment();
    }
  }, [pendingAttachment, clearPendingAttachment]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Click outside to close attachment & model dropdown menus
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    if (isMenuOpen || isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isModelDropdownOpen]);

  // File upload reader with Base64 inlineData conversion
  const processUploadedFiles = (fileList: FileList | File[]) => {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const mimeType = file.type || (isPdf ? 'application/pdf' : isImg ? 'image/png' : 'text/plain');

      reader.onload = () => {
        const base64Data = reader.result as string;
        const newAtt: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: formatBytes(file.size),
          type: isImg ? 'image' : isPdf ? 'pdf' : 'file',
          mimeType,
          base64Data,
          previewUrl: isImg ? base64Data : undefined,
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  // Voice speech-to-text handler
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (speechPauseTimeoutRef.current) {
        clearTimeout(speechPauseTimeoutRef.current);
      }
      setIsListening(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      // Demo simulated transcription if browser lacks speech API
      setIsListening(true);
      const demoTranscript = 'Analyze the computational complexity and state machine replication of the Raft consensus algorithm.';
      let i = 0;
      const interval = setInterval(() => {
        if (i < demoTranscript.length) {
          setPrompt((p) => p + demoTranscript[i]);
          i++;
        } else {
          clearInterval(interval);
          setIsListening(false);
          if (isLiveAudioRef.current) {
            handleSubmit(demoTranscript);
          }
        }
      }, 35);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          const currentText = transcript.trim();
          setPrompt(currentText);

          // If Live Audio is active, detect pause in speech and auto-submit
          if (isLiveAudioRef.current) {
            if (speechPauseTimeoutRef.current) {
              clearTimeout(speechPauseTimeoutRef.current);
            }
            speechPauseTimeoutRef.current = setTimeout(() => {
              if (currentText.length > 2) {
                handleSubmit(currentText);
                try {
                  rec.stop();
                } catch {}
                setIsListening(false);
              }
            }, 1400); // 1.4s silence pause
          }
        }
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (overridePrompt?: string) => {
    const textToSend = typeof overridePrompt === 'string' ? overridePrompt : prompt;
    if ((!textToSend.trim() && attachmentsRef.current.length === 0) || isGenerating) return;
    sendMessage(textToSend, attachmentsRef.current);
    setPrompt('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (speechPauseTimeoutRef.current) {
      clearTimeout(speechPauseTimeoutRef.current);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSimulatedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFiles(files);
    }
    setIsMenuOpen(false);
    if (e.target) e.target.value = '';
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFiles(files);
    }
    setIsMenuOpen(false);
    if (e.target) e.target.value = '';
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;
    const url = linkInput.trim().startsWith('http') ? linkInput.trim() : `https://${linkInput.trim()}`;
    const newAtt: Attachment = {
      id: `att-link-${Date.now()}`,
      name: url.replace(/^https?:\/\//, '').split('/')[0] + ' resource',
      size: 'Web URL',
      type: 'link',
      url,
    };
    setAttachments((prev) => [...prev, newAtt]);
    setLinkInput('');
    setShowLinkModal(false);
    setIsMenuOpen(false);
  };

  const canSubmit = (prompt.trim().length > 0 || attachments.length > 0) && !isGenerating;

  return (
    <div
      className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleSimulatedImageUpload}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.txt,.csv,.json,.ts,.tsx,.go,.py,.js,.jsx,.md"
        multiple
        className="hidden"
        onChange={handleSimulatedFileUpload}
      />

      {/* Frosted Glass Floating Pill Container */}
      <div className="relative rounded-[28px] bg-[#0b1320]/75 backdrop-blur-2xl border border-white/10 hover:border-emerald-500/40 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200 shadow-2xl px-3 py-2">
        {/* Full-Screen Drag-and-Drop Vision Analyzer Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-30 rounded-[28px] bg-emerald-950/85 backdrop-blur-md border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-150 pointer-events-none">
            <UploadCloud className="w-8 h-8 text-emerald-400 animate-bounce mb-1" />
            <span className="text-xs font-bold text-white">Drop images, PDFs, or code files</span>
            <span className="text-[10px] text-emerald-300">LMLS Vision Analyzer models will process in real-time</span>
          </div>
        )}

        {/* Active Attachment Preview Tray */}
        {attachments.length > 0 && (
          <div className="p-2 pb-2 flex flex-wrap gap-2 border-b border-white/10">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group relative flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 text-xs text-emerald-200 shadow-sm transition-all"
              >
                {att.type === 'image' && att.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                  />
                ) : att.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                ) : att.type === 'pdf' ? (
                  <div className="w-5 h-5 rounded bg-rose-500/20 text-rose-300 font-bold font-mono text-[9px] flex items-center justify-center border border-rose-500/40">
                    PDF
                  </div>
                ) : att.type === 'file' ? (
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                ) : att.type === 'drive' ? (
                  <Cloud className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                )}

                <div className="flex flex-col max-w-[140px]">
                  <span className="truncate font-medium">{att.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{att.size}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea & Controls Row */}
        <div className="flex items-end gap-2">
          {/* Attachment Dropdown Trigger */}
          <div className="relative mb-0.5" ref={menuRef}>
            <button
              type="button"
              id="attachment-menu-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-all focus:outline-none"
              title="Add attachment"
              aria-label="Add attachment"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                role="menu"
                aria-label="Multimodal attachment choices"
                className="absolute bottom-full left-0 mb-3 w-60 rounded-2xl bg-[#0b1320]/90 backdrop-blur-2xl p-2 shadow-2xl border border-emerald-500/30 z-50 text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider px-3 py-1.5 mb-1">
                  Add Context
                </div>

                {/* Photos / Images */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-slate-800/70 text-left transition-colors text-slate-200 hover:text-white"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Photos / Images</div>
                    <div className="text-[10px] text-slate-400">Upload diagrams or screenshots</div>
                  </div>
                </button>

                {/* Files / Documents */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-slate-800/70 text-left transition-colors text-slate-200 hover:text-white"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Files / Documents</div>
                    <div className="text-[10px] text-slate-400">PDF, Markdown, Code, CSV</div>
                  </div>
                </button>

                {/* Google Drive Sync */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDriveOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-slate-800/70 text-left transition-colors text-slate-200 hover:text-white"
                >
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Google Drive Sync</div>
                    <div className="text-[10px] text-slate-400">Browse and attach Drive notes & code</div>
                  </div>
                </button>

                {/* Web Links */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowLinkModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-slate-800/70 text-left transition-colors text-slate-200 hover:text-white"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Web Links</div>
                    <div className="text-[10px] text-slate-400">Paste reference URL or paper</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Prompt Auto-resizing Textarea */}
          <textarea
            ref={textareaRef}
            id="workspace-prompt-input"
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 max-h-48 py-2.5 px-2 bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          />

          {/* Right Action Controls: Voice Microphone + Model Selector Pill + Send Action Button */}
          <div className="flex items-center gap-1.5 mb-0.5 shrink-0">
            {/* Interactive Model Selector Pill inside the text bar */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                type="button"
                id="input-model-selector-btn"
                onClick={() => setIsModelDropdownOpen((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm focus:outline-none cursor-pointer"
                title="Select Cognitive AI Model"
                aria-label="Select Cognitive AI Model"
              >
                <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-semibold text-[11px] text-white whitespace-nowrap hidden xs:inline">
                  {getModelConfig(activeModel).name}
                </span>
                <span className="font-semibold text-[11px] text-white whitespace-nowrap xs:hidden">
                  {getModelConfig(activeModel).shortName.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isModelDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {/* Glass Dropdown Menu */}
              {isModelDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-72 sm:w-80 rounded-2xl bg-[#0b1320]/95 backdrop-blur-2xl p-2 shadow-2xl border border-emerald-500/30 z-50 text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-1">
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-white/5 mb-1">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Cognitive Model Architecture
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModelDropdownOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="text-[10px] text-slate-400 hover:text-emerald-300 underline"
                    >
                      Settings
                    </button>
                  </div>
                  {LMLS_COGNITIVE_MODELS.map((m) => {
                    const isSelected = activeModel === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setActiveModel(m.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl text-left flex items-start justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/15 border border-emerald-500/40 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-white">{m.name}</span>
                            <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-slate-800 text-emerald-400 border border-white/5">
                              {m.tag}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{m.subtitle}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Audio Mode Toggle Pill */}
            <button
              type="button"
              id="live-audio-mode-toggle-btn"
              onClick={() => {
                const nextState = !isLiveAudio;
                setIsLiveAudio(nextState);
                if (nextState && !isListening) {
                  toggleListening();
                } else if (!nextState && isListening) {
                  toggleListening();
                }
              }}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0 border ${
                isLiveAudio
                  ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border-emerald-500/60 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-white/10'
              }`}
              title={isLiveAudio ? 'Live Audio Mode active (hands-free voice-to-voice)' : 'Turn on Live Audio (hands-free voice-to-voice)'}
            >
              <Headphones className={`w-3.5 h-3.5 ${isLiveAudio ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[11px] font-medium hidden sm:inline">Live Audio</span>
              {isLiveAudio && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            {/* Voice Microphone Button (🎤) with Pulsing Animation */}
            <button
              type="button"
              id="voice-mic-input-btn"
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all focus:outline-none flex items-center justify-center shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-lg shadow-rose-500/25 ring-2 ring-rose-500/40 animate-pulse scale-105'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice Microphone (Dictate prompt)'}
              aria-label="Voice input"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-rose-300 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Submit Action Button with Emerald Glow */}
            <button
              type="button"
              id="submit-prompt-btn"
              onClick={() => handleSubmit()}
              disabled={!canSubmit}
              className={`w-9 h-9 rounded-full font-medium transition-all duration-200 select-none flex items-center justify-center shrink-0 ${
                canSubmit
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/25 scale-100'
                  : 'bg-slate-800/60 text-slate-500 opacity-40 cursor-not-allowed'
              }`}
              title="Send (Enter)"
              aria-label="Send query"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Clean Minimal Disclaimer (Removed bottom model badge) */}
      <p className="text-[11px] text-slate-500 text-center mt-2 select-none">
        LMLS can make mistakes. Verify important medical, academic, and scheduling details.
      </p>

      {/* Web Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-panel-emerald p-6 border border-emerald-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Attach Web Reference</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddLink} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  URL Address
                </label>
                <input
                  type="text"
                  placeholder="https://arxiv.org/abs/... or https://mayoclinic.org/..."
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Check className="w-3.5 h-3.5" /> Attach URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
