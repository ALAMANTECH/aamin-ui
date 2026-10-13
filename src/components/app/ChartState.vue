<script setup lang="ts">
import { ChartNoAxesCombinedIcon } from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/app/EmptyState.vue";
import { i18n } from "@/lib/i18n";

/**
 * Per-chart async gate: a skeleton while the FIRST load is in flight, an
 * inline error with retry when that chart's request failed (the rest of the
 * page stays up), the "no data in this range" panel when the series is
 * legitimately empty, the chart (default slot) otherwise. Silent refreshes
 * should never pass `loading`, so stale data stays on screen.
 */
withDefaults(
  defineProps<{
    loading: boolean;
    /** The failure message ("" while healthy). */
    error: string;
    empty: boolean;
    /** Overrides the default error / empty titles. */
    errorTitle?: string;
    emptyTitle?: string;
  }>(),
  { errorTitle: undefined, emptyTitle: undefined },
);

const emit = defineEmits<{ retry: [] }>();

const t = i18n.global.t;
</script>

<template>
  <Skeleton v-if="loading" class="h-[220px] w-full rounded-lg" />
  <EmptyState
    v-else-if="error"
    state="error"
    bare
    :title="errorTitle ?? t('chart.error')"
    :error-message="error"
    @retry="emit('retry')"
  />
  <EmptyState
    v-else-if="empty"
    bare
    :icon="ChartNoAxesCombinedIcon"
    :title="emptyTitle ?? t('chart.noData')"
  />
  <slot v-else />
</template>
