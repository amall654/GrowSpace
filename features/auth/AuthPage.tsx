"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { authCopy, type Language } from "../../app/i18n";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";

export default function AuthPage() {
  const [language, setLanguage] = useState<Language>("ar");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<"" | "success" | "error">("");
  const t = authCopy[language];

  useEffect(() => {
    const stored = sessionStorage.getItem("growspace-language");
    if (stored === "ar" || stored === "en") setLanguage(stored);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("error"); return; }
    const result = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) { setMessage("error"); return; }
    if (isSignUp && !result.data.session) { setMessage("success"); return; }
    window.location.assign("/dashboard");
  }

  return <main dir={language === "ar" ? "rtl" : "ltr"} className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-5 text-slate-900"><section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl shadow-orange-100 ring-1 ring-orange-100"><div className="flex items-center justify-between"><Link href="/" className="text-xl font-black">Grow<span className="text-orange-500">Space</span></Link><button onClick={() => setLanguage((current) => current === "ar" ? "en" : "ar")} className="rounded-full border border-orange-200 px-3 py-2 text-xs font-bold text-orange-600">{language === "ar" ? "English" : "العربية"}</button></div><h1 className="mt-10 text-3xl font-black">{t.title}</h1><p className="mt-3 text-slate-500">{t.lead}</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-bold">{t.email}<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fffaf5] px-4 py-3 outline-none focus:border-orange-400" /></label><label className="block text-sm font-bold">{t.password}<input name="password" type="password" minLength={6} required className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fffaf5] px-4 py-3 outline-none focus:border-orange-400" /></label><button className="w-full rounded-full bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600" type="submit">{isSignUp ? t.signUp : t.signIn}</button></form>{message && <p className={`mt-4 text-sm font-bold ${message === "error" ? "text-red-600" : "text-emerald-600"}`}>{message === "error" ? t.error : t.success}</p>}<button onClick={() => { setIsSignUp((current) => !current); setMessage(""); }} className="mt-6 w-full text-sm font-bold text-orange-600">{isSignUp ? t.switchToSignIn : t.switchToSignUp}</button></section></main>;
}
