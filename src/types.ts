export type SubjectColorKey = 'emerald' | 'indigo' | 'blue' | 'amber' | 'rose' | 'teal';

export interface Subject {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
  instructor: string;
  schedule: string;
  colorKey: SubjectColorKey;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted';

export type ReminderOption = 'none' | '30m' | '1h' | '3h' | '1d';

export interface Attachment {
  id: string;
  name: string;
  kind: string;
  sizeLabel: string;
  content: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm (24h)
  status: AssignmentStatus;
  priority: Priority;
  brief: string;
  subtasks: Subtask[];
  reminder: ReminderOption;
  attachments: Attachment[];
  completedAt?: string;
}

export type TabId = 'today' | 'tasks' | 'calendar' | 'subjects';

export type TaskSortOption = 'due_date' | 'priority' | 'progress';
