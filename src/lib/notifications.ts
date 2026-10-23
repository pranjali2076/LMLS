import { CalendarEvent } from '@/types';

/**
 * LMLS Push Notifications, Web Audio Alarm Chimes & Google Tasks Sync
 */

// Web Audio API Synthesized Alarm Chime
export function playAlarmChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic chime sequence: 528 Hz (C5 Solfeggio), 660 Hz (E5), 792 Hz (G5)
    const notes = [
      { freq: 528, start: now + 0.0, dur: 0.35 },
      { freq: 660, start: now + 0.15, dur: 0.4 },
      { freq: 792, start: now + 0.32, dur: 0.65 },
      { freq: 1056, start: now + 0.55, dur: 0.8 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, n.start);

      // Smooth attack and pleasant exponential release
      gain.gain.setValueAtTime(0.001, n.start);
      gain.gain.exponentialRampToValueAtTime(0.35, n.start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, n.start + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(n.start);
      osc.stop(n.start + n.dur);
    });
  } catch (err) {
    console.warn('Web Audio alarm chime error:', err);
  }
}

// Request & Check Notification Permissions
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Trigger Instant or Scheduled Browser Notification
export function showTaskNotification(
  title: string,
  options?: {
    body?: string;
    tag?: string;
    icon?: string;
    playChime?: boolean;
  }
): Notification | null {
  if (options?.playChime !== false) {
    playAlarmChime();
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: options?.body || 'LMLS Scheduled Task / Deadline Reminder',
        tag: options?.tag || `lmls-alarm-${Date.now()}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return notif;
    } catch {
      return null;
    }
  }

  return null;
}

// In-Memory Scheduled Alarms Map
const activeTimers = new Map<string, NodeJS.Timeout>();

export function parseEventDateTime(dateStr: string, timeStr?: string): Date {
  let target: Date;

  if (dateStr && dateStr.includes('-')) {
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      target = new Date(parts[0], parts[1] - 1, parts[2], 9, 0, 0);
    } else {
      target = new Date(dateStr);
    }
  } else {
    target = new Date(dateStr);
  }

  if (isNaN(target.getTime())) {
    target = new Date();
  }

  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const meridiem = (match[3] || '').toUpperCase();

      if (meridiem === 'PM' && h < 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;

      target.setHours(h, m, 0, 0);
    }
  }

  return target;
}

// Schedule Alarm for a Calendar Task
export function scheduleTaskAlarm(
  event: CalendarEvent,
  onTrigger?: (evt: CalendarEvent) => void
): boolean {
  if (typeof window === 'undefined') return false;

  // Clear existing timer if already active
  if (activeTimers.has(event.id)) {
    clearTimeout(activeTimers.get(event.id)!);
    activeTimers.delete(event.id);
  }

  const targetDate = parseEventDateTime(
    event.reminderDate || event.date,
    event.reminderTime || event.time
  );

  const now = Date.now();
  const delay = targetDate.getTime() - now;

  // If in the future and within 24 days (max 32-bit setTimeout limit)
  if (delay > 0 && delay < 2147483647) {
    const timer = setTimeout(() => {
      showTaskNotification(`🔔 Alarm: ${event.title}`, {
        body: `Priority: ${event.priority.toUpperCase()} • ${event.notes || 'Scheduled deadline reached'}\nTime: ${event.time || 'Today'}`,
        tag: `alarm-${event.id}`,
        playChime: true,
      });
      activeTimers.delete(event.id);
      onTrigger?.(event);
    }, delay);

    activeTimers.set(event.id, timer);
    return true;
  }

  return false;
}

export function cancelTaskAlarm(eventId: string): void {
  if (activeTimers.has(eventId)) {
    clearTimeout(activeTimers.get(eventId)!);
    activeTimers.delete(eventId);
  }
}

// Google Calendar & Tasks Sync
export interface GoogleSyncResult {
  googleCalendarUrl: string;
  reminderDate: string;
  reminderTime: string;
  syncedAt: string;
}

export function syncEventWithGoogle(event: CalendarEvent): GoogleSyncResult {
  const reminderDate = event.reminderDate || event.date;
  const reminderTime = event.reminderTime || event.time || '10:00 AM';

  const startTarget = parseEventDateTime(event.date, event.time);
  const endTarget = new Date(startTarget.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatGoogleDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const startIso = formatGoogleDate(startTarget);
  const endIso = formatGoogleDate(endTarget);

  const details = `${event.notes || ''}\n\nCategory: ${event.category.toUpperCase()}\nPriority: ${event.priority.toUpperCase()}\nScheduled via LMLS Cognitive Architecture`;

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `[LMLS] ${event.title}`
  )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
    details
  )}&location=${encodeURIComponent('LMLS Cognitive Workspace')}`;

  // Store in Local Google Sync State
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('lmls_google_calendar_sync');
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [
        {
          id: event.id,
          title: event.title,
          reminder_date: reminderDate,
          reminder_time: reminderTime,
          priority: event.priority,
          googleCalendarUrl,
          syncedAt: new Date().toISOString(),
        },
        ...existing.filter((item: any) => item.id !== event.id),
      ];
      localStorage.setItem('lmls_google_calendar_sync', JSON.stringify(updated));
    } catch {}
  }

  return {
    googleCalendarUrl,
    reminderDate,
    reminderTime,
    syncedAt: new Date().toLocaleTimeString(),
  };
}
