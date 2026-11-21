import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Plus, Search } from 'lucide-react';
import { Assignment, Priority, Subject, TaskSortOption } from '../types';
import { AssignmentCard } from './AssignmentCard';
import { isDueToday, isOverdue, sortAssignments } from '../utils/dateUtils';

interface TasksViewProps {
  assignments: Assignment[];
  subjects: Subject[];
  selectedAssignmentId: string | null;
  onSelectAssignment: (id: string) => void;
  onChangePriority: (id: string, priority: Priority) => void;
  onOpenAddModal: () => void;
  initialPriorityFilter?: Priority | 'all';
  initialSubjectFilter?: string;
}

export const TasksView: React.FC<TasksViewProps> = ({
  assignments,
  subjects,
  selectedAssignmentId,
  onSelectAssignment,
  onChangePriority,
  onOpenAddModal,
  initialPriorityFilter = 'all',
  initialSubjectFilter = 'all',
}) => {
  const [statusTab, setStatusTab] = useState<'active' | 'completed'>('active');
  const [subjectFilter, setSubjectFilter] = useState<string>(initialSubjectFilter);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>(initialPriorityFilter);
  const [sortBy, setSortBy] = useState<TaskSortOption>('priority');
  const [searchQuery, setSearchQuery] = useState('');

  // Keep synced when parent routes with a preset filter
  React.useEffect(() => {
    setPriorityFilter(initialPriorityFilter);
  }, [initialPriorityFilter]);

  React.useEffect(() => {
    setSubjectFilter(initialSubjectFilter);
  }, [initialSubjectFilter]);

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const activeCount = useMemo(
    () => assignments.filter((a) => a.status !== 'submitted').length,
    [assignments]
  );
  const completedCount = useMemo(
    () => assignments.filter((a) => a.status === 'submitted').length,
    [assignments]
  );

  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const byTab = assignments.filter((a) =>
      statusTab === 'active' ? a.status !== 'submitted' : a.status === 'submitted'
    );
    const bySubject =
      subjectFilter === 'all' ? byTab : byTab.filter((a) => a.subjectId === subjectFilter);
    const byPriority =
      priorityFilter === 'all'
        ? bySubject
        : bySubject.filter((a) => a.priority === priorityFilter);
    const byQuery = query
      ? byPriority.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.brief.toLowerCase().includes(query) ||
            (subjectMap.get(a.subjectId)?.code.toLowerCase().includes(query) ?? false)
        )
      : byPriority;

    return sortAssignments(byQuery, sortBy);
  }, [assignments, statusTab, subjectFilter, priorityFilter, searchQuery, sortBy, subjectMap]);

  // Grouping helper depending on active sort mode
  const groupedSections = useMemo(() => {
    if (statusTab === 'completed') {
      return [
        {
          id: 'completed',
          title: 'Completed assignments',
          items: filteredList,
        },
      ];
    }

    if (sortBy === 'priority') {
      const high = filteredList.filter((a) => a.priority === 'high');
      const medium = filteredList.filter((a) => a.priority === 'medium');
      const low = filteredList.filter((a) => a.priority === 'low');
      return [
        { id: 'high', title: 'High priority', items: high },
        { id: 'medium', title: 'Medium priority', items: medium },
        { id: 'low', title: 'Low priority', items: low },
      ].filter((g) => g.items.length > 0);
    }

    // Due date / progress grouping matching wireframe
    const overdue = filteredList.filter((a) => isOverdue(a));
    const dueToday = filteredList.filter((a) => isDueToday(a.dueDate));
    const comingUp = filteredList.filter((a) => !isOverdue(a) && !isDueToday(a.dueDate));
    return [
      { id: 'overdue', title: 'Overdue', items: overdue },
      { id: 'today', title: 'Due today', items: dueToday },
      { id: 'upcoming', title: 'Coming up', items: comingUp },
    ].filter((g) => g.items.length > 0);
  }, [filteredList, sortBy, statusTab]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#16221E] sm:text-[28px]">
            Your assignments
          </h1>
          <p className="mt-1 text-sm text-[#65706B]">
            Prioritized deadlines and clear next steps.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          aria-label="Add new assignment"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#0F5C45] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4735] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45]"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline whitespace-nowrap">Add assignment</span>
        </button>
      </div>

      {/* Active / Completed Segmented Control */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#ECEFEC] p-1 sm:max-w-sm">
        <button
          type="button"
          onClick={() => setStatusTab('active')}
          className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-semibold transition-all tabular-nums whitespace-nowrap ${
            statusTab === 'active'
              ? 'bg-[#162621] text-white shadow-sm'
              : 'text-[#525E59] hover:text-[#16221E]'
          }`}
        >
          Active · {activeCount}
        </button>
        <button
          type="button"
          onClick={() => setStatusTab('completed')}
          className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-semibold transition-all tabular-nums whitespace-nowrap ${
            statusTab === 'completed'
              ? 'bg-[#162621] text-white shadow-sm'
              : 'text-[#525E59] hover:text-[#16221E]'
          }`}
        >
          Completed · {completedCount}
        </button>
      </div>

      {/* Filters, Search & Priority Sort Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E7EBE9] bg-white p-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject dropdown */}
          <select
            aria-label="Filter by subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="min-h-[40px] rounded-xl border border-[#E2E7E4] bg-[#F8F9F8] px-3 text-xs font-medium text-[#16221E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45]"
          >
            <option value="all">All subjects</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.code} · {subj.shortName}
              </option>
            ))}
          </select>

          {/* Priority Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-[#F4F6F5] p-1" role="group" aria-label="Filter by priority">
            {(['all', 'high', 'medium', 'low'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setPriorityFilter(level)}
                className={`min-h-[32px] rounded-lg px-2.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  priorityFilter === level
                    ? 'bg-white text-[#16221E] shadow-sm'
                    : 'text-[#65706B] hover:text-[#16221E]'
                }`}
              >
                {level === 'all' ? 'All priorities' : level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-44">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#88948F]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              aria-label="Search assignments"
              className="min-h-[40px] w-full rounded-xl border border-[#E2E7E4] bg-[#F8F9F8] pl-8 pr-3 text-xs text-[#16221E] placeholder:text-[#88948F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45]"
            />
          </div>

          <div className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E2E7E4] bg-[#F8F9F8] px-3">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#5E6A65]" aria-hidden="true" />
            <select
              aria-label="Sort assignments by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TaskSortOption)}
              className="bg-transparent text-xs font-medium text-[#16221E] focus-visible:outline-none"
            >
              <option value="priority">Sort: Priority</option>
              <option value="due_date">Sort: Due date</option>
              <option value="progress">Sort: Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Assignment List */}
      {groupedSections.length === 0 ? (
        <div className="rounded-3xl border border-[#E7EBE9] bg-white p-8 text-center">
          <p className="font-display text-base font-semibold text-[#16221E]">
            No assignments match these filters
          </p>
          <p className="mt-1 text-xs text-[#65706B]">
            Try clearing your filters or create a new assignment.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(subjectFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSubjectFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
                className="min-h-[40px] rounded-xl border border-[#DCE2DF] px-4 py-2 text-xs font-semibold text-[#16221E] hover:bg-[#F4F6F5]"
              >
                Clear filters
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="min-h-[40px] rounded-xl bg-[#0F5C45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B4735]"
            >
              Add assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSections.map((group) => (
            <section key={group.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#16221E]">
                  {group.title}
                </h2>
                <span className="text-xs font-medium text-[#65706B] tabular-nums">
                  {group.items.length} {group.items.length === 1 ? 'assignment' : 'assignments'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {group.items.map((asg) => (
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
