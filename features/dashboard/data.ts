import type { Book, ClassEvent, Course, Profile, Task } from "./types";

export const storageKey = "growspace-dashboard-v1";

export const initialTasks: Task[] = [
  { id: "task-1", title: "Review programming lecture", course: "Programming", due: "2026-09-03", priority: "high", done: false },
  { id: "task-2", title: "Prepare UI project outline", course: "User Interface", due: "2026-09-04", priority: "medium", done: false },
  { id: "task-3", title: "Read chapter 2", course: "Database", due: "2026-09-02", priority: "low", done: true },
];

export const initialSchedule: ClassEvent[] = [
  { id: "event-1", title: "Programming lecture", course: "Programming", day: "Sunday", time: "09:00", kind: "class" },
  { id: "event-2", title: "Database lab", course: "Database", day: "Tuesday", time: "11:00", kind: "class" },
  { id: "event-3", title: "UI design review", course: "User Interface", day: "Thursday", time: "13:00", kind: "exam" },
];

export const initialBooks: Book[] = [
  { id: "book-1", title: "Atomic Habits", author: "James Clear", progress: 42, status: "reading", note: "Small habits create meaningful progress." },
];

export const initialCourses: Course[] = [
  { id: "course-1", name: "Programming", code: "CS101", color: "bg-orange-100 text-orange-700" },
  { id: "course-2", name: "Database", code: "CS205", color: "bg-violet-100 text-violet-700" },
  { id: "course-3", name: "User Interface", code: "DES110", color: "bg-emerald-100 text-emerald-700" },
];

export const initialProfile: Profile = { name: "Student", weeklyGoal: 5 };
