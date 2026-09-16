"use client";

import { useEffect, useState } from "react";
import type { DashboardCopy, Language } from "../../app/i18n";
import type { ClassEvent, Task } from "./types";

type Props = {
  t: DashboardCopy; language: Language; tasks: Task[]; events: ClassEvent[];
  completedCount: number; pendingCount: number; weeklyGoal: number;
  onAdd: () => void; onToggle: (id: string) => void; onEdit: (task: Task) => void;
  onViewTasks: () => void; focusSeconds: number; focusRunning: boolean;
  onFocus: () => void; onResetFocus: () => void; dayMap: Record<string, string>;
};

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export default function Overview({ t, language, tasks, events, completedCount, pendingCount, onAdd, onToggle, onEdit, onViewTasks, focusSeconds, focusRunning, onFocus, onResetFocus, dayMap }: Props) {
  const ar = language === "ar";
  const [filter, setFilter] = useState<"today" | "overdue" | "done">("today");
  const [now, setNow] = useState(() => new Date());
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const today = dateKey(now);
  const todayTasks = tasks.filter(task => task.due === today);
  const overdue = tasks.filter(task => !task.done && task.due < today);
  const doneToday = todayTasks.filter(task => task.done);
  const groups = { today: todayTasks.filter(task => !task.done), overdue, done: doneToday };
  const progress = todayTasks.length ? Math.round(doneToday.length / todayTasks.length * 100) : 0;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const nextEvent = [...events].sort((a, b) => {
    const minutesUntil = (event: ClassEvent) => {
      const [hour, minute] = event.time.split(":").map(Number);
      let distance = ((days.indexOf(event.day) - now.getDay() + 7) % 7) * 1440 + hour * 60 + minute - now.getHours() * 60 - now.getMinutes();
      if (distance < 0) distance += 7 * 1440;
      return distance;
    };
    return minutesUntil(a) - minutesUntil(b);
  })[0];
  const timer = `${String(Math.floor(focusSeconds / 60)).padStart(2, "0")}:${String(focusSeconds % 60).padStart(2, "0")}`;
  const filters = [
    { id: "today" as const, label: ar ? "اليوم" : "Today" },
    { id: "overdue" as const, label: ar ? "المتأخرة" : "Overdue" },
    { id: "done" as const, label: ar ? "إنجازات اليوم" : "Today's completed" },
  ];
  return <div className="overview-space">
    <p className="mt-3 text-base leading-8 text-slate-500">{t.subtitle}</p>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {[
        { label: ar ? "مهام متبقية" : "Tasks remaining", value: pendingCount, color: "text-orange-600" },
        { label: ar ? "إجمالي المنجز" : "Total completed", value: completedCount, color: "text-emerald-600" },
        { label: t.upcoming, value: nextEvent ? `${dayMap[nextEvent.day] || nextEvent.day} · ${nextEvent.time}` : "—", color: "text-violet-600" },
      ].map(item => <article key={item.label} className="rounded-2xl border border-orange-100 bg-white px-5 py-4"><p className="text-sm font-medium text-slate-500">{item.label}</p><p className={`mt-2 text-2xl font-semibold leading-relaxed ${item.color}`}>{item.value}</p></article>)}
    </div>
    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <section className="overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-sm">
        <div className="bg-gradient-to-bl from-orange-50 via-white to-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm font-medium text-orange-700">{new Intl.DateTimeFormat(ar ? "ar-SA" : "en-US", { weekday: "long", month: "long", day: "numeric" }).format(now)}</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t.today}</h2><p className="mt-2 text-sm leading-7 text-slate-500">{ar ? "خطوة صغيرة الآن تصنع فرقًا في يومك." : "One small step now makes a difference today."}</p></div>
            <button onClick={onAdd} className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">+ {t.quickAdd}</button>
          </div>
          <div className="mt-6 rounded-2xl border border-orange-100 bg-white/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{ar ? "تقدم مهام اليوم" : "Today's task progress"}</span><span className="text-slate-500">{doneToday.length} / {todayTasks.length}</span></div>
            <div role="progressbar" aria-label={ar ? "تقدم مهام اليوم" : "Today's task progress"} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-2.5 overflow-hidden rounded-full bg-orange-50"><div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4" aria-label={ar ? "تصفية مهام اليوم" : "Filter daily tasks"}>
            {filters.map(item => <button key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${filter === item.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-orange-50"}`}>{item.label}<span className="rounded-md bg-white/15 px-1.5 text-xs">{groups[item.id].length}</span></button>)}
          </div>
          <p role="status" className="min-h-8 pt-2 text-sm text-emerald-700">{notice}</p>
          <div className="max-h-[32rem] space-y-3 overflow-y-auto">
            {groups[filter].map(task => <article key={task.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/30">
              <button aria-label={`${task.done ? t.undo : t.markDone}: ${task.title}`} onClick={() => { onToggle(task.id); setNotice(ar ? (task.done ? "أُعيدت المهمة إلى قائمة اليوم." : "تم إنجاز المهمة، أحسنت!") : (task.done ? "Task reopened." : "Task completed. Well done!")); }} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg transition ${task.done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-orange-200 text-orange-500 hover:bg-emerald-50 hover:text-emerald-700"}`}>✓</button>
              <div className="min-w-0 flex-1"><h3 className={`break-words text-base font-semibold leading-7 ${task.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{task.course || t.noCourse} · {new Intl.DateTimeFormat(ar ? "ar-SA" : "en-US", { month: "short", day: "numeric" }).format(new Date(`${task.due}T12:00:00`))}</p><span className={`mt-2 inline-block rounded-lg px-2 py-1 text-xs font-medium ${task.priority === "high" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{t[task.priority]}</span></div>
              <button onClick={() => onEdit(task)} className="rounded-lg px-2 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50">{t.change}</button>
            </article>)}
            {groups[filter].length === 0 && <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 px-4 py-9 text-center"><span className="text-3xl text-emerald-600">✓</span><p className="mt-3 text-base font-semibold">{ar ? (filter === "overdue" ? "لا توجد مهام متأخرة" : filter === "done" ? "ابدأ أول إنجاز لك اليوم" : "قائمة اليوم خالية من المهام المتبقية") : (filter === "overdue" ? "No overdue tasks" : filter === "done" ? "Make your first completion today" : "No remaining tasks due today")}</p><button onClick={onAdd} className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-700 ring-1 ring-orange-200">+ {t.quickAdd}</button></div>}
          </div>
          <button onClick={onViewTasks} className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-orange-300 hover:text-orange-700">{ar ? "عرض جميع المهام" : "View all tasks"}</button>
        </div>
      </section>
      <section className="rounded-[1.75rem] bg-slate-900 p-6 text-white shadow-sm">
        <p className="text-sm font-semibold text-orange-300">{t.focus}</p>
        <p className="mt-5 text-sm text-slate-300">{ar ? "امنح مهمة واحدة كل تركيزك" : "Give one task your full attention"}</p>
        <h2 dir="ltr" className="my-7 text-center text-5xl font-medium tabular-nums tracking-wide">{timer}</h2>
        <p className="text-sm leading-7 text-slate-300">{focusRunning ? t.focusActive : t.focusText}</p>
        <button onClick={onFocus} className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold hover:bg-orange-400">{focusRunning ? (ar ? "إيقاف مؤقت" : "Pause") : t.startFocus}</button>
        <button onClick={onResetFocus} className="mt-3 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800">{ar ? "إعادة ضبط المؤقت" : "Reset timer"}</button>
      </section>
    </div>
  </div>;
}

