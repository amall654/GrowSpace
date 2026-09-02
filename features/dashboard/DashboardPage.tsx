"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { dashboardCopy, type Language } from "../../app/i18n";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import { initialBooks, initialCourses, initialProfile, initialSchedule, initialTasks, storageKey } from "./data";
import type { Book, BookStatus, ClassEvent, Course, Priority, Profile, Tab, Task } from "./types";


function dateLabel(date: string, language: Language) {
  return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export default function DashboardPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("ar");
  const [tab, setTab] = useState<Tab>("overview");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events, setEvents] = useState<ClassEvent[]>(initialSchedule);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<ClassEvent | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = getSupabaseBrowserClient();
  const t = dashboardCopy[language];
  const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/growspace-logo.png`;

  useEffect(() => {
    if (!supabase) { setIsCheckingSession(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) router.replace("/login");
      if (data.session) {
        const id = data.session.user.id;
        setUserId(id);
        const [profileResult, coursesResult, tasksResult, eventsResult, booksResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
          supabase.from("courses").select("*").eq("user_id", id),
          supabase.from("tasks").select("*").eq("user_id", id),
          supabase.from("events").select("*").eq("user_id", id),
          supabase.from("books").select("*").eq("user_id", id),
        ]);
        if (profileResult.data) setProfile({ name: profileResult.data.name, weeklyGoal: profileResult.data.weekly_goal });
        else await supabase.from("profiles").upsert({ id, name: initialProfile.name, weekly_goal: initialProfile.weeklyGoal });
        setCourses((coursesResult.data ?? []).map((course) => ({ id: course.id, name: course.name, code: course.code, color: course.color })));
        setTasks((tasksResult.data ?? []).map((task) => ({ id: task.id, title: task.title, course: task.course, due: task.due, priority: task.priority as Priority, done: task.done })));
        setEvents((eventsResult.data ?? []).map((event) => ({ id: event.id, title: event.title, course: event.course, day: event.day, time: event.time.slice(0, 5), kind: event.kind as ClassEvent["kind"] })));
        setBooks((booksResult.data ?? []).map((book) => ({ id: book.id, title: book.title, author: book.author, progress: book.progress, status: book.status as BookStatus, note: book.note })));
      }
      setIsCheckingSession(false);
    });
  }, [router, supabase]);

  useEffect(() => {
    const stored = supabase ? null : localStorage.getItem(storageKey);
    const storedLanguage = sessionStorage.getItem("growspace-language");
    if (storedLanguage === "ar" || storedLanguage === "en") setLanguage(storedLanguage);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { tasks?: Task[]; events?: ClassEvent[]; books?: Book[]; courses?: Course[]; profile?: Profile };
      if (parsed.tasks && parsed.events && parsed.books) { setTasks(parsed.tasks); setEvents(parsed.events); setBooks(parsed.books); }
      if (parsed.courses) setCourses(parsed.courses);
      if (parsed.profile) setProfile(parsed.profile);
    } catch { localStorage.removeItem(storageKey); }
  }, [supabase]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    sessionStorage.setItem("growspace-language", language);
  }, [language]);

  useEffect(() => {
    if (!focusRunning) return;
    const timer = window.setInterval(() => setFocusSeconds((seconds) => {
      if (seconds <= 1) { setFocusRunning(false); return 25 * 60; }
      return seconds - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [focusRunning]);

  useEffect(() => { if (!supabase) localStorage.setItem(storageKey, JSON.stringify({ tasks, events, books, courses, profile })); }, [tasks, events, books, courses, profile, supabase]);

  const completedCount = tasks.filter((task) => task.done).length;
  const pendingTasks = tasks.filter((task) => !task.done);
  const orderedTasks = useMemo(() => [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due)), [tasks]);
  const reminders = useMemo(() => pendingTasks.filter((task) => task.due >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5), [pendingTasks]);
  const languageDayMap: Record<string, string> = { Sunday: t.days[0], Monday: t.days[1], Tuesday: t.days[2], Wednesday: t.days[3], Thursday: t.days[4] };

  function switchLanguage() { setLanguage(language === "ar" ? "en" : "ar"); }
  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.replace("/login");
  }
  function toggleTask(id: string) { setTasks((current) => current.map((task) => { if (task.id !== id) return task; const updated = { ...task, done: !task.done }; if (userId && supabase) void supabase.from("tasks").update({ done: updated.done }).eq("id", id).eq("user_id", userId); return updated; })); }
  function removeTask(id: string) { setTasks((current) => current.filter((task) => task.id !== id)); if (userId && supabase) void supabase.from("tasks").delete().eq("id", id).eq("user_id", userId); }
  function removeEvent(id: string) { setEvents((current) => current.filter((event) => event.id !== id)); if (userId && supabase) void supabase.from("events").delete().eq("id", id).eq("user_id", userId); }
  function removeBook(id: string) { setBooks((current) => current.filter((book) => book.id !== id)); if (userId && supabase) void supabase.from("books").delete().eq("id", id).eq("user_id", userId); }
  function removeCourse(id: string) { setCourses((current) => current.filter((course) => course.id !== id)); if (userId && supabase) void supabase.from("courses").delete().eq("id", id).eq("user_id", userId); }
  function resetData() { setTasks(initialTasks); setEvents(initialSchedule); setBooks(initialBooks); setCourses(initialCourses); setProfile(initialProfile); }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim(); if (!title) return;
    const task = { id: crypto.randomUUID(), title, course: String(form.get("course") || "").trim(), due: String(form.get("due") || new Date().toISOString().slice(0, 10)), priority: String(form.get("priority")) as Priority, done: false };
    setTasks((current) => [task, ...current]); if (userId && supabase) void supabase.from("tasks").insert({ ...task, user_id: userId });
    setShowTaskForm(false); event.currentTarget.reset();
  }
  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("title") || "").trim(); if (!title) return;
    const item = { id: crypto.randomUUID(), title, course: String(form.get("course") || "").trim(), day: String(form.get("day")), time: String(form.get("time") || "09:00"), kind: String(form.get("kind")) as ClassEvent["kind"] };
    setEvents((current) => [...current, item]); if (userId && supabase) void supabase.from("events").insert({ ...item, user_id: userId });
    setShowEventForm(false); event.currentTarget.reset();
  }
  function addBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("title") || "").trim(); if (!title) return;
    const item = { id: crypto.randomUUID(), title, author: String(form.get("author") || "").trim(), status: String(form.get("status")) as BookStatus, progress: Number(form.get("progress") || 0), note: String(form.get("note") || "").trim() };
    setBooks((current) => [...current, item]); if (userId && supabase) void supabase.from("books").insert({ ...item, user_id: userId });
    setShowBookForm(false); event.currentTarget.reset();
  }
  function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get("name") || "").trim(); if (!name) return;
    const item = { id: crypto.randomUUID(), name, code: String(form.get("code") || "").trim(), color: "bg-sky-100 text-sky-700" };
    setCourses((current) => [...current, item]); if (userId && supabase) void supabase.from("courses").insert({ ...item, user_id: userId });
    setShowCourseForm(false); event.currentTarget.reset();
  }
  function updateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editingTask) return;
    const form = new FormData(event.currentTarget); const title = String(form.get("title") || "").trim(); if (!title) return;
    const updated = { ...editingTask, title, course: String(form.get("course") || "").trim(), due: String(form.get("due") || editingTask.due), priority: String(form.get("priority")) as Priority };
    setTasks((current) => current.map((task) => task.id === updated.id ? updated : task)); if (userId && supabase) void supabase.from("tasks").update({ title: updated.title, course: updated.course, due: updated.due, priority: updated.priority }).eq("id", updated.id).eq("user_id", userId); setEditingTask(null);
  }
  function updateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editingEvent) return;
    const form = new FormData(event.currentTarget); const title = String(form.get("title") || "").trim(); if (!title) return;
    const updated = { ...editingEvent, title, course: String(form.get("course") || "").trim(), day: String(form.get("day") || editingEvent.day), time: String(form.get("time") || editingEvent.time), kind: String(form.get("kind")) as ClassEvent["kind"] };
    setEvents((current) => current.map((item) => item.id === updated.id ? updated : item)); if (userId && supabase) void supabase.from("events").update({ title: updated.title, course: updated.course, day: updated.day, time: updated.time, kind: updated.kind }).eq("id", updated.id).eq("user_id", userId); setEditingEvent(null);
  }
  function updateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editingCourse) return;
    const form = new FormData(event.currentTarget); const name = String(form.get("name") || "").trim(); if (!name) return;
    const updated = { ...editingCourse, name, code: String(form.get("code") || "").trim() };
    setCourses((current) => current.map((course) => course.id === updated.id ? updated : course)); if (userId && supabase) void supabase.from("courses").update({ name: updated.name, code: updated.code }).eq("id", updated.id).eq("user_id", userId); setEditingCourse(null);
  }
  function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get("name") || "").trim();
    if (name) { const updated = { name, weeklyGoal: Math.max(1, Number(form.get("weeklyGoal") || initialProfile.weeklyGoal)) }; setProfile(updated); if (userId && supabase) void supabase.from("profiles").upsert({ id: userId, name: updated.name, weekly_goal: updated.weeklyGoal }); } setShowProfileForm(false);
  }
  function updateBook(id: string, progress: number) { setBooks((current) => current.map((book) => { if (book.id !== id) return book; const updated = { ...book, progress: Math.max(0, Math.min(100, progress)), status: progress >= 100 ? "finished" as BookStatus : book.status }; if (userId && supabase) void supabase.from("books").update({ progress: updated.progress, status: updated.status }).eq("id", id).eq("user_id", userId); return updated; })); }

  const nav: Array<[Tab, string, string]> = [["overview", "▦", t.dashboard], ["tasks", "✓", t.tasks], ["schedule", "◷", t.schedule], ["library", "⌁", t.library], ["courses", "▤", t.courses], ["reminders", "◷", t.reminders]];

  if (isCheckingSession) return <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] text-slate-500">GrowSpace</main>;

  return <main className="min-h-screen bg-[#fffaf5] text-slate-900">
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="hidden w-64 flex-col border-l border-orange-100 bg-white px-5 py-7 lg:flex" dir={language === "ar" ? "rtl" : "ltr"}>
        <Link href="/" className="flex items-center gap-2 px-3 text-2xl font-black tracking-tight"><img src={logoSrc} alt="GrowSpace" className="h-10 w-10 object-contain" /><span>Grow<span className="text-orange-500">Space</span></span></Link>
        <nav className="mt-10 space-y-2">{nav.map(([id, icon, label]) => <button key={id} onClick={() => setTab(id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-right text-sm font-bold transition ${tab === id ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"}`}><span>{icon}</span>{label}</button>)}</nav>
        <button onClick={() => setShowProfileForm(true)} className="mt-auto rounded-3xl bg-orange-50 p-4 text-right"><p className="text-xs font-bold text-orange-600">{t.profile}</p><p className="mt-2 text-sm font-bold">{profile.name}</p><p className="mt-2 text-xs text-slate-500">{t.editProfile}</p></button>
      </aside>

      <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10" dir={language === "ar" ? "rtl" : "ltr"}>
        <header className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-orange-500">GrowSpace</p><h1 className="mt-1 text-xl font-black sm:text-2xl">{t.hello}، {profile.name}</h1></div><div className="flex items-center gap-2"><Link href="/" className="hidden rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-bold text-slate-600 sm:block">{t.back}</Link>{userId && <button onClick={signOut} className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 hover:text-orange-600 sm:block">{t.signOut}</button>}<button onClick={switchLanguage} className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-600">{t.language}</button></div></header>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">{nav.map(([id, icon, label]) => <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${tab === id ? "bg-orange-500 text-white" : "bg-white text-slate-600"}`}>{icon} {label}</button>)}</div>

        {tab === "overview" && <Overview t={t} language={language} tasks={orderedTasks} events={events} completedCount={completedCount} pendingCount={pendingTasks.length} weeklyGoal={profile.weeklyGoal} onAdd={() => setShowTaskForm(true)} onToggle={toggleTask} focusSeconds={focusSeconds} focusRunning={focusRunning} onFocus={() => setFocusRunning((running) => !running)} dayMap={languageDayMap} />}
        {tab === "tasks" && <TasksPanel t={t} language={language} tasks={orderedTasks} onAdd={() => setShowTaskForm(true)} onToggle={toggleTask} onEdit={setEditingTask} onRemove={removeTask} />}
        {tab === "schedule" && <SchedulePanel t={t} events={events} onAdd={() => setShowEventForm(true)} onEdit={setEditingEvent} onRemove={removeEvent} dayMap={languageDayMap} />}
        {tab === "library" && <LibraryPanel t={t} books={books} onAdd={() => setShowBookForm(true)} onProgress={updateBook} onRemove={removeBook} />}
        {tab === "courses" && <CoursesPanel t={t} courses={courses} onAdd={() => setShowCourseForm(true)} onEdit={setEditingCourse} onRemove={removeCourse} />}
        {tab === "reminders" && <RemindersPanel t={t} tasks={reminders} language={language} />}

        {!userId && <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-5 text-xs text-slate-500"><span>{t.resetHint}</span><button onClick={resetData} className="font-bold text-orange-600 hover:underline">{t.reset}</button></div>}
      </section>
    </div>
    {showTaskForm && <Modal title={t.quickAdd} onClose={() => setShowTaskForm(false)}><form onSubmit={addTask} className="space-y-4"><Field name="title" label={t.taskTitle} required /><Select name="course" label={t.course} options={[["", t.noCourse], ...courses.map((course) => [course.name, course.name] as [string, string])]} /><div className="grid gap-4 sm:grid-cols-2"><Field name="due" label={t.due} type="date" defaultValue={new Date().toISOString().slice(0, 10)} /><Select name="priority" label={t.priority} options={[["high", t.high], ["medium", t.medium], ["low", t.low]]} /></div><Submit label={t.add} cancel={t.cancel} onCancel={() => setShowTaskForm(false)} /></form></Modal>}
    {showEventForm && <Modal title={t.addEvent} onClose={() => setShowEventForm(false)}><form onSubmit={addEvent} className="space-y-4"><Field name="title" label={t.eventTitle} required /><Field name="course" label={t.course} /><div className="grid gap-4 sm:grid-cols-2"><Select name="day" label={t.day} options={[["Sunday", t.days[0]], ["Monday", t.days[1]], ["Tuesday", t.days[2]], ["Wednesday", t.days[3]], ["Thursday", t.days[4]]]} /><Field name="time" label={t.time} type="time" defaultValue="09:00" /></div><Select name="kind" label={t.type} options={[["class", t.lecture], ["exam", t.exam]]} /><Submit label={t.add} cancel={t.cancel} onCancel={() => setShowEventForm(false)} /></form></Modal>}
    {showBookForm && <Modal title={t.addBook} onClose={() => setShowBookForm(false)}><form onSubmit={addBook} className="space-y-4"><Field name="title" label={t.bookTitle} required /><Field name="author" label={t.author} /><div className="grid gap-4 sm:grid-cols-2"><Select name="status" label={t.status} options={[["reading", t.reading], ["planned", t.planned], ["finished", t.finished]]} /><Field name="progress" label={`${t.progress} (%)`} type="number" defaultValue="0" /></div><TextArea name="note" label={t.note} /><Submit label={t.save} cancel={t.cancel} onCancel={() => setShowBookForm(false)} /></form></Modal>}
    {showCourseForm && <Modal title={t.addCourse} onClose={() => setShowCourseForm(false)}><form onSubmit={addCourse} className="space-y-4"><Field name="name" label={t.courseName} required /><Field name="code" label={t.courseCode} /><Submit label={t.add} cancel={t.cancel} onCancel={() => setShowCourseForm(false)} /></form></Modal>}
    {showProfileForm && <Modal title={t.profile} onClose={() => setShowProfileForm(false)}><form onSubmit={updateProfile} className="space-y-4"><Field name="name" label={t.name} defaultValue={profile.name} required /><Field name="weeklyGoal" label={t.weeklyGoal} type="number" defaultValue={String(profile.weeklyGoal)} required /><Submit label={t.save} cancel={t.cancel} onCancel={() => setShowProfileForm(false)} /></form></Modal>}
    {editingTask && <Modal title={t.change} onClose={() => setEditingTask(null)}><form onSubmit={updateTask} className="space-y-4"><Field name="title" label={t.taskTitle} defaultValue={editingTask.title} required /><Select name="course" label={t.course} defaultValue={editingTask.course} options={[['', t.noCourse], ...courses.map((course) => [course.name, course.name] as [string, string])]} /><div className="grid gap-4 sm:grid-cols-2"><Field name="due" label={t.due} type="date" defaultValue={editingTask.due} /><Select name="priority" label={t.priority} defaultValue={editingTask.priority} options={[["high", t.high], ["medium", t.medium], ["low", t.low]]} /></div><Submit label={t.save} cancel={t.cancel} onCancel={() => setEditingTask(null)} /></form></Modal>}
    {editingEvent && <Modal title={t.change} onClose={() => setEditingEvent(null)}><form onSubmit={updateEvent} className="space-y-4"><Field name="title" label={t.eventTitle} defaultValue={editingEvent.title} required /><Field name="course" label={t.course} defaultValue={editingEvent.course} /><div className="grid gap-4 sm:grid-cols-2"><Select name="day" label={t.day} defaultValue={editingEvent.day} options={[["Sunday", t.days[0]], ["Monday", t.days[1]], ["Tuesday", t.days[2]], ["Wednesday", t.days[3]], ["Thursday", t.days[4]]]} /><Field name="time" label={t.time} type="time" defaultValue={editingEvent.time} /></div><Select name="kind" label={t.type} defaultValue={editingEvent.kind} options={[["class", t.lecture], ["exam", t.exam]]} /><Submit label={t.save} cancel={t.cancel} onCancel={() => setEditingEvent(null)} /></form></Modal>}
    {editingCourse && <Modal title={t.change} onClose={() => setEditingCourse(null)}><form onSubmit={updateCourse} className="space-y-4"><Field name="name" label={t.courseName} defaultValue={editingCourse.name} required /><Field name="code" label={t.courseCode} defaultValue={editingCourse.code} /><Submit label={t.save} cancel={t.cancel} onCancel={() => setEditingCourse(null)} /></form></Modal>}
  </main>;
}

function Overview({ t, language, tasks, events, completedCount, pendingCount, weeklyGoal, onAdd, onToggle, focusSeconds, focusRunning, onFocus, dayMap }: { t: typeof dashboardCopy[Language]; language: Language; tasks: Task[]; events: ClassEvent[]; completedCount: number; pendingCount: number; weeklyGoal: number; onAdd: () => void; onToggle: (id: string) => void; focusSeconds: number; focusRunning: boolean; onFocus: () => void; dayMap: Record<string, string> }) { const nextEvent = events[0]; const progress = Math.min(100, Math.round((completedCount / weeklyGoal) * 100)); const timer = `${String(Math.floor(focusSeconds / 60)).padStart(2, "0")}:${String(focusSeconds % 60).padStart(2, "0")}`; return <><p className="mt-2 text-slate-500">{t.subtitle}</p><div className="mt-8 grid gap-4 sm:grid-cols-4"><Metric label={t.completed} value={String(completedCount)} icon="✓" color="bg-emerald-50 text-emerald-600" /><Metric label={t.pending} value={String(pendingCount)} icon="◷" color="bg-orange-50 text-orange-600" /><Metric label={t.upcoming} value={nextEvent ? `${dayMap[nextEvent.day]} · ${nextEvent.time}` : "—"} icon="◉" color="bg-violet-50 text-violet-600" /><Metric label={t.weeklyProgress} value={`${progress}%`} icon="↗" color="bg-sky-50 text-sky-600" /></div><div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]"><section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">{t.today}</h2><p className="mt-1 text-sm text-slate-500">{new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p></div><button onClick={onAdd} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">+ {t.quickAdd}</button></div><div className="mt-6 space-y-3">{tasks.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} t={t} language={language} onToggle={() => onToggle(task.id)} />)}{tasks.length === 0 && <p className="py-8 text-center text-slate-500">{t.noTasks}</p>}</div></section><section className="rounded-[2rem] bg-slate-900 p-6 text-white"><p className="text-sm font-bold text-orange-300">{t.focus}</p><h2 className="mt-3 text-2xl font-black">{timer}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{focusRunning ? t.focusActive : t.focusText}</p><button onClick={onFocus} className="mt-6 w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-bold hover:bg-orange-400">{focusRunning ? (language === "ar" ? "إيقاف مؤقت" : "Pause") : t.startFocus}</button></section></div></> }

function TasksPanel({ t, language, tasks, onAdd, onToggle, onEdit, onRemove }: { t: typeof dashboardCopy[Language]; language: Language; tasks: Task[]; onAdd: () => void; onToggle: (id: string) => void; onEdit: (task: Task) => void; onRemove: (id: string) => void }) { return <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">{t.taskList}</h2><p className="mt-1 text-sm text-slate-500">{t.allTasks}</p></div><button onClick={onAdd} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">+ {t.quickAdd}</button></div><div className="mt-7 space-y-3">{tasks.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-[#fffaf5] p-4"><button aria-label={task.done ? t.undo : t.markDone} onClick={() => onToggle(task.id)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${task.done ? "bg-emerald-500 text-white" : "border-2 border-orange-200 text-orange-500"}`}>{task.done ? "✓" : ""}</button><div className="min-w-0 flex-1"><p className={`font-bold ${task.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.course || "—"} · {dateLabel(task.due, language)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${task.priority === "high" ? "bg-red-50 text-red-600" : task.priority === "medium" ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"}`}>{task.priority === "high" ? t.high : task.priority === "medium" ? t.medium : t.low}</span><button onClick={() => onEdit(task)} className="text-xs font-bold text-orange-600 hover:text-orange-700">{t.change}</button><button onClick={() => onRemove(task.id)} className="text-xs font-bold text-slate-400 hover:text-red-500">{t.remove}</button></div>)}{tasks.length === 0 && <p className="py-10 text-center text-slate-500">{t.noTasks}</p>}</div></section> }

function SchedulePanel({ t, events, onAdd, onEdit, onRemove, dayMap }: { t: typeof dashboardCopy[Language]; events: ClassEvent[]; onAdd: () => void; onEdit: (event: ClassEvent) => void; onRemove: (id: string) => void; dayMap: Record<string, string> }) { return <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">{t.scheduleTitle}</h2><p className="mt-1 text-sm text-slate-500">{t.days.join(" · ")}</p></div><button onClick={onAdd} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">+ {t.addEvent}</button></div><div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{events.map((event) => <article className="rounded-3xl bg-[#fffaf5] p-5" key={event.id}><div className="flex justify-between"><span className={`rounded-full px-3 py-1 text-xs font-bold ${event.kind === "exam" ? "bg-violet-100 text-violet-700" : "bg-orange-100 text-orange-700"}`}>{event.kind === "exam" ? t.exam : t.lecture}</span><div className="flex gap-3"><button onClick={() => onEdit(event)} className="text-xs font-bold text-orange-600 hover:text-orange-700">{t.change}</button><button onClick={() => onRemove(event.id)} className="text-xs font-bold text-slate-400 hover:text-red-500">{t.remove}</button></div></div><h3 className="mt-5 font-black">{event.title}</h3><p className="mt-1 text-sm text-slate-500">{event.course || "—"} · {event.time}</p><p className="mt-5 text-sm font-bold text-slate-700">{dayMap[event.day]}</p></article>)}{events.length === 0 && <p className="py-10 text-slate-500">{t.noEvents}</p>}</div></section> }

function LibraryPanel({ t, books, onAdd, onProgress, onRemove }: { t: typeof dashboardCopy[Language]; books: Book[]; onAdd: () => void; onProgress: (id: string, value: number) => void; onRemove: (id: string) => void }) { return <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">{t.libraryTitle}</h2><p className="mt-1 text-sm text-slate-500">{t.reading}</p></div><button onClick={onAdd} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">+ {t.addBook}</button></div><div className="mt-7 grid gap-5 md:grid-cols-2">{books.map((book) => <article className="rounded-3xl border border-orange-100 p-5" key={book.id}><div className="flex gap-4"><div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">📖</div><div className="min-w-0 flex-1"><span className="text-xs font-bold text-orange-600">{book.status === "reading" ? t.reading : book.status === "planned" ? t.planned : t.finished}</span><h3 className="mt-1 truncate text-lg font-black">{book.title}</h3><p className="text-sm text-slate-500">{book.author || "—"}</p></div><button onClick={() => onRemove(book.id)} className="self-start text-xs font-bold text-slate-400 hover:text-red-500">{t.remove}</button></div><div className="mt-5 flex items-center gap-3"><input aria-label={t.progress} type="range" min="0" max="100" value={book.progress} onChange={(event) => onProgress(book.id, Number(event.target.value))} className="accent-orange-500" /><span className="text-sm font-black text-orange-600">{book.progress}%</span></div>{book.note && <p className="mt-4 rounded-2xl bg-[#fffaf5] p-3 text-sm leading-6 text-slate-600">{book.note}</p>}</article>)}{books.length === 0 && <p className="py-10 text-slate-500">{t.noBooks}</p>}</div></section> }

function CoursesPanel({ t, courses, onAdd, onEdit, onRemove }: { t: typeof dashboardCopy[Language]; courses: Course[]; onAdd: () => void; onEdit: (course: Course) => void; onRemove: (id: string) => void }) { return <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">{t.courses}</h2><p className="mt-1 text-sm text-slate-500">{courses.length} {t.courses}</p></div><button onClick={onAdd} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">+ {t.addCourse}</button></div><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <article key={course.id} className="rounded-3xl bg-[#fffaf5] p-5"><div className="flex items-start justify-between gap-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${course.color}`}>{course.code || t.courses}</span><div className="flex gap-3"><button onClick={() => onEdit(course)} className="text-xs font-bold text-orange-600 hover:text-orange-700">{t.change}</button><button onClick={() => onRemove(course.id)} className="text-xs font-bold text-slate-400 hover:text-red-500">{t.remove}</button></div></div><h3 className="mt-5 text-lg font-black">{course.name}</h3></article>)}{courses.length === 0 && <p className="py-10 text-slate-500">{t.noCourses}</p>}</div></section> }

function RemindersPanel({ t, tasks, language }: { t: typeof dashboardCopy[Language]; tasks: Task[]; language: Language }) { return <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100"><div><h2 className="text-2xl font-black">{t.reminders}</h2><p className="mt-1 text-sm text-slate-500">{t.dueSoon}</p></div><div className="mt-7 space-y-3">{tasks.map((task) => <article key={task.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#fffaf5] p-4"><div><h3 className="font-black">{task.title}</h3><p className="mt-1 text-sm text-slate-500">{task.course || t.noCourse}</p></div><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">{dateLabel(task.due, language)}</span></article>)}{tasks.length === 0 && <p className="py-10 text-slate-500">{t.noReminders}</p>}</div></section> }

function Metric({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) { return <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100"><div className="flex items-center justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black ${color}`}>{icon}</span><span className="text-xs font-bold text-slate-400">GrowSpace</span></div><p className="mt-5 text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></article> }
function TaskRow({ task, t, language, onToggle }: { task: Task; t: typeof dashboardCopy[Language]; language: Language; onToggle: () => void }) { return <div className="flex items-center gap-3 rounded-2xl bg-[#fffaf5] p-3"><button onClick={onToggle} aria-label={task.done ? t.undo : t.markDone} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${task.done ? "bg-emerald-500 text-white" : "border-2 border-orange-200 text-orange-500"}`}>{task.done ? "✓" : ""}</button><div className="min-w-0 flex-1"><p className={`truncate text-sm font-bold ${task.done ? "text-slate-400 line-through" : "text-slate-700"}`}>{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.course || "—"} · {dateLabel(task.due, language)}</p></div></div> }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-black">{title}</h2><button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500">×</button></div>{children}</div></div> }
function Field({ name, label, type = "text", required, defaultValue }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string }) { return <label className="block text-sm font-bold text-slate-700">{label}<input required={required} name={name} type={type} defaultValue={defaultValue} min={type === "number" ? "0" : undefined} max={type === "number" ? "100" : undefined} className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fffaf5] px-4 py-3 outline-none focus:border-orange-400" /></label> }
function TextArea({ name, label }: { name: string; label: string }) { return <label className="block text-sm font-bold text-slate-700">{label}<textarea name={name} rows={3} className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fffaf5] px-4 py-3 outline-none focus:border-orange-400" /></label> }
function Select({ name, label, options, defaultValue }: { name: string; label: string; options: Array<[string, string]>; defaultValue?: string }) { return <label className="block text-sm font-bold text-slate-700">{label}<select name={name} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fffaf5] px-4 py-3 outline-none focus:border-orange-400">{options.map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label> }
function Submit({ label, cancel, onCancel }: { label: string; cancel: string; onCancel: () => void }) { return <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 rounded-full bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600">{label}</button><button type="button" onClick={onCancel} className="rounded-full border border-orange-100 px-5 py-3 font-bold text-slate-600">{cancel}</button></div> }
