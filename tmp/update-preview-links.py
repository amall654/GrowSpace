from pathlib import Path
root=Path('Website')
p=root/'components/marketing/HomePage.tsx'
s=p.read_text(encoding='utf-8-sig').replace('href="/demo"','href="/preview"').replace('جرّب المنصة الآن','استعرض لوحة الطالب').replace('Try the platform now','Preview the student dashboard')
p.write_text(s,encoding='utf8')
for locale in ['ar','en']:
 p=root/f'app/i18n/{locale}.ts'; s=p.read_text(encoding='utf-8-sig')
 s=s.replace('reset: "إعادة بيانات التجربة", resetHint: "تم حفظ بياناتك في هذا المتصفح فقط.", ', '').replace('reset: "Reset demo data", resetHint: "Your data is stored in this browser only.", ', '')
 p.write_text(s,encoding='utf8')
p=root/'app/i18n/types.ts';s=p.read_text(encoding='utf-8-sig').replace('reset: string; resetHint: string; ', '');p.write_text(s,encoding='utf8')
p=root/'features/dashboard/data.ts';p.write_text('import type { Profile } from "./types";\n\nexport const initialProfile: Profile = { name: "طالب", weeklyGoal: 5 };\n',encoding='utf8')
p=root/'features/legal/LegalPage.tsx';s=p.read_text(encoding='utf-8-sig').replace('privacy ? [["البيانات التي نحفظها"', 'privacy ? [["معاينة لوحة الطالب", "تعرض المعاينة أمثلة تعليمية ثابتة فقط، دون جمع بيانات المستخدم أو قراءة تخزينه المحلي أو الحفظ محليًا أو سحابيًا. تختلف عنها مساحة الحساب المسجل."], ["البيانات التي نحفظها"').replace('privacy ? [["Data we store"', 'privacy ? [["Student dashboard preview", "The preview shows fixed educational examples only. It does not collect user data, read browser storage, or save data locally or to the cloud. Signed-in accounts use a separate workspace."], ["Data we store"');p.write_text(s,encoding='utf8')
