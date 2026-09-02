"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [isArabic, setIsArabic] = useState(true);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/growspace-logo.png`;

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("growspace-language");
    setIsArabic(savedLanguage !== "en");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setStatus({ kind: "error", text: isArabic ? "تعذر الاتصال بالخدمة. حاول مرة أخرى لاحقًا." : "We could not connect to the service. Please try again shortly." }); return; }
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${basePath}/reset-password/` });
    setStatus(error
      ? { kind: "error", text: isArabic ? "تعذر إرسال رابط الاستعادة. تحقق من البريد وحاول مرة أخرى." : "We could not send the reset link. Check the email and try again." }
      : { kind: "success", text: isArabic ? "إذا كان البريد مسجلًا، أرسلنا إليه رابطًا لإعادة تعيين كلمة المرور." : "If this email is registered, we sent it a password reset link." });
  }

  return <main dir={isArabic ? "rtl" : "ltr"} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfaf8] px-5 py-8 text-slate-900">
    <div className="absolute inset-x-0 top-0 h-1.5 bg-orange-500" />
    <section className="relative w-full max-w-[470px]">
      <header className="mb-8 flex items-center justify-between"><Link href="/" className="flex items-center gap-2.5"><img src={logoSrc} alt="GrowSpace" className="h-10 w-10 rounded-xl bg-white p-1 shadow-sm ring-1 ring-orange-100" /><span className="text-xl font-black">Grow<span className="text-orange-500">Space</span></span></Link><button onClick={() => setIsArabic((value) => !value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">{isArabic ? "English" : "العربية"}</button></header>
      <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.32)] sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">{isArabic ? "استعادة الحساب" : "ACCOUNT RECOVERY"}</p>
        <h1 className="mt-3 text-2xl font-black sm:text-3xl">{isArabic ? "استعد كلمة المرور" : "Reset your password"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{isArabic ? "أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لإنشاء كلمة مرور جديدة." : "Enter your email and we’ll send you a secure link to choose a new password."}</p>
        <form onSubmit={submit} className="mt-7 space-y-5"><label className="block text-sm font-bold text-slate-700">{isArabic ? "البريد الإلكتروني" : "Email address"}<input name="email" required type="email" autoComplete="email" placeholder="name@example.com" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" /></label><button className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white hover:bg-orange-600">{isArabic ? "أرسل رابط الاستعادة" : "Send reset link"}</button>{status && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-bold ${status.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{status.text}</p>}</form>
        <Link href="/login" className="mt-6 block text-center text-sm font-black text-orange-600 hover:text-orange-700">{isArabic ? "العودة إلى تسجيل الدخول" : "Back to sign in"}</Link>
      </article>
    </section>
  </main>;
}
