<script setup lang="ts" generic="T">
import { computed } from "vue";
import type { Table } from "@tanstack/vue-table";
import { SlidersHorizontalIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { i18n } from "@/lib/i18n";

const props = defineProps<{ table: Table<T> }>();

const t = i18n.global.t;

const hideableColumns = computed(() =>
  props.table.getAllColumns().filter((column) => column.getCanHide()),
);
// Hiding a column is now permanent (DataTable persists it under `storageKey`),
// so the count on the trigger is what stops a column from going missing for
// good: without it, a table that quietly dropped a column looks identical to a
// table that never had one.
const hiddenCount = computed(
  () => hideableColumns.value.filter((column) => !column.getIsVisible()).length,
);

/** Clears the whole stored map rather than re-showing column by column, so no
 *  stale ids from renamed columns survive in localStorage. */
function showAll() {
  props.table.resetColumnVisibility();
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        class="shrink-0"
        :aria-label="
          hiddenCount
            ? t('datatable.columnsHiddenAria', { count: hiddenCount })
            : t('datatable.columns')
        "
      >
        <SlidersHorizontalIcon class="size-4" />
        <span class="max-sm:hidden">{{ t("datatable.columns") }}</span>
        <span
          v-if="hiddenCount"
          class="num rounded-full bg-primary/15 px-1.5 py-px text-[11px] font-medium text-primary"
          aria-hidden="true"
        >
          {{ hiddenCount }}
        </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-44">
      <DropdownMenuLabel>{{ t("datatable.showColumns") }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        v-for="column in hideableColumns"
        :key="column.id"
        :model-value="column.getIsVisible()"
        @update:model-value="(value) => column.toggleVisibility(!!value)"
        @select="(event) => event.preventDefault()"
      >
        {{ column.columnDef.meta?.label ?? column.id }}
      </DropdownMenuCheckboxItem>
      <template v-if="hiddenCount">
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="showAll">
          {{ t("datatable.showAllColumns") }}
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
