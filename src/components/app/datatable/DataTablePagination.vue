<script setup lang="ts" generic="T">
import { computed } from "vue";
import type { Table } from "@tanstack/vue-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { i18n } from "@/lib/i18n";
import PageReadout from "./PageReadout.vue";
import { PAGE_SIZES } from "./page-jump";

const props = withDefaults(
  defineProps<{
    table: Table<T>;
    pageSizes?: number[];
  }>(),
  { pageSizes: () => [...PAGE_SIZES] },
);

const t = i18n.global.t;

// getRowCount() is the mode-correct total: `rowCount` (meta.total) in server
// mode, the pre-pagination row count in client mode. getFilteredRowModel()
// would count only the current page's rows under manual pagination.
const total = computed(() => props.table.getRowCount());
const pageIndex = computed(() => props.table.getState().pagination.pageIndex);
const pageSize = computed(() => props.table.getState().pagination.pageSize);
const start = computed(() => (total.value === 0 ? 0 : pageIndex.value * pageSize.value + 1));
const end = computed(() => Math.min((pageIndex.value + 1) * pageSize.value, total.value));
const pageCount = computed(() => Math.max(1, props.table.getPageCount()));
</script>

<template>
  <div
    data-slot="table-pagination-mobile"
    class="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-t bg-muted/30 px-2 py-2 sm:hidden"
  >
    <div class="flex items-center">
      <Button
        variant="ghost"
        size="icon-lg"
        class="size-10"
        :disabled="!table.getCanPreviousPage()"
        :aria-label="t('datatable.firstPage')"
        @click="table.firstPage()"
      >
        <ChevronsLeftIcon class="size-5 cn-rtl-flip" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        class="size-10"
        :disabled="!table.getCanPreviousPage()"
        :aria-label="t('datatable.prevPage')"
        @click="table.previousPage()"
      >
        <ChevronLeftIcon class="size-5 cn-rtl-flip" />
      </Button>
    </div>
    <div class="min-w-0 text-center">
      <p class="text-xs text-muted-foreground">
        {{ t("datatable.rangeShowing") }}
        <span class="num">{{ start }}</span
        >–<span class="num">{{ end }}</span>
        {{ t("datatable.rangeOf") }}
        <span class="num">{{ total }}</span>
      </p>
      <PageReadout
        :page-index="pageIndex"
        :page-count="pageCount"
        size="lg"
        @update:page-index="table.setPageIndex($event)"
      />
    </div>
    <div class="flex items-center">
      <Button
        variant="ghost"
        size="icon-lg"
        class="size-10"
        :disabled="!table.getCanNextPage()"
        :aria-label="t('datatable.nextPage')"
        @click="table.nextPage()"
      >
        <ChevronRightIcon class="size-5 cn-rtl-flip" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        class="size-10"
        :disabled="!table.getCanNextPage()"
        :aria-label="t('datatable.lastPage')"
        @click="table.lastPage()"
      >
        <ChevronsRightIcon class="size-5 cn-rtl-flip" />
      </Button>
    </div>
  </div>

  <div
    data-slot="table-pagination-desktop"
    class="hidden items-center justify-between gap-3 border-t px-4 py-3 sm:flex"
  >
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">{{ t("datatable.rowsPerPage") }}</span>
      <Select
        :model-value="String(pageSize)"
        @update:model-value="(value) => table.setPageSize(Number(value))"
      >
        <SelectTrigger class="h-8 w-[72px]" :aria-label="t('datatable.rowsPerPageAria')">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)" class="num">
            {{ size }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <p class="text-xs text-muted-foreground">
      {{ t("datatable.rangeShowing") }}
      <span class="num">{{ start }}</span
      >–<span class="num">{{ end }}</span>
      {{ t("datatable.rangeOf") }}
      <span class="num">{{ total }}</span>
    </p>

    <div class="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="!table.getCanPreviousPage()"
        :aria-label="t('datatable.firstPage')"
        @click="table.firstPage()"
      >
        <ChevronsLeftIcon class="size-4 cn-rtl-flip" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="!table.getCanPreviousPage()"
        :aria-label="t('datatable.prevPage')"
        @click="table.previousPage()"
      >
        <ChevronLeftIcon class="size-4 cn-rtl-flip" />
      </Button>
      <PageReadout
        :page-index="pageIndex"
        :page-count="pageCount"
        class="px-1"
        @update:page-index="table.setPageIndex($event)"
      />
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="!table.getCanNextPage()"
        :aria-label="t('datatable.nextPage')"
        @click="table.nextPage()"
      >
        <ChevronRightIcon class="size-4 cn-rtl-flip" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        :disabled="!table.getCanNextPage()"
        :aria-label="t('datatable.lastPage')"
        @click="table.lastPage()"
      >
        <ChevronsRightIcon class="size-4 cn-rtl-flip" />
      </Button>
    </div>
  </div>
</template>
