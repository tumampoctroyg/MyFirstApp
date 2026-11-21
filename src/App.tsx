import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Home,
  ListTodo,
  Plus,
} from 'lucide-react';
import {
  Assignment,
  AssignmentStatus,
  Priority,
  ReminderOption,
  Subject,
  TabId,
} from './types';
import { SEED_ASSIGNMENTS, SEED_SUBJECTS } from './data/seedData';
import { TODAY_ISO } from './utils/dateUtils';
import { TodayView } from './components/TodayView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { SubjectsView } from './components/SubjectsView';
import { AssignmentDetailView } from './components/AssignmentDetailView';
import { AddAssignmentModal } from './components/AddAssignmentModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';

const STORAGE_KEYS = {
  assignments: 'cadence_assignments_v1',
  subjects: 'cadence_subjects_v1',
};

function loadInitialState<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    loadInitialState(STORAGE_KEYS.assignments, SEED_ASSIGNMENTS)
  );
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadInitialState(STORAGE_KEYS.subjects, SEED_SUBJECTS)
  );

  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const [tasksPriorityFilter, setTasksPriorityFilter] = useState<Priority | 'all'>('all');
  const [tasksSubjectFilter, setTasksSubjectFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultDate, setAddModalDefaultDate] = useState(TODAY_ISO);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(assignments));
    } catch {
      // Ignore storage quota errors
    }
  }, [assignments]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects));
    } catch {
      // Ignore storage quota errors
    }
  }, [subjects]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const selectedAssignment = useMemo(
    () => assignments.find((a) => a.id === selectedAssignmentId) ?? null,
    [assignments, selectedAssignmentId]
  );

  const activeCount = useMemo(
    () => assignments.filter((a) => a.status !== 'submitted').length,
    [assignments]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Handlers
  const handleToggleSubtask = (assignmentId: string, subtaskId: string) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;
        const updatedSubtasks = asg.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const anyCompleted = updatedSubtasks.some((st) => st.completed);
        let nextStatus = asg.status;
        if (asg.status === 'not_started' && anyCompleted) {
          nextStatus = 'in_progress';
        }
        return {
          ...asg,
          status: nextStatus,
          subtasks: updatedSubtasks,
        };
      })
    );
  };

  const handleAddSubtask = (assignmentId: string, title: string) => {
    setAssignments((prev) =>
      prev.map((asg) =>
        asg.id === assignmentId
          ? {
              ...asg,
              subtasks: [
                ...asg.subtasks,
                { id: `st-${Date.now()}`, title, completed: false },
              ],
            }
          : asg
      )
    );
  };

  const handleDeleteSubtask = (assignmentId: string, subtaskId: string) => {
    setAssignments((prev) =>
      prev.map((asg) =>
        asg.id === assignmentId
          ? {
              ...asg,
              subtasks: asg.subtasks.filter((st) => st.id !== subtaskId),
            }
          : asg
      )
    );
  };

  const handleChangeStatus = (assignmentId: string, status: AssignmentStatus) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;
        return {
          ...asg,
          status,
          completedAt: status === 'submitted' ? TODAY_ISO : undefined,
        };
      })
    );
    if (status === 'submitted') {
      showToast('Assignment marked as submitted');
    } else if (status === 'in_progress') {
      showToast('Assignment set to in progress');
    } else {
      showToast('Assignment set to not started');
    }
  };

  const handleChangePriority = (assignmentId: string, priority: Priority) => {
    setAssignments((prev) =>
      prev.map((asg) => (asg.id === assignmentId ? { ...asg, priority } : asg))
    );
    showToast(`Priority updated to ${priority}`);
  };

  const handleChangeReminder = (assignmentId: string, reminder: ReminderOption) => {
    setAssignments((prev) =>
      prev.map((asg) => (asg.id === assignmentId ? { ...asg, reminder } : asg))
    );
    showToast(reminder === 'none' ? 'Reminder removed' : 'Reminder updated');
  };

  const handleUpdateBrief = (assignmentId: string, brief: string) => {
    setAssignments((prev) =>
      prev.map((asg) => (asg.id === assignmentId ? { ...asg, brief } : asg))
    );
    showToast('Assignment notes saved');
  };

  const handleSaveAssignment = (data: {
    id?: string;
    title: string;
    subjectId: string;
    dueDate: string;
    dueTime: string;
    priority: Priority;
    brief: string;
    subtasks: string[];
    reminder: ReminderOption;
  }) => {
    if (data.id) {
      setAssignments((prev) =>
        prev.map((asg) => {
          if (asg.id !== data.id) return asg;
          const existingMap = new Map(asg.subtasks.map((s) => [s.title, s]));
          return {
            ...asg,
            title: data.title,
            subjectId: data.subjectId,
            dueDate: data.dueDate,
            dueTime: data.dueTime,
            priority: data.priority,
            brief: data.brief,
            reminder: data.reminder,
            subtasks: data.subtasks.map((title, idx) => {
              const prevStep = existingMap.get(title);
              return (
                prevStep ?? {
                  id: `st-${Date.now()}-${idx}`,
                  title,
                  completed: false,
                }
              );
            }),
          };
        })
      );
      showToast('Assignment updated');
      setEditingAssignment(null);
    } else {
      const newAsg: Assignment = {
        id: `asg-${Date.now()}`,
        title: data.title,
        subjectId: data.subjectId,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        status: 'not_started',
        priority: data.priority,
        brief: data.brief,
        subtasks: data.subtasks.map((title, idx) => ({
          id: `st-${Date.now()}-${idx}`,
          title,
          completed: false,
        })),
        reminder: data.reminder,
        attachments: [],
      };
      setAssignments((prev) => [newAsg, ...prev]);
      showToast('Assignment added');
    }
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    if (selectedAssignmentId === assignmentId) {
      setSelectedAssignmentId(null);
    }
    showToast('Assignment removed');
  };

  const handleAddSubject = (subjData: Omit<Subject, 'id'>) => {
    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      ...subjData,
    };
    setSubjects((prev) => [...prev, newSubj]);
    showToast(`${newSubj.code} added to subjects`);
  };

  const handleResetDemoData = () => {
    setAssignments(SEED_ASSIGNMENTS);
    setSubjects(SEED_SUBJECTS);
    setSelectedAssignmentId(null);
    showToast('Sample week restored');
  };

  const openAddModal = (dateIso = TODAY_ISO) => {
    setEditingAssignment(null);
    setAddModalDefaultDate(dateIso);
    setIsAddModalOpen(true);
  };

  const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F6] text-[#16221E] lg:flex">
      {/* Desktop Left Navigation Rail */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:justify-between lg:border-r lg:border-[#E5EAE7] lg:bg-white lg:px-5 lg:py-7">
        <div className="space-y-8">
          <div>
            <div className="font-display text-xl font-bold tracking-tight text-[#0F5C45]">
              Cadence
            </div>
            <p className="mt-0.5 text-xs text-[#65706B]">Nicole · Fall 2026</p>
          </div>

          <nav aria-label="Primary navigation" className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'tasks') {
                      setTasksPriorityFilter('all');
                      setTasksSubjectFilter('all');
                    }
                  }}
                  className={`flex w-full min-h-[44px] items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#E4F2EC] text-[#0F5C45]'
                      : 'text-[#525E59] hover:bg-[#F4F6F5] hover:text-[#16221E]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </span>
                  {item.id === 'tasks' && activeCount > 0 && (
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                        isActive
                          ? 'bg-[#0F5C45] text-white'
                          : 'bg-[#EFF2F0] text-[#525E59]'
                      }`}
                    >
                      {activeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => openAddModal(TODAY_ISO)}
          className="flex w-full min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-[#162621] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0F5C45]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add assignment
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 lg:pb-12">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {activeTab === 'today' && (
            <TodayView
              assignments={assignments}
              subjects={subjects}
              selectedAssignmentId={selectedAssignmentId}
              onSelectAssignment={(id) => setSelectedAssignmentId(id)}
              onChangePriority={handleChangePriority}
              onOpenAddModal={() => openAddModal(TODAY_ISO)}
              onNavigateToTasks={(filter) => {
                setTasksPriorityFilter(filter?.priority ?? 'all');
                setTasksSubjectFilter('all');
                setActiveTab('tasks');
              }}
              onNavigateToCalendar={() => setActiveTab('calendar')}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              assignments={assignments}
              subjects={subjects}
              selectedAssignmentId={selectedAssignmentId}
              onSelectAssignment={(id) => setSelectedAssignmentId(id)}
              onChangePriority={handleChangePriority}
              onOpenAddModal={() => openAddModal(TODAY_ISO)}
              initialPriorityFilter={tasksPriorityFilter}
              initialSubjectFilter={tasksSubjectFilter}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              assignments={assignments}
              subjects={subjects}
              onSelectAssignment={(id) => setSelectedAssignmentId(id)}
              onOpenAddModalForDate={(iso) => openAddModal(iso)}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              assignments={assignments}
              onSelectSubjectTasks={(subjectId) => {
                setTasksSubjectFilter(subjectId);
                setTasksPriorityFilter('all');
                setActiveTab('tasks');
              }}
              onAddSubject={handleAddSubject}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar (hidden when full-screen detail is open on mobile) */}
      {!selectedAssignment && (
        <nav
          aria-label="Mobile navigation"
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E5EAE7] bg-white/95 backdrop-blur-md lg:hidden"
        >
          <div className="mx-auto grid h-16 max-w-lg grid-cols-4 items-center px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'tasks') {
                      setTasksPriorityFilter('all');
                      setTasksSubjectFilter('all');
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex min-h-[48px] flex-col items-center justify-center gap-1"
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? 'bg-[#E4F2EC] text-[#0F5C45]'
                        : 'text-[#65706B]'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span
                    className={`text-[11px] font-medium tracking-tight ${
                      isActive ? 'font-semibold text-[#0F5C45]' : 'text-[#65706B]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Assignment Detail View (Full Screen on Mobile, Slide-Over Drawer on Desktop) */}
      {selectedAssignment && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[#16221E]/35 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Assignment details"
          onClick={() => setSelectedAssignmentId(null)}
        >
          <div
            className="h-full w-full bg-[#F6F7F6] shadow-2xl lg:max-w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <AssignmentDetailView
              assignment={selectedAssignment}
              subject={subjectMap.get(selectedAssignment.subjectId)}
              onClose={() => setSelectedAssignmentId(null)}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtask={handleAddSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              onChangeStatus={handleChangeStatus}
              onChangePriority={handleChangePriority}
              onChangeReminder={handleChangeReminder}
              onUpdateBrief={handleUpdateBrief}
              onEditAssignment={(asg) => {
                setEditingAssignment(asg);
                setIsAddModalOpen(true);
              }}
              onDeleteAssignment={handleDeleteAssignment}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Assignment Modal */}
      <AddAssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAssignment(null);
        }}
        subjects={subjects}
        defaultDate={addModalDefaultDate}
        editingAssignment={editingAssignment}
        onSave={handleSaveAssignment}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        assignments={assignments}
        subjects={subjects}
        onSelectAssignment={(id) => setSelectedAssignmentId(id)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Confirmation Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#162621] px-4 py-2.5 text-xs font-semibold text-white shadow-lg lg:bottom-6"
        >
          <CheckCircle2 className="h-4 w-4 text-[#D7EE9A]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
