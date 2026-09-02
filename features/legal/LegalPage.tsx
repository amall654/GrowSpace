"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Kind = "privacy" | "terms";

export default function LegalPage({ kind }: { kind: Kind }) {
  const [isArabic, setIsArabic] = useState(true);
  const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/growspace-logo.png`;
  useEffect(() => { setIsArabic(sessionStorage.getItem("growspace-language") !== "en"); }, []);
  const privacy = kind === "privacy";
  const title = isArabic ? (privacy ? "سياسة الخصوصية" : "شروط الاستخدام") : (privacy ? "Privacy policy" : "Terms of use");
  const items = isArabic
    ? privacy ? [["البيانات التي نحفظها", "نحفظ بيانات الحساب التي تدخلها، مثل البريد الإلكتروني، وبيانات الدراسة التي تضيفها: المواد والمهام والمواعيد والكتب."], ["طريقة الحماية", "تُدار المصادقة والبيانات عبر Supabase، ولا يستطيع أي مستخدم الوصول إلى بيانات مستخدم آخر."], ["تحكمك في بياناتك", "يمكنك تعديل بياناتك أو حذفها من لوحة التحكم. لحذف الحساب نهائيًا، تواصل مع مالك المنصة."]]
      : [["استخدام المنصة", "GrowSpace مساحة شخصية لتنظيم الدراسة. استخدمها بطريقة قانونية ولا تحاول الوصول إلى حسابات أو بيانات الآخرين."], ["حسابك", "أنت مسؤول عن حماية كلمة مرورك وصحة البيانات التي تضيفها إلى حسابك."], ["تغييرات الخدمة", "قد نطور المنصة أو نغير هذه الشروط عند الحاجة. استمرارك في الاستخدام يعني موافقتك على النسخة المحدثة."]]
    : privacy ? [["Data we store", "We store the account information and study data you choose to add, including courses, tasks, events, and books."], ["How it is protected", "Authentication and data are managed through Supabase. Each user can access only their own data."], ["Your control", "You can edit or delete your data from the dashboard. Contact the platform owner to permanently remove an account."]]
      : [["Using the platform", "GrowSpace is a personal study-organizing space. Use it lawfully and never attempt to access another person’s account or data."], ["Your account", "You are responsible for protecting your password and for the data you add to your account."], ["Service changes", "We may improve the platform or update these terms when needed. Continued use means acceptance of the updated version."]];
  return <main dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-[#fffdf9] px-6 py-8 text-slate-900"><header className="mx-auto flex max-w-3xl items-center justify-between"><Link href="/" className="flex items-center gap-2"><img src={logoSrc} alt="GrowSpace" className="h-9 w-9" /><span className="text-xl font-black">Grow<span className="text-orange-500">Space</span></span></Link><button onClick={() => setIsArabic((value) => !value)} className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-600">{isArabic ? "English" : "العربية"}</button></header><article className="mx-auto mt-12 max-w-3xl rounded-[2rem] border border-orange-100 bg-white p-7 shadow-sm sm:p-10"><p className="text-sm font-bold text-orange-500">GrowSpace</p><h1 className="mt-3 text-3xl font-black">{title}</h1><p className="mt-4 leading-7 text-slate-600">{isArabic ? "آخر تحديث: سبتمبر 2026" : "Last updated: September 2026"}</p><div className="mt-10 space-y-8">{items.map(([heading, text]) => <section key={heading}><h2 className="text-lg font-black">{heading}</h2><p className="mt-2 leading-7 text-slate-600">{text}</p></section>)}</div><Link href="/" className="mt-10 inline-block font-black text-orange-600 hover:text-orange-700">{isArabic ? "العودة إلى الصفحة الرئيسية" : "Back to home"}</Link></article></main>;
}
