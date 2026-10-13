<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { i18n } from "@/lib/i18n";

/**
 * The sticky bar that closes a long intake / batch page: what is ready
 * (`stats` — label + an already formatted value; `#stats` for a figure the
 * host renders itself, e.g. an Amount), `#alert` for a blocking line above
 * them, then cancel and the page's one primary action (it carries the
 * screen's single `glow-primary`). Cancel is a real button emitting `cancel`:
 * `disabled` on an as-child RouterLink does not stop navigation, so a link
 * could silently abort an in-flight request. `disabled` keeps the primary off
 * while nothing on the page can be sent. Pair with `useLeaveGuard(busy)`.
 */
const props = withDefaults(
  defineProps<{
    stats?: { label: string; value: string }[];
    busy: boolean;
    disabled?: boolean;
    submitLabel: string;
    /** Primary label while busy. @default t("submitBar.busy") */
    busyLabel?: string;
    /** @default t("common.cancel") */
    cancelLabel?: string;
    testId?: string;
    submitTestId?: string;
  }>(),
  {
    stats: () => [],
    disabled: false,
    busyLabel: undefined,
    cancelLabel: undefined,
    testId: "sticky-submit-bar",
    submitTestId: "sticky-submit",
  },
);
const emit = defineEmits<{ submit: []; cancel: [] }>();

const t = i18n.global.t;
</script>

<template>
  <div
    class="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border bg-card px-3 py-2.5 shadow-lg sm:bottom-4 sm:gap-3 sm:px-4 sm:py-3"
    :data-testid="testId"
  >
    <slot name="alert" />
    <dl class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:gap-x-6 sm:text-sm">
      <div v-for="stat in props.stats" :key="stat.label" class="flex items-center gap-2">
        <dt class="text-muted-foreground">{{ stat.label }}</dt>
        <dd class="font-semibold">
          <span class="num">{{ stat.value }}</span>
        </dd>
      </div>
      <slot name="stats" />
    </dl>
    <div class="flex gap-2 max-sm:w-full">
      <Button
        type="button"
        variant="outline"
        :disabled="busy"
        data-testid="sticky-cancel"
        @click="emit('cancel')"
      >
        {{ cancelLabel ?? t("common.cancel") }}
      </Button>
      <Button
        type="button"
        class="glow-primary max-sm:flex-1"
        :disabled="busy || disabled"
        :data-testid="submitTestId"
        @click="emit('submit')"
      >
        <Spinner v-if="busy" size="sm" />
        {{ busy ? (busyLabel ?? t("submitBar.busy")) : submitLabel }}
      </Button>
    </div>
  </div>
</template>
