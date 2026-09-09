# GrowSpace Web

موقع Next.js مستقل عن مجلد تطبيق الجوال. يستخدم Firebase Authentication للحسابات وCloud Firestore لبيانات الطالب. البيانات تحت `users/{uid}`، والمواد والمهام والمواعيد والكتب مجموعات فرعية خاصة بالحساب.

## التشغيل

```sh
pnpm install --frozen-lockfile
pnpm dev
```

الإعداد العام للتطبيق في `lib/firebase/config.ts`؛ لا يحتوي مفاتيح إدارة خاصة. انسخ `.env.example` إلى `.env.local` عند الحاجة إلى المحاكيات. لا تستخدم مفاتيح Service Account في المتصفح. لا تُهيَّأ Analytics أو Messaging أو Storage أو AI في هذه المرحلة.

## الحسابات والبيانات

- البريد وكلمة المرور وGoogle عبر Firebase Authentication.
- لا تفتح بيانات الحساب قبل تأكيد البريد؛ يقدم التسجيل إعادة إرسال رابط التحقق وفحص اكتماله.
- إعادة تعيين كلمة المرور تتم برمز إجراء Firebase صالح؛ لا تكفي جلسة حساب عامة.
- البيانات تقرأ من الخادم، وعمليات التعديل تستخدم معاملات مع رقم إصدار لمنع الكتابة فوق تعديل أحدث.
- تظهر المدخلات غير المحفوظة كمسودات محلية تحت مفتاح خاص بمعرّف Firebase؛ تعاد مراجعتها يدويًا بعد الدخول للحساب نفسه. لا تُخزّن كلمات المرور أو رموز الجلسة في المسودات.
- إعادة محاولة الكتابة نفسها لا تكرر السجل. المسودة المتعارضة لا تستبدل بيانات الخادم تلقائيًا.
- اسم المادة للعرض؛ الربط يستخدم `courseId`. يتطلب حذف مادة مرتبطة فك ارتباط عناصرها من نماذج التعديل أولًا؛ خيارات الحذف الجماعي في SRS ما زالت متطلبًا مستهدفًا.
- المواعيد الحالية أسبوعية؛ الاختبار المؤرخ والمؤشرات الأسبوعية التفصيلية ما زالت ضمن فجوات SRS.

## المعاينة

`/preview` و`/demo` يعرضان الأمثلة الثابتة نفسها، دون تسجيل أو تعديل أو تخزين أو استدعاء Firebase. التنقل والتصفية واللغة حالات مؤقتة في الذاكرة. رابط إنشاء الحساب يفتح `/login/?mode=signup`.

## الاختبارات

يلزم Node.js متوافق مع الأدوات وJava 21 أو أحدث للمحاكي.

```sh
pnpm typecheck
pnpm test:firebase
pnpm build
```

اختبارات `tests/firebase.test.ts` تعمل على `demo-growspace` فقط: عزل الحسابات، منع الزائر والحساب غير المؤكد، التحقق من المدخلات، تعارض المسودات وعدم تكرار الكتابة. رسائل رفض الصلاحيات متوقعة في اختبارات الرفض.

لتجربة الموقع على المحاكيات، شغّل `pnpm emulators` واضبط `NEXT_PUBLIC_FIREBASE_EMULATORS=true` قبل تشغيل نسخة تطوير منفصلة. لا تضبطه على true في النشر.

## تجهيز Firebase والنشر

1. سجّل الدخول في CLI: `node node_modules/firebase-tools/lib/bin/firebase.js login`، وأكمل التفويض بنفسك؛ لا تشارك رمز الدخول.
2. تحقق من مشروع `growspace-c516a` والبريد وGoogle ونطاقات الدخول المسموحة.
3. أنشئ قاعدة Firestore باسم `(default)` بنمط Production واختر موقعها قبل الإنشاء. لا تستخدم قواعد Test Mode المفتوحة.
4. ابنِ الموقع ثم انشر القواعد والاستضافة باستخدام `pnpm deploy:firebase` بعد مراجعة الجاهزية.
5. تحقق من التسجيل وGoogle وكتابة بيانات حساب اختبار على النطاق المنشور.

ملف `firebase.json` مهيأ للاستضافة الثابتة. النشر الحالي في GitHub Pages لا يزال متاحًا ويستخدم الإعداد العام نفسه؛ حذف متغيرات مزود البيانات السابق من سير البناء لا ينقل الاستضافة تلقائيًا. راجع `MIGRATION.md` لحالة الانتقال والمهام الخارجية المتبقية.

## English

Next.js static web app using Firebase Authentication and private Firestore subcollections. Email verification is required before account data access. Firestore writes are server-confirmed transactions; per-account local drafts are reviewed before retry, and stale revisions are rejected. Preview routes never initialize Firebase or access browser storage. File uploads, AI, push messaging and analytics are not enabled by this migration. Production deployment and old-service retirement require the separate checks in MIGRATION.md.
