# أمِن UI — Aamin UI Kit

نظام تصميم عربي RTL-أولًا للوحات التحكم، مبني على أحدث النسخ:
**Vue 3.5 · Vite 8 · Tailwind CSS 4 · shadcn-vue (reka-ui) · TypeScript**

هذا المشروع هو **نظام التصميم فقط** — تخطيطات ومكوّنات جاهزة بدون أي منطق
أعمال أو اتصال بخادم. ابنِ عليه تطبيقك.

## استخدام الطقم في مشاريع أخرى / Using this kit elsewhere

This is ALAMANTECH's design-system kit, published for reference and for use in ALAMANTECH projects (all rights reserved — see the end of this file). A new project installs it from the public shadcn-vue registry (**[docs/registry.md](docs/registry.md)**) or clones it as a template (**[docs/new-project.md](docs/new-project.md)**); either way the project owns its copy of the source.

The kit is also published as a public **shadcn-vue registry** (`@aamin`, no token needed): create a fresh Vite app with the starter as its preset (`npx shadcn-vue@2.7.4 init -t vite -n my-app --preset https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/r/starter.json -y`), or pull a single component later — see **[docs/registry.md](docs/registry.md)**.

AI agents working in this repo or any project cloned from it: **[AGENTS.md](AGENTS.md)** is your contract (conventions, component inventory, trap list), with deep-dives in [docs/](docs/). A drift test keeps it honest — undocumented components fail `npm run check`.

## التشغيل

```bash
npm install
npm run dev      # http://localhost:3100
npm run build    # vue-tsc + vite build
```

## ماذا يوجد بالداخل

**سطح التطبيق فارغ عمدًا** — صفحة بداية واحدة (`/`) وصفحة 404. ابنِ شاشاتك مكانها.

**المرجع الحي** (وضع التطوير فقط — لا يُشحن مع نسخة الإنتاج أبدًا) تحت `/reference/*`:

| المسار (dev فقط) | المحتوى |
| --- | --- |
| `/reference/components` | التوثيق الحي لكل المكوّنات — 43 مكوّنًا بأمثلة عربية RTL |
| `/reference/overview` | لوحة إحصائيات: بطاقات مع Sparklines، مخطط أعمدة، سجل نشاط |
| `/reference/tables` | نمط شاشة الجداول الكامل على DataTable |
| `/reference/forms` | تخطيط النماذج: أقسام، تحقق، شريط حفظ |
| `/reference/profile` | الملف الشخصي: غلاف، تبويبات، الأمان |
| `/reference/settings` | الإعدادات: تنقّل جانبي، أقسام، منطقة الخطر |
| `/reference/login` | تخطيط الدخول: شاشة مقسومة + خطوة تحقق (OTP) |

مصدر هذه الصفحات في `src/pages/reference/` — انسخ منها أنماط شاشاتك الحقيقية.

## البنية

- `src/components/ui/` — 43 مكوّن shadcn-vue (أُضيفت عبر CLI — أعد توليدها أو أضف
  غيرها بـ `npx shadcn-vue@latest add <name>`)
- `src/components/app/` — المكوّنات المركّبة: `StatCard`, `Sparkline`,
  `PageHeader`, `EmptyState`, `PinConfirm`, `Timeline`, `CopyButton`, `Kbd`,
  `AppSidebar`, `AppTopbar`, `CommandMenu`, `ThemeToggle`, `LocaleToggle`,
  `ShowcaseSection`
- `src/layouts/` — `DashboardLayout` (شريط جانبي قابل للطي + درج للموبايل)
- `src/composables/` — `useTheme` (داكن افتراضيًا)، `useLocale` (العربية افتراضيًا، تحدّد الاتجاه)، `useDir` (RTL افتراضيًا)
- `src/lib/nav.ts` — مصدر واحد لعناصر التنقل (الشريط الجانبي + لوحة الأوامر ⌘K)؛ مجموعات المشروع في `src/lib/nav.app.ts`

## الهوية

- **الألوان**: جرافيت مائل للأزرق + لون أساسي أزرق مؤسسي مضيء (`#015B91`،
  oklch في `src/style.css`). الوضعان الداكن والفاتح مدعومان؛ الداكن هو الافتراضي.
- **الخطوط**: Rubik Variable (عربي + لاتيني) للنصوص، IBM Plex Mono للأرقام —
  مستضافة ذاتيًا عبر fontsource.
- **أدوات مخصصة**: `num` (أرقام أحادية المسافة LTR)، `bg-grid`، `bg-halo`.
  `glow-primary` مرة واحدة كحد أقصى للإجراء الأساسي في الصفحة؛ استخدامات
  الهوية الثابتة في الشريط الجانبي مستثناة.

## قواعد الاستخدام

1. خصائص الاتجاه المنطقية فقط (`ms/me/ps/pe/start/end`) — لا `ml/mr`.
2. كل رقم داخل `class="num"`، والعملة خارج النطاق الرقمي. حقول الإدخال ذات
   المحتوى اللاتيني (email/tel/url/number أو `.num`) تُحاذى لليمين تلقائيًا عبر
   قاعدة عامة في `style.css` — لا تضف `dir="ltr"` أو `text-start` يدويًا عليها.
3. أيقونات `@lucide/vue` فقط عبر `@/lib/icons`، وكل زر أيقوني له `aria-label` من مفاتيح vue-i18n (`src/locales/<lang>/*.json`) — لا نصوص مكتوبة مباشرة.
4. اللون للحالة والمعنى فقط — لا زخرفة.
5. رغم تفعيل `rtl: true` في `components.json`، يجب مراجعة ناتج كل
   `npx shadcn-vue@latest add` يدويًا بحثًا عن كلاسات فيزيائية (`ml/mr`،
   `text-left/right`) — العلم يحسّن الناتج لكنه لا يضمنه.

## الترخيص / License

لا يوجد ترخيص مفتوح المصدر: جميع الحقوق محفوظة. الكود منشور للاطلاع ولاستخدامه في مشاريع ALAMANTECH.

No open-source license is granted. The code is published for reference and for use by ALAMANTECH projects.

حقوق النشر © 2026 ALAMANTECH. جميع الحقوق محفوظة.

Copyright © 2026 ALAMANTECH. All rights reserved.
