import React, { useState } from 'react';
import { ArrowRight, BookOpen, Plus, X } from 'lucide-react';
import { Assignment, Subject, SubjectColorKey } from '../types';
import { SUBJECT_PALETTES } from '../data/seedData';

interface SubjectsViewProps {
  subjects: Subject[];
  assignments: Assignment[];
  onSelectSubjectTasks: (subjectId: string) => void;
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
}

const COLOR_OPTIONS: { key: SubjectColorKey; label: string; swatch: string }[] = [
  { key: 'emerald', label: 'Forest Green', swatch: 'bg-[#147458]' },
  { key: 'indigo', label: 'Slate Indigo', swatch: 'bg-[#5A519A]' },
  { key: 'blue', label: 'Cobalt Blue', swatch: 'bg-[#286AD3]' },
  { key: 'amber', label: 'Warm Amber', swatch: 'bg-[#B86028]' },
  { key: 'teal', label: 'Deep Teal', swatch: 'bg-[#0E7490]' },
  { key: 'rose', label: 'Berry Rose', swatch: 'bg-[#B5475E]' },
];

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  assignments,
  onSelectSubjectTasks,
  onAddSubject,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [shortName, setShortName] = useState('');
  const [fullName, setFullName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [schedule, setSchedule] = useState('');
  const [colorKey, setColorKey] = useState<SubjectColorKey>('emerald');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !fullName.trim()) return;
    onAddSubject({
      code: code.trim().toUpperCase(),
      shortName: (shortName.trim() || code.trim()).toUpperCase(),
      fullName: fullName.trim(),
      instructor: instructor.trim() || 'Course Instructor',
      schedule: schedule.trim() || 'Schedule TBA',
      colorKey,
    });
    setCode('');
    setShortName('');
    setFullName('');
    setInstructor('');
    setSchedule('');
    setColorKey('emerald');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#16221E] sm:text-[28px]">
            Your subjects
          </h1>
          <p className="mt-1 text-sm text-[#65706B]">
            Courses, completion momentum, and active workload.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-2xl bg-[#0F5C45] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#0B4735] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="whitespace-nowrap">Add subject</span>
        </button>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {subjects.map((subject) => {
          const palette = SUBJECT_PALETTES[subject.colorKey];
          const subjectAssignments = assignments.filter((a) => a.subjectId === subject.id);
          const activeItems = subjectAssignments.filter((a) => a.status !== 'submitted');
          const completedCount = subjectAssignments.length - activeItems.length;
          const highPriorityCount = activeItems.filter((a) => a.priority === 'high').length;
          const completionPct =
            subjectAssignments.length > 0
              ? Math.round((completedCount / subjectAssignments.length) * 100)
              : 0;

          return (
            <article
              key={subject.id}
              className="flex flex-col justify-between rounded-3xl border border-[#E7EBE9] bg-white p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(22,34,30,0.05)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold tracking-wide ${palette.text}`}>
                    {subject.code} · {subject.shortName}
                  </span>
                  <span className="text-xs font-semibold text-[#5E6A65] tabular-nums">
                    {activeItems.length} active
                  </span>
                </div>

                <h2 className="mt-2 font-display text-lg font-bold text-[#16221E]">
                  {subject.fullName}
                </h2>

                <p className="mt-1 text-xs text-[#65706B]">
                  {subject.instructor} · {subject.schedule}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#5E6A65]">Course progress</span>
                    <span className="font-semibold text-[#16221E] tabular-nums">
                      {completedCount} of {subjectAssignments.length} ({completionPct}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#EEF1EF]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${palette.bar}`}
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#F0F3F1] pt-3.5">
                <span className="text-xs font-medium text-[#B85A3A] tabular-nums">
                  {highPriorityCount > 0
                    ? `${highPriorityCount} high priority due`
                    : 'No urgent high-priority tasks'}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectSubjectTasks(subject.id)}
                  className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-[#0F5C45] hover:text-[#0A3E2E] transition-colors whitespace-nowrap"
                >
                  View tasks
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#16221E]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add subject"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E4F2EC] text-[#0F5C45]">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="font-display text-lg font-bold text-[#16221E]">
                  Add a subject
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#5E6A65] hover:bg-[#F1F3F2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4742]">
                    Course code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3 py-2.5 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4742]">
                    Short label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ALGORITHMS"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3 py-2.5 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4742]">
                  Full course title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design and Analysis of Algorithms"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3 py-2.5 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4742]">
                    Instructor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Patel"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3 py-2.5 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4742]">
                    Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mon & Wed · 11 AM"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#DCE2DF] px-3 py-2.5 text-sm text-[#16221E] focus:border-[#0F5C45] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4742]">
                  Accent color
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setColorKey(opt.key)}
                      aria-label={opt.label}
                      aria-pressed={colorKey === opt.key}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform ${
                        colorKey === opt.key
                          ? 'scale-110 border-[#16221E]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <span className={`h-6 w-6 rounded-full ${opt.swatch}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[44px] flex-1 rounded-xl border border-[#DCE2DF] px-4 text-sm font-semibold text-[#46524D] hover:bg-[#F4F6F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 rounded-xl bg-[#0F5C45] px-4 text-sm font-semibold text-white hover:bg-[#0B4735]"
                >
                  Save subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
