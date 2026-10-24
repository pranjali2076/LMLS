'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserSession,
  PanicLevel,
  SessionHistoryItem,
  ChatMessage,
  Attachment,
  DomainType,
  KnowledgeCategory,
  WorldKnowledgeItem,
  CalendarEvent,
  DriveFile,
  ShareSessionData,
} from '@/types';
import { mockCurrentUser, initialHistorySessions, initialMessages } from '@/data/mockData';
import { extractUserSpecifiedDeadline } from '@/lib/externalServices';
import { initialCalendarEvents, initialDriveFiles } from '@/data/calendarAndDrive';
import { DEFAULT_MODEL_ID, LMLS_COGNITIVE_MODELS } from '@/data/models';
import {
  playAlarmChime,
  requestNotificationPermission,
  getNotificationPermission,
  showTaskNotification,
  scheduleTaskAlarm,
  cancelTaskAlarm,
  syncEventWithGoogle,
} from '@/lib/notifications';

interface AppContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (username: string, password?: string, isGoogle?: boolean, googleProfile?: { name?: string; email?: string }) => Promise<boolean>;
  logout: () => void;
  panicLevel: PanicLevel;
  setPanicLevel: (level: PanicLevel) => void;
  remainingSeconds: number;
  setRemainingSeconds: (seconds: number) => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (running: boolean) => void;
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  historySessions: SessionHistoryItem[];
  deleteSession: (id: string) => void;
  archiveSession: (id: string) => void;
  createNewSession: (domain?: DomainType) => string;
  currentMessages: ChatMessage[];
  sendMessage: (content: string, attachments?: Attachment[]) => void;
  editAndResubmitMessage: (messageId: string, newContent: string) => void;
  isGenerating: boolean;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  updateDeadlineDate: (messageId: string, newDate: string) => void;
  // World Knowledge Center State & Actions
  isKnowledgeModalOpen: boolean;
  setIsKnowledgeModalOpen: (open: boolean) => void;
  selectedKnowledgeCategory: KnowledgeCategory | 'all';
  setSelectedKnowledgeCategory: (cat: KnowledgeCategory | 'all') => void;
  openKnowledgeModal: (category?: KnowledgeCategory | 'all') => void;
  askAboutKnowledgeTopic: (topicTitle: string, initialPrompt?: string) => void;
  // Settings Popover State
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  // Active Cognitive AI Model
  activeModel: string;
  setActiveModel: (model: string) => void;
  // Smart Calendar & Scheduler State
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleCalendarEvent: (id: string) => void;
  // Cloud Drive (Google Drive Sync) State
  isDriveOpen: boolean;
  setIsDriveOpen: (open: boolean) => void;
  driveFiles: DriveFile[];
  attachDriveFileToChat: (file: DriveFile) => void;
  pendingAttachment: Attachment | null;
  clearPendingAttachment: () => void;
  saveCurrentSessionToDrive: () => void;
  saveAiResponseToDrive: (title: string, content: string) => DriveFile;
  // Live Voice-to-Voice Mode
  isLiveAudio: boolean;
  setIsLiveAudio: (val: boolean) => void;
  // Focus & Exam Crunch Timer State
  focusMinutes: number;
  setFocusMinutes: (mins: number) => void;
  focusSecondsRemaining: number;
  isFocusTimerRunning: boolean;
  setIsFocusTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  resetFocusTimer: (customMins?: number) => void;
  // Share Session Modal & Shared Read-Only View
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  shareModalData: ShareSessionData | null;
  openShareModal: (data?: Partial<ShareSessionData>) => void;
  isViewingSharedSession: boolean;
  sharedSessionTitle: string;
  forkSharedSession: () => void;
  // Notification & Alarm Reminders
  notificationPermission: NotificationPermission;
  requestNotificationPerms: () => Promise<NotificationPermission>;
  testAlarmNotification: (customTitle?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Authentication State - Enforce strict login before workspace entry
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Restore Google session from localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('lmls_google_auth_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.email || parsed.username)) {
            setUser(parsed);
            setIsAuthenticated(true);
          }
        }
      }
    } catch {
      // Storage unavailable or invalid JSON
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // Panic & Urgency Controls
  const [panicLevel, setPanicLevel] = useState<PanicLevel>('high');
  // Countdown widget: default 3 hours 45 minutes (13500 seconds)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(13500);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Sidebar Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Sessions and Active Chat
  const [historySessions, setHistorySessions] = useState<SessionHistoryItem[]>(initialHistorySessions);
  const [activeSessionId, setActiveSessionId] = useState<string>('new-session');
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(initialMessages);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // World Knowledge Modal State
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState<boolean>(false);
  const [selectedKnowledgeCategory, setSelectedKnowledgeCategory] = useState<KnowledgeCategory | 'all'>('all');

  // Settings Popover State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Active Cognitive AI Model (Default: LMLS 4)
  const [activeModel, setActiveModel] = useState<string>('lmls-4');

  // Live Voice-to-Voice Audio Mode
  const [isLiveAudio, setIsLiveAudio] = useState<boolean>(false);

  // Focus & Exam Crunch Timer State (Synced with Panic Level)
  const [focusMinutes, setFocusMinutes] = useState<number>(60);
  const [focusSecondsRemaining, setFocusSecondsRemaining] = useState<number>(3600);
  const [isFocusTimerRunning, setIsFocusTimerRunning] = useState<boolean>(false);

  // Sync Focus Timer duration automatically with Panic Level
  useEffect(() => {
    let mins = 60;
    if (panicLevel === 'low') mins = 25;
    else if (panicLevel === 'medium') mins = 45;
    else if (panicLevel === 'high') mins = 60;

    setFocusMinutes(mins);
    setFocusSecondsRemaining(mins * 60);
    setIsFocusTimerRunning(false);
  }, [panicLevel]);

  // Focus countdown ticker
  useEffect(() => {
    if (!isFocusTimerRunning) return;
    const interval = setInterval(() => {
      setFocusSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsFocusTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFocusTimerRunning]);

  const resetFocusTimer = useCallback(
    (customMins?: number) => {
      const mins = customMins || focusMinutes;
      setFocusSecondsRemaining(mins * 60);
      setIsFocusTimerRunning(false);
    },
    [focusMinutes]
  );

  // Share Session Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareModalData, setShareModalData] = useState<ShareSessionData | null>(null);
  const [isViewingSharedSession, setIsViewingSharedSession] = useState<boolean>(false);
  const [sharedSessionTitle, setSharedSessionTitle] = useState<string>('');

  // Smart Calendar & Scheduler State
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);

  // Cloud Drive (Google Drive Sync) State
  const [isDriveOpen, setIsDriveOpen] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(initialDriveFiles);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);

  // Restore saved active model from localStorage if available (migrate old names if needed)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('lmls_active_model');
        if (saved) {
          if (LMLS_COGNITIVE_MODELS.some((m) => m.id === saved)) {
            setActiveModel(saved);
          } else {
            setActiveModel('lmls-4');
          }
        }
      }
    } catch {
      // non-fatal
    }
  }, []);

  const handleSetActiveModel = useCallback((model: string) => {
    setActiveModel(model);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lmls_active_model', model);
      }
    } catch {
      // non-fatal
    }
  }, []);

  // Notification & Alarm Reminder State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNotificationPermission(getNotificationPermission());
    }
  }, []);

  const requestNotificationPerms = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    return perm;
  }, []);

  const testAlarmNotification = useCallback((customTitle?: string) => {
    playAlarmChime();
    showTaskNotification(customTitle || '🔔 LMLS Alarm Reminder Active', {
      body: 'Audio chime and device push alerts are synchronized with your Smart Calendar & Google Tasks.',
      playChime: false,
    });
  }, []);

  // Calendar Event Handlers with Google Tasks Sync & Device Alarm Scheduling
  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const reminderDate = event.reminderDate || event.date;
    const reminderTime = event.reminderTime || event.time || '10:00 AM';

    const newEvent: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      reminderDate,
      reminderTime,
      googleCalendarSynced: true,
      googleTasksSynced: true,
      alarmScheduled: true,
    };

    // 1. Sync structured task into Google Calendar & Tasks state
    syncEventWithGoogle(newEvent);

    // 2. Schedule push notification & Web Audio alarm chime
    scheduleTaskAlarm(newEvent);

    // 3. Prompt for notification permission if default
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission().then((perm) => setNotificationPermission(perm));
    }

    setCalendarEvents((prev) => [newEvent, ...prev]);
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    cancelTaskAlarm(id);
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleCalendarEvent = useCallback((id: string) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  }, []);

  // Restore scheduled alarms on mount for active events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      calendarEvents.forEach((evt) => {
        if (!evt.completed) {
          scheduleTaskAlarm(evt);
        }
      });
    }
  }, [calendarEvents]);

  // Cloud Drive Handlers
  const attachDriveFileToChat = useCallback((file: DriveFile) => {
    const att: Attachment = {
      id: `att-drv-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: 'drive',
      previewUrl: file.url,
    };
    setPendingAttachment(att);
    setIsDriveOpen(false);
  }, []);

  const clearPendingAttachment = useCallback(() => {
    setPendingAttachment(null);
  }, []);

  const saveCurrentSessionToDrive = useCallback(() => {
    const currentMsgs = allMessages[activeSessionId] || [];
    const activeItem = historySessions.find((s) => s.id === activeSessionId);
    const sessionTitle = activeItem?.title || 'Investigation Session';
    const previewContent = currentMsgs
      .map((m) => `[${m.role.toUpperCase()}] (${m.timestamp}):\n${m.content}`)
      .join('\n\n---\n\n');

    const newDriveDoc: DriveFile = {
      id: `drv-${Date.now()}`,
      name: `${sessionTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Transcript.pdf`,
      type: 'pdf',
      size: `${Math.max(12, Math.min(950, previewContent.length * 2 / 1024)).toFixed(0)} KB`,
      updatedAt: 'Just now',
      folder: 'Exported Sessions',
      starred: true,
      contentPreview: previewContent.slice(0, 300) + '...',
    };

    setDriveFiles((prev) => [newDriveDoc, ...prev]);
  }, [allMessages, activeSessionId, historySessions]);

  const saveAiResponseToDrive = useCallback((title: string, content: string): DriveFile => {
    const newDriveFile: DriveFile = {
      id: `drv-ai-${Date.now()}`,
      name: `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.gdoc`,
      type: 'doc',
      size: `${Math.max(8, Math.min(650, (content.length * 2) / 1024)).toFixed(0)} KB`,
      updatedAt: 'Just now',
      folder: 'AI Synthesis & Reports',
      starred: true,
      contentPreview: content.slice(0, 300) + '...',
    };
    setDriveFiles((prev) => [newDriveFile, ...prev]);
    return newDriveFile;
  }, []);

  const openShareModal = useCallback((data?: Partial<ShareSessionData>) => {
    const activeMsgs = allMessages[activeSessionId] || [];
    const activeItem = historySessions.find((s) => s.id === activeSessionId);
    const sessionTitle = activeItem?.title || 'LMLS Investigation Session';
    const transcript = activeMsgs
      .map((m) => `### [${m.role.toUpperCase()}] ${m.timestamp}\n\n${m.content}`)
      .join('\n\n---\n\n');

    setShareModalData({
      title: data?.title || sessionTitle,
      transcript: data?.transcript || transcript,
      messages: data?.messages || activeMsgs,
      createdAt: data?.createdAt || new Date().toLocaleDateString(),
      model: data?.model || activeModel,
    });
    setIsShareModalOpen(true);
  }, [allMessages, activeSessionId, historySessions, activeModel]);

  // Check URL for ?shared= query parameter on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedParam = urlParams.get('shared');
        if (sharedParam) {
          try {
            const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedParam))));
            if (decoded && Array.isArray(decoded.messages)) {
              const sharedId = `shared-${Date.now()}`;
              setAllMessages((prev) => ({
                ...prev,
                [sharedId]: decoded.messages,
              }));
              setActiveSessionId(sharedId);
              setIsViewingSharedSession(true);
              setSharedSessionTitle(decoded.title || 'Shared Session');
            }
          } catch {
            // invalid base64 or json
          }
        }
      }
    } catch {}
  }, []);

  const forkSharedSession = useCallback(() => {
    const currentMsgs = allMessages[activeSessionId] || [];
    const newSessionId = `sess-${Date.now()}`;
    const newSession: SessionHistoryItem = {
      id: newSessionId,
      title: `Forked: ${sharedSessionTitle || 'Shared Session'}`,
      preview: currentMsgs[0]?.content.slice(0, 60) || 'Forked study workspace session...',
      category: 'today',
      domain: 'academic',
      timestamp: 'Just now',
      pinned: false,
    };
    setHistorySessions((prev) => [newSession, ...prev]);
    setAllMessages((prev) => ({
      ...prev,
      [newSessionId]: currentMsgs,
    }));
    setActiveSessionId(newSessionId);
    setIsViewingSharedSession(false);
  }, [allMessages, activeSessionId, sharedSessionTitle]);

  const openKnowledgeModal = useCallback((category: KnowledgeCategory | 'all' = 'all') => {
    setSelectedKnowledgeCategory(category);
    setIsKnowledgeModalOpen(true);
  }, []);

  // Live Countdown ticker
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Auth Handlers
  const login = useCallback(
    async (
      username: string,
      password?: string,
      isGoogle = false,
      googleProfile?: { name?: string; email?: string }
    ): Promise<boolean> => {
      await new Promise((res) => setTimeout(res, 500));

      if (isGoogle) {
        const gEmail = googleProfile?.email || (username.includes('@') ? username : 'alex.rivera@gmail.com');
        const defaultName = gEmail
          .split('@')[0]
          .split(/[._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        const gName = googleProfile?.name || defaultName;

        const googleUser: UserSession = {
          id: `usr_google_${Date.now()}`,
          name: gName,
          username: gEmail.split('@')[0],
          email: gEmail,
          avatarUrl: '', // empty so avatar initial is dynamically rendered
          role: 'Verified Google Account',
        };

        setUser(googleUser);
        setIsAuthenticated(true);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('lmls_google_auth_session', JSON.stringify(googleUser));
          }
        } catch {
          // non-fatal
        }
        return true;
      }

      if (!username.trim()) {
        return false;
      }

      if (password && password.length < 4) {
        return false;
      }

      const email = username.includes('@') ? username : `${username}@gmail.com`;
      const name = username.includes('@') ? username.split('@')[0] : username;
      const standardUser: UserSession = {
        id: `usr_${Date.now()}`,
        username: username.trim(),
        name,
        email,
        avatarUrl: '',
        role: 'Verified Member',
      };

      setUser(standardUser);
      setIsAuthenticated(true);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('lmls_google_auth_session', JSON.stringify(standardUser));
          if ('Notification' in window && Notification.permission === 'default') {
            requestNotificationPermission().then((perm) => setNotificationPermission(perm));
          }
        }
      } catch {
        // non-fatal
      }
      return true;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lmls_google_auth_session');
      }
    } catch {
      // non-fatal
    }
  }, []);

  // History Actions
  const deleteSession = useCallback((id: string) => {
    setHistorySessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeSessionId === id) {
        if (filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        } else {
          const freshId = `sess-${Date.now()}`;
          setActiveSessionId(freshId);
          setAllMessages((m) => ({ ...m, [freshId]: [] }));
        }
      }
      return filtered;
    });
    setAllMessages((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, [activeSessionId]);

  const archiveSession = useCallback((id: string) => {
    setHistorySessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const createNewSession = useCallback((domain: DomainType = 'academic'): string => {
    const newId = `sess-${Date.now()}`;
    setAllMessages((prev) => ({
      ...prev,
      [newId]: [],
    }));
    setActiveSessionId(newId);
    return newId;
  }, []);

  const askAboutKnowledgeTopic = useCallback((topicTitle: string, initialPrompt?: string) => {
    setIsKnowledgeModalOpen(false);
    const lower = topicTitle.toLowerCase();
    const domain: DomainType =
      lower.includes('news') || lower.includes('treaty') || lower.includes('accord') || lower.includes('fusion') || lower.includes('artemis') || lower.includes('space')
        ? 'news'
        : lower.includes('health') || lower.includes('sleep') || lower.includes('cardio') || lower.includes('glucose') || lower.includes('cortisol') || lower.includes('vagus') || lower.includes('ergonomic')
        ? 'health'
        : 'academic';

    const newSessionId = `sess-${Date.now()}`;
    const newSession: SessionHistoryItem = {
      id: newSessionId,
      title: topicTitle.slice(0, 36) + (topicTitle.length > 36 ? '...' : ''),
      preview: `Investigation: ${topicTitle}...`,
      category: 'today',
      domain,
      timestamp: 'Just now',
      pinned: false,
    };

    const promptToSend =
      initialPrompt ||
      `Provide an in-depth clinical & strategic investigation of "${topicTitle}", including verified real-world findings, actionable protocols, and scientific citations.`;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setHistorySessions((prev) => [newSession, ...prev]);
    setAllMessages((prev) => ({
      ...prev,
      [newSessionId]: [userMsg],
    }));
    setActiveSessionId(newSessionId);

    const liveApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    setIsGenerating(true);
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: promptToSend,
        prompt: promptToSend,
        domain,
        currentPanicLevel: panicLevel,
        model: activeModel,
        apiKey: liveApiKey,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const actualErrorMessage =
            (typeof errData.details === 'string' && errData.details) ||
            (typeof errData.error === 'string' && errData.error) ||
            errData.error?.message ||
            (typeof errData.message === 'string' ? errData.message : null) ||
            (errData.message?.content ? errData.message.content : null) ||
            `Server responded with ${res.status}`;
          throw new Error(actualErrorMessage);
        }
        return res.json();
      })
      .then((data) => {
        let assistantMsg: ChatMessage | null = null;
        if (data.message && typeof data.message === 'object') {
          assistantMsg = data.message;
        } else if (typeof data.message === 'string') {
          assistantMsg = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            domain,
          };
        } else if (typeof data.content === 'string') {
          assistantMsg = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            domain,
          };
        }

        if (assistantMsg) {
          setAllMessages((prev) => ({
            ...prev,
            [newSessionId]: [...(prev[newSessionId] || []), assistantMsg!],
          }));
          if (data.suggestedPanicLevel) {
            setPanicLevel(data.suggestedPanicLevel);
          }
        }
      })
      .catch((err: any) => {
        console.error('API error in topic investigation:', err);
        const actualErrorMessage = err?.message || 'Error communicating with /api/chat service.';
        const cleanContent = actualErrorMessage.startsWith('⚠️')
          ? actualErrorMessage
          : `⚠️ **Gemini API Error:** ${actualErrorMessage}`;
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: cleanContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          domain,
        };
        setAllMessages((prev) => ({
          ...prev,
          [newSessionId]: [...(prev[newSessionId] || []), errorMsg],
        }));
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [panicLevel, activeModel]);

  // Workspace Message Streaming & AI Simulation
  const currentMessages = allMessages[activeSessionId] || [];

  const updateDeadlineDate = useCallback((messageId: string, newDate: string) => {
    setAllMessages((prev) => {
      const activeMsgs = prev[activeSessionId] || [];
      const updated = activeMsgs.map((m) => {
        if (m.id === messageId && m.deadline) {
          return {
            ...m,
            deadline: {
              ...m.deadline,
              parsedDate: newDate,
            },
          };
        }
        return m;
      });
      return {
        ...prev,
        [activeSessionId]: updated,
      };
    });
  }, [activeSessionId]);

  const sendMessage = useCallback((content: string, attachments?: Attachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments,
    };

    // Determine domain from user text heuristics or active session
    const lower = content.toLowerCase();
    const isNews =
      lower.includes('news') ||
      lower.includes('world') ||
      lower.includes('headline') ||
      lower.includes('breaking') ||
      lower.includes('treaty') ||
      lower.includes('accord') ||
      lower.includes('fusion') ||
      lower.includes('space') ||
      lower.includes('artemis') ||
      lower.includes('global') ||
      lower.includes('economy');

    const isHealth =
      lower.includes('health') ||
      lower.includes('sleep') ||
      lower.includes('blood') ||
      lower.includes('fatigue') ||
      lower.includes('diet') ||
      lower.includes('medicine') ||
      lower.includes('tip') ||
      lower.includes('wellness') ||
      lower.includes('cardio') ||
      lower.includes('vagus') ||
      lower.includes('pressure') ||
      lower.includes('glucose') ||
      lower.includes('first aid') ||
      lower.includes('triage') ||
      lower.includes('longevity');

    const isAcademic =
      lower.includes('code') ||
      lower.includes('algorithm') ||
      lower.includes('math') ||
      lower.includes('formula') ||
      lower.includes('proof') ||
      lower.includes('exam') ||
      lower.includes('study') ||
      lower.includes('raft') ||
      lower.includes('quantum') ||
      lower.includes('crispr');

    let domain: DomainType = 'productivity';
    if (isNews && !isHealth) {
      domain = 'news';
    } else if (isHealth) {
      domain = 'health';
    } else if (isAcademic) {
      domain = 'academic';
    }

    setAllMessages((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), userMsg],
    }));

    // Update session title if existing, or prepend a new session if first message
    const title = content.slice(0, 36) + (content.length > 36 ? '...' : '');
    const preview = content.slice(0, 60);

    setHistorySessions((prev) => {
      const exists = prev.some((s) => s.id === activeSessionId);
      if (exists) {
        return prev.map((s) => {
          if (s.id === activeSessionId && (s.title === 'New Investigation Session' || s.title.includes('New'))) {
            return {
              ...s,
              title,
              preview,
              domain,
            };
          }
          return s;
        });
      } else {
        const newSessionItem: SessionHistoryItem = {
          id: activeSessionId,
          title,
          preview,
          category: 'today',
          domain,
          timestamp: 'Just now',
          pinned: false,
        };
        return [newSessionItem, ...prev];
      }
    });

    const sessionHistory = (allMessages[activeSessionId] || [])
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    const liveApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // AI Generation via Secure Server API Route (/api/chat)
    setIsGenerating(true);

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        prompt: content,
        domain,
        currentPanicLevel: panicLevel,
        attachments,
        history: sessionHistory,
        model: activeModel,
        apiKey: liveApiKey,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const actualErrorMessage =
            (typeof errData.details === 'string' && errData.details) ||
            (typeof errData.error === 'string' && errData.error) ||
            errData.error?.message ||
            (typeof errData.message === 'string' ? errData.message : null) ||
            (errData.message?.content ? errData.message.content : null) ||
            `API server error: ${res.status}`;
          throw new Error(actualErrorMessage);
        }
        return res.json();
      })
      .then((data) => {
        let assistantMsg: ChatMessage | null = null;
        if (data.message && typeof data.message === 'object') {
          assistantMsg = data.message;
        } else if (typeof data.message === 'string') {
          assistantMsg = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            domain,
          };
        } else if (typeof data.content === 'string') {
          assistantMsg = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            domain,
          };
        }

        if (assistantMsg) {
          setAllMessages((prev) => ({
            ...prev,
            [activeSessionId]: [...(prev[activeSessionId] || []), assistantMsg!],
          }));

          // Auto-schedule task & device alarm if deadline detected in prompt/chat response
          if (assistantMsg.deadline) {
            const dl = assistantMsg.deadline;
            const daysOffset = dl.daysRemaining || 0;
            const targetDateObj = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
            const dateFormatted = targetDateObj.toISOString().split('T')[0];

            addCalendarEvent({
              title: dl.subject || `Scheduled: ${dl.rawText}`,
              date: dateFormatted,
              time: '09:00 AM',
              reminderDate: dateFormatted,
              reminderTime: '09:00 AM',
              priority: dl.priority || 'high',
              category: 'exam',
              notes: `Auto-scheduled from chat: "${dl.rawText}". Urgency: ${dl.priority.toUpperCase()}`,
              completed: false,
              googleTasksSynced: true,
              googleCalendarSynced: true,
              alarmScheduled: true,
            });
          }

          // JEV Decision Engine Dynamic Panic Level sync
          if (data.suggestedPanicLevel && data.suggestedPanicLevel !== panicLevel) {
            setPanicLevel(data.suggestedPanicLevel);
          }
        }
      })
      .catch((err: any) => {
        console.error('Error connecting to /api/chat:', err);
        const actualErrorMessage = err?.message || 'Error communicating with /api/chat service.';
        const cleanContent = actualErrorMessage.startsWith('⚠️')
          ? actualErrorMessage
          : `⚠️ **Gemini API Error:** ${actualErrorMessage}`;
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: cleanContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          domain,
        };
        setAllMessages((prev) => ({
          ...prev,
          [activeSessionId]: [...(prev[activeSessionId] || []), errorMsg],
        }));
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [activeSessionId, panicLevel, allMessages, activeModel, addCalendarEvent]);

  // Edit an existing user prompt, truncate downstream conversation, and resubmit to Gemini API
  const editAndResubmitMessage = useCallback(
    (messageId: string, newContent: string) => {
      const trimmed = newContent.trim();
      if (!trimmed) return;

      const messages = allMessages[activeSessionId] || [];
      const index = messages.findIndex((m) => m.id === messageId);
      if (index === -1) return;

      const originalMsg = messages[index];
      const updatedUserMsg: ChatMessage = {
        ...originalMsg,
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Truncate messages up to the edited user message (removes the old AI reply and subsequent turns)
      const priorHistory = messages.slice(0, index);
      const updatedList = [...priorHistory, updatedUserMsg];

      setAllMessages((prev) => ({
        ...prev,
        [activeSessionId]: updatedList,
      }));

      // Update session title & preview if editing the first user message
      if (index === 0) {
        const title = trimmed.slice(0, 36) + (trimmed.length > 36 ? '...' : '');
        const preview = trimmed.slice(0, 60);
        setHistorySessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, title, preview } : s))
        );
      }

      const sessionHistory = priorHistory
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const liveApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      setIsGenerating(true);

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          prompt: trimmed,
          domain: updatedUserMsg.domain || 'productivity',
          currentPanicLevel: panicLevel,
          attachments: updatedUserMsg.attachments || [],
          history: sessionHistory,
          model: activeModel,
          apiKey: liveApiKey,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const actualErrorMessage =
              (typeof errData.details === 'string' && errData.details) ||
              (typeof errData.error === 'string' && errData.error) ||
              errData.error?.message ||
              (typeof errData.message === 'string' ? errData.message : null) ||
              (errData.message?.content ? errData.message.content : null) ||
              `API server error: ${res.status}`;
            throw new Error(actualErrorMessage);
          }
          return res.json();
        })
        .then((data) => {
          let assistantMsg: ChatMessage | null = null;
          if (data.message && typeof data.message === 'object') {
            assistantMsg = data.message;
          } else if (typeof data.message === 'string') {
            assistantMsg = {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: data.message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              domain: updatedUserMsg.domain || 'productivity',
            };
          } else if (typeof data.content === 'string') {
            assistantMsg = {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: data.content,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              domain: updatedUserMsg.domain || 'productivity',
            };
          }

          if (assistantMsg) {
            setAllMessages((prev) => {
              const current = prev[activeSessionId] || [];
              const base = current.slice(0, index + 1);
              return {
                ...prev,
                [activeSessionId]: [...base, assistantMsg!],
              };
            });

            // Auto-schedule task & device alarm if deadline detected in prompt/chat response
            if (assistantMsg.deadline) {
              const dl = assistantMsg.deadline;
              const daysOffset = dl.daysRemaining || 0;
              const targetDateObj = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
              const dateFormatted = targetDateObj.toISOString().split('T')[0];

              addCalendarEvent({
                title: dl.subject || `Scheduled: ${dl.rawText}`,
                date: dateFormatted,
                category: 'deadline',
                priority: dl.priority || 'high',
                linkedSessionId: activeSessionId,
                notes: `Auto-extracted deadline: ${dl.rawText}`,
                alarmScheduled: true,
              });
            }
          }
        })
        .catch((err: any) => {
          console.error('Error connecting to /api/chat:', err);
          const actualErrorMessage = err?.message || 'Error communicating with /api/chat service.';
          const cleanContent = actualErrorMessage.startsWith('⚠️')
            ? actualErrorMessage
            : `⚠️ **Gemini API Error:** ${actualErrorMessage}`;
          const errorMsg: ChatMessage = {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: cleanContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            domain: updatedUserMsg.domain || 'productivity',
          };
          setAllMessages((prev) => {
            const current = prev[activeSessionId] || [];
            const base = current.slice(0, index + 1);
            return {
              ...prev,
              [activeSessionId]: [...base, errorMsg],
            };
          });
        })
        .finally(() => {
          setIsGenerating(false);
        });
    },
    [activeSessionId, panicLevel, allMessages, activeModel, addCalendarEvent]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        login,
        logout,
        panicLevel,
        setPanicLevel,
        remainingSeconds,
        setRemainingSeconds,
        isTimerRunning,
        setIsTimerRunning,
        activeSessionId,
        setActiveSessionId,
        historySessions,
        deleteSession,
        archiveSession,
        createNewSession,
        currentMessages,
        sendMessage,
        editAndResubmitMessage,
        isGenerating,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        updateDeadlineDate,
        isKnowledgeModalOpen,
        setIsKnowledgeModalOpen,
        selectedKnowledgeCategory,
        setSelectedKnowledgeCategory,
        openKnowledgeModal,
        askAboutKnowledgeTopic,
        isSettingsOpen,
        setIsSettingsOpen,
        activeModel,
        setActiveModel: handleSetActiveModel,
        isCalendarOpen,
        setIsCalendarOpen,
        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarEvent,
        isDriveOpen,
        setIsDriveOpen,
        driveFiles,
        attachDriveFileToChat,
        pendingAttachment,
        clearPendingAttachment,
        saveCurrentSessionToDrive,
        saveAiResponseToDrive,
        isLiveAudio,
        setIsLiveAudio,
        focusMinutes,
        setFocusMinutes,
        focusSecondsRemaining,
        isFocusTimerRunning,
        setIsFocusTimerRunning,
        resetFocusTimer,
        isShareModalOpen,
        setIsShareModalOpen,
        shareModalData,
        openShareModal,
        isViewingSharedSession,
        sharedSessionTitle,
        forkSharedSession,
        notificationPermission,
        requestNotificationPerms,
        testAlarmNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
