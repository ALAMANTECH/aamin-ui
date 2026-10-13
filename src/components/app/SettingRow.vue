<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import StatusSwitch from "@/components/app/StatusSwitch.vue";

/**
 * One setting switch explained: a tinted icon tile (the state's tone), what
 * the switch controls, one line on what turning it off does, and the
 * StatusSwitch with its OWN state words. Where a record has more than one
 * switch the rows sit together and the words never repeat — that is what
 * tells them apart.
 *
 * Controlled: it emits the requested value and shows `modelValue` until the
 * host has confirmed (see AsyncConfirmDialog) and stored the change.
 */
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    icon: Component;
    title: string;
    /** What turning it off does, in one line. */
    hint: string;
    onLabel: string;
    offLabel: string;
    /** Tone of the off state: `warning` for a partial stop, `destructive` for a hard block. */
    offTone?: "warning" | "destructive";
    /** Accessible name for the switch ("Selling — Palm Grocery"). */
    switchLabel: string;
    pending?: boolean;
    /** An extra warning-toned line — e.g. why this switch has no effect right now. */
    note?: string;
    /**
     * Greys the tile and the state out while another switch overrides this one.
     * Still operable.
     */
    dimmed?: boolean;
  }>(),
  { offTone: "warning", pending: false, note: undefined, dimmed: false },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const tile = computed(() => {
  if (props.dimmed) return "bg-muted text-muted-foreground";
  if (props.modelValue) return "bg-success/15 text-success";
  return props.offTone === "destructive"
    ? "bg-destructive/10 text-destructive"
    : "bg-warning/15 text-warning";
});
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-card p-4">
    <div
      class="grid size-10 shrink-0 place-items-center rounded-lg transition-colors"
      :class="tile"
    >
      <component :is="icon" class="size-5" aria-hidden="true" />
    </div>
    <div class="min-w-0 flex-1 basis-40 space-y-0.5">
      <p class="text-sm font-medium">{{ title }}</p>
      <p class="text-xs text-muted-foreground">{{ hint }}</p>
      <p v-if="note" class="text-xs text-warning" data-testid="setting-row-note">{{ note }}</p>
    </div>
    <StatusSwitch
      class="ms-auto"
      :class="dimmed ? 'opacity-60 grayscale' : undefined"
      :data-dimmed="dimmed || undefined"
      :model-value="modelValue"
      :pending="pending"
      :label="switchLabel"
      :enabled-label="onLabel"
      :disabled-label="offLabel"
      :disabled-variant="offTone"
      @update:model-value="(v) => emit('update:modelValue', v)"
    />
  </div>
</template>
