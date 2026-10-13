<script lang="ts">
/**
 * Tint cycle for letter marks — theme tokens only, so a rebrand re-tints
 * every mark from the token file.
 */
export const BRAND_MARK_TONES = [
  "bg-primary/15 text-primary",
  "bg-chart-2/15 text-chart-2",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
  "bg-destructive/15 text-destructive",
] as const;

/** Stable tint for a seed: numbers index the cycle, strings hash into it. */
export function toneFor(seed: string | number): string {
  let n: number;
  if (typeof seed === "number") {
    n = Math.abs(Math.trunc(seed));
  } else {
    n = 0;
    for (const ch of seed) n = (n * 31 + ch.codePointAt(0)!) >>> 0;
  }
  return BRAND_MARK_TONES[n % BRAND_MARK_TONES.length]!;
}

/** First character of the trimmed name, "?" for a blank one. */
export function letterFor(name: string): string {
  const s = name.trim();
  return s ? [...s][0]! : "?";
}
</script>

<script setup lang="ts">
import { computed, ref, watch, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

/**
 * Logo tile for a brand / provider / merchant. The image fills the mark edge
 * to edge (app-icon style, no plate behind it); a missing or failed image
 * falls back to the name's first letter on a tint picked from `seed`, so the
 * same entity always gets the same colour.
 */
const props = withDefaults(
  defineProps<{
    /** Display name — first character used when there is no image. */
    name: string;
    /** Logo / icon URL; empty or failed loads fall back to a letter mark. */
    src?: string | null;
    /** Stable id for tint cycling (number or string). */
    seed?: string | number;
    size?: "sm" | "md" | "lg";
    class?: HTMLAttributes["class"];
  }>(),
  { src: null, seed: 0, size: "md", class: undefined },
);

const broken = ref(false);

watch(
  () => props.src,
  () => {
    broken.value = false;
  },
);

const url = computed(() => {
  const s = typeof props.src === "string" ? props.src.trim() : "";
  return s || null;
});

const showImage = computed(() => Boolean(url.value) && !broken.value);

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "size-10 rounded-lg text-sm";
    case "lg":
      return "size-14 rounded-xl text-lg";
    default:
      return "size-12 rounded-lg text-base";
  }
});
</script>

<template>
  <span
    data-slot="brand-mark"
    :class="
      cn(
        'grid shrink-0 place-items-center overflow-hidden border border-border font-bold',
        sizeClass,
        showImage ? '' : toneFor(seed),
        props.class,
      )
    "
  >
    <img
      v-if="showImage"
      :src="url!"
      alt=""
      class="size-full object-cover"
      @error="broken = true"
    />
    <span v-else aria-hidden="true">{{ letterFor(name) }}</span>
  </span>
</template>
