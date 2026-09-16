// Fixed educational examples; never derived from account data or the visitor's clock.
export const previewDate = "2026-09-08";
export const previewGoal = 5;
export const previewCourses = [
  { id: "programming", code: "CS101", ar: "البرمجة", en: "Programming" },
  { id: "database", code: "CS205", ar: "قواعد البيانات", en: "Databases" },
  { id: "design", code: "DES110", ar: "تصميم الواجهات", en: "Interface design" },
] as const;
export const previewTasks = [
  { id: "p1", ar: "مراجعة مفاهيم البرمجة", en: "Review programming concepts", course: "programming", due: "2026-09-08", priority: "high", done: false, reminder: "today" },
  { id: "p2", ar: "حل تمارين قواعد البيانات", en: "Solve database exercises", course: "database", due: "2026-09-08", priority: "medium", done: false, reminder: "today" },
  { id: "p3", ar: "تسليم مخطط الواجهة", en: "Submit the interface wireframe", course: "design", due: "2026-09-07", priority: "high", done: false, reminder: "overdue" },
  { id: "p4", ar: "التحضير لاختبار البرمجة", en: "Prepare for the programming exam", course: "programming", due: "2026-09-10", priority: "medium", done: false, reminder: "upcoming" },
  { id: "p5", ar: "قراءة الفصل الأول", en: "Read chapter one", course: "database", due: "2026-09-08", priority: "low", done: true, reminder: null },
  { id: "p6", ar: "تلخيص محاضرة التصميم", en: "Summarize the design lecture", course: "design", due: "2026-09-06", priority: "low", done: true, reminder: null },
] as const;
export const previewEvents = [
  { id: "e1", ar: "محاضرة البرمجة", en: "Programming lecture", course: "programming", date: "2026-09-08", time: "09:00", kind: "lecture" },
  { id: "e2", ar: "مختبر قواعد البيانات", en: "Database lab", course: "database", date: "2026-09-09", time: "11:00", kind: "lecture" },
  { id: "e3", ar: "اختبار البرمجة", en: "Programming exam", course: "programming", date: "2026-09-10", time: "10:00", kind: "exam" },
] as const;
export type PreviewTask = typeof previewTasks[number];
