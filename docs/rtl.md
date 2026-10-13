# RTL playbook

Arabic is this kit's first language; LTR is the secondary direction. Every component must render correctly in BOTH — the language toggle in the topbar (`LocaleToggle`) switches locale and direction together, live.

## How direction flows

- **Locale owns direction.** `useLocale()` (`src/composables/useLocale.ts`) holds the persisted UI language. Each entry in `LOCALES` (`src/lib/locales.app.ts`, re-exported by `src/lib/i18n.ts`) declares its `dir`; one module-scope `watchEffect` pushes the chosen locale into vue-i18n, its `dir` into `useDir()`, and its code into `<html lang>`. Switch language with `useLocale().set(code)` / `toggle()` — **never write `dir` alone**, or direction and language drift apart.
- **Locale files.** `src/lib/i18n.ts` merges `src/locales/<code>/*.json` per locale code; the kit-owned namespace files merge first and `app.json` (project-owned) merges last, so a project overrides kit strings without editing kit files.
- `useDir()` (`src/composables/useDir.ts`) is a module-scope singleton — a plain, **non-persisted** `ref` (the persisted source is the locale, which rewrites it on every load) — holding `dir: "rtl" | "ltr"`, mirrored onto `<html dir>` by a module-scope `watchEffect`. Read it (it feeds `ConfigProvider`); don't toggle it.
- `src/App.vue` wraps the app in reka-ui's `<ConfigProvider :dir="dir">` — **this is what makes every reka primitive (selects, menus, sheets, pin inputs…) direction-aware**. Without it they'd all render LTR. Never remove it; never hardcode `dir` on containers.
- CSS logical properties do the rest: `ms-*` = margin-inline-start = right in RTL, left in LTR.

## The lint guard (why your physical class errors)

`eslint.config.ts` sets `vue/no-restricted-class` to **error** with these patterns:

```
/^(ml|mr|pl|pr)-/   /^-?(left|right)-\d/   text-left   text-right
/^border-l(-|$)/    /^border-r(-|$)/       /^rounded-l-/   /^rounded-r-/
```

A physical utility renders mirrored-wrong in one of the two directions — always. There are no exceptions; if you think you need `left-0`, you need `start-0`.

## Cheat table (physical → logical)

| Never | Always |
|---|---|
| `ml-* / mr-*` | `ms-* / me-*` |
| `pl-* / pr-*` | `ps-* / pe-*` |
| `left-* / right-*` | `start-* / end-*` (also `-start-*` negatives) |
| `text-left / text-right` | `text-start / text-end` |
| `border-l / border-r` | `border-s / border-e` |
| `rounded-l-* / rounded-r-*` | `rounded-s-* / rounded-e-*` |
| `translate-x-*` for direction-dependent movement | `rtl:` variant pair (see switch) or `cn-rtl-flip` |

## The three text/glyph tools

- **`.num`** (`@utility num` in `src/style.css`): mono font, `tabular-nums`, LTR-isolated. Wrap EVERY digit run — `12,400`, `2026-07-10`, `TX-84921`, `+18.2%`, phone numbers. Without it, digits jumble inside Arabic text.
- **`cn-rtl-flip`**: mirrors a glyph under RTL (`scaleX(-1)`). For direction-semantic icons: back/forward arrows, prev/next chevrons (`ChevronLeftIcon class="cn-rtl-flip"`). Do NOT flip vertical or symmetric icons (sort arrows, trends, plus, search).
- **`<bdi>`**: isolates mixed-script runs so Latin filenames/codes don't scramble surrounding Arabic — `<bdi class="truncate">{{ file.name }}</bdi>` (see FileDropzone).

## Form-input direction

`src/style.css` has a base rule: under `[dir="rtl"]`, `input[type=email|tel|url|number]`, `input.num`, and `textarea.num` get `direction: ltr; text-align: right` — Latin-content fields type correctly while staying visually right-aligned. **Do not** add per-input `dir="ltr"` hacks; the base rule covers it. PIN/OTP inputs are the exception that carries explicit `dir="ltr"` (inside PinConfirm).

## Component-level RTL fixes already in place (don't undo)

- **switch**: thumb translate uses paired `rtl:` negated variants — upstream's physical translate escapes the track in RTL.
- **progress**: fills via logical `width` in a flex track (inline-start anchored) — not `translateX`.
- **sheet**: drawer side resolves from `dir` (`side="dir === 'rtl' ? 'right' : 'left'"` in `DashboardLayout`).
- **sonner**: toast corner is direction-aware.
- **calendar/range-calendar**: nav arrows mirror via `cn-rtl-flip`; week starts Saturday; Latin digits (`ar-LY-u-nu-latn`).

## Verifying RTL work

1. `npm run check` — `src/__tests__/rtl-conventions.spec.ts` globs `src/components/ui` + `src/pages` for banned physical utilities.
2. In the browser (dev server, port 3100): toggle direction from the topbar and eyeball the screen in BOTH directions — labels on the correct side, chevrons mirrored, digits stable.
3. For geometry bugs (a thumb/fill on the wrong side), measure with `getBoundingClientRect()` against the container rather than trusting screenshots.
