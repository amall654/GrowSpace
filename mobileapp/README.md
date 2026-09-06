# GrowSpace — Mobile App

هذا المجلد مخصص لتطبيق GrowSpace للجوال، ويظل مستقلًا بالكامل عن الموقع الموجود في `Website`.

## الحالة الحالية

لا يوجد تطبيق جوال منفذ بعد، ولم يُعتمد إطار عمل للجوال. هذا المجلد يحجز مكان التطبيق ضمن الهيكلة الجديدة؛ لا يحتوي على نسخة من الموقع أو تطبيق قابل للتشغيل حاليًا.

## قواعد الاستقلال

- توضع ملفات التطبيق وواجهاته وترجماته وصوره داخل هذا المجلد.
- عند بدء التنفيذ، يُنشأ ملف اعتماديات وإعدادات بناء وقفل إصدارات خاص بالتطبيق داخل هذا المجلد، وفق إطار العمل المعتمد.
- يكون تثبيت الاعتماديات والتشغيل والاختبار والبناء من داخل هذا المجلد.
- لا تُستورد ملفات من `../Website` أو من حزمة مشتركة في جذر المستودع.
- يحتفظ التطبيق بإعدادات البيئة الخاصة به؛ لا تُقرأ ملفات بيئة الموقع ولا تُرفع الأسرار إلى Git.

## English

This directory is reserved for the independent GrowSpace mobile app. No mobile application or mobile framework has been set up yet.

Keep all future mobile source, translations, assets, dependency manifests, lockfiles, environment files, and build configuration here. Install, run, test, and build from this directory. Do not import from `Website` or rely on a shared root package or on the website's environment files.
