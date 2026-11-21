import React from 'react';
import { ArrowRight, Bell, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Assignment, Priority, Subject } from '../types';
import { AssignmentCard } from './AssignmentCard';
import {
  TODAY_ISO,
  formatEyebrowDate,
  isDueToday,
  isOverdue,
  sortAssignments,
} from '../utils/dateUtils';

interface TodayViewProps {
  assignments: Assignment[];
  subjects: Subject[];
  selectedAssignmentId: string | null;
  onSelectAssignment: (id: string) => void;
  onChangePriority: (id: string, priority: Priority) => void;
  onOpenAddModal: () => void;
  onNavigateToTasks: (filter?: { priority?: Priority | 'all'; urgency?: 'today' | 'in_progress' | 'overdue' }) => void;
  onNavigateToCalendar: () => void;
  onOpenNotifications: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  assignments,
  subjects,
  selectedAssignmentId,
  onSelectAssignment,
  onChangePriority,
  onOpenAddModal,
  onNavigateToTasks,
  onNavigateToCalendar,
  onOpenNotifications,
}) => {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const totalCount = assignments.length;
  const completedCount = assignments.filter((a) => a.status === 'submitted').length;
  const remainingCount = totalCount - completedCount;
  const percentDone = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const activeAssignments = assignments.filter((a) => a.status !== 'submitted');
  const dueTodayCount = activeAssignments.filter((a) => isDueToday(a.dueDate)).length;
  const inProgressCount = activeAssignments.filter((a) => a.status === 'in_progress').length;
  const overdueCount = activeAssignments.filter((a) => isOverdue(a)).length;

  // Sort active tasks by Priority (High -> Medium -> Low) then due date
  const prioritizedActive = sortAssignments(activeAssignments, 'priority');
  const upNextAssignments = prioritizedActive.slice(0, 3);

  const highCount = activeAssignments.filter((a) => a.priority === 'high').length;
  const mediumCount = activeAssignments.filter((a) => a.priority === 'medium').length;
  const lowCount = activeAssignments.filter((a) => a.priority === 'low').length;

  const activeRemindersCount = activeAssignments.filter((a) => a.reminder !== 'none').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#65706B]">
            {formatEyebrowDate(TODAY_ISO)}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#16221E] sm:text-[28px] [text-wrap:balance]">
            You’ve got this, Nicole.
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={`Open reminders (${activeRemindersCount} active)`}
          className="relative flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-2xl border border-[#E5EAE7] bg-white text-[#16221E] transition-colors hover:border-[#C9D3CE] hover:bg-[#FAFBF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45]"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {activeRemindersCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0F5C45] px-1 text-[10px] font-bold text-white tabular-nums">
              {activeRemindersCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Primary Column */}
        <div className="space-y-5 lg:col-span-7">
          {/* Hero Progress Card */}
          <section
            aria-label="Weekly assignment progress"
            className="rounded-3xl bg-[#0F5C45] p-5 text-white shadow-[0_10px_28px_rgba(15,92,69,0.16)] sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-wide text-[#C3DFD3]">
                Your week at a glance
              </span>
              <span className="rounded-lg bg-[#DCF0A7] px-2.5 py-1 text-xs font-bold text-[#144332] tabular-nums whitespace-nowrap shrink-0">
                {percentDone}% done
              </span>
            </div>

            <div className="mt-3.5 flex flex-wrap items-baseline gap-2.5">
              <span className="font-display text-[32px] font-bold leading-none tracking-tight tabular-nums sm:text-4xl">
                {completedCount} of {totalCount}
              </span>
              <span className="text-sm font-medium text-[#D6EAE1]">
                assignments completed
              </span>
            </div>

            <div
              className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#0A3E2E]"
              role="progressbar"
              aria-valuenow={percentDone}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Weekly completion progress"
            >
              <div
                className="h-full rounded-full bg-[#D7EE9A] transition-all duration-300"
                style={{ width: `${percentDone}%` }}
              />
            </div>

            <p className="mt-3.5 text-xs font-medium text-[#C8E3D7]">
              {remainingCount === 0
                ? 'All assignments completed for this week. Great focus.'
                : `${remainingCount} more to go. Keep your momentum.`}
            </p>
          </section>

          {/* 3 Metric Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTasks({ urgency: 'today' })}
              className="rounded-2xl bg-[#FBECE4] p-3.5 text-left transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85A3A]"
            >
              <div className="font-display text-2xl font-bold text-[#B85A3A] tabular-nums">
                {String(dueTodayCount).padStart(2, '0')}
              </div>
              <div className="mt-0.5 text-xs font-medium text-[#B85A3A]">Due today</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTasks({ urgency: 'in_progress' })}
              className="rounded-2xl bg-[#E4F2EC] p-3.5 text-left transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136B50]"
            >
              <div className="font-display text-2xl font-bold text-[#136B50] tabular-nums">
                {String(inProgressCount).padStart(2, '0')}
              </div>
              <div className="mt-0.5 text-xs font-medium text-[#136B50]">In progress</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTasks({ urgency: 'overdue' })}
              className="rounded-2xl bg-[#EFF2F0] p-3.5 text-left transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6A65]"
            >
              <div className="font-display text-2xl font-bold text-[#5E6A65] tabular-nums">
                {String(overdueCount).padStart(2, '0')}
              </div>
              <div className="mt-0.5 text-xs font-medium text-[#5E6A65]">Overdue</div>
            </button>
          </div>

          {/* Up Next Section (Priority-ordered) */}
          <section aria-label="Up next assignments" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-[#16221E]">Up next</h2>
                <p className="text-xs text-[#65706B]">Sorted by priority and deadline</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTasks()}
                className="inline-flex min-h-[44px] items-center gap-1 px-2 text-xs font-semibold text-[#0F5C45] hover:text-[#0A3E2E] transition-colors whitespace-nowrap shrink-0"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {upNextAssignments.length === 0 ? (
              <div className="rounded-2xl border border-[#E7EBE9] bg-white p-6 text-center">
                <p className="font-display text-sm font-semibold text-[#16221E]">
                  No active assignments left
                </p>
                <p className="mt-1 text-xs text-[#65706B]">
                  Add a new assignment below or review your completed work.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upNextAssignments.map((asg) => (
                  <AssignmentCard
                    key={asg.id}
                    assignment={asg}
                    subject={subjectMap.get(asg.subjectId)}
                    onSelect={onSelectAssignment}
                    onChangePriority={onChangePriority}
                    isSelected={selectedAssignmentId === asg.id}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#162621] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F5C45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add assignment
            </button>
          </section>
        </div>

        {/* Right Secondary Column (Desktop Focus Overview) */}
        <aside className="space-y-4 lg:col-span-5">
          {/* Priority Breakdown Card */}
          <div className="rounded-2xl border border-[#E7EBE9] bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold text-[#16221E]">
                Priority queue
              </h2>
              <button
                type="button"
                onClick={() => onNavigateToTasks()}
                className="text-xs font-medium text-[#0F5C45] hover:underline"
              >
                Manage priorities
              </button>
            </div>
            <p className="mt-1 text-xs text-[#65706B]">
              Focus on high-priority deadlines first to keep your weekend clear.
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigateToTasks({ priority: 'high' })}
                className="flex w-full items-center justify-between rounded-xl bg-[#FBECE4]/70 px-3.5 py-2.5 text-left transition-colors hover:bg-[#FBECE4]"
              >
                <span className="text-xs font-semibold text-[#B85A3A]">High priority</span>
                <span className="text-xs font-bold text-[#B85A3A] tabular-nums">
                  {highCount} active
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTasks({ priority: 'medium' })}
                className="flex w-full items-center justify-between rounded-xl bg-[#FBF3E2]/80 px-3.5 py-2.5 text-left transition-colors hover:bg-[#FBF3E2]"
              >
                <span className="text-xs font-semibold text-[#92621A]">Medium priority</span>
                <span className="text-xs font-bold text-[#92621A] tabular-nums">
                  {mediumCount} active
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTasks({ priority: 'low' })}
                className="flex w-full items-center justify-between rounded-xl bg-[#EFF2F0] px-3.5 py-2.5 text-left transition-colors hover:bg-[#E4E9E6]"
              >
                <span className="text-xs font-semibold text-[#5E6A65]">Low priority</span>
                <span className="text-xs font-bold text-[#5E6A65] tabular-nums">
                  {lowCount} active
                </span>
              </button>
            </div>
          </div>

          {/* Weekend / Calendar Insight Card */}
          <div className="rounded-2xl border border-[#F4D9CA] bg-[#FBECE4] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#9E4527]">
                  A busy weekend ahead
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#B85A3A]">
                  3 deadlines on Nov 21–22. Start with HCI while your heuristic checklist is halfway done.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToCalendar}
                aria-label="View deadline calendar"
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#9E4527] transition-colors hover:bg-white"
              >
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
