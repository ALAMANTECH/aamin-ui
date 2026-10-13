<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { formatMoney } from "@/lib/money";
import { i18n } from "@/lib/i18n";

const props = withDefaults(
  defineProps<{
    data: number[];
    /** Any CSS color; defaults to the chart-1 token. */
    color?: string;
    width?: number;
    height?: number;
    /** Dot on the last point — marks which end of the line is "now". */
    endDot?: boolean;
    /**
     * Per-point display labels ("14 أغسطس" / "يوليو"), same order as `data`.
     * Providing them turns hover on: a chip names the pointed-at day/month
     * with its value. Without labels the sparkline stays purely decorative.
     */
    labels?: string[];
  }>(),
  {
    color: "var(--chart-1)",
    width: 120,
    height: 36,
    endDot: false,
    labels: undefined,
  },
);

const t = i18n.global.t;
const id = useId();

const coords = computed(() => {
  const { data, width, height } = props;
  if (data.length < 2) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 3;
  return data.map((value, index) => ({
    x: (index / (data.length - 1)) * (width - pad * 2) + pad,
    y: height - pad - ((value - min) / span) * (height - pad * 2),
  }));
});

const points = computed(() =>
  coords.value.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "),
);

const lastPoint = computed(() => coords.value.at(-1));

const areaPoints = computed(() => {
  if (!points.value) return "";
  const { width, height } = props;
  return `3,${height} ${points.value} ${width - 3},${height}`;
});

// ── Hover point chip (only when labels are provided) ─────────────────
const interactive = computed(() => Boolean(props.labels?.length && coords.value.length));
const hoverIndex = ref<number | null>(null);

function onPointerMove(event: PointerEvent) {
  if (!interactive.value) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  if (!rect.width) return;
  const fraction = (event.clientX - rect.left) / rect.width;
  const index = Math.round(fraction * (coords.value.length - 1));
  hoverIndex.value = Math.min(coords.value.length - 1, Math.max(0, index));
}

function onPointerLeave() {
  hoverIndex.value = null;
}

const hovered = computed(() => {
  if (hoverIndex.value == null) return null;
  const point = coords.value[hoverIndex.value];
  if (!point) return null;
  return {
    ...point,
    label: props.labels?.[hoverIndex.value] ?? "",
    value: formatMoney(props.data[hoverIndex.value] ?? 0),
    /** % across the drawn width — positions the HTML chip over the point. */
    pct: (point.x / props.width) * 100,
  };
});

/** Keeps the chip inside the card near either edge instead of centering off it. */
const chipShift = computed(() => {
  if (!hovered.value) return "translateX(-50%)";
  if (hovered.value.pct <= 18) return "translateX(0)";
  if (hovered.value.pct >= 82) return "translateX(-100%)";
  return "translateX(-50%)";
});
</script>

<template>
  <!-- Charts flow LTR (like every chart in the kit), so the hover surface is
       an LTR box: pointer math and the chip's `left` share one coordinate space. -->
  <span
    v-if="points && interactive"
    dir="ltr"
    data-spark-hover
    class="relative block"
    @pointermove="onPointerMove"
    @pointerdown="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      :width="width"
      :height="height"
      class="block h-auto w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient :id="`spark-${id}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.25" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <polygon :points="areaPoints" :fill="`url(#spark-${id})`" />
      <polyline
        :points="points"
        fill="none"
        :stroke="color"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- Crosshair through the pointed-at day/month, like the big charts. -->
      <g v-if="hovered">
        <line
          :x1="hovered.x"
          :x2="hovered.x"
          y1="0"
          :y2="height"
          stroke="var(--muted-foreground)"
          stroke-width="1"
          stroke-dasharray="2 3"
          opacity="0.6"
        />
        <circle
          :cx="hovered.x"
          :cy="hovered.y"
          r="2.75"
          :fill="color"
          stroke="var(--card)"
          stroke-width="1.5"
        />
      </g>
      <!-- The newest point, haloed — time always flows toward this dot. -->
      <g v-if="endDot && lastPoint">
        <circle :cx="lastPoint.x" :cy="lastPoint.y" r="4.5" :fill="color" opacity="0.25" />
        <circle :cx="lastPoint.x" :cy="lastPoint.y" r="2.25" :fill="color" />
      </g>
    </svg>
    <span
      v-if="hovered"
      class="pointer-events-none absolute bottom-full z-10 mb-1 flex items-baseline gap-1 rounded-md border border-border bg-popover px-1.5 py-0.5 text-[10px] leading-none whitespace-nowrap text-popover-foreground shadow-sm"
      :style="{ left: `${hovered.pct}%`, transform: chipShift }"
    >
      <bdi>{{ hovered.label }}</bdi>
      <span class="num font-medium">{{ hovered.value }}</span>
    </span>
  </span>

  <svg
    v-else-if="points"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    class="overflow-visible"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="`spark-${id}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.25" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polygon :points="areaPoints" :fill="`url(#spark-${id})`" />
    <polyline
      :points="points"
      fill="none"
      :stroke="color"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- The newest point, haloed — time always flows toward this dot. -->
    <g v-if="endDot && lastPoint">
      <circle :cx="lastPoint.x" :cy="lastPoint.y" r="4.5" :fill="color" opacity="0.25" />
      <circle :cx="lastPoint.x" :cy="lastPoint.y" r="2.25" :fill="color" />
    </g>
  </svg>

  <!-- Fewer than 2 points: a flat dash reads as "no trend yet" instead of
       silently rendering nothing. -->
  <span v-else class="inline-flex items-center">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      :width="width"
      :height="height"
      class="overflow-visible"
      aria-hidden="true"
    >
      <line
        x1="3"
        :y1="height / 2"
        :x2="width - 3"
        :y2="height / 2"
        stroke="var(--muted-foreground)"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-dasharray="3 4"
        opacity="0.5"
      />
    </svg>
    <span class="sr-only">{{ t("common.noData") }}</span>
  </span>
</template>
