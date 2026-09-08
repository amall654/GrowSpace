# GrowSpace

> **مساحة واحدة تساعد الطالب على تنظيم يومه الأكاديمي وبناء عادات تدعم نموه.**
> **One space for students to organize their academic day and build habits that support their growth.**

## معاينة لوحة الطالب

المسار `/preview` يعرض لوحة تفاعلية للعرض فقط ببيانات تعليمية ثابتة. يمكن التنقل بين الأقسام وتصفية المهام وتبديل اللغة، دون إنشاء البيانات أو تعديلها أو حذفها أو حفظها. حالة العرض مؤقتة في الذاكرة فقط؛ لا تقرأ المعاينة جلسة الحساب أو `localStorage` أو `sessionStorage`، ولا تتصل بـ Supabase. يعرض `/demo` القديم المعاينة نفسها لتوافق الروابط، وأُزيلت تجربة البيانات القابلة للتعديل. بطاقة الرئيسية تعرض أمثلة ثابتة أيضًا.

بيانات الأمثلة في `features/preview/data.ts` مستقلة عن الحساب، وتستخدم تاريخًا تعليميًا ثابتًا ظاهرًا في الواجهة. لا تُستورد بيانات التجربة القديمة إلى المعاينة ولا تُحذف بيانات متصفح المستخدم تلقائيًا.

## تنظيم الموقع وتشغيله / Website structure and development

هذا المجلد مشروع الموقع فقط، وهو مستقل عن `mobileapp`. جميع أوامر الموقع تُنفذ من داخل `Website`، ولا يعتمد على ملفات أو حزم من تطبيق الجوال.

```text
Website/
├── app/                 # صفحات Next.js وتخطيط الموقع والترجمة في i18n
├── features/            # الحسابات، لوحة الطالب، وصفحات السياسات
├── components/          # مكونات الموقع، ومنها صفحة الهبوط
├── lib/supabase/        # اتصال الموقع بخدمة Supabase
├── public/              # صور وأصول الموقع
├── supabase/            # تعريف جداول وسياسات قاعدة بيانات الموقع
├── package.json         # أوامر الموقع واعتمادياته فقط
├── pnpm-lock.yaml       # الإصدارات المقفلة لاعتماديات الموقع
└── .env.example         # أسماء إعدادات البيئة دون مفاتيح حقيقية
```

```sh
cd Website
pnpm install --frozen-lockfile
pnpm dev
```

لإعداد نسخة جديدة محليًا، أنشئ `.env.local` داخل `Website` باستخدام أسماء المتغيرات في `.env.example`. هذا الملف محلي ومتجاهل من Git. إعداد تسجيل Google مؤجل حاليًا.

```sh
pnpm typecheck
pnpm build
```

يُنتج البناء ملفات الموقع الثابتة داخل `Website/out`. مسار صفحات الموقع المنشور لا يتغير بسبب اسم هذا المجلد. إعداد النشر في `.github/workflows/deploy-pages.yml` يبني هذا المشروع وحده.

This directory contains only the website. Its source, assets, dependencies, environment files, and build settings are independent of `mobileapp`. Run installation, development, type checking, and builds from `Website`. For a fresh checkout, create a local `.env.local` using the variable names in `.env.example`; never commit credentials. Google sign-in remains deferred. Static export writes to `Website/out`, and the repository-level GitHub workflow deploys only this directory's build.

The directory reorganization preserves existing product behavior; it does not complete pending authentication, persistence, or release-readiness work.

## العربية

### عن المشروع

**GrowSpace** هي منصة ويب متجاوبة موجهة لطلاب الجامعات، تساعدهم على تنظيم الأنشطة الأكاديمية والشخصية في مكان واحد. تركز المنصة على إدارة الجداول والمهام والواجبات والاختبارات، بحيث يعرف الطالب ما الذي يجب عليه إنجازه اليوم وما الذي ينتظره لاحقًا.

تُعد مساحة القراءة ميزة اختيارية مساندة للتطور الشخصي، وليست محور المنصة أو شرطًا لاستخدامها.

### المشكلة

يستخدم الطالب غالبًا أدوات متعددة لمتابعة المحاضرات، الواجبات، الاختبارات، والمواعيد الشخصية. هذا التشتت قد يجعل ترتيب الأولويات ومتابعة الإنجاز أكثر صعوبة. تهدف GrowSpace إلى جمع هذه الاحتياجات في تجربة واحدة بسيطة ومخصصة للطلاب.

### الهدف والقيمة

تهدف المنصة إلى مساعدة الطالب على إدارة وقته بوضوح، الالتزام بالمواعيد المهمة، وتحويل أهدافه الدراسية إلى مهام قابلة للمتابعة. تقدم GrowSpace نظرة يومية سهلة، بدلاً من أن يحتاج الطالب إلى التنقل بين عدة تطبيقات.

### الفئة المستهدفة

- طلاب الجامعات بوصفهم الجمهور الأساسي.
- طلاب المدارس في مراحل لاحقة.
- الطلاب الذين يرغبون في تنظيم الدراسة والحياة اليومية بطريقة أبسط.

### مزايا النسخة الأولى

- **لوحة يومية:** عرض مهام اليوم، المواعيد القريبة، ونظرة سريعة على التقدم.
- **الجدول الأكاديمي:** تنظيم المحاضرات والاختبارات والمواعيد المتكررة.
- **إدارة المهام:** إضافة واجبات ومشاريع مع تاريخ استحقاق، أولوية، وحالة إنجاز.
- **التذكيرات:** تنبيهات بالمواعيد والمهام المهمة.
- **الأهداف والتركيز:** متابعة أهداف الدراسة وتسجيل جلسات تركيز مبسطة.

### المكتبة والقراءة — ميزة اختيارية

توفر GrowSpace مساحة اختيارية للطلاب المهتمين بالقراءة، وتشمل:

- حفظ الكتب ضمن حالات مثل: أرغب في قراءته، أقرأه الآن، أنهيته.
- متابعة تقدم القراءة.
- كتابة ملخصات وملاحظات واقتباسات شخصية.
- تحديد أهداف قرائية بسيطة.

هذه المساحة مستقلة عن أدوات التنظيم الأساسية؛ يستطيع الطالب استخدامها أو تجاهلها دون أن يؤثر ذلك في تجربته داخل المنصة.

### رحلة استخدام مختصرة

1. ينشئ الطالب حسابه ويضيف محاضراته واختباراته إلى الجدول.
2. يضيف واجباته ومشاريعه، ويحدد موعدها وأولويتها.
3. يراجع لوحة اليوم لمعرفة ما يجب إنجازه، ثم يحدّث حالة مهامه عند إكمالها.
4. يمكنه اختياريًا إضافة كتاب إلى مكتبته، وتسجيل تقدمه وملخصه الشخصي.

### التقنيات المقترحة

- **Next.js:** لبناء موقع ويب سريع ومتجاوب يعمل على الجوال واللابتوب.
- **Tailwind CSS:** لتصميم واجهة واضحة ومتسقة.
- **Supabase:** لتسجيل الدخول، قاعدة البيانات، وتخزين الملفات عند الحاجة.

ستُصمم الخدمات الخلفية وبيانات المستخدمين بطريقة تسمح مستقبلًا بإنشاء تطبيق جوال يستخدم الحسابات والبيانات نفسها.

### التطوير المستقبلي

- تطبيق جوال لأندرويد وآيفون.
- إحصاءات أكثر تفصيلًا عن الإنجاز والدراسة.
- مشاركة اختيارية للملخصات أو التحديات مع الآخرين.
- اقتراحات كتب بحسب التخصص أو الاهتمامات.

### حالة المشروع والمساهمة

الموقع حاليًا **نسخة أولية قيد التطوير والاختبار**. المزايا المذكورة تصف نطاق المنتج المستهدف، وليست تأكيدًا على اكتمال جميع وظائفه أو جاهزيته للإطلاق العام. نرحب بالأفكار والملاحظات التي تساعد على جعل GrowSpace أكثر فائدة للطلاب.

---

## English

### About the project

**GrowSpace** is a responsive web platform for university students. It helps them organize academic and personal activities in one place. The platform focuses on schedules, tasks, assignments, projects, and exams, so students can clearly see what needs to be done today and what is coming next.

The reading space is an optional feature that supports personal growth; it is not the platform's main purpose or a requirement for using it.

### The problem

Students often use separate tools for lectures, assignments, exams, and personal appointments. This fragmentation can make it harder to prioritize and track progress. GrowSpace brings these needs together in one simple student-focused experience.

### Goal and value

The platform aims to help students manage time clearly, keep up with important deadlines, and turn academic goals into trackable tasks. GrowSpace provides an easy daily overview instead of requiring students to move between several apps.

### Target audience

- University students as the primary audience.
- School students in later stages.
- Students who want a simpler way to organize study and daily life.

### First-release features

- **Daily dashboard:** Shows today’s tasks, upcoming events, and a quick progress overview.
- **Academic schedule:** Organizes lectures, exams, and recurring events.
- **Task management:** Adds assignments and projects with due dates, priorities, and completion status.
- **Reminders:** Notifies students about important events and tasks.
- **Goals and focus:** Tracks study goals and simple focus sessions.

### Library and reading — an optional feature

GrowSpace includes an optional space for students who enjoy reading:

- Save books with statuses such as want to read, currently reading, and completed.
- Track reading progress.
- Write personal summaries, notes, and favorite quotes.
- Set simple reading goals.

This space is independent from the core organization tools. Students can use or ignore it without affecting their main platform experience.

### Short user journey

1. A student creates an account and adds lectures and exams to the schedule.
2. They add assignments and projects with deadlines and priorities.
3. They check the daily dashboard, complete tasks, and update their status.
4. Optionally, they add a book to their library and record their reading progress and personal summary.

### Proposed technology stack

- **Next.js:** Builds a fast, responsive web experience for mobile and laptop use.
- **Tailwind CSS:** Creates a clear and consistent interface.
- **Supabase:** Provides authentication, a database, and file storage when needed.

The backend services and user data will be structured so a future mobile application can use the same accounts and data.

### Future development

- A mobile application for Android and iOS.
- More detailed productivity and study insights.
- Optional sharing of summaries or challenges with others.
- Book recommendations based on a student’s major or interests.

### Project status and contributions

The website is an **initial version under development and testing**. The features above describe the intended product scope, not a claim that all functionality is complete or ready for public release. Ideas and feedback that can make GrowSpace more useful for students are welcome.
