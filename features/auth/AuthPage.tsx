"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authCopy, type Language } from "../../app/i18n";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";

export default function AuthPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("ar");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<"" | "success" | "error">("");
  const isArabic = language === "ar";
  const t = authCopy[language];
  const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/growspace-logo.png`;

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("growspace-language");
    if (savedLanguage === "ar" || savedLanguage === "en") setLanguage(savedLanguage);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("error"); return; }
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) { setMessage("error"); return; }
    if (isSignUp && !result.data.session) { setMessage("success"); return; }
    router.replace("/dashboard");
  }

  return <main dir={isArabic ? "rtl" : "ltr"} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfaf8] px-5 py-8 text-slate-900">
    <div className="absolute inset-x-0 top-0 h-1.5 bg-orange-500" />
    <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-orange-100/60 blur-3xl" />
    <div className="absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-orange-50 blur-3xl" />

    <section className="relative w-full max-w-[470px]">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5"><img src={logoSrc} alt="GrowSpace" className="h-10 w-10 rounded-xl bg-white p-1 shadow-sm ring-1 ring-orange-100" /><span className="text-xl font-black tracking-tight">Grow<span className="text-orange-500">Space</span></span></Link>
        <button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:text-orange-600">{isArabic ? "English" : "العربية"}</button>
      </header>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.32)]">
        <div className="border-b border-slate-100 px-7 pb-6 pt-8 sm:px-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">{isSignUp ? (isArabic ? "إنشاء حساب" : "CREATE ACCOUNT") : (isArabic ? "تسجيل الدخول" : "SIGN IN")}</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{isSignUp ? (isArabic ? "ابدأ مساحتك الدراسية" : "Create your study space") : (isArabic ? "مرحبًا بعودتك" : "Welcome back")}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{isSignUp ? t.lead : (isArabic ? "سجّل دخولك لمتابعة خطتك ومهامك الدراسية." : "Sign in to continue with your study plan and tasks.")}</p>
        </div>

        <form onSubmit={submit} className="space-y-5 px-7 py-7 sm:px-9">
          <label className="block text-sm font-bold text-slate-700">{t.email}<input name="email" required type="email" autoComplete="email" placeholder="name@example.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-50" /></label>
          <label className="block text-sm font-bold text-slate-700">{t.password}<input name="password" required minLength={6} type="password" autoComplete={isSignUp ? "new-password" : "current-password"} placeholder="••••••••" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-50" /></label>
          <button type="submit" className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200">{isSignUp ? t.signUp : t.signIn}</button>
          {message && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-bold ${message === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message === "success" ? t.success : t.error}</p>}
        </form>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-7 py-5 text-sm sm:px-9">
          <span className="text-slate-500">{isSignUp ? (isArabic ? "لديك حساب؟" : "Already have an account?") : (isArabic ? "مستخدم جديد؟" : "New to GrowSpace?")}</span>
          <button onClick={() => { setIsSignUp((value) => !value); setMessage(""); }} className="font-black text-orange-600 hover:text-orange-700">{isSignUp ? (isArabic ? "تسجيل الدخول" : "Sign in") : (isArabic ? "إنشاء حساب" : "Create account")}</button>
        </div>
      </article>

      <p className="mt-6 text-center text-xs leading-6 text-slate-400">{isArabic ? "GrowSpace تساعدك على تنظيم يومك الدراسي — القراءة ميزة اختيارية." : "GrowSpace helps you organize your study day — reading is optional."}</p>
    </section>
  </main>;
}
