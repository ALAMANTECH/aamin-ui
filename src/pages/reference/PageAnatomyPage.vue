<script lang="ts">
/**
 * THE page standard, measured — not invented. Every row was measured from the
 * production Aamin dashboard. `px` is the computed value at the three reference widths
 * (phone 375 · tablet 768 · desktop 1280); `null` = the element does not
 * exist at that width. docs/pages.md carries the same table (test-enforced).
 */
export interface AnatomyRow {
  /** i18n key suffix: `anatomy.rows.<key>`. */
  key: string;
  classes: string;
  px: [number | null, number | null, number | null];
  /** Grid columns at the three widths. */
  cols?: [number, number, number];
}

export const REFERENCE_WIDTHS = [375, 768, 1280] as const;

export const ANATOMY: { type: AnatomyRow[]; spacing: AnatomyRow[] } = {
  type: [
    {
      key: "pageTitle",
      classes: "text-xl font-semibold tracking-tight sm:text-2xl",
      px: [20, 24, 24],
    },
    {
      key: "pageDescription",
      classes: "mt-1 text-sm text-muted-foreground",
      px: [14, 14, 14],
    },
    {
      key: "breadcrumb",
      classes: "gap-1.5 text-sm text-muted-foreground",
      px: [14, 14, 14],
    },
    {
      key: "sectionHeading",
      classes: "flex items-center gap-2 text-sm font-semibold",
      px: [14, 14, 14],
    },
    {
      key: "sectionIcon",
      classes: "size-4 text-primary",
      px: [16, 16, 16],
    },
    {
      key: "cardTitle",
      classes: "text-base leading-snug font-medium",
      px: [16, 16, 16],
    },
    {
      key: "sectionCardTitle",
      classes: 'CardTitle class="text-sm"',
      px: [14, 14, 14],
    },
    {
      key: "body",
      classes: "text-sm",
      px: [14, 14, 14],
    },
    {
      key: "statLabel",
      classes: "text-[13px] font-medium text-muted-foreground",
      px: [13, 13, 13],
    },
    {
      key: "statFigure",
      classes: "num text-2xl → text-xl → text-lg",
      px: [24, 24, 24],
    },
    {
      key: "meta",
      classes: "gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground",
      px: [12, 12, 12],
    },
    {
      key: "hint",
      classes: "text-[11px] leading-snug text-muted-foreground",
      px: [11, 11, 11],
    },
    {
      key: "phoneCardTitle",
      classes: "text-[15px] font-semibold leading-tight",
      px: [15, null, null],
    },
  ],
  spacing: [
    {
      key: "gutterInline",
      classes: "px-3 sm:px-4 md:px-8",
      px: [12, 32, 32],
    },
    {
      key: "gutterBlock",
      classes: "py-4 sm:py-6 md:py-8",
      px: [16, 32, 32],
    },
    {
      key: "contentMax",
      classes: "mx-auto max-w-7xl",
      px: [1280, 1280, 1280],
    },
    {
      key: "topbar",
      classes: "h-[calc(4rem+env(safe-area-inset-top))]",
      px: [64, 64, 64],
    },
    {
      key: "pageStack",
      classes: "space-y-6",
      px: [24, 24, 24],
    },
    {
      key: "overviewStack",
      classes: "space-y-8",
      px: [32, 32, 32],
    },
    {
      key: "sectionStack",
      classes: "space-y-3",
      px: [12, 12, 12],
    },
    {
      key: "headerStack",
      classes: "space-y-2",
      px: [8, 8, 8],
    },
    {
      key: "headerRow",
      classes: "gap-3 sm:gap-4",
      px: [12, 16, 16],
    },
    {
      key: "headerMeta",
      classes: "mt-2 space-y-1.5",
      px: [8, 8, 8],
    },
    {
      key: "headerActions",
      classes: "flex shrink-0 flex-wrap items-center gap-2 sm:justify-end",
      px: [8, 8, 8],
    },
    {
      key: "toolbarToTable",
      classes: "space-y-3",
      px: [12, 12, 12],
    },
    {
      key: "toolbar",
      classes: "gap-2 max-md:-mx-3 max-md:border-y max-md:bg-muted/30 max-md:px-3 max-md:py-2.5",
      px: [8, 8, 8],
    },
    {
      key: "detailStack",
      classes: "space-y-4",
      px: [16, 16, 16],
    },
    {
      key: "statGrid",
      classes: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
      px: [12, 12, 12],
      cols: [1, 2, 4],
    },
    {
      key: "kpiGrid",
      classes: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
      px: [16, 16, 16],
      cols: [1, 2, 4],
    },
    {
      key: "splitGrid",
      classes: "grid gap-4 lg:grid-cols-[2fr_1fr]",
      px: [16, 16, 16],
      cols: [1, 1, 2],
    },
    {
      key: "sectionGrid",
      classes: "grid gap-3 lg:grid-cols-3",
      px: [12, 12, 12],
      cols: [1, 1, 3],
    },
    {
      key: "statCardPad",
      classes: "p-5",
      px: [20, 20, 20],
    },
    {
      key: "cardBlock",
      classes: "gap-4 rounded-xl py-4",
      px: [16, 16, 16],
    },
    {
      key: "cardInline",
      classes: "px-4",
      px: [16, 16, 16],
    },
    {
      key: "factRow",
      classes: "flex items-baseline justify-between gap-4 py-2 text-sm",
      px: [8, 8, 8],
    },
    {
      key: "tabPanel",
      classes: 'TabsContent class="pt-4"',
      px: [16, 16, 16],
    },
    {
      key: "emptyBare",
      classes: "py-12",
      px: [48, 48, 48],
    },
    {
      key: "control",
      classes: "h-8",
      px: [32, 32, 32],
    },
    {
      key: "listSkeleton",
      classes: "h-9 w-full sm:w-64",
      px: [36, 36, 36],
    },
    {
      key: "statSkeleton",
      classes: "h-28 w-full",
      px: [112, 112, 112],
    },
  ],
};
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useWindowSize } from "@vueuse/core";
import { MonitorIcon, RulerIcon, SmartphoneIcon, TypeIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import PageHeader from "@/components/app/PageHeader.vue";
import { useDir } from "@/composables/useDir";
import ListPageTemplate from "./templates/ListPageTemplate.vue";
import DetailPageTemplate from "./templates/DetailPageTemplate.vue";

const { t } = useI18n();
const { dir } = useDir();

/* ---- Controls ---- */
type TemplateKey = "list" | "detail";
type PreviewState = "ready" | "loading" | "refreshing" | "error" | "empty";
const template = ref<TemplateKey>("list");
const previewState = ref<PreviewState>("ready");
const showMarks = ref(false);
const STATES: PreviewState[] = ["ready", "loading", "refreshing", "error", "empty"];
const TEMPLATES = { list: ListPageTemplate, detail: DetailPageTemplate };

function onTemplate(value: unknown) {
  if (value === "list" || value === "detail") template.value = value;
}

/* ---- Which reference column the current window is closest to ---- */
const { width } = useWindowSize();
const activeColumn = computed(() => (width.value >= 1280 ? 2 : width.value >= 768 ? 1 : 0));
const COLUMN_ICONS = [SmartphoneIcon, RulerIcon, MonitorIcon];
const columnNames = computed(() => [
  t("anatomy.columns.phone"),
  t("anatomy.columns.tablet"),
  t("anatomy.columns.desktop"),
]);

/* ---- Measurement overlay ---------------------------------------------------
 * Reads the rendered template (computed styles + rects) and draws labeled
 * outlines over it. Boxes are positioned with `inset-inline-start`, so they
 * sit right in both directions; every measured digit run is in `.num`. */
type MarkKind = "box" | "band" | "gap" | "pad" | "gutter";
interface Mark {
  id: string;
  kind: MarkKind;
  label: string;
  start: number;
  top: number;
  width: number;
  height: number;
  /** pad marks: border widths that paint the element's padding. */
  padTop?: number;
  padBottom?: number;
  padInline?: number;
}

const SPECS: { sel: string; kind: "stack" | "box" | "type" | "gap" | "pad"; token: string }[] = [
  { sel: '[data-anatomy="page"]', kind: "stack", token: "space-y-6" },
  { sel: '[data-anatomy="header"]', kind: "box", token: "PageHeader" },
  { sel: '[data-anatomy="header"] h1', kind: "type", token: "text-xl sm:text-2xl" },
  { sel: '[data-anatomy="table"] > div', kind: "stack", token: "space-y-3" },
  { sel: '[data-anatomy="table"] > div > div:first-child', kind: "gap", token: "gap-2" },
  { sel: '[data-anatomy="body"]', kind: "stack", token: "space-y-4" },
  { sel: '[data-anatomy="stat-grid"]', kind: "gap", token: "gap-3" },
  { sel: '[data-anatomy="stat-grid"] > :first-child', kind: "pad", token: "p-5" },
  { sel: '[data-anatomy="tab-panel"]', kind: "pad", token: "pt-4" },
  { sel: '[data-anatomy="section-grid"]', kind: "gap", token: "gap-3" },
  { sel: '[data-anatomy="section-card"]', kind: "pad", token: "py-4 · px-4" },
];

const frame = useTemplateRef<HTMLElement>("frame");
const content = useTemplateRef<HTMLElement>("content");
const marks = ref<Mark[]>([]);

const px = (value: string) => Math.round(Number.parseFloat(value) || 0);

function measure() {
  const root = frame.value;
  const page = content.value;
  if (!root || !page) return;
  const base = root.getBoundingClientRect();
  const rtl = dir.value === "rtl";
  const place = (r: DOMRect) => ({
    start: Math.round(rtl ? base.right - r.right : r.left - base.left),
    top: Math.round(r.top - base.top),
    width: Math.round(r.width),
    height: Math.round(r.height),
  });
  const out: Mark[] = [];

  // Page gutters: the frame's own padding replicates DashboardLayout's <main>.
  const pageStyle = getComputedStyle(page);
  const pageRect = place(page.getBoundingClientRect());
  out.push({
    id: "gutter-inline",
    kind: "gutter",
    label: `px-3 sm:px-4 md:px-8 · ${px(pageStyle.paddingInlineStart)}px`,
    ...pageRect,
    width: px(pageStyle.paddingInlineStart),
  });
  out.push({
    id: "gutter-block",
    kind: "gutter",
    label: `py-4 sm:py-6 md:py-8 · ${px(pageStyle.paddingTop)}px`,
    ...pageRect,
    start: pageRect.start + px(pageStyle.paddingInlineStart),
    width: pageRect.width - 2 * px(pageStyle.paddingInlineStart),
    height: px(pageStyle.paddingTop),
  });

  for (const spec of SPECS) {
    const el = page.querySelector<HTMLElement>(spec.sel);
    if (!el) continue;
    const style = getComputedStyle(el);
    const rect = place(el.getBoundingClientRect());
    const id = `${spec.kind}:${spec.sel}`;
    if (spec.kind === "stack") {
      const children = [...el.children].filter(
        (child) => getComputedStyle(child).display !== "none",
      );
      children.slice(1).forEach((child, i) => {
        const prev = children[i]!.getBoundingClientRect();
        const next = child.getBoundingClientRect();
        const gap = Math.round(next.top - prev.bottom);
        out.push({
          id: `${id}#${i}`,
          kind: "band",
          label: `${spec.token} · ${gap}px`,
          ...rect,
          top: Math.round(prev.bottom - base.top),
          height: Math.max(gap, 0),
        });
      });
    } else if (spec.kind === "type") {
      out.push({ id, kind: "box", label: `${spec.token} · ${px(style.fontSize)}px`, ...rect });
    } else if (spec.kind === "gap") {
      const gap = px(style.columnGap) || px(style.rowGap);
      out.push({ id, kind: "gap", label: `${spec.token} · ${gap}px`, ...rect });
    } else if (spec.kind === "pad") {
      const first = el.firstElementChild as HTMLElement | null;
      const padInline =
        px(style.paddingInlineStart) ||
        (first ? px(getComputedStyle(first).paddingInlineStart) : 0);
      const padTop = px(style.paddingTop);
      out.push({
        id,
        kind: "pad",
        label: `${spec.token} · ${padTop}px`,
        ...rect,
        padTop,
        padBottom: px(style.paddingBottom),
        padInline,
      });
    } else {
      out.push({ id, kind: "box", label: spec.token, ...rect });
    }
  }
  marks.value = out;
}

// One measurement per frame, however many mutations/resizes arrive.
let raf = 0;
function schedule() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    measure();
  });
}

let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;
function stopObserving() {
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
  resizeObserver = mutationObserver = undefined;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

watch(
  [showMarks, content],
  async ([on, el]) => {
    stopObserving();
    if (!on || !el) return;
    await nextTick();
    measure();
    resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(el);
    // The overlay is a sibling of `content`, so its own updates never re-trigger this.
    mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "data-state"],
    });
  },
  { immediate: true },
);
watch([dir, template, previewState], () => {
  if (showMarks.value) void nextTick(measure);
});
onBeforeUnmount(stopObserving);

const MARK_CLASS: Record<MarkKind, string> = {
  box: "outline-1 outline-dashed outline-primary",
  band: "bg-primary/15",
  gap: "outline-1 outline-dashed outline-warning",
  pad: "border-warning/30 outline-1 outline-dashed outline-warning/70",
  gutter: "bg-success/15",
};
const LABEL_CLASS: Record<MarkKind, string> = {
  box: "bg-primary text-primary-foreground",
  band: "bg-primary text-primary-foreground",
  gap: "bg-warning text-background",
  pad: "bg-warning text-background",
  gutter: "bg-success text-background",
};

function markStyle(mark: Mark) {
  return {
    insetInlineStart: `${mark.start}px`,
    top: `${mark.top}px`,
    width: `${mark.width}px`,
    height: `${mark.height}px`,
    borderTopWidth: mark.padTop ? `${mark.padTop}px` : undefined,
    borderInlineWidth: mark.padInline ? `${mark.padInline}px` : undefined,
    borderBottomWidth: mark.padBottom ? `${mark.padBottom}px` : undefined,
  };
}

const sections = computed(() => [
  { id: "type", title: t("anatomy.typeScale"), icon: TypeIcon, rows: ANATOMY.type },
  { id: "spacing", title: t("anatomy.spacingScale"), icon: RulerIcon, rows: ANATOMY.spacing },
]);
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      :title="t('nav.reference.pageAnatomy')"
      :description="t('anatomy.description')"
      :breadcrumbs="[{ label: t('nav.home'), to: '/' }, { label: t('nav.reference.pageAnatomy') }]"
    />

    <section class="space-y-3">
      <h2 class="flex items-center gap-2 text-sm font-semibold">
        <RulerIcon class="size-4 text-primary" aria-hidden="true" />
        {{ t("anatomy.preview") }}
      </h2>

      <!-- Controls: which template, which state, and the measurements switch. -->
      <div class="flex flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          :model-value="template"
          :aria-label="t('anatomy.template')"
          @update:model-value="onTemplate"
        >
          <ToggleGroupItem value="list">{{ t("nav.reference.templateList") }}</ToggleGroupItem>
          <ToggleGroupItem value="detail">{{ t("nav.reference.templateDetail") }}</ToggleGroupItem>
        </ToggleGroup>
        <Select v-model="previewState">
          <SelectTrigger class="w-40" :aria-label="t('anatomy.state')">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="state in STATES" :key="state" :value="state">
              {{ t(`anatomy.states.${state}`) }}
            </SelectItem>
          </SelectContent>
        </Select>
        <div class="flex items-center gap-2 ps-1">
          <Switch id="anatomy-marks" v-model="showMarks" data-testid="anatomy-toggle" />
          <Label for="anatomy-marks">{{ t("anatomy.showMarks") }}</Label>
        </div>
        <Badge variant="secondary" class="ms-auto gap-1.5 font-normal">
          <component :is="COLUMN_ICONS[activeColumn]" class="size-3.5" aria-hidden="true" />
          {{ columnNames[activeColumn] }}
          <span class="num">{{ width }}px</span>
        </Badge>
      </div>

      <!-- The frame replicates DashboardLayout's <main> gutters, so the page
           inside reads exactly as it would in the shell. -->
      <div
        ref="frame"
        class="relative overflow-hidden rounded-xl border border-dashed bg-background"
        data-testid="anatomy-frame"
      >
        <div ref="content" class="px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
          <component :is="TEMPLATES[template]" :preview-state="previewState" />
        </div>
        <div
          v-if="showMarks"
          class="pointer-events-none absolute inset-0 z-20 transition-opacity motion-reduce:transition-none"
          aria-hidden="true"
          data-testid="anatomy-overlay"
        >
          <div
            v-for="mark in marks"
            :key="mark.id"
            class="absolute"
            :class="MARK_CLASS[mark.kind]"
            :style="markStyle(mark)"
          >
            <span
              class="absolute start-1 -top-2.5 rounded px-1 text-[10px] leading-4 whitespace-nowrap shadow-sm"
              :class="LABEL_CLASS[mark.kind]"
              data-anatomy-label
            >
              <span class="num">{{ mark.label }}</span>
            </span>
          </div>
        </div>
      </div>
      <p class="text-xs text-muted-foreground">{{ t("anatomy.overlayHint") }}</p>
    </section>

    <!-- Type scale + spacing scale at the three reference widths. -->
    <section v-for="section in sections" :key="section.id" class="space-y-3">
      <h2 class="flex items-center gap-2 text-sm font-semibold">
        <component :is="section.icon" class="size-4 text-primary" aria-hidden="true" />
        {{ section.title }}
      </h2>
      <Card class="gap-0 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t("anatomy.columns.role") }}</TableHead>
              <TableHead>{{ t("anatomy.columns.classes") }}</TableHead>
              <TableHead
                v-for="(w, i) in REFERENCE_WIDTHS"
                :key="w"
                class="text-end"
                :class="i === activeColumn ? 'text-primary' : undefined"
              >
                {{ columnNames[i] }} <span class="num">{{ w }}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in section.rows" :key="row.key">
              <TableCell class="font-medium">{{ t(`anatomy.rows.${row.key}`) }}</TableCell>
              <TableCell>
                <code class="num rounded bg-muted px-1.5 py-0.5 text-xs">{{ row.classes }}</code>
              </TableCell>
              <TableCell
                v-for="(value, i) in row.px"
                :key="i"
                class="text-end"
                :class="i === activeColumn ? 'bg-primary/5 text-primary' : undefined"
              >
                <span v-if="value === null" class="text-muted-foreground">—</span>
                <span v-else class="num">{{ value }}px</span>
                <span v-if="row.cols" class="block text-[11px] text-muted-foreground">
                  <span class="num">{{ row.cols[i] }}</span> {{ t("anatomy.cols") }}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </section>

    <!-- The standard theme + locale switch placement (same in every project). -->
    <section class="space-y-3">
      <h2 class="flex items-center gap-2 text-sm font-semibold">
        <MonitorIcon class="size-4 text-primary" aria-hidden="true" />
        {{ t("anatomy.switches.title") }}
      </h2>
      <div class="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardContent class="space-y-2 text-sm">
            <p class="font-medium">{{ t("anatomy.switches.topbar") }}</p>
            <ol class="flex flex-wrap items-center gap-1.5 text-xs">
              <li
                v-for="(item, i) in ['notifications', 'LocaleToggle', 'ThemeToggle', 'user']"
                :key="item"
                class="flex items-center gap-1.5"
              >
                <span v-if="i" class="text-muted-foreground" aria-hidden="true">·</span>
                <code class="rounded bg-muted px-1.5 py-0.5">{{
                  item === "notifications"
                    ? t("anatomy.switches.notifications")
                    : item === "user"
                      ? t("anatomy.switches.user")
                      : item
                }}</code>
              </li>
            </ol>
            <p class="text-xs text-muted-foreground">{{ t("anatomy.switches.topbarHint") }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="space-y-2 text-sm">
            <p class="font-medium">{{ t("anatomy.switches.blank") }}</p>
            <ol class="flex flex-wrap items-center gap-1.5 text-xs">
              <li><code class="rounded bg-muted px-1.5 py-0.5">LocaleToggle</code></li>
              <li class="text-muted-foreground" aria-hidden="true">·</li>
              <li><code class="rounded bg-muted px-1.5 py-0.5">ThemeToggle</code></li>
            </ol>
            <p class="text-xs text-muted-foreground">{{ t("anatomy.switches.blankHint") }}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>
