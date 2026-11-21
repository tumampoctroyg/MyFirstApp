import React from 'react';
import { Clock, Flag } from 'lucide-react';
import { Assignment, Priority, Subject } from '../types';
import { SUBJECT_PALETTES } from '../data/seedData';
import { formatDueShort, getUrgencyLabel } from '../utils/dateUtils';

interface AssignmentCardProps {
  assignment: Assignment;
  subject?: Subject;
  onSelect: (assignmentId: string) => void;
  onChangePriority?: (assignmentId: string, priority: Priority) => void;
  isSelected?: boolean;
}

const PRIORITY_STYLES: Record<
  Priority,
  { label: string; textClass: string; bgClass: string }
> = {
  high: {
    label: 'High priority',
    textClass: 'text-[#B85A3A]',
    bgClass: 'bg-[#FBECE4]',
  },
  medium: {
    label: 'Medium priority',
    textClass: 'text-[#92621A]',
    bgClass: 'bg-[#FBF3E2]',
  },
  low: {
    label: 'Low priority',
    textClass: 'text-[#5E6A65]',
    bgClass: 'bg-[#EFF2F0]',
  },
};

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  subject,
  onSelect,
  onChangePriority,
  isSelected = false,
}) => {
  const palette = subject ? SUBJECT_PALETTES[subject.colorKey] : SUBJECT_PALETTES.emerald;
  const urgency = getUrgencyLabel(assignment);
  const priorityStyle = PRIORITY_STYLES[assignment.priority];

  const totalSubtasks = assignment.subtasks.length;
  const doneSubtasks = assignment.subtasks.filter((s) => s.completed).length;

  let progressRatio = 0;
  if (assignment.status === 'submitted') {
    progressRatio = 100;
  } else if (totalSubtasks > 0) {
    progressRatio = Math.round((doneSubtasks / totalSubtasks) * 100);
  } else if (assignment.status === 'in_progress') {
    progressRatio = 35;
  }

  let statusLabel = 'Not started';
  let statusTextClass = 'text-[#5A519A]';
  if (assignment.status === 'submitted') {
    statusLabel = 'Submitted';
    statusTextClass = 'text-[#147458]';
  } else if (assignment.status === 'in_progress') {
    statusLabel = totalSubtasks > 0 ? `In progress · ${doneSubtasks}/${totalSubtasks}` : 'In progress';
    statusTextClass = 'text-[#147458]';
  }

  const urgencyTextClass =
    urgency.tone === 'danger'
      ? 'text-[#B42318] bg-[#FEECEB]'
      : urgency.tone === 'peach'
        ? 'text-[#B85A3A] bg-[#FBECE4]'
        : urgency.tone === 'mint'
          ? 'text-[#147458] bg-[#E5F2EC]'
          : 'text-[#5E6A65] bg-[#F1F3F2]';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(assignment.id);
    }
  };

  return (
    <article
      tabIndex={0}
      onClick={() => onSelect(assignment.id)}
      onKeyDown={handleKeyDown}
      className={`group cursor-pointer rounded-2xl bg-white p-4 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45] ${
        isSelected
          ? 'border border-[#0F5C45] shadow-sm'
          : 'border border-[#E7EBE9] hover:border-[#C9D3CE] hover:shadow-[0_2px_10px_rgba(22,34,30,0.04)]'
      }`}
    >
      {/* Top kicker row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <span className={`truncate font-semibold tracking-wide ${palette.text}`}>
            {subject ? `${subject.code} · ${subject.shortName}` : 'COURSE'}
          </span>
          <span aria-hidden="true" className="text-[#C4CCC8]">
            ·
          </span>
          {onChangePriority ? (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="relative inline-flex items-center shrink-0"
            >
              <Flag className={`mr-1 h-3 w-3 ${priorityStyle.textClass}`} aria-hidden="true" />
              <select
                aria-label={`Priority for ${assignment.title}`}
                value={assignment.priority}
                onChange={(e) => onChangePriority(assignment.id, e.target.value as Priority)}
                className={`cursor-pointer appearance-none bg-transparent pr-1 text-xs font-medium focus-visible:outline-none focus-visible:underline ${priorityStyle.textClass}`}
              >
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
            </div>
          ) : (
            <span className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 ${priorityStyle.textClass}`}>
              <Flag className="h-3 w-3" aria-hidden="true" />
              {priorityStyle.label}
            </span>
          )}
        </div>

        <span
          className={`shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium ${urgencyTextClass}`}
        >
          {urgency.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-2 font-display text-[16px] font-semibold leading-snug text-[#16221E] group-hover:text-[#0F5C45] transition-colors">
        {assignment.title}
      </h3>

      {/* Bottom meta row */}
      <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 text-[#5E6A65] tabular-nums">
          <Clock className="h-3.5 w-3.5 text-[#88948F]" aria-hidden="true" />
          {formatDueShort(assignment.dueDate, assignment.dueTime)}
        </span>

        <span className={`font-medium tabular-nums whitespace-nowrap shrink-0 ${statusTextClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Subtask progress track */}
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1EF]"
        role="progressbar"
        aria-valuenow={progressRatio}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${assignment.title} completion`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            assignment.status === 'submitted' ? 'bg-[#147458]' : 'bg-[#0F5C45]'
          }`}
          style={{ width: `${progressRatio}%` }}
        />
      </div>
    </article>
  );
};
