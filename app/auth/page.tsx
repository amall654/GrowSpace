"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";

export default function AuthPage() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const ar = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = ar ? "rtl" : "ltr";
  }, [language, ar]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) { setMessage(ar ? "لم يتم ربط قاعدة البيانات بعد." : "The database has not been connected yet."); return; }
    setLoading(true); setMessage("");
    const redirectTo = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/dashboard/`;
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setMessage(error ? error.message : (ar ? "تحققي من بريدك لإكمال تسجيل الدخول." : "Check your email to complete sign-in."));
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] p-5 text-slate-900" dir={ar ? "rtl" : "ltr"}>
    <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl shadow-orange-100 ring-1 ring-orange-100"><div className="flex items-center justify-between"><Link href="/" className="text-xl font-black">Grow<span className="text-orange-500">Space</span></Link><button onClick={() => setLanguage(ar ? "en" : "ar")} className="rounded-full border border-orange-200 px-3 py-2 text-xs font-bold text-orange-600">{ar ? "English" : "العربية"}</button></div><p className="mt-10 text-sm font-bold text-orange-500">{ar ? "حساب الطالب" : "Student account"}</p><h1 className="mt-2 text-3xl font-black">{ar ? "ابدأ مساحتك الدراسية" : "Start your study space"}</h1><p className="mt-3 leading-7 text-slate-500">{ar ? "اكتب بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لتسجيل الدخول." : "Enter your email and we’ll send you a secure sign-in link."}</p><form onSubmit={submit} className="mt-8"><label className="text-sm font-bold">{ar ? "البريد الإلكتروني" : "Email address"}<input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="name@example.com" className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fffaf5] px-4 py-3 outline-none focus:border-orange-400" /></label><button disabled={loading || !configured} className="mt-5 w-full rounded-full bg-orange-500 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-orange-200">{loading ? (ar ? "جارٍ الإرسال..." : "Sending...") : (ar ? "أرسل رابط الدخول" : "Send sign-in link")}</button></form>{message && <p className="mt-4 text-sm font-bold text-orange-600" role="status">{message}</p>}{!configured && <p className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-orange-700">{ar ? "وضع الإعداد: ستعمل هذه الصفحة بعد إضافة مفاتيح Supabase في ملف .env.local." : "Setup mode: this page will work after adding Supabase keys to .env.local."}</p>}<Link href="/dashboard" className="mt-6 block text-center text-sm font-bold text-slate-500 hover:text-orange-500">{ar ? "العودة إلى لوحة التجربة" : "Return to demo dashboard"}</Link></section>
  </main>;
}
