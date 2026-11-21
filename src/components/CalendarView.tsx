import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { Assignment, Subject } from '../types';
import { SUBJECT_PALETTES } from '../data/seedData';
import {
  TODAY_ISO,
  formatFullDayHeading,
  formatTime12h,
  getMonthCalendarDays,
  parseIsoDate,
  sortAssignments,
} from '../utils/dateUtils';

interface CalendarViewProps {
  assignments: Assignment[];
  subjects: Subject[];
  onSelectAssignment: (id: string) => void;
  onOpenAddModalForDate: (isoDate: string) => void;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  assignments,
  subjects,
  onSelectAssignment,
  onOpenAddModalForDate,
}) => {
  const initialDate = parseIsoDate(TODAY_ISO);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedIso, setSelectedIso] = useState(TODAY_ISO);

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const calendarCells = useMemo(
    () => getMonthCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const monthHeading = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewYear, viewMonth]);

  // Map ISO date -> assignments due on that day
  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const existing = map.get(a.dueDate) ?? [];
      existing.push(a);
      map.set(a.dueDate, existing);
    }
    return map;
  }, [assignments]);

  const selectedDayAssignments = useMemo(() => {
    const items = assignmentsByDate.get(selectedIso) ?? [];
    return sortAssignments(items, 'priority');
  }, [assignmentsByDate, selectedIso]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const d = parseIsoDate(TODAY_ISO);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelectedIso(TODAY_ISO);
  };

  // Compute weekend workload summary dynamically
  const weekendCount = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.status !== 'submitted' &&
          (a.dueDate === '2026-11-21' || a.dueDate === '2026-11-22')
      ).length,
    [assignments]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#16221E] sm:text-[28px]">
            Make room for focus.
          </h1>
          <p className="mt-1 text-sm text-[#65706B]">
            See deadlines before they sneak up.
          </p>
        </div>

        <button
          type="button"
          onClick={handleJumpToday}
          aria-label="Jump to today, November 21"
          title="Jump to today"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#E5EAE7] bg-white px-3 text-xs font-semibold text-[#16221E] transition-colors hover:border-[#C9D3CE] hover:bg-[#FAFBF9]"
        >
          <CalendarIcon className="h-4 w-4 text-[#0F5C45]" aria-hidden="true" />
          <span className="hidden sm:inline">Today</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left: Month Grid + Workload Alert */}
        <div className="space-y-4 lg:col-span-6">
          <div className="rounded-3xl border border-[#E7EBE9] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#16221E]">
                {monthHeading}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#5E6A65] hover:bg-[#F1F3F2] hover:text-[#16221E] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#5E6A65] hover:bg-[#F1F3F2] hover:text-[#16221E] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekday labels */}
            <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-semibold text-[#88948F]">
              {WEEKDAYS.map((wd, idx) => (
                <div key={`${wd}-${idx}`} className="py-1">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
              {calendarCells.map((cell) => {
                const dayAssignments = assignmentsByDate.get(cell.iso) ?? [];
                const hasActiveDue = dayAssignments.some((a) => a.status !== 'submitted');
                const hasSubmittedOnly = !hasActiveDue && dayAssignments.length > 0;
                const isSelected = cell.iso === selectedIso;
                const isToday = cell.iso === TODAY_ISO;

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setSelectedIso(cell.iso)}
                    aria-label={`${cell.iso}, ${dayAssignments.length} deadlines`}
                    aria-pressed={isSelected}
                    className={`relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-full text-xs font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45] ${
                      isSelected
                        ? 'bg-[#0F5C45] font-bold text-white shadow-sm'
                        : isToday
                          ? 'bg-[#E4F2EC] font-bold text-[#0F5C45]'
                          : cell.inCurrentMonth
                            ? 'text-[#16221E] hover:bg-[#F1F4F2]'
                            : 'text-[#B2BBB6] hover:bg-[#F6F7F6]'
                    }`}
                  >
                    <span>{cell.day}</span>
                    {(hasActiveDue || hasSubmittedOnly) && (
                      <span
                        className={`mt-0.5 h-1 w-1 rounded-full ${
                          isSelected
                            ? 'bg-[#D7EE9A]'
                            : hasActiveDue
                              ? 'bg-[#0F5C45]'
                              : 'bg-[#A6B2AC]'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-[#F0F3F1] pt-3 text-[11px] text-[#65706B]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0F5C45]" aria-hidden="true" />
                Assignment due
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A6B2AC]" aria-hidden="true" />
                Completed
              </span>
            </div>
          </div>

          {/* Workload Alert Banner */}
          {weekendCount > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-[#F4D9CA] bg-[#FBECE4] p-4">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/75 text-[#B85A3A]">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#9E4527]">
                  A busy weekend ahead
                </p>
                <p className="mt-0.5 text-xs text-[#B85A3A]">
                  {weekendCount} active {weekendCount === 1 ? 'deadline' : 'deadlines'} on Nov 21–22. Start with high-priority HCI work first.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Day Agenda */}
        <section aria-label="Selected day agenda" className="space-y-3.5 lg:col-span-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-[#16221E]">
              {formatFullDayHeading(selectedIso)}
            </h2>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#EFF2F0] px-2.5 py-1 text-xs font-medium text-[#5E6A65] tabular-nums">
                {selectedDayAssignments.length} due
              </span>
              <button
                type="button"
                onClick={() => onOpenAddModalForDate(selectedIso)}
                aria-label={`Add assignment for ${selectedIso}`}
                className="flex min-h-[36px] items-center gap-1 rounded-xl bg-[#0F5C45] px-3 text-xs font-semibold text-white hover:bg-[#0B4735] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add
              </button>
            </div>
          </div>

          {selectedDayAssignments.length === 0 ? (
            <div className="rounded-3xl border border-[#E7EBE9] bg-white p-7 text-center">
              <p className="font-display text-sm font-semibold text-[#16221E]">
                Clear day for deep focus
              </p>
              <p className="mt-1 text-xs text-[#65706B]">
                No assignments are due on {formatFullDayHeading(selectedIso)}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayAssignments.map((item) => {
                const subj = subjectMap.get(item.subjectId);
                const palette = subj ? SUBJECT_PALETTES[subj.colorKey] : SUBJECT_PALETTES.emerald;
                const statusText =
                  item.status === 'submitted'
                    ? 'Submitted'
                    : item.status === 'in_progress'
                      ? 'In progress'
                      : 'Not started';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectAssignment(item.id)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#E7EBE9] bg-white p-4 text-left transition-all hover:border-[#0F5C45]/50 hover:shadow-[0_2px_10px_rgba(22,34,30,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${palette.text}`}>
                          {subj ? subj.code : 'Course'}
                        </span>
                        <span aria-hidden="true" className="text-[#C4CCC8]">
                          ·
                        </span>
                        <span className="text-[#5E6A65]">{statusText}</span>
                        <span aria-hidden="true" className="text-[#C4CCC8]">
                          ·
                        </span>
                        <span className="capitalize font-medium text-[#B85A3A]">
                          {item.priority}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-display text-[15px] font-semibold text-[#16221E]">
                        {item.title}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs font-semibold text-[#147458] tabular-nums">
                        {formatTime12h(item.dueTime)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
