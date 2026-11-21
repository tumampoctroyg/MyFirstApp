import React, { useEffect, useState } from 'react';
import { Flag, Plus, X } from 'lucide-react';
import {
  Assignment,
  Priority,
  ReminderOption,
  Subject,
} from '../types';
import { TODAY_ISO } from '../utils/dateUtils';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  defaultDate?: string;
  editingAssignment?: Assignment | null;
  onSave: (data: {
    id?: string;
    title: string;
    subjectId: string;
    dueDate: string;
    dueTime: string;
    priority: Priority;
    brief: string;
    subtasks: string[];
    reminder: ReminderOption;
  }) => void;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  isOpen,
  onClose,
  subjects,
  defaultDate = TODAY_ISO,
  editingAssignment = null,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [dueDate, setDueDate] = useState(defaultDate);
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('high');
  const [brief, setBrief] = useState('');
  const [subtaskText, setSubtaskText] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [reminder, setReminder] = useState<ReminderOption>('1h');

  useEffect(() => {
    if (!isOpen) return;
    if (editingAssignment) {
      setTitle(editingAssignment.title);
      setSubjectId(editingAssignment.subjectId);
      setDueDate(editingAssignment.dueDate);
      setDueTime(editingAssignment.dueTime);
      setPriority(editingAssignment.priority);
      setBrief(editingAssignment.brief);
      setSubtasks(editingAssignment.subtasks.map((s) => s.title));
      setReminder(editingAssignment.reminder);
    } else {
      setTitle('');
      setSubjectId(subjects[0]?.id ?? '');
      setDueDate(defaultDate);
      setDueTime('23:59');
      setPriority('high');
      setBrief('');
      setSubtasks([]);
      setReminder('1h');
    }
    setSubtaskText('');
  }, [isOpen, editingAssignment, defaultDate, subjects]);

  if (!isOpen) return null;

  const handleAddSubtaskDraft = () => {
    if (!subtaskText.trim()) return;
    setSubtasks((prev) => [...prev, subtaskText.trim()]);
    setSubtaskText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;
    onSave({
      id: editingAssignment?.id,
      title: title.trim(),
      subjectId,
      dueDate,
      dueTime,
      priority,
      brief: brief.trim(),
      subtasks,
      reminder,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#16221E]/45 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editingAssignment ? 'Edit assignment' : 'Add assignment'}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#16221E]">
              {editingAssignment ? 'Edit assignment' : 'New assignment'}
            </h2>
            <p className="text-xs text-[#65706B]">
              Set deadline, priority level, and small steps to stay on track.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#5E6A65] hover:bg-[#F1F3F2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="asg-title" className="block text-xs font-semibold text-[#3C4742]">
              Assignment title
            </label>
            <input
              id="asg-title"
              type="text"
              required
              placeholder="e.g. Usability lab report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3.5 py-2.5 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="asg-subject" className="block text-xs font-semibold text-[#3C4742]">
                Subject
              </label>
              <select
                id="asg-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] bg-white px-3 py-2.5 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.code} · {subj.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#3C4742]">
                Priority level
              </span>
              <div
                className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-xl bg-[#F4F6F5] p-1"
                role="group"
                aria-label="Select priority"
              >
                {(['high', 'medium', 'low'] as const).map((level) => {
                  const selected = priority === level;
                  const activeClasses =
                    level === 'high'
                      ? 'bg-[#FBECE4] text-[#B85A3A] shadow-sm'
                      : level === 'medium'
                        ? 'bg-[#FBF3E2] text-[#92621A] shadow-sm'
                        : 'bg-white text-[#16221E] shadow-sm';
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`inline-flex min-h-[34px] items-center justify-center gap-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        selected ? activeClasses : 'text-[#65706B] hover:text-[#16221E]'
                      }`}
                    >
                      {selected && <Flag className="h-3 w-3" aria-hidden="true" />}
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="asg-date" className="block text-xs font-semibold text-[#3C4742]">
                Due date
              </label>
              <input
                id="asg-date"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3 py-2.5 text-sm text-[#16221E] tabular-nums focus:border-[#0F5C45] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="asg-time" className="block text-xs font-semibold text-[#3C4742]">
                Due time
              </label>
              <input
                id="asg-time"
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3 py-2.5 text-sm text-[#16221E] tabular-nums focus:border-[#0F5C45] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="asg-brief" className="block text-xs font-semibold text-[#3C4742]">
              The brief
            </label>
            <textarea
              id="asg-brief"
              rows={2}
              placeholder="Summarize requirements or key deliverables..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3.5 py-2 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
            />
          </div>

          {/* Subtasks builder */}
          <div>
            <label className="block text-xs font-semibold text-[#3C4742]">
              Break it down (optional steps)
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                placeholder="e.g. Draft outline"
                value={subtaskText}
                onChange={(e) => setSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtaskDraft();
                  }
                }}
                className="flex-1 rounded-xl border border-[#DCE2DF] px-3.5 py-2 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtaskDraft}
                className="flex min-h-[40px] items-center gap-1 rounded-xl border border-[#DCE2DF] px-3 text-xs font-semibold text-[#16221E] hover:bg-[#F4F6F5]"
              >
                <Plus className="h-3.5 w-3.5 text-[#0F5C45]" />
                Add
              </button>
            </div>
            {subtasks.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {subtasks.map((st, idx) => (
                  <li
                    key={`${st}-${idx}`}
                    className="flex items-center justify-between rounded-xl bg-[#F6F7F6] px-3 py-1.5 text-xs text-[#16221E]"
                  >
                    <span>{st}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSubtasks((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label={`Remove ${st}`}
                      className="text-[#88948F] hover:text-[#B42318]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="asg-reminder" className="block text-xs font-semibold text-[#3C4742]">
              Reminder nudge
            </label>
            <select
              id="asg-reminder"
              value={reminder}
              onChange={(e) => setReminder(e.target.value as ReminderOption)}
              className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] bg-white px-3 py-2.5 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
            >
              <option value="30m">30 mins before due</option>
              <option value="1h">1 hour before due</option>
              <option value="3h">3 hours before due</option>
              <option value="1d">1 day before due</option>
              <option value="none">No reminder</option>
            </select>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] flex-1 rounded-2xl border border-[#DCE2DF] px-4 text-sm font-semibold text-[#46524D] hover:bg-[#F4F6F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[46px] flex-1 rounded-2xl bg-[#0F5C45] px-4 text-sm font-semibold text-white hover:bg-[#0B4735]"
            >
              {editingAssignment ? 'Save changes' : 'Create assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
