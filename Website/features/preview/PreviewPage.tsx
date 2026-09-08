"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Language } from "../../app/i18n";
import { previewCourses, previewDate, previewEvents, previewGoal, previewTasks, type PreviewTask } from "./data";

type Section = "overview" | "tasks" | "courses" | "schedule" | "reminders" | "library";
type Filter = "all" | "open" | "done";
const sections = [
  ["overview", "▦", "لوحة الطالب", "Dashboard"], ["tasks", "✓", "المهام", "Tasks"],
  ["courses", "▤", "المواد", "Courses"], ["schedule", "◷", "المحاضرات والاختبارات", "Lectures and exams"],
  ["reminders", "◉", "التذكيرات", "Reminders"], ["library", "▥", "المكتبة", "Library"],
] as const;
const panel = "rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7";
const button = "rounded-xl px-4 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

export default function PreviewPage() {
  const [language, setLanguage] = useState<Language>("ar");
  const [section, setSection] = useState<Section>("overview");
  const [filter, setFilter] = useState<Filter>("all");
  const ar = language === "ar";
  const label = (arabic: string, english: string) => ar ? arabic : english;
  // View state only: no browser storage, account client, or data mutation handlers.
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = ar ? "rtl" : "ltr";
  }, [language, ar]);
  const completed = previewTasks.filter(task => task.done).length;
  const percent = Math.round(completed / previewGoal * 100);
  const courseName = (id: string) => previewCourses.find(item => item.id === id)![language];
  const date = (value: string) => new Intl.DateTimeFormat(ar ? "ar-SA-u-ca-gregory" : "en-US", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
  const taskList = (tasks: readonly PreviewTask[]) => <ul className="space-y-3">{tasks.map(task => <li key={task.id} data-preview-task={task.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
    <span aria-hidden="true" className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${task.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-orange-200"}`}>{task.done ? "✓" : ""}</span>
    <div className="min-w-0 flex-1"><h3 className={`font-bold leading-7 ${task.done ? "text-slate-500 line-through" : "text-slate-800"}`}>{task[language]}</h3><p className="mt-1 text-xs leading-6 text-slate-500">{courseName(task.course)} · {date(task.due)} · {task.done ? label("مكتملة", "Completed") : label("غير مكتملة", "Open")}</p><span className="mt-1 inline-block text-xs font-bold text-orange-800">{task.priority === "high" ? label("أولوية عالية", "High priority") : task.priority === "medium" ? label("أولوية متوسطة", "Medium priority") : label("أولوية منخفضة", "Low priority")}</span></div>
  </li>)}</ul>;
  const nav = sections.map(([id, icon, arabic, english]) => <button key={id} aria-current={section === id ? "page" : undefined} onClick={() => setSection(id)} className={`${button} flex shrink-0 items-center gap-3 text-start lg:w-full ${section === id ? "bg-orange-500 text-white" : "bg-white text-slate-600 hover:bg-orange-50"}`}><span aria-hidden="true">{icon}</span>{label(arabic, english)}</button>);
  return <main dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-[#fffaf5] text-slate-900">
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="hidden w-64 shrink-0 flex-col border-x border-orange-100 bg-white p-5 lg:flex">
        <Link prefetch={false} href="/" className="mt-3 flex items-center gap-2 text-2xl font-black"><img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/growspace-logo.png`} alt="" className="h-10 w-10" /><span>Grow<span className="text-orange-600">Space</span></span></Link>
        <nav aria-label={label("أقسام المعاينة", "Preview sections")} className="mt-10 space-y-2">{nav}</nav>
        <p className="mt-auto pt-10 text-sm leading-7 text-slate-500">{label("بيانات تعليمية نموذجية للعرض فقط. أنشئ حسابك لتنظيم دراستك.", "Educational examples for viewing only. Create an account to organize your studies.")}</p>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-orange-600">GrowSpace</p><h1 className="mt-2 text-2xl font-black">{label("معاينة لوحة الطالب", "Student dashboard preview")}</h1></div><div className="flex gap-2"><Link prefetch={false} href="/" className={`${button} bg-white text-slate-600`}>{label("الرئيسية", "Home")}</Link><button onClick={() => setLanguage(ar ? "en" : "ar")} className={`${button} border border-orange-200 bg-white text-orange-700`}>{ar ? "English" : "العربية"}</button></div></header>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-4"><p className="max-w-xl text-sm leading-7 text-orange-900">{label("معاينة تفاعلية للعرض فقط: تنقّل بين الأقسام واستعرض أمثلة ثابتة. لا يمكن إنشاء البيانات أو تعديلها أو حذفها، ولا يُحفظ أي شيء هنا.", "Read-only interactive preview: explore sections with fixed examples. Data cannot be created, edited or deleted, and nothing is saved here.")}</p><Link prefetch={false} href="/login" className={`${button} bg-orange-600 text-white hover:bg-orange-700`}>{label("إنشاء حساب", "Create an account")}</Link></div>
        <nav aria-label={label("أقسام المعاينة", "Preview sections")} className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:hidden">{nav}</nav>
        <p className="mt-5 text-xs leading-6 text-slate-500">{label("اليوم في المثال", "Example day")}: {date(previewDate)} 2026 · {label("التواريخ والمؤشرات توضيحية ولا تتبع تاريخ جهازك", "Illustrative dates and metrics do not follow your device date")}</p>
        <section aria-label={label(sections.find(item => item[0] === section)![2], sections.find(item => item[0] === section)![3])} className="mt-5 space-y-6">
          {section === "overview" && <>
            <div className="grid gap-3 sm:grid-cols-3">{[[label("مهام متبقية", "Tasks remaining"), previewTasks.length - completed], [label("إجمالي المنجز", "Total completed"), completed], [label("الموعد القادم في المثال", "Next example event"), "09:00"]].map(([title, value]) => <article key={title} className={panel}><p className="text-sm text-slate-500">{title}</p><p className="mt-3 text-3xl font-black text-orange-600">{value}</p></article>)}</div>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_260px]"><article className={panel}><h2 className="mb-5 text-xl font-black">{label("مهام اليوم", "Today's tasks")}</h2>{taskList(previewTasks.filter(task => task.due === previewDate))}<button onClick={() => setSection("tasks")} className={`${button} mt-5 bg-orange-50 text-orange-800`}>{label("عرض كل المهام", "View all tasks")}</button></article><div className="space-y-5"><article className={panel}><h2 className="font-black">{label("الهدف الأسبوعي", "Weekly goal")}</h2><p className="mt-4 text-3xl font-black text-emerald-700">{percent}%</p><p className="mt-2 text-sm text-slate-500">{completed} / {previewGoal} {label("مهام نموذجية", "example tasks")}</p><progress aria-label={label("الإنجاز الأسبوعي النموذجي", "Example weekly progress")} value={percent} max={100} className="mt-4 w-full accent-emerald-600" /></article><article className={panel}><h2 className="font-black">{label("المحاضرة القادمة", "Next lecture")}</h2><p className="mt-3 leading-7">{previewEvents[0][language]}</p><p className="mt-2 text-sm text-orange-700">{date(previewEvents[0].date)} · 09:00</p><button onClick={() => setSection("schedule")} className={`${button} mt-4 bg-orange-50 text-orange-800`}>{label("عرض الجدول", "View schedule")}</button></article></div></div>
          </>}
          {section === "tasks" && <article className={panel}><h2 className="text-xl font-black">{label("المهام الدراسية", "Study tasks")}</h2><div className="my-5 flex flex-wrap gap-2">{([['all', 'الكل', 'All'], ['open', 'المتبقية', 'Open'], ['done', 'المكتملة', 'Completed']] as const).map(([id, arabic, english]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)} className={`${button} ${filter === id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{label(arabic, english)}</button>)}</div>{taskList(previewTasks.filter(task => filter === "all" || (filter === "done" ? task.done : !task.done)))}</article>}
          {section === "courses" && <><h2 className="text-xl font-black">{label("المواد الدراسية", "Courses")}</h2><div className="grid gap-4 sm:grid-cols-2">{previewCourses.map(course => <article key={course.id} className={panel}><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{course.code}</span><h3 className="mt-5 text-xl font-black">{course[language]}</h3><p className="mt-3 text-sm text-slate-500">{previewTasks.filter(task => task.course === course.id && !task.done).length} {label("مهام متبقية", "open tasks")}</p></article>)}</div></>}
          {section === "schedule" && <article className={panel}><h2 className="mb-6 text-xl font-black">{label("المحاضرات والاختبارات", "Lectures and exams")}</h2><ul className="space-y-4">{previewEvents.map(event => <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-5"><div><span className={`text-xs font-bold ${event.kind === "exam" ? "text-red-700" : "text-violet-700"}`}>{event.kind === "exam" ? label("اختبار", "Exam") : label("محاضرة", "Lecture")}</span><h3 className="mt-2 font-bold">{event[language]}</h3><p className="mt-2 text-sm text-slate-500">{courseName(event.course)}</p></div><p className="text-sm font-bold text-orange-700">{date(event.date)} · {event.time}</p></li>)}</ul></article>}
          {section === "reminders" && <><h2 className="text-xl font-black">{label("التذكيرات", "Reminders")}</h2><div className="grid items-start gap-4 xl:grid-cols-3">{([['overdue', 'متأخرة', 'Overdue'], ['today', 'مستحقة اليوم', 'Due today'], ['upcoming', 'قادمة', 'Upcoming']] as const).map(([id, arabic, english]) => <article key={id} className={panel}><h3 className="mb-4 font-black">{label(arabic, english)} ({previewTasks.filter(task => task.reminder === id).length})</h3>{taskList(previewTasks.filter(task => task.reminder === id))}</article>)}</div></>}
          {section === "library" && <article className={panel}><p className="text-xs font-bold text-orange-700">{label("مثال من المكتبة الاختيارية", "Optional library example")}</p><h2 className="mt-3 text-2xl font-black">{label("العادات الذرية", "Atomic Habits")}</h2><p className="mt-2 text-slate-500">{label("جيمس كلير", "James Clear")}</p><p className="mt-5 font-bold">{label("قيد القراءة", "Currently reading")} · 42%</p><progress aria-label={label("تقدم القراءة النموذجي", "Example reading progress")} value={42} max={100} className="mt-3 w-full accent-orange-600" /><h3 className="mt-7 font-black">{label("ملخص نموذجي", "Example summary")}</h3><p className="mt-3 leading-8 text-slate-600">{label("الخطوات الصغيرة والمتكررة تساعد على بناء عادة دراسية مستقرة. يمكن تطبيق الفكرة بتخصيص وقت محدد للمراجعة اليومية.", "Small, repeated steps help build a steady study habit. Set aside a regular time for daily review to put this idea into practice.")}</p></article>}
        </section>
      </div>
    </div>
  </main>;
}
