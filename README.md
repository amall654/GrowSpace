# GrowSpace

منصة لتنظيم أنشطة طلاب الجامعات، بالعربية والإنجليزية، مع مساحة قراءة اختيارية.

## فصل الموقع والتطبيق

```text
GrowSpace/
├── Website/       # مشروع الموقع المستقل
├── mobileapp/     # مكان تطبيق الجوال المستقل
└── .github/       # إعدادات المستودع ونشر الموقع
```

- [Website](Website/README.md): كود الموقع، الواجهات، الترجمة، الصور، إعدادات Next.js، الاعتماديات، وإعدادات Firebase الخاصة بالموقع.
- [mobileapp](mobileapp/README.md): مجلد مستقل مخصص لتطبيق الجوال. لا يوجد تطبيق جوال منفذ بعد.
- لا توجد مكتبة كود مشتركة، أو استيرادات بين المشروعين، أو إعدادات بناء مشتركة. ملفات Git والتوثيق في الجذر لإدارة المستودع فقط.

لتشغيل الموقع:

```sh
cd Website
pnpm install --frozen-lockfile
pnpm dev
```

التفاصيل والاختبارات في [دليل الموقع](Website/README.md). نشر GitHub Pages يبني `Website` فقط.

## Website and mobile app isolation

`Website` is a self-contained Next.js project with its own source, assets, translations, dependencies, environment configuration, and build output. Run its commands from that directory.

`mobileapp` is reserved for a separate mobile application; no mobile app has been implemented yet. Its future source, assets, dependencies, environment files, and build settings must live inside that directory. Neither product imports files from the other, and there is no shared runtime package or root package-manager workspace.

Repository documentation and GitHub workflow files remain at the root. The deployment workflow builds only `Website`.
