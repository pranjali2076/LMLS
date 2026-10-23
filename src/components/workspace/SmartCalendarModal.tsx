'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CalendarEvent, PanicLevel } from '@/types';
import {
  Calendar as CalendarIcon,
  X,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Flame,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  Check,
  CalendarCheck,
  Tag,
  Bell,
  BellRing,
  Volume2,
  ExternalLink,
} from 'lucide-react';
import { syncEventWithGoogle, playAlarmChime, parseEventDateTime } from '@/lib/notifications';

export default function SmartCalendarModal() {
  const {
    isCalendarOpen,
    setIsCalendarOpen,
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    toggleCalendarEvent,
    activeSessionId,
    historySessions,
    notificationPermission,
    requestNotificationPerms,
    testAlarmNotification,
  } = useApp();

  // Current view date state (defaulting to current date)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  // New Event Form State
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(selectedDateStr);
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newPriority, setNewPriority] = useState<PanicLevel>('high');
  const [newCategory, setNewCategory] = useState<CalendarEvent['category']>('exam');
  const [newNotes, setNewNotes] = useState('');
  const [linkCurrentSession, setLinkCurrentSession] = useState(false);
  const [newReminderOffset, setNewReminderOffset] = useState<'0' | '10' | '30' | '60' | '1440'>('0');
  const [syncWithGoogle, setSyncWithGoogle] = useState(true);

  if (!isCalendarOpen) return null;

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDayIndex }, (_, i) => ({
    dayNumber: daysInPrevMonth - firstDayIndex + 1 + i,
    isCurrentMonth: false,
    dateStr: '',
  }));

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      dayNumber: day,
      isCurrentMonth: true,
      dateStr: formattedDate,
    };
  });

  const totalCells = Math.ceil((prevMonthDays.length + currentMonthDays.length) / 7) * 7;
  const nextMonthDaysCount = totalCells - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => ({
    dayNumber: i + 1,
    isCurrentMonth: false,
    dateStr: '',
  }));

  const allCalendarCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateSelect = (dateStr: string) => {
    if (!dateStr) return;
    setSelectedDateStr(dateStr);
    setNewDate(dateStr);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let reminderDate = newDate || selectedDateStr;
    let reminderTime = newTime || '10:00 AM';

    if (newReminderOffset !== '0') {
      try {
        const eventDateObj = parseEventDateTime(reminderDate, reminderTime);
        const offsetMinutes = parseInt(newReminderOffset, 10);
        const reminderDateObj = new Date(eventDateObj.getTime() - offsetMinutes * 60 * 1000);
        reminderDate = `${reminderDateObj.getFullYear()}-${String(reminderDateObj.getMonth() + 1).padStart(2, '0')}-${String(reminderDateObj.getDate()).padStart(2, '0')}`;
        reminderTime = reminderDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {}
    }

    addCalendarEvent({
      title: newTitle.trim(),
      date: newDate || selectedDateStr,
      time: newTime || '10:00 AM',
      reminderDate,
      reminderTime,
      priority: newPriority,
      category: newCategory,
      notes: newNotes.trim() || undefined,
      linkedSessionId: linkCurrentSession ? activeSessionId : undefined,
      completed: false,
      alarmScheduled: true,
      googleTasksSynced: syncWithGoogle,
      googleCalendarSynced: syncWithGoogle,
    });

    setNewTitle('');
    setNewNotes('');
    setIsAddingEvent(false);
  };

  // Filter events for selected day, or show all if today
  const selectedDayEvents = calendarEvents.filter((e) => e.date === selectedDateStr);
  const upcomingEvents = calendarEvents.filter((e) => e.date !== selectedDateStr);

  const getPriorityBadge = (p: PanicLevel) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getPriorityDot = (p: PanicLevel) => {
    switch (p) {
      case 'high':
        return 'bg-rose-400';
      case 'medium':
        return 'bg-amber-400';
      case 'low':
        return 'bg-emerald-400';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-calendar-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl glass-panel-emerald shadow-2xl border border-emerald-500/30 backdrop-blur-2xl text-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0 bg-[#0b1320]/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/30 shrink-0">
              <CalendarIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 id="smart-calendar-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Smart Calendar & Alarm Reminders
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AUTO-SYNC
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Push notifications, device phone alarms & Google Tasks/Calendar sync
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Alarm / Push Notification Permission Pill */}
            {notificationPermission === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                <span>Alarms Active</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={requestNotificationPerms}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors shadow-sm cursor-pointer"
                title="Enable browser push notifications and device alarms"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Enable Alarms</span>
              </button>
            )}

            {/* Test Alarm Chime Audio Button */}
            <button
              type="button"
              onClick={() => testAlarmNotification()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer"
              title="Test audio chime synthesized via Web Audio API oscillator"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Chime</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingEvent((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Deadline</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCalendarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close Calendar"
              aria-label="Close Calendar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Interactive Month Grid (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {monthNames[month]} {year}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {calendarEvents.length} Events
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDateStr(new Date().toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-[11px] rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 py-1 select-none">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 select-none">
              {allCalendarCells.map((cell, idx) => {
                const dayEvents = cell.isCurrentMonth
                  ? calendarEvents.filter((e) => e.date === cell.dateStr)
                  : [];
                const isSelected = cell.dateStr === selectedDateStr;
                const isToday =
                  cell.isCurrentMonth &&
                  cell.dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={idx}
                    onClick={() => cell.isCurrentMonth && handleDateSelect(cell.dateStr)}
                    className={`min-h-[58px] sm:min-h-[66px] p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                      !cell.isCurrentMonth
                        ? 'opacity-25 border-transparent cursor-default'
                        : isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/60 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : isToday
                        ? 'bg-slate-800/70 border-cyan-500/50 hover:bg-slate-800'
                        : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-medium ${
                          isToday
                            ? 'text-cyan-400 font-bold'
                            : isSelected
                            ? 'text-emerald-300 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </div>

                    {/* Event indicators */}
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className={`w-2 h-2 rounded-full ${getPriorityDot(e.priority)} shadow-xs`}
                          title={`${e.title} (${e.priority})`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-mono">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Priority Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 px-1">
              <span className="text-[11px] uppercase font-mono tracking-wider">Priority:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>High / Exam</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Routine</span>
              </div>
            </div>
          </div>

          {/* Right Column: Events & New Deadline Form (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Inline Event Creation Form */}
            {isAddingEvent ? (
              <form
                onSubmit={handleCreateEvent}
                className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/30 space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    Schedule New Deadline
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingEvent(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">
                    Event or Exam Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems Final Exam"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">
                    Urgency & Priority
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['high', 'medium', 'low'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewPriority(lvl)}
                        className={`py-1.5 text-xs rounded-xl capitalize font-medium border transition-all ${
                          newPriority === lvl
                            ? lvl === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                              : lvl === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-950/40 text-slate-400 border-white/5'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="exam">Final Exam / Test</option>
                    <option value="assignment">Assignment / Project</option>
                    <option value="clinical">Clinical / Medical Triage</option>
                    <option value="deadline">Administrative Deadline</option>
                    <option value="study">Study Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">
                    Notes & Syllabus References
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key concepts or prep checklist..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                {/* Reminder Timing & Google Sync Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Reminder Alarm Ring Time
                    </label>
                    <select
                      value={newReminderOffset}
                      onChange={(e) => setNewReminderOffset(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="0">🔔 At exact event time</option>
                      <option value="10">🔔 10 minutes before</option>
                      <option value="30">🔔 30 minutes before</option>
                      <option value="60">🔔 1 hour before</option>
                      <option value="1440">🔔 1 day before</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/40 border border-white/5 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={syncWithGoogle}
                        onChange={(e) => setSyncWithGoogle(e.target.checked)}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <span>Sync Google Tasks & Cal</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="link-session-chk"
                    checked={linkCurrentSession}
                    onChange={(e) => setLinkCurrentSession(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <label htmlFor="link-session-chk" className="text-xs text-slate-300 cursor-pointer">
                    Link current active chat session to this deadline
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
                >
                  Confirm & Schedule
                </button>
              </form>
            ) : null}

            {/* Selected Date Summary Banner */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 block tracking-wider">
                  Selected Schedule
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg">
                {selectedDayEvents.length} Tasks
              </span>
            </div>

            {/* Events List for Selected Day */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {selectedDayEvents.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-dashed border-white/10 text-center space-y-2">
                  <CalendarCheck className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No deadlines scheduled on this date.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewDate(selectedDateStr);
                      setIsAddingEvent(true);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline"
                  >
                    + Add a task for this date
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((evt) => {
                  const googleSync = syncEventWithGoogle(evt);
                  return (
                    <div
                      key={evt.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        evt.completed
                          ? 'bg-slate-900/30 border-white/5 opacity-60'
                          : 'bg-slate-900/60 border-white/10 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleCalendarEvent(evt.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                            title={evt.completed ? 'Mark pending' : 'Mark completed'}
                          >
                            {evt.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-500 hover:border-emerald-400" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-xs font-semibold leading-snug ${
                                evt.completed ? 'line-through text-slate-500' : 'text-white'
                              }`}
                            >
                              {evt.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {evt.time || 'All Day'}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded border uppercase ${getPriorityBadge(evt.priority)}`}>
                                {evt.priority}
                              </span>
                              <span className="capitalize text-slate-400">
                                {evt.category}
                              </span>
                              {evt.alarmScheduled !== false && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                  <Bell className="w-2.5 h-2.5" />
                                  <span>Alarm: {evt.reminderTime || evt.time || 'Active'}</span>
                                </span>
                              )}
                            </div>
                            {evt.notes && (
                              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed bg-slate-950/40 p-2 rounded-xl border border-white/5">
                                {evt.notes}
                              </p>
                            )}

                            {/* Google Sync and Sound Preview Buttons */}
                            <div className="flex items-center gap-2 mt-2 pt-1 border-t border-white/5 flex-wrap">
                              <a
                                href={googleSync.googleCalendarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                                title="Sync / Open in Google Calendar & Tasks"
                              >
                                <CalendarIcon className="w-3 h-3 text-emerald-400" />
                                <span>Google Calendar Sync</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                              </a>

                              <button
                                type="button"
                                onClick={() => playAlarmChime()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Preview alarm sound"
                              >
                                <Volume2 className="w-3 h-3 text-slate-400" />
                                <span>Test Chime</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteCalendarEvent(evt.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Other Upcoming Events Preview */}
              {upcomingEvents.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
                    Other Upcoming Milestones
                  </div>
                  <div className="space-y-2">
                    {upcomingEvents.slice(0, 3).map((ue) => {
                      const ueSync = syncEventWithGoogle(ue);
                      return (
                        <div
                          key={ue.id}
                          onClick={() => setSelectedDateStr(ue.date)}
                          className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer text-xs"
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium text-slate-200 block truncate">
                              {ue.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {ue.date} • {ue.time}
                              {ue.alarmScheduled !== false && ' • 🔔 Alarm Set'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={ueSync.googleCalendarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-lg hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition-colors"
                              title="Sync to Google Calendar"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase ${getPriorityBadge(ue.priority)}`}>
                              {ue.priority}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between bg-[#0b1320]/70 text-xs gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <BellRing className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Automatic Web Notifications & Audio Chime Alarms configured with Google Tasks & Calendar</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => testAlarmNotification()}
              className="px-3 py-1.5 rounded-xl font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Audio Alarm</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(false)}
              className="px-4 py-1.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
