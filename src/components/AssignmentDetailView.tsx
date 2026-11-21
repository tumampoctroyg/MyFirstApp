import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Flag,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import {
  Assignment,
  AssignmentStatus,
  Attachment,
  Priority,
  ReminderOption,
  Subject,
} from '../types';
import { SUBJECT_PALETTES } from '../data/seedData';
import {
  formatMonthDay,
  formatTime12h,
  getReminderLabel,
  getUrgencyLabel,
} from '../utils/dateUtils';

interface AssignmentDetailViewProps {
  assignment: Assignment;
  subject?: Subject;
  onClose: () => void;
  onToggleSubtask: (assignmentId: string, subtaskId: string) => void;
  onAddSubtask: (assignmentId: string, title: string) => void;
  onDeleteSubtask: (assignmentId: string, subtaskId: string) => void;
  onChangeStatus: (assignmentId: string, status: AssignmentStatus) => void;
  onChangePriority: (assignmentId: string, priority: Priority) => void;
  onChangeReminder: (assignmentId: string, reminder: ReminderOption) => void;
  onUpdateBrief: (assignmentId: string, brief: string) => void;
  onEditAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

const REMINDER_OPTIONS: { value: ReminderOption; label: string }[] = [
  { value: '30m', label: '30 mins before' },
  { value: '1h', label: '1 hour before' },
  { value: '3h', label: '3 hours before' },
  { value: '1d', label: '1 day before' },
  { value: 'none', label: 'No reminder' },
];

export const AssignmentDetailView: React.FC<AssignmentDetailViewProps> = ({
  assignment,
  subject,
  onClose,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onChangeStatus,
  onChangePriority,
  onChangeReminder,
  onUpdateBrief,
  onEditAssignment,
  onDeleteAssignment,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newStep, setNewStep] = useState('');
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [briefDraft, setBriefDraft] = useState(assignment.brief);

  React.useEffect(() => {
    setBriefDraft(assignment.brief);
    setIsEditingBrief(false);
    setMenuOpen(false);
    setShowReminderPicker(false);
  }, [assignment.id, assignment.brief]);

  const palette = subject ? SUBJECT_PALETTES[subject.colorKey] : SUBJECT_PALETTES.emerald;
  const urgency = getUrgencyLabel(assignment);

  const totalSteps = assignment.subtasks.length;
  const doneSteps = assignment.subtasks.filter((s) => s.completed).length;
  const stepRatio = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    onAddSubtask(assignment.id, newStep.trim());
    setNewStep('');
  };

  const handleSaveBrief = () => {
    onUpdateBrief(assignment.id, briefDraft.trim());
    setIsEditingBrief(false);
  };

  const isSubmitted = assignment.status === 'submitted';

  return (
    <div className="flex h-full flex-col bg-[#F6F7F6]">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E7EBE9] bg-[#F6F7F6]/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border border-[#E5EAE7] bg-white text-[#16221E] transition-colors hover:bg-[#FAFBF9]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="font-display text-sm font-semibold text-[#16221E]">
          Assignment details
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Assignment options"
            aria-expanded={menuOpen}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border border-[#E5EAE7] bg-white text-[#16221E] transition-colors hover:bg-[#FAFBF9]"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-30 w-44 rounded-2xl border border-[#E5EAE7] bg-white p-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEditAssignment(assignment);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#16221E] hover:bg-[#F4F6F5]"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#5E6A65]" />
                Edit assignment
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteAssignment(assignment.id);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#B42318] hover:bg-[#FEECEB]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete assignment
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 pb-28 sm:px-6">
        {/* Subject & Priority Header */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`text-xs font-bold tracking-wide ${palette.text}`}>
              {subject ? `${subject.code} · ${subject.shortName}` : 'COURSE'}
            </span>

            {/* Interactive Priority Switcher */}
            <div
              className="inline-flex items-center gap-1 rounded-xl bg-[#EEF2F0] p-1"
              role="group"
              aria-label="Assignment priority"
            >
              {(['high', 'medium', 'low'] as const).map((level) => {
                const active = assignment.priority === level;
                const activeClass =
                  level === 'high'
                    ? 'bg-[#FBECE4] text-[#B85A3A] shadow-sm'
                    : level === 'medium'
                      ? 'bg-[#FBF3E2] text-[#92621A] shadow-sm'
                      : 'bg-white text-[#16221E] shadow-sm';
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChangePriority(assignment.id, level)}
                    className={`inline-flex min-h-[28px] items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold capitalize transition-all ${
                      active ? activeClass : 'text-[#65706B] hover:text-[#16221E]'
                    }`}
                  >
                    {active && <Flag className="h-2.5 w-2.5" aria-hidden="true" />}
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <h1 className="mt-2.5 font-display text-2xl font-bold leading-tight tracking-tight text-[#16221E]">
            {assignment.title}
          </h1>
          <p className="mt-1 text-xs text-[#65706B]">
            {subject ? subject.fullName : 'General Coursework'}
          </p>
        </div>

        {/* Due & Status Card */}
        <div className="rounded-2xl border border-[#E7EBE9] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#16221E]">
              <Calendar className="h-4 w-4 text-[#5E6A65]" aria-hidden="true" />
              {urgency.label}
            </span>
            <span className="text-xs font-semibold text-[#B85A3A] tabular-nums">
              {formatMonthDay(assignment.dueDate)} · {formatTime12h(assignment.dueTime)}
            </span>
          </div>

          <div className="my-3 h-px bg-[#F0F3F1]" />

          <div className="flex items-center justify-between gap-3">
            <label htmlFor="detail-status-select" className="text-xs font-medium text-[#65706B]">
              Status
            </label>
            <select
              id="detail-status-select"
              value={assignment.status}
              onChange={(e) =>
                onChangeStatus(assignment.id, e.target.value as AssignmentStatus)
              }
              className={`min-h-[34px] cursor-pointer rounded-xl px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45] ${
                assignment.status === 'submitted'
                  ? 'bg-[#E4F2EC] text-[#147458]'
                  : assignment.status === 'in_progress'
                    ? 'bg-[#E4F2EC] text-[#147458]'
                    : 'bg-[#EFF2F0] text-[#525E59]'
              }`}
            >
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>

        {/* The Brief */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-[#16221E]">The brief</h2>
            {!isEditingBrief && (
              <button
                type="button"
                onClick={() => setIsEditingBrief(true)}
                className="text-xs font-medium text-[#0F5C45] hover:underline"
              >
                Edit notes
              </button>
            )}
          </div>

          {isEditingBrief ? (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={briefDraft}
                onChange={(e) => setBriefDraft(e.target.value)}
                className="w-full rounded-2xl border border-[#0F5C45] bg-white p-3 text-sm leading-relaxed text-[#16221E] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBriefDraft(assignment.brief);
                    setIsEditingBrief(false);
                  }}
                  className="rounded-xl px-3 py-1.5 text-xs font-medium text-[#5E6A65] hover:bg-[#EAECEB]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBrief}
                  className="rounded-xl bg-[#0F5C45] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0B4735]"
                >
                  Save brief
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[#46524D]">
              {assignment.brief || 'No assignment brief added yet.'}
            </p>
          )}
        </section>

        {/* Break it down (Subtasks) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-[#16221E]">
              Break it down
            </h2>
            <span className="text-xs font-semibold text-[#147458] tabular-nums">
              {doneSteps} of {totalSteps} done
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E3E8E5]">
            <div
              className="h-full rounded-full bg-[#0F5C45] transition-all duration-300"
              style={{ width: `${stepRatio}%` }}
            />
          </div>

          <div className="space-y-2">
            {assignment.subtasks.map((step) => (
              <div
                key={step.id}
                className="group flex items-center justify-between gap-2 rounded-2xl border border-[#E7EBE9] bg-white px-3.5 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => onToggleSubtask(assignment.id, step.id)}
                  className="flex min-h-[36px] flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      step.completed
                        ? 'border-[#0F5C45] bg-[#0F5C45] text-white'
                        : 'border-[#C4CCC8] bg-white'
                    }`}
                  >
                    {step.completed && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  </span>
                  <span
                    className={`text-sm transition-colors ${
                      step.completed ? 'text-[#88948F] line-through' : 'text-[#16221E]'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteSubtask(assignment.id, step.id)}
                  aria-label={`Remove step ${step.title}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9CA6A1] opacity-0 transition-opacity hover:bg-[#F4F6F5] hover:text-[#B42318] group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddStepSubmit} className="flex gap-2">
            <input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Add a smaller step..."
              aria-label="New subtask step"
              className="min-h-[42px] flex-1 rounded-xl border border-[#DCE2DF] bg-white px-3.5 text-sm text-[#16221E] placeholder:text-[#88948F] focus:border-[#0F5C45] focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Add step"
              className="flex min-h-[42px] items-center justify-center gap-1 rounded-xl border border-[#DCE2DF] bg-white px-3.5 text-xs font-semibold text-[#16221E] hover:bg-[#F4F6F5]"
            >
              <Plus className="h-4 w-4 text-[#0F5C45]" />
              Add
            </button>
          </form>
        </section>

        {/* Reminder Nudge Card */}
        <section>
          <button
            type="button"
            onClick={() => setShowReminderPicker((p) => !p)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#E4F2EC] p-4 text-left transition-colors hover:bg-[#D8ECE3]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#0F5C45]">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#114B39]">
                  A nudge before it’s due
                </p>
                <p className="mt-0.5 text-xs text-[#1D6B53]">
                  {getReminderLabel(assignment.dueDate, assignment.dueTime, assignment.reminder)}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`h-4 w-4 shrink-0 text-[#114B39] transition-transform ${
                showReminderPicker ? 'rotate-90' : ''
              }`}
            />
          </button>

          {showReminderPicker && (
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-[#E7EBE9] bg-white p-3 sm:grid-cols-3">
              {REMINDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChangeReminder(assignment.id, opt.value);
                    setShowReminderPicker(false);
                  }}
                  className={`min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                    assignment.reminder === opt.value
                      ? 'bg-[#0F5C45] text-white'
                      : 'bg-[#F4F6F5] text-[#46524D] hover:bg-[#E7ECE9]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Attachments */}
        {assignment.attachments.length > 0 && (
          <section className="space-y-2">
            {assignment.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#E7EBE9] bg-white px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4F6F5] text-[#5E6A65]">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#16221E]">
                      {att.name}
                    </p>
                    <p className="text-[11px] text-[#65706B]">
                      {att.kind} · {att.sizeLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAttachment(att)}
                  className="min-h-[36px] shrink-0 rounded-xl px-3 text-xs font-semibold text-[#0F5C45] hover:bg-[#E4F2EC] transition-colors"
                >
                  View
                </button>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Bottom Sticky Action CTA */}
      <div className="sticky bottom-0 border-t border-[#E7EBE9] bg-[#F6F7F6]/95 p-4 backdrop-blur-md">
        {isSubmitted ? (
          <button
            type="button"
            onClick={() => onChangeStatus(assignment.id, 'in_progress')}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-[#0F5C45] bg-white px-5 py-3 text-sm font-semibold text-[#0F5C45] transition-colors hover:bg-[#E4F2EC]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reopen assignment
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChangeStatus(assignment.id, 'submitted')}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#0F5C45] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0B4735]"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Mark as submitted
          </button>
        )}
      </div>

      {/* Reference Attachment Modal */}
      {activeAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#16221E]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={activeAttachment.name}
          onClick={() => setActiveAttachment(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#0F5C45]">
                  {activeAttachment.kind} · {activeAttachment.sizeLabel}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#16221E]">
                  {activeAttachment.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAttachment(null)}
                aria-label="Close reference"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#5E6A65] hover:bg-[#F1F3F2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#F6F7F6] p-4 font-sans text-xs leading-relaxed text-[#3C4742]">
              {activeAttachment.content}
            </pre>
            <button
              type="button"
              onClick={() => setActiveAttachment(null)}
              className="mt-4 min-h-[44px] w-full rounded-xl bg-[#162621] text-xs font-semibold text-white hover:bg-[#0F5C45]"
            >
              Done reading
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
