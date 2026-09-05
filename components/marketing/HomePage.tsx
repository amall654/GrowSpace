"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { homeCopy, type Language } from "../../app/i18n";

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<"" | "error" | "success">("");
  const t = homeCopy[language];
  const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/growspace-logo.png`;

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
        <a className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900" href="#top"><img src={logoSrc} alt="GrowSpace" className="h-9 w-9 object-contain" /><span>Grow<span className="text-orange-500">Space</span></span></a>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features" className="hover:text-orange-500">{t.nav[0]}</a>
          <a href="#how-it-works" className="hover:text-orange-500">{t.nav[1]}</a>
          <a href="#reading" className="hover:text-orange-500">{t.nav[2]}</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={switchLanguage} className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-50" aria-label="Change language">{t.language}</button>
        </div>
      </header>

      <section id="top" className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="relative z-10">
          <p className="mb-5 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">{t.eyebrow}</p>
          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">{t.lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/demo" className="rounded-full bg-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">{language === "ar" ? "جرّب المنصة الآن" : "Try the platform now"}</Link><Link href="/login" className="text-sm font-bold text-orange-600 hover:text-orange-700">{t.join}</Link>
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

      <section id="reading" className="mx-auto max-w-6xl px-6 py-20 lg:px-8"><div className="grid items-center gap-12 rounded-[2rem] bg-orange-50 px-7 py-10 sm:px-10 lg:grid-cols-2 lg:px-14"><div><p className="text-sm font-bold text-orange-500">{t.readingLabel}</p><h2 className="mt-3 text-3xl font-black tracking-tight">{t.readingTitle}</h2><p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">{t.readingLead}</p></div><div className="flex flex-wrap gap-3">{t.readingPills.map((pill, index) => <span className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm" key={pill}>{["📖", "✍", "✦"][index]} {pill}</span>)}</div></div></section>

      <section id="how-it-works" className="bg-white py-20"><div className="mx-auto max-w-6xl px-6 lg:px-8"><h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">{t.journeyTitle}</h2><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{t.steps.map(([number, title, text]) => <div className="relative" key={number}><span className="text-5xl font-black text-orange-100">{number}</span><h3 className="mt-3 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></div></section>

      <section id="waitlist" className="px-6 py-20 lg:px-8"><div className="mx-auto max-w-3xl rounded-[2rem] bg-slate-900 px-7 py-12 text-center text-white sm:px-12"><p className="text-sm font-bold text-orange-300">GrowSpace</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">{t.waitTitle}</h2><p className="mx-auto mt-4 max-w-xl text-slate-300">{t.waitLead}</p><form onSubmit={submitWaitlist} noValidate className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="email">{t.email}</label><input id="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFeedback(""); }} placeholder={t.email} className="min-w-0 flex-1 rounded-full border border-white/15 bg-white px-5 py-3.5 text-slate-900 outline-none ring-orange-400 focus:ring-2" /><button className="rounded-full bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600" type="submit">{t.submit}</button></form>{feedback && <p className={`mt-4 text-sm font-bold ${feedback === "success" ? "text-emerald-300" : "text-orange-300"}`} role="status">{feedback === "success" ? t.success : t.invalid}</p>}</div></section>

      <footer className="border-t border-orange-100 px-6 py-7 text-center text-sm font-medium text-slate-500"><p>{t.footer}</p><div className="mt-3 flex justify-center gap-5 text-xs font-bold text-orange-600"><Link href="/privacy">{language === "ar" ? "سياسة الخصوصية" : "Privacy policy"}</Link><Link href="/terms">{language === "ar" ? "شروط الاستخدام" : "Terms of use"}</Link></div></footer>
    </main>
  );
}
