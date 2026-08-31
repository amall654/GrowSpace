"use client";

import { FormEvent, useEffect, useState } from "react";

type Language = "ar" | "en";

const copy = {
  ar: {
    nav: ["المزايا", "كيف تعمل", "القراءة"],
    language: "English",
    join: "انضم للقائمة",
    eyebrow: "رفيقك الدراسي اليومي",
    title: "نظّم دراستك، واصنع مساحة للنمو.",
    lead: "GrowSpace تجمع جدولك، مهامك، وأهدافك الدراسية في مكان هادئ يساعدك على إنجاز ما يهمك.",
    heroNote: "مساحة القراءة اختيارية — لأن خطتك الدراسية هي الأساس.",
    previewTitle: "نظرة اليوم",
    previewTasks: ["مراجعة محاضرة البرمجة", "تسليم مشروع واجهة المستخدم", "جلسة تركيز لمدة 25 دقيقة"],
    previewDone: "تم إنجاز 2 من 4 مهام",
    featuresTitle: "كل ما تحتاجينه ليوم دراسي أوضح",
    featuresLead: "أدوات بسيطة مصممة حول طريقة حياة الطالب، لا حول التعقيد.",
    features: [
      ["▦", "جدولك الأكاديمي", "رتّبي المحاضرات، الاختبارات، والمواعيد المتكررة في نظرة واحدة."],
      ["✓", "مهامك ومشاريعك", "أضيفي واجباتك وحددي الأولوية وتاريخ التسليم وحالة الإنجاز."],
      ["◷", "تذكيرات في وقتها", "لا تدعي موعدًا مهمًا يفوتك مع تنبيهات واضحة ولطيفة."],
      ["◉", "تركيز وأهداف", "تابعي جلسات التركيز وخطواتك الصغيرة نحو أهدافك الدراسية."],
      ["⌁", "مكتبتك الاختيارية", "سجّلي تقدمك وملخصاتك للكتب عندما ترغبين في وقت للقراءة."],
    ],
    readingTitle: "القراءة إضافة لطيفة، وليست عبئًا.",
    readingLead: "استخدمي مكتبتك الخاصة لتتبعي الكتب وتكتبي ملاحظاتك، أو تجاهليها تمامًا وركّزي على جدولك ومهامك.",
    readingPills: ["أقرأه الآن", "ملخصاتك", "أهداف القراءة"],
    journeyTitle: "ابدئي في أربع خطوات بسيطة",
    steps: [
      ["01", "أنشئي مساحتك", "ابدئي بحسابك الشخصي."],
      ["02", "أضيفي جدولك", "سجّلي المحاضرات والاختبارات."],
      ["03", "خططي لمهامك", "حددي الأولويات ومواعيد التسليم."],
      ["04", "تابعي تقدمك", "أنجزي، راجعي، واحتفلي بالخطوات الصغيرة."],
    ],
    waitTitle: "كوني من أوائل من يجربون GrowSpace",
    waitLead: "سجّلي بريدك لتصلك أخبار الإطلاق والتحديثات الأولى.",
    email: "البريد الإلكتروني",
    submit: "انضم الآن",
    invalid: "يرجى إدخال بريد إلكتروني صحيح.",
    success: "شكرًا لانضمامك! سنبقيك على اطلاع عند الإطلاق.",
    footer: "GrowSpace — مساحة منظمة لحياة الطالب.",
  },
  en: {
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
  },
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<"" | "error" | "success">("");
  const t = copy[language];

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("growspace-language");
    if (savedLanguage === "ar" || savedLanguage === "en") setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    sessionStorage.setItem("growspace-language", language);
  }, [language]);

  function switchLanguage() {
    setLanguage((current) => (current === "ar" ? "en" : "ar"));
    setFeedback("");
  }

  function submitWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setFeedback(validEmail ? "success" : "error");
    if (validEmail) setEmail("");
  }

  return (
    <main className="overflow-hidden bg-[#fffdf9] text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <a className="text-xl font-black tracking-tight text-slate-900" href="#top">Grow<span className="text-orange-500">Space</span></a>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features" className="hover:text-orange-500">{t.nav[0]}</a>
          <a href="#how-it-works" className="hover:text-orange-500">{t.nav[1]}</a>
          <a href="#reading" className="hover:text-orange-500">{t.nav[2]}</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={switchLanguage} className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-50" aria-label="Change language">{t.language}</button>
          <a href="#waitlist" className="hidden rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 sm:block">{t.join}</a>
        </div>
      </header>

      <section id="top" className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="relative z-10">
          <p className="mb-5 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">{t.eyebrow}</p>
          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">{t.lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#waitlist" className="rounded-full bg-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">{t.join}</a>
            <span className="text-sm font-medium text-slate-500">{t.heroNote}</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-100 blur-2xl" />
          <div className="relative rounded-[2rem] border border-orange-100 bg-white p-5 shadow-2xl shadow-orange-100/70">
            <div className="mb-5 flex items-center justify-between">
              <div><p className="text-xs font-bold text-orange-500">GrowSpace</p><h2 className="mt-1 text-lg font-black">{t.previewTitle}</h2></div>
              <span className="rounded-xl bg-orange-50 px-3 py-2 text-xl">☀</span>
            </div>
            <div className="space-y-3">
              {t.previewTasks.map((task, index) => <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3" key={task}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-orange-500 text-white" : "border-2 border-orange-200 text-orange-400"}`}>{index === 0 ? "✓" : ""}</span><span className="text-sm font-semibold text-slate-700">{task}</span></div>)}
            </div>
            <div className="mt-5 rounded-2xl bg-orange-500 p-4 text-white"><div className="flex justify-between text-xs font-bold"><span>{t.previewDone}</span><span>50%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30"><div className="h-full w-1/2 rounded-full bg-white" /></div></div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-bold text-orange-500">GrowSpace</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t.featuresTitle}</h2><p className="mt-4 text-lg leading-8 text-slate-600">{t.featuresLead}</p></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{t.features.map(([icon, title, text]) => <article key={title} className="rounded-3xl border border-slate-100 bg-[#fffdf9] p-6 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-xl font-bold text-orange-600">{icon}</span><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div>
        </div>
      </section>

      <section id="reading" className="mx-auto max-w-6xl px-6 py-20 lg:px-8"><div className="grid items-center gap-12 rounded-[2rem] bg-orange-50 px-7 py-10 sm:px-10 lg:grid-cols-2 lg:px-14"><div><p className="text-sm font-bold text-orange-500">{language === "ar" ? "مكتبتك الخاصة" : "Your personal library"}</p><h2 className="mt-3 text-3xl font-black tracking-tight">{t.readingTitle}</h2><p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">{t.readingLead}</p></div><div className="flex flex-wrap gap-3">{t.readingPills.map((pill, index) => <span className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm" key={pill}>{["📖", "✍", "✦"][index]} {pill}</span>)}</div></div></section>

      <section id="how-it-works" className="bg-white py-20"><div className="mx-auto max-w-6xl px-6 lg:px-8"><h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">{t.journeyTitle}</h2><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{t.steps.map(([number, title, text]) => <div className="relative" key={number}><span className="text-5xl font-black text-orange-100">{number}</span><h3 className="mt-3 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></div></section>

      <section id="waitlist" className="px-6 py-20 lg:px-8"><div className="mx-auto max-w-3xl rounded-[2rem] bg-slate-900 px-7 py-12 text-center text-white sm:px-12"><p className="text-sm font-bold text-orange-300">GrowSpace</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">{t.waitTitle}</h2><p className="mx-auto mt-4 max-w-xl text-slate-300">{t.waitLead}</p><form onSubmit={submitWaitlist} noValidate className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="email">{t.email}</label><input id="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFeedback(""); }} placeholder={t.email} className="min-w-0 flex-1 rounded-full border border-white/15 bg-white px-5 py-3.5 text-slate-900 outline-none ring-orange-400 focus:ring-2" /><button className="rounded-full bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600" type="submit">{t.submit}</button></form>{feedback && <p className={`mt-4 text-sm font-bold ${feedback === "success" ? "text-emerald-300" : "text-orange-300"}`} role="status">{feedback === "success" ? t.success : t.invalid}</p>}</div></section>

      <footer className="border-t border-orange-100 px-6 py-7 text-center text-sm font-medium text-slate-500">{t.footer}</footer>
    </main>
  );
}
