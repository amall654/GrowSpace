export type Language = "ar" | "en";

export type HomeCopy = {
  nav: readonly [string, string, string];
  language: string;
  join: string;
  eyebrow: string;
  title: string;
  lead: string;
  heroNote: string;
  previewTitle: string;
  previewTasks: readonly [string, string, string];
  previewDone: string;
  featuresTitle: string;
  featuresLead: string;
  features: readonly (readonly [string, string, string])[];
  readingLabel: string;
  readingTitle: string;
  readingLead: string;
  readingPills: readonly [string, string, string];
  journeyTitle: string;
  steps: readonly (readonly [string, string, string])[];
  waitTitle: string;
  waitLead: string;
  email: string;
  submit: string;
  invalid: string;
  success: string;
  footer: string;
};

export type DashboardCopy = {
  dashboard: string; tasks: string; schedule: string; library: string; language: string; back: string;
  hello: string; subtitle: string; today: string; completed: string; pending: string; upcoming: string;
  quickAdd: string; taskTitle: string; course: string; due: string; priority: string; add: string; cancel: string; noTasks: string;
  taskList: string; allTasks: string; completedTasks: string; markDone: string; undo: string; remove: string; high: string; medium: string; low: string;
  focus: string; focusText: string; startFocus: string; focusActive: string;
  scheduleTitle: string; addEvent: string; eventTitle: string; day: string; time: string; type: string; lecture: string; exam: string; noEvents: string;
  libraryTitle: string; addBook: string; bookTitle: string; author: string; status: string; progress: string; note: string; reading: string; planned: string; finished: string; noBooks: string;
  save: string; change: string; reset: string; resetHint: string; goal: string; goalText: string; tasksUnit: string; days: readonly [string, string, string, string, string];
  courses: string; addCourse: string; courseName: string; courseCode: string; noCourses: string; profile: string; name: string; editProfile: string; weeklyProgress: string; weeklyGoal: string; reminders: string; dueSoon: string; noReminders: string; noCourse: string; signOut: string;
};

export type AuthCopy = {
  title: string; lead: string; email: string; password: string; signIn: string; signUp: string; switchToSignUp: string; switchToSignIn: string; success: string; error: string;
};
