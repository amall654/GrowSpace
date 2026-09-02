import type { AuthCopy, DashboardCopy, HomeCopy } from "./types";

export const en: HomeCopy = {
  nav: ["Features", "How it works", "Reading"],
  language: "العربية",
  join: "Join the waitlist",
  eyebrow: "Your daily study companion",
  title: "Organize your studies. Make room to grow.",
  lead: "GrowSpace brings your schedule, tasks, and academic goals into one calm place that helps you focus on what matters.",
  heroNote: "The reading space is optional — your study plan comes first.",
  previewTitle: "Today at a glance",
  previewTasks: ["Review programming lecture", "Submit UI design project", "25-minute focus session"],
  previewDone: "2 of 4 tasks completed",
  featuresTitle: "Everything you need for a clearer study day",
  featuresLead: "Simple tools designed around student life, not complexity.",
  features: [
    ["▦", "Academic schedule", "Keep lectures, exams, and recurring events in one view."],
    ["✓", "Tasks and projects", "Add assignments with due dates, priorities, and completion status."],
    ["◷", "Timely reminders", "Stay on top of important moments with clear, gentle reminders."],
    ["◉", "Focus and goals", "Track focus sessions and small steps toward your study goals."],
    ["⌁", "Optional library", "Record reading progress and notes whenever you want time to read."],
  ],
  readingLabel: "Your personal library",
  readingTitle: "Reading is a gentle extra, never a burden.",
  readingLead: "Use your personal library to track books and write notes, or simply ignore it and focus on your schedule and tasks.",
  readingPills: ["Reading now", "Your summaries", "Reading goals"],
  journeyTitle: "Start in four simple steps",
  steps: [
    ["01", "Create your space", "Begin with your personal account."],
    ["02", "Add your schedule", "Save lectures and exams."],
    ["03", "Plan your tasks", "Set priorities and deadlines."],
    ["04", "Track your progress", "Complete, review, and celebrate small wins."],
  ],
  waitTitle: "Be among the first to try GrowSpace",
  waitLead: "Leave your email to receive launch news and early updates.",
  email: "Email address",
  submit: "Join now",
  invalid: "Please enter a valid email address.",
  success: "Thanks for joining! We’ll keep you updated when we launch.",
  footer: "GrowSpace — an organized space for student life.",
};

export const dashboardEn: DashboardCopy = {
  dashboard: "Dashboard", tasks: "Tasks", schedule: "Schedule", library: "Library", language: "العربية", back: "Home page",
  hello: "Welcome to GrowSpace", subtitle: "Organize your study day and focus on what matters.", today: "Today at a glance", completed: "Completed", pending: "Remaining", upcoming: "Upcoming",
  quickAdd: "Add a task", taskTitle: "Task title", course: "Course", due: "Due date", priority: "Priority", add: "Add", cancel: "Cancel", noTasks: "There are no tasks here yet.",
  taskList: "Your tasks", allTasks: "All tasks", completedTasks: "Completed tasks", markDone: "Mark complete", undo: "Reopen", remove: "Delete", high: "High", medium: "Medium", low: "Low",
  focus: "Focus session", focusText: "Start a short 25-minute focus session.", startFocus: "Start focus", focusActive: "Focus session started — you’ve got this!",
  scheduleTitle: "Academic schedule", addEvent: "Add event", eventTitle: "Event title", day: "Day", time: "Time", type: "Type", lecture: "Lecture", exam: "Exam or review", noEvents: "You have not added any events yet.",
  libraryTitle: "My library", addBook: "Add a book", bookTitle: "Book title", author: "Author", status: "Status", progress: "Progress", note: "Notes or summary", reading: "Reading now", planned: "Want to read", finished: "Finished", noBooks: "Your library is empty right now.",
  save: "Save", change: "Edit", reset: "Reset demo data", resetHint: "Your data is stored in this browser only.", goal: "Weekly goal", goalText: "Complete 5 study tasks", tasksUnit: "tasks", days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
  courses: "Courses", addCourse: "Add a course", courseName: "Course name", courseCode: "Course code", noCourses: "You have not added any courses yet.", profile: "Profile", name: "Name", editProfile: "Edit profile", weeklyProgress: "Weekly progress", weeklyGoal: "Weekly goal", reminders: "Reminders", dueSoon: "Coming up", noReminders: "No upcoming reminders.", noCourse: "No course",
};

export const authEn: AuthCopy = {
  title: "Start your study journey", lead: "Create an account to save your plan and data online.", email: "Email address", password: "Password", signIn: "Sign in", signUp: "Create account", switchToSignUp: "New here? Create an account", switchToSignIn: "Already have an account? Sign in", success: "Your account is ready. Check your email to confirm it.", error: "We could not complete that action. Check your details and try again.",
};
