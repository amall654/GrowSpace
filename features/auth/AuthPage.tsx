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
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isArabic = language === "ar";
  const t = authCopy[language];
  const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/growspace-logo.png`;

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("growspace-language");
    if (savedLanguage === "ar" || savedLanguage === "en") setLanguage(savedLanguage);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage({ kind: "error", text: isArabic ? "تعذر الاتصال بالخدمة. حاول مرة أخرى لاحقًا." : "We could not connect to the service. Please try again shortly." }); setIsSubmitting(false); return; }
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      const errorText = result.error.message.toLowerCase();
      const text = errorText.includes("invalid login") || errorText.includes("invalid credentials")
        ? (isArabic ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "The email address or password is incorrect.")
        : errorText.includes("already registered")
          ? (isArabic ? "هذا البريد الإلكتروني مسجل بالفعل. سجّل دخولك أو استعد كلمة المرور." : "This email is already registered. Sign in or reset your password.")
          : errorText.includes("password")
            ? (isArabic ? "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل." : "Your password must be at least 6 characters long.")
            : t.error;
      setMessage({ kind: "error", text });
      setIsSubmitting(false);
      return;
    }
    if (isSignUp && !result.data.session) { setMessage({ kind: "success", text: t.success }); setIsSubmitting(false); return; }
    router.replace("/dashboard");
  }

  async function continueWithGoogle() {
    setMessage(null);
    setIsSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage({ kind: "error", text: isArabic ? "تعذر الاتصال بالخدمة. حاول مرة أخرى لاحقًا." : "We could not connect to the service. Please try again shortly." }); setIsSubmitting(false); return; }
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}${basePath}/dashboard/` } });
    if (error) { setMessage({ kind: "error", text: isArabic ? "تسجيل Google غير مفعّل بعد. أكملي إعداد Google في Supabase ثم حاولي مرة أخرى." : "Google sign-in is not enabled yet. Complete the Google setup in Supabase and try again." }); setIsSubmitting(false); }
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
          <label className="block text-sm font-bold text-slate-700">{t.password}<span className="relative mt-2 block"><input name="password" required minLength={6} type={showPassword ? "text" : "password"} autoComplete={isSignUp ? "new-password" : "current-password"} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-14 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-50" /><button type="button" aria-label={showPassword ? (isArabic ? "إخفاء كلمة المرور" : "Hide password") : (isArabic ? "إظهار كلمة المرور" : "Show password")} title={showPassword ? (isArabic ? "إخفاء كلمة المرور" : "Hide password") : (isArabic ? "إظهار كلمة المرور" : "Show password")} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 left-2 my-1 flex w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-orange-50 hover:text-orange-600"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true"><path d={showPassword ? "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" : "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a18.8 18.8 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6a10.9 10.9 0 0 0 3.1-.5"} /><circle cx="12" cy="12" r="3" /></svg></button></span></label>
          <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-orange-300">{isSubmitting ? (isArabic ? "جارٍ المتابعة..." : "Please wait...") : isSignUp ? t.signUp : t.signIn}</button>
          {!isSignUp && <Link href="/forgot-password" className="block text-left text-sm font-bold text-orange-600 hover:text-orange-700">{isArabic ? "هل نسيت كلمة المرور؟" : "Forgot your password?"}</Link>}
          <div className="flex items-center gap-3 pt-1 text-xs font-bold text-slate-400"><span className="h-px flex-1 bg-slate-200" />{isArabic ? "أو" : "OR"}<span className="h-px flex-1 bg-slate-200" /></div>
          <button type="button" disabled={isSubmitting} onClick={continueWithGoogle} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-[#4285F4] ring-1 ring-slate-200">G</span>{isArabic ? "المتابعة باستخدام Google" : "Continue with Google"}</button>
          {message && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-bold ${message.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message.text}</p>}
        </form>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-7 py-5 text-sm sm:px-9">
          <span className="text-slate-500">{isSignUp ? (isArabic ? "لديك حساب؟" : "Already have an account?") : (isArabic ? "مستخدم جديد؟" : "New to GrowSpace?")}</span>
          <button onClick={() => { setIsSignUp((value) => !value); setMessage(null); }} className="font-black text-orange-600 hover:text-orange-700">{isSignUp ? (isArabic ? "تسجيل الدخول" : "Sign in") : (isArabic ? "إنشاء حساب" : "Create account")}</button>
        </div>
      </article>

      <p className="mt-6 text-center text-xs leading-6 text-slate-400">{isArabic ? "GrowSpace تساعدك على تنظيم يومك الدراسي — القراءة ميزة اختيارية." : "GrowSpace helps you organize your study day — reading is optional."}</p>
    </section>
  </main>;
}
