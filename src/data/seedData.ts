import { Assignment, Subject, SubjectColorKey } from '../types';

export const SUBJECT_PALETTES: Record<
  SubjectColorKey,
  {
    text: string;
    softBg: string;
    bar: string;
    dot: string;
  }
> = {
  emerald: {
    text: 'text-[#147458]',
    softBg: 'bg-[#E5F2EC]',
    bar: 'bg-[#147458]',
    dot: 'bg-[#147458]',
  },
  indigo: {
    text: 'text-[#5A519A]',
    softBg: 'bg-[#EEECF8]',
    bar: 'bg-[#5A519A]',
    dot: 'bg-[#5A519A]',
  },
  blue: {
    text: 'text-[#286AD3]',
    softBg: 'bg-[#E8F0FC]',
    bar: 'bg-[#286AD3]',
    dot: 'bg-[#2B6EDB]',
  },
  amber: {
    text: 'text-[#B86028]',
    softBg: 'bg-[#FBEFE6]',
    bar: 'bg-[#B86028]',
    dot: 'bg-[#B86028]',
  },
  rose: {
    text: 'text-[#B5475E]',
    softBg: 'bg-[#FBECEF]',
    bar: 'bg-[#B5475E]',
    dot: 'bg-[#B5475E]',
  },
  teal: {
    text: 'text-[#0E7490]',
    softBg: 'bg-[#E6F4F7]',
    bar: 'bg-[#0E7490]',
    dot: 'bg-[#0E7490]',
  },
};

export const SEED_SUBJECTS: Subject[] = [
  {
    id: 'subj-it211',
    code: 'IT211',
    shortName: 'HCI',
    fullName: 'Introduction to Human Computer Interaction',
    instructor: 'Prof. Elena Navarro',
    schedule: 'Tue & Thu · 10:30 AM',
    colorKey: 'emerald',
  },
  {
    id: 'subj-it214',
    code: 'IT214',
    shortName: 'DATABASE SYSTEMS',
    fullName: 'Database Management Systems',
    instructor: 'Dr. Marcus Chen',
    schedule: 'Mon & Wed · 1:00 PM',
    colorKey: 'indigo',
  },
  {
    id: 'subj-it212',
    code: 'IT212',
    shortName: 'PROGRAMMING',
    fullName: 'Web & API Systems Programming',
    instructor: 'Engr. Sofia Alvarez',
    schedule: 'Tue & Thu · 2:30 PM',
    colorKey: 'blue',
  },
  {
    id: 'subj-ge',
    code: 'GE',
    shortName: 'SCIENCE & TECHNOLOGY',
    fullName: 'Science, Technology & Society',
    instructor: 'Dr. Julian Reyes',
    schedule: 'Fri · 9:00 AM',
    colorKey: 'amber',
  },
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  // Active 4 (matches wireframe)
  {
    id: 'asg-1',
    title: 'Heuristic evaluation report',
    subjectId: 'subj-it211',
    dueDate: '2026-11-21',
    dueTime: '21:00',
    status: 'in_progress',
    priority: 'high',
    brief:
      "Evaluate an app using Nielsen's 10 usability heuristics. Document issues and recommend improvements.",
    subtasks: [
      { id: 'st-1', title: 'Choose an app to evaluate', completed: true },
      { id: 'st-2', title: 'Review the 10 heuristics', completed: true },
      { id: 'st-3', title: 'Capture issues & recommendations', completed: false },
      { id: 'st-4', title: 'Compile and submit the report', completed: false },
    ],
    reminder: '1h',
    attachments: [
      {
        id: 'att-1',
        name: 'Evaluation rubric.pdf',
        kind: 'Reference',
        sizeLabel: '240 KB',
        content:
          'Grading Breakdown (100 pts):\n1. App selection & user task scope (15 pts)\n2. Heuristic violations with severity ratings 0–4 (40 pts)\n3. Annotated screenshots & evidence (25 pts)\n4. Actionable redesign recommendations (20 pts)\n\nSubmit as a single PDF before 9:00 PM.',
      },
    ],
  },
  {
    id: 'asg-2',
    title: 'Normalization worksheet',
    subjectId: 'subj-it214',
    dueDate: '2026-11-21',
    dueTime: '23:59',
    status: 'not_started',
    priority: 'high',
    brief:
      'Decompose the provided retail invoice schema from 1NF through Boyce-Codd Normal Form and label all primary and foreign keys.',
    subtasks: [
      { id: 'st-5', title: 'Identify partial & transitive dependencies', completed: false },
      { id: 'st-6', title: 'Write 2NF and 3NF table schemas', completed: false },
      { id: 'st-7', title: 'Export final ER diagram & PDF', completed: false },
    ],
    reminder: '3h',
    attachments: [
      {
        id: 'att-2',
        name: 'Normalization guide.pdf',
        kind: 'Reference',
        sizeLabel: '185 KB',
        content:
          'Checklist for BCNF:\n• Ensure every determinant is a candidate key.\n• Verify lossless join decomposition.\n• Double check foreign key constraints on OrderItems and Payments.',
      },
    ],
  },
  {
    id: 'asg-3',
    title: 'API integration exercise',
    subjectId: 'subj-it212',
    dueDate: '2026-11-22',
    dueTime: '17:00',
    status: 'in_progress',
    priority: 'medium',
    brief:
      'Build typed REST client wrappers with timeout handling, retry logic, and clean loading/error UI states.',
    subtasks: [
      { id: 'st-8', title: 'Define TypeScript response interfaces', completed: true },
      { id: 'st-9', title: 'Add exponential backoff & error boundary', completed: false },
      { id: 'st-10', title: 'Test edge cases with mock responses', completed: false },
    ],
    reminder: '1d',
    attachments: [
      {
        id: 'att-3',
        name: 'Endpoint specs.md',
        kind: 'Reference',
        sizeLabel: '64 KB',
        content:
          'Required Endpoints:\n- GET /api/courses (returns Course[])\n- POST /api/submissions (validates payload & returns 201)\n- Handle 429 rate-limit and 503 retryable errors gracefully.',
      },
    ],
  },
  {
    id: 'asg-4',
    title: 'Technology reflection paper',
    subjectId: 'subj-ge',
    dueDate: '2026-11-23',
    dueTime: '23:59',
    status: 'not_started',
    priority: 'low',
    brief:
      'Write a 900-word critical reflection analyzing how attention-aware interfaces affect deep focus and academic wellbeing.',
    subtasks: [
      { id: 'st-11', title: 'Read Week 11 ethics chapter', completed: false },
      { id: 'st-12', title: 'Outline three thesis arguments', completed: false },
      { id: 'st-13', title: 'Draft and proofread citations', completed: false },
    ],
    reminder: '1d',
    attachments: [
      {
        id: 'att-4',
        name: 'Essay rubric.pdf',
        kind: 'Reference',
        sizeLabel: '150 KB',
        content:
          'Formatting & Criteria:\n• 850–1,000 words, APA 7th edition citations.\n• Cite at least 2 readings from Module 4.\n• Focus on clarity of argument and concrete examples.',
      },
    ],
  },

  // Completed 8 (gives 8 of 12 = 67% DONE, Completed · 8, Active · 4)
  {
    id: 'asg-5',
    title: 'Wireframe critique deck',
    subjectId: 'subj-it211',
    dueDate: '2026-11-20',
    dueTime: '18:00',
    status: 'submitted',
    priority: 'medium',
    brief: 'Present mobile navigation patterns and thumb-zone ergonomics across three peer prototypes.',
    subtasks: [
      { id: 'st-14', title: 'Annotate mobile screenshots', completed: true },
      { id: 'st-15', title: 'Export 6-slide critique PDF', completed: true },
    ],
    reminder: '1h',
    attachments: [],
    completedAt: '2026-11-20',
  },
  {
    id: 'asg-6',
    title: 'SQL join optimization lab',
    subjectId: 'subj-it214',
    dueDate: '2026-11-19',
    dueTime: '23:59',
    status: 'submitted',
    priority: 'high',
    brief: 'Benchmark indexed vs non-indexed composite joins across 50,000 sample rows.',
    subtasks: [
      { id: 'st-16', title: 'Run EXPLAIN ANALYZE queries', completed: true },
      { id: 'st-17', title: 'Document index selection', completed: true },
    ],
    reminder: '3h',
    attachments: [],
    completedAt: '2026-11-19',
  },
  {
    id: 'asg-7',
    title: 'Async state machine quiz',
    subjectId: 'subj-it212',
    dueDate: '2026-11-19',
    dueTime: '15:00',
    status: 'submitted',
    priority: 'medium',
    brief: 'Complete the module check on Promise concurrency and abort controllers.',
    subtasks: [
      { id: 'st-18', title: 'Review lecture notes', completed: true },
      { id: 'st-19', title: 'Submit online quiz', completed: true },
    ],
    reminder: '1h',
    attachments: [],
    completedAt: '2026-11-19',
  },
  {
    id: 'asg-8',
    title: 'Usability test script',
    subjectId: 'subj-it211',
    dueDate: '2026-11-18',
    dueTime: '17:00',
    status: 'submitted',
    priority: 'medium',
    brief: 'Draft 5 scenario-based tasks and post-test debrief questions for participant interviews.',
    subtasks: [
      { id: 'st-20', title: 'Write participant consent intro', completed: true },
      { id: 'st-21', title: 'Pilot test with classmate', completed: true },
    ],
    reminder: '1h',
    attachments: [],
    completedAt: '2026-11-18',
  },
  {
    id: 'asg-9',
    title: 'Historical tech timeline',
    subjectId: 'subj-ge',
    dueDate: '2026-11-18',
    dueTime: '23:59',
    status: 'submitted',
    priority: 'low',
    brief: 'Map 8 pivotal breakthroughs in personal computing and public communication.',
    subtasks: [{ id: 'st-22', title: 'Compile annotated timeline', completed: true }],
    reminder: 'none',
    attachments: [],
    completedAt: '2026-11-18',
  },
  {
    id: 'asg-10',
    title: 'ER diagram modeling set',
    subjectId: 'subj-it214',
    dueDate: '2026-11-17',
    dueTime: '21:00',
    status: 'submitted',
    priority: 'high',
    brief: 'Design a university library lending database with cardinality and participation constraints.',
    subtasks: [
      { id: 'st-23', title: 'Draft entities and relationships', completed: true },
      { id: 'st-24', title: 'Verify crow-foot notation', completed: true },
    ],
    reminder: '3h',
    attachments: [],
    completedAt: '2026-11-17',
  },
  {
    id: 'asg-11',
    title: 'Component accessibility audit',
    subjectId: 'subj-it212',
    dueDate: '2026-11-16',
    dueTime: '20:00',
    status: 'submitted',
    priority: 'medium',
    brief: 'Verify keyboard focus rings, ARIA labels, and contrast ratios on the form lab.',
    subtasks: [
      { id: 'st-25', title: 'Test tab order & contrast', completed: true },
      { id: 'st-26', title: 'Push accessible fixes', completed: true },
    ],
    reminder: '1h',
    attachments: [],
    completedAt: '2026-11-16',
  },
  {
    id: 'asg-12',
    title: 'Design principles summary',
    subjectId: 'subj-it211',
    dueDate: '2026-11-15',
    dueTime: '23:59',
    status: 'submitted',
    priority: 'low',
    brief: 'Summarize Norman’s affordances, signifiers, and feedback loops in a 1-page visual brief.',
    subtasks: [{ id: 'st-27', title: 'Submit reading summary', completed: true }],
    reminder: 'none',
    attachments: [],
    completedAt: '2026-11-15',
  },
];
