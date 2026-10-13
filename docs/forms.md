# Forms — validation, dates, numbers, Arabic search

Stack: **vee-validate + zod** via `@vee-validate/zod` (`toTypedSchema`). Living references: `src/pages/reference/FormsPage.vue` (layouts) and the ComponentsPage **schema-form** section (the canonical validated form).

## The schema-form pattern (copy this)

```ts
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

const schema = toTypedSchema(z.object({
  posName: z.string().min(1, "اسم نقطة البيع مطلوب"),
  phone: z.string().regex(/^09\d{8}$/, "رقم ليبي يبدأ بـ 09"),
  amount: z.number().min(1, "الحد الأدنى دينار واحد"),
}));

const { handleSubmit, resetForm } = useForm({ validationSchema: schema, initialValues: { … } });
const onSubmit = handleSubmit((values) => { /* typed values */ });
```

Template side uses the `ui/form` Field family (`FormField` + `FormItem/FormLabel/FormControl/FormMessage`) — error messages are the Arabic strings from the zod schema, wired to `aria-invalid` + `aria-describedby` automatically.

## Rules

- **Error messages are Arabic** and live in the schema, not the template.
- **Label above the field, always** (`Label` / `FormLabel`); hint or error below.
- Manual (non-schema) fields still wire `aria-invalid="true"` + a `text-destructive` hint linked by `aria-describedby` — see the inputs section of ComponentsPage.
- Search inputs: icon absolutely positioned `start-2.5`, input padded `ps-8`.
- Amount/numeric inputs get `class="num"`; `input-group` supplies currency addons.

## Field-type guide

| Need | Use | Notes |
|---|---|---|
| Fixed option set | `select` | `native-select` for dense/mobile contexts |
| Searchable options (Arabic) | `SearchableSelect` (single) / `MultiSelect` (many) | Replaces "copy the combobox demo" — see below |
| Bounded quantity | `number-field` | min/max/step; steppers + wheel |
| Single date | `DateField` | Never a native `type="date"` — see below |
| Time of day | `TimeField` | Never a native `type="time"` — 24-hour `HH:MM` |
| Date range (report filters) | `range-calendar` | Same config; `{ start, end }` model |
| Multiple short values | `tags-input` | Enter adds a tag |
| One-of-few visible | `radio-group` / `toggle-group` | toggle-group also does multi |
| On/off immediate | `switch` | Not for form-submitted booleans — use checkbox |

## DateField / TimeField — never native date/time inputs

Native `type="date"` / `type="time"` render browser chrome (`mm/dd/yyyy`, AM/PM) that follows the browser's locale, not ours. Use the kit controls:

```vue
<DateField v-model="from" placeholder="من تاريخ" :max="to || undefined" clearable />
<TimeField v-model="at" clearable />
```

- `DateField` model is the API's `YYYY-MM-DD` string (`""` = none); `min`/`max` are the same strings, so a from/to pair bounds each other and "not in the future" is `:max` of today. A pick closes the popover. It already carries the Libya calendar config below. Props: `id` (for a `Label`), `invalid`, `size`, `clearable` (filters only), `tinted` (set value gets the filter-bar tint).
- `TimeField` model is `HH:MM` (24-hour). Hours are a tap grid named by part of the day; minutes come in `minuteStep`s (default 5); an exact time is typed in the box (`1837`, `18:37`, Arabic digits accepted via `cleanTyped`).
- In tests, drive a DateField by emitting `update:modelValue` on it (`src/__tests__/date-field.ts` helper: `setDate`).

## SearchableSelect / MultiSelect

```vue
<SearchableSelect v-model="region" :options="[{ value: 'tripoli', label: 'طرابلس' }]"
  placeholder="اختر…" none-label="الكل" aria-label="المنطقة" />
<MultiSelect v-model="regions" :options="options" placeholder="الكل" count-label="{count} مناطق" aria-label="المناطق" />
```

Options are `{ value, label }`; the model is the `value` string (`""` = none; `string[]` for MultiSelect). Search is Arabic-normalized (`normalizeArabic`), lists of 40+ rows virtualize, `loading` shows a spinner only while there is nothing cached to show, and `remote` hands each typed term to the parent through `search` (options are then shown unfiltered; `notice` surfaces a failed fetch at the top of the list). Only drop to the raw combobox below for layouts these cannot express.

## LookupChipBoard

A vocabulary that is one field (types, categories) as editable chips. The board owns the chip UX; the host owns persistence — `create(name, done)` / `rename(item, name, done)` call `done(ok)` when the server answered (spinner until then, editor stays open on `false`), and `remove(item)` fires on ✕ so the host can confirm with `AlertDialog`.

## Dates: the Libya configuration (non-negotiable)

```vue
<Calendar v-model="date" locale="ar-LY-u-nu-latn" :week-starts-on="6" />
```

- `ar-LY-u-nu-latn` — Arabic-Libya locale with **explicit Latin digits** (stable across ICU versions).
- `:week-starts-on="6"` — the week starts **Saturday**.
- Values are `@internationalized/date` `CalendarDate` objects (`new CalendarDate(2026, 7, 12)`), not JS `Date`.
- Nav arrows already mirror in RTL. Keep all of this when copying the demos; the same applies to `range-calendar`.

## Arabic-tolerant search (raw combobox and anywhere you filter Arabic text)

SearchableSelect/MultiSelect already do this. For a hand-built combobox, reka's built-in filter is plain substring — it can't equate أ/إ/آ/ا or ة/ه. The kit pattern (ComponentsPage combobox section):

```ts
import { normalizeArabic } from "@/lib/utils";
const filtered = computed(() => {
  const needle = normalizeArabic(search.value);
  if (!needle) return options;
  return options.filter((o) => normalizeArabic(o.label).includes(needle));
});
```

with `ignore-filter` set on `<Combobox>` so your computed list is the single source of truth. Typing `اسواق` must match `أسواق`.

## PIN / OTP

Never build with raw `pin-input` — use `PinConfirm` ([money-and-status.md](money-and-status.md)). The only sanctioned raw usage is inside `PinConfirm.vue` itself and the Login OTP step (which uses PinConfirm's inline variant anyway).
