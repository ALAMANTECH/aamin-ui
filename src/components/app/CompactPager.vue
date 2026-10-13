<script setup lang="ts">
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "@/lib/icons";
import type { HTMLAttributes } from "vue";
import { Button } from "@/components/ui/button";
import PageReadout from "@/components/app/datatable/PageReadout.vue";
import { i18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * First / prev / "n / m" (PageReadout) / next / last pager for lists that are not backed by a TanStack
 * table instance — card grids, the ticket queue, day-grouped ledgers — where
 * DataTablePagination cannot be used. Three screens had hand-rolled this and
 * drifted apart; this is the one shape.
 *
 * Owns the divider and vertical rhythm; pass `class` for the horizontal inset
 * that matches the surrounding sheet.
 */
const props = withDefaults(
  defineProps<{
    /** Zero-based, matching TanStack's pagination state. */
    pageIndex: number;
    pageCount: number;
    /** Disables both arrows while a request is in flight. */
    busy?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { busy: false, class: undefined },
);

const emit = defineEmits<{ "update:pageIndex": [value: number] }>();

const t = i18n.global.t;

function go(next: number) {
  if (next < 0 || next > props.pageCount - 1) return;
  emit("update:pageIndex", next);
}
</script>

<template>
  <div :class="cn('flex flex-wrap items-center gap-3 border-t border-border py-3', props.class)">
    <p v-if="$slots.label" class="text-xs text-muted-foreground">
      <slot name="label" />
    </p>

    <div class="ms-auto flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="busy || pageIndex <= 0"
        :aria-label="t('datatable.firstPage')"
        @click="go(0)"
      >
        <ChevronsLeftIcon class="size-4 cn-rtl-flip" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="busy || pageIndex <= 0"
        :aria-label="t('datatable.prevPage')"
        @click="go(pageIndex - 1)"
      >
        <ChevronLeftIcon class="size-4 cn-rtl-flip" />
      </Button>
      <PageReadout
        :page-index="pageIndex"
        :page-count="pageCount"
        :busy="busy"
        class="px-1"
        @update:page-index="go"
      />
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="busy || pageIndex >= pageCount - 1"
        :aria-label="t('datatable.nextPage')"
        @click="go(pageIndex + 1)"
      >
        <ChevronRightIcon class="size-4 cn-rtl-flip" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="busy || pageIndex >= pageCount - 1"
        :aria-label="t('datatable.lastPage')"
        @click="go(pageCount - 1)"
      >
        <ChevronsRightIcon class="size-4 cn-rtl-flip" />
      </Button>
    </div>
  </div>
</template>
