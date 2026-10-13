<script setup lang="ts">
import type { Component } from "vue";
import { ArrowRightIcon } from "@/lib/icons";

export interface TimelineItem {
  text: string;
  time: string;
  icon?: Component;
  tone?: "default" | "primary";
  /** Renders as `from` (struck through) → `to` (foreground) below `text`. */
  diff?: { field: string; from: string; to: string };
}

const props = defineProps<{
  items: TimelineItem[];
}>();

function resolveTone(item: TimelineItem, index: number): "default" | "primary" {
  return item.tone ?? (index === 0 ? "primary" : "default");
}

const markerClasses = {
  primary: "bg-primary/10 text-primary ring-primary/15",
  default: "bg-muted text-muted-foreground ring-border/70",
} as const;

function markerClass(item: TimelineItem, index: number): string {
  return markerClasses[resolveTone(item, index)];
}
</script>

<template>
  <ol>
    <li
      v-for="(item, index) in props.items"
      :key="index"
      class="group relative flex gap-3 pb-5 last:pb-0"
    >
      <!-- Connector: marker bottom → row end (bridges pb-5 into the next marker) -->
      <span
        class="absolute start-[13.5px] top-7 bottom-0 w-px bg-border group-last:hidden"
        aria-hidden="true"
      />
      <span
        class="grid size-7 shrink-0 place-items-center rounded-full ring-4"
        :class="markerClass(item, index)"
        aria-hidden="true"
      >
        <component :is="item.icon" v-if="item.icon" class="size-3.5" />
        <span v-else class="size-2 rounded-full bg-current" />
      </span>

      <div class="min-w-0 flex-1 pt-0.5">
        <slot name="item" :item="item" :index="index">
          <p class="text-sm leading-6">{{ item.text }}</p>
          <p
            v-if="item.diff"
            class="mt-1.5 flex w-fit flex-wrap items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-xs"
          >
            <span class="font-medium text-muted-foreground">{{ item.diff.field }}:</span>
            <span class="text-muted-foreground line-through">{{ item.diff.from }}</span>
            <ArrowRightIcon
              class="size-3 shrink-0 text-muted-foreground cn-rtl-flip"
              aria-hidden="true"
            />
            <span class="font-medium text-foreground">{{ item.diff.to }}</span>
          </p>
          <p class="mt-1 w-fit text-[11px] text-muted-foreground">
            <span class="num">{{ item.time }}</span>
          </p>
        </slot>
      </div>
    </li>
  </ol>
</template>
