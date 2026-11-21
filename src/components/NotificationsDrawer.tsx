import React from 'react';
import { Bell, Clock, RotateCcw, X } from 'lucide-react';
import { Assignment, Subject } from '../types';
import { getReminderLabel, isOverdue, sortAssignments } from '../utils/dateUtils';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: Assignment[];
  subjects: Subject[];
  onSelectAssignment: (id: string) => void;
  onResetDemoData: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  assignments,
  subjects,
  onSelectAssignment,
  onResetDemoData,
}) => {
  if (!isOpen) return null;

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const upcomingNudges = sortAssignments(
    assignments.filter((a) => a.status !== 'submitted' && a.reminder !== 'none'),
    'priority'
  );
  const overdueItems = assignments.filter((a) => isOverdue(a));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#16221E]/35 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Reminders and notifications"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-[#F6F7F6] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5EAE7] bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E4F2EC] text-[#0F5C45]">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-[#16221E]">
                Upcoming nudges
              </h2>
              <p className="text-xs text-[#65706B]">
                {upcomingNudges.length} active reminders scheduled
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reminders"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5E6A65] hover:bg-[#F1F3F2] hover:text-[#16221E] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {overdueItems.length > 0 && (
            <div className="rounded-2xl bg-[#FEECEB] p-4">
              <p className="text-xs font-semibold text-[#B42318]">
                {overdueItems.length} overdue {overdueItems.length === 1 ? 'assignment' : 'assignments'}
              </p>
              <p className="mt-1 text-xs text-[#8E2A22]">
                Review past-due work to get back on track.
              </p>
            </div>
          )}

          {upcomingNudges.length === 0 ? (
            <div className="rounded-2xl border border-[#E7EBE9] bg-white p-6 text-center">
              <p className="font-display text-sm font-semibold text-[#16221E]">
                All caught up
              </p>
              <p className="mt-1 text-xs text-[#65706B]">
                You have no pending assignment reminders right now.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingNudges.map((item) => {
                const subj = subjectMap.get(item.subjectId);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectAssignment(item.id);
                      onClose();
                    }}
                    className="w-full rounded-2xl border border-[#E7EBE9] bg-white p-4 text-left transition-colors hover:border-[#0F5C45]/40 hover:bg-[#FCFDFC]"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#147458]">
                        {subj ? `${subj.code} · ${subj.shortName}` : 'Course'}
                      </span>
                      <span className="font-medium capitalize text-[#B85A3A]">
                        {item.priority} priority
                      </span>
                    </div>
                    <p className="mt-1 font-display text-sm font-semibold text-[#16221E]">
                      {item.title}
                    </p>
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#5E6A65]">
                      <Clock className="h-3.5 w-3.5 text-[#0F5C45]" aria-hidden="true" />
                      {getReminderLabel(item.dueDate, item.dueTime, item.reminder)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#E5EAE7] bg-white p-4">
          <button
            type="button"
            onClick={() => {
              onResetDemoData();
              onClose();
            }}
            className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#DCE2DF] bg-[#F8F9F8] px-4 py-2.5 text-xs font-medium text-[#46524D] hover:bg-[#EEF2F0] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset sample week data
          </button>
        </div>
      </div>
    </div>
  );
};
