"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { Language } from "../../app/i18n";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import { initialBooks, initialCourses, initialProfile, initialSchedule, storageKey } from "../../features/dashboard/data";
import type { Task } from "../../features/dashboard/types";

function todayKey() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

function readDemo() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return { tasks: [] as Task[], events: initialSchedule, books: initialBooks, courses: initialCourses, profile: initialProfile };
  const data = JSON.parse(raw);
  if (!data || !Array.isArray(data.tasks) || !data.tasks.every((task: Task) => typeof task.id === "string" && typeof task.title === "string" && typeof task.due === "string" && typeof task.done === "boolean")) throw new Error("Invalid saved tasks");
  return data;
}

export default function TodayPreview({ language }: { language: Language }) {
  const ar = language === "ar";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [today, setToday] = useState(todayKey);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<"saved" | "error" | "">("");
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    let active = true;
    let revision = 0;
    async function refresh() {
      const current = ++revision;
      try {
        const session = supabase ? await supabase.auth.getSession() : null;
        if (session?.error) throw session.error;
        const id = session?.data.session?.user.id ?? null;
        let next: Task[];
        if (id && supabase) {
          const result = await supabase.from("tasks").select("id,title,course,due,priority,done").eq("user_id", id);
          if (result.error) throw result.error;
          next = (result.data ?? []) as Task[];
        } else {
          next = readDemo().tasks;
        }
        if (active && current === revision) { setUserId(id); setTasks(next); setReady(true); setToday(todayKey()); }
      } catch {
        if (active && current === revision) { setReady(false); setMessage("error"); }
      }
    }
    void refresh();
    const onStorage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) void refresh(); };
    const onFocus = () => { void refresh(); };
    const timer = window.setInterval(() => setToday(todayKey()), 60000);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    const subscription = supabase?.auth.onAuthStateChange(() => { window.setTimeout(() => { if (active) void refresh(); }, 0); });
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("storage", onStorage); window.removeEventListener("focus", onFocus); subscription?.data.subscription.unsubscribe(); };
  }, [supabase]);

  async function save(task: Task, isNew: boolean) {
    if (busy || !ready) return;
    setBusy(true);
    setMessage("");
    try {
      if (userId && supabase) {
        const result = isNew
          ? await supabase.from("tasks").insert({ ...task, user_id: userId }).select("id").single()
          : await supabase.from("tasks").update({ done: task.done }).eq("id", task.id).eq("user_id", userId).select("id").single();
        if (result.error) throw result.error;
        setTasks(current => isNew ? [...current, task] : current.map(item => item.id === task.id ? task : item));
      } else {
        const data = readDemo();
        const updated = isNew ? [...data.tasks, task] : data.tasks.map((item: Task) => item.id === task.id ? { ...item, done: task.done } : item);
        localStorage.setItem(storageKey, JSON.stringify({ ...data, tasks: updated }));
        setTasks(updated);
      }
      if (isNew) setTitle("");
      setMessage("saved");
    } catch { setMessage("error"); }
    finally { setBusy(false); }
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    void save({ id: crypto.randomUUID(), title: title.trim(), course: "", due: today, priority: "medium", done: false }, true);
  }

  const daily = tasks.filter(task => task.due === today);
  const completed = daily.filter(task => task.done).length;
  const percent = daily.length ? Math.round(completed / daily.length * 100) : 0;
  return <section className="relative rounded-[2rem] border border-orange-100 bg-white p-5 shadow-2xl shadow-orange-100/60 sm:p-6" aria-label={ar ? "نظرة اليوم" : "Today at a glance"}>
    <div className="mb-5 flex items-start justify-between gap-3">
      <div><p className="text-sm font-semibold text-orange-600">GrowSpace</p><h2 className="mt-1 text-2xl font-bold">{ar ? "نظرة اليوم" : "Today at a glance"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{ar ? (userId ? "مهامك المحفوظة في حسابك" : "مهام تجربتك المحفوظة في هذا المتصفح") : (userId ? "Your account's saved tasks" : "Your demo tasks saved in this browser")}</p></div>
      <span aria-hidden="true" className="rounded-2xl bg-orange-50 px-3 py-2 text-xl text-orange-600">☀</span>
    </div>
    {!ready && !message && <p role="status" className="py-6 text-sm text-slate-500">{ar ? "جارٍ تحميل مهامك…" : "Loading your tasks…"}</p>}
    {ready && <div className="max-h-60 space-y-2 overflow-y-auto">
      {daily.map(task => <label key={task.id} className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-orange-50">
        <input type="checkbox" checked={task.done} disabled={busy} onChange={() => void save({ ...task, done: !task.done }, false)} className="mt-1 h-5 w-5 shrink-0 accent-orange-500" />
        <span className={`break-words text-base leading-7 ${task.done ? "text-slate-400 line-through" : "text-slate-700"}`}>{task.title}</span>
      </label>)}
      {daily.length === 0 && <p className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm leading-7 text-slate-500">{ar ? "لا توجد مهام لليوم بعد. أضف أول مهمة لك من هنا." : "No tasks due today yet. Add your first task below."}</p>}
    </div>}
    <form onSubmit={add} className="mt-4 flex gap-2">
      <label className="sr-only" htmlFor="home-task">{ar ? "مهمة جديدة لليوم" : "New task for today"}</label>
      <input id="home-task" value={title} onChange={event => setTitle(event.target.value)} required maxLength={200} disabled={!ready || busy} placeholder={ar ? "ماذا تريد أن تنجز اليوم؟" : "What will you do today?"} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
      <button disabled={!ready || busy || !title.trim()} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{ar ? "أضف" : "Add"}</button>
    </form>
    <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-orange-900">
      <div className="flex justify-between gap-3 text-sm font-semibold"><span>{ar ? `أنجزت ${completed} من ${daily.length} مهام اليوم` : `${completed} of ${daily.length} tasks completed`}</span><span>{percent}%</span></div>
      <div role="progressbar" aria-label={ar ? "تقدم اليوم" : "Today's progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${percent}%` }} /></div>
    </div>
    <p role="status" className={`mt-2 min-h-6 text-sm ${message === "error" ? "text-red-700" : "text-emerald-700"}`}>{message === "error" ? (ar ? "تعذر تحميل التغييرات أو حفظها. أعد المحاولة." : "Unable to load or save changes. Please try again.") : message === "saved" ? (ar ? "تم حفظ التغيير" : "Change saved") : ""}</p>
    <Link href={userId ? "/dashboard" : "/demo"} className="mt-1 block text-center text-sm font-semibold text-orange-700 hover:underline">{ar ? "افتح مساحتك وجميع مهامك" : "Open your space and all tasks"}</Link>
  </section>;
}

