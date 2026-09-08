import Link from "next/link";
import type { Language } from "../../app/i18n";
import { previewDate, previewTasks } from "../../features/preview/data";

export default function TodayPreview({ language }: { language: Language }) {
  const ar = language === "ar";
  const tasks = previewTasks.filter(task => task.due === previewDate);
  const progress = Math.round(tasks.filter(task => task.done).length / tasks.length * 100);
  return <section className="relative rounded-[2rem] border border-orange-100 bg-white p-6 shadow-2xl shadow-orange-100/60" aria-label={ar ? "نموذج لوحة الطالب" : "Example student dashboard"}>
    <p className="text-sm font-bold text-orange-600">{ar ? "معاينة للعرض فقط" : "Read-only preview"}</p>
    <h2 className="mt-2 text-2xl font-black">{ar ? "نظرة اليوم" : "Today at a glance"}</h2>
    <p className="mt-2 text-sm leading-7 text-slate-500">{ar ? "بيانات تعليمية نموذجية ثابتة، وليست بيانات حسابك." : "Fixed educational examples, not your account data."}</p>
    <ul className="mt-5 space-y-3">{tasks.map(task => <li key={task.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"><span aria-hidden="true" className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${task.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-orange-200"}`}>{task.done ? "✓" : ""}</span><span className={`text-sm leading-7 ${task.done ? "text-slate-500 line-through" : "text-slate-700"}`}>{task[language]}<span className="sr-only">{task.done ? (ar ? "، مكتملة" : ", completed") : (ar ? "، غير مكتملة" : ", open")}</span></span></li>)}</ul>
    <div className="mt-5 rounded-2xl bg-orange-50 p-4"><p className="text-sm font-bold text-orange-900">{ar ? "تقدم اليوم في المثال" : "Example daily progress"} · {progress}%</p><progress aria-label={ar ? "تقدم نموذجي" : "Example progress"} value={progress} max={100} className="mt-3 w-full accent-orange-600" /></div>
    <Link prefetch={false} href="/preview" className="mt-5 block rounded-xl px-3 py-2 text-center text-sm font-bold text-orange-700 hover:bg-orange-50">{ar ? "استعرض اللوحة التفاعلية" : "Explore the interactive dashboard"}</Link>
  </section>;
}
