# Theming & tokens

Dark-first "brand-blue-on-dim-navy" identity (primary = brand blue `#015B91`, hue ~245; the dark theme dims its surfaces with the brand navy `#002F5D`'s hue and lightens the same blue for its primary). Every color in the kit resolves through CSS variables in `src/style.css` — **rebranding a consuming project is a token-file edit; components never change.**

## Architecture (Tailwind v4)

`src/style.css` is the single theme file:

1. **`:root { … }`** — light theme tokens as oklch CSS variables (`--background`, `--foreground`, `--primary`, `--success`, `--warning`, `--destructive`, `--muted`, `--accent`, `--border`, `--ring`, `--card`, `--sidebar*`, `--chart-*`, `--radius`…).
2. **`.dark { … }`** — the same token set, dim-navy values (surfaces tinted with the brand navy hue, lighter than the background for layering). Dark is the design-primary theme.
3. **`@theme inline { … }`** — maps the variables into Tailwind, so `bg-primary`, `text-success`, `border-destructive`, `ring-ring`, etc. exist as utilities with full opacity-modifier support (`bg-primary/10`).
4. **`@utility` blocks** — the kit's custom utilities:

| Utility | What |
|---|---|
| `num` | Mono + `tabular-nums` + LTR isolation for digit runs |
| `glow-primary` | The signature brand glow — max once per screen (primary action) |
| `bg-grid` | Subtle grid texture (empty states, dropzones, 404) |
| `bg-halo` | Radial halo behind the main scroll area |
| `scroll-x` | Horizontal-only overflow with a thin indicator-style scrollbar (StatCard long amounts) |
| `cn-rtl-flip` | Mirrors a glyph under RTL |
| `cn-shake` | Rejected-PIN shake; no-op under `prefers-reduced-motion` |

`@theme inline` also defines `animate-progress-indeterminate` (keyframes sliding on the logical `inset-inline-start`, frozen under reduced motion) — it powers `Progress`'s indeterminate mode.

5. **Base rules** — RTL input direction (see [rtl.md](rtl.md)), focus-visible, scrollbar styling.

## Theme switching

`useTheme()` (`src/composables/useTheme.ts`) is a module-scope singleton over `@vueuse/core`'s `useColorMode` (initial `dark`: **dark-first** — a first-time visitor gets dark regardless of their OS setting; the choice persists once toggled, and `toggle()` flips dark↔light. To follow the system until the user picks, change `initialValue` to `"auto"` in `useTheme.ts`). The `ThemeToggle` topbar button and the SettingsPage appearance cards share the same instance — reuse `useTheme()`, never instantiate `useColorMode` yourself.

`index.html`'s `theme-color` meta matches the dark background (`#101924` = precise sRGB of `oklch(0.21 0.025 253)`).

## Rules for component code

- Use semantic utilities only: `bg-card`, `text-muted-foreground`, `border-border`, `text-success`… Never `bg-[#22c55e]`, never `text-green-500`, never inline oklch.
- Charts/sparklines take CSS variables as paint: `color: var(--chart-1)` / `var(--destructive)` (see `Sparkline.vue` usage in `StatCard.vue`).
- Status colors: `success` (mint-green family, hue ~166 — deliberately distinct from the blue brand primary), `warning` (amber), `destructive` (red) exist as tokens AND badge variants — map statuses via `StatusBadge`, not ad-hoc classes.
- One deliberate exception exists: SettingsPage's theme-preview swatches hardcode the *opposite* theme's colors (live vars can't express that); it's commented there. Don't add new exceptions.

## Rebranding checklist (consuming project)

1. Edit `:root` + `.dark` variable values in `src/style.css` (primary hue, radius, chart palette).
2. If you swap fonts: update the font-family stack in `style.css` and self-host the files.
3. Run the dev server and check `/reference/components` in BOTH themes and BOTH directions — every component reads from the tokens, so the whole kit recolors at once.
4. `npm run check` — the conventions test asserts the token names still exist (don't rename tokens; change values).
