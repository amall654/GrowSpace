import type { Book, ClassEvent, Course, Profile, Task } from "./types";

export const storageKey = "growspace-dashboard-v2";

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const initialTasks: Task[] = [
  { id: "task-1", title: "مراجعة محاضرة البرمجة", course: "البرمجة", due: dateAfter(0), priority: "high", done: false },
  { id: "task-2", title: "إعداد مخطط مشروع الواجهة", course: "واجهة المستخدم", due: dateAfter(1), priority: "medium", done: false },
  { id: "task-3", title: "قراءة الفصل الثاني", course: "قواعد البيانات", due: dateAfter(-1), priority: "low", done: true },
];

export const initialSchedule: ClassEvent[] = [
  { id: "event-1", title: "محاضرة البرمجة", course: "البرمجة", day: "Sunday", time: "09:00", kind: "class" },
  { id: "event-2", title: "مختبر قواعد البيانات", course: "قواعد البيانات", day: "Tuesday", time: "11:00", kind: "class" },
  { id: "event-3", title: "مراجعة تصميم الواجهة", course: "واجهة المستخدم", day: "Thursday", time: "13:00", kind: "exam" },
];

export const initialBooks: Book[] = [
  { id: "book-1", title: "العادات الذرية", author: "جيمس كلير", progress: 42, status: "reading", note: "الخطوات الصغيرة والمتكررة تصنع فرقًا واضحًا مع الوقت." },
];

export const initialCourses: Course[] = [
  { id: "course-1", name: "البرمجة", code: "CS101", color: "bg-orange-100 text-orange-700" },
  { id: "course-2", name: "قواعد البيانات", code: "CS205", color: "bg-violet-100 text-violet-700" },
  { id: "course-3", name: "واجهة المستخدم", code: "DES110", color: "bg-emerald-100 text-emerald-700" },
];

export const initialProfile: Profile = { name: "طالب", weeklyGoal: 5 };
