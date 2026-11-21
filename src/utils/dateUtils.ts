import { Assignment, ReminderOption } from '../types';

export const TODAY_ISO = '2026-11-21';

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDueShort(dueDate: string, dueTime: string): string {
  const timeStr = formatTime12h(dueTime);
  if (dueDate === TODAY_ISO) {
    return `Today · ${timeStr}`;
  }
  const date = parseIsoDate(dueDate);
  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${monthShort} ${day} · ${timeStr}`;
}

export function formatMonthDay(dueDate: string): string {
  const date = parseIsoDate(dueDate);
  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
  return `${monthShort} ${date.getDate()}`;
}

export function formatFullDayHeading(iso: string): string {
  const date = parseIsoDate(iso);
  const formatted = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  if (iso === TODAY_ISO) {
    return `Today, ${formatted}`;
  }
  return formatted;
}

export function formatEyebrowDate(iso: string): string {
  const date = parseIsoDate(iso);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function isDueToday(dueDate: string): boolean {
  return dueDate === TODAY_ISO;
}

export function isOverdue(assignment: Assignment): boolean {
  if (assignment.status === 'submitted') return false;
  return assignment.dueDate < TODAY_ISO;
}

export function getUrgencyLabel(assignment: Assignment): {
  label: string;
  tone: 'peach' | 'neutral' | 'mint' | 'danger';
} {
  if (assignment.status === 'submitted') {
    return { label: 'Submitted', tone: 'mint' };
  }
  if (assignment.dueDate < TODAY_ISO) {
    return { label: 'Overdue', tone: 'danger' };
  }
  if (assignment.dueDate === TODAY_ISO) {
    return { label: 'Due today', tone: 'peach' };
  }
  return { label: 'Upcoming', tone: 'neutral' };
}

export function getReminderLabel(
  dueDate: string,
  dueTime: string,
  reminder: ReminderOption
): string {
  if (reminder === 'none') {
    return 'No reminder set · Tap to schedule';
  }

  const [hStr, mStr] = dueTime.split(':');
  const due = parseIsoDate(dueDate);
  due.setHours(Number(hStr), Number(mStr), 0, 0);

  const offsets: Record<Exclude<ReminderOption, 'none'>, { ms: number; desc: string }> = {
    '30m': { ms: 30 * 60 * 1000, desc: '30 mins before' },
    '1h': { ms: 60 * 60 * 1000, desc: '1 hour before' },
    '3h': { ms: 3 * 60 * 60 * 1000, desc: '3 hours before' },
    '1d': { ms: 24 * 60 * 60 * 1000, desc: '1 day before' },
  };

  const offset = offsets[reminder];
  const trigger = new Date(due.getTime() - offset.ms);
  const triggerIso = toIsoDate(trigger);
  const triggerTimeStr = trigger.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const dayText =
    triggerIso === TODAY_ISO
      ? 'Today'
      : trigger.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${dayText} at ${triggerTimeStr} · ${offset.desc}`;
}

export interface CalendarCell {
  iso: string;
  day: number;
  inCurrentMonth: boolean;
}

/**
 * Generates a 42-cell (6-week) or 35-cell Monday-first calendar grid for (year, monthIndex 0-11).
 */
export function getMonthCalendarDays(year: number, monthIndex: number): CalendarCell[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  // Convert Sunday (0) .. Saturday (6) into Monday (0) .. Sunday (6)
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalNeeded = startOffset + daysInMonth;
  const cellCount = totalNeeded > 35 ? 42 : 35;

  const cells: CalendarCell[] = [];
  const startDate = new Date(year, monthIndex, 1 - startOffset);

  for (let i = 0; i < cellCount; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    cells.push({
      iso: toIsoDate(d),
      day: d.getDate(),
      inCurrentMonth: d.getMonth() === monthIndex,
    });
  }

  return cells;
}

export function sortAssignments(
  list: Assignment[],
  sortBy: 'due_date' | 'priority' | 'progress'
): Assignment[] {
  const priorityRank = { high: 0, medium: 1, low: 2 };

  return [...list].sort((a, b) => {
    if (sortBy === 'priority') {
      const diff = priorityRank[a.priority] - priorityRank[b.priority];
      if (diff !== 0) return diff;
    }
    if (sortBy === 'progress') {
      const ratioA =
        a.subtasks.length > 0
          ? a.subtasks.filter((s) => s.completed).length / a.subtasks.length
          : a.status === 'submitted'
            ? 1
            : 0;
      const ratioB =
        b.subtasks.length > 0
          ? b.subtasks.filter((s) => s.completed).length / b.subtasks.length
          : b.status === 'submitted'
            ? 1
            : 0;
      if (ratioA !== ratioB) return ratioB - ratioA;
    }
    const dateCmp = a.dueDate.localeCompare(b.dueDate);
    if (dateCmp !== 0) return dateCmp;
    return a.dueTime.localeCompare(b.dueTime);
  });
}
