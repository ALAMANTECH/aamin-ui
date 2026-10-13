<script setup lang="ts">
import { XIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { i18n } from "@/lib/i18n";

/**
 * What is filtering a list, and the way out: one primary-tinted chip per
 * active value (a press clears that one) and "clear all" after them — so a
 * filtered-empty list is never a mystery. The host builds the chips (it knows
 * its labels) and owns the clearing; the default slot is a leading readout
 * (a result count). Renders nothing when there is nothing to say.
 */
export interface FilterChip {
  id: string;
  text: string;
  /** A digit run (a date, a range) shown after the text, in `.num`. */
  num?: string;
  clear: () => void;
}

defineProps<{ chips: FilterChip[]; clearLabel?: string }>();
const emit = defineEmits<{ "clear-all": [] }>();
</script>

<template>
  <div
    v-if="chips.length || $slots.default"
    class="flex flex-wrap items-center gap-2 text-xs"
    data-testid="filter-chips"
  >
    <slot />
    <button
      v-for="chip in chips"
      :key="chip.id"
      type="button"
      class="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-medium text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :data-testid="`filter-chip-${chip.id}`"
      @click="chip.clear()"
    >
      <span class="truncate">
        {{ chip.text }}
        <span v-if="chip.num" class="num">{{ chip.num }}</span>
      </span>
      <XIcon class="size-3 shrink-0" aria-hidden="true" />
    </button>
    <Button
      v-if="chips.length"
      variant="ghost"
      size="xs"
      class="text-muted-foreground"
      data-testid="filters-reset"
      @click="emit('clear-all')"
    >
      {{ clearLabel ?? i18n.global.t("common.clearFilters") }}
    </Button>
  </div>
</template>
