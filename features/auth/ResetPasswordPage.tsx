"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isArabic, setIsArabic] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/growspace-logo.png`;

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("growspace-language");
    setIsArabic(savedLanguage !== "en");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setIsReady(Boolean(data.session)));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") || "");
    if (password.length < 6) { setStatus({ kind: "error", text: isArabic ? "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل." : "Your password must be at least 6 characters long." }); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setStatus({ kind: "error", text: isArabic ? "تعذر تغيير كلمة المرور. اطلب رابطًا جديدًا وحاول مرة أخرى." : "We could not update your password. Request a new link and try again." }); return; }
    setStatus({ kind: "success", text: isArabic ? "تم تغيير كلمة المرور. سيتم فتح لوحة التحكم الآن." : "Your password has been updated. Opening your dashboard now." });
    window.setTimeout(() => router.replace("/dashboard"), 1200);
  }

  return <main dir={isArabic ? "rtl" : "ltr"} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfaf8] px-5 py-8 text-slate-900"><div className="absolute inset-x-0 top-0 h-1.5 bg-orange-500" /><section className="relative w-full max-w-[470px]"><header className="mb-8 flex items-center justify-between"><Link href="/" className="flex items-center gap-2.5"><img src={logoSrc} alt="GrowSpace" className="h-10 w-10 rounded-xl bg-white p-1 shadow-sm ring-1 ring-orange-100" /><span className="text-xl font-black">Grow<span className="text-orange-500">Space</span></span></Link><button onClick={() => setIsArabic((value) => !value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">{isArabic ? "English" : "العربية"}</button></header><article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.32)] sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">{isArabic ? "كلمة مرور جديدة" : "NEW PASSWORD"}</p><h1 className="mt-3 text-2xl font-black sm:text-3xl">{isArabic ? "أنشئ كلمة مرور جديدة" : "Choose a new password"}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{isArabic ? "استخدم كلمة مرور من 6 أحرف أو أكثر لحماية حسابك." : "Use a password with at least 6 characters to protect your account."}</p>{isReady ? <form onSubmit={submit} className="mt-7 space-y-5"><label className="block text-sm font-bold text-slate-700">{isArabic ? "كلمة المرور الجديدة" : "New password"}<input name="password" required minLength={6} type="password" autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" /></label><button className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white hover:bg-orange-600">{isArabic ? "حفظ كلمة المرور" : "Save password"}</button>{status && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-bold ${status.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{status.text}</p>}</form> : <div className="mt-7 rounded-xl bg-orange-50 p-4 text-sm leading-6 text-orange-800">{isArabic ? "رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة تسجيل الدخول." : "This reset link is invalid or has expired. Request a new link from the sign-in page."}</div>}<Link href="/login" className="mt-6 block text-center text-sm font-black text-orange-600 hover:text-orange-700">{isArabic ? "العودة إلى تسجيل الدخول" : "Back to sign in"}</Link></article></section></main>;
}
